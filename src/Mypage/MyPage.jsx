import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import "./MyPage.css";

import SubscriptionModal from "../SubscriptionModal/SubscriptionModal";

import {
  clearStoredAuth,
  getMemberId,
} from "../api/auth";
import { getNetworkErrorMessage } from "../api/client";
import {
  authApi,
  conversationApi,
  subscriptionApi,
} from "../api/malgoApi";
import HomeLogoLink from "../HomeLogoLink/HomeLogoLink";

import malgoLogo from "../img/말고 로고.png";
import usFlag from "../img/language-flag-us.svg";
import japaneseFlag from "../img/group-140.svg";
import chineseFlag from "../img/group-139.svg";
import vietnameseFlag from "../img/language-flag-vn.svg";
import spanishFlag from "../img/language-flag-es.svg";
import germanFlag from "../img/language-flag-de.svg";
import recentTranslationIcon from "../img/최근 번역기록.png";
import group62Icon from "../img/group-62.svg";

const LANGUAGE_OPTIONS = [
  {
    id: "work",
    key: "EN",
    label: "영어",
    icon: usFlag,
  },
  {
    id: "travel",
    key: "JA",
    label: "일본어",
    icon: japaneseFlag,
  },
  {
    id: "daily",
    key: "ZH",
    label: "중국어",
    icon: chineseFlag,
  },
  {
    id: "shopping",
    key: "VI",
    label: "베트남어",
    icon: vietnameseFlag,
  },
  {
    id: "health",
    key: "ES",
    label: "스페인어",
    icon: spanishFlag,
  },
  {
    id: "german",
    key: "DE",
    label: "독일어",
    icon: germanFlag,
  },
];

const formatPercentage = (value) =>
  `${Number(value || 0).toFixed(1).replace(/\.0$/, "")}%`;

function isPremiumSubscription(subscription) {
  if (
    subscription?.plan !== "PREMIUM" ||
    subscription?.status !== "ACTIVE"
  ) {
    return false;
  }

  if (!subscription.expiresAt) {
    return true;
  }

  const expiresAt = new Date(subscription.expiresAt);

  return (
    !Number.isNaN(expiresAt.getTime()) &&
    expiresAt.getTime() > Date.now()
  );
}

/*
 * 프로필 아이콘
 */
function UserIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="28"
        cy="18"
        r="10.5"
        fill="currentColor"
      />

      <path
        d="
          M10.5 49
          C11.75 35.9 18.6 28.8 28 28.8
          C37.4 28.8 44.25 35.9 45.5 49
          H10.5
          Z
        "
        fill="currentColor"
      />
    </svg>
  );
}

/* 언어별 국가 아이콘 */
function CategoryIcon({ item }) {
  return (
    <img
      className="my-page-field-image"
      src={item.icon}
      alt=""
      draggable="false"
    />
  );
}

