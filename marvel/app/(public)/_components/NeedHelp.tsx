import { AlertOctagonIcon } from "lucide-react";
import React from "react";

export const NeedHelp = () => {
  return (
    <div
      role="button"
      className="bg-red-600 text-white rounded-md w-full px-3 py-2 text-center cursor-pointer font-semibold hover:animate-pulse flex flex-col items-center gap-2"
    >
      <AlertOctagonIcon />
      Need Help
    </div>
  );
};
