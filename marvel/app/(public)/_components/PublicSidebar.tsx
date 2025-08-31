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
import { Authenticated } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import { ButtonUser } from "@/components/ButtonUser";

const items = [
  {
    title: "Stark Finance",
    url: "#",
    icon: ChartColumnDecreasing,
    className: "text-blue-500",
  },
  {
    title: "Strange Libary",
    url: "#",
    icon: BookOpen,
    className: "text-green-500",
  },
  { title: "SpyderSense", url: "#", icon: Siren, className: "text-red-500" },
];

export function PublicSidebar() {
  return (
    <Sidebar collapsible="icon" className="z-[51]">
      <SidebarHeader>
        <SidebarMenu className="px-4 py-3">
          <span className="text-2xl font-bold flex items-center">
            🕸️ <span className="ml-2">SpyWeb</span>
          </span>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup className="mt-5 px-2">
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-3">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="py-2">
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
