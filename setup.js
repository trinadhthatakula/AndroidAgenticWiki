const fs = require('fs');
const path = require('path');
const os = require('os');

const WIKI_PATH = process.cwd();

// Paths
const CLAUDE_DESKTOP_PATH = os.platform() === 'win32'
    ? path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json')
    : path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');

const GEMINI_CLI_PATH = os.platform() === 'win32'
    ? path.join(process.env.USERPROFILE || os.homedir(), '.gemini', 'settings.json')
    : path.join(os.homedir(), '.gemini', 'settings.json');

const CLAUDE_CODE_PATH = path.join(os.homedir(), '.claude.json');
const CODEX_PATH = path.join(os.homedir(), '.codex', 'config.toml');

const mcpConfig = {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", WIKI_PATH]
};

function updateJsonConfig(configPath) {
    let config = {};
    const dir = path.dirname(configPath);
    
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
            console.error(`❌ Could not create directory ${dir}`);
            return false;
        }
    }

    if (fs.existsSync(configPath)) {
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (e) {
            console.error(`❌ Error parsing ${configPath}`);
            return false;
        }
    }

    if (!config.mcpServers) {
        config.mcpServers = {};
    }
    
    config.mcpServers["android-agentic-wiki"] = mcpConfig;

    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return true;
    } catch (e) {
        console.error(`❌ Error writing to ${configPath}`);
        return false;
    }
}

function updateTomlConfig(configPath) {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
            console.error(`❌ Could not create directory ${dir}`);
            return false;
        }
    }

    let content = '';
    if (fs.existsSync(configPath)) {
        content = fs.readFileSync(configPath, 'utf8');
    }

    if (content.includes('mcp_servers."android-agentic-wiki"') || content.includes('mcp_servers.android-agentic-wiki')) {
        return true;
    }

    // Escape backslashes for Windows paths in TOML strings
    const safePath = WIKI_PATH.replace(/\\/g, '\\\\');
    const tomlAddition = `\n[mcp_servers."android-agentic-wiki"]\ncommand = "npx"\nargs = ["-y", "@modelcontextprotocol/server-filesystem", "${safePath}"]\n`;

    try {
        fs.appendFileSync(configPath, tomlAddition);
        return true;
    } catch (e) {
        console.error(`❌ Error writing to ${configPath}`);
        return false;
    }
}

function setup() {
    console.log("🚀 Initializing AndroidAgenticWiki One-Click Setup...");

    let successCount = 0;

    if (updateJsonConfig(CLAUDE_DESKTOP_PATH)) {
        console.log("✅ Configured for Claude Desktop.");
        successCount++;
    }

    if (updateJsonConfig(GEMINI_CLI_PATH)) {
        console.log("✅ Configured for Gemini CLI.");
        successCount++;
    }

    if (updateJsonConfig(CLAUDE_CODE_PATH)) {
        console.log("✅ Configured for Claude Code.");
        successCount++;
    }

    if (updateTomlConfig(CODEX_PATH)) {
        console.log("✅ Configured for Codex.");
        successCount++;
    }

    if (successCount > 0) {
        console.log(`\n🎉 Success! AndroidAgenticWiki is now installed as a plugin in ${successCount} environment(s).`);
        console.log("💡 Restart your CLI or Desktop app to activate your new Android brain.");
    } else {
        console.log("\n⚠️ Could not automatically configure any tools. You may need to set them up manually.");
    }
}

setup();