import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { AlertTriangle,} from "lucide-react";

export default function JoinCall() {
  const activeCall = useQuery(api.call.activeCall);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (activeCall) {
      setOpen(true);
      const audio = new Audio("/notification.mp3");
      audio.play();
    } else {
      setOpen(false);
    }
  }, [activeCall]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="animate-ping">
        <DialogHeader>
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle
              className="w-12 h-12 text-red-600 animate-pulse"
              aria-hidden="true"
            />
            <DialogTitle className="text-center text-lg font-bold">
              Emergency Call
            </DialogTitle>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() =>
              (window.location.href = `http://localhost:3000/call?roomID=${activeCall?.roomId}`)
            }
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Join Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
