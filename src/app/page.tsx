import { MacOSWindow } from "@/components/layout/MacOSWindow";
import { WindowTabs } from "@/components/layout/WindowTabs";
import { KanbanBoard } from "@/features/todo/components/KanbanBoard";

export default function Home() {
  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#f5f5f7] dark:bg-black flex flex-col">
      <MacOSWindow className="flex-1 flex flex-col w-full h-full border-none shadow-none rounded-none">
        <WindowTabs />
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          <KanbanBoard />
        </div>
      </MacOSWindow>
    </div>
  );
}
