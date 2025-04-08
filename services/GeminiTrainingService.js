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

Return a JSON object with exactly these fields:
{
  "sender": "Email sender address",
  "subject": "Email subject line",
  "content": "Detailed email content",
  "isScam": true/false,
  "reason": "Educational explanation of security indicators"
}

Make the example challenging but appropriate for their skill level.`;

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
      
      // Find JSON object
      const matches = textResponse.match(/\{[\s\S]*\}/g);
      if (!matches || matches.length === 0) {
        throw new Error('No JSON found in response');
      }

      // Clean the JSON string
      let cleanResponse = matches[0]
        .replace(/[\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/,\s*}/g, '}')
        .replace(/:\s*'/g, ':"')
        .replace(/'\s*,/g, '",')
        .replace(/'\s*}/g, '"}')
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        .trim();

      // Parse and validate
      const parsed = JSON.parse(cleanResponse);
      
      // Ensure all required fields exist
      const required = ['sender', 'subject', 'content', 'isScam', 'reason'];
      for (const field of required) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const result = {
        sender: String(parsed.sender),
        subject: String(parsed.subject),
        content: String(parsed.content),
        isScam: Boolean(parsed.isScam),
        reason: String(parsed.reason)
      };

      console.log('Parsed result:', result);
      return result;
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error('Failed to parse response');
    }
  }
}

const geminiTraining = new GeminiTrainingService();
export default geminiTraining;