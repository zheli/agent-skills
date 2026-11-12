import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type Run = (command: string, args: string[], cwd: string) => Promise<string>;

export interface WorkspaceCreateRequest {
  source:
    | { kind: "directory"; path: string; projectId?: string }
    | {
        kind: "worktree";
        cwd?: string;
        projectId?: string;
        action?: "branch-off" | "checkout";
        refName?: string;
        branchName?: string;
        checkoutSource?: { kind: "change_request"; forge?: string; number: number };
        githubPrNumber?: number;
      };
}

const defaultRun: Run = async (command, args, cwd) =>
  (await execFileAsync(command, args, { cwd, timeout: 15_000, maxBuffer: 1024 * 1024 })).stdout;

/**
 * Reuse a branch's existing worktree as a directory workspace, because Git refuses
 * to check out one branch in two worktrees and Paseo refuses existing hook paths.
 */
export async function reuseExistingWorktree<T extends WorkspaceCreateRequest>(
  request: T,
  run: Run = defaultRun,
): Promise<T | undefined> {
  const source = request.source;
  if (source.kind !== "worktree" || !source.cwd) return undefined;
  const branches = await candidateBranches(source, source.cwd, run);
  if (branches.length === 0) return undefined;

  const path = await findWorktree(source.cwd, branches, run);
  if (!path) return undefined;
  return {
    ...request,
    source: {
      kind: "directory",
      path,
      ...(source.projectId ? { projectId: source.projectId } : {}),
    },
  };
}

async function candidateBranches(
  source: Extract<WorkspaceCreateRequest["source"], { kind: "worktree" }>,
  cwd: string,
  run: Run,
): Promise<string[]> {
  const prNumber = source.checkoutSource?.number ?? source.githubPrNumber;
  if (prNumber !== undefined) {
    const forge = source.checkoutSource?.forge;
    if (forge && forge !== "github") return source.refName?.trim() ? [source.refName.trim()] : [];
    return pullRequestBranches(prNumber, source.refName?.trim(), cwd, run);
  }
  if (source.action === "checkout") return source.refName?.trim() ? [source.refName.trim()] : [];
  // A named branch-off cannot succeed when that branch already has a worktree.
  return source.branchName?.trim() ? [source.branchName.trim()] : [];
}

async function pullRequestBranches(
  number: number,
  refName: string | undefined,
  cwd: string,
  run: Run,
): Promise<string[]> {
  let pr: { headRefName?: string; isCrossRepository?: boolean; headRepositoryOwner?: { login?: string } };
  try {
    pr = JSON.parse(await run(
      "gh",
      ["pr", "view", String(number), "--json", "headRefName,isCrossRepository,headRepositoryOwner"],
      cwd,
    ));
  } catch {
    // Without forge facts, only an explicit ref can be matched safely.
    return refName ? [refName] : [];
  }
  const head = refName || pr.headRefName?.trim();
  if (!head) return [`pr-${number}`];
  if (!pr.isCrossRepository) return [head];
  // Mirrors Paseo's fork-local branch naming.
  const owner = pr.headRepositoryOwner?.login?.trim().toLowerCase();
  return owner ? [`${owner}/${head}`] : [`pr-${number}/${head}`];
}

async function findWorktree(cwd: string, branches: string[], run: Run): Promise<string | undefined> {
  const output = await run("git", ["worktree", "list", "--porcelain", "-z"], cwd);
  const wanted = new Set(branches.map((branch) => `refs/heads/${branch}`));
  let path: string | undefined;
  let branch: string | undefined;
  let prunable = false;
  const entries: { path: string; branch?: string; prunable: boolean }[] = [];
  for (const field of output.split("\0")) {
    if (field === "") {
      if (path) entries.push({ path, branch, prunable });
      path = branch = undefined;
      prunable = false;
    } else if (field.startsWith("worktree ")) path = field.slice(9);
    else if (field.startsWith("branch ")) branch = field.slice(7);
    else if (field === "prunable" || field.startsWith("prunable ")) prunable = true;
  }
  if (path) entries.push({ path, branch, prunable });

  for (const entry of entries) {
    if (!entry.branch || !wanted.has(entry.branch) || entry.prunable) continue;
    if (await stat(entry.path).then((s) => s.isDirectory(), () => false)) return entry.path;
  }
  return undefined;
}
