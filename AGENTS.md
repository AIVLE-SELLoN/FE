# SELLoN FE

Next.js 16 (App Router) + TypeScript + Tailwind CSS + TanStack Query + Zustand + Zod

## 폴더 구조

```
src/
  app/
    page.tsx              # 랜딩페이지 (루트 "/")
    (guest)/               # 비로그인 접근 영역 (라우팅에 영향 없는 그룹)
      login/
      signup/
    (pages)/               # 로그인 후 메인 화면들
      dashboard/           # 대시보드
      alert/               # 알림
      report/              # 개선리포트 (舊 인사이트리포트 + 개선안 통합)
      monthlyReport/       # 월간리포트
      channel/             # 채널연동 (舊 설정 + 채널비교 통합)
      mypage/              # 회원설정 (비밀번호 변경 등 계정 관리)
      cs/                  # 자체 CS (게시판형)
      csAutomation/        # CS 가이드라인 자동화 (舊 운영액션)
      layout.tsx           # 사이드바 등 공통 셸
    api/                   # 도메인별 API 함수 (실제 라우트 아님, route.ts 없음)
      client.ts            # fetch 래퍼 (api.get/post/put/patch/delete)
      types.ts             # 공통 응답 타입 (ApiResponse, ApiError)
      {domain}/
        index.ts           # 호출 함수만
        types.ts           # zod 스키마 + z.infer 타입
    layout.tsx / providers.tsx / globals.css
  components/
    common/                 # 공용 컴포넌트
    ui/                      # shadcn 프리미티브
  hooks/
    {domain}/               # TanStack Query 훅 (도메인별)
  store/                    # zustand 전역 상태
  lib/                      # 공통 유틸
  types/                    # 전역 타입

각 (pages)/{domain}/ 안에는 필요할 때 _components, _constants, _hooks, _types, _utils
(언더바 prefix = Next.js 라우팅 제외) 콜로케이션.
```

> `auth` 도메인은 화면(페이지)이 없습니다. 토큰 재발급, 세션 체크, 로그아웃 등 화면 없이
> 동작하는 인증 로직 전용이며 `api/auth`, `hooks/auth`만 존재합니다.

## 도메인 목록 (2026-07-27 팀 확정 기준, 12개)

| 한글 | 폴더명(영문) | 비고 |
|---|---|---|
| 랜딩페이지 | `landing` | 루트 `app/page.tsx`, 舊 온보딩 |
| 로그인 | `login` | `(guest)/login` |
| 회원가입 | `signup` | `(guest)/signup` |
| 인증 | `auth` | 페이지 없음 (토큰/세션 로직) |
| 회원설정 | `mypage` | 비밀번호 변경 등 계정 관리, 신규 분리 |
| 채널연동 | `channel` | 舊 설정 + 채널비교 통합 |
| 대시보드 | `dashboard` | |
| 알림 | `alert` | 舊 이상알림 |
| 개선리포트 | `report` | 舊 인사이트리포트 + 개선안 통합 |
| 월간리포트 | `monthlyReport` | 신규 |
| 자체CS | `cs` | 게시판형 |
| CS가이드라인자동화 | `csAutomation` | 舊 운영액션 |

> 이전 버전 대비 변경 이력: `대시보드`, `채널비교` 도메인 이름은 없어진 게 아니라
> 각각 유지(대시보드) / `채널연동`으로 흡수(채널비교)되었습니다. 자세한 변경 내역은
> Notion "FE 초기 폴더 구조 세팅 안내 및 논의 사항" 문서 참고.

## API 규칙

- API 함수는 `src/app/api/{domain}`에 둔다. `index.ts`는 호출 함수만, `types.ts`는 zod 스키마와 `z.infer` 타입.
- 요청 params/body는 함수 내부에서 zod로 검증 후 `api.get/post/put/patch/delete`에 전달.
- 서버 응답 `data`도 zod로 parse해서 컴포넌트는 검증된 값만 받는다.
- 컴포넌트에서 API 직접 호출 금지. `src/hooks/{domain}`에 TanStack Query 훅으로 감싼다.
- mutation 성공 시 관련 query key invalidate.

## 네이밍

- 컴포넌트 파일: PascalCase (`ChannelCard.tsx`)
- 라우트 파일: kebab-case, 동적 라우트는 `[id].tsx`
- 훅 파일: camelCase + `use` prefix (`useAlertList.ts`)
- API/서비스 파일: camelCase
- 타입 파일: `{domain}.types.ts`
- 컴포넌트: `export function Name() {}` / 훅: `export function useXxx() {}`
- zustand 스토어: `export const useXxxStore = create(...)`
- 절대 경로 import `@/` 사용

## 참고

- API 응답 포맷/실제 zod 스키마는 Notion "API 명세서" DB 기준으로 각자 도메인 담당자가 채워넣기.
