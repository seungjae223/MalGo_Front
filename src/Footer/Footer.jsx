import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Footer.css";

import homeIcon from "../img/챗봇아이콘.svg";

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="malgo-footer-profile-icon"
    >
      <circle
        cx="32"
        cy="21"
        r="10"
        fill="currentColor"
      />

      <path
        d="
          M14 52
          C14 41.5 22.1 34 32 34
          C41.9 34 50 41.5 50 52
          V54
          H14
          V52
          Z
        "
        fill="currentColor"
      />
    </svg>
  );
}

function Footer() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /*
   * 메인 화면과 대화 요약 화면은
   * 모두 홈 메뉴를 활성화합니다.
   */
  const isHomeActive =
    pathname === "/main" ||
    pathname.startsWith("/summary");

  /*
   * 마이페이지와 최근 번역 기록 화면에서는
   * 내정보 메뉴를 활성화합니다.
   */
  const isMyInfoActive =
    pathname === "/mypage" ||
    pathname.startsWith("/mypage/") ||
    pathname === "/translation-history" ||
    pathname.startsWith(
      "/translation-history/"
    );

  const handleHomeClick = () => {
    navigate("/main");
  };

  const handleMyInfoClick = () => {
    navigate("/mypage");
  };

  return (
    <>
      {/*
       * 고정 푸터가 페이지 내용을 가리지 않도록
       * 푸터 높이만큼 공간을 확보합니다.
       */}
      <div
        className="malgo-footer-spacer"
        aria-hidden="true"
      />

      <footer
        className="malgo-footer"
        aria-label="하단 메뉴"
      >
        {/* 홈 */}
        <button
          type="button"
          className={`malgo-footer-item ${
            isHomeActive ? "active" : ""
          }`}
          aria-current={
            isHomeActive
              ? "page"
              : undefined
          }
          onClick={handleHomeClick}
        >
          <span className="malgo-footer-icon-circle">
            <img
              src={homeIcon}
              alt=""
              aria-hidden="true"
              className="malgo-footer-home-icon"
            />
          </span>

          <span className="malgo-footer-label">
            홈
          </span>
        </button>

        {/* 내정보 */}
        <button
          type="button"
          className={`malgo-footer-item ${
            isMyInfoActive ? "active" : ""
          }`}
          aria-current={
            isMyInfoActive
              ? "page"
              : undefined
          }
          onClick={handleMyInfoClick}
        >
          <span className="malgo-footer-icon-circle">
            <ProfileIcon />
          </span>

          <span className="malgo-footer-label">
            내정보
          </span>
        </button>
      </footer>
    </>
  );
}

export default Footer;
