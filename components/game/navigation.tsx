'use client';

import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Swords,
  GraduationCap,
  Settings,
  Calendar,
  DollarSign,
} from 'lucide-react';

type View = 'dashboard' | 'squad' | 'tournament' | 'match' | 'academy' | 'players';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  teamName: string;
  budget: number;
  gameDate: string;
}

export function Navigation({
  currentView,
  onViewChange,
  teamName,
  budget,
  gameDate,
}: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'squad' as View, label: 'My Squad', icon: Users },
    { id: 'players' as View, label: 'All Players', icon: Users },
    { id: 'tournament' as View, label: 'Tournament', icon: Trophy },
    { id: 'match' as View, label: 'Match Center', icon: Swords },
    { id: 'academy' as View, label: 'Academy', icon: GraduationCap },
  ];

  return (
    <nav className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo/Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Cricket Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">{teamName}</p>
      </div>

      {/* Game Info */}
      <div className="p-4 border-b border-sidebar-border space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(gameDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold">{budget.toFixed(1)} Cr</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                currentView === item.id
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <div className="p-2 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </nav>
  );
}
