import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import "./TranslationHistoryDetail.css";

import { getMemberId } from "../api/auth";
import { getNetworkErrorMessage } from "../api/client";
import { translationApi } from "../api/malgoApi";
import HomeLogoLink from "../HomeLogoLink/HomeLogoLink";

import malgoLogo from "../img/말고 로고.png";
import chatbotIcon from "../img/챗봇아이콘.svg";
import backIcon from "../img/뒤로가기.svg";

const TONE_LABELS = {
  friendliness: "친근함",
  politeness: "정중함",
  directness: "직접성",
  aggression: "공격성",
  burden: "부담감",
  professionalism: "전문성",
  naturalness: "자연스러움",
};

function formatDetailDate(value) {
  if (!value) {
    return "날짜 없음";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10).replace(/-/g, ".");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function TranslationCard({ title, children }) {
  return (
    <section className="translation-detail-result-card">
      <p className="translation-detail-result-title">{title}</p>
      <div className="translation-detail-result-divider" aria-hidden="true" />
      <div className="translation-detail-result-text">{children}</div>
    </section>
  );
}

function PaginationArrow({ direction }) {
  const isNext = direction === "next";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={`translation-detail-pagination-svg ${
        isNext ? "translation-detail-pagination-svg--next" : ""
      }`}
    >
      <path
        d="M19.5 9 L12.5 16 L19.5 23"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TranslationHistoryDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { historyId } = useParams();
  const memoInputRef = useRef(null);

  const translationId = Number(historyId);
  const [history, setHistory] = useState(null);
  const [historyIds, setHistoryIds] = useState([]);
  const [memo, setMemo] = useState("");
  const [isMemoOpen, setIsMemoOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [memoStatus, setMemoStatus] = useState("");

  useEffect(() => {
    const memberId = getMemberId();

    if (memberId === null) {
      navigate("/login", { replace: true });
      return undefined;
    }

    if (!Number.isSafeInteger(translationId) || translationId <= 0) {
      setErrorMessage("올바르지 않은 번역 기록 주소입니다.");
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    const loadDetail = async () => {
      setIsLoading(true);
      setErrorMessage("");
      setMemoStatus("");
      setIsMemoOpen(true);

      try {
        const [detail, recentItems] = await Promise.all([
          translationApi.get(memberId, translationId, {
            signal: controller.signal,
          }),
          translationApi.listRecent(memberId, {
            signal: controller.signal,
          }),
        ]);

        setHistory(detail);
        setMemo(detail?.memo || "");
        setHistoryIds(
          Array.isArray(recentItems)
            ? recentItems.map((item) => item.translationId)
            : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setErrorMessage(getNetworkErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadDetail();
    return () => controller.abort();
  }, [navigate, translationId]);

  useEffect(() => {
    if (!isLoading && location.state?.focusMemo) {
      memoInputRef.current?.focus();
    }
  }, [isLoading, location.state]);

  useLayoutEffect(() => {
    const footerLayout = document.querySelector(".footer-layout");
    footerLayout?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [translationId]);

  const currentIndex = historyIds.indexOf(translationId);
  const previousId = currentIndex > 0 ? historyIds[currentIndex - 1] : null;
  const nextId =
    currentIndex >= 0 && currentIndex < historyIds.length - 1
      ? historyIds[currentIndex + 1]
      : null;

  const toneScores = useMemo(
    () => Object.entries(history?.toneScores || {}),
    [history]
  );

  const handleCloseMemo = async () => {
    const memberId = getMemberId();
    const content = memo.trim();
    const savedContent = (history?.memo || "").trim();

    if (memberId === null || isSavingMemo || !history) {
      return;
    }

    if (content === savedContent) {
      setIsMemoOpen(false);
      return;
    }

    setIsSavingMemo(true);
    setMemoStatus("");

    try {
      if (content) {
        await translationApi.saveMemo(memberId, translationId, content);
        setMemo(content);
        setHistory((value) => ({ ...value, memo: content }));
      } else if (history?.memo) {
        await translationApi.removeMemo(memberId, translationId);
        setHistory((value) => ({ ...value, memo: null }));
      }
      setIsMemoOpen(false);
    } catch (error) {
      setMemoStatus(getNetworkErrorMessage(error));
    } finally {
      setIsSavingMemo(false);
    }
  };

  return (
    <main className="translation-detail-page">
      <div className="translation-detail-frame">
        <div className="translation-detail-content">
          <header className="translation-detail-brand">
            <HomeLogoLink>
              <img
                src={malgoLogo}
                alt="Malgo"
                draggable={false}
                className="translation-detail-logo"
              />
              <h1 className="translation-detail-brand-name">Malgo</h1>
            </HomeLogoLink>
          </header>

          <section
            className="translation-detail-board"
            aria-label="최근 번역 기록 상세"
          >
            <button
              type="button"
              className="translation-detail-back-button"
              onClick={() => navigate("/translation-history")}
              aria-label="최근 번역 기록 목록으로 돌아가기"
            >
              <img src={backIcon} alt="" aria-hidden="true" draggable={false} />
            </button>

            <time className="translation-detail-date">
              {formatDetailDate(history?.createdAt)}
            </time>

            <div className="translation-detail-greeting-row">
              <div className="translation-detail-bot-avatar">
                <img src={chatbotIcon} alt="" aria-hidden="true" draggable={false} />
              </div>
              <div className="translation-detail-greeting-bubble">
                <span>번역 기록을</span>
                <span>확인해보세요.</span>
              </div>
            </div>

            <div className="translation-detail-thread">
              {isLoading && (
                <p className="translation-detail-status">
                  번역 상세를 불러오는 중이에요.
                </p>
              )}

              {!isLoading && errorMessage && (
                <p className="translation-detail-status translation-detail-status--error">
                  {errorMessage}
                </p>
              )}

              {!isLoading && history && (
                <>
                  <div className="translation-detail-user-message">
                    {history.originalText}
                  </div>

                  <TranslationCard title="문화 맥락 추천 번역">
                    {history.culturalTranslation}
                  </TranslationCard>

                  <TranslationCard title="자연스러운 번역">
                    {history.naturalTranslation}
                  </TranslationCard>

                  <TranslationCard title="직역">
                    {history.literalTranslation}
                  </TranslationCard>

                  <TranslationCard title="문화적 설명">
                    <p>{history.culturalExplanation}</p>
                    <p className="translation-detail-risk">
                      위험 수준: {history.overallRiskLevel || "정보 없음"}
                    </p>
                  </TranslationCard>

                  {toneScores.length > 0 && (
                    <TranslationCard title="말투 점수">
                      <div className="translation-detail-score-list">
                        {toneScores.map(([key, value]) => (
                          <span key={key}>
                            {TONE_LABELS[key] || key} {value}
                          </span>
                        ))}
                      </div>
                    </TranslationCard>
                  )}

                  {Array.isArray(history.warnings) &&
                    history.warnings.length > 0 && (
                      <TranslationCard title="문화적 주의 표현">
                        <ul className="translation-detail-warning-list">
                          {history.warnings.map((warning, index) => (
                            <li key={`${warning.expression}-${index}`}>
                              <strong>{warning.expression}</strong>: {warning.reason}
                              {warning.alternativeExpression && (
                                <span> · 대안: {warning.alternativeExpression}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </TranslationCard>
                    )}

                  {isMemoOpen && (
                    <section
                      className="translation-detail-memo-card"
                      aria-label="메모"
                    >
                      <button
                        type="button"
                        className="translation-detail-memo-close"
                        aria-label="메모 닫기"
                        onClick={handleCloseMemo}
                        disabled={isSavingMemo}
                      >
                        ×
                      </button>

                      <label
                        className="translation-detail-visually-hidden"
                        htmlFor="translation-detail-memo"
                      >
                        메모 내용
                      </label>
                      <textarea
                        id="translation-detail-memo"
                        ref={memoInputRef}
                        value={memo}
                        maxLength={500}
                        spellCheck={false}
                        placeholder="이 번역에 대한 메모를 남겨보세요."
                        onChange={(event) => setMemo(event.target.value)}
                        disabled={isSavingMemo}
                      />

                      <span
                        className="translation-detail-visually-hidden"
                        role="status"
                      >
                        {isSavingMemo
                          ? "메모를 저장하는 중입니다."
                          : memoStatus}
                      </span>
                    </section>
                  )}

                </>
              )}
            </div>
          </section>

          <nav className="translation-detail-pagination" aria-label="번역 기록 이동">
            <button
              type="button"
              className="translation-detail-pagination-button"
              onClick={() => previousId && navigate(`/translation-history/${previousId}`)}
              disabled={!previousId}
              aria-label="이전 번역 기록"
            >
              <PaginationArrow direction="previous" />
            </button>
            <button
              type="button"
              className="translation-detail-pagination-button"
              onClick={() => nextId && navigate(`/translation-history/${nextId}`)}
              disabled={!nextId}
              aria-label="다음 번역 기록"
            >
              <PaginationArrow direction="next" />
            </button>
          </nav>
        </div>
      </div>
    </main>
  );
}
