import { Suspense, type ReactNode } from 'react';
import Sidebar from '@/components/common/Sidebar';

export default function PagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-[1280px]">
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
