import { apiRequest } from "./client";

const encode = (value) => encodeURIComponent(value);

function withMemberHeader(memberId, options = {}) {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      "X-Member-Id": String(memberId),
    },
  };
}

function parseMemberId(data, action) {
  if (!Number.isSafeInteger(data) || data <= 0) {
    throw new Error(
      `${action} 응답에서 올바른 회원 ID를 받지 못했습니다.`
    );
  }

  return data;
}

export const authApi = {
  signup: async (payload) =>
    parseMemberId(await apiRequest("/api/v1/auth/signup", {
      method: "POST",
      body: payload,
    }), "회원가입"),
  login: async (payload) =>
    parseMemberId(await apiRequest("/api/v1/auth/login", {
      method: "POST",
      body: payload,
    }), "로그인"),
  restore: async () =>
    parseMemberId(await apiRequest("/api/v1/auth/me"), "자동로그인 복원"),
  logout: () =>
    apiRequest("/api/v1/auth/logout", {
      method: "POST",
    }),
};

export const chatApi = {
  send: (message) =>
    apiRequest("/api/v1/chat", {
      method: "POST",
      body: { message },
    }),
};

export const partnerApi = {
  list: (memberId, options = {}) =>
    apiRequest(`/api/partners/member/${encode(memberId)}`, options),
  get: (memberId, id) =>
    apiRequest(
      `/api/partners/member/${encode(memberId)}/${encode(id)}`
    ),
  create: (memberId, payload) =>
    apiRequest(`/api/partners/member/${encode(memberId)}`, {
      method: "POST",
      body: payload,
    }),
  update: (memberId, id, payload) =>
    apiRequest(
      `/api/partners/member/${encode(memberId)}/${encode(id)}`,
      { method: "PUT", body: payload }
    ),
  remove: (memberId, id) =>
    apiRequest(
      `/api/partners/member/${encode(memberId)}/${encode(id)}`,
      { method: "DELETE" }
    ),
};

export const conversationApi = {
  create: (payload) =>
    apiRequest("/api/conversations", {
      method: "POST",
      body: payload,
    }),
  list: (memberId) =>
    apiRequest(`/api/conversations/member/${encode(memberId)}`),
  get: (memberId, id) =>
    apiRequest(
      `/api/conversations/member/${encode(memberId)}/${encode(id)}`
    ),
  remove: (memberId, id) =>
    apiRequest(
      `/api/conversations/member/${encode(memberId)}/${encode(id)}`,
      { method: "DELETE" }
    ),
  sendMessage: (memberId, id, content) =>
    apiRequest(
      `/api/conversations/member/${encode(memberId)}/${encode(id)}/messages`,
      {
        method: "POST",
        body: { content },
      }
    ),
  listMessages: (memberId, id) =>
    apiRequest(
      `/api/conversations/member/${encode(memberId)}/${encode(id)}/messages`
    ),
  createSummary: (memberId, id) =>
    apiRequest(
      `/api/conversations/member/${encode(memberId)}/${encode(id)}/summary`,
      { method: "POST" }
    ),
  listSummaries: (memberId, id) =>
    apiRequest(
      `/api/conversations/member/${encode(memberId)}/${encode(id)}/summaries`
    ),
  getLatestSummary: (memberId, id) =>
    apiRequest(
      `/api/conversations/member/${encode(memberId)}/${encode(id)}/summary/latest`
    ),
  getStatistics: (memberId, options = {}) =>
    apiRequest(
      `/api/conversations/member/${encode(memberId)}/statistics`,
      options
    ),
};

export const conversationMessageApi = {
  saveMemo: (messageId, content) =>
    apiRequest(
      `/api/conversation-messages/${encode(messageId)}/memo`,
      { method: "PUT", body: { content } }
    ),
  getMemo: (messageId) =>
    apiRequest(
      `/api/conversation-messages/${encode(messageId)}/memo`
    ),
  removeMemo: (messageId) =>
    apiRequest(
      `/api/conversation-messages/${encode(messageId)}/memo`,
      { method: "DELETE" }
    ),
};

export const translationApi = {
  analyze: (payload) =>
    apiRequest("/api/translations/analyze", {
      method: "POST",
      body: payload,
    }),
  list: (memberId) =>
    apiRequest(`/api/translations/member/${encode(memberId)}`),
  get: (memberId, id, options = {}) =>
    apiRequest(
      `/api/translations/member/${encode(memberId)}/${encode(id)}`,
      options
    ),
  remove: (memberId, id) =>
    apiRequest(
      `/api/translations/member/${encode(memberId)}/${encode(id)}`,
      { method: "DELETE" }
    ),
  saveMemo: (memberId, id, content) =>
    apiRequest(
      `/api/translations/member/${encode(memberId)}/${encode(id)}/memo`,
      { method: "PUT", body: { content } }
    ),
  getMemo: (memberId, id) =>
    apiRequest(
      `/api/translations/member/${encode(memberId)}/${encode(id)}/memo`
    ),
  removeMemo: (memberId, id) =>
    apiRequest(
      `/api/translations/member/${encode(memberId)}/${encode(id)}/memo`,
      { method: "DELETE" }
    ),
  listRecent: (memberId, options = {}) =>
    apiRequest(
      `/api/translations/member/${encode(memberId)}/recent`,
      options
    ),
  getStatistics: (memberId, options = {}) =>
    apiRequest(
      `/api/translations/member/${encode(memberId)}/statistics`,
      options
  ),
};

export const membershipApi = {
  activate: (memberId) =>
    apiRequest(
      `/api/members/${encode(memberId)}/membership`,
      { method: "POST" }
    ),
  getStatus: (memberId, options = {}) =>
    apiRequest(
      `/api/members/${encode(memberId)}/membership`,
      options
    ),
};

export const customizationApi = {
  get: (memberId, options = {}) =>
    apiRequest(
      "/api/v1/customization/me",
      withMemberHeader(memberId, options)
    ),
  update: (memberId, payload, options = {}) =>
    apiRequest(
      "/api/v1/customization/me",
      withMemberHeader(memberId, {
        ...options,
        method: "PUT",
        body: payload,
      })
    ),
};

export const subscriptionApi = {
  get: (memberId, options = {}) =>
    apiRequest(
      "/api/v1/subscription/me",
      withMemberHeader(memberId, options)
    ),
  activatePremium: (memberId) =>
    apiRequest(
      "/api/v1/subscription/me/premium",
      withMemberHeader(memberId, { method: "PATCH" })
    ),
  cancel: (memberId) =>
    apiRequest(
      "/api/v1/subscription/me/cancel",
      withMemberHeader(memberId, { method: "PATCH" })
    ),
};
