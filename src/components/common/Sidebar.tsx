'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Bell,
  TrendingUp,
  FileText,
  Calendar,
  BookOpen,
  Link2,
  Package,
  MessageSquare,
  User,
  Sparkles,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';

function basePath(href: string) {
  return href.split('?')[0];
}

// 상위 메뉴(그룹) 자체나, 쿼리가 없는 단순 메뉴용: base 경로만 비교
function isActivePath(pathname: string, href: string) {
  const base = basePath(href);
  return pathname === base || pathname.startsWith(`${base}/`);
}

// 하위 메뉴용: 쿼리스트링까지 정확히 일치해야 활성으로 판단
function isExactActive(currentFullPath: string, href: string) {
  return currentFullPath === href;
}

type SimpleNavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

type NavGroup = {
  label: string;
  icon: LucideIcon;
  href: string;
  children: { label: string; href: string }[];
};

const simpleInsightNav: SimpleNavItem[] = [
  { label: '대시보드', icon: LayoutDashboard, href: '/dashboard' },
  { label: '이상 이벤트 알림창', icon: Bell, href: '/alert' },
  { label: '채널 비교 분석', icon: TrendingUp, href: '/channelCompare' },
];

const insightGroups: NavGroup[] = [
  {
    label: '개선 리포트',
    icon: FileText,
    href: '/report',
    children: [
      { label: 'AI 인사이트 리포트', href: '/report?tab=insight' },
      { label: '개선안 히스토리', href: '/report?tab=history' },
    ],
  },
  {
    label: '월간 리포트',
    icon: Calendar,
    href: '/monthlyReport',
    children: [
      { label: '월간 리포트', href: '/monthlyReport?tab=report' },
      { label: '월간 리포트 목록', href: '/monthlyReport?tab=list' },
    ],
  },
  {
    label: '가이드라인 리포트',
    icon: BookOpen,
    href: '/csAutomation',
    children: [
      { label: '가이드라인 생성', href: '/csAutomation?tab=create' },
      { label: '가이드라인 히스토리', href: '/csAutomation?tab=history' },
    ],
  },
];

const settingsGroups: NavGroup[] = [
  {
    label: '채널 연동 관리',
    icon: Link2,
    href: '/channel',
    children: [
      { label: '채널 연동', href: '/channel?view=connect' },
      { label: '채널 연동 이력', href: '/channel?view=history' },
    ],
  },
  {
    label: 'CS 문의',
    icon: MessageSquare,
    href: '/cs',
    children: [
      { label: '1:1 문의', href: '/cs?view=inquiry' },
      { label: 'FAQ', href: '/cs?view=faq' },
    ],
  },
];

const settingsSimple: SimpleNavItem[] = [
  { label: '상품 매핑 관리', icon: Package, href: '/productMapping' },
];

function NavGroupItem({
  group,
  pathname,
  currentFullPath,
}: {
  group: NavGroup;
  pathname: string;
  currentFullPath: string;
}) {
  // 그룹이 "관련 섹션"인지는 base 경로로만 판단 (아코디언 펼침 여부에만 사용, 색상에는 안 씀)
  const isSectionActive = group.children.some((c) => isActivePath(pathname, c.href));
  const [open, setOpen] = useState(isSectionActive);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ' +
          (isSectionActive
            ? 'text-slate-900 hover:bg-slate-50'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
        }
      >
        <span className="flex items-center gap-3">
          <group.icon className="shrink-0" size={16} />
          {group.label}
        </span>
        <ChevronDown
          className={'h-3.5 w-3.5 transition-transform ' + (open ? 'rotate-180' : '')}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-0.5 pb-1">
          {group.children.map((child) => {
            const active = isExactActive(currentFullPath, child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                aria-current={active ? 'page' : undefined}
                className={
                  'rounded-lg py-2 pl-12 pr-3 text-[13px] font-medium ' +
                  (active
                    ? 'bg-indigo-50 font-bold text-indigo-500'
                    : 'text-slate-600 hover:bg-slate-50')
                }
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SimpleNavLink({ item, pathname }: { item: SimpleNavItem; pathname: string }) {
  const active = isActivePath(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ' +
        (active
          ? 'bg-indigo-50 text-indigo-500'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
      }
    >
      <item.icon className="shrink-0" size={16} />
      <span>{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const currentFullPath = qs ? `${pathname}?${qs}` : pathname;

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 p-8">
        <Sparkles className="text-indigo-500" size={24} strokeWidth={2.5} />
        <span className="text-xl font-bold tracking-tight text-slate-800">SELLoN</span>
      </div>

      {/* Search */}
      <div className="px-4 pb-6">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            type="search"
            placeholder="검색"
            className="w-full rounded-lg border border-slate-100 bg-slate-50 py-2.5 pr-4 pl-10 text-[13px] text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
        <p className="px-3 pt-2 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          대시보드 &amp; 인사이트
        </p>
        {simpleInsightNav.map((item) => (
          <SimpleNavLink key={item.href} item={item} pathname={pathname} />
        ))}
        {insightGroups.map((group) => (
          <NavGroupItem
            key={group.href}
            group={group}
            pathname={pathname}
            currentFullPath={currentFullPath}
          />
        ))}

        <p className="px-3 pt-7 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          설정
        </p>
        {settingsGroups.map((group) => (
          <NavGroupItem
            key={group.href}
            group={group}
            pathname={pathname}
            currentFullPath={currentFullPath}
          />
        ))}
        {settingsSimple.map((item) => (
          <SimpleNavLink key={item.href} item={item} pathname={pathname} />
        ))}
        <SimpleNavLink item={{ label: '마이페이지', icon: User, href: '/mypage' }} pathname={pathname} />
      </nav>

      {/* Profile */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 p-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-indigo-50 text-sm font-bold text-indigo-500">
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
