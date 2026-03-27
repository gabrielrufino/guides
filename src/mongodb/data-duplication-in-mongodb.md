# ♊ Data Duplication in MongoDB

## Quick Introduction

In MongoDB, data duplication is **normal and expected**. Unlike SQL databases, where you avoid repetition, MongoDB encourages you to store related data together in the same document. Why? Because joining collections is slow and expensive. This guide shows you what that means in practice and how to handle it.


---

## Why Data Duplication Happens

### The Problem with $lookup (Joins)

Every time you use `$lookup` to join collections, MongoDB has to:


1. Find a document in collection A
2. Look up related data in collection B
3. Combine everything back together

This is **slow** and gets slower as your database grows.

**Example - The slow way:**

```javascript
// Query 1: Get an order
db.orders.findOne({ _id: ObjectId("123") })
// Result: { _id: ObjectId("123"), customerId: ObjectId("456"), total: 150 }

// Query 2: Get the customer (separate query needed)
db.customers.findOne({ _id: ObjectId("456") })
// Result: { _id: ObjectId("456"), name: "Alice", email: "alice@example.com" }

// Using aggregation/lookup (still slow)
db.orders.aggregate([
  { $match: { _id: ObjectId("123") } },
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  }
])
```

### The MongoDB Way: Embedding

Instead, MongoDB lets you store the customer info **directly in the order document**:

```javascript
// The fast way - data is already there
db.orders.findOne({ _id: ObjectId("123") })
// Result:
{
  _id: ObjectId("123"),
  total: 150,
  customer: {
    _id: ObjectId("456"),
    name: "Alice",
    email: "alice@example.com"
  }
}
```

**One query. Instant result. Done.**

This is why MongoDB encourages duplication—it's just simpler and faster.


---

## Real-World Example: E-commerce Orders

Let's look at how a real system might work.

### Bad Approach (Over-normalized)

```javascript
// Orders collection
db.orders.insertOne({
  _id: ObjectId("order123"),
  customerId: ObjectId("cust456"),
  productIds: [ObjectId("prod789"), ObjectId("prod790")],
  paymentId: ObjectId("pay111"),
  shippingAddressId: ObjectId("addr222")
})

// Every time you need order details, you need 4+ queries
```

### Good Approach (Practical Denormalization)

```javascript
// Orders collection - everything you need in one place
db.orders.insertOne({
  _id: ObjectId("order123"),
  createdAt: ISODate("2024-02-18"),
  
  // Customer info (duplicated from customers collection)
  customer: {
    _id: ObjectId("cust456"),
    name: "Alice Johnson",
    email: "alice@example.com",
    tier: "gold"
  },
  
  // Items (kept here, not in separate collection)
  items: [
    {
      productId: ObjectId("prod789"),
      name: "Laptop",
      price: 1000,
      quantity: 1,
      sku: "LAPTOP-001"
    },
    {
      productId: ObjectId("prod790"),
      name: "Mouse",
      price: 50,
      quantity: 2,
      sku: "MOUSE-002"
    }
  ],
  
  // Order totals
  subtotal: 1100,
  tax: 220,
  total: 1320,
  
  // Shipping (snapshot of what was valid at order time)
  shipping: {
    address: "123 Main St, City, State",
    method: "express",
    cost: 20,
    estimatedDelivery: ISODate("2024-02-20")
  }
})
```

**Why this is better:**

* One query gets everything
* No need to join anything
* Fast response times
* Application code is simpler


---

## When to Embed vs. When to Reference

### Embed if:

