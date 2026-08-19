import {
  ApiError,
  getNetworkErrorMessage,
  isMembershipRequiredError,
} from "./client";

test("멤버십 제한 응답은 안내 문구와 구독 유도 여부를 제공한다", () => {
  const error = new ApiError("Forbidden", {
    status: 403,
    data: {
      code: "MEMBERSHIP_REQUIRED",
      message: "커스텀 AI 생성은 멤버십이 필요합니다.",
    },
  });

  expect(isMembershipRequiredError(error)).toBe(true);
  expect(getNetworkErrorMessage(error)).toContain("멤버십 이용권");
});

test("일반 권한 오류는 멤버십 제한으로 처리하지 않는다", () => {
  const error = new ApiError("다른 회원의 대화방에는 접근할 수 없습니다.", {
    status: 403,
    data: { message: "다른 회원의 대화방에는 접근할 수 없습니다." },
  });

  expect(isMembershipRequiredError(error)).toBe(false);
  expect(getNetworkErrorMessage(error)).toBe(
    "다른 회원의 대화방에는 접근할 수 없습니다."
  );
});
