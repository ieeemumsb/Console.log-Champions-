"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { BookOpen, ChartColumnDecreasing, Siren } from "lucide-react";
import { NeedHelp } from "./NeedHelp";
import { cn } from "@/lib/utils";
import { ButtonUser } from "@/components/ButtonUser";
import { usePathname } from "next/navigation";
import Link from "next/link";

const items = [
  {
    title: "Stark Finance",
    url: "/finance",
    icon: ChartColumnDecreasing,
    className: "text-blue-500",
  },
  {
    title: "Strange Libary",
    url: "/spell",
    icon: BookOpen,
    className: "text-green-500",
  },
  {
    title: "SpyderSense",
    url: "/calender",
    icon: Siren,
    className: "text-red-500",
  },
];

export function PublicSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="z-[51]">
      <SidebarHeader>
        <SidebarMenu className="px-4 py-3">
          <Link href={"/"} className="text-2xl font-bold flex items-center">
            <span className="text-2xl font-bold flex items-center">
              🕸️ <span className="ml-2">InfinityWeb</span>
            </span>
          </Link>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup className="mt-5 px-2">
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-3">
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={cn(
                    "py-2",
                    pathname === item.url &&
                      "bg-accent-foreground text-background"
                  )}
                >
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-accent-foreground hover:text-background"
                  >
                    <a href={item.url}>
                      <item.icon className={item.className} />
                      <span className={cn("text-base")}>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-5">
          <SidebarGroupLabel className="pb-4">
            Your Friendly Neighborhood
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NeedHelp />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ButtonUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
