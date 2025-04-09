import { GoogleGenerativeAI } from "@google/generative-ai";
import config from '../config/config';

class GeminiTrainingService {
  constructor() {
    const apiKey = config.geminiApiKey || 'AIzaSyCglgEYdpjPkxJQBkqKylkYeVrDQ2bOzLs';
    if (!apiKey) {
      console.error('Gemini API key not found in configuration');
      throw new Error('Gemini API key not configured');
    }

    console.log('Initializing Gemini training model...');
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7, // Higher temperature for more variety
        topK: 40,        // Less deterministic
        topP: 0.9,       // More creative sampling
        maxOutputTokens: 800
      }
    });
  }

  async generateTrainingExample(skillLevel = 'basic', context = {}) {
    try {
      console.log(`Generating ${skillLevel} training example...`);
      const example = await this.createExample(skillLevel, context);
      console.log('Generated example:', example);
      return example;
    } catch (error) {
      console.error('Training generation error:', error);
      throw error;
    }
  }

  async createExample(skillLevel, context = {}) {
    // Determine complexity based on skill level
    const complexityGuide = {
      expert: "extremely sophisticated and subtle, requiring deep analysis",
      advanced: "complex with industry-specific terminology and nuanced indicators",
      intermediate: "moderately complex with some subtle indicators",
      basic: "straightforward with clear phishing indicators"
    };

    // Prioritize examples based on weak areas
    const exampleTypes = context.weakAreas && context.weakAreas.length > 0
      ? context.weakAreas
      : ["financial", "credential", "impersonation", "malware", "social"];
    
    // Select type with preference for weak areas
    const selectedType = exampleTypes[Math.floor(Math.random() * exampleTypes.length)];
    
    // Get test scores for personalization
    const scores = context.testScores || {};
    const weakestScore = Math.min(...Object.values(scores).filter(score => typeof score === 'number'));
    
    // Template patterns based on type
    const patterns = {
      financial: {
        tactics: ["urgent wire transfers", "invoice discrepancies", "payment system updates", "tax-related requests"],
        context: "financial transactions and payments"
      },
      credential: {
        tactics: ["password resets", "security updates", "account verification", "login alerts"],
        context: "account security and authentication"
      },
      impersonation: {
        tactics: ["executive requests", "colleague impersonation", "vendor communications"],
        context: "authority figures and trusted relationships"
      },
      malware: {
        tactics: ["package tracking", "document sharing", "software updates", "attachments"],
        context: "file downloads and system access"
      },
      social: {
        tactics: ["social connections", "professional networking", "community engagement"],
        context: "social media and professional networks"
      }
    };

    const template = patterns[selectedType];
    const complexity = complexityGuide[skillLevel] || complexityGuide.basic;
    const tactic = template.tactics[Math.floor(Math.random() * template.tactics.length)];

    const prompt = `Create a ${complexity} security training email example about ${tactic} in the context of ${template.context}.

Consider these factors for personalization:
- User's skill level: ${skillLevel}
- Weakest area score: ${weakestScore}% in ${selectedType}
- Previous test responses: ${JSON.stringify(context.previousAnswers || {})}

Requirements:
1. Make the content highly relevant to the user's skill level
2. Focus on areas where the user scored poorly
3. Include subtle security indicators that match their expertise
4. Provide detailed educational value in the reason field

IMPORTANT: Your response must be a valid JSON object with exactly these fields:
{
  "sender": "Email sender address (string)",
  "subject": "Email subject line (string)",
  "content": "Detailed email content (string)",
  "isScam": true/false (boolean),
  "reason": "Educational explanation of security indicators (string)"
}

Do not include any text before or after the JSON object. Do not use markdown formatting or code blocks.`;

    try {
      console.log('Sending request to Gemini...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Raw response:', text);
      
      return this.parseResponse(text);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate example');
    }
  }

  parseResponse(textResponse) {
    try {
      console.log('Parsing response...');
      
      // Clean the response text first
      let cleanText = textResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // Try to find JSON object using multiple methods
      let jsonStr = null;
      
      // Method 1: Look for JSON object in the text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      } else {
        // Method 2: Try to extract key-value pairs
        const keyValuePairs = cleanText.match(/"([^"]+)":\s*"([^"]+)"/g);
        if (keyValuePairs) {
          const obj = {};
          keyValuePairs.forEach(pair => {
            const [key, value] = pair.split(':').map(s => s.trim().replace(/"/g, ''));
            obj[key] = value;
          });
          jsonStr = JSON.stringify(obj);
        }
      }

      if (!jsonStr) {
        console.error('Could not find valid JSON in response:', cleanText);
        throw new Error('Invalid response format');
      }

      // Clean the JSON string
      jsonStr = jsonStr
        .replace(/[\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/,\s*}/g, '}')
        .replace(/:\s*'/g, ':"')
        .replace(/'\s*,/g, '",')
        .replace(/'\s*}/g, '"}')
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        .trim();

      // Parse and validate
      const parsed = JSON.parse(jsonStr);
      
      // Ensure all required fields exist with proper types
      const required = {
        sender: 'string',
        subject: 'string',
        content: 'string',
        isScam: 'boolean',
        reason: 'string'
      };

      for (const [field, type] of Object.entries(required)) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`);
        }
        if (type === 'boolean' && typeof parsed[field] !== 'boolean') {
          parsed[field] = parsed[field].toString().toLowerCase() === 'true';
        }
        if (type === 'string' && typeof parsed[field] !== 'string') {
          parsed[field] = String(parsed[field]);
        }
      }

      const result = {
        sender: parsed.sender,
        subject: parsed.subject,
        content: parsed.content,
        isScam: parsed.isScam,
        reason: parsed.reason
      };

      console.log('Successfully parsed result:', result);
      return result;
    } catch (error) {
      console.error('Parse error:', error);
      console.error('Original response:', textResponse);
      
      // Return a fallback example if parsing fails
      return {
        sender: "security@example.com",
        subject: "Important Security Update",
        content: "This is a legitimate security update. Please review the attached document for important security information.",
        isScam: false,
        reason: "This is a fallback example generated due to parsing error. The original response could not be parsed."
      };
    }
  }
}

const geminiTraining = new GeminiTrainingService();
export default geminiTraining;