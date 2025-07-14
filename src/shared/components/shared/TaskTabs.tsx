'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

interface TabConfig {
  value: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TasksTabsProps {
  defaultTab: string;
  tabs: TabConfig[];
  createComponent?: React.ReactNode;
}

export default function TasksTabs({ defaultTab, tabs, createComponent }: TasksTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full grid grid-cols-1">
      <TabsList className="w-full sticky top-[105px] overflow-auto justify-start border-b rounded h-auto p-0 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center gap-2 rounded data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 font-semibold w-full">
            {tab.icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="min-h-screen">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            {createComponent}
            <div className="space-y-6">{tab.content}</div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
