import { useState } from "react";

import "./SummaryPage.css";

import mainLogo from "../img/메인페이지 로고.png";
import backIcon from "../img/뒤로가기.svg";
import HomeLogoLink from "../HomeLogoLink/HomeLogoLink";

const DEFAULT_SITUATION =
  "교환앱을 통해 만난 외국 친구에게 약속을 거절하는 상황";

const DEFAULT_SUMMARY = "요약할 대화 내용이 없습니다.";

const SCORE_METRICS = [
  {
    key: "clarity",
    label: "행동 요청의 명확성",
    aliases: [
      "requestClarity",
      "actionClarity",
      "behaviorRequestClarity",
      "clarity",
    ],
  },
  {
    key: "businessTone",
    label: "비즈니스 톤",
    aliases: ["businessTone", "professionalism"],
  },
  {
    key: "intentDelivery",
    label: "의도전달",
    aliases: ["intentDelivery", "intentClarity", "directness"],
  },
  {
    key: "culturalFit",
    label: "문화적 적절성",
    aliases: ["culturalFit", "culturalAppropriateness", "culturalSuitability"],
  },
  {
    key: "ambiguity",
    label: "모호성",
    aliases: ["ambiguity", "ambiguityLevel", "burden"],
  },
];

const DEFAULT_LITERAL_SCORES = {
  clarity: 48,
  businessTone: 54,
  intentDelivery: 46,
  culturalFit: 38,
  ambiguity: 66,
};

const DEFAULT_RECOMMENDED_SCORES = {
  clarity: 82,
  businessTone: 76,
  intentDelivery: 84,
  culturalFit: 88,
  ambiguity: 28,
};

const RADAR_ORDER = [
  "clarity",
  "culturalFit",
  "ambiguity",
  "intentDelivery",
  "businessTone",
];

function clampScore(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  const normalized = number <= 1 ? number * 100 : number;
  return Math.max(0, Math.min(100, normalized));
}

function normalizeScores(rawScores, fallbackScores) {
  return SCORE_METRICS.reduce((scores, metric) => {
    const rawValue = metric.aliases
      .map((alias) => rawScores?.[alias])
      .find((value) => value !== undefined && value !== null);

    scores[metric.key] = clampScore(
      rawValue,
      fallbackScores[metric.key]
    );

    return scores;
  }, {});
}

function getRadarPoints(scores, radius = 51) {
  const centerX = 93;
  const centerY = 78;

  return RADAR_ORDER.map((key, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
    const scoreRadius = radius * (scores[key] / 100);

    return `${centerX + Math.cos(angle) * scoreRadius},${
      centerY + Math.sin(angle) * scoreRadius
    }`;
  }).join(" ");
}

function getRadarGridPoints(radius) {
  return getRadarPoints(
    RADAR_ORDER.reduce((scores, key) => {
      scores[key] = (radius / 51) * 100;
      return scores;
    }, {})
  );
}

