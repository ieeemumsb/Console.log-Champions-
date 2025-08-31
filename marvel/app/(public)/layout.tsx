"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PublicSidebar } from "./_components/PublicSidebar";



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <PublicSidebar  />
      <main className="flex-1">
        <SidebarTrigger /> {/* toggles collapse */}
        {children}
      </main>
    </SidebarProvider>
  );
}
