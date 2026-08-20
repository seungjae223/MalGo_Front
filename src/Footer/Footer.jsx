import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Footer.css";

import inactiveHomeIcon from "../img/figma-footer-home-icon-inactive.svg";
import activeProfileIcon from "../img/figma-footer-profile-icon-active.svg";
import inactiveProfileIcon from "../img/figma-footer-profile-icon-inactive.svg";

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
              src={inactiveHomeIcon}
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
            <img
              src={
                isMyInfoActive
                  ? activeProfileIcon
                  : inactiveProfileIcon
              }
              alt=""
              aria-hidden="true"
              draggable={false}
              className="malgo-footer-profile-icon"
            />
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
