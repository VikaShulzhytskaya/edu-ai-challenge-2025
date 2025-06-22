# Audio Transcription & Summarization App

A Node.js console application that transcribes audio files using OpenAI's Whisper API and generates summaries and analytics using GPT-4.

## Features

- 🎵 **Audio Transcription**: Transcribe any audio file using OpenAI's Whisper-1 model
- 📝 **Text Summarization**: Generate concise summaries using GPT-4o-mini
- 📊 **Analytics**: Extract valuable insights including:
  - Total word count
  - Speaking speed (words per minute)
  - Frequently mentioned topics with mention counts
- 💾 **File Management**: Save transcriptions to separate markdown files
- 🔍 **Console Output**: Display results directly in the terminal

## Requirements

- Node.js (version 14.0.0 or higher)
- OpenAI API key with access to Whisper and GPT-4 models
- Audio file in supported format (mp3, wav, m4a, flac, ogg, etc.)

## Installation

1. **Clone or download the project files**
   ```bash
   # If you have git
   git clone <repository-url>
   cd audio-transcription-app
   
   # Or simply download the files to your project directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up configuration**
   ```bash
   # Copy the example configuration file
   cp config.example.js config.js
   
   # Edit config.js and add your OpenAI API key
   # Replace 'your_openai_api_key_here' with your actual API key
   ```

4. **Get your OpenAI API key**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in to your account
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key and paste it in your `config.js` file

## Usage

### Basic Usage

```bash
node index.js path/to/your/audio/file.mp3
```

### Examples

```bash
# Transcribe a meeting recording
node index.js ./audio/team-meeting.mp3

# Process an interview
node index.js ./recordings/interview.wav

# Analyze a podcast episode
node index.js /path/to/podcast/episode.m4a
```

### Npm Script

You can also use the npm script:

```bash
npm start path/to/your/audio/file.mp3
```

## Supported Audio Formats

The application supports all audio formats supported by OpenAI's Whisper API:
- MP3
- WAV
- M4A
- FLAC
- OGG
- WEBM
- And many more...

## Output

The application provides three types of output:

### 1. Console Display
Real-time progress updates and final results displayed in the terminal.

### 2. Transcription File
A markdown file saved with the naming pattern:
```
transcription_[filename]_[timestamp].md
```

### 3. Analytics JSON
Displayed in the console with the following structure:
```json
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "duration_seconds": 600,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 }
  ]
}
```

## Example Output

```
🚀 Starting audio processing...
📁 Processing file: ./audio/meeting.mp3
🎵 Transcribing audio file...
✅ Audio transcription completed successfully!
📝 Generating summary...
✅ Summary generated successfully!
📊 Calculating analytics...
✅ Analytics calculated successfully!
✅ Transcription saved to: transcription_meeting_2024-01-15T10-30-45-123Z.md

============================================================
🎯 TRANSCRIPTION COMPLETE
============================================================

📄 SUMMARY:
----------------------------------------
The meeting focused on customer onboarding improvements and Q4 roadmap planning. Key discussions included implementing AI integration features, streamlining the user experience, and setting quarterly goals for the development team.

📊 ANALYTICS:
----------------------------------------
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "duration_seconds": 600,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 }
  ]
}

💾 FILES CREATED:
----------------------------------------
• Transcription: transcription_meeting_2024-01-15T10-30-45-123Z.md

============================================================
```

## Configuration

### Configuration File

Create a `config.js` file by copying `config.example.js`:

```javascript
module.exports = {
  OPENAI_API_KEY: 'your_actual_api_key_here',
};
```

### API Models Used

- **Whisper-1**: For audio transcription
- **GPT-4o-mini**: For text summarization (cost-effective and fast)

## Troubleshooting

### Common Issues

1. **"OpenAI API key is not configured"**
   - Ensure you have created a `config.js` file from `config.example.js`
   - Verify your API key is correctly set in the `config.js` file
   - Make sure the `config.js` file is in the same directory as `index.js`

2. **"Audio file not found"**
   - Check the file path is correct
   - Ensure the audio file exists
   - Try using absolute path if relative path doesn't work

3. **"Insufficient quota" or API errors**
   - Verify your OpenAI account has sufficient credits
   - Check your API key permissions
   - Ensure your account has access to Whisper and GPT-4 models

4. **Large file processing**
   - OpenAI Whisper API has a 25MB file size limit
   - For larger files, consider compressing or splitting the audio

### File Size Limits

- Maximum file size: 25MB (OpenAI Whisper API limit)
- For larger files, consider using audio compression tools

## Cost Considerations

- **Whisper API**: $0.006 per minute of audio
- **GPT-4o-mini**: Very cost-effective for text summarization
- Example: 10-minute audio ≈ $0.06 + minimal cost for summarization

## Security

- Never commit your `config.js` file to version control
- Keep your OpenAI API key confidential
- The `config.js` file is included in `.gitignore` for security

## Project Structure

```
audio-transcription-app/
├── index.js              # Main application file
├── package.json          # Dependencies and scripts
├── README.md            # This file
├── config.example.js    # Configuration template
├── config.js            # Your actual configuration (not in git)
└── transcription_*.md   # Generated transcription files
```

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues with the application:
1. Check the troubleshooting section above
2. Verify your OpenAI API key and account status
3. Ensure all dependencies are installed correctly

For OpenAI API issues:
- Visit [OpenAI Platform Status](https://status.openai.com/)
- Check [OpenAI Documentation](https://platform.openai.com/docs/) 