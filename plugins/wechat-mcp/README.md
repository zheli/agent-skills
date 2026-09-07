# WeChat MCP

Cursor plugin that connects agents to [WeChat-MCP](https://github.com/BiboyQG/WeChat-MCP), a macOS [Model Context Protocol](https://modelcontextprotocol.io/) server that reads and replies to WeChat through Accessibility APIs.

The plugin starts one stdio MCP server named `wechat-mcp` via `uvx`.

## Requirements

- **macOS** (WeChat-MCP uses Accessibility and screen capture; Linux/Windows are not supported)
- [WeChat for Mac](https://mac.weixin.qq.com/) installed and running
- [uv](https://docs.astral.sh/uv/) on `PATH` (for `uvx`)
- Accessibility permission for **Cursor** (System Settings → Privacy & Security → Accessibility)

## Install

### Customize (recommended)

1. Open **Customize** in the Cursor sidebar.
2. Open the **Plugins** tab.
3. Add a repository / marketplace and enter `https://github.com/zheli/agent-skills`.
4. Install **WeChat MCP** (user or project scope).

On Teams/Enterprise you can also import the same repo from **Dashboard → Plugins → Team Marketplaces → Add Marketplace → Import from Repo**, then install from Customize.

### Local symlink (plugin development)

```bash
mkdir -p ~/.cursor/plugins/local
ln -s /absolute/path/to/agent-skills/plugins/wechat-mcp ~/.cursor/plugins/local/wechat-mcp
```

Then run **Developer: Reload Window**.

## MCP

Default launch (no prior `pip install`):

```json
{
  "mcpServers": {
    "wechat-mcp": {
      "command": "uvx",
      "args": ["--from", "wechat-mcp-server", "wechat-mcp"]
    }
  }
}
```

### PATH alternative

If you prefer a global install:

```bash
pip install wechat-mcp-server
```

Then point MCP at `wechat-mcp` on your `PATH` instead of `uvx` (edit a local copy of the plugin, or configure an equivalent user MCP entry).

## Tools

- `fetch_messages_by_chat` — recent messages from a contact or group
- `reply_to_messages_by_chat` — send a reply
- `add_contact_by_wechat_id` — friend request by WeChat ID
- `publish_moment_without_media` — text-only Moments post (optional draft-only)

The bundled rule `wechat-mcp-usage` guides fetch-before-reply behavior and natural chat tone. Enable it when chatting about WeChat tasks.

## Docs

- Upstream server: https://github.com/BiboyQG/WeChat-MCP
- Detailed API guide: https://github.com/BiboyQG/WeChat-MCP/blob/master/docs/detailed-guide.md

## License

MIT. Plugin packaging by zheli; runtime server is [BiboyQG/WeChat-MCP](https://github.com/BiboyQG/WeChat-MCP) (`wechat-mcp-server` on PyPI). See [LICENSE](./LICENSE).
