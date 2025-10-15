
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Zap,
  Settings,
  Network,
  Sun,
  Moon,
  LifeBuoy
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Layout({ children }) {
  const location = useLocation();
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const { data: branding } = useQuery({
    queryKey: ['agency-branding'],
    queryFn: async () => {
      const brands = await base44.entities.AgencyBranding.list();
      return brands[0] || {
        agency_name: 'Synergy AI',
        primary_color: '#6D28D9', // purple-700
        secondary_color: '#DB2777', // pink-600
        tagline: 'Your Afro-Tech AI Team'
      };
    }
  });

  const navigationItems = [
    { title: 'Command Center', url: createPageUrl('Dashboard'), icon: LayoutDashboard },
    { title: 'Power-Ups', url: createPageUrl('PowerUps'), icon: Zap },
    { title: 'Contacts', url: createPageUrl('Contacts'), icon: Users },
    { title: 'Content Calendar', url: createPageUrl('ContentCalendar'), icon: Calendar },
    { title: 'Admin Settings', url: createPageUrl('AdminDashboard'), icon: Settings, adminOnly: true }
  ];

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary-color: ${branding?.primary_color || '#6D28D9'};
          --secondary-color: ${branding?.secondary_color || '#DB2777'};
        }
      `}</style>
      <div className={cn("min-h-screen flex w-full bg-gray-100 dark:bg-gray-900 transition-colors duration-300", isDarkMode ? 'dark' : '')}>
        <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl flex flex-col">
          <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              {branding?.logo_url ? (
                <img src={branding.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white p-1"/>
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-primary to-secondary">
                  <Network className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                  {branding?.agency_name || 'Synergy AI'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {branding?.tagline || 'Your Afro-Tech AI Team'}
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 flex-1">
            <SidebarMenu>
              {navigationItems.map((item) => {
                if (item.adminOnly && user?.role !== 'admin') return null;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link to={item.url} className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50",
                      isActive && "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary dark:text-white"
                    )}>
                      <div className="relative flex items-center">
                        {isActive && <div className="absolute -left-4 h-6 w-1 rounded-r-full bg-gradient-to-b from-primary to-secondary"></div>}
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2 text-gray-600 dark:text-gray-300">
              <LifeBuoy className="w-5 h-5" /> Support
            </Button>
            <Button variant="ghost" onClick={() => setIsDarkMode(!isDarkMode)} className="w-full justify-start gap-2 text-gray-600 dark:text-gray-300">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
