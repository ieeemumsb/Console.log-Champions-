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
import {
  DollarSign,
  BookOpen,
  CalendarDays,
 
} from "lucide-react";
import { NeedHelp } from "./NeedHelp";



const items = [
  { title: "Finance", url: "#", icon: DollarSign },
  { title: "Library", url: "#", icon: BookOpen },
  { title: "Events", url: "#", icon: CalendarDays },
];

export function PublicSidebar() {
  return (
    <Sidebar collapsible="icon">
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
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span className="text-base">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-5">
          <SidebarGroupLabel className="pb-4">Your Friendly Neighborhood</SidebarGroupLabel>
          <SidebarGroupContent>
           <NeedHelp />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <span className="text-sm text-muted-foreground text-center pb-4">
          © 2025 Spiderman Inc.
        </span>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
