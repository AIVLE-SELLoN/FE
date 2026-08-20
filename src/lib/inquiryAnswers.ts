// admin이 등록한 문의 답변을 localStorage에 저장/조회하는 공용 유틸.
// 목록 페이지와 상세 페이지가 같은 저장소를 봐야 상태(답변 대기/완료)가 서로 어긋나지 않아요.
// TODO: 실제 POST /inquiries/{key}/answer 붙으면 이 로직은 서버 상태 조회로 교체하면 돼요.

export type StoredAnswer = {
  date: string;
  body: string[];
};

const ANSWERS_STORAGE_KEY = "sellon_admin_inquiry_answers";

export function getAllAnswers(): Record<string, StoredAnswer> {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(ANSWERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getAnswer(id: string): StoredAnswer | null {
  return getAllAnswers()[id] ?? null;
}

export function saveAnswer(id: string, answer: StoredAnswer) {
  if (typeof window === "undefined") return;
  try {
    const all = getAllAnswers();
    all[id] = answer;
    window.localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // 저장 실패해도 화면 상태는 그대로 유지
  }
}

export function removeAnswer(id: string) {
  if (typeof window === "undefined") return;
  try {
    const all = getAllAnswers();
    delete all[id];
    window.localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // 삭제 실패해도 화면 상태는 그대로 유지
  }
}