// Remembers (per browser) that the visitor already sent an inquiry,
// so the automatic enquiry popups stop appearing for them.
const STORAGE_KEY = 'exporio_inquiry_submitted';

export function hasSubmittedInquiry(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markInquirySubmitted(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Storage unavailable (private mode / blocked) — popup will just keep showing
  }
}
