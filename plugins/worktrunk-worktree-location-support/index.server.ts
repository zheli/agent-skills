import type { PluginServerContext } from "@getpaseo/plugin/server";
import { reuseExistingWorktree } from "./server/existing-worktree.ts";
import { worktreePath } from "./server/worktrunk.ts";

export default function contribute(server: PluginServerContext) {
  const removeWorkspaceHook = server.addHook("workspace.create.before", async ({ request }) =>
    reuseExistingWorktree(request));
  const removeWorktreeHook = server.addHook("worktree.create.before", async ({ request }) => {
    const path = await worktreePath(request);
    return path === undefined ? undefined : { ...request, path };
  });
  return async () => {
    await removeWorkspaceHook();
    await removeWorktreeHook();
  };
}
