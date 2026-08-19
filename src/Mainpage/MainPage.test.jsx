import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import MainPage from "./MainPage";
import {
  conversationApi,
  customizationApi,
  partnerApi,
  subscriptionApi,
  translationApi,
} from "../api/malgoApi";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("../api/auth", () => ({
  getMemberId: () => 1,
}));

jest.mock("../api/malgoApi", () => ({
  partnerApi: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  customizationApi: {
    get: jest.fn(),
    update: jest.fn(),
  },
  subscriptionApi: {
    get: jest.fn(),
    activatePremium: jest.fn(),
  },
  conversationApi: {
    create: jest.fn(),
    sendMessage: jest.fn(),
  },
  translationApi: {
    analyze: jest.fn(),
  },
}));

const DEFAULT_PARTNER = {
  id: 1,
  name: "Tom",
  targetCountry: "US",
  targetLanguage: "EN",
  relationshipType: "CLIENT",
  ageGroup: "WORKER",
  gender: "MALE",
  speechStyle: "POLITE",
  characteristic: null,
  custom: false,
};

function submitMessage(value) {
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "메시지 전송" })
  );
}

async function completePreConversation({
  request = "로그인 API 연동이 필요해요.",
  language = "영어",
  situation = "해외 거래처와 로그인 API 연동을 논의합니다.",
  sourceQuestion = "이번 주까지 가능할까요?",
} = {}) {
  submitMessage(request);
  await screen.findByText("상대방은 어떤 언어를 사용하나요?");

  submitMessage(language);
  await screen.findByText("상대방과 어떤 상황·관계에서 대화하나요?");

  submitMessage(situation);
  await screen.findByText(
    "영어로 전달하고 싶은 한국어 질문이나 문장을 입력해주세요."
  );

  submitMessage(sourceQuestion);
}

beforeEach(() => {
  partnerApi.list.mockResolvedValue([DEFAULT_PARTNER]);
  partnerApi.create.mockResolvedValue({
    ...DEFAULT_PARTNER,
    id: 40,
    custom: true,
  });
  customizationApi.get.mockResolvedValue(null);
  subscriptionApi.get.mockResolvedValue({
    plan: "FREE",
    status: "ACTIVE",
  });
  conversationApi.create.mockResolvedValue({ id: 21 });
  conversationApi.sendMessage.mockResolvedValue({
    userMessage: {
      id: 101,
      senderType: "USER",
      content: "이번 주까지 가능할까요?",
    },
    assistantMessage: {
      id: 102,
      senderType: "ASSISTANT",
      content: "가능 여부를 정중하게 확인해보세요.",
    },
  });
  translationApi.analyze.mockResolvedValue({});
});

afterEach(() => {
  jest.clearAllMocks();
});

test("오프라인과 같은 사전 질문을 표시하고 마지막 문장은 실제 API로 보낸다", async () => {
  render(<MainPage />);

  await screen.findByText("Tom");
  expect(
    screen.getByText(/당신의 비즈니스 해답지 \*-\*/)
  ).toBeInTheDocument();

  await completePreConversation();

  await waitFor(() => {
    expect(conversationApi.create).toHaveBeenCalledWith({
      memberId: 1,
      aiPartnerId: 1,
      situation: "BUSINESS",
      field: "IT_DEVELOPMENT",
      targetLanguage: "EN",
    });
    expect(conversationApi.sendMessage).toHaveBeenCalledWith(
      1,
      21,
      "이번 주까지 가능할까요?"
    );
  });

  expect(translationApi.analyze).toHaveBeenCalledWith({
    memberId: 1,
    originalText: "이번 주까지 가능할까요?",
    sourceLanguage: "ko",
    targetLanguage: "EN",
    targetCountry: "US",
    situation: "BUSINESS",
    relationshipType: "CLIENT",
    communicationPurpose: "IT_DEVELOPMENT",
    requestedTone: "POLITE",
  });
  expect(
    await screen.findByText("가능 여부를 정중하게 확인해보세요.")
  ).toBeInTheDocument();
});

test("사전 질문의 언어와 첫 요청을 백엔드 enum 값으로 변환한다", async () => {
  render(<MainPage />);

  await screen.findByText("Tom");
  await completePreConversation({
    request: "디자인 시안 검토를 요청하고 싶어요.",
    language: "스페인어",
    sourceQuestion: "시안 검토가 가능하신가요?",
  });

  await waitFor(() => {
    expect(conversationApi.create).toHaveBeenCalledWith({
      memberId: 1,
      aiPartnerId: 1,
      situation: "BUSINESS",
      field: "DESIGN",
      targetLanguage: "ES",
    });
  });
  expect(translationApi.analyze).toHaveBeenCalledWith(
    expect.objectContaining({
      targetLanguage: "ES",
      targetCountry: "ES",
      communicationPurpose: "DESIGN",
    })
  );
});

test("AI 상대의 말투는 사전 질문에 반영한다", async () => {
  partnerApi.list.mockResolvedValue([
    { ...DEFAULT_PARTNER, speechStyle: "DIALECT" },
  ]);

  render(<MainPage />);

  await screen.findByText("Tom");
  expect(
    await screen.findByText(/당신의 비즈니스 해답지 \*-\*/)
  ).toBeInTheDocument();

  submitMessage("해외 거래처에 문의하고 싶어요.");
  expect(
    await screen.findByText("상대방은 무슨 언어 쓰는교?")
  ).toBeInTheDocument();
  expect(conversationApi.create).not.toHaveBeenCalled();
});

test("말투가 선택된 AI 상대를 고르면 첫 인사가 해당 말투로 바뀐다", async () => {
  partnerApi.list.mockResolvedValue([
    {
      ...DEFAULT_PARTNER,
      speechStyle: "FRIENDLY",
      custom: true,
      customizationApplied: true,
    },
  ]);

  render(<MainPage />);

  expect(
    await screen.findByText(
      /비즈니스 고민, 같이 풀어볼까\? 무엇을 도와줄까\?/
    )
  ).toBeInTheDocument();
});

test("사전 질문 마지막 단계의 서버 오류는 목업 응답 없이 입력값을 복원한다", async () => {
  const alertSpy = jest
    .spyOn(window, "alert")
    .mockImplementation(() => {});
  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});
  conversationApi.sendMessage.mockRejectedValue(
    new Error("대화 서버 오류")
  );

  render(<MainPage />);
  await screen.findByText("Tom");
  await completePreConversation();

  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith("대화 서버 오류");
  });
  expect(screen.getByRole("textbox")).toHaveValue(
    "이번 주까지 가능할까요?"
  );
  expect(
    screen.queryByText("AI 응답을 불러오지 못했습니다.")
  ).not.toBeInTheDocument();

  alertSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});
