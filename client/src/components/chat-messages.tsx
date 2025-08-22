import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCheck } from "lucide-react";
import type { Message, RoomUser } from "@shared/schema";

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  users: RoomUser[];
}

export function ChatMessages({ messages, currentUserId, users }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getUserInitial = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const getUserColor = (userId: string) => {
    const colors = [
      "bg-chat-secondary",
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><circle cx='2' cy='2' r='1' fill='%23ffffff' opacity='0.1'/></svg>")`,
        backgroundRepeat: "repeat"
      }}
    >
      {/* Welcome Message */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="bg-black/20 text-white/80">
          مرحباً بكم في الغرفة الآمنة • مدة الغرفة: 60 دقيقة
        </Badge>
      </div>

      {/* Messages */}
      {messages.map((message) => {
        const isOwn = message.userId === currentUserId;
        const userColor = getUserColor(message.userId);

        return (
          <div
            key={message.id}
            className={`flex gap-2 max-w-md ${
              isOwn ? "mr-auto flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                isOwn ? "bg-chat-primary" : userColor
              }`}
            >
              {getUserInitial(message.username)}
            </div>

            {/* Message Content */}
            <div>
              <div
                className={`p-3 shadow-sm ${
                  isOwn
                    ? "message-bubble-sent rounded-tl-none"
                    : "message-bubble-received rounded-tr-none"
                }`}
              >
                <p className="text-gray-900 break-words">{message.content}</p>
              </div>
              
              {/* Message Info */}
              <div
                className={`flex items-center gap-1 mt-1 text-xs text-white/60 ${
                  isOwn ? "justify-end" : ""
                }`}
              >
                {!isOwn && (
                  <>
                    <span className="font-medium">{message.username}</span>
                    <span>•</span>
                  </>
                )}
                <span>{formatTime(message.timestamp!)}</span>
                {isOwn && (
                  <>
                    <span>•</span>
                    <CheckCheck className="w-3 h-3 text-chat-secondary" />
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
