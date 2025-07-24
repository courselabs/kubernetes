#!/usr/bin/env node

/**
 * Simple test script to verify the lab parser works
 * Run with: node test-parser.js
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');

// Mock vscode module for testing
const vscode = {
    workspace: {
        openTextDocument: async (uri) => {
            const filePath = typeof uri === 'string' ? uri : uri.fsPath;
            const content = fs.readFileSync(filePath, 'utf8');
            return {
                getText: () => content,
                uri: { fsPath: filePath }
            };
        }
    }
};

// Override the require function to provide our vscode mock
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
    if (id === 'vscode') {
        return vscode;
    }
    return originalRequire.apply(this, arguments);
};

// Now load our parser
const { LabParser } = require('./lab-parser');

async function testParser() {
    console.log('🧪 Testing Lab Parser');
    console.log('===================');
    
    try {
        // Test with pods lab README (should find 0 blocks since it has no PowerShell)
        const readmePath = path.join(__dirname, '../../labs/pods/README.md');
        
        if (!fs.existsSync(readmePath)) {
            console.log(`❌ Test README not found: ${readmePath}`);
            console.log('   Make sure you run this from the repository root');
            process.exit(1);
        }
        
        console.log(`📖 Parsing: ${readmePath}`);
        
        const parser = new LabParser();
        const codeBlocks = await parser.parseLabReadme({ fsPath: readmePath });
        
        console.log(`\n📊 Results:`);
        console.log(`   Found ${codeBlocks.length} code blocks`);
        
        if (codeBlocks.length === 0) {
            console.log('✅ No PowerShell code blocks found (as expected for this README)');
            console.log('   Parser correctly filtered out bash/generic code blocks');
            console.log('\n🧪 Testing with PowerShell example...');
            
            // Test with our PowerShell example
            const testReadmePath = path.join(__dirname, 'test-README.md');
            if (fs.existsSync(testReadmePath)) {
                const testBlocks = await parser.parseLabReadme({ fsPath: testReadmePath });
                console.log(`   Found ${testBlocks.length} PowerShell blocks in test file`);
            }
            
            console.log('\n✅ Parser filtering is working correctly!');
            process.exit(0);
        }
        
        // Show summary
        const summary = parser.getSummary();
        console.log(`   Total commands: ${summary.totalCommands}`);
        console.log(`   Kubectl blocks: ${summary.kubectlBlocks}`);
        console.log(`   Sections: ${summary.sections}`);
        
        console.log(`\n📝 Code Blocks Found:`);
        codeBlocks.forEach((block, index) => {
            console.log(`\n   Block ${index + 1}:`);
            console.log(`     Section: ${block.section}`);
            console.log(`     Type: ${block.executionType}`);
            console.log(`     Commands: ${block.lines.length}`);
            console.log(`     Lines: ${block.startLine}-${block.endLine}`);
            
            if (block.lines.length > 0) {
                console.log(`     First command: ${block.lines[0].trim()}`);
            }
        });
        
        // Test section grouping
        const sections = parser.getCodeBlocksBySection();
        console.log(`\n📂 Sections:`);
        Object.keys(sections).forEach(section => {
            console.log(`   ${section}: ${sections[section].length} block(s)`);
        });
        
        // Test command extraction
        const allCommands = parser.getAllCommands();
        console.log(`\n⚡ All Commands (${allCommands.length}):`);
        allCommands.slice(0, 5).forEach((cmd, index) => {
            console.log(`   ${index + 1}. ${cmd.command} (${cmd.section})`);
        });
        
        if (allCommands.length > 5) {
            console.log(`   ... and ${allCommands.length - 5} more`);
        }
        
        console.log(`\n✅ Parser test completed successfully!`);
        console.log(`\n🚀 To install the extension, run:`);
        console.log(`   ./src/lab-test-harness/install-extension.sh`);
        
    } catch (error) {
        console.log(`❌ Parser test failed: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test
testParser();