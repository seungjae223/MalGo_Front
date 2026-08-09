import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import malgoLogo from "../img/말고 로고.png";
import malgoDescription from "../img/문화까지 번역해주는.png";

/*
 * 백엔드 연결 전 사용하는 목업 계정
 */
const MOCK_USER = {
  id: 1,
  identifier: "malgo",
  email: "malgo@test.com",
  password: "123456",
  name: "승재",
};

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
    autoLogin: false,
  });

  const handleInputChange = (event) => {
    const { name, value, checked, type } = event.target;

    setLoginData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = (event) => {
    event.preventDefault();

    const enteredIdentifier = loginData.identifier.trim().toLowerCase();
    const enteredPassword = loginData.password.trim();

    if (!enteredIdentifier) {
      alert("아이디 또는 이메일 주소를 입력해주세요.");
      return;
    }

    if (!enteredPassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    /*
     * 아이디 또는 이메일 중 하나가 일치하면 됩니다.
     */
    const isIdentifierMatched =
      enteredIdentifier === MOCK_USER.identifier ||
      enteredIdentifier === MOCK_USER.email;

    const isPasswordMatched =
      enteredPassword === MOCK_USER.password;

    if (!isIdentifierMatched || !isPasswordMatched) {
      alert(
        "아이디 또는 비밀번호가 올바르지 않습니다.\n\n" +
          "목업 아이디: malgo\n" +
          "목업 비밀번호: 123456"
      );
      return;
    }

    /*
     * 실제 백엔드 대신 사용할 임시 로그인 정보
     */
    const mockAuthData = {
      accessToken: "mock-access-token",
      isLoggedIn: true,
      loginAt: new Date().toISOString(),
      user: {
        id: MOCK_USER.id,
        identifier: MOCK_USER.identifier,
        email: MOCK_USER.email,
        name: MOCK_USER.name,
      },
    };

    /*
     * 자동 로그인 여부에 따라 저장소를 다르게 사용합니다.
     *
     * 자동 로그인 체크:
     * 브라우저를 종료해도 로그인 정보 유지
     *
     * 자동 로그인 미체크:
     * 브라우저 탭을 종료하면 로그인 정보 제거
     */
    if (loginData.autoLogin) {
      localStorage.setItem(
        "malgoAuth",
        JSON.stringify(mockAuthData)
      );

      sessionStorage.removeItem("malgoAuth");
    } else {
      sessionStorage.setItem(
        "malgoAuth",
        JSON.stringify(mockAuthData)
      );

      localStorage.removeItem("malgoAuth");
    }

    /*
     * 로그인 성공 후 메인 페이지 이동
     */
    navigate("/main", {
      replace: true,
    });
  };

  return (
    <main className="login-page">
      <div className="login-page__content">
        {/* 로고 + 서비스명 + 설명 */}
        <section
          className="login-page__branding"
          aria-label="Malgo 서비스 로고"
        >
          <img
            className="login-page__logo"
            src={malgoLogo}
            alt="Malgo 로고"
            draggable="false"
          />

          <h1 className="login-page__title">
            Malgo
          </h1>

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
              htmlFor="identifier"
            >
              아이디
            </label>

            <input
              id="identifier"
              className="login-form__input"
              type="text"
              name="identifier"
              value={loginData.identifier}
              onChange={handleInputChange}
              placeholder="아이디 또는 이메일 주소"
              autoComplete="username"
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
              placeholder="비밀번호(영문+숫자 6~16자)"
              minLength={6}
              maxLength={16}
              autoComplete="current-password"
            />
          </div>

          <label className="login-form__auto-login">
            <input
              className="login-form__checkbox-input"
              type="checkbox"
              name="autoLogin"
              checked={loginData.autoLogin}
              onChange={handleInputChange}
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
          >
            로그인
          </button>

          <nav
            className="login-form__account-menu"
            aria-label="계정 메뉴"
          >
            <button
              className="login-form__account-button"
              type="button"
            >
              아이디 찾기
            </button>

            <span className="login-form__separator">
              |
            </span>

            <button
              className="login-form__account-button"
              type="button"
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