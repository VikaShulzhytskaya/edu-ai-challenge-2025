# Product Search Tool

A JavaScript console-based product search tool that uses OpenAI's function calling to filter products based on natural language preferences.

## Features

- 🔍 Natural language product search
- 🤖 OpenAI GPT-4 powered preference extraction
- 📊 Structured product filtering
- 💾 JSON-based product database
- 🔒 Secure API key management

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure OpenAI API Key

1. Open `config.js`
2. Replace `'your-openai-api-key-here'` with your actual OpenAI API key
3. Save the file

**Note:** The `config.js` file is gitignored to keep your API key secure.

### 3. Run the Application

```bash
npm start
```

## Usage Examples

The tool accepts natural language queries and extracts filtering criteria automatically:

- **"I need a smartphone under $800 with a great camera and long battery life"**
- **"Show me fitness equipment under $100"**
- **"Kitchen appliances in stock with rating above 4.5"**
- **"Electronics under $200 that are in stock"**
- **"Books with good ratings"**

## Search Criteria

The tool can extract and filter based on:

- **Maximum price** (e.g., "under $800", "less than $200")
- **Minimum rating** (e.g., "great" = 4.5+, "good" = 4.0+)
- **Product categories** (Electronics, Fitness, Kitchen, Books, Clothing)
- **Stock availability** (e.g., "in stock", "available")
- **Keywords** (extracted from product names and descriptions)

## Sample Output

```
🔍 SEARCH RESULTS
==================================================
Query: "I need a smartphone under $800 with great camera"
Found: 2 matching products

Filtered Products:
1. Wireless Headphones - $99.99, Rating: 4.5, ✅ In Stock
2. Smart Watch - $199.99, Rating: 4.6, ✅ In Stock
```

## File Structure

- `search.js` - Main application file
- `products.json` - Product database
- `config.js` - API key configuration (gitignored)
- `package.json` - Project dependencies
- `.gitignore` - Files to exclude from version control

## Requirements

- Node.js (version 14 or higher)
- OpenAI API key
- Internet connection for API calls

## Security

- API keys are stored in `config.js` which is automatically gitignored
- No sensitive information is committed to version control 