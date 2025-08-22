import { useState, useEffect, useRef } from "react";
import { getRoomStatus, sendMessage as sendMessageApi } from "@/lib/chat-api";
import type { Message, RoomUser } from "@shared/schema";

interface RoomData {
  id: string;
  imageKey: string;
  customImageUrl?: string;
  duration: number;
  expiresAt: string;
  isActive: boolean;
  isCreator: boolean;
}

interface UseChatPollingResult {
  roomData: RoomData | null;
  messages: Message[];
  users: RoomUser[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (data: { userId: string; username: string; content: string }) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useChatPolling(roomId: string, userId?: string): UseChatPollingResult {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<Date | null>(null);

  const fetchRoomStatus = async () => {
    if (!userId) return;

    try {
      const params = new URLSearchParams({ userId });
      if (lastUpdateRef.current) {
        params.append('since', lastUpdateRef.current.toISOString());
      }

      const response = await getRoomStatus(roomId, params.toString());
      
      if (response.room) {
        setRoomData(response.room);
      }
      
      if (response.users) {
        setUsers(response.users);
      }
      
      if (response.messages) {
        if (lastUpdateRef.current && response.messages.length > 0) {
          // Append new messages
          setMessages(prev => [...prev, ...response.messages]);
        } else {
          // Initial load
          setMessages(response.messages);
        }
      }
      
      lastUpdateRef.current = new Date();
      setError(null);
    } catch (err) {
      console.error("Polling error:", err);
      setError("فشل في تحديث البيانات");
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    lastUpdateRef.current = null; // Reset to get all messages
    await fetchRoomStatus();
    setIsLoading(false);
  };

  const sendMessage = async (data: { userId: string; username: string; content: string }) => {
    await sendMessageApi(roomId, data);
    // Don't fetch immediately, let polling handle it
  };

  useEffect(() => {
    if (!userId) return;

    const startPolling = async () => {
      setIsLoading(true);
      await fetchRoomStatus();
      setIsLoading(false);

      // Start polling every 2 seconds
      intervalRef.current = setInterval(fetchRoomStatus, 2000);
    };

    startPolling();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [roomId, userId]);

  // Stop polling if room is inactive
  useEffect(() => {
    if (roomData && (!roomData.isActive || new Date() >= new Date(roomData.expiresAt))) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [roomData]);

  return {
    roomData,
    messages,
    users,
    isLoading,
    error,
    sendMessage,
    refetch,
  };
}