function ScoreGraph({ mode, scores, onNext }) {
  const graphLabel = mode === "literal" ? "직역" : "추천 번역";

  return (
    <section
      className="summary-score-graph"
      aria-label={`${graphLabel} 분석 그래프`}
    >
      <div className="summary-radar-chart">
        <svg
          viewBox="0 0 205 160"
          role="img"
          aria-label={`${graphLabel} 레이더 그래프`}
        >
          <polygon
            points={getRadarGridPoints(51)}
            className="summary-radar-level summary-radar-level--outer"
          />
          <polygon
            points={getRadarGridPoints(39)}
            className="summary-radar-level summary-radar-level--middle"
          />
          <polygon
            points={getRadarGridPoints(27)}
            className="summary-radar-level summary-radar-level--inner"
          />

          {RADAR_ORDER.map((key, index) => {
            const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
            return (
              <line
                key={key}
                x1="93"
                y1="78"
                x2={93 + Math.cos(angle) * 51}
                y2={78 + Math.sin(angle) * 51}
                className="summary-radar-axis"
              />
            );
          })}

          <polygon
            points={getRadarPoints(scores)}
            className="summary-radar-score"
          />

          {getRadarPoints(scores)
            .split(" ")
            .map((point, index) => {
              const [cx, cy] = point.split(",");
              return (
                <circle
                  key={RADAR_ORDER[index]}
                  cx={cx}
                  cy={cy}
                  r="2.1"
                  className="summary-radar-point"
                />
              );
            })}

          <text x="93" y="15" textAnchor="middle">
            행동 요청의 명확성
          </text>
          <text x="148" y="65" textAnchor="start">
            문화적 적절성
          </text>
          <text x="129" y="137" textAnchor="middle">모호성</text>
          <text x="57" y="137" textAnchor="middle">의도전달</text>
          <text x="38" y="65" textAnchor="end">비즈니스 톤</text>
        </svg>
      </div>

      <ul className="summary-score-list">
        {SCORE_METRICS.map((metric) => (
          <li key={metric.key}>
            <span>{metric.label}</span>
            <div
              className="summary-score-track"
              role="progressbar"
              aria-label={`${graphLabel} ${metric.label}`}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(scores[metric.key])}
            >
              <span
                className="summary-score-fill"
                style={{ width: `${scores[metric.key]}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="summary-score-next"
        aria-label={
          mode === "literal"
            ? "추천 번역 그래프 보기"
            : "직역 그래프 보기"
        }
        onClick={onNext}
      >
        <svg viewBox="0 0 34 34" aria-hidden="true">
          <path d="M4 12H17V7L29 17L17 27V22H4Z" />
        </svg>
      </button>
    </section>
  );
}

function formatDate(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="summary-history-icon"
    >
      <path d="M8.5 9.5H3.5V4.5" />

      <path d="M4.5 9.5A12 12 0 1 1 4 21" />

      <path d="M16 8.5V17L21.5 20.5" />
    </svg>
  );
}

function RecommendationIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="summary-recommendation-icon"
    >
      <path
        d="M16 2.5L19.2 7.3L24.8 6.2L25.2 11.9L30 15L26.1 19.1L28.2 24.4L22.8 26.1L21.5 31.5L16 29.5L10.5 31.5L9.2 26.1L3.8 24.4L5.9 19.1L2 15L6.8 11.9L7.2 6.2L12.8 7.3L16 2.5Z"
        fill="currentColor"
      />

      <circle
        cx="16"
        cy="15"
        r="4.2"
        fill="#ffffff"
      />

      <path
        d="M10.8 24C11.8 20.8 13.6 19.4 16 19.4C18.4 19.4 20.2 20.8 21.2 24"
        fill="#ffffff"
      />
    </svg>
  );
}

function SummaryPage({
  messages = [],
  selectedPartner = null,
  selectedRegion = "",
  selectedArea = "",
  selectedTarget = "",
  targetFeature = "",
  summaryData = null,
  conversationAnalysis = null,
  translationData = null,
  memo = "",
  onMemoChange = () => {},
  onBack = () => {},
  onHome = () => {},
}) {
  const [graphMode, setGraphMode] = useState("literal");
  const userMessages = messages.filter(
    (message) => message.sender === "user"
  );

  const latestUserMessage =
    userMessages.length > 0
      ? userMessages[userMessages.length - 1].content
      : "";

  const partnerDescription = selectedPartner
    ? `${selectedPartner.name} ${
        selectedPartner.relationshipType || ""
      }`.trim()
    : "선택한 상대";

  const locationDescription =
    selectedArea || selectedRegion || "선택한 문화권";

  const targetDescription =
    selectedTarget || "선택한 대상";

  const situationText =
    latestUserMessage || DEFAULT_SITUATION;

  const summaryContext =
    targetFeature.trim() ||
    `${partnerDescription}에게 ${locationDescription} 문화와 ${targetDescription}의 특징을 고려해 자연스럽고 친근하게 내용을 전달하려는 대화입니다.`;

  const summaryText =
    summaryData?.summary || DEFAULT_SUMMARY;

  const summaryDate = summaryData?.createdAt
    ? new Date(summaryData.createdAt)
    : new Date();

  const literalScores = normalizeScores(
    translationData?.literalScores ||
      translationData?.literalToneScores ||
      summaryData?.literalScores ||
      summaryData?.literalToneScores,
    DEFAULT_LITERAL_SCORES
  );

  const recommendedScores = normalizeScores(
    conversationAnalysis ||
      translationData?.recommendedScores ||
      translationData?.recommendationScores ||
      translationData?.toneScores ||
      summaryData?.recommendedScores ||
      summaryData?.toneScores,
    DEFAULT_RECOMMENDED_SCORES
  );

  const visibleScores =
    graphMode === "literal"
      ? literalScores
      : recommendedScores;

  return (
    <div className="summary-page-scroll">
      <div className="summary-page-shell">
        <header className="summary-header">
          <button
            type="button"
            className="summary-history-button"
            aria-label="지난 대화 기록 보기"
          >
            <HistoryIcon />
          </button>

          <HomeLogoLink onHome={onHome}>
            <img
              src={mainLogo}
              alt="Malgo"
              className="summary-main-logo"
            />

            <h1 className="summary-logo-title">
              Malgo
            </h1>
          </HomeLogoLink>
        </header>

        <main className="summary-main">
          <section className="summary-panel">
            <button
              type="button"
              className="summary-back-button"
              aria-label="채팅 화면으로 돌아가기"
              onClick={onBack}
            >
              <img
                src={backIcon}
                alt=""
                className="summary-back-icon"
              />
            </button>

            <article className="summary-situation-card">
              <time className="summary-date">
                {formatDate(summaryDate)}
              </time>

              <p className="summary-situation-text">
                {situationText}
              </p>
            </article>

            <article className="summary-context-card">
              <p className="summary-context-text">
                {summaryContext}
              </p>
            </article>

            <article className="summary-result-card">
              <p className="summary-result-title">
                요청해주신 대화 요약입니다.
              </p>

              <div className="summary-result-divider" />

              <div className="summary-recommendation-row">
                <RecommendationIcon />

                <span className="summary-recommendation-title">
                  AI 요약
                </span>
              </div>

              <p className="summary-translation-text">
                {summaryText}
              </p>
            </article>
          </section>

          <ScoreGraph
            mode={graphMode}
            scores={visibleScores}
            onNext={() =>
              setGraphMode((currentMode) =>
                currentMode === "literal"
                  ? "recommended"
                  : "literal"
              )
            }
          />

          <section className="summary-memo-card">
            <textarea
              className="summary-memo-input"
              aria-label="요약 메모"
              placeholder="memo"
              value={memo}
              maxLength={500}
              onChange={(event) =>
                onMemoChange(event.target.value)
              }
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default SummaryPage;
