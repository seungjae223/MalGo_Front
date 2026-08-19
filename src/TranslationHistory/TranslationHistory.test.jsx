import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import TranslationHistory from "./TranslationHistory";
import { translationApi } from "../api/malgoApi";

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const mockNavigate = jest.fn();

jest.mock("../api/auth", () => ({
  getMemberId: () => 1,
}));

jest.mock("../api/malgoApi", () => ({
  translationApi: {
    listRecent: jest.fn(),
    get: jest.fn(),
    saveMemo: jest.fn(),
    removeMemo: jest.fn(),
  },
}));

const TRANSLATION_RECORDS = [
  {
    translationId: 3,
    createdAt: "2026-08-23T10:00:00",
    originalText: "세 번째 기록",
    recommendedTranslation: "Third record",
  },
  {
    translationId: 2,
    createdAt: "2026-08-22T10:00:00",
    originalText: "두 번째 기록",
    recommendedTranslation: "Second record",
  },
  {
    translationId: 1,
    createdAt: "2026-08-21T10:00:00",
    originalText: "첫 번째 기록",
    recommendedTranslation: "First record",
  },
];

beforeEach(() => {
  translationApi.listRecent.mockResolvedValue(
    TRANSLATION_RECORDS
  );
  translationApi.get.mockResolvedValue({ memo: "" });
  translationApi.saveMemo.mockResolvedValue({});
  translationApi.removeMemo.mockResolvedValue({});
});

afterEach(() => {
  jest.clearAllMocks();
});

test("하단 화살표로 이전·다음 번역 기록 묶음을 전환한다", async () => {
  render(<TranslationHistory />);

  await screen.findByText("2026 - 08 - 23");

  const nextButton = screen.getByRole("button", {
    name: "다음 번역 기록",
  });

  expect(nextButton).toBeEnabled();

  fireEvent.click(nextButton);

  await screen.findByText("2026 - 08 - 21");

  expect(
    document.querySelector(
      ".translation-history-page-set--next"
    )
  ).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", {
      name: "이전 번역 기록",
    })
  );

  await waitFor(() => {
    expect(
      screen.getByText("2026 - 08 - 23")
    ).toBeInTheDocument();
  });

  expect(
    document.querySelector(
      ".translation-history-page-set--previous"
    )
  ).toBeInTheDocument();
});

test("메모 아이콘은 목록 위에 메모 저장 모달을 연다", async () => {
  render(<TranslationHistory />);

  await screen.findByText("2026 - 08 - 23");

  fireEvent.click(
    screen.getByRole("button", {
      name: "2026 - 08 - 23 기록 메모",
    })
  );

  const memoDialog = await screen.findByRole("dialog", {
    name: "메모",
  });

  expect(memoDialog).toBeInTheDocument();
  expect(
    screen.getByRole("region", {
      name: "최근 번역 기록",
    })
  ).toContainElement(memoDialog);

  fireEvent.change(
    screen.getByLabelText("메모 내용"),
    { target: { value: "다음 대화에서 이 표현을 사용하기" } }
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "메모 닫기",
    })
  );

  await waitFor(() => {
    expect(translationApi.saveMemo).toHaveBeenCalledWith(
      1,
      3,
      "다음 대화에서 이 표현을 사용하기"
    );
  });
});
