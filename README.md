# AndroidAgenticWiki

A Git-backed knowledge graph and Model Context Protocol (MCP) server for Android development.

Standard LLMs lack real-time awareness of the rapidly evolving Android ecosystem. **AndroidAgenticWiki** bridges this gap by serving as a "Long-Term Memory" vault. By connecting this repository to your IDE via MCP, your AI agent gains access to local constraints that override general training data with workspace-specific rules and official Google standards, eliminating hallucinations of deprecated APIs.

## 📦 What's Included (Out-of-the-Box)

You don't just get an empty folder structure. This vault comes pre-loaded with Senior-level architectural constraints:

- **Build Rules (**`build_constraints.md`**):** Enforces AGP 9.2.0+, Compose BOM 2026.04.01, and strict declarative setups (banning the legacy `kotlin-android` plugin).
- **UI Standards (**`ui_standards.md`**):** Mandates stable Material 3, Edge-to-Edge enforcement, and Compose `Modifier.graphicsLayer` performance rules.
- **Architecture (**`architecture.md`**):** Teaches the agent to auto-detect and enforce strict Clean Architecture, MVVM, or MVI patterns based on your project structure.
- **Sanitized Blueprints:** Actionable templates for `mvvm_state.md`, and `design_md_implementation.md`.
- **Google Android Skills:** Automatically syncs with the official `android/skills` repository via Git submodules for authoritative navigation, performance, and UI guidance.

## 🧠 The Architecture: Tolaria & Obsidian

This brain utilizes two tools operating on the exact same local folder simultaneously:

1. **Tolaria:** Acts as the headless backend. It runs the local MCP server that bridges the markdown files directly into your Android Studio AI.
2. **Obsidian:** Acts as your optional GUI and data funnel. You use it to visualize the knowledge graph and clip new Android documentation from the web directly into the vault.

## 🚀 Setup Guide

### 1. Initialize the Vault

Clone the repository and pull the official Google skills submodule:

```bash
git clone https://github.com/trinadhthatakula/AndroidAgenticWiki.git
cd AndroidAgenticWiki
git submodule update --init --recursive
```

### 2. Launch the MCP Server (Tolaria)

1. Download and install [Tolaria](https://github.com/refactoringhq/tolaria/releases).
2. Open this repository folder as a Vault in Tolaria.
3. Locate the **MCP Server Command** in Tolaria's Command Palette (e.g., search "Set Up External AI Tools" to get the path).

### 3. IDE Integration (Android Studio)

Wire the knowledge graph directly into your IDE:

1. Open **Settings** (or **Preferences** on macOS).
2. Navigate to **Plugins** > **AI** > **MCP Servers**.
3. Click **Add Server** (+).
4. Name: `AndroidAgenticWiki`.
5. Command: Paste the Tolaria MCP command obtained in Step 2.
6. Restart the AI Assistant.

### 4. Configure the Data Funnel (Obsidian)

1. Download [Obsidian](https://obsidian.md/) and open the `AndroidAgenticWiki` folder as a vault.
2. Install the [Obsidian Web Clipper](https://obsidian.md/clipper) browser extension.
3. In the Web Clipper settings, go to **Templates** > **Default**.
4. Set the **Folder** location to `inbox`.
5. Add a new Property: Name = `status`, Value = `unprocessed`.

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
