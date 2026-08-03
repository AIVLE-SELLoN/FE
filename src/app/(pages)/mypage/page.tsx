"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Upload, X, Mail, Plus, Trash2, LogOut, AlertTriangle, CheckCircle2 } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";

type Recipient = { id: string; department: string; email: string };

const WITHDRAW_REASONS = [
  "서비스를 더 이상 사용하지 않아서",
  "다른 서비스로 이전해서",
  "기능이 기대와 달라서",
  "가격이 부담돼서",
  "기타",
];

export default function MyPage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [brandName, setBrandName] = useState("마르디 메크르디");
  const [brandNameDraft, setBrandNameDraft] = useState(brandName);

  const [avatar, setAvatar] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [autoSend, setAutoSend] = useState(true);
  const [sendDay, setSendDay] = useState(1);
  const [sendTime, setSendTime] = useState("09:00");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "r1", department: "", email: "" },
  ]);

  const [resetMailSent, setResetMailSent] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<"none" | "confirm" | "done">("none");
  const [withdrawReason, setWithdrawReason] = useState("");

  const handleEnterEdit = () => {
    setBrandNameDraft(brandName);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setBrandNameDraft(brandName);
    setEditing(false);
  };

  const handleSave = () => {
    setBrandName(brandNameDraft);
    // TODO: 백엔드 계정 정보 저장 API + 월간 리포트 발송 설정 API 붙으면 이 부분을 실제 fetch 호출로 교체
    setEditing(false);
  };

  const addRecipient = () => {
    setRecipients((prev) => [...prev, { id: `r${prev.length + 1}-${Date.now()}`, department: "", email: "" }]);
  };

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRecipient = (id: string, field: "department" | "email", value: string) => {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const previewRecipient = recipients.find((r) => r.email)?.email;

  useEffect(() => {
    if (withdrawStep !== "done") return;
    // 탈퇴 완료 후 3초 뒤 자동으로 로그인 화면으로 이동 (계정이 삭제됐으니 로그아웃 상태로)
    const timer = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(timer);
  }, [withdrawStep, router]);

  return (
    <div className="flex min-h-screen bg-white">

      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-6 text-xs">
          <span className="font-medium text-slate-900">마이페이지</span>
          <NotificationBell />
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
          <h1 className="text-xl font-bold text-slate-900">마이페이지</h1>

          {/* Profile photo */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <p className="pb-4 text-sm font-bold text-slate-900">프로필 사진</p>
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                {avatar ? (
                  <img src={avatar} alt="프로필" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-300">김</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  사진 업로드
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setAvatar(URL.createObjectURL(file));
                  }}
                />
                {avatar && (
                  <button
                    onClick={() => setAvatar(null)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    제거
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Account info */}
          <div className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between pb-4">
              <p className="text-sm font-bold text-slate-900">계정 정보</p>
              {!editing && (
                <button
                  onClick={handleEnterEdit}
                  className="flex items-center gap-1 rounded-lg p-1.5 text-slate-300 opacity-0 hover:bg-slate-50 hover:text-indigo-500 group-hover:opacity-100"
                  aria-label="계정 정보 수정"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400">이메일 (읽기 전용)</p>
                <p className="pt-1 text-sm text-slate-700">seller@mardimercredi.com</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">브랜드명</p>
                {editing ? (
                  <input
                    value={brandNameDraft}
                    onChange={(e) => setBrandNameDraft(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="pt-1 text-sm text-slate-700">{brandName}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">비밀번호</p>
                <p className="pt-1 text-sm text-slate-700">••••••••</p>
                {editing && (
                  <p className="pt-1 text-xs text-slate-400">
                    보안을 위해 비밀번호는 이메일을 통해서만 재설정할 수 있어요.
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">역할</p>
                <p className="pt-1 text-sm text-slate-700">관리자</p>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end gap-2 pt-5">
                <button
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600"
                >
                  저장
                </button>
              </div>
            )}
          </div>

          {/* Identifier key */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <p className="pb-2 text-sm font-bold text-slate-900">식별자 키</p>
            <p className="rounded-lg bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-500">
              sLN-efa4eb20-84f6-11f1-bb2c-a918e3391289
            </p>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setResetMailSent(true)}
                disabled={resetMailSent}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Mail className="h-3.5 w-3.5" />
                {resetMailSent ? "메일을 보냈어요" : "재설정 메일 받기"}
              </button>
            </div>
          </div>

          {/* Monthly report email settings */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <p className="text-sm font-bold text-slate-900">월간 리포트 이메일</p>
            <p className="pt-1 text-xs leading-relaxed text-slate-400">
              매월 지정한 날짜와 시간에 월간 리포트 요약을 아래 수신 이메일로 자동 발송합니다. 사이드바의
              '월간 리포트' 화면에서도 즉시 발송할 수 있어요.
            </p>

            <div className="flex items-center justify-between pt-5">
              <div>
                <p className="text-sm font-medium text-slate-800">월간 리포트 자동 발송</p>
                <p className="text-xs text-slate-400">매월 {sendDay}일 {sendTime} 자동 발송됩니다</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoSend((v) => !v)}
                className={
                  "relative h-6 w-11 rounded-full transition-colors " +
                  (autoSend ? "bg-indigo-500" : "bg-slate-200")
                }
              >
                <span
                  className={
                    "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " +
                    (autoSend ? "translate-x-5" : "translate-x-0")
                  }
                />
              </button>
            </div>

            {autoSend && (
              <>
                <div className="grid grid-cols-2 gap-4 pt-5">
                  <div>
                    <p className="pb-1.5 text-xs font-semibold text-slate-500">발송 일자</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={28}
                        value={sendDay}
                        onChange={(e) => setSendDay(Number(e.target.value))}
                        className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-400">일</span>
                    </div>
                  </div>
                  <div>
                    <p className="pb-1.5 text-xs font-semibold text-slate-500">발송 시간</p>
                    <input
                      type="time"
                      value={sendTime}
                      onChange={(e) => setSendTime(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-5">
                  <p className="pb-2 text-xs font-semibold text-slate-500">부서 / 이메일</p>
                  <div className="flex flex-col gap-2">
                    {recipients.map((r, i) => (
                      <div key={r.id} className="flex items-center gap-2">
                        <input
                          value={r.department}
                          onChange={(e) => updateRecipient(r.id, "department", e.target.value)}
                          placeholder="부서명"
                          className="w-[120px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          value={r.email}
                          onChange={(e) => updateRecipient(r.id, "email", e.target.value)}
                          placeholder="email@example.com"
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {recipients.length > 1 && (
                          <button
                            onClick={() => removeRecipient(r.id)}
                            className="text-slate-300 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addRecipient}
                    className="mt-2 flex items-center gap-1 text-xs font-bold text-indigo-500 hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    수신자 추가
                  </button>
                </div>

                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="pb-2 text-xs font-bold text-slate-500">이메일 미리보기</p>
                  <p className="text-[11px] text-slate-400">
                    제목: [SELLoN] 2026년 7월 월간 리포트
                  </p>
                  <p className="pt-0.5 text-[11px] text-slate-400">
                    받는 사람: {previewRecipient || "수신자를 추가해주세요"}
                  </p>
                  <p className="pt-3 text-[12px] leading-relaxed text-slate-500">
                    안녕하세요. SELLoN 셀러 리포트 시스템에서 자동 발송된 메일입니다. 2026년 7월의 월간
                    리포트가 준비되었습니다. 판매 채널별 매출 요약, CS 이상 탐지 현황, 주요 지표 변동
                    내역이 포함되어 있으며, 첨부된 PDF 파일에서 전체 리포트를 확인하실 수 있습니다.
                    <br />
                    <br />
                    감사합니다. SELLoN 리포트팀
                  </p>
                  <p className="pt-3 text-[10px] text-slate-300">
                    이 메일은 자동 발송 시스템에서 전송되었습니다. 수신 거부를 원하시면 설정에서 자동
                    발송을 해제해 주세요.
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-5">
              <button
                onClick={handleCancelEdit}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600"
              >
                저장
              </button>
            </div>
          </div>

          {/* Bottom links */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600">
              <LogOut className="h-3.5 w-3.5" />
              로그아웃
            </button>
            <span className="h-3 w-px bg-slate-200" />
            <button
              onClick={() => setWithdrawStep("confirm")}
              className="text-xs font-medium text-red-400 hover:text-red-600"
            >
              회원 탈퇴
            </button>
          </div>
        </main>

        <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] bg-white px-6 py-8 text-center">
          <div className="flex items-center gap-5">
            <span className="text-[10px] text-[#99A1AF]">서비스 이용약관</span>
            <span className="text-[10px] font-bold text-[#99A1AF]">개인정보처리방침</span>
            <span className="text-[10px] text-[#99A1AF]">고객센터</span>
          </div>
          <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Withdraw confirm modal */}
      {withdrawStep === "confirm" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setWithdrawStep("none")}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl bg-white p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3 pb-5 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </span>
              <p className="text-lg font-bold text-slate-900">정말 탈퇴하시겠어요?</p>
              <div className="flex flex-col gap-1 text-xs text-slate-500">
                <p>탈퇴 즉시 로그인 정보와 개인정보는 삭제돼요.</p>
                <p>인사이트·월간 리포트 기록은 법령에 따라 별도 보관 후 자동 파기돼요.</p>
              </div>
            </div>

            <div>
              <label htmlFor="withdrawReason" className="text-xs font-semibold text-slate-500">
                탈퇴 사유 (선택)
              </label>
              <select
                id="withdrawReason"
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">사유를 선택해주세요</option>
                {WITHDRAW_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-6">
              <button
                onClick={() => setWithdrawStep("none")}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={() => setWithdrawStep("done")}
                className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw done modal */}
      {withdrawStep === "done" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative flex w-full max-w-[380px] flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center">
            <button
              onClick={() => router.push("/login")}
              aria-label="닫기"
              className="absolute right-4 top-4 text-slate-300 hover:text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-lg font-bold text-slate-900">탈퇴가 완료됐어요</p>
            <p className="text-sm text-slate-500">그동안 이용해주셔서 감사합니다.</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-black"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
