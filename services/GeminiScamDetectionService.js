import { GoogleGenerativeAI } from "@google/generative-ai";
import config from '../config/config';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Audio } from 'expo-av';

class GeminiScamDetectionService {
  constructor() {
    // Initialize Gemini AI with API key from config
    const apiKey = config.geminiApiKey || 'AIzaSyCglgEYdpjPkxJQBkqKylkYeVrDQ2bOzLs';
    if (!apiKey) {
      console.error('Gemini API key not found in configuration');
      throw new Error('Gemini API key not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize the tuned model for advanced phishing detection
    this.tunedApiKey = 'AIzaSyBPx0h6KXEnLz1va0T9aRiem4WVHxD79IM';
    this.tunedGenAI = new GoogleGenerativeAI(this.tunedApiKey);
    
    // Use gemini-2.0-flash-exp model for text, image, and audio analysis
    // Adjusted temperature and sampling parameters to reduce overfitting
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3,  // Increased for more diverse responses
        topK: 50,         // Increased for broader token sampling
        topP: 0.85,       // Adjusted for better balance
        maxOutputTokens: 1024,
      }
    });

    // Initialize tuned model for advanced phishing detection
    // Different parameters for the specialized model
    this.tunedModel = this.tunedGenAI.getGenerativeModel({
      model: "tunedModels/phishingdetectionlabeled-l90v9zunmfix",
      generationConfig: {
        temperature: 0.25,  // Slightly lower for specialized detection
        topK: 45,          // Balanced sampling
        topP: 0.9,         // Higher precision for specialized cases
        maxOutputTokens: 1024,
      }
    });

    // Configuration for confidence thresholds and ensemble decision making
    this.config = {
      minimumConfidenceThreshold: 0.75,    // Minimum confidence to consider a detection valid
      crossValidationThreshold: 0.6,       // Threshold for cross-model validation
      ensembleWeights: {
        standardModel: 0.4,
        tunedModel: 0.6
      }
    };

