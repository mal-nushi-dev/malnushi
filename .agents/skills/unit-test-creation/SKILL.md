---
name: unit-test-creation
description: >-
  Use this skill when creating, expanding, or repairing unit tests. Focuses on
  testing behavior and contracts rather than implementation details, avoiding test
  smells (tautological, happy-path-only, shotgun, and implementation-coupled tests),
  and optimizing for confidence per test.
---

# Unit Test Creation

## Purpose

Use this skill when creating, expanding, or repairing unit tests.

The goal is not merely to increase test count or code coverage. The goal is to create tests that provide meaningful confidence in externally observable behavior while remaining maintainable as the implementation evolves.

Unit tests created with this skill must avoid test smells, especially:

- **Tautological tests**
- **Happy-path-only tests**
- **Shotgun tests**
- **Implementation-coupled tests**

Prefer a small number of high-value behavioral tests over a large number of shallow tests.

---

## Core Principle

Test **behavior and contracts**, not implementation details.

A good unit test should answer:

> Given this state and input, what behavior is the unit contractually expected to produce?

A test should generally remain valid if the implementation is refactored without changing externally observable behavior.

If a harmless internal refactor would require rewriting the test, the test is probably too implementation-coupled.

---

# Required Workflow

Before writing tests:

1. Identify the unit's public or observable contract.
2. Identify meaningful input classes and behavioral branches.
3. Identify failure modes, boundary conditions, and invalid states.
4. Inspect existing tests to understand established conventions without blindly copying existing smells.
5. Determine which dependencies actually need isolation.
6. Write the smallest useful set of tests that exercises the behavioral contract.

Do not begin by mechanically creating one test per method, line, branch, or implementation detail.

---

# Test Smells

## 1. Tautological Tests

A tautological test proves little or nothing because the expected result is derived using the same logic as the implementation under test.

### Avoid

Examples include:

- Reimplementing the production algorithm inside the test.
- Computing the expected value using the same helper or transformation being tested.
- Mocking a dependency to return `X` and asserting only that the production method returns `X`.
- Asserting that a mocked method was called when the call itself is not part of the behavioral contract.
- Testing getters/setters or trivial pass-through behavior without meaningful domain behavior.

Bad:

```ts
const expected = calculatePrice(items);
expect(calculatePrice(items)).toBe(expected);
```

Bad:

```ts
mockRepository.getUser.mockReturnValue(user);

const result = service.getUser(id);

expect(result).toBe(user);
```

The second example may be valid only if delegation itself is the behavior being specified. Otherwise, it provides very little confidence.

### Prefer

Use independently known expected outcomes.

```ts
expect(calculatePrice([
  { price: 10, quantity: 2 },
  { price: 5, quantity: 1 },
])).toBe(25);
```

The assertion should demonstrate something meaningful about the behavior.

---

## 2. Happy-Path-Only Tests

Do not stop after proving that valid input works.

For each meaningful behavior, consider:

- Empty input
- Null or missing values where applicable
- Minimum and maximum boundaries
- Values immediately above or below a boundary
- Invalid input
- Dependency failures
- Duplicate input
- Unexpected ordering
- Partial data
- Permission or authorization failures
- State transitions
- Already-completed or already-existing state
- Domain-specific edge cases

Not every test suite needs every category. Select cases based on the contract and realistic failure modes.

For branch-heavy code, explicitly inspect the important behavioral branches and ensure the tests do not cover only the default branch.

---

## 3. Shotgun Tests

A shotgun test exercises many unrelated behaviors in one test and contains numerous assertions whose failures could have unrelated causes.

Avoid tests that:

- Verify several independent behaviors at once.
- Set up a large object graph for a tiny behavior.
- Assert dozens of unrelated properties.
- Exercise multiple methods or workflows without a clear reason.
- Require significant debugging just to determine what failed.

Bad:

```ts
it("handles users", () => {
  const user = service.createUser(...);

  expect(user.name).toBe(...);
  expect(user.email).toBe(...);
  expect(repository.save).toHaveBeenCalled();
  expect(emailService.send).toHaveBeenCalled();
  expect(auditService.log).toHaveBeenCalled();

  const result = service.deleteUser(...);

  expect(...);
  expect(...);
});
```

### Prefer

Each test should describe one coherent behavioral scenario.

Multiple assertions are acceptable when they collectively describe the **same behavior**.

For example:

```ts
it("marks an expired session as inactive", () => {
  const session = createSession({ expiresAt: pastDate });

  const result = sessionService.evaluate(session);

  expect(result.active).toBe(false);
  expect(result.reason).toBe("expired");
});
```

These assertions belong together because they express one outcome.

Do not interpret "one behavior" as "exactly one assertion."

---

## 4. Implementation-Coupled Tests

Tests should normally interact with the unit through the same meaningful interface its consumers use.

