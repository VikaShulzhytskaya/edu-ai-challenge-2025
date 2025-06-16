const fs = require('fs');
const path = require('path');
const readlineSync = require('readline-sync');
const chalk = require('chalk');

console.log(chalk.cyan.bold('\n🔧 Service Analyzer Setup\n'));

// Check if config.js already exists
const configPath = path.join(__dirname, 'config.js');
const exampleConfigPath = path.join(__dirname, 'config.example.js');

if (fs.existsSync(configPath)) {
  console.log(chalk.yellow('⚠️  config.js already exists.'));
  const overwrite = readlineSync.question(chalk.cyan('Do you want to overwrite it? (y/n): '));
  
  if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
    console.log(chalk.green('Setup cancelled. Your existing configuration is preserved.'));
    process.exit(0);
  }
}

// Get API key from user
console.log(chalk.white('Please get your OpenAI API key from: https://platform.openai.com/api-keys'));
const apiKey = readlineSync.question(chalk.cyan('\nEnter your OpenAI API key: '), {
  hideEchoBack: true,
  mask: '*'
});

if (!apiKey || apiKey.trim() === '') {
  console.log(chalk.red('❌ API key cannot be empty.'));
  process.exit(1);
}

// Create config.js
const configContent = `// Configuration file for Service Analyzer
module.exports = {
  OPENAI_API_KEY: '${apiKey.trim()}'
};`;

try {
  fs.writeFileSync(configPath, configContent);
  console.log(chalk.green('\n✅ Configuration saved successfully!'));
  console.log(chalk.white('\nYou can now run the application with:'));
  console.log(chalk.cyan('  npm start'));
  console.log(chalk.white('or'));
  console.log(chalk.cyan('  node index.js'));
} catch (error) {
  console.log(chalk.red('❌ Error saving configuration:', error.message));
  process.exit(1);
} 