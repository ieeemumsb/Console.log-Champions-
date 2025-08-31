"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import React from "react";
import { ModeToggle } from "./ModeToggle";

export const ButtonUser = () => {
  const user = useUser();
  return (
    <div className="flex gap-2 items-center w-full justify-between">
      {user.user && (
        <div className="border py-2 px-2 rounded-lg flex items-center gap-2 w-full">
          <UserButton />
          <span className="text-sm">{user.user.fullName}</span>
        </div>
      )}
      <ModeToggle />
    </div>
  );
};
