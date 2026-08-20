export type InquiryEdit = {
  name: string;
  type: string;
  title: string;
  content: string;
};

const DELETED_STORAGE_KEY = "sellon_deleted_inquiry_ids";
const EDITED_STORAGE_KEY = "sellon_edited_inquiries";

export function getDeletedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = window.localStorage.getItem(DELETED_STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function markDeleted(id: string) {
  if (typeof window === "undefined") return;
  try {
    const ids = getDeletedIds();
    ids.add(id);
    window.localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

export function getEditedInquiries(): Record<string, InquiryEdit> {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(EDITED_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveEdit(id: string, edit: InquiryEdit) {
  if (typeof window === "undefined") return;
  try {
    const all = getEditedInquiries();
    all[id] = edit;
    window.localStorage.setItem(EDITED_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}
