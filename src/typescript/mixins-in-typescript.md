# 🧩 Mixins in TypeScript

## Introduction


TypeScript mixins are a pattern for composing classes by combining behaviors from multiple sources, without relying on deep inheritance chains. They help structure code around reusable capabilities (logging, caching, validation, etc.) that can be applied to different classes as needed.

Mixins are especially useful when several unrelated classes need the same behavior, but there is no clean "is-a" relationship that would justify a shared base class. Instead of forcing everything into a single inheritance tree, mixins let you compose behavior in a more flexible, modular way.


***

## What Are Mixins?


A mixin is usually a function that:


1. Receives a "base class" as input.
2. Returns a new class that extends this base class.
3. Adds new properties or methods, while preserving the original behavior of the base class.

Conceptually, inheritance expresses an "is-a" relationship (a `Dog` is an `Animal`), while mixins express something closer to "has capability" (this class "has logging" or "has caching").

### Mixins vs Inheritance

| Aspect | Inheritance | Mixins |
|--------|-------------|--------|
| Relationship | "Is-a"      | "Has capability" / composition |
| Number of sources | Typically single base class | Multiple mixins can be combined |
| Coupling | Tighter hierarchy | Looser, more modular |
| Reuse style | Through the parent class | Through reusable functions (mixin factories) |
| Refactoring impact | Changes propagate down the tree | Changes are localized to each mixin |


***

## Basic Mixin Syntax


First, define a generic constructor type:

```typescript
type Constructor<T = {}> = new (...args: any[]) => T;
```


A simple mixin that adds a `timestamp`:

```typescript
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = new Date();
  };
}

class Message {
  constructor(public content: string) {}
}

const TimestampedMessage = Timestamped(Message);
const msg = new TimestampedMessage("Hello");

console.log(msg.timestamp);
```


The important part: `Timestamped` does not care what `Message` does, it only extends it and adds a `timestamp` property.


***

## Constrained Mixins


Sometimes a mixin only makes sense for classes that expose certain properties or methods. TypeScript allows constraints to enforce this.

```typescript
type Named = { name: string };

function Displayable<TBase extends Constructor<Named>>(Base: TBase) {
  return class extends Base {
    getDisplayName(): string {
      return `Display: ${this.name}`;
    }
  };
}

class User {
  constructor(public name: string) {}
}

const DisplayableUser = Displayable(User);
const u = new DisplayableUser("Alice");
console.log(u.getDisplayName());
```


If a class without `name` is passed to `Displayable`, TypeScript will raise a type error at compile time, making the contract of the mixin explicit.


***

## Composing Multiple Mixins


Mixins become powerful when you combine several behaviors on top of a base class.

```typescript
function Loggable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    log(msg: string): void {
      console.log(`[LOG] ${msg}`);
    }
  };
}

function Cacheable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private cache = new Map<string, unknown>();

    setCache(key: string, value: unknown): void {
      this.cache.set(key, value);
    }

    getCache(key: string): unknown {
      return this.cache.get(key);
    }
  };
}

class Service {
  constructor(public name: string) {}
}

const EnhancedService = Cacheable(Loggable(Service));
const service = new EnhancedService("EmailService");

service.log("Started");
service.setCache("status", "ok");
console.log(service.getCache("status"));
```


The order of composition matters if mixins override the same method: the outermost mixin in the chain wins because it is the last extension in the prototype chain.


***

## Extending From a Mixed Class


Sometimes you want to create a class that extends from a class that already has mixins applied.

```typescript
function WithId<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    id = crypto.randomUUID();
  };
}

class BaseModel {
  createdAt = new Date();
}

class UserModel extends WithId(BaseModel) {
  constructor(public name: string) {
    super();
  }
}

const user = new UserModel("Alice");
console.log(user.id);        // from mixin
console.log(user.createdAt); // from BaseModel
console.log(user.name);      // from UserModel
```


This pattern is useful when you want a "base with capabilities" that is further specialized.


***

## Alternative "applyMixins" Pattern


Another pattern uses interface merging and a helper function to copy methods from mixin classes onto a target prototype.

```typescript
class Jumpable {
  jump(): void {
    console.log("Jump");
  }
}

class Swimmable {
  swim(): void {
    console.log("Swim");
  }
}

class Animal {}

interface Animal extends Jumpable, Swimmable {}

function applyMixins(target: any, sources: any[]): void {
  sources.forEach(source => {
    Object.getOwnPropertyNames(source.prototype).forEach(name => {
      Object.defineProperty(
        target.prototype,
        name,
        Object.getOwnPropertyDescriptor(source.prototype, name) ||
          Object.create(null)
      );
    });
  });
}

applyMixins(Animal, [Jumpable, Swimmable]);

const dog = new Animal();
dog.jump();
dog.swim();
```


For new code, the function-based "class expression" mixin pattern is usually preferred because it integrates better with generics and constraints.


***

## Best Practices

* Keep each mixin focused on a single responsibility (e.g., logging, caching, validation).
* Use generic constraints to document and enforce the expectations of the mixin on the base class.
* Avoid method name collisions across mixins; prefer descriptive, specific method names if multiple behaviors coexist.
* Limit the depth of composed mixins to keep class definitions readable and debuggable.