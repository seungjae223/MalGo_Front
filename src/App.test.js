import {
  clearStoredAuth,
  getMemberId,
  saveStoredAuth,
} from "./api/auth";

afterEach(() => {
  clearStoredAuth();
});

test("로그인 memberId를 세션 저장소에서 복원한다", () => {
  saveStoredAuth({ memberId: 7 }, false);

  expect(getMemberId()).toBe(7);
  expect(localStorage.getItem("malgoAuth")).toBeNull();
});

test("문자열로 남은 기존 memberId도 숫자로 정규화한다", () => {
  saveStoredAuth({ memberId: "9" }, true);

  expect(getMemberId()).toBe(9);
});

test("올바르지 않은 memberId 저장값은 제거한다", () => {
  saveStoredAuth({ memberId: "not-a-number" }, false);

  expect(getMemberId()).toBeNull();
  expect(sessionStorage.getItem("malgoAuth")).toBeNull();
});
