import fs from 'fs';
import readline from 'readline';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from './config.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Load products data
let products = [];
try {
  const data = fs.readFileSync('products.json', 'utf8');
  products = JSON.parse(data);
  console.log(`✅ Loaded ${products.length} products from database`);
} catch (error) {
  console.error('❌ Error loading products.json:', error.message);
  process.exit(1);
}

// Tools schema for OpenAI function calling (new format)
const tools = [{
  type: "function",
  name: "filter_products",
  description: "Filter products based on user preferences including price, rating, category, and stock availability",
  parameters: {
    type: "object",
    properties: {
      max_price: {
        type: ["number", "null"],
        description: "Maximum price limit for products"
      },
      min_rating: {
        type: ["number", "null"],
        description: "Minimum rating required for products (0-5 scale)"
      },
      categories: {
        type: ["array", "null"],
        items: {
          type: "string",
          enum: ["Electronics", "Fitness", "Kitchen", "Books", "Clothing"]
        },
        description: "Product categories to include in search"
      },
      in_stock_only: {
        type: ["boolean", "null"],
        description: "Whether to only include products that are in stock"
      },
      keywords: {
        type: ["array", "null"],
        items: {
          type: "string"
        },
        description: "Keywords to match in product names (case-insensitive)"
      }
    },
    required: ["max_price", "min_rating", "categories", "in_stock_only", "keywords"],
    additionalProperties: false
  },
  strict: true
}];

// Function to filter products based on criteria
function filterProducts(criteria) {
  let filtered = [...products];

  // Filter by maximum price
  if (criteria.max_price) {
    filtered = filtered.filter(product => product.price <= criteria.max_price);
  }

  // Filter by minimum rating
  if (criteria.min_rating) {
    filtered = filtered.filter(product => product.rating >= criteria.min_rating);
  }

  // Filter by categories
  if (criteria.categories && criteria.categories.length > 0) {
    filtered = filtered.filter(product => 
      criteria.categories.includes(product.category)
    );
  }

  // Filter by stock availability
  if (criteria.in_stock_only) {
    filtered = filtered.filter(product => product.in_stock);
  }

  // Filter by keywords in product name
  if (criteria.keywords && criteria.keywords.length > 0) {
    filtered = filtered.filter(product => 
      criteria.keywords.some(keyword => 
        product.name.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  return filtered;
}

// Function to format and display results
function displayResults(filteredProducts, userQuery) {
  console.log('\n' + '='.repeat(50));
  console.log('🔍 SEARCH RESULTS');
  console.log('='.repeat(50));
  console.log(`Query: "${userQuery}"`);
  console.log(`Found: ${filteredProducts.length} matching products\n`);

  if (filteredProducts.length === 0) {
    console.log('❌ No products found matching your criteria.');
    console.log('💡 Try adjusting your preferences (price range, rating, categories, etc.)');
    return;
  }

  console.log('Filtered Products:');
  filteredProducts.forEach((product, index) => {
    const stockStatus = product.in_stock ? '✅ In Stock' : '❌ Out of Stock';
    console.log(`${index + 1}. ${product.name} - $${product.price}, Rating: ${product.rating}, ${stockStatus}`);
  });
}

// Main search function using OpenAI function calling
async function searchProducts(userQuery) {
  try {
    console.log('\n🤖 Processing your request with AI...');
    
    const input = [
      {
        role: "system",
        content: `You are a product search assistant. Analyze user queries about product preferences and extract filtering criteria. 
        
        Available categories: Electronics, Fitness, Kitchen, Books, Clothing
        
        Extract the following information:
        - Maximum price (if mentioned)
        - Minimum rating (if mentioned or implied, e.g., "great" = 4.5+, "good" = 4.0+)
        - Product categories (based on context)
        - Stock requirement (if mentioned)
        - Keywords from product names (extract relevant product types, features, or brands)
        
        Be intelligent about interpreting requirements:
        - "smartphone" should include keywords: ["smartphone", "phone"]
        - "under $800" means max_price: 800
        - "great camera" might imply Electronics category and smartphone-related keywords
        - "in stock" means in_stock_only: true`
      },
      {
        role: "user",
        content: userQuery
      }
    ];

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input,
      tools,
    });

    // Extract the function call from the response
    const output = response.output[0];
    
    if (!output || output.name !== 'filter_products') {
      throw new Error('OpenAI did not return the expected function call');
    }

    const criteria = JSON.parse(output.arguments);
    console.log('📋 Extracted criteria:', JSON.stringify(criteria, null, 2));

    // Filter products using the extracted criteria
    const filteredProducts = filterProducts(criteria);
    
    // Display results
    displayResults(filteredProducts, userQuery);

  } catch (error) {
    console.error('❌ Error processing search request:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('💡 Please make sure you have set your OpenAI API key in config.js');
    }
  }
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main application loop
function startSearchTool() {
  console.log('\n🛍️  PRODUCT SEARCH TOOL');
  console.log('='.repeat(40));
  console.log('🔍 Enter your product preferences in natural language');
  console.log('💡 Examples:');
  console.log('   • "I need a smartphone under $800 with great camera"');
  console.log('   • "Show me fitness equipment under $100"');
  console.log('   • "Kitchen appliances in stock with rating above 4.5"');
  console.log('   • "Electronics under $200 that are in stock"');
  console.log('\n📝 Type "exit" to quit\n');

  function promptUser() {
    rl.question('🔍 Enter your search query: ', async (query) => {
      if (query.toLowerCase().trim() === 'exit') {
        console.log('\n👋 Thank you for using the Product Search Tool!');
        rl.close();
        return;
      }

      if (query.trim() === '') {
        console.log('❌ Please enter a valid search query.');
        promptUser();
        return;
      }

      await searchProducts(query);
      console.log('\n' + '-'.repeat(50));
      promptUser();
    });
  }

  promptUser();
}

// Start the application
startSearchTool(); 