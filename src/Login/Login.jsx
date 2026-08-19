import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import { saveStoredAuth } from "../api/auth";
import { getNetworkErrorMessage } from "../api/client";
import { authApi } from "../api/malgoApi";
import HomeLogoLink from "../HomeLogoLink/HomeLogoLink";

import malgoLogo from "../img/말고 로고.png";
import malgoDescription from "../img/문화까지 번역해주는.png";

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    autoLogin: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (event) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setLoginData((previousData) => ({
      ...previousData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const username = loginData.username.trim();

    const password = loginData.password;

    if (!username) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const memberId = await authApi.login({
        username,
        password,
      });

      /*
       * 로그인 명세서상 성공 응답:
       * JSON 객체가 아닌 회원 ID 숫자 하나를 반환합니다.
       * 예: 1
       */

      /*
       * 명세서에는 accessToken이 없으므로
       * 임의의 토큰을 만들어 저장하지 않습니다.
       *
       * 이후 회원별 API 요청에 사용할
       * memberId를 로그인 정보에 저장합니다.
       */
      const authData = {
        isLoggedIn: true,
        memberId,
        loginAt: new Date().toISOString(),

        user: {
          id: memberId,
          username,
        },
      };

      /*
       * 자동 로그인 체크:
       * 브라우저를 종료해도 로그인 정보 유지
       *
       * 자동 로그인 미체크:
       * 브라우저 탭을 종료하면 로그인 정보 제거
       */
      saveStoredAuth(authData, loginData.autoLogin);

      /*
       * 로그인 성공 후 메인 페이지 이동
       */
      navigate("/main", {
        replace: true,
      });
    } catch (error) {
      console.error("로그인 요청 실패:", error);

      alert(getNetworkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-page__content">
        {/* 로고 + 서비스명 + 설명 */}
        <section
          className="login-page__branding"
          aria-label="Malgo 서비스 로고"
        >
          <HomeLogoLink>
            <img
              className="login-page__logo"
              src={malgoLogo}
              alt="Malgo 로고"
              draggable="false"
            />

            <h1 className="login-page__title">
              Malgo
            </h1>
          </HomeLogoLink>

          <img
            className="login-page__description"
            src={malgoDescription}
            alt="문화까지 번역해주는"
            draggable="false"
          />
        </section>

        {/* 로그인 폼 */}
        <form
          className="login-form"
          onSubmit={handleLogin}
          noValidate
        >
          <div className="login-form__field">
            <label
              className="login-form__label"
              htmlFor="username"
            >
              아이디
            </label>

            <input
              id="username"
              className="login-form__input"
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleInputChange}
              placeholder="아이디"
              autoComplete="username"
              disabled={isSubmitting}
            />
          </div>

          <div className="login-form__field">
            <label
              className="login-form__label"
              htmlFor="password"
            >
              비밀번호
            </label>

            <input
              id="password"
              className="login-form__input"
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleInputChange}
              placeholder="비밀번호"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          <label className="login-form__auto-login">
            <input
              className="login-form__checkbox-input"
              type="checkbox"
              name="autoLogin"
              checked={loginData.autoLogin}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />

            <span
              className="login-form__checkbox"
              aria-hidden="true"
            />

            <span className="login-form__checkbox-text">
              자동 로그인
            </span>
          </label>

          <button
            className="login-form__submit"
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting
              ? "로그인 중..."
              : "로그인"}
          </button>

          <nav
            className="login-form__account-menu"
            aria-label="계정 메뉴"
          >
            <button
              className="login-form__account-button"
              type="button"
              disabled={isSubmitting}
            >
              아이디 찾기
            </button>

            <span className="login-form__separator">
              |
            </span>

            <button
              className="login-form__account-button"
              type="button"
              disabled={isSubmitting}
            >
              비밀번호 찾기
            </button>

            <span className="login-form__separator">
              |
            </span>

            <button
              className="login-form__account-button"
              type="button"
              onClick={() => navigate("/signup")}
              disabled={isSubmitting}
            >
              회원가입
            </button>
          </nav>
        </form>
      </div>
    </main>
  );
}

export default Login;
