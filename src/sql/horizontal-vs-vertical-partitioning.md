# Horizontal vs. Vertical Partitioning

## Overview

**Vertical Partitioning**:  Splits a table by **columns** (dividing attributes across multiple tables).

**Horizontal Partitioning**: Splits a table by **rows** (dividing data across multiple tables or databases).


---

## Vertical Partitioning

### Concept

Split columns into separate tables, typically separating frequently accessed data from rarely used data.

### Example

**Original Table:**

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    profile_picture BLOB,
    bio TEXT,
    last_login TIMESTAMP
);
```

**After Vertical Partitioning:**

```sql
-- Frequently accessed data

CREATE TABLE users_core (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    last_login TIMESTAMP
);

-- Rarely accessed data

CREATE TABLE users_extended (
    id INT PRIMARY KEY,
    profile_picture BLOB,
    bio TEXT,
    FOREIGN KEY (id) REFERENCES users_core(id)
);
```

### Diagram

```mermaid
graph LR
    A[Original Table:  users] --> B[users_core<br/>id, name, email, last_login]
    A --> C[users_extended<br/>id, profile_picture, bio]
```

### Benefits

* Improved cache efficiency
* Faster queries on frequently used columns
* Reduced I/O for common operations


---

## Horizontal Partitioning

### Concept

Split rows into separate tables based on a key (e.g., date, region, ID range).

### Example

**Original Table:**

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    order_date DATE,
    amount DECIMAL(10,2),
    region VARCHAR(50)
);
```

**After Horizontal Partitioning (by year):**

```sql
CREATE TABLE orders_2023 (
    id INT PRIMARY KEY,
    user_id INT,
    order_date DATE,
    amount DECIMAL(10,2),
    region VARCHAR(50)
);

CREATE TABLE orders_2024 (
    id INT PRIMARY KEY,
    user_id INT,
    order_date DATE,
    amount DECIMAL(10,2),
    region VARCHAR(50)
);

CREATE TABLE orders_2025 (
    id INT PRIMARY KEY,
    user_id INT,
    order_date DATE,
    amount DECIMAL(10,2),
    region VARCHAR(50)
);
```

### Diagram

```mermaid
graph TD
    A[Original Table: orders] --> B[orders_2023<br/>rows where year = 2023]
    A --> C[orders_2024<br/>rows where year = 2024]
    A --> D[orders_2025<br/>rows where year = 2025]
```

### Benefits

* Better query performance (scan smaller datasets)
* Easier data archiving and deletion
* Improved scalability (can distribute across servers - sharding)


---

## Comparison

| Aspect | Vertical Partitioning | Horizontal Partitioning |
|--------|-----------------------|-------------------------|
| **Splits by** | Columns               | Rows                    |
| **Use case** | Separate hot/cold data | Large datasets, time-series data |
| **Query impact** | Fewer columns to scan | Fewer rows to scan      |
| **Joins** | More joins needed     | Queries may hit multiple partitions |
| **Scalability** | Limited               | High (enables sharding) |


---

## Combined Example

```mermaid
graph TB
    A[orders table] --> B[Vertical Split]
    B --> C[orders_core]
    B --> D[orders_details]
    
    C --> E[Horizontal Split by year]
    E --> F[orders_core_2023]
    E --> G[orders_core_2024]
    E --> H[orders_core_2025]
```


You can combine both strategies for maximum efficiency!