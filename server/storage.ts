import {
  users,
  sources,
  aiSessions,
  qas,
  type User,
  type UpsertUser,
  type Source,
  type InsertSource,
  type AiSession,
  type InsertAiSession,
  type Qa,
  type InsertQa,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Source operations
  createSource(source: InsertSource): Promise<Source>;
  getUserSources(userId: string): Promise<Source[]>;
  getSource(id: string): Promise<Source | undefined>;
  updateSource(id: string, updates: Partial<InsertSource>): Promise<Source>;
  deleteSource(id: string): Promise<void>;
  
  // AI Session operations
  createAiSession(session: InsertAiSession): Promise<AiSession>;
  getUserSessions(userId: string): Promise<AiSession[]>;
  getSessionWithQAs(sessionId: string): Promise<(AiSession & { qas: Qa[] }) | undefined>;
  updateSession(id: string, updates: Partial<InsertAiSession>): Promise<AiSession>;
  deleteSession(id: string): Promise<void>;
  
  // Q&A operations
  createQa(qa: InsertQa): Promise<Qa>;
  getSessionQAs(sessionId: string): Promise<Qa[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Source operations
  async createSource(source: InsertSource): Promise<Source> {
    const [newSource] = await db.insert(sources).values(source).returning();
    return newSource;
  }

  async getUserSources(userId: string): Promise<Source[]> {
    return await db
      .select()
      .from(sources)
      .where(eq(sources.userId, userId))
      .orderBy(desc(sources.createdAt));
  }

  async getSource(id: string): Promise<Source | undefined> {
    const [source] = await db.select().from(sources).where(eq(sources.id, id));
    return source;
  }

  async updateSource(id: string, updates: Partial<InsertSource>): Promise<Source> {
    const [source] = await db
      .update(sources)
      .set(updates)
      .where(eq(sources.id, id))
      .returning();
    return source;
  }

  async deleteSource(id: string): Promise<void> {
    await db.delete(sources).where(eq(sources.id, id));
  }

  // AI Session operations
  async createAiSession(session: InsertAiSession): Promise<AiSession> {
    const [newSession] = await db.insert(aiSessions).values(session).returning();
    return newSession;
  }

  async getUserSessions(userId: string): Promise<AiSession[]> {
    return await db
      .select()
      .from(aiSessions)
      .where(eq(aiSessions.userId, userId))
      .orderBy(desc(aiSessions.createdAt));
  }

  async getSessionWithQAs(sessionId: string): Promise<(AiSession & { qas: Qa[] }) | undefined> {
    const [session] = await db.select().from(aiSessions).where(eq(aiSessions.id, sessionId));
    if (!session) return undefined;

    const sessionQAs = await db.select().from(qas).where(eq(qas.sessionId, sessionId)).orderBy(desc(qas.createdAt));
    
    return { ...session, qas: sessionQAs };
  }

  async updateSession(id: string, updates: Partial<InsertAiSession>): Promise<AiSession> {
    const [session] = await db
      .update(aiSessions)
      .set(updates)
      .where(eq(aiSessions.id, id))
      .returning();
    return session;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(aiSessions).where(eq(aiSessions.id, id));
  }

  // Q&A operations
  async createQa(qa: InsertQa): Promise<Qa> {
    const [newQa] = await db.insert(qas).values(qa).returning();
    return newQa;
  }

  async getSessionQAs(sessionId: string): Promise<Qa[]> {
    return await db
      .select()
      .from(qas)
      .where(eq(qas.sessionId, sessionId))
      .orderBy(desc(qas.createdAt));
  }
}

export const storage = new DatabaseStorage();
