'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BookOpen,
  Calendar,
  FileText,
  LayoutDashboard,
  Link2,
  MessageSquare,
  Package,
  Search,
  Sparkles,
  TrendingUp,
  User,
  type LucideIcon,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: { href: string; label: string }[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// TODO: '채널 비교 분석', '상품 매핑 관리'는 아직 라우트가 없습니다. 페이지 추가 후 href 수정 필요.
const NAV_GROUPS: NavGroup[] = [
  {
    title: '대시보드 & 인사이트',
    items: [
      { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
      { href: '/alert', label: '이상 이벤트 알림창', icon: Bell },
      { href: '/channelCompare', label: '채널 비교 분석', icon: TrendingUp },
      { href: '/report', label: '개선 리포트', icon: FileText,
        children: [
          { href: '/report?tab=insight', label: 'AI 인사이트 리포트' },
          { href: '/report?tab=history', label: '개선안 히스토리' },
        ],
       },
      { href: '/monthlyReport', label: '월간 리포트', icon: Calendar,
        children: [
          { href: '/monthlyReport?tab=report', label: '월간 리포트' },
          { href: '/monthlyReport?tab=list', label: '월간 리포트 목록' },
        ],
       },
      { href: '/csAutomation', label: '가이드라인 리포트', icon: BookOpen,
        children: [
          { href: '/csAutomation?tab=create', label: '가이드라인 생성' },
          { href: '/csAutomation?tab=history', label: '가이드라인 히스토리' },
        ],
       },
    ],
  },
  {
    title: '설정',
    items: [
      { href: '/channel', label: '채널 연동 관리', icon: Link2,
        children: [
          { href: '/channel?view=connect', label: '채널 연동' },
          { href: '/channel?view=history', label: '채널 연동 이력' },
        ],
       },
      { href: '/productMapping', label: '상품 매핑 관리', icon: Package },
      { href: '/cs', label: 'CS 문의', icon: MessageSquare, 
        children: [
          { href: '/cs?view=inquiry', label: '1:1 문의' },
          { href: '/cs?view=faq', label: 'FAQ' },
        ],
       },
      { href: '/mypage', label: '마이페이지', icon: User },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-surface-card">
      <div className="flex items-center gap-2 p-8">
        <Sparkles className="text-primary" size={24} strokeWidth={2.5} />
        <span className="text-xl font-bold tracking-tight text-slate-800">SELLoN</span>
      </div>

      <div className="px-4 pb-6">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            type="search"
            placeholder="검색"
            className="w-full rounded-field border border-slate-100 bg-slate-50 py-2.5 pr-4 pl-10 text-[13px] text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.title} className="flex flex-col gap-1">
            <p
              className={`px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase ${
                groupIndex === 0 ? 'pt-2' : 'pt-7'
              }`}
            >
              {group.title}
            </p>

            {group.items.map(({ href, label, icon: Icon, children }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              if (!children) {
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-field px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-soft text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="shrink-0" size={16} />
                    <span>{label}</span>
                  </Link>
                );
              }

              return (
                <div key={href} className="group/nav relative">
                  <Link
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-field px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-soft text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="shrink-0" size={16} />
                    <span>{label}</span>
                  </Link>
                  <div className="hidden flex-col gap-0.5 pb-1 pl-9 group-hover/nav:flex">
                    {children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="rounded-field py-2 pr-3 text-[13px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 p-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-primary-soft text-sm font-bold text-primary">
            유
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">김유진 매니저</p>
            <p className="truncate text-xs text-slate-500">Premium Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
