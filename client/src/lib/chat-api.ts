import { apiRequest } from "./queryClient";
import type { JoinRoom } from "@shared/schema";

export async function joinRoom(data: JoinRoom) {
  const response = await apiRequest("POST", "/api/rooms/join", data);
  return response.json();
}

export async function getRoomStatus(roomId: string, queryParams?: string) {
  const url = queryParams 
    ? `/api/rooms/${roomId}/status?${queryParams}`
    : `/api/rooms/${roomId}/status`;
  const response = await apiRequest("GET", url);
  return response.json();
}

export async function sendMessage(roomId: string, data: { userId: string; username: string; content: string }) {
  const response = await apiRequest("POST", `/api/rooms/${roomId}/messages`, data);
  return response.json();
}

export async function leaveRoom(roomId: string, userId: string) {
  const response = await apiRequest("POST", `/api/rooms/${roomId}/leave`, { userId });
  return response.json();
}

export async function closeRoom(roomId: string, userId: string) {
  const response = await apiRequest("POST", `/api/rooms/${roomId}/close`, { userId });
  return response.json();
}
