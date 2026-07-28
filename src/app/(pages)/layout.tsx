import type { ReactNode } from 'react';

// TODO: 실제 Sidebar 컴포넌트로 교체 (src/components/common/Sidebar.tsx)
const NAV_ITEMS = [
  { href: '/dashboard', label: '대시보드' },
  { href: '/alert', label: '알림' },
  { href: '/report', label: '개선리포트' },
  { href: '/monthlyReport', label: '월간리포트' },
  { href: '/channel', label: '채널연동' },
  { href: '/mypage', label: '회원설정' },
  { href: '/cs', label: '자체 CS' },
  { href: '/csAutomation', label: 'CS 가이드라인 자동화' },
];

export default function PagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r p-4">
        <div className="mb-6 text-lg font-bold">SELLoN</div>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-gray-600 hover:text-black">
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
