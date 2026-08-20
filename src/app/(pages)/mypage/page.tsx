"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Upload, X, Mail, Plus, Trash2, LogOut, AlertTriangle, CheckCircle2 } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  getMyPage,
  updateMyPage,
  getCompanyKey,
  issueCompanyKey,
  getProfileImagePresignedUrl,
  uploadToPresignedUrl,
  completeProfileImageUpload,
  removeProfileImage,
  withdrawAccount,
} from "@/app/api/mypage";
import { sendEmailVerification, confirmEmailVerification } from "@/app/api/auth";
import type { MyPageResponse, Recipient } from "@/app/api/mypage/types";
import { ApiError } from "@/app/api/client";
import { useAuthStore } from "@/store/useAuthStore";

type LocalRecipient = Recipient & { localId: string };

const ROLE_LABEL: Record<string, string> = {
  ROOT: "루트 관리자",
  MEMBER: "일반 사용자",
  ADMIN: "운영자",
};

const WITHDRAW_REASONS = [
  "서비스를 더 이상 사용하지 않아서",
  "다른 서비스로 이전해서",
  "기능이 기대와 달라서",
  "가격이 부담돼서",
  "기타",
];

function toLocal(recipients: Recipient[]): LocalRecipient[] {
  return recipients.map((r, i) => ({ ...r, localId: `${r.recipientId ?? "new"}-${i}-${Date.now()}` }));
}

