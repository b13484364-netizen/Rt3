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
