import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, X, XCircle } from "lucide-react";
import { ChatMessages } from "@/components/chat-messages";
import { MessageInput } from "@/components/message-input";
import { RoomTimer } from "@/components/room-timer";
import { useChatPolling } from "@/hooks/use-chat-polling";
import { leaveRoom, closeRoom } from "@/lib/chat-api";
import { useToast } from "@/hooks/use-toast";

interface ChatPageProps {
  params: { roomId: string };
}

export default function Chat({ params }: ChatPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<any>(null);
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);

  // Load session data
  useEffect(() => {
    const stored = localStorage.getItem("chatSession");
    if (!stored) {
      setLocation("/");
      return;
    }

    const session = JSON.parse(stored);
    if (session.roomId !== params.roomId) {
      setLocation("/");
      return;
    }

    setSessionData(session);
  }, [params.roomId, setLocation]);

  const {
    roomData,
    messages,
    users,
    isLoading,
    error,
    sendMessage,
    refetch,
  } = useChatPolling(params.roomId, sessionData?.userId);

  // Handle room expiration
  useEffect(() => {
    if (roomData && (!roomData.isActive || new Date() >= new Date(roomData.expiresAt))) {
      setShowExpiredDialog(true);
    }
  }, [roomData]);

  const handleLeaveRoom = async () => {
    if (!sessionData) return;

    try {
      await leaveRoom(params.roomId, sessionData.userId);
      localStorage.removeItem("chatSession");
      setLocation("/");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في مغادرة الغرفة",
        variant: "destructive",
      });
    }
  };

  const handleCloseRoom = async () => {
    if (!sessionData || !sessionData.isCreator) return;

    if (!confirm("هل أنت متأكد من إغلاق الغرفة؟ سيتم إخراج جميع المستخدمين.")) {
      return;
    }

    try {
      await closeRoom(params.roomId, sessionData.userId);
      toast({
        title: "تم إغلاق الغرفة",
        description: "تم إغلاق الغرفة بنجاح",
      });
      setShowExpiredDialog(true);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إغلاق الغرفة",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!sessionData) return;

    try {
      await sendMessage({
        userId: sessionData.userId,
        username: sessionData.username,
        content,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة",
        variant: "destructive",
      });
    }
  };

  const getImageUrl = (imageKey: string, customImageUrl?: string) => {
    if (customImageUrl) return customImageUrl;
    
    const imageUrls: Record<string, string> = {
      "1": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      "2": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      "3": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      "4": "https://pixabay.com/get/g5fe29c43ed9431a640861da086f86385d178dc0d6a4562b2494524476d99801b9e9a0833a44347085b13ce870d76416f1da199fb08310c5fea095c88033dd2ea_1280.jpg",
      "5": "https://images.unsplash.com/photo-1528319725582-ddc096101511?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      "6": "https://pixabay.com/get/g77392ef55a801e06f69e6c321c11c51eda8f25d7adc619350e148ea7cd2d6811ff5932255b2f4b2ffa5424b1870680b63aa0b27b48bae9c1148b2054cf2a2ee7_1280.jpg",
      "7": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      "8": "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    };
    
    return imageUrls[imageKey] || imageUrls["1"];
  };

  if (!sessionData) {
    return <div>جاري التحميل...</div>;
  }

  if (showExpiredDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-chat-bg">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">انتهت صلاحية الغرفة</h2>
            <p className="text-gray-600 mb-6">
              انتهت صلاحية غرفة المحادثة. يمكنك إنشاء غرفة جديدة بمفتاح مختلف.
            </p>
            <Button
              onClick={() => {
                localStorage.removeItem("chatSession");
                setLocation("/");
              }}
              className="w-full bg-chat-primary hover:bg-chat-primary/90 text-white"
            >
              إنشاء غرفة جديدة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !roomData) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">خطأ في تحميل الغرفة</p>
            <Button onClick={() => setLocation("/")} className="mt-4">
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chat-dark flex flex-col">
      {/* Chat Header */}
      <div className="bg-chat-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
            <img
              src={getImageUrl(roomData.imageKey, roomData.customImageUrl)}
              alt="صورة الغرفة"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-medium">غرفة المحادثة الآمنة</h2>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>متصل</span>
              <span className="mx-2">•</span>
              <Users className="w-4 h-4" />
              <span>{users.length} أعضاء</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <RoomTimer expiresAt={roomData.expiresAt} />

          {/* Actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveRoom}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages
          messages={messages}
          currentUserId={sessionData.userId}
          users={users}
        />
      </div>

      {/* Message Input */}
      <div className="bg-chat-dark border-t border-white/10 p-4">
        <MessageInput onSendMessage={handleSendMessage} />
        
        {/* Admin Controls */}
        {sessionData.isCreator && (
          <div className="mt-3 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseRoom}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <XCircle className="w-4 h-4 ml-2" />
              إغلاق الغرفة (مدير الغرفة)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
