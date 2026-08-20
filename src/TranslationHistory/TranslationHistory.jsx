import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import "./TranslationHistory.css";

import SubscriptionModal from "../SubscriptionModal/SubscriptionModal";

import { getMemberId } from "../api/auth";
import { getNetworkErrorMessage } from "../api/client";
import {
  subscriptionApi,
  translationApi,
} from "../api/malgoApi";
import HomeLogoLink from "../HomeLogoLink/HomeLogoLink";

import malgoLogo from "../img/말고 로고.png";
import translationResultIcon from "../img/번역결과 아이콘.svg";
import memoIcon from "../img/메모.svg";
import emptyMemoIcon from "../img/memo-empty.svg";
import backIcon from "../img/뒤로가기.svg";
import group62Icon from "../img/group-62.svg";
import nextArrowIcon from "../img/translation-history-arrow-next.svg";
import previousArrowIcon from "../img/translation-history-arrow-previous.svg";

const PAGE_SIZE = 2;

function formatHistoryDate(createdAt) {
  if (!createdAt) {
    return { dateTime: "", dateLabel: "날짜 없음" };
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return {
      dateTime: String(createdAt),
      dateLabel: String(createdAt).slice(0, 10).replace(/-/g, " - "),
    };
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return {
    dateTime: `${year}-${month}-${day}`,
    dateLabel: `${year} - ${month} - ${day}`,
  };
}

function toHistoryRecord(item) {
  return {
    id: item.translationId,
    ...formatHistoryDate(item.createdAt),
    userMessageLines: [item.originalText || "원문이 없습니다."],
    resultDescription:
      "아따 요것이 내가 젤 추천하는 방향이랑께.",
    translatedLines: [
      item.recommendedTranslation || "추천 번역이 없습니다.",
    ],
    memo: item.memo || "",
    hasMemo: Boolean(item.hasMemo || item.memo),
  };
}

/* ==============================
최근 번역 기록 한 개
================================ */

function HistoryRecord({
  history,
  position,
  onMoreClick,
  onMemoClick,
}) {
  return (
    <>
      {/* 날짜 및 메모 아이콘 */}
      <div
        className={`
          translation-history-date-row
          translation-history-date-row--${position}
        `}
      >
        <time dateTime={history.dateTime}>
          {history.dateLabel}
        </time>

        <button
          type="button"
          className="translation-history-memo-button"
          aria-label={`${history.dateLabel} 기록 메모`}
          onClick={() => onMemoClick(history, position)}
        >
          <img
            src={history.hasMemo ? memoIcon : emptyMemoIcon}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </button>
      </div>

      {/* 날짜별 번역 기록 카드 */}
      <div
        className={`
          translation-history-record-card
          translation-history-record-card--${position}
        `}
      >
        {/* 사용자가 입력한 내용 */}
        <div
          className={`
            translation-history-user-message
            translation-history-user-message--${position}
          `}
        >
          {history.userMessageLines.map(
            (line, index) => (
              <span
                key={`${history.id}-user-${index}`}
              >
                {line}
              </span>
            )
          )}
        </div>

        {/* 번역 결과 */}
        <div
          className={`
            translation-history-result
            translation-history-result--${position}
          `}
        >
          <p className="translation-history-result-description">
            {history.resultDescription}
          </p>

          <div
            className="translation-history-result-divider"
            aria-hidden="true"
          />

          <div className="translation-history-recommendation">
            <img
              src={translationResultIcon}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="translation-history-result-icon"
            />

            <span>
              추천 번역
            </span>
          </div>

          <p className="translation-history-translated-text">
            {history.translatedLines.map(
              (line, index) => (
                <span
                  key={`${history.id}-translated-${index}`}
                >
                  {line}
                </span>
              )
            )}
          </p>
        </div>

        {/* 더보기 위 구분선 */}
        <div
          className="translation-history-more-divider"
          aria-hidden="true"
        />

        <button
          type="button"
          className="translation-history-more-button"
          aria-label={`${history.dateLabel} 전체 채팅 보기`}
          onClick={() => onMoreClick(history)}
        >
          더보기
        </button>
      </div>
    </>
  );
}

/* ==============================
최근 번역 기록 페이지
================================ */

function TranslationHistory() {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [page, setPage] = useState(0);
  const [pageDirection, setPageDirection] = useState("next");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [memoTarget, setMemoTarget] = useState(null);
  const [memo, setMemo] = useState("");
  const [isMemoLoading, setIsMemoLoading] =
    useState(false);
  const [isMemoSaving, setIsMemoSaving] =
    useState(false);
  const [memoStatus, setMemoStatus] = useState("");
  const [
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
  ] = useState(false);

  useEffect(() => {
    const memberId = getMemberId();

    if (memberId === null) {
      navigate("/login", { replace: true });
      return undefined;
    }

    const controller = new AbortController();

    const loadHistory = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await translationApi.listRecent(memberId, {
          signal: controller.signal,
        });

        if (!Array.isArray(response)) {
          throw new Error("번역 기록 응답 형식이 올바르지 않습니다.");
        }

        setHistoryItems(response.map(toHistoryRecord));
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

    loadHistory();
    return () => controller.abort();
  }, [navigate]);

  const pageItems = useMemo(
    () => historyItems.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [historyItems, page]
  );
  const lastPage = Math.max(
    0,
    Math.ceil(historyItems.length / PAGE_SIZE) - 1
  );

  /*
   * 뒤로가기 버튼을 누르면
   * 마이페이지로 이동합니다.
   */
  const handleBackClick = () => {
    navigate("/mypage");
  };

  /*
   * 더보기 버튼을 누르면
   * 선택한 번역 기록의 상세 화면으로 이동합니다.
   *
   * state를 통해 선택한 기록 데이터도
   * 상세 화면에 함께 전달합니다.
   */
  const handleMoreClick = (history) => {
    navigate(
      `/translation-history/${history.id}`,
      {
        state: {
          history,
        },
      }
    );
  };

  const handleMemoClick = (history, position) => {
    const memberId = getMemberId();

    if (memberId === null) {
      navigate("/login", { replace: true });
      return;
    }

    setMemoTarget({ ...history, position });
    setMemo(history.memo || "");
    setMemoStatus("");
    setIsMemoLoading(true);

    translationApi
      .get(memberId, history.id)
      .then((detail) => {
        const savedMemo = detail?.memo || "";

        setMemo(savedMemo);
        setHistoryItems((items) =>
          items.map((item) =>
            item.id === history.id
              ? {
                  ...item,
                  memo: savedMemo,
                  hasMemo: Boolean(savedMemo),
                }
              : item
          )
        );
        setMemoTarget((target) =>
          target?.id === history.id
            ? {
                ...target,
                memo: savedMemo,
                hasMemo: Boolean(savedMemo),
              }
            : target
        );
      })
      .catch((error) => {
        setMemoStatus(getNetworkErrorMessage(error));
      })
      .finally(() => {
        setIsMemoLoading(false);
      });
  };

  const handleCloseMemo = async () => {
    if (!memoTarget || isMemoSaving) {
      return;
    }

    const memberId = getMemberId();
    const content = memo.trim();
    const savedContent = (memoTarget.memo || "").trim();

    if (isMemoLoading) {
      setMemoTarget(null);
      setMemoStatus("");
      return;
    }

    if (memberId === null) {
      navigate("/login", { replace: true });
      return;
    }

    if (content === savedContent) {
      setMemoTarget(null);
      setMemoStatus("");
      return;
    }

    setIsMemoSaving(true);
    setMemoStatus("");

    try {
      if (content) {
        await translationApi.saveMemo(
          memberId,
          memoTarget.id,
          content
        );
      } else {
        await translationApi.removeMemo(
          memberId,
          memoTarget.id
        );
      }

      setHistoryItems((items) =>
        items.map((item) =>
          item.id === memoTarget.id
            ? {
                ...item,
                memo: content,
                hasMemo: Boolean(content),
              }
            : item
        )
      );
      setMemoTarget((target) =>
        target
          ? {
              ...target,
              memo: content,
              hasMemo: Boolean(content),
            }
          : target
      );
      setMemo(content);
      setMemoTarget(null);
      setMemoStatus("");
    } catch (error) {
      setMemoStatus(getNetworkErrorMessage(error));
    } finally {
      setIsMemoSaving(false);
    }
  };

  const handlePageChange = (nextPage) => {
    const boundedPage = Math.min(
      lastPage,
      Math.max(0, nextPage)
    );

    if (boundedPage === page) {
      return;
    }

    setPageDirection(
      boundedPage > page ? "next" : "previous"
    );
    setPage(boundedPage);
  };

  const handleSubscriptionStart = async () => {
    const memberId = getMemberId();

    if (memberId === null) {
      throw new Error(
        "로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요."
      );
    }

    try {
      await subscriptionApi.activatePremium(memberId);
    } catch (error) {
      throw new Error(getNetworkErrorMessage(error));
    }
  };

  return (
    <main className="translation-history-page">
      <div className="translation-history-page-frame">
        <div className="translation-history-page-content">
          {/* 오른쪽 위 아이콘 */}
          <button
            type="button"
            className="translation-history-sync-badge"
            aria-label="구독 혜택 보기"
            aria-haspopup="dialog"
            onClick={() =>
              setIsSubscriptionModalOpen(true)
            }
          >
            <img
              src={group62Icon}
              alt=""
              aria-hidden="true"
            />
          </button>

          {/* Malgo 로고 */}
          <header className="translation-history-brand">
            <HomeLogoLink>
              <img
                src={malgoLogo}
                alt="Malgo"
                draggable={false}
                className="translation-history-logo"
              />

              <h1 className="translation-history-brand-name">
                Malgo
              </h1>
            </HomeLogoLink>
          </header>

          {/* 최근 번역 기록 전체 테두리 */}
          <section
            className="translation-history-board"
            aria-label="최근 번역 기록"
          >
            {/* 뒤로가기 */}
            <button
              type="button"
              className="translation-history-back-button"
              aria-label="마이페이지로 돌아가기"
              onClick={handleBackClick}
            >
              <img
                src={backIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            </button>

            {isLoading && (
              <p className="translation-history-status">
                번역 기록을 불러오는 중이에요.
              </p>
            )}

            {!isLoading && errorMessage && (
              <p className="translation-history-status translation-history-status--error">
                {errorMessage}
              </p>
            )}

            {!isLoading && !errorMessage && pageItems.length === 0 && (
              <p className="translation-history-status">
                아직 저장된 번역 기록이 없어요.
              </p>
            )}

            <div
              key={page}
              className={`
                translation-history-page-set
                translation-history-page-set--${pageDirection}
              `}
            >
              {pageItems.map((history, index) => (
                <HistoryRecord
                  key={history.id}
                  history={history}
                  position={
                    index === 0 ? "first" : "second"
                  }
                  onMoreClick={handleMoreClick}
                  onMemoClick={handleMemoClick}
                />
              ))}
            </div>

            {memoTarget && (
              <div
                className="translation-history-memo-overlay"
                onMouseDown={handleCloseMemo}
              >
                <section
                  className={`translation-history-memo-modal translation-history-memo-modal--${memoTarget.position}`}
                  role="dialog"
                  aria-modal="true"
                  aria-label="메모"
                  onMouseDown={(event) =>
                    event.stopPropagation()
                  }
                >
                  <button
                    type="button"
                    className="translation-history-memo-close"
                    aria-label="메모 닫기"
                    onClick={handleCloseMemo}
                    disabled={isMemoSaving}
                  >
                    ×
                  </button>

                  <label
                    className="translation-history-visually-hidden"
                    htmlFor="translation-history-memo"
                  >
                    메모 내용
                  </label>
            <textarea
              id="translation-history-memo"
              value={memo}
              maxLength={500}
              spellCheck={false}
              placeholder="이 번역에 대한 메모를 남겨보세요."
                    onChange={(event) =>
                      setMemo(event.target.value)
                    }
                    disabled={isMemoLoading || isMemoSaving}
                  />

                  <span
                    className="translation-history-visually-hidden"
                    role="status"
                  >
                    {isMemoLoading
                      ? "메모를 불러오는 중입니다."
                      : isMemoSaving
                        ? "메모를 저장하는 중입니다."
                        : memoStatus}
                  </span>
                </section>
              </div>
            )}
          </section>

          {/* 하단 페이지 이동 버튼 */}
          <nav
            className="translation-history-pagination"
            aria-label="번역 기록 페이지 이동"
          >
            <button
              type="button"
              className="translation-history-pagination-button"
              aria-label="이전 번역 기록"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0 || isLoading}
            >
              <img
                src={previousArrowIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            </button>

            <button
              type="button"
              className="translation-history-pagination-button"
              aria-label="다음 번역 기록"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= lastPage || isLoading}
            >
              <img
                src={nextArrowIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            </button>
          </nav>
        </div>
      </div>

      {isSubscriptionModalOpen && (
        <SubscriptionModal
          onClose={() =>
            setIsSubscriptionModalOpen(false)
          }
          onStart={handleSubscriptionStart}
        />
      )}

    </main>
  );
}

export default TranslationHistory;
