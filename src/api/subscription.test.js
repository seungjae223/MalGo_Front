import {
  activateSubscription,
  isSubscriptionActive,
} from "./subscription";

afterEach(() => {
  localStorage.clear();
});

test("회원별 구독 상태를 저장하고 복원한다", () => {
  expect(isSubscriptionActive(7)).toBe(false);

  expect(activateSubscription(7)).toBe(true);
  expect(isSubscriptionActive(7)).toBe(true);
  expect(isSubscriptionActive(8)).toBe(false);
});

test("올바르지 않은 회원 ID는 저장하지 않는다", () => {
  expect(activateSubscription(null)).toBe(false);
  expect(activateSubscription("invalid")).toBe(false);
  expect(localStorage.length).toBe(0);
});
