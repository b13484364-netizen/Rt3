import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { joinRoomSchema, insertMessageSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup multer for image uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Join or create room
  app.post("/api/rooms/join", async (req, res) => {
    try {
      const data = joinRoomSchema.parse(req.body);
      const userId = randomUUID();
      
      // Hash the password for room lookup
      const passwordHash = await storage.hashPassword(data.password);
      
      // Try to find existing room
      let room = await storage.getRoomByCredentials(data.imageKey, data.customImageUrl, passwordHash);
      
      if (!room) {
        // Create new room with 60 minute max duration
        const duration = Math.min(60, 60); // Always 60 minutes max
        room = await storage.createRoom({
          imageKey: data.imageKey,
          customImageUrl: data.customImageUrl,
          passwordHash,
          duration,
          creatorUserId: userId,
        });
      }
      
      // Add user to room
      await storage.addUserToRoom({
        roomId: room.id,
        userId,
        username: data.username,
      });
      
      // Get room users and messages
      const users = await storage.getUsersInRoom(room.id);
      const messages = await storage.getMessagesByRoomId(room.id);
      
      res.json({
        room: {
          id: room.id,
          imageKey: room.imageKey,
          customImageUrl: room.customImageUrl,
          duration: room.duration,
          expiresAt: room.expiresAt,
          isCreator: room.creatorUserId === userId,
        },
        userId,
        users,
        messages,
      });
    } catch (error) {
      console.error('Join room error:', error);
      res.status(400).json({ message: "فشل في الانضمام إلى الغرفة" });
    }
  });
  
  // Get room status and updates
  app.get("/api/rooms/:roomId/status", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { userId, since } = req.query;
      
      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "الغرفة غير موجودة أو منتهية الصلاحية" });
      }
      
      const users = await storage.getUsersInRoom(roomId);
      const messages = await storage.getMessagesByRoomId(
        roomId, 
        since ? new Date(since as string) : undefined
      );
      
      res.json({
        room: {
          id: room.id,
          imageKey: room.imageKey,
          customImageUrl: room.customImageUrl,
          duration: room.duration,
          expiresAt: room.expiresAt,
          isActive: room.isActive,
          isCreator: room.creatorUserId === userId,
        },
        users,
        messages,
      });
    } catch (error) {
      console.error('Get room status error:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });
  
  // Send message
  app.post("/api/rooms/:roomId/messages", async (req, res) => {
    try {
      const { roomId } = req.params;
      const data = insertMessageSchema.parse(req.body);
      
      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "الغرفة غير موجودة أو منتهية الصلاحية" });
      }
      
      const message = await storage.createMessage({
        ...data,
        roomId,
      });
      
      res.json(message);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(400).json({ message: "فشل في إرسال الرسالة" });
    }
  });
  
  // Close room (creator only)
  app.post("/api/rooms/:roomId/close", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;
      
      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "الغرفة غير موجودة" });
      }
      
      if (room.creatorUserId !== userId) {
        return res.status(403).json({ message: "ليس لديك صلاحية إغلاق الغرفة" });
      }
      
      await storage.updateRoomStatus(roomId, false);
      
      res.json({ message: "تم إغلاق الغرفة بنجاح" });
    } catch (error) {
      console.error('Close room error:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });
  
  // Leave room
  app.post("/api/rooms/:roomId/leave", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;
      
      await storage.removeUserFromRoom(roomId, userId);
      
      res.json({ message: "تم مغادرة الغرفة بنجاح" });
    } catch (error) {
      console.error('Leave room error:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });
  
  // Upload custom image
  app.post("/api/upload-image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم اختيار صورة" });
      }
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      
      res.json({ imageUrl });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({ message: "فشل في رفع الصورة" });
    }
  });
  
  // Serve uploaded images
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  return httpServer;
}
