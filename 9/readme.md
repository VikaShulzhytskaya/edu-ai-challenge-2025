# Service Analyzer

A lightweight JavaScript console application that generates comprehensive, markdown-formatted reports for digital services and products using AI analysis.

## Features

- **Dual Input Mode**: Analyze by service name (e.g., "Spotify", "Notion")
- **Comprehensive Analysis**: Generates reports with 8 key sections covering business, technical, and user perspectives
- **AI-Powered**: Uses OpenAI's GPT model for intelligent analysis and insights
- **Beautiful Console Interface**: Colorful, user-friendly command-line interface
- **Report Export**: Save generated reports as markdown files with timestamps
- **Secure Configuration**: API keys stored separately and excluded from version control

## Report Sections

Each generated report includes:

1. **Brief History** - Founding year, milestones, key developments
2. **Target Audience** - Primary user segments and demographics
3. **Core Features** - Top 2-4 key functionalities
4. **Unique Selling Points** - Key differentiators and competitive advantages
5. **Business Model** - Revenue streams and pricing strategy
6. **Tech Stack Insights** - Known technologies and technical architecture
7. **Perceived Strengths** - Commonly praised aspects and advantages
8. **Perceived Weaknesses** - Known limitations and areas for improvement

## Prerequisites

- Node.js (v14 or higher)
- OpenAI API key

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your OpenAI API key:
   
   **Option A: Using the setup script (recommended):**
   ```bash
   npm run setup
   ```
   
   **Option B: Manual setup:**
   ```bash
   cp config.example.js config.js
   ```
   Then edit `config.js` and add your actual OpenAI API key:
   ```javascript
   module.exports = {
     OPENAI_API_KEY: 'your-actual-api-key-here'
   };
   ```

## Usage

### Quick Start

1. First-time setup:
   ```bash
   npm run setup
   ```

2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node index.js
   ```

### Interactive Mode

The application provides an interactive menu with three options:

1. **Analyze by Service Name**: Enter a known service name like "Spotify", "Notion", "Netflix", etc.
2. **Exit**: Close the application

### Example Usage

```
🚀 Service Analyzer - Comprehensive Digital Service Reports

Choose an option:
1. Analyze by service name (e.g., Spotify, Notion)
2. Exit

Enter your choice (1, 2): 1
Enter service name: Spotify
🔍 Analyzing service...

📊 Analysis Complete!
[Generated markdown report displayed here]

Save report to file? (y/n): y
✅ Report saved to: reports/Spotify_2024-01-15T10-30-45-123Z.md

Analyze another service? (y/n): n
👋 Thanks for using Service Analyzer!
```

## Configuration

### API Key Setup

1. Copy `config.example.js` to `config.js`
2. Replace `'your-openai-api-key-here'` with your actual OpenAI API key
3. The `config.js` file is automatically ignored by Git for security

### OpenAI API Key

You can get an OpenAI API key from:
- Visit [OpenAI Platform](https://platform.openai.com/)
- Create an account or sign in
- Navigate to API Keys section
- Generate a new API key

## File Structure

```
service-analyzer/
├── index.js              # Main application file
├── package.json          # Dependencies and scripts
├── config.example.js     # Configuration template
├── config.js            # Your actual config (not tracked by Git)
├── .gitignore           # Git ignore rules
├── README.md            # This file
└── reports/             # Generated reports (auto-created)
    ├── Spotify_2024-01-15T10-30-45-123Z.md
    └── Notion_2024-01-15T11-15-30-456Z.md
```

## Error Handling

The application includes comprehensive error handling for:
- Missing configuration files
- Invalid OpenAI API keys
- Network connectivity issues
- Invalid user input
- File system errors

## Security Features

- API keys stored in separate configuration file
- Configuration file excluded from version control
- No sensitive data logged to console
- Secure file handling for report generation

## Dependencies

- **openai**: ^4.24.0 - OpenAI API client
- **readline-sync**: ^1.4.10 - Synchronous user input
- **chalk**: ^4.1.2 - Terminal colors and styling
- **fs**: ^0.0.1-security - File system operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check the error messages - they usually provide clear guidance
2. Ensure your OpenAI API key is valid and has sufficient credits
3. Verify your internet connection for API calls
4. Check that Node.js version is 14 or higher

## Example Output

Here's what a typical analysis report looks like:

```markdown
## Brief History
- Founded in 2006 by Daniel Ek and Martin Lorentzon in Stockholm, Sweden
- Launched publicly in 2008 as a freemium music streaming service
- IPO in 2018 on the New York Stock Exchange
- Major milestones include reaching 100M users (2016), 500M users (2022)

## Target Audience
- Music enthusiasts across all age groups
- Primary focus on 18-34 demographic
- Both casual listeners and music discovery enthusiasts
- Artists and podcasters as content creators

[... additional sections ...]
```

## Troubleshooting

### Common Issues

1. **"config.js file not found"**
   - Copy `config.example.js` to `config.js` and add your API key

2. **"OpenAI API Error"**
   - Verify your API key is correct and active
   - Check your OpenAI account has sufficient credits

3. **"Module not found"**
   - Run `npm install` to install dependencies

4. **Permission errors when saving reports**
   - Ensure write permissions in the application directory
