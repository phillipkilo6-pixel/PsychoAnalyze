import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertAnalysisSchema } from "@shared/schema";
import { analyzeConversation, type ConversationAnalysisRequest } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get conversation by ID
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analyze conversation
  app.post("/api/conversations/:id/analyze", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const analysisRequest: ConversationAnalysisRequest = {
        conversation: conversation.content,
        analysisType: conversation.analysisType,
        model: conversation.model,
        temperature: parseFloat(conversation.temperature),
        maxTokens: conversation.maxTokens,
      };

      const analysisResult = await analyzeConversation(analysisRequest);

      const analysis = await storage.createAnalysis({
        conversationId: conversation.id,
        emotionalTone: analysisResult.emotionalTone,
        powerDynamics: analysisResult.powerDynamics,
        communicationPatterns: analysisResult.communicationPatterns,
        relationshipInsights: analysisResult.relationshipInsights,
        recommendations: JSON.stringify(analysisResult.recommendations),
        emotionalIntensity: analysisResult.emotionalIntensity.toString(),
        resolutionPotential: analysisResult.resolutionPotential.toString(),
        communicationQuality: analysisResult.communicationQuality.toString(),
        powerBalance: analysisResult.powerBalance.toString(),
        rawAnalysis: analysisResult.rawAnalysis,
      });

      res.json({ analysis, result: analysisResult });
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get analysis for conversation
  app.get("/api/conversations/:id/analysis", async (req, res) => {
    try {
      const analysis = await storage.getAnalysis(req.params.id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get recent analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAnalyses();
      const conversations = await storage.getConversations();
      
      const analysesWithConversations = analyses.map(analysis => {
        const conversation = conversations.find(c => c.id === analysis.conversationId);
        return { ...analysis, conversation };
      });
      
      res.json(analysesWithConversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