Avoid asserting:

- Private methods
- Private fields
- Internal helper invocation
- Exact internal call ordering unless ordering is contractually significant
- Internal collection types
- Incidental intermediate values
- Specific algorithmic steps
- Exact numbers of internal calls unless the count is itself important behavior

Bad:

```ts
expect(service["_normalizeUser"]).toHaveBeenCalled();
```

Bad:

```ts
expect(repository.find).toHaveBeenCalledTimes(2);
```

unless exactly two calls are significant to the contract.

### Prefer

Assert externally observable outcomes:

- Return values
- Resulting state
- Persisted changes
- Domain events
- Errors
- Meaningful interactions with external boundaries
- Messages or commands issued to collaborators

Mocks should verify meaningful boundary interactions, not expose the internal choreography of the implementation.

---

# Mocking Guidelines

Mock as little as practical.

Mocks are most useful for genuine boundaries such as:

- Databases
- File systems
- HTTP clients
- Message brokers
- Email providers
- Time
- Randomness
- External APIs

Avoid mocking simple collaborators merely because they are separate classes.

Where practical, prefer real lightweight domain objects and pure collaborators.

When verifying mocks, ask:

> Is this interaction part of the observable contract, or am I asserting how the implementation happens to work today?

If it is merely internal choreography, do not assert it.

---

# Test Case Selection

For each behavior, consider dividing the input space into meaningful equivalence classes.

Example:

For a function determining whether a customer receives a discount at 10 items:

- 0 items
- 9 items
- 10 items
- 11 items

Do not create dozens of arbitrary values when several values exercise the same behavior.

Prioritize:

1. Normal behavior
2. Boundary behavior
3. Failure behavior
4. Important state transitions
5. Historically fragile or regression-prone behavior

---

# Test Naming

Test names should describe behavior rather than implementation.

Prefer:

```text
returns no discount when quantity is below the threshold
```

```text
rejects an order when the customer has insufficient credit
```

```text
does not send a second notification when the order is already completed
```

Avoid:

```text
test calculateDiscount
```

```text
calls validateOrder
```

```text
works correctly
```

A test name should make the expected contract understandable without reading the test body.

---

# Arrange / Act / Assert

Prefer a clear conceptual structure:

```text
Arrange
Act
Assert
```

Do not add comments for these sections when the structure is already obvious.

Keep setup focused on facts relevant to the scenario.

Use builders, factories, fixtures, or helper methods when they reduce noise, but avoid hiding the important conditions of the test inside overly abstract helpers.

A reader should be able to quickly identify:

- What conditions exist
- What action occurs
- What outcome is expected

---

# Coverage

Coverage is a diagnostic tool, not the objective.

Do not create weak tests solely to increase line or branch coverage.

A suite with lower coverage but strong behavioral assertions may be more valuable than a suite with high coverage dominated by tautological or implementation-coupled tests.

When uncovered code is discovered, ask:

> What behavior is currently unverified?

Then test that behavior.

Do not ask:

> How can I execute this line?

---

# Regression Tests

When fixing a bug:

1. Reproduce the bug with a failing test when practical.
2. Express the test in terms of the violated behavior.
3. Verify that the test fails for the correct reason.
4. Apply the fix.
5. Verify that the new test passes.
6. Check nearby behavioral boundaries for related cases.

Do not encode the exact faulty implementation into the regression test.

---

# Existing Codebases

Respect the repository's:

- Test framework
- Assertion library
- Naming conventions
- File organization
- Fixture patterns
- Existing test utilities

However, do not reproduce poor testing patterns merely because they already exist.

Prefer local consistency where it does not conflict with the principles in this skill.

If existing tests are heavily implementation-coupled, new tests should gradually move toward behavioral testing rather than expanding the coupling.

---

# Before Finishing

Review every new or modified test and ask:

### Tautology
Would this test catch an incorrect implementation, or does it simply restate the production code?

### Happy path
What happens at the boundaries or when something fails?

### Shotgun
If this test fails, is the violated behavior immediately clear?

### Coupling
Could the production code be substantially refactored without changing its behavior and still pass this test?

### Value
What defect would this test catch?

If the answer to the last question is unclear, reconsider whether the test is useful.

---

# Definition of Done

A unit-test change is complete when:

- The intended behavioral contract is covered.
- Important edge and failure cases are represented.
- Tests do not reproduce production logic.
- Tests are not unnecessarily coupled to implementation details.
- Individual tests represent coherent scenarios.
- Assertions meaningfully validate outcomes.
- Mocks are limited to useful boundaries.
- Test names explain expected behavior.
- Tests are deterministic.
- Tests can run independently.
- The suite passes.
- The production code can be safely refactored without rewriting tests whose behavior has not changed.

Do not optimize for the number of tests.

Optimize for **confidence per test**.
