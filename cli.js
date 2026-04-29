#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] || 'AndroidAgenticWiki';
const targetPath = path.resolve(process.cwd(), targetDir);

console.log("\n🧠 Welcome to the AndroidAgenticWiki Installer!");

if (fs.existsSync(targetPath)) {
    console.error(`\n❌ Error: Directory '${targetDir}' already exists.`);
    console.error(`Please choose a different name, e.g., npx create-android-agentic-wiki my-android-brain`);
    process.exit(1);
}

console.log(`\n🚀 1/4: Cloning AndroidAgenticWiki into ${targetPath}...`);

try {
    execSync(`git clone https://github.com/trinadhthatakula/AndroidAgenticWiki.git "${targetPath}"`, { stdio: 'inherit' });
    
    console.log(`\n📦 2/4: Initializing official Google skills submodules...`);
    execSync(`git submodule update --init --recursive`, { cwd: targetPath, stdio: 'inherit' });
    
    console.log(`\n⚙️ 3/4: Installing dependencies...`);
    execSync(`npm install`, { cwd: targetPath, stdio: 'inherit' });
    
    console.log(`\n🔌 4/4: Running Auto-Setup to connect IDEs...`);
    execSync(`npm run setup`, { cwd: targetPath, stdio: 'inherit' });

    console.log(`\n✅ Successfully installed AndroidAgenticWiki!`);
    console.log(`\n📁 Your local Android brain is located at:`);
    console.log(`   ${targetPath}`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Open Obsidian and open '${targetDir}' as a Vault.`);
    console.log(`   2. Restart your AI Assistant (Claude, Cursor, etc.) to activate the new MCP.`);
    console.log(`   3. Start asking your AI about Android Architecture and UI Standards!\n`);

} catch (error) {
    console.error("\n❌ Installation failed. Please ensure you have Git and Node.js installed.");
    process.exit(1);
}
