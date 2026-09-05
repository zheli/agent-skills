# GitHub Multi-Token

Cursor plugin fork of the official [GitHub](https://github.com/cursor/plugins/tree/main/third_party/github) plugin. It connects agents to GitHub through GitHub's remote [Model Context Protocol](https://modelcontextprotocol.io/) server using **two** personal access tokens (work and personal) at once.

Each token becomes its own MCP server: `github-work` and `github-personal`.

## Install

### Local (any Cursor plan)

```bash
git clone https://github.com/zheli/agent-skills.git
ln -s "$(pwd)/agent-skills/plugins/github-multi" ~/.cursor/plugins/local/github-multi
```

Then run **Developer: Reload Window** in Cursor.

If you already have this repo checked out:

```bash
ln -s /absolute/path/to/agent-skills/plugins/github-multi ~/.cursor/plugins/local/github-multi
```

### Team Marketplace

1. Open **Dashboard → Plugins**.
2. Under **Team Marketplaces**, click **Add Marketplace → Import from Repo**.
3. Enter `https://github.com/zheli/agent-skills`.
4. Install **GitHub Multi-Token**.

### Configure tokens

1. Create two PATs at https://github.com/settings/tokens (fine-grained preferred).
2. Grant only the scopes the agent needs (repos, issues, pull requests, Actions, metadata).
3. In **Plugins → Configure** for **GitHub Multi-Token**, set:
   - **GitHub work personal access token** → `GITHUB_TOKEN_WORK`
   - **GitHub personal-account access token** → `GITHUB_TOKEN_PERSONAL`

Tool calls run with that token's permissions. Rotate or revoke tokens from GitHub Settings if exposed.

## MCP

```json
{
  "mcpServers": {
    "github-work": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN_WORK}"
      }
    },
    "github-personal": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN_PERSONAL}"
      }
    }
  }
}
```

## Conflict with the official GitHub plugin

This plugin uses a different id (`github-multi`) and can install beside the marketplace **GitHub** plugin. If both are enabled, you get three GitHub MCP namespaces. Prefer disabling or uninstalling the official single-token plugin, and name the account in prompts (`github-work` vs `github-personal`) when both servers are active.

## Docs

- Upstream plugin: https://github.com/cursor/plugins/tree/main/third_party/github
- Use the GitHub MCP server: https://docs.github.com/en/copilot/how-tos/context/use-mcp/use-the-github-mcp-server
- Managing personal access tokens: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

Logo is GitHub's official Octocat mark (from the upstream Cursor plugin packaging).

## License

MIT. Based on Cursor's GitHub plugin; see [LICENSE](./LICENSE).
