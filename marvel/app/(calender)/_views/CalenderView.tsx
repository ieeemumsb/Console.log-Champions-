"use client";

import React from "react";
import { EventCalender } from "../_components/EventCalender";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "../_components/EventCard";
import { AddEventForm } from "../_components/AddEventForm";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const CalenderView = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [open, setOpen] = React.useState(false);

  // const events = useQuery(api.events.getAllUserEventsForToday);

  // if (!events) {
  //   return (
  //     <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-colors bg-white">
  //       Loading...
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 space-y-6">
      <AddEventForm open={open} onOpenChange={setOpen} />
      {/* ---- Page Header ---- */}
      <header className="space-y-2 flex justify-between md:flex-row flex-col items-start md:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          <p className="text-muted-foreground">
            Stay updated with what’s happening next
          </p>
        </div>

        <Button onClick={() => setOpen(true)} className="mt-4 self-end">
          <PlusCircle className="h-5 w-5 mr-2" /> Add Event
        </Button>
      </header>

      {/* <div className="grid grid-cols-1 gap-6">
        {events.map((event,index) => (
          <EventCard key={index} {...event} />
        ))}
      </div> */}

      {/* Right Side: Calendar */}
      <EventCalender date={date} setDate={setDate} />
    </div>
  );
};
