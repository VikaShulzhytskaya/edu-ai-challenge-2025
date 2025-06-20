const { OpenAI } = require('openai');
const readlineSync = require('readline-sync');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Try to load configuration
let config;
try {
  config = require('./config.js');
} catch (error) {
  console.log(chalk.red('❌ Error: config.js file not found!'));
  console.log(chalk.yellow('Please copy config.example.js to config.js and add your OpenAI API key.'));
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

class ServiceAnalyzer {
  constructor() {
    this.reportTemplate = {
      briefHistory: 'Brief History',
      targetAudience: 'Target Audience',
      coreFeatures: 'Core Features',
      uniqueSellingPoints: 'Unique Selling Points',
      businessModel: 'Business Model',
      techStackInsights: 'Tech Stack Insights',
      perceivedStrengths: 'Perceived Strengths',
      perceivedWeaknesses: 'Perceived Weaknesses'
    };
  }

  async analyzeService(input, isDescription = false) {
    try {
      console.log(chalk.blue('🔍 Analyzing service...'));
      
      const prompt = this.buildAnalysisPrompt(input, isDescription);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "You are a comprehensive business and technology analyst specializing in digital services and products. Provide detailed, accurate, and well-structured analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  }

  buildAnalysisPrompt(input, isDescription = false) {
    let basePrompt = '';
    
    if (isDescription) {
      basePrompt = `
Please provide a comprehensive analysis based on the following service description:

"${input}"

Structure your response as a detailed markdown report with exactly these sections:
`;
    } else {
      basePrompt = `
Please provide a comprehensive analysis of the service ${input}

Structure your response as a detailed markdown report with exactly these sections:
`;
    }

    basePrompt += `
## Brief History
- Founding year, key milestones, major developments
- Important acquisitions, funding rounds, or pivotal moments

## Target Audience
- Primary user segments and demographics
- Use cases and customer personas
- Market positioning

## Core Features
- Top 2-4 key functionalities that define the service
- What users primarily use it for
- Core value propositions

## Unique Selling Points
- Key differentiators from competitors
- What makes this service stand out
- Competitive advantages

## Business Model
- Primary revenue streams
- How the service makes money
- Pricing strategy overview

## Tech Stack Insights
- Known technologies, platforms, or frameworks used
- Technical architecture insights (if publicly known)
- Development approach or technical philosophy

## Perceived Strengths
- Commonly mentioned positive aspects
- What users and experts praise
- Market advantages

## Perceived Weaknesses
- Known limitations or criticisms
- Areas for improvement
- Common user complaints or challenges

Please ensure each section is substantial and informative. Use bullet points where appropriate for clarity.
`;

    return basePrompt;
  }

  formatMarkdownReport(content) {
    // Add some formatting enhancements
    let formattedContent = content;
    
    // Ensure proper spacing around headers
    formattedContent = formattedContent.replace(/^(##?\s+)/gm, '\n$1');
    
    // Clean up any excessive newlines
    formattedContent = formattedContent.replace(/\n{3,}/g, '\n\n');
    
    return formattedContent.trim();
  }

  async saveReport(content, serviceName) {
    const reportsDir = path.join(__dirname, 'reports');
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${serviceName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.md`;
    const filepath = path.join(reportsDir, filename);

    fs.writeFileSync(filepath, content);
    return filepath;
  }

  displayWelcome() {
    console.log(chalk.cyan.bold('\n🚀 Service Analyzer - Comprehensive Digital Service Reports\n'));
    console.log(chalk.white('This tool generates detailed analysis reports for digital services and products.'));
    console.log(chalk.white('You can analyze by service name (e.g., "Spotify").\n'));
  }

  displayReport(content) {
    console.log(chalk.green('\n📊 Analysis Complete!\n'));
    console.log(chalk.gray('='.repeat(80)));
    console.log(content);
    console.log(chalk.gray('='.repeat(80)));
  }

  async run() {
    this.displayWelcome();

    while (true) {
      try {
        console.log(chalk.yellow('\nChoose an option:'));
        console.log('1. Analyze by service name (e.g., Spotify, Notion)');
        console.log('2. Analyze by service description');
        console.log('3. Exit');

        const choice = readlineSync.question(chalk.cyan('\nEnter your choice (1, 2, 3): '));

        if (choice === '3') {
          console.log(chalk.green('\n👋 Thanks for using Service Analyzer!'));
          break;
        }

        let input, serviceName, isDescription = false;

        if (choice === '1') {
          input = readlineSync.question(chalk.cyan('Enter service name: '));
          serviceName = input;
        } else if (choice === '2') {
          input = readlineSync.question(chalk.cyan('Enter service description: '));
          serviceName = input;
          isDescription = true;
        } else {
          console.log(chalk.red('Invalid choice. Please try again.'));
          continue;
        }

        if (!input.trim()) {
          console.log(chalk.red('Input cannot be empty. Please try again.'));
          continue;
        }

        // Generate analysis
        const analysis = await this.analyzeService(input, isDescription);
        const formattedReport = this.formatMarkdownReport(analysis);

        // Display the report
        this.displayReport(formattedReport);

        // Ask if user wants to save the report
        const saveChoice = readlineSync.question(chalk.cyan('\nSave report to file? (y/n): '));
        if (saveChoice.toLowerCase() === 'y' || saveChoice.toLowerCase() === 'yes') {
          const filepath = await this.saveReport(formattedReport, serviceName);
          console.log(chalk.green(`✅ Report saved to: ${filepath}`));
        }

        // Ask if user wants to continue
        const continueChoice = readlineSync.question(chalk.cyan('\nAnalyze another service? (y/n): '));
        if (continueChoice.toLowerCase() !== 'y' && continueChoice.toLowerCase() !== 'yes') {
          console.log(chalk.green('\n👋 Thanks for using Service Analyzer!'));
          break;
        }

      } catch (error) {
        console.log(chalk.red(`\n❌ Error: ${error.message}`));
        console.log(chalk.yellow('Please check your configuration and try again.\n'));
      }
    }
  }
}

// Main execution
if (require.main === module) {
  const analyzer = new ServiceAnalyzer();
  analyzer.run().catch(error => {
    console.error(chalk.red('Fatal error:', error.message));
    process.exit(1);
  });
}

module.exports = ServiceAnalyzer; 