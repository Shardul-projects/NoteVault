import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { openaiService } from "./services/openaiService";
import { emailService } from "./services/emailService";
import { fileProcessor } from "./services/fileProcessor";
import { youtubeService } from "./services/youtubeService";
import { insertSourceSchema, insertAiSessionSchema, insertQaSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // File upload route
  app.post('/api/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file provided" });
      }

      // Validate file
      const validation = fileProcessor.validateFile(file);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Extract text from file
      const { text, metadata } = await fileProcessor.extractTextFromFile(file);

      // Create source record
      const source = await storage.createSource({
        userId,
        type: file.mimetype.includes('pdf') ? 'pdf' : file.originalname.endsWith('.md') ? 'md' : 'txt',
        title: file.originalname,
        content: text,
        metadata,
      });

      // Generate AI summary
      const summaryResult = await openaiService.generateSummary(text, file.originalname);

      // Create AI session
      const aiSession = await storage.createAiSession({
        userId,
        sourceId: source.id,
        summary: JSON.stringify(summaryResult),
      });

      res.json({ source, aiSession, summary: summaryResult });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to upload file" });
    }
  });

  // YouTube URL processing route
  app.post('/api/youtube', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ message: "YouTube URL is required" });
      }

      // Validate YouTube URL
      const validation = youtubeService.validateYouTubeUrl(url);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // For now, use simulated transcript
      const { transcript, metadata } = await youtubeService.getSimulatedTranscript(url);

      // Create source record
      const source = await storage.createSource({
        userId,
        type: 'youtube',
        title: metadata.title || 'YouTube Video',
        originalLink: url,
        content: transcript,
        metadata,
      });

      // Generate AI summary
      const summaryResult = await openaiService.generateSummary(transcript, metadata.title || 'YouTube Video');

      // Create AI session
      const aiSession = await storage.createAiSession({
        userId,
        sourceId: source.id,
        summary: JSON.stringify(summaryResult),
      });

      res.json({ source, aiSession, summary: summaryResult });
    } catch (error) {
      console.error("Error processing YouTube URL:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to process YouTube URL" });
    }
  });

  // Ask question route
  app.post('/api/ask', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { sessionId, question } = req.body;

      if (!sessionId || !question) {
        return res.status(400).json({ message: "Session ID and question are required" });
      }

      // Get session with source
      const session = await storage.getSessionWithQAs(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Get source content
      const source = await storage.getSource(session.sourceId);
      if (!source) {
        return res.status(404).json({ message: "Source not found" });
      }

      // Generate answer using AI
      const qaResult = await openaiService.answerQuestion(question, source.content || '', source.title);

      // Save Q&A
      const qa = await storage.createQa({
        sessionId,
        question,
        answer: qaResult.answer,
        sourceChunks: qaResult.sourceChunks,
      });

      res.json({ qa, ...qaResult });
    } catch (error) {
      console.error("Error answering question:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to answer question" });
    }
  });

  // Get user sessions
  app.get('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserSessions(userId);
      
      // Get sources for each session
      const sessionsWithSources = await Promise.all(
        sessions.map(async (session) => {
          const source = await storage.getSource(session.sourceId);
          return { ...session, source };
        })
      );

      res.json(sessionsWithSources);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Get specific session with Q&As
  app.get('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = req.params.id;

      const session = await storage.getSessionWithQAs(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      const source = await storage.getSource(session.sourceId);
      
      res.json({ ...session, source });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Delete session
  app.delete('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = req.params.id;

      const session = await storage.getSessionWithQAs(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      await storage.deleteSession(sessionId);
      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Update user theme preference
  app.patch('/api/user/theme', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { theme } = req.body;

      if (!['light', 'dark', 'system'].includes(theme)) {
        return res.status(400).json({ message: "Invalid theme preference" });
      }

      const user = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        themePreference: theme,
      });

      res.json({ theme: user.themePreference });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
