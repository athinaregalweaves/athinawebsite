export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredDate: string;
  message: string;
  submittedAt: string;
  status: "new" | "contacted" | "resolved";
}

const STORAGE_KEY = "contact_inquiries";

export function getContactInquiries(): ContactInquiry[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveContactInquiry(inquiry: Omit<ContactInquiry, "id" | "submittedAt" | "status">): void {
  const existing = getContactInquiries();
  existing.unshift({
    ...inquiry,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    status: "new",
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function updateInquiryStatus(id: string, status: ContactInquiry["status"]): void {
  const existing = getContactInquiries();
  const idx = existing.findIndex(i => i.id === id);
  if (idx !== -1) {
    existing[idx].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
}

export function deleteInquiry(id: string): void {
  const existing = getContactInquiries().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}
