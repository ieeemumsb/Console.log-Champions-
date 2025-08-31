"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/providers/theme-provider";
import { PublicSidebar } from "./(public)/_components/PublicSidebar";
import { Toaster } from "sonner";
import AvengersTriviaMCQ from "@/components/QA";
import { useIsMobile } from "@/hooks/use-mobile";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMobile = useIsMobile();
  return (
    <main className="relative" suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider>
          <PublicSidebar />
          {isMobile && <SidebarTrigger className="mt-2 ml-2"/>}

          {children}
          <Toaster />
          <AvengersTriviaMCQ />
        </SidebarProvider>
      </ThemeProvider>
    </main>
  );
}
