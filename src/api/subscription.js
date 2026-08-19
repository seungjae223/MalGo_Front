const SUBSCRIPTION_KEY_PREFIX =
  "malgo:subscription:";

function getSubscriptionKey(memberId) {
  const normalizedMemberId = Number(memberId);

  if (
    !Number.isSafeInteger(normalizedMemberId) ||
    normalizedMemberId <= 0
  ) {
    return null;
  }

  return `${SUBSCRIPTION_KEY_PREFIX}${normalizedMemberId}`;
}

export function isSubscriptionActive(memberId) {
  const key = getSubscriptionKey(memberId);

  if (!key || typeof localStorage === "undefined") {
    return false;
  }

  return localStorage.getItem(key) === "active";
}

export function activateSubscription(memberId) {
  const key = getSubscriptionKey(memberId);

  if (!key || typeof localStorage === "undefined") {
    return false;
  }

  localStorage.setItem(key, "active");
  return true;
}
