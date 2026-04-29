# AndroidAgenticWiki

A Git-backed knowledge graph and Model Context Protocol (MCP) server for Android development.

Standard LLMs lack real-time awareness of the rapidly evolving Android ecosystem. **AndroidAgenticWiki** bridges this gap by serving as a "Long-Term Memory" vault. By connecting this repository to your IDE via MCP, your AI agent gains access to local constraints that override general training data with workspace-specific rules and official Google standards, eliminating hallucinations of deprecated APIs.

## 📦 What's Included (Out-of-the-Box)

You don't just get an empty folder structure. This vault comes pre-loaded with Senior-level architectural constraints:

- **Build Rules (**`build_constraints.md`**):** Enforces AGP 9.2.0+, Compose BOM 2026.04.01, and strict declarative setups (banning the legacy `kotlin-android` plugin).
- **UI Standards (**`ui_standards.md`**):** Mandates stable Material 3, Edge-to-Edge enforcement, and Compose `Modifier.graphicsLayer` performance rules.
- **Architecture (**`architecture.md`**):** Teaches the agent to auto-detect and enforce strict Clean Architecture, MVVM, or MVI patterns based on your project structure.
- **Sanitized Blueprints:** Actionable templates for `koin_di.md`, `mvvm_state.md`, `room3_configuration.md`, and `design_md_implementation.md`.
- **Google Android Skills:** Automatically syncs with the official `android/skills` repository via Git submodules for authoritative navigation, performance, and UI guidance.

## 🧠 The Architecture
This brain utilizes two components operating on the exact same local folder simultaneously:

1. **The MCP Server (Backend):** Acts as the headless bridge into your Android Studio AI. You can run this via **Tolaria** (a dedicated desktop app) or natively via **Node.js**.
2. **Obsidian (GUI & Data Funnel):** Acts as your optional visualizer. You use it to view the knowledge graph and clip new Android documentation from the web directly into the vault.

---
> ⚠️ **CRITICAL WARNING: DO NOT DOWNLOAD THE ZIP FILE**
> This repository relies on Git Submodules to synchronize the official Google Android Skills. If you use GitHub's "Download ZIP" feature, the `external_skills/` directory will be completely empty and the AI agent will fail to route correctly. **You must install this tool via Git clone.**

## 🚀 Setup Guide


### 1. Initialize the Vault
Clone the repository and pull the official Google skills submodule:
```bash
git clone https://github.com/trinadhthatakula/AndroidAgenticWiki.git
cd AndroidAgenticWiki
git submodule update --init --recursive
```

### 2. Choose Your MCP Server Path

**Option A: Tolaria (Recommended for macOS)**
1. Download and install [Tolaria](https://github.com/refactoringhq/tolaria/releases).
2. Open this repository folder as a Vault in Tolaria.
3. Open Tolaria's Command Palette and search "Set Up External AI Tools" to copy your unique MCP Server Command path.

**Option B: Native Node.js (Windows / Linux / CLI Preference)**
This repository acts as its own MCP server.
1. Ensure [Node.js](https://nodejs.org/) (v18+) is installed on your machine.
2. Open a terminal in the root of the cloned repository and run `npm install`.
3. To test the server, run `npm run mcp`. *(You can stop it with Ctrl+C after verifying it boots).*

### 3. IDE Integration & Configuration

You can wire the knowledge graph into your AI assistant using either our auto-setup script, UI configuration, or manual configuration depending on your client.

**Method A: Auto-Setup (Claude Desktop, Claude Code, Gemini CLI, Codex)**
If you use Claude Desktop, Claude Code, Gemini CLI, or Codex, you can automatically install the plugin by running the setup script in the root of the cloned repository:
```bash
npm run setup
```
*(This automatically configures `claude_desktop_config.json`, `~/.claude.json`, `~/.gemini/settings.json`, and `~/.codex/config.toml`).*

**Method B: UI Configuration (Android Studio / IntelliJ)**
1. Open **Settings** (Windows/Linux) or **Preferences** (macOS).
2. Navigate to **Plugins** > **AI** > **MCP Servers**.
3. Click **Add Server** (+).
4. **Name:** `AndroidAgenticWiki`
5. **Executable / Command:** `npx`
6. **Arguments:** `-y @modelcontextprotocol/server-filesystem /absolute/path/to/your/AndroidAgenticWiki`
   *(Crucial: Replace the path with the actual absolute path to the cloned repository).*
7. Restart the AI Assistant.

**Method C: Manual Configuration (Cursor, Custom Clients)**
If your AI client uses a JSON configuration file (e.g., `claude_desktop_config.json`), copy and paste the following block into your `mcpServers` object. 

*Remember to replace `/absolute/path/to/your/AndroidAgenticWiki` with your actual local path.*

```json
{
  "mcpServers": {
    "android-agentic-wiki": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/absolute/path/to/your/AndroidAgenticWiki"
      ]
    }
  }
}
```

For **Codex** (`~/.codex/config.toml`), use:
```toml
[mcp_servers."android-agentic-wiki"]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/absolute/path/to/your/AndroidAgenticWiki"]
```

### 4. Configure the Data Funnel (Obsidian)
1. Download [Obsidian](https://obsidian.md/) and open the `AndroidAgenticWiki` folder as a vault.
2. Install the [Obsidian Web Clipper](https://obsidian.md/clipper) browser extension.
3. In the Web Clipper settings, go to **Templates** > **Default**.
4. Set the **Folder** location to `inbox`.
5. Add a new Property: Name = `status`, Value = `unprocessed`.

---

## 🤖 Your First Prompt
Once connected, open the AI chat in Android Studio and trigger the routing engine:

> *"Based on the *`AGENTS.md`* routing in my AndroidAgenticWiki, create a new User Profile feature using the MVVM blueprint and Koin DI constraints."*

## 📥 How the Wiki Learns (The Ingestion Workflow)
This repository is not a static template; it is a self-updating system. You can literally "teach" your agent new Android concepts, libraries, or architectural patterns without writing markdown yourself.

When a new Android feature, library update, or architecture blog post is released:
1. **Clip the Knowledge:** Use the Obsidian Web Clipper to save the raw Medium article or Android Developer doc directly into your `/inbox` folder.
2. **Trigger the Brain:** Open Android Studio and tell your connected agent: *"Execute the runbook in workflows/ingest_docs.md on the unprocessed files in my inbox."*
3. **Watch it Learn:** The agent will autonomously read the article, extract the strict engineering rules, update your `build_constraints.md` or `ui_standards.md`, write a fresh code blueprint in `/blueprints/`, and archive the raw document.

**Result:** The next time you ask the agent to build a feature, it will natively use the new architecture it just learned.

## ⚠️ Disclaimer
The rules and blueprints provided in this repository are highly opinionated templates designed for modern, high-performance Android development. Every team is different. You are highly encouraged to fork this repository and modify the `/rules/` and `/blueprints/` directories to perfectly match your own tech stack and organizational standards.
