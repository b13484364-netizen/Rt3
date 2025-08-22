import { type Room, type Message, type RoomUser, type InsertRoom, type InsertMessage, type InsertRoomUser } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRoomByCredentials(imageKey: string, customImageUrl: string | undefined, passwordHash: string): Promise<Room | undefined>;
  getRoomById(id: string): Promise<Room | undefined>;
  updateRoomStatus(id: string, isActive: boolean): Promise<void>;
  cleanupExpiredRooms(): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByRoomId(roomId: string, since?: Date): Promise<Message[]>;
  
  // User operations
  addUserToRoom(roomUser: InsertRoomUser): Promise<RoomUser>;
  getUsersInRoom(roomId: string): Promise<RoomUser[]>;
  removeUserFromRoom(roomId: string, userId: string): Promise<void>;
  updateUserActivity(roomId: string, userId: string, isActive: boolean): Promise<void>;
  
  // Utility
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private messages: Map<string, Message>;
  private roomUsers: Map<string, RoomUser>;

  constructor() {
    this.rooms = new Map();
    this.messages = new Map();
    this.roomUsers = new Map();
    
    // Cleanup expired rooms every minute
    setInterval(() => {
      this.cleanupExpiredRooms();
    }, 60000);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + insertRoom.duration * 60 * 1000);
    
    const room: Room = {
      ...insertRoom,
      id,
      createdAt: now,
      expiresAt,
      isActive: true,
      customImageUrl: insertRoom.customImageUrl || null,
    };
    
    this.rooms.set(id, room);
    return room;
  }

  async getRoomByCredentials(imageKey: string, customImageUrl: string | undefined, passwordHash: string): Promise<Room | undefined> {
    for (const room of Array.from(this.rooms.values())) {
      if (room.imageKey === imageKey && 
          room.customImageUrl === (customImageUrl || null) && 
          room.passwordHash === passwordHash &&
          room.isActive &&
          room.expiresAt > new Date()) {
        return room;
      }
    }
    return undefined;
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (room && room.isActive && room.expiresAt > new Date()) {
      return room;
    }
    return undefined;
  }

  async updateRoomStatus(id: string, isActive: boolean): Promise<void> {
    const room = this.rooms.get(id);
    if (room) {
      room.isActive = isActive;
      this.rooms.set(id, room);
    }
  }

  async cleanupExpiredRooms(): Promise<void> {
    const now = new Date();
    for (const [id, room] of Array.from(this.rooms.entries())) {
      if (room.expiresAt <= now) {
        room.isActive = false;
        this.rooms.set(id, room);
        
        // Remove users from expired room
        for (const [userId, roomUser] of Array.from(this.roomUsers.entries())) {
          if (roomUser.roomId === id) {
            this.roomUsers.delete(userId);
          }
        }
      }
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByRoomId(roomId: string, since?: Date): Promise<Message[]> {
    const messages = Array.from(this.messages.values())
      .filter(msg => msg.roomId === roomId)
      .filter(msg => !since || msg.timestamp! > since)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
    
    return messages;
  }

  async addUserToRoom(insertRoomUser: InsertRoomUser): Promise<RoomUser> {
    const id = randomUUID();
    const roomUser: RoomUser = {
      ...insertRoomUser,
      id,
      joinedAt: new Date(),
      isActive: true,
    };
    
    this.roomUsers.set(id, roomUser);
    return roomUser;
  }

  async getUsersInRoom(roomId: string): Promise<RoomUser[]> {
    return Array.from(this.roomUsers.values())
      .filter(ru => ru.roomId === roomId && ru.isActive);
  }

  async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    for (const [id, roomUser] of Array.from(this.roomUsers.entries())) {
      if (roomUser.roomId === roomId && roomUser.userId === userId) {
        this.roomUsers.delete(id);
        break;
      }
    }
  }

  async updateUserActivity(roomId: string, userId: string, isActive: boolean): Promise<void> {
    for (const [id, roomUser] of Array.from(this.roomUsers.entries())) {
      if (roomUser.roomId === roomId && roomUser.userId === userId) {
        roomUser.isActive = isActive;
        this.roomUsers.set(id, roomUser);
        break;
      }
    }
  }
}

export const storage = new MemStorage();
