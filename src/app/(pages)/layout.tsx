import type { ReactNode } from 'react';
import Sidebar from '@/components/common/Sidebar';

export default function PagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-7">{children}</main>
    </div>
  );
}
