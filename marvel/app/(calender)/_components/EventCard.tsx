import { CalendarDays, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface EventCardProps {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  priority?: "High" | "Medium" | "Low";
}

const priorityColors = {
  High: "bg-red-500",
  Medium: "bg-yellow-400",
  Low: "bg-green-500",
};

export const EventCard: React.FC<EventCardProps> = ({
  title = "📚 Tech Workshop",
  date = "June 15, 2025",
  time = "10:00 AM",
  location = "Innovation Hub",
  description = "Learn about the latest trends in AI and web development with hands-on sessions.",
  priority = "Medium",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-colors bg-white"
    >
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg">{title}</h2>
        <span
          className={`text-white px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`}
        >
          {priority}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
        <CalendarDays className="h-4 w-4" /> {date}
        <Clock className="h-4 w-4 ml-3" /> {time}
        <MapPin className="h-4 w-4 ml-3" /> {location}
      </div>

      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </motion.div>
  );
};

