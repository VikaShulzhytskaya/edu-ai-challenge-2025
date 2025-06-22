#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Load configuration
let config;
try {
  config = require('./config.js');
} catch (error) {
  console.error('❌ Error: config.js file not found.');
  console.error('Please copy config.example.js to config.js and set your OpenAI API key.');
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

class AudioTranscriptionApp {
  constructor() {
    this.validateEnvironment();
  }

  validateEnvironment() {
    if (!config.OPENAI_API_KEY || config.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.error('❌ Error: OpenAI API key is not configured.');
      console.error('Please set your API key in config.js file.');
      process.exit(1);
    }
  }

  async transcribeAudio(audioFilePath) {
    try {
      console.log('🎵 Transcribing audio file...');
      
      // Check if file exists
      if (!fs.existsSync(audioFilePath)) {
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }

      // Create a readable stream from the audio file
      const audioStream = fs.createReadStream(audioFilePath);
      
      // Call OpenAI Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: audioStream,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });

      console.log('✅ Audio transcription completed successfully!');
      return transcription;
    } catch (error) {
      console.error('❌ Error during transcription:', error.message);
      throw error;
    }
  }

  async summarizeText(text) {
    try {
      console.log('📝 Generating summary...');
      
      const response = await openai.responses.create({
        model: 'gpt-4.1-mini',
        input: `Please provide a clear and concise summary of the following transcription. Focus on key points, main topics, and important insights:\n\n${text}`,
        max_output_tokens: 500,
        temperature: 0.3
      });

      console.log('✅ Summary generated successfully!');
      return response.output_text;
    } catch (error) {
      console.error('❌ Error during summarization:', error.message);
      throw error;
    }
  }

  async calculateAnalytics(transcription) {
    console.log('📊 Calculating analytics...');
    
    const text = transcription.text;
    const duration = transcription.duration; // in seconds
    
    // Calculate word count
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCount = words.length;
    
    // Calculate speaking speed (WPM)
    const speakingSpeedWPM = Math.round((wordCount / duration) * 60);
    
    // Extract frequently mentioned topics (now async)
    const topicKeywords = await this.extractTopics(text);
    
    const analytics = {
      word_count: wordCount,
      speaking_speed_wpm: speakingSpeedWPM,
      duration_seconds: Math.round(duration),
      frequently_mentioned_topics: topicKeywords
    };

    console.log('✅ Analytics calculated successfully!');
    return analytics;
  }

  async extractTopics(text) {
    try {
      console.log('🔍 Extracting meaningful topics using AI...');
      
      // Use AI to extract meaningful topics instead of simple word counting
      const response = await openai.responses.create({
        model: 'gpt-4.1-mini',
        input: `Analyze the following transcription and identify the 3-5 most important and meaningful topics or themes discussed. 
        
Guidelines:
- Focus on substantial topics, not conversational filler words
- Ignore words like "yeah", "okay", "like", "um", "right", "you know", etc.
- Look for business concepts, technical terms, project names, important subjects
- Each topic should be a meaningful concept or theme, not just common words
- Return topics that someone would genuinely care about when reviewing this content

Transcription:
${text}

Please respond with ONLY a JSON array in this exact format:
[
  {"topic": "Topic Name", "mentions": number_of_mentions},
  {"topic": "Another Topic", "mentions": number_of_mentions}
]

Make sure the JSON is valid and contains no additional text.`,
        max_output_tokens: 300,
        temperature: 0.1
      });

      // Parse the AI response
      let topics = [];
      try {
        const cleanedResponse = response.output_text.trim();
        // Extract JSON from the response if it contains extra text
        const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        const jsonStr = jsonMatch ? jsonMatch[0] : cleanedResponse;
        topics = JSON.parse(jsonStr);
        
        // Validate the response format
        if (!Array.isArray(topics)) {
          throw new Error('Response is not an array');
        }
        
        // Ensure each topic has the required format
        topics = topics.filter(topic => 
          topic && 
          typeof topic.topic === 'string' && 
          typeof topic.mentions === 'number' &&
          topic.topic.trim().length > 0
        ).slice(0, 5); // Limit to 5 topics max
        
      } catch (parseError) {
        console.log('⚠️  AI topic extraction failed, falling back to basic extraction');
        // Fallback to a simple but better approach
        topics = this.extractTopicsBasic(text);
      }

      console.log('✅ Topics extracted successfully');
      return topics;
      
    } catch (error) {
      console.log('⚠️  AI topic extraction failed, using basic extraction');
      return this.extractTopicsBasic(text);
    }
  }

  extractTopicsBasic(text) {
    // Improved basic topic extraction as fallback
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    // Enhanced stop words including conversational filler
    const stopWords = new Set([
      // Basic stop words
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
      'what', 'which', 'who', 'when', 'where', 'why', 'how', 'so', 'very', 'just', 'now',
      'then', 'than', 'too', 'only', 'also', 'back', 'first', 'well', 'way', 'even',
      'new', 'old', 'good', 'bad', 'right', 'wrong', 'big', 'small', 'long', 'short',
      'high', 'low', 'hot', 'cold', 'fast', 'slow', 'up', 'down', 'out', 'off', 'over',
      'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
      'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
      
      // Conversational filler words
      'yeah', 'yes', 'yep', 'okay', 'ok', 'alright', 'right', 'like', 'um', 'uh', 'hmm',
      'well', 'actually', 'basically', 'literally', 'totally', 'really', 'super', 'pretty',
      'kind', 'sort', 'thing', 'stuff', 'things', 'gonna', 'wanna', 'gotta', 'lemme',
      'nope', 'nah', 'sure', 'definitely', 'absolutely', 'exactly', 'obviously',
      'probably', 'maybe', 'perhaps', 'anyway', 'anyways', 'mean', 'guess', 'think',
      'know', 'see', 'look', 'listen', 'wait', 'hold', 'stop', 'start', 'go', 'come'
    ]);

    // Count meaningful words only (longer words, not in stop list)
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 4 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Get top words with higher frequency threshold
    const topics = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .filter(([word, count]) => count >= 3) // Higher threshold
      .slice(0, 5)
      .map(([topic, mentions]) => ({
        topic: this.formatTopic(topic),
        mentions
      }));

    return topics.length > 0 ? topics : [{ topic: "General Discussion", mentions: 1 }];
  }



  formatTopic(topic) {
    return topic.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async saveTranscription(transcription, audioFileName) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseFileName = path.basename(audioFileName, path.extname(audioFileName));
      const fileName = `transcription_${baseFileName}_${timestamp}.md`;
      
      const content = `# Audio Transcription\n\n` +
        `**Source File:** ${audioFileName}\n` +
        `**Transcription Date:** ${new Date().toLocaleString()}\n` +
        `**Duration:** ${Math.round(transcription.duration)} seconds\n\n` +
        `## Transcription\n\n` +
        `${transcription.text}\n\n` +
        `---\n\n` +
        `*Generated using OpenAI Whisper API*`;

      fs.writeFileSync(fileName, content, 'utf8');
      console.log(`✅ Transcription saved to: ${fileName}`);
      return fileName;
    } catch (error) {
      console.error('❌ Error saving transcription:', error.message);
      throw error;
    }
  }

  displayResults(summary, analytics, transcriptionFile) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 TRANSCRIPTION COMPLETE');
    console.log('='.repeat(60));
    
    console.log('\n📄 SUMMARY:');
    console.log('-'.repeat(40));
    console.log(summary);
    
    console.log('\n📊 ANALYTICS:');
    console.log('-'.repeat(40));
    console.log(JSON.stringify(analytics, null, 2));
    
    console.log('\n💾 FILES CREATED:');
    console.log('-'.repeat(40));
    console.log(`• Transcription: ${transcriptionFile}`);
    
    console.log('\n' + '='.repeat(60));
  }

  async processAudio(audioFilePath) {
    try {
      console.log('🚀 Starting audio processing...');
      console.log(`📁 Processing file: ${audioFilePath}`);
      
      // Step 1: Transcribe audio
      const transcription = await this.transcribeAudio(audioFilePath);
      
      // Step 2: Generate summary
      const summary = await this.summarizeText(transcription.text);
      
      // Step 3: Calculate analytics
      const analytics = await this.calculateAnalytics(transcription);
      
      // Step 4: Save transcription
      const transcriptionFile = await this.saveTranscription(transcription, audioFilePath);
      
      // Step 5: Display results
      this.displayResults(summary, analytics, transcriptionFile);
      
    } catch (error) {
      console.error('\n❌ Application Error:', error.message);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎵 Audio Transcription & Summarization App');
    console.log('Usage: node index.js <audio-file-path>');
    console.log('');
    console.log('Example:');
    console.log('  node index.js ./audio/meeting.mp3');
    console.log('  node index.js ./audio/interview.wav');
    console.log('');
    console.log('Supported formats: mp3, wav, m4a, flac, ogg, and more');
    process.exit(1);
  }

  const audioFilePath = args[0];
  const app = new AudioTranscriptionApp();
  await app.processAudio(audioFilePath);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AudioTranscriptionApp; 