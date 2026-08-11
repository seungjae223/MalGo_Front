import "./SummaryPage.css";

import mainLogo from "../img/메인페이지 로고.png";
import backIcon from "../img/뒤로가기.png";

const DEFAULT_SITUATION =
  "교환앱을 통해 만난 외국 친구에게 약속을 거절하는 상황";

const DEFAULT_TRANSLATION = `Yo what’s good bro 😂 I don’t think
I can make it that day, I already got plans.
My bad bro 😭`;

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
  memo = "",
  onMemoChange = () => {},
  onBack = () => {},
}) {
  const userMessages = messages.filter(
    (message) => message.sender === "user"
  );

  const latestUserMessage =
    userMessages.length > 0
      ? userMessages[userMessages.length - 1].content
      : "";

  const partnerDescription = selectedPartner
    ? `${selectedPartner.name} ${
        selectedPartner.relation
      }`
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

          <img
            src={mainLogo}
            alt="Malgo"
            className="summary-main-logo"
          />

          <h1 className="summary-logo-title">
            Malgo
          </h1>
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
                {formatDate(new Date())}
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
                요청해주신 번역 결과입니다.
              </p>

              <div className="summary-result-divider" />

              <div className="summary-recommendation-row">
                <RecommendationIcon />

                <span className="summary-recommendation-title">
                  추천 번역
                </span>
              </div>

              <p className="summary-translation-text">
                {DEFAULT_TRANSLATION}
              </p>
            </article>
          </section>

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