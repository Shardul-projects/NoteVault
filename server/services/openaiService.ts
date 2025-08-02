import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

interface SummaryResult {
  summary: string;
  keyPoints: string[];
}

interface QAResult {
  answer: string;
  sourceChunks: string[];
  confidence: number;
}

export class OpenAIService {
  async generateSummary(content: string, title: string): Promise<SummaryResult> {
    try {
      const prompt = `
        Please analyze the following content titled "${title}" and provide:
        1. A concise summary in 3-5 bullet points
        2. Key actionable insights
        
        Content: ${content}
        
        Respond with JSON in this format:
        {
          "summary": "Brief overview paragraph",
          "keyPoints": ["bullet point 1", "bullet point 2", ...]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        summary: result.summary || "Unable to generate summary",
        keyPoints: result.keyPoints || [],
      };
    } catch (error) {
      console.error("Error generating summary:", error);
      throw new Error("Failed to generate summary");
    }
  }

  async answerQuestion(question: string, content: string, sourceTitle: string): Promise<QAResult> {
    try {
      const prompt = `
        Context: The following content is from "${sourceTitle}"
        Content: ${content}
        
        User question: ${question}
        
        Please answer the question based ONLY on the provided content. If the answer cannot be determined from the content, respond with "I don't know from the provided content."
        
        Respond with JSON in this format:
        {
          "answer": "Your detailed answer here",
          "sourceChunks": ["relevant section 1", "relevant section 2"],
          "confidence": 0.95
        }
        
        Include source references and confidence score (0-1).
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        answer: result.answer || "Unable to generate answer",
        sourceChunks: result.sourceChunks || [],
        confidence: result.confidence || 0.5,
      };
    } catch (error) {
      console.error("Error answering question:", error);
      throw new Error("Failed to answer question");
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw new Error("Failed to generate embeddings");
    }
  }

  private chunkText(text: string, maxChunkSize: number = 8000): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = "";
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ". " : "") + sentence;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}

export const openaiService = new OpenAIService();
