import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    const content = message.trim();
    if (!content || isLoading) return;

    setIsLoading(true);
    try {
      await onSendMessage(content);
      setMessage("");
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
    setMessage(textarea.value);
  };

  return (
    <div className="flex gap-3 items-end max-w-4xl mx-auto">
      {/* Attachment Button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-white/70 hover:text-white hover:bg-white/10 p-3"
      >
        <Paperclip className="w-5 h-5" />
      </Button>

      {/* Message Input */}
      <div className="flex-1 relative">
        <Textarea
          placeholder="اكتب رسالتك هنا..."
          value={message}
          onChange={autoResize}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 pr-12 bg-white rounded-xl border-0 outline-none resize-none max-h-32 min-h-[48px]"
          rows={1}
        />
        
        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-3 bottom-3 text-gray-400 hover:text-gray-600 p-1"
        >
          <Smile className="w-4 h-4" />
        </Button>
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={!message.trim() || isLoading}
        className="p-3 bg-chat-primary text-white rounded-full hover:bg-chat-primary/90 disabled:bg-gray-400"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}