    // Initialize Audio Recording
    this.recording = null;
  }

  async analyzeContent(content) {
    try {
      console.log('Preparing text content for scam analysis...');
      
      // Run both models in parallel for ensemble decision making
      const [standardResult, tunedResult] = await Promise.all([
        this.analyzeWithStandardModel(content),
        this.analyzeWithTunedModel(content)
      ]);

      // Calculate ensemble decision
      const ensembleDecision = this.makeEnsembleDecision(standardResult, tunedResult);
      
      // Cross-validate results between models
      const isCrossValidated = this.crossValidateResults(standardResult, tunedResult);
      
      // Prepare final analysis with confidence metrics
      const finalAnalysis = {
        isScam: ensembleDecision.isScam,
        confidence: ensembleDecision.confidence,
        reason: this.combineReasons(standardResult, tunedResult),
        crossValidated: isCrossValidated,
        detectedTactics: tunedResult.detectedTactics || [],
        modelResults: {
          standard: {
            isScam: standardResult.isScam,
            confidence: standardResult.confidence || 0
          },
          tuned: {
            isScam: tunedResult.isScam,
            confidence: tunedResult.confidence || 0
          }
        }
      };

      // Only mark as scam if confidence meets threshold
      if (finalAnalysis.confidence < this.config.minimumConfidenceThreshold) {
        finalAnalysis.isScam = false;
        finalAnalysis.reason = `Insufficient confidence (${finalAnalysis.confidence.toFixed(2)}) to mark as scam. ${finalAnalysis.reason}`;
      }

      return finalAnalysis;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to analyze content with Gemini: ' + error.message);
    }
  }

  makeEnsembleDecision(standardResult, tunedResult) {
    const weights = this.config.ensembleWeights;
    
    // Calculate weighted confidence
    const standardConfidence = (standardResult.confidence || 0) * weights.standardModel;
    const tunedConfidence = (tunedResult.confidence || 0) * weights.tunedModel;
    const totalConfidence = standardConfidence + tunedConfidence;
    
    // Weighted decision
    const isScam = totalConfidence >= this.config.minimumConfidenceThreshold;
    
    return {
      isScam,
      confidence: totalConfidence
    };
  }

  crossValidateResults(standardResult, tunedResult) {
    // Check if both models agree on classification
    const agreementScore = standardResult.isScam === tunedResult.isScam ? 1 : 0;
    
    // Check confidence alignment
    const confidenceDiff = Math.abs(
      (standardResult.confidence || 0) - (tunedResult.confidence || 0)
    );
    
    // Calculate cross-validation score
    const crossValidationScore = agreementScore * (1 - confidenceDiff);
    
    return crossValidationScore >= this.config.crossValidationThreshold;
  }

  combineReasons(standardResult, tunedResult) {
    return `Standard Analysis: ${standardResult.reason}\nSpecialized Analysis: ${tunedResult.reason}`;
  }

  async analyzeWithStandardModel(content) {
    const prompt = `You are an AI designed to detect scams and phishing attempts. Analyze the following content and determine if it's a scam.
Be conservative in your assessment and avoid overfitting to known patterns.

"${content}"

Consider these indicators, but don't overweight any single factor:
- Urgency or threats
- Requests for sensitive information
- Suspicious sender claims
- Grammar and spelling (but consider ESL writers)
- Offers and promises
- Context and plausibility

IMPORTANT: Return a valid JSON object with confidence score:

{
  "isScam": false,
  "confidence": 0.0,
  "reason": "Detailed explanation with balanced analysis"
}`;

    console.log('Sending request to standard Gemini model...');
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.parseResponse(response.text().trim(), 'text');
  }

  async analyzeWithTunedModel(content) {
    const prompt = `Analyze this content for advanced phishing patterns while avoiding overfitting.
Consider the full context and avoid false positives.

"${content}"

Evaluate multiple aspects:
- Social engineering tactics (but consider legitimate urgent communications)
- Impersonation attempts (but consider authorized representatives)
- Context-aware manipulation (but consider legitimate personalization)
- Attack patterns (but avoid overfitting to known patterns)
- Business context (but consider various communication styles)
- Industry-specific elements (but avoid rigid pattern matching)

Return a balanced analysis in JSON format:
{
  "isScam": false,
  "confidence": 0.0,
  "reason": "Nuanced analysis considering multiple factors",
  "detectedTactics": ["list", "of", "confirmed", "tactics"]
}`;

    console.log('Sending request to tuned Gemini model...');
    const result = await this.tunedModel.generateContent(prompt);
    const response = await result.response;
    return this.parseResponse(response.text().trim(), 'text');
  }

  async analyzeImage(imageUri) {
    try {
      console.log('Preparing image for scam analysis:', imageUri);
      
      // Validate the image URI
      if (!imageUri || typeof imageUri !== 'string') {
        throw new Error('Invalid image URI provided');
      }
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error(`File does not exist at path: ${imageUri}`);
      }
      
      // Compress the image first
      const compressedUri = await this.compressImage(imageUri);
      
      // Convert image to base64
      const base64Image = await this.getBase64FromUri(compressedUri);
      if (!base64Image) {
        throw new Error('Failed to convert image to base64');
      }
      
      // Create the image part for the model
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: this.getMimeTypeFromUri(compressedUri)
        }
      };
      
      const prompt = `Analyze this image and determine if it contains any scam indicators, phishing attempts, or suspicious content.

Look for:
- QR codes that might lead to malicious websites
- Fake login forms or websites
- Suspicious offers or promotions
- Signs of counterfeit products or services
- Suspicious branding or logos that might be impersonating legitimate companies
- Any visual elements designed to trick users

IMPORTANT: You must return a valid JSON object with no additional text, markdown formatting, or explanation. The response must start with '{' and end with '}'. Use this exact format:

{
  "isScam": false,
  "reason": "Detailed explanation of your analysis and why this image is or isn't suspicious",
  "detectedElements": "List of main elements detected in the image"
}

Do not include any text before or after the JSON object. Do not use markdown backticks or json tags.`;

      console.log('Sending request to Gemini API for image analysis...');
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const textResponse = response.text().trim();
      
      console.log('Received image analysis from Gemini');
      
      return this.parseResponse(textResponse, 'image');
    } catch (error) {
      console.error('Gemini API Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Image URI attempted:', imageUri);
      throw new Error('Failed to analyze image with Gemini: ' + error.message);
    }
  }

  async transcribeAudio(audioUri) {
    try {
      console.log('Processing audio file:', audioUri);

      // Get base64 audio data
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Load the audio file for metadata
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: false });
      const status = await sound.getStatusAsync();
      
      // Get audio details
      const durationInMillis = status.durationMillis || 0;
      const durationInSeconds = durationInMillis / 1000;
      
      // Create audio part for Gemini
      const audioPart = {
        inlineData: {
          data: base64Audio,
          mimeType: this.getMimeTypeFromUri(audioUri)
        }
      };

      // Create audio context with both metadata and content
      const audioContext = {
        metadata: {
          duration: durationInSeconds.toFixed(2),
          format: this.getMimeTypeFromUri(audioUri),
          size: base64Audio.length
        },
        content: audioPart
      };

      // Cleanup
      await sound.unloadAsync();

      console.log('Audio context prepared:', audioContext);
      return audioContext;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  async analyzeAudio(audioUri) {
    try {
      console.log('Preparing audio for scam analysis:', audioUri);
      
      // Validate the audio URI
      if (!audioUri || typeof audioUri !== 'string') {
        throw new Error('Invalid audio URI provided');
      }
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error(`Audio file does not exist at path: ${audioUri}`);
      }

      // Get audio content and metadata
      const audioData = await this.transcribeAudio(audioUri);
      
      // Create a prompt that leverages Gemini's audio understanding capabilities
      const prompt = `You are an AI specialized in detecting scams in audio content. Analyze this audio file in detail.

Technical Details:
- Duration: ${audioData.metadata.duration} seconds
- Format: ${audioData.metadata.format}
- File size: ${audioData.metadata.size} bytes

Analyze the audio for scam indicators including:
- Voice characteristics (natural vs synthetic)
- Speaking patterns and tone
- Background noise analysis
- Use of pressure tactics or urgency
- Requests for sensitive information
- Signs of impersonation
- Social engineering techniques
- Common scam phrases or patterns

Risk factors to consider:
- Very short duration could indicate automated calls
- Unusual long duration might be suspicious
- Non-standard audio formats might indicate manipulation
- Suspicious speaking patterns or tactics

IMPORTANT: You must return a valid JSON object with no additional text, markdown formatting, or explanation. The response must start with '{' and end with '}'. Use this exact format:

{
  "isScam": false,
  "reason": "Clear explanation of analysis results",
  "detectedTactics": "List of detected tactics or 'None detected' if none found",
  "technicalAnalysis": "Analysis of voice and audio characteristics",
  "riskLevel": "Low/Medium/High",
  "transcript": "Transcribed audio content or error message if transcription failed"
}

Do not include any text before or after the JSON object. Do not use markdown backticks or json tags.`;

      console.log('Sending audio to Gemini API for analysis...');
      const result = await this.model.generateContent([prompt, audioData.content]);
      const response = await result.response;
      const textResponse = response.text().trim();
      
      console.log('Received analysis from Gemini');
      
      return this.parseResponse(textResponse, 'audio');
    } catch (error) {
      console.error('Gemini API Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Audio URI attempted:', audioUri);
      throw new Error('Failed to analyze audio with Gemini: ' + error.message);
    }
  }

  // Helper function to sanitize and parse responses from Gemini
  parseResponse(textResponse, type) {
    try {
      // Clean up the response text
      let cleanResponse = textResponse.trim();
      
      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.substring(7);
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.substring(3);
      }
      if (cleanResponse.endsWith('```')) {
        cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
      }
      
      // Remove any non-JSON characters that might appear before or after the JSON object
      const jsonStartIndex = cleanResponse.indexOf('{');
      const jsonEndIndex = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        cleanResponse = cleanResponse.substring(jsonStartIndex, jsonEndIndex);
      }
      
      // Replace any escaped characters that might cause issues
      cleanResponse = cleanResponse
        .replace(/[\u0000-\u0019]+/g, '') // Remove control characters
        .replace(/\\"/g, '"')             // Fix escaped quotes
        .replace(/\\n/g, ' ')             // Replace newlines with spaces
        .replace(/\\/g, '\\\\');          // Escape backslashes
      
      cleanResponse = cleanResponse.trim();
      
      console.log('Original response:', textResponse);
      console.log('Cleaned response:', cleanResponse);
      
      // Attempt to parse the sanitized JSON response
      try {
        return JSON.parse(cleanResponse);
      } catch (innerError) {
        console.error('Inner parse error:', innerError);
        // If parsing fails, try to fix common JSON syntax issues
        cleanResponse = cleanResponse
          .replace(/,\s*}/g, '}')         // Remove trailing commas
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // Quote unquoted keys
        
        console.log('Final attempt response:', cleanResponse);
        return JSON.parse(cleanResponse);
      }
    } catch (parseError) {
      console.error(`Failed to parse Gemini ${type} response as JSON:`, parseError);
      console.log('Raw response:', textResponse);
      console.log('Cleaned response attempt:', cleanResponse);
      
      // Default fallback structure based on content type
      if (type === 'text') {
        // Extract using regex for text responses
        const isScamMatch = textResponse.match(/"isScam"\s*:\s*(true|false)/i);
        const reasonMatch = textResponse.match(/"reason"\s*:\s*"([^"]*)"/i);
        
        if (isScamMatch && reasonMatch) {
          return {
            isScam: isScamMatch[1].toLowerCase() === 'true',
            reason: reasonMatch[1]
          };
        }
        
        return {
          isScam: false,
          reason: "Unable to analyze the content. Please try again with more detailed text."
        };
      } 
      else if (type === 'image') {
        // Fallback for image responses
        return {
          isScam: textResponse.toLowerCase().includes('scam') || 
                  textResponse.toLowerCase().includes('suspicious') || 
                  textResponse.toLowerCase().includes('phishing'),
          reason: "Based on the image analysis, " + 
                  (textResponse.length > 200 ? textResponse.substring(0, 200) + "..." : textResponse),
          detectedElements: "Image analysis completed, but structured data couldn't be extracted."
        };
      }
      else if (type === 'audio') {
        // Enhanced audio response parsing
        try {
          const isScam = textResponse.toLowerCase().includes('scam') ||
                        textResponse.toLowerCase().includes('suspicious') ||
                        textResponse.toLowerCase().includes('phishing');

          // Try to extract tactics using regex
          const tacticsMatch = textResponse.match(/"detectedTactics"\s*:\s*"([^"]*)"/i);
          const technicalMatch = textResponse.match(/"technicalAnalysis"\s*:\s*"([^"]*)"/i);
          const riskMatch = textResponse.match(/"riskLevel"\s*:\s*"([^"]*)"/i);

          // Ensure we always return a valid response object
          return {
            isScam: isScam,
            reason: textResponse.substring(0, 500), // Get a substantial portion of the analysis
            detectedTactics: tacticsMatch ? tacticsMatch[1] :
                            (textResponse.toLowerCase().includes('tactic') ?
                             "Potential tactics detected, see explanation for details." :
                             "No clear scam tactics detected"),
            technicalAnalysis: technicalMatch ? technicalMatch[1] :
                             "Audio analysis completed, see reason for technical details",
            riskLevel: riskMatch ? riskMatch[1] : (isScam ? "High" : "Low")
          };
        } catch (error) {
          // Fallback response if anything goes wrong during parsing
          return {
            isScam: false,
            reason: "Unable to analyze the audio content due to parsing error.",
            detectedTactics: "Analysis failed - unable to detect tactics",
            technicalAnalysis: "Analysis failed - unable to perform technical analysis",
            riskLevel: "Unknown",
            transcript: "Audio transcription failed" // Added to match component expectations
          };
        }
      } else {
        // Default fallback for unknown content types
        return {
          isScam: false,
          reason: `Unable to analyze the ${type} content. Please try again.`
        };
      }
    }
  }

  // Helper function to compress image
  async compressImage(uri) {
    try {
      console.log('Compressing image:', uri);
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1000 } }], // Resize to reasonable dimensions
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      console.log('Image compressed successfully');
      return manipResult.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri; // Return original if compression fails
    }
  }

  // Enhanced function to get base64 from file URI
  async getBase64FromUri(uri) {
    try {
      // Check if URI is valid
      if (!uri || typeof uri !== 'string') {
        console.error('Invalid URI provided:', uri);
        return null;
      }

      // Handle different URI schemes
      let fileUri = uri;
      
      // For content:// URIs (content provider), we may need to copy the file first
      if (uri.startsWith('content://')) {
        console.log('Handling content:// URI');
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          console.error('File does not exist at URI:', uri);
          return null;
        }
        
        // Determine file extension based on mime type
        let fileExt = '.tmp';
        if (this.getMimeTypeFromUri(uri).includes('image')) {
          fileExt = '.jpg';
        } else if (this.getMimeTypeFromUri(uri).includes('audio')) {
          fileExt = '.mp3';
        }
        
        // Create a temporary file in app's cache directory
        const tempFilePath = `${FileSystem.cacheDirectory}temp_file_${new Date().getTime()}${fileExt}`;
        await FileSystem.copyAsync({
          from: uri,
          to: tempFilePath
        });
        fileUri = tempFilePath;
        console.log('Copied content:// file to:', tempFilePath);
      }
      
      // Log file info before trying to read
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      console.log('File info before reading:', fileInfo);
      
      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      if (!base64 || base64.length === 0) {
        console.error('Empty base64 result from file:', fileUri);
        return null;
      }
      
      console.log('Successfully converted file to base64, length:', base64.length);
      return base64;
    } catch (error) {
      console.error('Error converting file to base64:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('URI attempted:', uri);
      return null;
    }
  }

  // Helper function to determine MIME type from URI
  getMimeTypeFromUri(uri) {
    // For audio files
    if (uri.toLowerCase().endsWith('.mp3')) {
      return 'audio/mpeg';
    } else if (uri.toLowerCase().endsWith('.wav')) {
      return 'audio/wav';
    } else if (uri.toLowerCase().endsWith('.ogg')) {
      return 'audio/ogg';
    } else if (uri.toLowerCase().endsWith('.m4a')) {
      return 'audio/mp4';
    } 
    // For image files
    else if (uri.toLowerCase().endsWith('.jpg') || uri.toLowerCase().endsWith('.jpeg')) {
      return 'image/jpeg';
    } else if (uri.toLowerCase().endsWith('.png')) {
      return 'image/png';
    } else if (uri.toLowerCase().endsWith('.gif')) {
      return 'image/gif';
    } else if (uri.toLowerCase().endsWith('.webp')) {
      return 'image/webp';
    } else if (uri.toLowerCase().endsWith('.bmp')) {
      return 'image/bmp';
    } 
    // Default based on filename pattern for audio files
    else if (uri.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      return 'audio/mpeg';  // Default audio type
    } else {
      // Try to determine if it's an audio file from the path
      if (uri.toLowerCase().includes('audio') ||
          uri.toLowerCase().includes('voice') ||
          uri.toLowerCase().includes('sound') ||
          uri.toLowerCase().includes('record')) {
        return 'audio/mpeg';
      }
      // If we can't determine, default to audio since this is called in audio context
      return 'audio/mpeg';
    }
  }
}

export default new GeminiScamDetectionService();