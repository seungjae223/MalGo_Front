import {
  AUTH_EXPIRED_EVENT,
  clearStoredAuth,
} from "./auth";

const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:8081"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, options = {}) {
  const { body, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new Event(AUTH_EXPIRED_EVENT)
        );
      }
    }

    const message =
      (data && typeof data === "object" &&
        (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `요청에 실패했습니다. (${response.status})`;

    throw new ApiError(message, {
      status: response.status,
      data,
    });
  }

  return data;
}

export function getNetworkErrorMessage(error) {
  if (error instanceof TypeError) {
    return "백엔드 서버에 연결할 수 없습니다. 서버 실행 상태와 CORS 설정을 확인해주세요.";
  }

  if (
    error instanceof ApiError &&
    error.status === 403 &&
    error.data?.code === "MEMBERSHIP_REQUIRED"
  ) {
    return "이 기능은 멤버십 이용권이 필요합니다. 이용권을 시작한 뒤 다시 시도해주세요.";
  }

  if (
    error instanceof ApiError &&
    error.status === 401 &&
    (!error.data || !error.data.message)
  ) {
    return "로그인 세션이 만료되었습니다. 다시 로그인해주세요.";
  }

  if (
    error instanceof ApiError &&
    error.status === 403 &&
    (!error.data || !error.data.message)
  ) {
    return "이 요청을 처리할 권한이 없습니다.";
  }

  return error?.message || "요청 처리 중 오류가 발생했습니다.";
}

export function isMembershipRequiredError(error) {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    error.data?.code === "MEMBERSHIP_REQUIRED"
  );
}

export { API_BASE_URL };
