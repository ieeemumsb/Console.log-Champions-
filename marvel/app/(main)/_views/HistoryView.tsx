"use client";

import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export const HistoryView = () => {
    const events = useQuery(api.events.getHistory);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">History</h1>
                <p className="text-gray-600">Review your cleared events and their details below.</p>
            </header>

            {events && events.length > 0 ? (
                <div className="grid gap-6">
                    {events.map((event) => (
                        <div key={event._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <h2 className="text-xl font-semibold mb-1">{event.title}</h2>
                            <p className="text-gray-700 mb-1">
                                <span className="font-medium">Date:</span>{" "}
                                {new Date(event.date).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                            <p className="text-gray-700 mb-1">
                                <span className="font-medium">Location:</span> {event.location}
                            </p>
                            <Badge
                                className={
                                    [
                                        "px-3 py-1 rounded-full font-semibold text-sm",
                                        event.isCleared === "success"
                                            ? "bg-green-600 text-white"
                                            : event.isCleared === "failed"
                                                ? "bg-red-600 text-white"
                                                : event.isCleared === "ignored"
                                                    ? "bg-yellow-300 text-black"
                                                    : ""
                                    ].join(" ")
                                }
                            >
                                {event.isCleared}
                            </Badge>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center mt-12">No history available.</p>
            )}
        </div>
    );
}
