import { Link } from "react-router-dom";

/*
 * 기존 로고의 배치를 바꾸지 않고 홈으로 이동시키는 공통 링크입니다.
 * display: contents 스타일과 함께 사용해 각 페이지의 Figma 좌표를 유지합니다.
 */
function HomeLogoLink({ children, onHome }) {
  const handleClick = () => {
    onHome?.();
  };

  return (
    <Link
      to="/main"
      className="home-logo-link"
      aria-label="홈으로 이동"
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

export default HomeLogoLink;
