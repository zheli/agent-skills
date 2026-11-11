import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { reuseExistingWorktree } from "../server/existing-worktree.ts";

const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8" });

async function repository(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), "paseo-existing-")));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repo = join(root, "repo");
  execFileSync("git", ["init", "-q", "-b", "main", repo]);
  git(repo, "-c", "user.name=Test", "-c", "user.email=test@example.com",
    "commit", "-q", "--allow-empty", "-m", "initial");
  const existing = join(repo, ".worktrees", "fix", "connection");
  git(repo, "worktree", "add", "-q", "-b", "fix/connection", existing);
  return { repo, existing };
}

function runWithGh(output, calls = []) {
  return async (command, args, cwd) => {
    calls.push([command, ...args]);
    if (command === "gh") {
      if (output instanceof Error) throw output;
      return JSON.stringify(output);
    }
    return execFileSync(command, args, { cwd, encoding: "utf8" });
  };
}

const workspace = (source) => ({ title: "Keep me", firstAgentContext: { prompt: "hi" }, source });

test("reuses an existing worktree for branch checkout", async (t) => {
  const { repo, existing } = await repository(t);
  const request = workspace({ kind: "worktree", cwd: repo, projectId: "p1", action: "checkout", refName: "fix/connection" });
  assert.deepEqual(await reuseExistingWorktree(request), {
    ...request,
    source: { kind: "directory", path: existing, projectId: "p1" },
  });
});

test("reuses an existing worktree for a named branch-off", async (t) => {
  const { repo, existing } = await repository(t);
  const result = await reuseExistingWorktree(workspace({
    kind: "worktree", cwd: repo, action: "branch-off", branchName: "fix/connection",
  }));
  assert.deepEqual(result.source, { kind: "directory", path: existing });
});

test("resolves a same-repository GitHub PR to its head branch", async (t) => {
  const { repo, existing } = await repository(t);
  const calls = [];
  const result = await reuseExistingWorktree(workspace({
    kind: "worktree", cwd: repo, action: "checkout",
    checkoutSource: { kind: "change_request", forge: "github", number: 12 },
  }), runWithGh({ headRefName: "fix/connection", isCrossRepository: false }, calls));
  assert.equal(result.source.path, existing);
  assert.deepEqual(calls[0].slice(0, 4), ["gh", "pr", "view", "12"]);
});

test("uses Paseo's owner-prefixed name for fork PRs", async (t) => {
  const { repo } = await repository(t);
  const fork = join(repo, ".worktrees", "fork");
  git(repo, "worktree", "add", "-q", "-b", "alice/fix/connection", fork);
  const result = await reuseExistingWorktree(workspace({
    kind: "worktree", cwd: repo, githubPrNumber: 7,
  }), runWithGh({ headRefName: "fix/connection", isCrossRepository: true, headRepositoryOwner: { login: "Alice" } }));
  assert.equal(result.source.path, fork);
});

test("leaves requests unchanged without a matching worktree", async (t) => {
  const { repo } = await repository(t);
  for (const source of [
    { kind: "directory", path: repo },
    { kind: "worktree", cwd: repo, action: "branch-off" },
    { kind: "worktree", cwd: repo, action: "checkout", refName: "other" },
    { kind: "worktree", projectId: "p1", action: "checkout", refName: "fix/connection" },
    { kind: "worktree", cwd: repo, githubPrNumber: 3 },
  ]) {
    assert.equal(await reuseExistingWorktree(workspace(source), runWithGh(new Error("no gh"))), undefined);
  }
});

test("ignores worktrees whose directory is missing", async (t) => {
  const { repo, existing } = await repository(t);
  await rm(existing, { recursive: true, force: true });
  assert.equal(await reuseExistingWorktree(workspace({
    kind: "worktree", cwd: repo, action: "checkout", refName: "fix/connection",
  })), undefined);
});
