"use client";

import {
    BarChart3,
    CreditCard,
    HelpCircle,
    LayoutDashboard,
    Receipt,
    Settings,
    Target,
    TrendingUp,
    ExternalLink,
    Mail,
    Menu,
    X
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
    HoverCard, 
    HoverCardContent, 
    HoverCardTrigger 
} from "@/components/ui/hover-card";
import { UserButton } from '@clerk/nextjs';
import { ModeToggle } from '../../../components/ModeToggle';
import { useState } from "react";

const navItems = [
    { href: "/finance/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/finance/transactions", label: "Transactions", icon: Receipt },
    { href: "/finance/budgets", label: "Budgets", icon: Target },
    { href: "/finance/goals", label: "Goals", icon: TrendingUp },
    { href: "/finance/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/finance/accounts", label: "Accounts", icon: CreditCard },
];

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const handleEmailClick = () => {
        window.location.href = '/contact';
    };

    const handleHelpPageClick = () => {
        window.open('/help', '_blank');
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                          <div className="container flex h-14 
          +  items-center justify-between">
       {/* Logo - Always on the left */}
                       <div className="flex">
                          <Link href="/starkledger" 
                            className="ml-2 flex items-center space-x-2">
                        <span className="font-bold text-lg">StarkLedger</span>
                    </Link>
                </div>

                {/* Desktop Navigation - Hidden on mobile */}
                <div className="hidden md:flex flex-1 items-center space-x-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium
                                    ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-primary hover:bg-accent"}
                                `}
                            >
                                <Icon size={16} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Right side items */}
                <div className="flex items-center justify-end space-x-2">
                    {/* Help button */}
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Button variant="ghost" size="sm" className="hidden md:flex">
                                <HelpCircle size={16} />
                            </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80" align="end">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Need Help?</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Get support with StarkLedger or learn about all the core functionalities.
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={handleEmailClick}
                                    >
                                        <Mail className="h-3 w-3 mr-2" />
                                        Contact Support
                                    </Button>
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={handleHelpPageClick}
                                    >
                                        <ExternalLink className="h-3 w-3 mr-2" />
                                        View Help Guide
                                    </Button>
                                </div>
                                
                                <div className="text-xs text-muted-foreground pt-2 border-t">
                                    <p>Secure contact form • Quick response</p>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>

                    {/* Settings link - Desktop only */}
                    <Link href="/starkledger/settings" className="hidden md:flex">
                        <Button variant="ghost" size="sm">
                            <Settings size={16} />
                        </Button>
                    </Link>

                    {/* Theme toggle */}
                    <ModeToggle />
                    
                    {/* User profile */}
                    <UserButton afterSignOutUrl="/" />

                    {/* Mobile menu button */}
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="md:hidden">
                                {isOpen ? <X size={16} /> : <Menu size={16} />}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname.startsWith(item.href);
                                
                                return (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-2 w-full ${
                                                isActive ? "bg-accent text-accent-foreground" : ""
                                            }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Icon size={16} />
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/starkledger/settings"
                                    className="flex items-center gap-2 w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Settings size={16} />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleHelpPageClick}>
                                <HelpCircle size={16} className="mr-2" />
                                Help
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}