import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const checker = fileURLToPath(new URL("./check-config.mjs", import.meta.url));
const probe = fileURLToPath(new URL("./probe.sh", import.meta.url));

// All fixtures stay in an isolated temporary directory; these are not sandbox enforcement tests.
test("config checker accepts JSONC and rejects malformed/common invalid types", () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-config-test-"));
  try {
    const cases = [
      ['{/* comment */ "network":{"allowedDomains":["https://example.com/a//b"]}}', 0],
      ['{"filesystem":{"allowWrite":[]}} // comment\n', 0],
      ['{"network":{"allowedDomains":"*"}}', 1],
      ['{"filesystem":{"allowRead":[1]}}', 1],
      ['{"network":null}', 1],
      ['{"filesystem":[]}', 1],
      ['{"enabled":"false"}', 1],
      ['{"permissionPromptTimeoutSeconds":-1}', 1],
      ['{"network":{"disabled":true}}', 0],
      ['[]', 1],
      ['null', 1],
      ['{"enabled":true,}', 1],
    ];
    for (const [content, expected] of cases) {
      const file = join(dir, "sandbox.json");
      writeFileSync(file, content);
      const result = spawnSync(process.execPath, [checker, file], { encoding: "utf8" });
      assert.equal(result.status, expected, `${content}\n${result.stderr}`);
    }
    assert.equal(spawnSync(process.execPath, [checker]).status, 2);
    assert.equal(spawnSync(process.execPath, [checker, join(dir, "missing")]).status, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("probe checks harmless actions and cleans up write fixtures", () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-probe-test-"));
  const run = (...args) => spawnSync("bash", [probe, ...args], { encoding: "utf8" });
  try {
    const file = join(dir, "fixture with spaces");
    writeFileSync(file, "non-secret fixture");
    assert.equal(run("--help").status, 0);
    assert.equal(run("read", file).status, 0);
    assert.equal(run("read", dir).status, 0);
    assert.equal(run("write", dir).status, 0);
    assert.deepEqual(readdirSync(dir), ["fixture with spaces"]);
    assert.equal(run("write", file).status, 2);
    assert.equal(run("net", "file:///etc/passwd").status, 2);
    assert.equal(run("exec", "bash", "-c", "exit 0").status, 0);
    const failure = run("exec", "bash", "-c", "exit 42");
    assert.equal(failure.status, 1);
    assert.match(failure.stderr, /ERROR.*exit 42/);
    assert.doesNotMatch(failure.stdout, /^BLOCKED/m);
    assert.equal(run("unknown", dir).status, 2);
    assert.equal(run().status, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
