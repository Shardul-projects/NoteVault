import * as fs from 'fs';
import * as path from 'path';

export class FileProcessor {
  async extractTextFromFile(file: Express.Multer.File): Promise<{ text: string; metadata: any }> {
    const { mimetype, originalname, size } = file;
    
    try {
      if (mimetype === 'application/pdf') {
        return await this.extractTextFromPDF(file);
      } else if (mimetype === 'text/plain' || originalname.endsWith('.txt')) {
        return await this.extractTextFromTXT(file);
      } else if (mimetype === 'text/markdown' || originalname.endsWith('.md')) {
        return await this.extractTextFromMarkdown(file);
      } else {
        throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error('Failed to process file');
    }
  }

  private async extractTextFromPDF(file: Express.Multer.File): Promise<{ text: string; metadata: any }> {
    // For now, we'll use a simple approach. In production, you'd use a library like pdf-parse
    // Since we can't install new packages, we'll simulate PDF text extraction
    
    try {
      // Read file buffer
      const buffer = file.buffer;
      
      // This is a simplified approach - in reality you'd use pdf-parse or similar
      // For demonstration, we'll return an error message encouraging manual text extraction
      throw new Error('PDF processing requires additional setup. Please convert to text file first.');
      
    } catch (error) {
      throw new Error('Failed to extract text from PDF. Please try converting to text format first.');
    }
  }

  private async extractTextFromTXT(file: Express.Multer.File): Promise<{ text: string; metadata: any }> {
    try {
      const text = file.buffer.toString('utf-8');
      
      return {
        text: text.trim(),
        metadata: {
          fileSize: file.size,
          originalName: file.originalname,
          mimeType: file.mimetype,
          wordCount: text.split(/\s+/).length,
          charCount: text.length,
        }
      };
    } catch (error) {
      throw new Error('Failed to extract text from TXT file');
    }
  }

  private async extractTextFromMarkdown(file: Express.Multer.File): Promise<{ text: string; metadata: any }> {
    try {
      const text = file.buffer.toString('utf-8');
      
      // Simple markdown processing - remove basic markdown syntax
      const cleanText = text
        .replace(/^#+\s/gm, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove inline code
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
        .trim();
      
      return {
        text: cleanText,
        metadata: {
          fileSize: file.size,
          originalName: file.originalname,
          mimeType: file.mimetype,
          wordCount: cleanText.split(/\s+/).length,
          charCount: cleanText.length,
        }
      };
    } catch (error) {
      throw new Error('Failed to extract text from Markdown file');
    }
  }

  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown'
    ];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }
    
    const isValidType = allowedTypes.includes(file.mimetype) || 
                       file.originalname.endsWith('.txt') || 
                       file.originalname.endsWith('.md');
    
    if (!isValidType) {
      return { valid: false, error: 'Unsupported file type. Please use PDF, TXT, or MD files.' };
    }
    
    return { valid: true };
  }
}

export const fileProcessor = new FileProcessor();