function MyPage() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    totalCount: 0,
    percentages: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
  ] = useState(false);

  const fieldData = useMemo(
    () =>
      LANGUAGE_OPTIONS.map((item) => ({
        ...item,
        value: formatPercentage(
          statistics.percentages?.[item.key]
        ),
      })),
    [statistics]
  );

  const vennData = fieldData.slice(0, 3);

  useEffect(() => {
    const memberId = getMemberId();

    if (memberId === null) {
      navigate("/login", { replace: true });
      return undefined;
    }

    const controller = new AbortController();

    const loadMyPage = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [statisticsData, subscription] = await Promise.all([
          conversationApi.getStatistics(memberId, {
            signal: controller.signal,
          }),
          subscriptionApi.get(memberId, {
            signal: controller.signal,
          }),
        ]);

        setStatistics({
          totalCount: Number(statisticsData?.totalCount || 0),
          percentages: statisticsData?.percentages || {},
        });
        setIsSubscribed(isPremiumSubscription(subscription));
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

    loadMyPage();
    return () => controller.abort();
  }, [navigate]);

  /*
   * 최근 번역 기록 버튼 클릭 시
   * 최근 번역 기록 페이지로 이동합니다.
   */
  const handleTranslationHistoryClick = () => {
    navigate("/translation-history");
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await authApi.logout();
      clearStoredAuth();
      navigate("/login", { replace: true });
    } catch (error) {
      window.alert(getNetworkErrorMessage(error));
      setIsLoggingOut(false);
    }
  };

  const handleSubscriptionStart = async () => {
    const memberId = getMemberId();

    if (memberId === null) {
      throw new Error(
        "로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요."
      );
    }

    try {
      const subscription =
        await subscriptionApi.activatePremium(memberId);
      setIsSubscribed(isPremiumSubscription(subscription));
    } catch (error) {
      throw new Error(getNetworkErrorMessage(error));
    }
  };

  /*
   * FooterLayout이 페이지 전체 스크롤을 담당하므로
   * 마이페이지에 들어올 때 이전 화면의 스크롤 위치를 초기화합니다.
   */
  useLayoutEffect(() => {
    const resetScrollPosition = () => {
      const footerLayout =
        document.querySelector(".footer-layout");

      const myPage =
        document.querySelector(".malgo-my-page");

      footerLayout?.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      myPage?.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    };

    resetScrollPosition();

    const animationFrameId =
      window.requestAnimationFrame(
        resetScrollPosition
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrameId
      );
    };
  }, []);

  return (
    <main className="malgo-my-page">
      <div className="malgo-my-page-content">
        <button
          type="button"
          className="my-page-logout-button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        >
          {isLoggingOut ? "로그아웃 중" : "로그아웃"}
        </button>

        {/* 오른쪽 위 아이콘 */}
        {isSubscribed === false && (
          <button
            type="button"
            className="my-page-sync-badge"
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
        )}

        {/* 로고 */}
        <header className="my-page-brand">
          <HomeLogoLink>
            <img
              className="my-page-brand-logo"
              src={malgoLogo}
              alt=""
              draggable="false"
            />

            <h1 className="my-page-brand-name">
              Malgo
            </h1>
          </HomeLogoLink>
        </header>

        {/* 마이페이지 카드 */}
        <section
          className="my-page-analysis-card"
          aria-labelledby="field-analysis-title"
        >
          {/* 프로필 및 최근 번역 기록 */}
          <div className="my-page-profile-panel">
            <div className="my-page-profile">
              <UserIcon className="my-page-profile-icon" />
            </div>

            <button
              className="my-page-history-button"
              type="button"
              onClick={handleTranslationHistoryClick}
              aria-label="최근 번역 기록으로 이동"
            >
              <img
                className="my-page-history-icon"
                src={recentTranslationIcon}
                alt=""
                draggable="false"
              />

              <span>최근 번역 기록</span>
            </button>
          </div>

          {/* 분석 제목 */}
          <h2
            id="field-analysis-title"
            className="my-page-analysis-title"
          >
            언어별 대화 분석
          </h2>

          {isLoading && (
            <p className="my-page-api-status">사용 통계를 불러오는 중이에요.</p>
          )}

          {!isLoading && errorMessage && (
            <p className="my-page-api-status my-page-api-status--error">
              {errorMessage}
            </p>
          )}

          {/* 벤 다이어그램 */}
          <div
            className="my-page-venn"
            role="img"
            aria-label={`${vennData
              .map((item) => `${item.label} ${item.value}`)
              .join(", ")} 언어별 대화 분석 그래프`}
          >
            <div
              className="
                my-page-venn-circle
                my-page-venn-circle--work
              "
            />

            <div
              className="
                my-page-venn-circle
                my-page-venn-circle--travel
              "
            />

            <div
              className="
                my-page-venn-circle
                my-page-venn-circle--daily
              "
            />

            {/* 업무 */}
            <div
              className="
                my-page-venn-main-label
                my-page-venn-main-label--work
              "
            >
              <span>
                {vennData[0].label}
              </span>

              <strong>
                {vennData[0].value}
              </strong>
            </div>

            {/* 여행 */}
            <div
              className="
                my-page-venn-main-label
                my-page-venn-main-label--travel
              "
            >
              <span>
                {vennData[1].label}
              </span>

              <strong>
                {vennData[1].value}
              </strong>
            </div>

            {/* 일상 */}
            <div
              className="
                my-page-venn-main-label
                my-page-venn-main-label--daily
              "
            >
              <span>
                {vennData[2].label}
              </span>

              <strong>
                {vennData[2].value}
              </strong>
            </div>

            {/* 업무 + 여행 */}
            <span
              className="
                my-page-venn-overlap
                my-page-venn-overlap--work-travel
              "
            >
              —
            </span>

            {/* 업무 + 일상 */}
            <span
              className="
                my-page-venn-overlap
                my-page-venn-overlap--work-daily
              "
            >
              —
            </span>

            {/* 중앙 */}
            <span
              className="
                my-page-venn-overlap
                my-page-venn-overlap--center
              "
            >
              —
            </span>

            {/* 여행 + 일상 */}
            <span
              className="
                my-page-venn-overlap
                my-page-venn-overlap--travel-daily
              "
            >
              —
            </span>
          </div>

          {/* 상황별 비율 목록 */}
          <ul
            className="my-page-field-list"
            aria-label="언어별 대화 비율 목록"
          >
            {fieldData.map((item) => (
              <li
                className="my-page-field-row"
                key={item.id}
              >
                <span
                  className="my-page-field-icon-circle"
                  aria-hidden="true"
                >
                  <CategoryIcon item={item} />
                </span>

                <div className="my-page-field-track">
                  <span className="my-page-field-label">
                    {item.label}
                  </span>

                  <span className="my-page-field-value">
                    {item.value}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
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

export default MyPage;
