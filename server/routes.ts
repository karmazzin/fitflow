import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Workout program routes
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getAllPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });

  app.post("/api/programs", async (req, res) => {
    try {
      const program = await storage.createProgram(req.body);
      res.json(program);
    } catch (error) {
      res.status(500).json({ error: "Failed to create program" });
    }
  });

  // Workout session routes
  app.post("/api/sessions", async (req, res) => {
    try {
      const session = await storage.createSession(req.body);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Exercise completion routes
  app.post("/api/exercises/complete", async (req, res) => {
    try {
      const completion = await storage.createExerciseCompletion(req.body);
      res.json(completion);
    } catch (error) {
      res.status(500).json({ error: "Failed to record exercise completion" });
    }
  });

  // User settings routes
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.params.userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings/:userId", async (req, res) => {
    try {
      const settings = await storage.updateUserSettings(req.params.userId, req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Statistics routes
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Sync route for offline data
  app.post("/api/sync-workout", async (req, res) => {
    try {
      // Handle offline workout data sync
      const syncData = req.body;
      await storage.syncOfflineData(syncData);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync workout data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
