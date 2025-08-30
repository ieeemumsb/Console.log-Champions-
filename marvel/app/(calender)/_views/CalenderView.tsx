"use client"

import React from 'react'
import { EventCalender } from '../_components/EventCalender'
import { CalendarDays, MapPin, Clock, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const CalenderView = () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="p-6 space-y-6">
      {/* ---- Page Header ---- */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <p className="text-muted-foreground">
          Stay updated with what’s happening next
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Event Cards */}
        <div className="space-y-4">
          <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <h2 className="font-semibold text-lg">🎤 Music Festival</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <CalendarDays className="h-4 w-4" /> June 10, 2025
              <Clock className="h-4 w-4 ml-3" /> 7:00 PM
              <MapPin className="h-4 w-4 ml-3" /> Central Park
            </div>
            <p className="mt-2 text-sm text-gray-600">
              A fun evening with live bands, food stalls, and art exhibitions.
            </p>
          </div>

          <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <h2 className="font-semibold text-lg">📚 Tech Workshop</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <CalendarDays className="h-4 w-4" /> June 15, 2025
              <Clock className="h-4 w-4 ml-3" /> 10:00 AM
              <MapPin className="h-4 w-4 ml-3" /> Innovation Hub
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Learn about the latest trends in AI and web development with hands-on sessions.
            </p>
          </div>

          <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <h2 className="font-semibold text-lg">⚽ Charity Football Match</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <CalendarDays className="h-4 w-4" /> June 20, 2025
              <Clock className="h-4 w-4 ml-3" /> 4:00 PM
              <MapPin className="h-4 w-4 ml-3" /> City Stadium
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Join us for a friendly match and support local charities.
            </p>
          </div>

          <Button className="mt-4">
            <PlusCircle className="h-5 w-5 mr-2" /> Add Event
          </Button>
        </div>

        {/* Right Side: Calendar */}
        <EventCalender date={date} setDate={setDate} />
      </div>
    </div>
  );
}
