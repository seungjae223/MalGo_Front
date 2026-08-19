const AUTH_STORAGE_KEY = "malgoAuth";

export const AUTH_EXPIRED_EVENT = "malgo:auth-expired";

function normalizeMemberId(value) {
  const memberId =
    typeof value === "number" ? value : Number(value);

  return Number.isSafeInteger(memberId) && memberId > 0
    ? memberId
    : null;
}

export function getStoredAuth() {
  const storedValue =
    localStorage.getItem(AUTH_STORAGE_KEY) ||
    sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const auth = JSON.parse(storedValue);
    const memberId = normalizeMemberId(
      auth?.memberId ?? auth?.user?.id
    );

    if (memberId === null) {
      clearStoredAuth();
      return null;
    }

    return { ...auth, memberId };
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function getMemberId() {
  return getStoredAuth()?.memberId ?? null;
}

export function saveStoredAuth(auth, persist = false) {
  const targetStorage = persist ? localStorage : sessionStorage;
  const otherStorage = persist ? sessionStorage : localStorage;

  targetStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  otherStorage.removeItem(AUTH_STORAGE_KEY);
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
