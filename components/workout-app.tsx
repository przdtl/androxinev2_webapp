'use client';

import { useState } from 'react';
import { AppProvider } from '@/lib/app-context';
import { BottomNavigation, type TabId } from './bottom-navigation';
import { CategoriesScreen } from './screens/categories-screen';
import { TemplatesScreen } from './screens/templates-screen';
import { SetsScreen } from './screens/sets-screen';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('sets');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-14 safe-area-top">
        {activeTab === 'categories' && <CategoriesScreen />}
        {activeTab === 'templates' && <TemplatesScreen />}
        {activeTab === 'sets' && <SetsScreen />}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Toast Notifications */}
      <Toaster position="top-center" />
    </div>
  );
}

export function WorkoutApp() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
