'use client';

import { useState } from 'react';
import { AppProvider } from '@/lib/app-context';
import { useApp } from '@/lib/app-context';
import { BottomNavigation, type TabId } from './bottom-navigation';
import { CategoriesScreen } from './screens/categories-screen';
import { TemplatesScreen } from './screens/templates-screen';
import { SetsScreen } from './screens/sets-screen';
import { Toaster } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('sets');
  const { isLoading, isAuthenticated } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTitle>Требуется авторизация Telegram</AlertTitle>
          <AlertDescription>
            Откройте приложение из Telegram, чтобы передать initData и выполнить вход.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
