import { useNavigate } from "react-router-dom";
import "./Splash.css";
import { getMemberId } from "../api/auth";

import puzzleKr from "../img/퍼즐1.svg";
import puzzleEn from "../img/퍼즐2.svg";
import startButton from "../img/시작하기.png";
import languageIcon from "../img/언어.png";

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
      {/* 우측 상단 언어 아이콘 */}
      <img
        className="splash__language"
        src={languageIcon}
        alt=""
        aria-hidden="true"
        draggable="false"
      />

      {/* 상단 KR 퍼즐 */}
      <img
        className="splash__puzzle splash__puzzle--kr"
        src={puzzleKr}
        alt="한국어"
        draggable="false"
      />

      {/* 하단 EN 퍼즐 */}
      <img
        className="splash__puzzle splash__puzzle--en"
        src={puzzleEn}
        alt="영어"
        draggable="false"
      />

      {/* 시작하기 버튼 */}
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
