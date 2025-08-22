import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Eye, EyeOff, Upload, DoorOpen } from "lucide-react";
import { ImageGallery } from "@/components/image-gallery";
import { joinRoom } from "@/lib/chat-api";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [customImageUrl, setCustomImageUrl] = useState<string>("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/[0-9]/)) strength++;
    if (pwd.match(/[^A-Za-z0-9]/)) strength++;
    return strength;
  };

  const strengthColors = ["bg-gray-200", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-400"];
  const strengthTexts = ["", "ضعيفة جداً", "ضعيفة", "متوسطة", "قوية"];
  const strength = getPasswordStrength(password);

  const handleJoinRoom = async () => {
    if (!selectedImage && !customImageUrl) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار صورة أو رفع صورة مخصصة",
        variant: "destructive",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة مرور قوية (6 أحرف على الأقل)",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المستخدم",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await joinRoom({
        imageKey: selectedImage || "custom",
        customImageUrl: customImageUrl || undefined,
        password,
        username: username.trim(),
      });

      // Store session data
      localStorage.setItem("chatSession", JSON.stringify({
        roomId: result.room.id,
        userId: result.userId,
        username: username.trim(),
        isCreator: result.room.isCreator,
      }));

      setLocation(`/chat/${result.room.id}`);
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "فشل في الانضمام إلى الغرفة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل في رفع الصورة');
      }

      const { imageUrl } = await response.json();
      setCustomImageUrl(imageUrl);
      setSelectedImage(""); // Clear gallery selection
      
      toast({
        title: "نجح الرفع",
        description: "تم رفع الصورة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-chat-primary rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">تطبيق المحادثة الآمن</h1>
            <p className="text-gray-600">اختر صورة وأدخل كلمة مرور للدخول إلى غرفة محادثة آمنة</p>
          </div>

          {/* Image Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">اختر صورة:</h2>
            <ImageGallery
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
              customImageUrl={customImageUrl}
              onCustomImageClear={() => setCustomImageUrl("")}
              onImageUpload={handleImageUpload}
            />
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم:</Label>
              <Input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={50}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور:</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة مرور قوية"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              {/* Password Strength */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i <= strength ? strengthColors[strength] : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    قوة كلمة المرور: {strengthTexts[strength]}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mb-8">
            <Button
              onClick={handleJoinRoom}
              disabled={isLoading || (!selectedImage && !customImageUrl) || !password || !username.trim()}
              className="w-full bg-chat-primary hover:bg-chat-primary/90 text-white"
              size="lg"
            >
              <DoorOpen className="w-5 h-5 ml-2" />
              {isLoading ? "جاري الانضمام..." : "دخول الغرفة"}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">تعليمات:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• اختر صورة من المعرض أو ارفع صورة مخصصة</li>
              <li>• أدخل كلمة مرور قوية</li>
              <li>• يمكن لعدة أشخاص الدخول بنفس المفتاح</li>
              <li>• شارك المفتاح مع الأشخاص المرغوب دعوتهم</li>
              <li>• المستخدم الأول يمكنه إغلاق الغرفة قبل انتهاء الوقت</li>
              <li>• مدة الغرفة: ساعة واحدة كحد أقصى</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
