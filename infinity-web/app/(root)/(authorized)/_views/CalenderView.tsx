"use client";

import React from "react";
import { EventCalender } from "../_components/EventCalender";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "../_components/EventCard";
import { AddEventForm } from "../_components/AddEventForm";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { SkeletonEventCard } from "../_components/SkeletonEventCard";

const priorityColors: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-400",
  high: "bg-red-500",
};



export const CalenderView = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [open, setOpen] = React.useState(false);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const selectedDateString = date ? formatDate(date) : formatDate(new Date());
  const events = useQuery(api.events.getAllUserEvents, {
    date: selectedDateString,
  });

  if (!events) {
    return (
      <div className="border rounded-xl p-4 shadow-sm bg-white max-w-md w-full mx-auto">
        <SkeletonEventCard />
        <SkeletonEventCard />
        <SkeletonEventCard />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 flex flex-col max-w-7xl mx-auto">
      <AddEventForm open={open} onOpenChange={setOpen} />
      {/* ---- Page Header ---- */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold leading-tight">
            Upcoming Events
          </h1>
          <p className="text-muted-foreground text-sm max-w-md">
            Stay updated with what’s happening next
          </p>
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="flex items-center px-4 py-2"
        >
          <PlusCircle className="h-5 w-5 mr-2" /> Add Event
        </Button>
      </header>

      <div className="flex flex-col md:flex-row justify-between gap-8 items-center md:items-start">
        <div className="flex flex-col space-y-4 max-w-3xl w-full">
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No events for today.
            </p>
          ) : (
            events.map((event, index) => {
              return (
                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 8px 15px rgba(0,0,0,0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-xl"
                >
                  <EventCard {...event} />
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right Side: Sticky Calendar */}
        <div className="md:sticky md:top-24 w-full flex flex-col items-center md:w-80">
          <EventCalender
            date={date}
            setDate={(d) => {
              console.log("Selected date:", d);
              setDate(d);
            }}
          />
        </div>
      </div>
    </div>
  );
};
