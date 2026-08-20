import { useNavigate } from "react-router-dom";
import "./Splash.css";
import { getMemberId } from "../api/auth";

import languageIcon from "../img/언어.png";
import puzzleKr from "../img/splash/puzzle-kr.svg";
import puzzleEn from "../img/퍼즐2.svg";
import briefcase from "../img/splash/briefcase.svg";
import chat from "../img/splash/chat.svg";
import document from "../img/splash/document.svg";
import envelope from "../img/splash/envelope.svg";
import globe from "../img/splash/globe.svg";
import lineChart from "../img/splash/line-chart.svg";
import barChart from "../img/splash/bar-chart.svg";
import orbit from "../img/splash/orbit.svg";
import startButton from "../img/시작하기.png";

function Splash() {
  const navigate = useNavigate();

  const handleStart = () => {
    // 시작하기 버튼 클릭 시 로그인 페이지로 이동
    const memberId = getMemberId();

    navigate(memberId === null ? "/login" : "/main", {
      replace: true,
    });
  };

  return (
    <main className="splash">
      <img
        className="splash__language"
        src={languageIcon}
        alt=""
        aria-hidden="true"
        draggable="false"
      />

      <div className="splash__intro-dots" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <p className="splash__headline">
        언어와 문화의 차이를 이해하고
      </p>

      <div
        className="splash__character-group splash__character-group--kr"
        aria-hidden="true"
      >
        <img
          className="splash__puzzle"
          src={puzzleKr}
          alt=""
          draggable="false"
        />
        <img
          className="splash__decoration splash__decoration--briefcase"
          src={briefcase}
          alt=""
          draggable="false"
        />
      </div>

      <img
        className="splash__decoration splash__decoration--message"
        src={chat}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <img
        className="splash__decoration splash__decoration--chart"
        src={barChart}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <img
        className="splash__decoration splash__decoration--globe"
        src={globe}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <img
        className="splash__decoration splash__decoration--envelope"
        src={envelope}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <img
        className="splash__decoration splash__decoration--mountain"
        src={lineChart}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <img
        className="splash__decoration splash__decoration--orbit"
        src={orbit}
        alt=""
        aria-hidden="true"
        draggable="false"
      />

      <div
        className="splash__character-group splash__character-group--en"
        aria-hidden="true"
      >
        <img
          className="splash__puzzle"
          src={puzzleEn}
          alt=""
          draggable="false"
        />
        <img
          className="splash__decoration splash__decoration--clipboard"
          src={document}
          alt=""
          draggable="false"
        />
      </div>

      <p className="splash__tagline">
        <strong>글로벌 비즈니스의 연결</strong>을 완성하세요
      </p>

      <button
        className="splash__start-button"
        type="button"
        onClick={handleStart}
        aria-label="시작하기"
      >
        <img
          src={startButton}
          alt=""
          draggable="false"
        />
      </button>
    </main>
  );
}

export default Splash;
