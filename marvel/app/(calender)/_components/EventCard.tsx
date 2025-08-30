import { CalendarDays, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface EventCardProps {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  priority?: "High" | "Medium" | "Low";
  _id: Id<"events">
  isCleared?: boolean;
}

const priorityColors = {
  High: "bg-red-500",
  Medium: "bg-yellow-400",
  Low: "bg-green-500",
};

export const EventCard: React.FC<EventCardProps> = ({
 title,
 date,
 time,
 location,
 description,
 priority,
 _id,
 isCleared
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-colors bg-white"
    >
      <Link href={`/calender/${_id}`}>
        <div className="flex justify-between items-start">
          <h2
            className={cn("font-semibold text-lg", isCleared && "line-through")}
          >
            {title}
          </h2>
          <span
            className={`text-white px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority || "Low"]}`}
          >
            {priority}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
          <CalendarDays className="h-4 w-4" /> {date}
          <Clock className="h-4 w-4 ml-3" /> {time}
          <MapPin className="h-4 w-4 ml-3" /> {location}
        </div>
      </Link>
    </motion.div>
  );
};

