// 여러 도메인에서 공통으로 쓰는 타입만 여기에.
// 도메인 전용 타입은 src/app/api/{domain}/types.ts 에 둘 것.

export type Channel = 'naver' | 'coupang' | 'zigzag';

export interface Pagination {
  page: number;
  size: number;
  totalCount: number;
}