* Data is **small** (< 100 KB per document)
* Data is **frequently accessed together**
* Data **changes rarely** (or you don't mind eventual consistency)
* It's a **one-to-few** relationship (not one-to-many growing indefinitely)

**Examples to embed:**

* User's address in a user profile
* Product details in an order item
* Author info in a blog post
* Recent items in a user's recent history (but limit it)

### Reference if:

* Data is **large** or **grows unboundedly** (like comment histories)
* Data **changes frequently**
* Same data is accessed from **many different places**
* It's a **many-to-many** relationship

**Examples to reference:**

```javascript
// Reference user's full comment history
db.users.insertOne({
  _id: ObjectId("user123"),
  name: "Alice",
  // Don't embed all 5,000 comments
  // Just keep a count
  commentCount: 5000
})

// Store comments in separate collection
db.comments.insertMany([
  { userId: ObjectId("user123"), text: "Great post!" },
  { userId: ObjectId("user123"), text: "Thanks for sharing" }
  // ... thousands more
])
```


---

## The Real Problem: Keeping Duplicated Data Consistent

Duplication creates one big headache: **if data changes, it needs to change everywhere**.

### Example: User Changes Email

If Alice changes her email from `alice@example.com` to `alice.j@example.com`, you need to update it in:

* The users collection ✓
* Every order document with her info ✓
* Every review she wrote ✓
* Every comment she made ✓
* Everywhere else her email is duplicated ✗ (easy to miss)

If you miss one place, you have a bug—some queries return the old email, others return the new one.

### Solution 1: Use Transactions (Simple but Slower)

```javascript
const session = db.getMongo().startSession()

try {
  session.startTransaction()
  
  // Update everywhere atomically
  db.users.updateOne(
    { _id: ObjectId("user123") },
    { $set: { email: "alice.j@example.com" } },
    { session }
  )
  
  db.orders.updateMany(
    { "customer._id": ObjectId("user123") },
    { $set: { "customer.email": "alice.j@example.com" } },
    { session }
  )
  
  db.reviews.updateMany(
    { "author._id": ObjectId("user123") },
    { $set: { "author.email": "alice.j@example.com" } },
    { session }
  )
  
  session.commitTransaction()
} catch (error) {
  session.abortTransaction()
  throw error
}
```

**Pros:** Guarantees everything updates together\n**Cons:** Slower, can timeout on large updates, risky if you forget a collection

### Solution 2: Accept Eventual Consistency (Recommended for Most Cases)

Most applications don't need perfect consistency immediately. Here's a better approach:

```javascript
// 1. Update the source collection
db.users.updateOne(
  { _id: ObjectId("user123") },
  { $set: { email: "alice.j@example.com" } }
)

// 2. Update duplicated data in background (can happen a second later)
db.orders.updateMany(
  { "customer._id": ObjectId("user123") },
  { $set: { "customer.email": "alice.j@example.com" } }
)

db.reviews.updateMany(
  { "author._id": ObjectId("user123") },
  { $set: { "author.email": "alice.j@example.com" } }
)

// 3. If you add a new collection later, you don't need to
//    coordinate with old data - just update going forward
```

**This works because:**

* Email updates don't need to be instant
* Users won't see inconsistency within seconds
* You're not locking collections with transactions
* New duplicated data is correct; old data gradually updates
* If you miss a collection, you just add the update later

### Solution 3: Build an Update Function (Simple and Practical)

```javascript
// Create a function that remembers all places to update
function updateUserEmail(userId, newEmail) {
  const updates = [
    { collection: "users", filter: { _id: userId }, update: { $set: { email: newEmail } } },
    { collection: "orders", filter: { "customer._id": userId }, update: { $set: { "customer.email": newEmail } } },
    { collection: "reviews", filter: { "author._id": userId }, update: { $set: { "author.email": newEmail } } },
    { collection: "comments", filter: { "author._id": userId }, update: { $set: { "author.email": newEmail } } }
  ]
  
  updates.forEach(({ collection, filter, update }) => {
    db[collection].updateMany(filter, update)
  })
}

// Use it everywhere in your code
updateUserEmail(ObjectId("user123"), "alice.j@example.com")
```

**Why this works:**

* All places are updated in one function call
* Easier to remember where to update
* When you add a new collection with duplicated data, you update one place
* Less error-prone than scattered update code


---

## Storage Cost: Does Duplication Matter?

### Do the Math

Let's say you have:

* 1 million users
* 10 million orders
* Each user's embedded info = 500 bytes

**Normalized (references only):**

* Users collection: 500 MB
* Orders collection: 2 GB (just basic order data)
* **Total: 2.5 GB**

**Denormalized (embedded customer info):**

* Users collection: 500 MB
* Orders collection: 5 GB (includes customer info in every order)
* **Total: 5.5 GB**

Storage doubled.

### Should You Care?

**For small apps:** No. 5.5 GB vs 2.5 GB doesn't matter.

**For large apps:** Maybe. Cloud databases charge per GB. Double storage = double cost. But you're also paying less for queries and servers because everything is faster.

**In practice:** The speed gain almost always wins. Fewer queries, simpler code, and faster responses are worth the extra storage. Scale when it matters.


---

## Red Flags: When Duplication Goes Wrong

### Red Flag 1: Unbounded Growing Arrays

```javascript
// DON'T DO THIS
db.users.insertOne({
  _id: ObjectId("user123"),
  name: "Alice",
  allComments: [
    // Adding a new comment every time
    // After 10,000 comments, document is huge
    // Eventually hits 16 MB limit and breaks
  ]
})
```

**Solution:** Use the Subset Pattern instead:

```javascript
// Better approach
db.users.insertOne({
  _id: ObjectId("user123"),
  name: "Alice",
  recentComments: [
    // Only keep last 10-20 comments
    { id: 1, text: "Great!" },
    { id: 2, text: "Thanks" }
  ],
  commentCount: 5000  // Track total without storing all
})

// For full history, query comments collection
db.comments.find({ userId: ObjectId("user123") }).sort({ createdAt: -1 })
```

### Red Flag 2: Stale Data Everywhere

```javascript
// If you embedded customer tier in an order 6 months ago,
// and the customer's tier changed last month,
// the old order still shows the old tier

db.orders.findOne({ _id: ObjectId("order123") })
// Returns: { customer: { tier: "silver" } }
// But in users collection:
db.users.findOne({ _id: ObjectId("cust456") })
// Shows: { tier: "gold" }  // Changed 30 days ago
```

**Solution:** Snapshot data that rarely changes, reference data that changes often:

```javascript
// When creating order, snapshot tier at that moment (okay to be stale)
db.orders.insertOne({
  _id: ObjectId("order123"),
  customer: {
    _id: ObjectId("cust456"),
    name: "Alice",
    tierAtOrderTime: "silver"  // Clear this is a snapshot
  }
})

// But for current tier, always look it up
db.users.findOne({ _id: ObjectId("cust456") })
// Get current tier here
```

### Red Flag 3: Document Size Keeps Growing

MongoDB documents have a 16 MB hard limit. Watch out for:

```javascript
// Every month, you add this year's sales
db.stores.updateOne(
  { _id: ObjectId("store123") },
  { 
    $push: { 
      monthlySales: { 
        month: "February", 
        revenue: 50000 
      } 
    } 
  }
)

// After 20 years, you hit the limit
```

**Solution:** Move old data to a separate collection or cap the array:

```javascript
// Keep only last 24 months
db.stores.updateOne(
  { _id: ObjectId("store123") },
  { 
    $push: { 
      monthlySales: { 
        month: "February", 
        revenue: 50000
      }
    },
    $slice: ["$monthlySales", -24]  // Keep only last 24 items
  }
)
```


---

## Practical Decision Guide

**When designing a new collection, ask yourself:**


1. **How often is this data accessed?**
   * Together with related data? → Embed it
   * Separately? → Reference it
2. **How often does this data change?**
   * Rarely? → Safe to embed
   * Often? → Risky to embed
3. **How much data is it?**
   * Small (< 100 KB)? → Okay to embed
   * Large? → Reference it
4. **Does it grow over time?**
   * Fixed size? → Embed it
   * Grows unbounded? → Reference it
5. **How many documents contain it?**
   * Few places? → Embed it; use transactions
   * Many places? → Reference it; too hard to keep consistent


---

## Checklist: Before You Deploy

* ✓ Did you embed frequently-accessed data?
* ✓ Did you reference data that changes often?
* ✓ Do you have a plan for updating duplicated data?
* ✓ Did you avoid unbounded arrays?
* ✓ Is your document size under 5 MB (unless you have a good reason)?
* ✓ Did you test query performance?


---

## Bottom Line

**Embed data by default in MongoDB.** It's the whole point of the database. Duplication is a feature, not a bug.

**The only catch:** When you embed, write code to keep it consistent when it changes. Whether that's transactions, background updates, or eventual consistency depends on your app. Pick one strategy and stick to it.

**Don't overthink it.** Start with embedding, measure performance, and refactor to references only if you need to.