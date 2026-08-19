import {
  authApi,
  conversationMessageApi,
  conversationApi,
  customizationApi,
  membershipApi,
  subscriptionApi,
  translationApi,
} from "./malgoApi";
import {
  clearStoredAuth,
  getMemberId,
  saveStoredAuth,
} from "./auth";

const okResponse = (data) => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify(data),
});

afterEach(() => {
  jest.restoreAllMocks();
  clearStoredAuth();
});

test("로그인은 명세의 username 필드로 요청한다", async () => {
  jest
    .spyOn(global, "fetch")
    .mockResolvedValue(okResponse(1));

  const memberId = await authApi.login({
    username: "malgo01",
    password: "password123!",
  });

  expect(memberId).toBe(1);

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/v1\/auth\/login$/),
    expect.objectContaining({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        username: "malgo01",
        password: "password123!",
      }),
    })
  );
});

test("로그아웃은 세션 쿠키를 포함해 POST 요청한다", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    status: 204,
    text: async () => "",
  });

  await expect(authApi.logout()).resolves.toBeNull();

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/v1\/auth\/logout$/),
    expect.objectContaining({
      method: "POST",
      credentials: "include",
    })
  );
});

test("세션이 만료된 보호 요청은 저장된 인증 정보를 제거한다", async () => {
  saveStoredAuth({ memberId: 4 }, false);
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: false,
    status: 401,
    text: async () => "",
  });

  await expect(conversationApi.list(4)).rejects.toMatchObject({
    status: 401,
  });

  expect(getMemberId()).toBeNull();
});

test("회원가입은 숫자 회원 ID 응답을 반환한다", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue(okResponse(7));

  await expect(
    authApi.signup({
      username: "malgo07",
      password: "password123!",
      passwordConfirm: "password123!",
    })
  ).resolves.toBe(7);
});

test("로그인의 예전 객체 응답은 새 명세 위반으로 처리한다", async () => {
  jest
    .spyOn(global, "fetch")
    .mockResolvedValue(okResponse({ memberId: 1 }));

  await expect(
    authApi.login({
      username: "malgo01",
      password: "password123!",
    })
  ).rejects.toThrow(
    "로그인 응답에서 올바른 회원 ID를 받지 못했습니다."
  );
});

test("대화 전송은 content 본문과 회원별 메시지 경로를 사용한다", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue(
    okResponse({
      userMessage: { id: 10, senderType: "USER", content: "안녕" },
      assistantMessage: {
        id: 11,
        senderType: "ASSISTANT",
        content: "반가워요",
      },
    })
  );

  await conversationApi.sendMessage(4, 21, "안녕");

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringMatching(
      /\/api\/conversations\/member\/4\/21\/messages$/
    ),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ content: "안녕" }),
    })
  );
});

test("AI 상대 대화방 생성은 새 명세 필드만 전달한다", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue(
    okResponse({ id: 21 })
  );

  await conversationApi.create({
    memberId: 4,
    aiPartnerId: 8,
    situation: "BUSINESS",
    field: "IT_DEVELOPMENT",
    targetLanguage: "EN",
  });

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/conversations$/),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        memberId: 4,
        aiPartnerId: 8,
        situation: "BUSINESS",
        field: "IT_DEVELOPMENT",
        targetLanguage: "EN",
      }),
    })
  );
});

test("대화 전송 본문에는 명세의 content만 전달한다", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue(
    okResponse({
      userMessage: { id: 10, senderType: "USER", content: "안녕" },
      assistantMessage: {
        id: 11,
        senderType: "ASSISTANT",
        content: "반갑습니다.",
      },
    })
  );

  await conversationApi.sendMessage(4, 21, "안녕");

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringMatching(
      /\/api\/conversations\/member\/4\/21\/messages$/
    ),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ content: "안녕" }),
    })
  );
});

test("번역 분석은 저장 API에 현재 대화 맥락을 전달한다", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue(
    okResponse({
      culturalTranslation: "Would this be possible by the end of the week?",
    })
  );

  const payload = {
    memberId: 4,
    originalText: "이번 주까지 가능할까요?",
    sourceLanguage: "ko",
    targetLanguage: "en",
    targetCountry: "US",
    situation: "BUSINESS",
    relationshipType: "CLIENT",
    communicationPurpose: "IT_DEVELOPMENT",
    requestedTone: "POLITE",
  };

  await translationApi.analyze(payload);

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/translations\/analyze$/),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify(payload),
    })
  );
});

test("번역 메모를 회원과 번역 ID 경로에 저장한다", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue(
    okResponse({
      id: 3,
      translationId: 9,
      content: "중요 표현",
    })
  );

  await translationApi.saveMemo(4, 9, "중요 표현");

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/translations\/member\/4\/9\/memo$/),
    expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ content: "중요 표현" }),
    })
  );
});

test("구독·개인화 API에는 로그인 회원 헤더를 포함한다", async () => {
  jest.spyOn(global, "fetch")
    .mockResolvedValueOnce(okResponse({
      plan: "PREMIUM",
      status: "ACTIVE",
    }))
    .mockResolvedValueOnce(okResponse({
      aiPersona: "TOM",
      expression: "SMILE",
      targetLanguage: "EN",
      relationships: ["US_CLIENT"],
      gender: "FEMALE",
      speechStyles: ["WARM"],
    }));

  await subscriptionApi.activatePremium(4);
  await customizationApi.update(4, {
    aiPersona: "TOM",
    expression: "SMILE",
    targetLanguage: "EN",
    relationships: ["US_CLIENT"],
    gender: "FEMALE",
    speechStyles: ["WARM"],
  });

  expect(global.fetch).toHaveBeenNthCalledWith(
    1,
    expect.stringMatching(/\/api\/v1\/subscription\/me\/premium$/),
    expect.objectContaining({
      method: "PATCH",
      headers: expect.objectContaining({
        "X-Member-Id": "4",
      }),
    })
  );
  expect(global.fetch).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(/\/api\/v1\/customization\/me$/),
    expect.objectContaining({
      method: "PUT",
      headers: expect.objectContaining({
        "X-Member-Id": "4",
      }),
    })
  );
});

test("멤버십 및 대화 메시지 메모 경로를 사용한다", async () => {
  jest.spyOn(global, "fetch")
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "",
    })
    .mockResolvedValueOnce(okResponse({
      id: 3,
      conversationMessageId: 8,
      content: "표현을 기억하기",
    }));

  await membershipApi.activate(4);
  await conversationMessageApi.saveMemo(8, "표현을 기억하기");

  expect(global.fetch).toHaveBeenNthCalledWith(
    1,
    expect.stringMatching(/\/api\/members\/4\/membership$/),
    expect.objectContaining({ method: "POST" })
  );
  expect(global.fetch).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(/\/api\/conversation-messages\/8\/memo$/),
    expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ content: "표현을 기억하기" }),
    })
  );
});