export default function MyPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyPageResponse | null>(null);

  const [editing, setEditing] = useState(false);
  const [brandNameDraft, setBrandNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState<string | null>(null);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [companyKeyIssuing, setCompanyKeyIssuing] = useState(false);

  const [autoSend, setAutoSend] = useState(true);
  const [sendDay, setSendDay] = useState(1);
  const [sendTime, setSendTime] = useState("09:00");
  const [recipients, setRecipients] = useState<LocalRecipient[]>([]);
  const [reportSaving, setReportSaving] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [withdrawStep, setWithdrawStep] = useState<"none" | "confirm" | "done">("none");
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;
    async function load() {
      try {
        const data = await getMyPage();
        if (cancelled) return;
        setProfile(data);
        setBrandNameDraft(data.brandName);
        setEmailDraft(data.email);
        setAutoSend(data.reportSetting.enabled);
        setSendDay(data.reportSetting.sendDay);
        setSendTime(data.reportSetting.sendTime.slice(0, 5));
        setRecipients(toLocal(data.reportSetting.recipients));
      } catch {
        if (!cancelled) setLoadError("마이페이지 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated]);

  const handleEnterEdit = () => {
    if (!profile) return;
    setBrandNameDraft(profile.brandName);
    setEmailDraft(profile.email);
    setEmailCode("");
    setEmailCodeSent(false);
    setEmailVerificationToken(null);
    setAccountError(null);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (!profile) return;
    setBrandNameDraft(profile.brandName);
    setEmailDraft(profile.email);
    setAccountError(null);
    setEditing(false);
  };

  async function handleSendEmailCode() {
    if (!emailDraft) {
      setAccountError("이메일을 입력해주세요.");
      return;
    }
    try {
      await sendEmailVerification(emailDraft);
      setEmailCodeSent(true);
    } catch (err) {
      setAccountError(err instanceof ApiError ? err.message : "인증번호 발송에 실패했습니다.");
    }
  }

  async function handleSaveAccount() {
    if (!profile) return;
    setAccountError(null);
    setAccountSaving(true);
    try {
      if (profile.editable.brandName) {
        const updated = await updateMyPage({ brandName: brandNameDraft });
        setProfile(updated);
      } else if (profile.editable.email && emailDraft !== profile.email) {
        if (!emailCode) {
          setAccountError("인증번호를 입력해주세요.");
          setAccountSaving(false);
          return;
        }
        let token = emailVerificationToken;
        if (!token) {
          const res = await confirmEmailVerification(emailDraft, emailCode);
          token = res.verificationToken;
          setEmailVerificationToken(token);
        }
        const updated = await updateMyPage({ email: emailDraft, verificationToken: token });
        setProfile(updated);
      }
      setEditing(false);
    } catch (err) {
      setAccountError(err instanceof ApiError ? err.message : "저장에 실패했습니다.");
    } finally {
      setAccountSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setAvatarUploading(true);
    try {
      const { presignedUrl, objectKey, contentType } = await getProfileImagePresignedUrl(file.name, file.size);
      await uploadToPresignedUrl(presignedUrl, file, contentType);
      const updated = await completeProfileImageUpload(objectKey);
      setProfile(updated);
    } catch {
      setAccountError("프로필 이미지 업로드에 실패했습니다.");
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleRemoveAvatar() {
    setAvatarUploading(true);
    try {
      const updated = await removeProfileImage();
      setProfile(updated);
    } catch {
      setAccountError("프로필 이미지 제거에 실패했습니다.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleIssueCompanyKey() {
    setCompanyKeyIssuing(true);
    try {
      const { companyKey } = profile?.companyKeyIssued ? await getCompanyKey() : await issueCompanyKey();
      setProfile((prev) => (prev ? { ...prev, companyKey, companyKeyIssued: true } : prev));
    } catch {
      setAccountError("초대키 발급에 실패했습니다.");
    } finally {
      setCompanyKeyIssuing(false);
    }
  }

  const addRecipient = () => {
    setRecipients((prev) => [
      ...prev,
      { localId: `new-${prev.length}-${Date.now()}`, recipientId: null, department: "OPERATIONS", email: "" },
    ]);
  };

  const removeRecipient = (localId: string) => {
    setRecipients((prev) => prev.filter((r) => r.localId !== localId));
  };

  const updateRecipient = (localId: string, field: "department" | "email", value: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.localId === localId ? { ...r, [field]: value } : r)),
    );
  };

  async function handleSaveReportSetting() {
    setReportError(null);
    setReportSaving(true);
    try {
      const updated = await updateMyPage({
        reportSetting: {
          enabled: autoSend,
          sendDay,
          sendTime: `${sendTime}:00`,
          recipients: recipients.map(({ recipientId, department, email }) => ({ recipientId, department, email })),
        },
      });
      setProfile(updated);
      setAutoSend(updated.reportSetting.enabled);
      setSendDay(updated.reportSetting.sendDay);
      setSendTime(updated.reportSetting.sendTime.slice(0, 5));
      setRecipients(toLocal(updated.reportSetting.recipients));
    } catch (err) {
      setReportError(err instanceof ApiError ? err.message : "저장에 실패했습니다.");
    } finally {
      setReportSaving(false);
    }
  }

  function handleCancelReportSetting() {
    if (!profile) return;
    setAutoSend(profile.reportSetting.enabled);
    setSendDay(profile.reportSetting.sendDay);
    setSendTime(profile.reportSetting.sendTime.slice(0, 5));
    setRecipients(toLocal(profile.reportSetting.recipients));
    setReportError(null);
  }

  async function handleWithdraw() {
    setWithdrawing(true);
    try {
      await withdrawAccount();
      setWithdrawStep("done");
    } catch {
      setWithdrawStep("none");
      setAccountError("회원 탈퇴에 실패했습니다.");
    } finally {
      setWithdrawing(false);
    }
  }

  const previewRecipient = recipients.find((r) => r.email)?.email;

  useEffect(() => {
    if (withdrawStep !== "done") return;
    logout();
    const timer = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(timer);
  }, [withdrawStep, router, logout]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
        <div className="h-[60px] w-[60px] animate-spin rounded-full border-[3.89px] border-[#E4E4E7] border-t-indigo-500" />
        <div className="text-center">
          <p className="text-[28px] font-bold text-[#18181B]">불러오는 중...</p>
          <p className="pt-2 text-[13px] text-[#71717A]">잠시만 기다려 주세요. 회원 정보를 불러오는 중입니다</p>
        </div>
      </div>
    );
  }

  if (loadError || !profile) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{loadError ?? "정보를 불러오지 못했습니다."}</div>;
  }

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
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt="프로필" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-300">{profile.name.slice(0, 1)}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {avatarUploading ? "처리 중..." : "사진 업로드"}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                {profile.profileImageUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-50"
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
                <p className="text-xs font-semibold text-slate-400">
                  이메일 {!profile.editable.email && "(읽기 전용)"}
                </p>
                {editing && profile.editable.email ? (
                  <div className="flex flex-col gap-2 pt-1">
                    <input
                      value={emailDraft}
                      onChange={(e) => {
                        setEmailDraft(e.target.value);
                        setEmailVerificationToken(null);
                        setEmailCodeSent(false);
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {emailDraft !== profile.email && (
                      <div className="flex gap-2">
                        <input
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value)}
                          placeholder="인증번호 6자리"
                          maxLength={6}
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleSendEmailCode}
                          className="shrink-0 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-600"
                        >
                          {emailCodeSent ? "재발송" : "인증번호 발송"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="pt-1 text-sm text-slate-700">{profile.email}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  브랜드명 {!profile.editable.brandName && "(읽기 전용)"}
                </p>
                {editing && profile.editable.brandName ? (
                  <input
                    value={brandNameDraft}
                    onChange={(e) => setBrandNameDraft(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="pt-1 text-sm text-slate-700">{profile.brandName}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">역할</p>
                <p className="pt-1 text-sm text-slate-700">{ROLE_LABEL[profile.role] ?? profile.role}</p>
              </div>
            </div>

            {accountError && <p className="pt-3 text-xs text-red-500">{accountError}</p>}

            {editing && (
              <div className="flex justify-end gap-2 pt-5">
                <button
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveAccount}
                  disabled={accountSaving}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 disabled:opacity-50"
                >
                  {accountSaving ? "저장 중..." : "저장"}
                </button>
              </div>
            )}
          </div>

          {/* Company invite key */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <p className="pb-2 text-sm font-bold text-slate-900">회사 초대키</p>
            {profile.companyKeyIssued && profile.companyKey ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-500">
                {profile.companyKey}
              </p>
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-400">
                아직 발급된 초대키가 없어요.
              </p>
            )}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleIssueCompanyKey}
                disabled={companyKeyIssuing}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Mail className="h-3.5 w-3.5" />
                {companyKeyIssuing
                  ? "처리 중..."
                  : profile.companyKeyIssued
                    ? "초대키 다시 보기"
                    : "초대키 발급하기"}
              </button>
            </div>
          </div>

          {/* Monthly report email settings */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <p className="text-sm font-bold text-slate-900">월간 리포트 이메일</p>
            <p className="pt-1 text-xs leading-relaxed text-slate-400">
              매월 지정한 날짜와 시간에 월간 리포트 요약을 아래 수신 이메일로 자동 발송합니다.
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
                    {recipients.map((r) => (
                      <div key={r.localId} className="flex items-center gap-2">
                        <select
                          value={r.department}
                          onChange={(e) => updateRecipient(r.localId, "department", e.target.value)}
                          className="w-[120px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="OPERATIONS">운영팀</option>
                          <option value="CS">CS팀</option>
                        </select>
                        <input
                          value={r.email}
                          onChange={(e) => updateRecipient(r.localId, "email", e.target.value)}
                          placeholder="email@example.com"
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {recipients.length > 1 && (
                          <button
                            onClick={() => removeRecipient(r.localId)}
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
                  <p className="text-[11px] text-slate-400">제목: [SELLoN] 월간 리포트</p>
                  <p className="pt-0.5 text-[11px] text-slate-400">
                    받는 사람: {previewRecipient || "수신자를 추가해주세요"}
                  </p>
                </div>
              </>
            )}

            {reportError && <p className="pt-3 text-xs text-red-500">{reportError}</p>}

            <div className="flex justify-end gap-2 pt-5">
              <button
                onClick={handleCancelReportSetting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveReportSetting}
                disabled={reportSaving}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 disabled:opacity-50"
              >
                {reportSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>

          {/* Bottom links */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600"
            >
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
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 pb-5 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </span>
              <p className="text-lg font-bold text-slate-900">정말 탈퇴하시겠어요?</p>
              <div className="flex flex-col gap-1 text-xs text-slate-500">
                <p>탈퇴 즉시 로그인이 제한되고, 개인정보는 정책에 따라 처리돼요.</p>
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
                  <option key={r} value={r}>{r}</option>
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
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {withdrawing ? "처리 중..." : "탈퇴하기"}
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