import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./MainPage.css";

import SummaryPage from "../Summarypage/SummaryPage";
import SummaryLoadingModal from "../SummaryLoadingModal/SummaryLoadingModal";

import mainLogo from "../img/메인페이지 로고.png";
import sendIcon from "../img/메세지.png";
import chatbotIcon from "../img/챗봇아이콘.svg";
import handIcon from "../img/손.png";

const PARTNERS = [
  {
    id: "tom",
    name: "Tom",
    relation: "거래처",
    country: "US",
    faceType: "serious",
  },
  {
    id: "kash",
    name: "kash",
    relation: "친구",
    country: "JP",
    faceType: "smile",
  },
  {
    id: "sana",
    name: "sana",
    relation: "상사",
    country: "VN",
    faceType: "neutral",
  },
];

const REGION_DATA = {
  중동: [
    "걸프",
    "레반트",
    "튀르키예",
    "이란",
  ],

  아시아: [
    "동아시아",
    "동남아시아",
    "남아시아",
    "중앙아시아",
  ],

  유럽: [
    "서유럽",
    "남유럽",
    "동유럽",
    "북유럽",
    "남동유럽",
  ],

  아프리카: [
    "북아프리카",
    "서아프리카",
    "동아프리카",
    "남아프리카",
  ],

  아메리카: [
    "북아메리카",
    "중앙아메리카",
    "카리브",
    "남아메리카",
  ],
};

const TARGET_OPTIONS = [
  "영유아",
  "초등학생",
  "중학생",
  "고등학생",
  "대학생",
  "직장인",
  "중년",
  "노인",
];

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
      className="history-icon"
    >
      <path d="M8.5 9.5H3.5V4.5" />

      <path d="M4.5 9.5A12 12 0 1 1 4 21" />

      <path d="M16 8.5V17L21.5 20.5" />
    </svg>
  );
}

function TemporaryFace({ type }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="temporary-face"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="43"
        fill="#e8f7fb"
        stroke="#bed5de"
        strokeWidth="5"
      />

      {type === "serious" && (
        <>
          <path
            d="M25 37H41"
            stroke="#bed5de"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M59 37H75"
            stroke="#bed5de"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M34 39V44"
            stroke="#9dbac4"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M66 39V44"
            stroke="#9dbac4"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M43 68H57"
            stroke="#bed5de"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      )}

      {type === "smile" && (
        <>
          <circle
            cx="34"
            cy="41"
            r="3.5"
            fill="#a4c2cc"
          />

          <circle
            cx="66"
            cy="41"
            r="3.5"
            fill="#a4c2cc"
          />

          <path
            d="M31 58C37 68 51 72 67 60"
            fill="none"
            stroke="#a8c9d4"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}

      {type === "neutral" && (
        <>
          <path
            d="M27 38H40"
            stroke="#bed5de"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M60 38H73"
            stroke="#bed5de"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M34 47H38"
            stroke="#9dbac4"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M62 47H66"
            stroke="#9dbac4"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <rect
            x="45"
            y="61"
            width="10"
            height="17"
            rx="4"
            fill="#bed5de"
          />
        </>
      )}
    </svg>
  );
}

