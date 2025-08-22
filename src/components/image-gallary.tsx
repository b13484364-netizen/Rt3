import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Check, X } from "lucide-react";

interface ImageGalleryProps {
  selectedImage: string;
  onImageSelect: (imageKey: string) => void;
  customImageUrl?: string;
  onCustomImageClear: () => void;
  onImageUpload: (file: File) => Promise<void>;
}

const predefinedImages = [
  {
    key: "1",
    name: "جبال الثلج",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
  },
  {
    key: "2",
    name: "الغابة الخضراء",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
  },
  {
    key: "3",
    name: "أشجار النخيل",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
  },
  {
    key: "4",
    name: "التقنية الحديثة",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
  },
  {
    key: "5",
    name: "غابة الخيزران",
    url: "https://images.unsplash.com/photo-1528319725582-ddc096101511?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
  },
  {
    key: "6",
    name: "قمة الجبل",
    url: "https://images.unsplash.com/photo-1464822759844-d150d4da0db3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
  },
  {
    key: "7",
    name: "تحت الماء",
    url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
  },
  {
    key: "8",
    name: "مغامر الجبال",
    url: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
  }
];

export function ImageGallery({
  selectedImage,
  onImageSelect,
  customImageUrl,
  onCustomImageClear,
  onImageUpload
}: ImageGalleryProps) {
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploadLoading(true);
    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadLoading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Predefined Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {predefinedImages.map((image) => (
          <Card
            key={image.key}
            className={`cursor-pointer group transition-all hover:shadow-lg ${
              selectedImage === image.key && !customImageUrl
                ? "ring-2 ring-chat-primary bg-chat-primary/5"
                : ""
            }`}
            onClick={() => {
              onImageSelect(image.key);
              onCustomImageClear();
            }}
          >
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                {selectedImage === image.key && !customImageUrl && (
                  <Check className="text-white text-2xl opacity-100" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <span className="text-white text-sm font-medium">{image.name}</span>
                <span className="text-gray-300 text-xs mr-2">{image.key}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Image Upload */}
      <div className="space-y-2">
        {customImageUrl ? (
          <Card className="p-4 ring-2 ring-chat-primary bg-chat-primary/5">
            <div className="flex items-center gap-4">
              <img
                src={customImageUrl}
                alt="صورة مخصصة"
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium text-chat-primary">صورة مخصصة محددة</p>
                <p className="text-sm text-gray-600">تم رفع صورتك المخصصة بنجاح</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onCustomImageClear}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ) : (
          <label className="block w-full cursor-pointer">
            <Card className="border-2 border-dashed border-gray-300 hover:border-chat-primary hover:bg-gray-50 transition-colors p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">رفع صورة مخصصة</p>
              <p className="text-sm text-gray-500">اسحب الصورة هنا أو انقر للاختيار</p>
              <p className="text-xs text-gray-400 mt-1">الحد الأقصى: 5 ميجابايت</p>
              {uploadLoading && (
                <p className="text-sm text-chat-primary mt-2">جاري الرفع...</p>
              )}
            </Card>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploadLoading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
