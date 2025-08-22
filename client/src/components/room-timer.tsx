import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface RoomTimerProps {
  expiresAt: string | Date;
}

export function RoomTimer({ expiresAt }: RoomTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeRemaining("00:00");
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const isLowTime = () => {
    const [minutes, seconds] = timeRemaining.split(":").map(Number);
    return minutes < 5; // Less than 5 minutes
  };

  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-2 px-3 py-1 ${
        isLowTime()
          ? "bg-red-500/20 text-red-200 border-red-500/30"
          : "bg-white/10 text-white/90"
      }`}
    >
      <Clock className="w-4 h-4" />
      <span className="font-mono text-sm">{timeRemaining}</span>
    </Badge>
  );
}
