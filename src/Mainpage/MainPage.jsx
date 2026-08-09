import { useEffect, useMemo, useRef, useState } from "react";
import "./MainPage.css";

import mainLogo from "../img/메인페이지 로고.png";
import sendIcon from "../img/메세지.png";
import chatbotIcon from "../img/챗봇아이콘.svg";

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
  중동: ["걸프", "레반트", "튀르키예", "이란"],
  아시아: ["동아시아", "동남아시아", "남아시아", "중앙아시아"],
  유럽: ["서유럽", "남유럽", "동유럽", "북유럽", "남동유럽"],
  아프리카: ["북아프리카", "서아프리카", "동아프리카", "남아프리카"],
  아메리카: ["북아메리카", "중앙아메리카", "카리브", "남아메리카"],
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

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

/**
 * 실제 표정 이미지가 나오기 전까지 사용하는 임시 얼굴입니다.
 * 추후 <TemporaryFace /> 부분을 <img src={...} />로 교체하면 됩니다.
 */
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
          <circle cx="34" cy="41" r="3.5" fill="#a4c2cc" />
          <circle cx="66" cy="41" r="3.5" fill="#a4c2cc" />

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
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("유럽");
  const [selectedArea, setSelectedArea] = useState("");
  const [inputValue, setInputValue] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      content: "반가워요\n무엇을 도와드릴까요?",
    },
  ]);

  const messageListRef = useRef(null);

  const selectedPartner = useMemo(() => {
    return PARTNERS.find(
      (partner) => partner.id === selectedPartnerId
    );
  }, [selectedPartnerId]);

  const selectedRegionAreas = REGION_DATA[selectedRegion];

  useEffect(() => {
    if (!messageListRef.current) {
      return;
    }

    messageListRef.current.scrollTop =
      messageListRef.current.scrollHeight;
  }, [messages]);

  const handlePartnerSelect = (partnerId) => {
    setSelectedPartnerId(partnerId);
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setSelectedArea("");
  };

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!selectedPartner) {
      window.alert("AI 대화 상대를 먼저 선택해주세요.");
      return;
    }

    if (!selectedArea) {
      window.alert("해당되는 국가 지역을 선택해주세요.");
      return;
    }

    const currentTime = Date.now();

    const userMessage = {
      id: `user-${currentTime}`,
      sender: "user",
      content: trimmedMessage,
    };

    const botMessage = {
      id: `bot-${currentTime}`,
      sender: "bot",
      content: `${selectedPartner.name}님과의 관계와 ${selectedArea} 문화에 맞게 확인해드릴게요.`,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      botMessage,
    ]);

    setInputValue("");
  };

  const handleSummary = () => {
    const userMessages = messages
      .filter((message) => message.sender === "user")
      .map((message) => message.content);

    if (userMessages.length === 0) {
      window.alert("아직 요약할 대화 내용이 없어요.");
      return;
    }

    const summaryText = userMessages
      .map((message, index) => `${index + 1}. ${message}`)
      .join("\n");

    window.alert(`대화 내용 요약\n\n${summaryText}`);
  };

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

          <h1 className="main-logo-title">Malgo</h1>
        </header>

        <main className="main-chat-container">
          <section className="partner-section">
            <h2 className="partner-section-title">
              AI 대화 상대 선택
            </h2>

            <div className="partner-list">
              {PARTNERS.map((partner) => {
                const isSelected =
                  selectedPartnerId === partner.id;

                return (
                  <button
                    key={partner.id}
                    type="button"
                    className={`partner-item ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() =>
                      handlePartnerSelect(partner.id)
                    }
                    aria-pressed={isSelected}
                  >
                    <div className="partner-face-wrapper">
                      <TemporaryFace type={partner.faceType} />
                    </div>

                    <span className="partner-name">
                      {partner.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="partner-information-bar">
              {PARTNERS.map((partner) => (
                <button
                  key={partner.id}
                  type="button"
                  className={`partner-information ${
                    selectedPartnerId === partner.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handlePartnerSelect(partner.id)
                  }
                >
                  {partner.relation}·{partner.country}
                </button>
              ))}
            </div>
          </section>

          <section className="chat-content">
            <div className="chat-information-row">
              <div className="chatbot-icon-box">
                <img
                  src={chatbotIcon}
                  alt="Malgo 챗봇"
                  className="chatbot-icon"
                />
              </div>

              <time className="chat-date">
                {formatDate(new Date())}
              </time>

              <div className="chat-information-empty" />
            </div>

            <div
              className="message-list"
              ref={messageListRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-row ${message.sender}`}
                >
                  <div className="message-bubble">
                    {message.content
                      .split("\n")
                      .map((line, index, lines) => (
                        <span
                          key={`${message.id}-${index}`}
                        >
                          {line}

                          {index < lines.length - 1 && <br />}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="country-selection-wrapper">
              <section className="country-selection-card">
                <h3 className="country-selection-title">
                  원하시는 국가 서비스를 선택 해주세요.
                </h3>

                <div className="country-button-list">
                  {Object.keys(REGION_DATA).map((region) => (
                    <button
                      key={region}
                      type="button"
                      className={`country-button ${
                        selectedRegion === region
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleRegionSelect(region)
                      }
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </section>

              <section className="country-selection-card">
                <h3 className="country-selection-title">
                  해당되는 국가를 선택해주세요.
                </h3>

                <div className="country-button-list area-list">
                  {selectedRegionAreas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      className={`country-button area-button ${
                        selectedArea === area
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => setSelectedArea(area)}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <form
            className="message-input-section"
            onSubmit={handleSendMessage}
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
                setInputValue(event.target.value)
              }
            />

            <button
              type="submit"
              className="message-send-button"
              aria-label="메시지 전송"
              disabled={!inputValue.trim()}
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
        >
          대화 내용 요약하기
        </button>
      </div>
    </div>
  );
}

export default MainPage;