"use client"
import { Button } from "@/components/ui/button";
import { History, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className=" top-0 fixed right-0 border-b  z-[51] py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Right section: Logo */}
       <div />
        {/* Left section: Buttons */}
        <div className="flex gap-2">
          <Link href={"/calender"}>
            <Button variant={pathname === "/calender" ? "default" : "outline"} className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Events</span>
            </Button>
          </Link>
          <Link href={"/history"}>
            <Button variant={pathname === "/history" ? "default" : "outline"} className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
