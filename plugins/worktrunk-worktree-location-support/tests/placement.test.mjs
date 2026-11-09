import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import contribute from "../index.server.ts";
import { worktreePath } from "../server/worktrunk.ts";

const request = {
  kind: "branch-off", sourceCheckout: "/projects/app/.worktrees/source",
  repoRoot: "/projects/app", branch: "feature/login", baseRef: "main",
  slug: "original", path: "/paseo/default",
};

async function fixture(t, contents, xdg = false) {
  const home = await mkdtemp(join(tmpdir(), "paseo-worktrunk-"));
  t.after(() => rm(home, { recursive: true, force: true }));
  const env = xdg ? { XDG_CONFIG_HOME: join(home, "custom") } : {};
  const path = join(env.XDG_CONFIG_HOME || join(home, ".config"), "worktrunk", "config.toml");
  if (contents !== undefined) {
    await mkdir(resolve(path, ".."), { recursive: true });
    await writeFile(path, contents);
  }
  return { home, env, path };
}

test("registers creation hook and returns cleanup", () => {
  const cleanup = () => {};
  assert.equal(contribute({ addHook(name, handler) {
    assert.equal(name, "worktree.create.before");
    assert.equal(typeof handler, "function");
    return cleanup;
  } }), cleanup);
});

for (const contents of [undefined, "# empty", '[list]\nfull = true']) {
  test(`keeps Paseo defaults for missing setting: ${contents}`, async (t) => {
    assert.equal(await worktreePath(request, await fixture(t, contents)), undefined);
  });
}

for (const [template, expected] of [
  [".worktrees/{{ branch }}", "/projects/app/.worktrees/feature/login"],
  [".worktrees/{{branch|sanitize}}", "/projects/app/.worktrees/feature-login"],
  ["{{ repo_path }}/../{{ repo }}.{{ branch | sanitize }}", "/projects/app.feature-login"],
  ["/central/{{ repo }}/{{ branch }}", "/central/app/feature/login"],
]) {
  test(`renders ${template} relative to main repo`, async (t) => {
    const options = await fixture(t, `worktree-path = '${template}'\n[list]\nfull = true`);
    assert.equal(await worktreePath(request, options), expected);
  });
}

for (const userConfig of [undefined, "# no user setting"]) {
  test(`falls back to source project config with user config: ${userConfig}`, async (t) => {
    const options = await fixture(t, userConfig);
    const sourceCheckout = join(options.home, "source-worktree");
    await mkdir(join(sourceCheckout, ".config"), { recursive: true });
    await writeFile(join(sourceCheckout, ".config/wt.toml"), 'worktree-path = "project/{{ branch }}"');
    assert.equal(await worktreePath({ ...request, sourceCheckout }, options),
      "/projects/app/project/feature/login");
  });
}

test("user setting wins over source project setting", async (t) => {
  const options = await fixture(t, 'worktree-path = "user/{{ branch }}"');
  const sourceCheckout = join(options.home, "source");
  await mkdir(join(sourceCheckout, ".config"), { recursive: true });
  await writeFile(join(sourceCheckout, ".config/wt.toml"), 'worktree-path = "project/{{ branch }}"');
  assert.equal(await worktreePath({ ...request, sourceCheckout }, options),
    "/projects/app/user/feature/login");
});

test("missing project setting preserves Paseo default", async (t) => {
  const options = await fixture(t, undefined);
  const sourceCheckout = join(options.home, "source");
  await mkdir(join(sourceCheckout, ".config"), { recursive: true });
  await writeFile(join(sourceCheckout, ".config/wt.toml"), '[post-start]\ninstall = "npm ci"');
  assert.equal(await worktreePath({ ...request, sourceCheckout }, options), undefined);
});

test("invalid project config fails creation instead of silently falling back", async (t) => {
  const options = await fixture(t, undefined);
  const sourceCheckout = join(options.home, "source");
  await mkdir(join(sourceCheckout, ".config"), { recursive: true });
  await writeFile(join(sourceCheckout, ".config/wt.toml"), 'worktree-path = 42');
  await assert.rejects(worktreePath({ ...request, sourceCheckout }, options), /nonempty string/);
});

test("honors XDG_CONFIG_HOME and expands home paths", async (t) => {
  const options = await fixture(t, 'worktree-path = "~/trees/{{ branch | sanitize }}"', true);
  assert.equal(await worktreePath(request, options), join(options.home, "trees/feature-login"));
});

test("rereads config on each creation", async (t) => {
  const options = await fixture(t, 'worktree-path = "first/{{ branch }}"');
  assert.equal(await worktreePath(request, options), "/projects/app/first/feature/login");
  await writeFile(options.path, 'worktree-path = "second/{{ branch }}"');
  assert.equal(await worktreePath(request, options), "/projects/app/second/feature/login");
});

for (const contents of [
  "not valid toml", 'worktree-path = 42', 'worktree-path = ""',
  'worktree-path = "{{ owner }}"', 'worktree-path = "{{ branch | codename(2) }}"',
  'worktree-path = "{% if branch %}foo{% endif %}"',
  'worktree-path = "{{ branch"',
]) {
  test(`rejects invalid or unsupported config: ${contents}`, async (t) => {
    const options = await fixture(t, contents);
    await assert.rejects(worktreePath(request, options));
  });
}

test("hook preserves request fields and leaves missing config untouched", async (t) => {
  const options = await fixture(t, '.worktrees = "unused"');
  // Point the real hook at an isolated config; do not read the developer's config.
  const previous = process.env.XDG_CONFIG_HOME;
  process.env.XDG_CONFIG_HOME = resolve(options.path, "../..");
  t.after(() => {
    if (previous === undefined) delete process.env.XDG_CONFIG_HOME;
    else process.env.XDG_CONFIG_HOME = previous;
  });
  let hook;
  contribute({ addHook(_name, handler) { hook = handler; return () => {}; } });
  await writeFile(options.path, "# no placement setting");
  assert.equal(await hook({ request }), undefined);
  await writeFile(options.path, 'worktree-path = ".worktrees/{{ branch }}"');
  const original = { ...request };
  assert.deepEqual(await hook({ request }), { ...original, path: "/projects/app/.worktrees/feature/login" });
  assert.deepEqual(request, original);
});