function MainPage() {
  const [selectedPartnerId, setSelectedPartnerId] =
    useState(null);

  const [selectedRegion, setSelectedRegion] =
    useState("유럽");

  const [selectedArea, setSelectedArea] =
    useState("서유럽");

  const [selectedTarget, setSelectedTarget] =
    useState("대학생");

  const [targetFeature, setTargetFeature] =
    useState("");

  const [inputValue, setInputValue] =
    useState("");

  const [
    isSummaryPageOpen,
    setIsSummaryPageOpen,
  ] = useState(false);

  const [
    isSummaryLoading,
    setIsSummaryLoading,
  ] = useState(false);

  const [summaryMemo, setSummaryMemo] =
    useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      content:
        "반가워요\n무엇을 도와드릴까요?",
    },
  ]);

  const messageListRef = useRef(null);

  /*
   * 요약 로딩이 끝난 뒤
   * SummaryPage를 열기 위한 타이머입니다.
   */
  const summaryTimerRef = useRef(null);

  const selectedPartner = useMemo(() => {
    return PARTNERS.find(
      (partner) =>
        partner.id === selectedPartnerId
    );
  }, [selectedPartnerId]);

  const selectedRegionAreas =
    REGION_DATA[selectedRegion] ?? [];

  /*
   * 사용자 메시지가 하나라도 있으면
   * 국가·대상 설정 영역을 숨깁니다.
   */
  const hasStartedChat = messages.some(
    (message) =>
      message.sender === "user"
  );

  useEffect(() => {
    if (!messageListRef.current) {
      return;
    }

    messageListRef.current.scrollTop =
      messageListRef.current.scrollHeight;
  }, [messages]);

  /*
   * 로딩 모달이 열려 있는 동안
   * 배경 페이지 스크롤을 막습니다.
   */
  useEffect(() => {
    if (!isSummaryLoading) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isSummaryLoading]);

  /*
   * 컴포넌트가 사라질 때
   * 남아 있는 타이머를 정리합니다.
   */
  useEffect(() => {
    return () => {
      if (summaryTimerRef.current) {
        window.clearTimeout(
          summaryTimerRef.current
        );
      }
    };
  }, []);

  const handlePartnerSelect = (
    partnerId
  ) => {
    setSelectedPartnerId(partnerId);
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setSelectedArea("");
  };

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage =
      inputValue.trim();

    const trimmedTargetFeature =
      targetFeature.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!selectedPartner) {
      window.alert(
        "AI 대화 상대를 먼저 선택해주세요."
      );

      return;
    }

    if (!selectedArea) {
      window.alert(
        "해당되는 국가 지역을 선택해주세요."
      );

      return;
    }

    if (!selectedTarget) {
      window.alert(
        "해당되는 대상을 선택해주세요."
      );

      return;
    }

    const currentTime = Date.now();

    const userMessage = {
      id: `user-${currentTime}`,
      sender: "user",
      content: trimmedMessage,
    };

    const targetFeatureText =
      trimmedTargetFeature.length > 0
        ? ` 대상의 특징은 "${trimmedTargetFeature}"로 설정했어요.`
        : "";

    const botMessage = {
      id: `bot-${currentTime}`,
      sender: "bot",

      content:
        `${selectedPartner.name}님과의 관계, ` +
        `${selectedArea} 문화, ` +
        `${selectedTarget} 대상에 맞게 ` +
        `확인해드릴게요.` +
        targetFeatureText,
    };

    setMessages(
      (previousMessages) => [
        ...previousMessages,
        userMessage,
        botMessage,
      ]
    );

    setInputValue("");
  };

  /*
   * 대화 내용 요약하기
   *
   * 1. 사용자 대화 확인
   * 2. 로딩 모달 표시
   * 3. 3초 후 SummaryPage 표시
   */
  const handleSummary = () => {
    const hasUserMessage =
      messages.some(
        (message) =>
          message.sender === "user"
      );

    if (!hasUserMessage) {
      window.alert(
        "아직 요약할 대화 내용이 없어요."
      );

      return;
    }

    if (isSummaryLoading) {
      return;
    }

    setIsSummaryLoading(true);

    if (summaryTimerRef.current) {
      window.clearTimeout(
        summaryTimerRef.current
      );
    }

    summaryTimerRef.current =
      window.setTimeout(() => {
        summaryTimerRef.current = null;

        setIsSummaryLoading(false);
        setIsSummaryPageOpen(true);
      }, 3000);
  };

  /*
   * 로딩이 끝나면 기존에 연결한
   * SummaryPage를 표시합니다.
   */
  if (isSummaryPageOpen) {
    return (
      <SummaryPage
        messages={messages}
        selectedPartner={selectedPartner}
        selectedRegion={selectedRegion}
        selectedArea={selectedArea}
        selectedTarget={selectedTarget}
        targetFeature={targetFeature}
        memo={summaryMemo}
        onMemoChange={setSummaryMemo}
        onBack={() =>
          setIsSummaryPageOpen(false)
        }
      />
    );
  }

  return (
    <div className="main-page-scroll">
      <div className="main-page">
        <header className="main-header">
          <button
            type="button"
            className="history-button"
            aria-label="지난 대화 기록 보기"
          >
            <HistoryIcon />
          </button>

          <img
            src={mainLogo}
            alt="Malgo"
            className="main-logo"
          />

          <h1 className="main-logo-title">
            Malgo
          </h1>
        </header>

        <main className="main-chat-container">
          <section className="partner-section">
            <h2 className="partner-section-title">
              AI 대화 상대 선택
            </h2>

            <div className="partner-list">
              {PARTNERS.map(
                (partner) => {
                  const isSelected =
                    selectedPartnerId ===
                    partner.id;

                  return (
                    <button
                      key={partner.id}
                      type="button"
                      className={`partner-item ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handlePartnerSelect(
                          partner.id
                        )
                      }
                      aria-pressed={
                        isSelected
                      }
                    >
                      <div className="partner-face-wrapper">
                        <TemporaryFace
                          type={
                            partner.faceType
                          }
                        />
                      </div>

                      <span className="partner-name">
                        {partner.name}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <div className="partner-information-bar">
              {PARTNERS.map(
                (partner) => (
                  <button
                    key={partner.id}
                    type="button"
                    className={`partner-information ${
                      selectedPartnerId ===
                      partner.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handlePartnerSelect(
                        partner.id
                      )
                    }
                    aria-pressed={
                      selectedPartnerId ===
                      partner.id
                    }
                  >
                    {partner.relation}·
                    {partner.country}
                  </button>
                )
              )}
            </div>
          </section>

          <section
            className={`chat-content ${
              hasStartedChat
                ? "chat-started"
                : ""
            }`}
          >
            <div className="chat-information-row">
              <time className="chat-date">
                {formatDate(new Date())}
              </time>
            </div>

            <div
              className={`message-list ${
                hasStartedChat
                  ? "expanded"
                  : ""
              }`}
              ref={messageListRef}
            >
              {messages.map(
                (
                  message,
                  messageIndex
                ) => {
                  const isBotMessage =
                    message.sender ===
                    "bot";

                  const isInitialBotMessage =
                    isBotMessage &&
                    messageIndex === 0;

                  return (
                    <div
                      key={message.id}
                      className={`message-row ${
                        message.sender
                      } ${
                        isInitialBotMessage
                          ? "initial-message"
                          : ""
                      }`}
                    >
                      {isBotMessage && (
                        <div className="chatbot-icon-box">
                          <img
                            src={
                              chatbotIcon
                            }
                            alt="Malgo 챗봇"
                            className="chatbot-icon"
                          />
                        </div>
                      )}

                      <div className="message-bubble">
                        {message.content
                          .split("\n")
                          .map(
                            (
                              line,
                              lineIndex,
                              lines
                            ) => (
                              <span
                                key={`${message.id}-${lineIndex}`}
                                className="message-line"
                              >
                                {line}

                                {isInitialBotMessage &&
                                  lineIndex ===
                                    0 && (
                                    <img
                                      src={
                                        handIcon
                                      }
                                      alt=""
                                      aria-hidden="true"
                                      className="message-hand-icon"
                                    />
                                  )}

                                {lineIndex <
                                  lines.length -
                                    1 && <br />}
                              </span>
                            )
                          )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/*
             * 첫 사용자 메시지를 전송하기 전까지만
             * 설정 영역을 화면에 표시합니다.
             */}
            {!hasStartedChat && (
              <div className="country-selection-wrapper">
                <section className="country-selection-card">
                  <h3 className="country-selection-title">
                    원하시는 국가 서비스를
                    선택 해주세요.
                  </h3>

                  <div className="country-button-list">
                    {Object.keys(
                      REGION_DATA
                    ).map(
                      (region) => (
                        <button
                          key={region}
                          type="button"
                          className={`country-button ${
                            selectedRegion ===
                            region
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleRegionSelect(
                              region
                            )
                          }
                          aria-pressed={
                            selectedRegion ===
                            region
                          }
                        >
                          {region}
                        </button>
                      )
                    )}
                  </div>
                </section>

                <section className="country-selection-card">
                  <h3 className="country-selection-title">
                    해당되는 국가를
                    선택해주세요.
                  </h3>

                  <div className="country-button-list area-list">
                    {selectedRegionAreas.map(
                      (area) => {
                        const isWideArea =
                          area.length >= 5;

                        return (
                          <button
                            key={area}
                            type="button"
                            className={`country-button area-button ${
                              isWideArea
                                ? "wide-button"
                                : ""
                            } ${
                              selectedArea ===
                              area
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedArea(
                                area
                              )
                            }
                            aria-pressed={
                              selectedArea ===
                              area
                            }
                          >
                            {area}
                          </button>
                        );
                      }
                    )}
                  </div>
                </section>

                <section className="country-selection-card target-selection-card">
                  <h3 className="country-selection-title">
                    해당되는 대상을
                    선택해주세요.
                  </h3>

                  <div className="country-button-list target-button-list">
                    {TARGET_OPTIONS.map(
                      (target) => (
                        <button
                          key={target}
                          type="button"
                          className={`country-button target-button ${
                            selectedTarget ===
                            target
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedTarget(
                              target
                            )
                          }
                          aria-pressed={
                            selectedTarget ===
                            target
                          }
                        >
                          {target}
                        </button>
                      )
                    )}
                  </div>
                </section>

                <input
                  type="text"
                  className="target-feature-input"
                  placeholder="대상의 특징에 대해 적어주세요."
                  aria-label="대상의 특징"
                  value={targetFeature}
                  maxLength={100}
                  onChange={(event) =>
                    setTargetFeature(
                      event.target.value
                    )
                  }
                />
              </div>
            )}
          </section>

          <form
            className="message-input-section"
            onSubmit={
              handleSendMessage
            }
          >
            <input
              type="text"
              className="message-input"
              placeholder={
                selectedPartner
                  ? `${selectedPartner.name}에게 메시지 입력`
                  : "메시지를 입력해주세요."
              }
              value={inputValue}
              onChange={(event) =>
                setInputValue(
                  event.target.value
                )
              }
            />

            <button
              type="submit"
              className="message-send-button"
              aria-label="메시지 전송"
              disabled={
                !inputValue.trim()
              }
            >
              <img
                src={sendIcon}
                alt=""
                className="message-send-icon"
              />
            </button>
          </form>
        </main>

        <button
          type="button"
          className="conversation-summary-button"
          onClick={handleSummary}
          disabled={isSummaryLoading}
          aria-busy={isSummaryLoading}
        >
          대화 내용 요약하기
        </button>
      </div>

      {/* 대화 요약 로딩 모달 */}
      {isSummaryLoading && <SummaryLoadingModal />}
    </div>
  );
}

export default MainPage;