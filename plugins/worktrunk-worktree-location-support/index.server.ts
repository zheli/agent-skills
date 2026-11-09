import { worktreePath } from "./server/worktrunk.ts";
import type { PluginServerContext } from "@getpaseo/plugin/server";

export default function contribute(server: PluginServerContext) {
  return server.addHook("worktree.create.before", async ({ request }) => {
    const path = await worktreePath(request);
    return path === undefined ? undefined : { ...request, path };
  });
}
