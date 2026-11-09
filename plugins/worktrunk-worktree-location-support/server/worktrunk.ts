import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { parse } from "smol-toml";

interface Context {
  sourceCheckout: string;
  repoRoot: string;
  branch: string;
}

interface Options {
  home?: string;
  env?: NodeJS.ProcessEnv;
}

export async function worktreePath(
  { sourceCheckout, repoRoot, branch }: Context,
  { home = homedir(), env = process.env }: Options = {},
): Promise<string | undefined> {
  const configPaths = [
    join(env.XDG_CONFIG_HOME || join(home, ".config"), "worktrunk", "config.toml"),
    join(sourceCheckout, ".config", "wt.toml"),
  ];
  let configPath = "";
  let template: unknown;
  for (const candidate of configPaths) {
    let contents: string;
    try {
      contents = await readFile(candidate, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    template = parse(contents)["worktree-path"];
    if (template !== undefined) {
      configPath = candidate;
      break;
    }
  }
  if (template === undefined) return undefined;
  if (typeof template !== "string" || !template.trim()) {
    throw new Error(`${configPath}: worktree-path must be a nonempty string`);
  }

  const variables: Record<string, string> = {
    branch,
    repo: basename(repoRoot),
    repo_path: repoRoot,
  };
  // Validate before interpolation so braces in branch or repository names stay literal.
  const syntax = template.replace(/{{([\s\S]*?)}}/g, "");
  if (/{{|}}|{%|%}|{#|#}/.test(syntax)) {
    throw new Error(`${configPath}: unsupported worktree-path template syntax`);
  }
  const rendered = template.replace(/{{([\s\S]*?)}}/g, (_match, expression: string) => {
    const parts = expression.split("|").map((part) => part.trim());
    const variable = parts.shift()!;
    if (!Object.hasOwn(variables, variable)) {
      throw new Error(`${configPath}: unsupported worktree-path variable: ${variable}`);
    }
    let value = variables[variable]!;
    for (const filter of parts) {
      if (filter !== "sanitize") {
        throw new Error(`${configPath}: unsupported worktree-path filter: ${filter}`);
      }
      value = value.replace(/[/\\]/g, "-");
    }
    return value;
  });
  const expanded = rendered === "~" ? home
    : rendered.startsWith("~/") ? join(home, rendered.slice(2)) : rendered;
  return resolve(repoRoot, expanded);
}
