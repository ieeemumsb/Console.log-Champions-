"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  CheckCircle2,
  MoreVertical,
  OctagonMinus,
  Trash,
  XCircle,
} from "lucide-react";
import { MapView } from "../_components/MapView";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ClearStatus = "success" | "failed" | "ignored";

export const CalenderIdView = ({
  calenderId,
}: {
  calenderId: Id<"events">;
}) => {
  const event = useQuery(api.events.getEvent, { id: calenderId });
  const deleteEvent = useMutation(api.events.deleteEvent);
  const router = useRouter();
  const clearEvent = useMutation(api.events.clearEvent);

  const [clearingStatus, setClearingStatus] = useState<ClearStatus | null>(
    null
  );

  const handleDelete = () => {
    deleteEvent({ id: calenderId });
    router.push("/calender");
    toast("Event deleted");
  };

  if (!event) return <div>Loading...</div>;

  const handleClear = async (status: ClearStatus) => {
    try {
      setClearingStatus(status);
      await clearEvent({ id: calenderId, status }); // use status directly
      toast(`Event marked as ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear event");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-6 gap-6 mb-10">
      {/* Event Details + Actions */}
      <div className="flex justify-between items-start ">
        <div className="flex-1 pr-8">
          <h1
            className={cn(
              "text-3xl font-bold",
              event.isCleared && "line-through"
            )}
          >
            {event.title}
          </h1>
          <p className="text-gray-600 mt-2">{event.description}</p>
          {event.isCleared && (
            <p className="mt-4 text-lg font-semibold text-emerald-600">
              Cleared Status: {clearingStatus ?? "Cleared"}
            </p>
          )}
          <div className="text-sm text-muted-foreground mt-4 space-y-1">
            <p>Date: {event.date}</p>
            <p>Time: {event.time}</p>
            <p>Location: {event.location}</p>
            <p>
              Priority:{" "}
              <span
                className={
                  "inline-block px-2 py-0.5 rounded text-xs font-semibold text-white " +
                  (event.priority === "High"
                    ? "bg-red-500"
                    : event.priority === "Medium"
                      ? "bg-yellow-400 text-black"
                      : event.priority === "Low"
                        ? "bg-green-500"
                        : "bg-gray-400")
                }
              >
                {event.priority}
              </span>
            </p>
          </div>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!!event.isCleared}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Clear Event</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleClear("success")}
                disabled={!!event.isCleared}
              >
                <CheckCircle2 className="text-emerald-400" />
                Success
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleClear("failed")}
                disabled={!!event.isCleared}
              >
                <XCircle className="text-red-400" /> Failed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleClear("ignored")}
                disabled={!!event.isCleared}
              >
                <OctagonMinus className="text-yellow-500" /> Ignored
              </DropdownMenuItem>
              <DropdownMenuLabel className="mt-2 text-xs text-muted-foreground">
                Danger Zone
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={!!event.isCleared}
                className=""
              >
                <Trash className="text-destructive" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <MapView location={event.location} />
      </div>
    </div>
  );
};
