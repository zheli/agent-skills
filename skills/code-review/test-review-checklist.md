# Test Review Checklist

A structured checklist for evaluating test adequacy in code reviews. Referenced by the reviewer subagent during code review to ensure PRs include sufficient, meaningful tests.

## 1. Test Impact Map

Before reviewing test quality, build a map of what changed and whether tests exist.

Run these commands against the review range:

```bash
# All changed files
git diff --name-only {BASE_SHA}..{HEAD_SHA}

# Changed source files (exclude test files)
git diff --name-only {BASE_SHA}..{HEAD_SHA} -- \
  ':(exclude)*test*' ':(exclude)*spec*' ':(exclude)*_test.*' \
  ':(exclude)test_*' ':(exclude)__tests__/*'

# Changed test files only
git diff --name-only {BASE_SHA}..{HEAD_SHA} | grep -E '(test|spec|_test\.|test_|__tests__)'
```

If `{TEST_FILE_GLOBS}` is provided, use those patterns instead of the defaults above.

Produce this table in your review output:

| Changed source file | Corresponding test file | Status |
|---------------------|------------------------|--------|
| `path/to/module.ts` | `path/to/module.test.ts` | Added / Updated / **Missing** / N/A |

Mark a file **N/A** only for non-logic files (configs, docs, migrations with separate validation).

## 2. Coverage Rules by Change Type

| Change type | Minimum test expectation | Default severity if missing |
|---|---|---|
| New feature / public API | Unit tests for public interface and key paths | **Important** |
| Bug fix | Regression test that reproduces the original bug | **Important** |
| Auth / security / permissions | Unit + integration tests covering allow and deny | **Critical** |
| Data persistence / migrations | Tests covering read, write, and edge cases | **Critical** |
| Refactor (behavior-preserving) | Existing tests still pass and cover changed code | **Important** if coverage drops |
| Config / environment change | Test with new and old/default values | **Minor** |
| Error handling changes | Tests for both success and failure paths | **Important** |

## 3. Test Quality Checks

Review each test file for these qualities:

- **Behavior over implementation** — tests assert observable outcomes, not internal method calls or mock wiring
- **Specific assertions** — tests check concrete values, not just "no error thrown" or "something returned"
- **Edge cases** — nulls, empty collections, boundary values, invalid input, error paths
- **Descriptive names** — test names describe the scenario and expected behavior, not just the method name
- **Independence** — tests don't depend on execution order or shared mutable state
- **Readability** — test setup is clear; the reader can understand what's being tested without tracing through helpers

## 4. Red Flags

Flag these patterns explicitly in the review:

- **No test delta** — PR changes source files but adds/modifies zero test files
- **Deleted tests** — tests removed without replacement or justification
- **Mock-only assertions** — tests that only verify mock interactions, never real behavior
- **Snapshot overuse** — snapshot tests added for logic that needs specific value assertions
- **Untestable new code** — new code paths with no test and no obvious way to test them (design issue)
- **Copy-paste tests** — identical test bodies with only one value changed (should be parameterized)
- **Tests that cannot fail** — assertions that always pass regardless of implementation correctness

## 5. Output: Untested Changes

After completing the analysis, include this section in your review output:

### Untested changes

List each changed function, method, endpoint, or code path that lacks a covering test:

- `file:line` — description of the untested behavior

If there are no untested changes, write: "All changed behavior has corresponding tests."

### Merge verdict impact

- Any **Critical** untested path → verdict must be **No** (must fix before merge)
- Any **Important** untested path → verdict must be **With fixes** at best
- Only **Minor** or no gaps → test coverage does not block merge
