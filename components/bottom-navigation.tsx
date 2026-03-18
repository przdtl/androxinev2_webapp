'use client';

import { FolderOpen, ListChecks, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/hooks/use-telegram';

export type TabId = 'categories' | 'templates' | 'sets';

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'categories' as TabId, label: 'Категории', icon: FolderOpen },
  { id: 'templates' as TabId, label: 'Шаблоны', icon: ListChecks },
  { id: 'sets' as TabId, label: 'Подходы', icon: ClipboardList },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { haptic } = useTelegram();

  const handleTabChange = (tab: TabId) => {
    haptic?.selectionChanged();
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-stretch h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors touch-feedback",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "size-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs",
                isActive ? "font-medium" : "font-normal"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
