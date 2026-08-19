import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import SummaryPage from "./SummaryPage";

jest.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

test("직역 그래프를 먼저 보여주고 화살표로 추천 번역 그래프를 전환한다", () => {
  render(
    <SummaryPage
      translationData={{
        literalScores: {
          clarity: 30,
          businessTone: 40,
          intentDelivery: 50,
          culturalFit: 60,
          ambiguity: 70,
        },
        recommendedScores: {
          clarity: 80,
          businessTone: 75,
          intentDelivery: 85,
          culturalFit: 90,
          ambiguity: 20,
        },
      }}
    />
  );

  expect(
    screen.getByRole("region", {
      name: "직역 분석 그래프",
    })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("progressbar", {
      name: "직역 행동 요청의 명확성",
    })
  ).toHaveAttribute("aria-valuenow", "30");

  fireEvent.click(
    screen.getByRole("button", {
      name: "추천 번역 그래프 보기",
    })
  );

  expect(
    screen.getByRole("region", {
      name: "추천 번역 분석 그래프",
    })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("progressbar", {
      name: "추천 번역 행동 요청의 명확성",
    })
  ).toHaveAttribute("aria-valuenow", "80");
  expect(
    screen.getByRole("button", {
      name: "직역 그래프 보기",
    })
  ).toBeInTheDocument();
});

test("대화 메시지 API 분석 결과를 추천 번역 그래프에 반영한다", () => {
  render(
    <SummaryPage
      conversationAnalysis={{
        requestClarity: 91,
        businessTone: 84,
        intentDelivery: 87,
        culturalAppropriateness: 89,
        ambiguity: 12,
      }}
    />
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "추천 번역 그래프 보기",
    })
  );

  expect(
    screen.getByRole("progressbar", {
      name: "추천 번역 행동 요청의 명확성",
    })
  ).toHaveAttribute("aria-valuenow", "91");
  expect(
    screen.getByRole("progressbar", {
      name: "추천 번역 문화적 적절성",
    })
  ).toHaveAttribute("aria-valuenow", "89");
});
