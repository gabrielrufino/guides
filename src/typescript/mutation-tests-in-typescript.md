# 🧬 Mutation tests in TypeScript

You probably already heard about unit tests, integration tests, functional tests, end-to-end tests, etc. But **have you ever heard about mutation tests?**


Mutation tests are one of the ways you have to validate how good your automated tests are. The idea is pretty simple and ingenious at the same time: **You change the codebase dynamically, introducing some code smells and checking that your automated tests are good enough to detect the changes. If they don't, you need to improve your automated tests to cover more cases.**

### Example

Let's suppose we're creating a lib that provides a function called `hasOnlyOddNumbers` that receives an array and returns `true` when, and only when, the array contains just odd numbers.

So, that is our function:

```typescript
// index.ts
export default function hasOnlyOddNumbers(array: number[]): boolean {
  return array.every(number => number % 2 === 1)
}
```


Basically, we go through the entire array checking if all of the elements are odd numbers.

And that is our initial unit test for our function:

```javascript
// index.spec.js
const hasOnlyOddNumbers = require('.')

describe('hasOnlyOddNumbers', () => {
  it('Should return true when the argument has only odd numbers', () => {
    const result = hasOnlyOddNumbers([1, 3, 5, 7, 9])
    expect(result).toBe(true)
  })
})
```

Is that a good or even a sufficient unit test? I'm not certain how good our test is. But we can run our mutation tests tool so it can change our original code dynamically and validate that our unit tests see the change by failing. In case they don't see the change, the unit tests are not good enough.

An example of a mutation that the tool can introduce is changing the criteria for the `.every` function. Something like that:

```markdown
- return array.every(number => number % 2 === 1)
+ return array.every(number => true)
```

After the change, the tool tries to run our unit tests. **If the unit tests fail, it means that they're good enough to capture this change. If they don't, we need to improve our unit tests so we can detect code smells like that**.

Turns out, in this case, **our unit tests wouldn't fail, which means that they're not good enough**. It happens because the single unit test that we have only tested the good path: when all of the numbers are odd.

We should add a new unit test to cover the case that the function receives even numbers. So let's do it:

```typescript
// index.spec.ts
import hasOnlyOddNumbers from '.'

describe('hasOnlyOddNumbers', () => {
  it('Should return true when the argument has only odd numbers', () => {
    const result = hasOnlyOddNumbers([1, 3, 5, 7, 9])
    expect(result).toBe(true)
  })

  it('Should return false when the argument has at least one even number', () => {
    const result = hasOnlyOddNumbers([1, 2, 3, 5, 7, 9])
    expect(result).toBe(false)
  })
})
```

After that one, our unit tests would fail with the previous mutation, which means that the mutation tests succeed.

### The Stryker

> <https://stryker-mutator.io/>


That is the library that turns all of the mutation tests process easier. They call these changes as *mutants* and the process of eliminating these changes is by killing these mutants. So that's why the article image cover.

Let's try:

```bash
mkdir has-only-odd-numbers
npm init -y
npm i -D jest stryker-cli @stryker-mutator/core
mkdir src
touch src/index.js src/index.spec.js
npx stryker init
```


Now, copy the code of the example to your files `index.js` for the function and `index.spec.js` for the tests. After that, you can run the unit tests and the mutation tests with the following commands:


```bash
npx jest
npx stryker run
```


This is the output when for the incomplete unit tests:

```bash
21:06:20 (55599) INFO InputFileResolver Found 1 of 5 file(s) to be mutated.
21:06:20 (55599) INFO Instrumenter Instrumented 1 source file(s) with 6 mutant(s)
21:06:20 (55599) INFO ConcurrencyTokenProvider Creating 7 test runner process(es).
21:06:21 (55599) INFO DryRunExecutor Starting initial test run (jest test runner with "perTest" coverage analysis). This may take a while.
21:06:21 (55599) INFO DryRunExecutor Initial test run succeeded. Ran 1 tests in 0 seconds (net 1 ms, overhead 451 ms).
Mutation testing  [==================================================] 100% (elapsed: <1m, remaining: n/a) 6/6 Mutants tested (1 survived, 0 timed out)

All tests/index.spec.js
  ✓ hasOnlyOddNumbers Should return true when the argument has only odd numbers [line 4] (killed 5)

#2. [Survived] ConditionalExpression
src/index.js:2:32
-     return array.every(number => number % 2 === 1)
+     return array.every(number => true)
Tests ran:
    hasOnlyOddNumbers Should return true when the argument has only odd numbers


Ran 1.00 tests per mutant on average.
----------|---------|----------|-----------|------------|----------|---------|
File      | % score | # killed | # timeout | # survived | # no cov | # error |
----------|---------|----------|-----------|------------|----------|---------|
All files |   83.33 |        5 |         0 |          1 |        0 |       0 |
 index.js |   83.33 |        5 |         0 |          1 |        0 |       0 |
----------|---------|----------|-----------|------------|----------|---------|
21:06:22 (55599) INFO HtmlReporter Your report can be found at: file:///home/gabrielrufino/Desktop/has-only-odd-numbers/reports/mutation/mutation.html
21:06:22 (55599) INFO MutationTestExecutor Done in 1 second.
```


After we include the new test, we get this output:

```bash
21:10:19 (55923) INFO InputFileResolver Found 1 of 5 file(s) to be mutated.
21:10:19 (55923) INFO Instrumenter Instrumented 1 source file(s) with 6 mutant(s)
21:10:19 (55923) INFO ConcurrencyTokenProvider Creating 7 test runner process(es).
21:10:19 (55923) INFO DryRunExecutor Starting initial test run (jest test runner with "perTest" coverage analysis). This may take a while.
21:10:20 (55923) INFO DryRunExecutor Initial test run succeeded. Ran 2 tests in 0 seconds (net 1 ms, overhead 460 ms).
Mutation testing  [==================================================] 100% (elapsed: <1m, remaining: n/a) 6/6 Mutants tested (0 survived, 0 timed out)

All tests/index.spec.js
  ✓ hasOnlyOddNumbers Should return true when the argument has only odd numbers [line 4] (killed 5)
  ✓ hasOnlyOddNumbers Should return false when the argument has at least one even number [line 9] (killed 1)

Ran 2.00 tests per mutant on average.
----------|---------|----------|-----------|------------|----------|---------|
File      | % score | # killed | # timeout | # survived | # no cov | # error |
----------|---------|----------|-----------|------------|----------|---------|
All files |  100.00 |        6 |         0 |          0 |        0 |       0 |
 index.js |  100.00 |        6 |         0 |          0 |        0 |       0 |
----------|---------|----------|-----------|------------|----------|---------|
21:10:21 (55923) INFO HtmlReporter Your report can be found at: file:///home/gabrielrufino/Desktop/add/reports/mutation/mutation.html
21:10:21 (55923) INFO MutationTestExecutor Done in 1 second.
```

### Where am I using Stryker?

The first project I'm trying to apply this technique and this library is my project called **cube**, which is a library for data structures that I built only for learning purposes. Feel free to contribute and learn from that, but *don't use it for production.*