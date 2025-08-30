"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";

export const EventCalender = ({ date, setDate }:{ date: Date | undefined, setDate: (date: Date | undefined) => void }) => {

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-lg border shadow-sm"
      numberOfMonths={1}
    />
  );
};
