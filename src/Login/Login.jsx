import { useState } from "react";
import "./Login.css";

import malgoLogo from "../img/말고 로고.png";
import malgoDescription from "../img/문화까지 번역해주는.png";

function Login() {
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

    /*
     * 추후 백엔드 로그인 API를 이곳에 연결하면 됩니다.
     *
     * 예시:
     * await axios.post("/api/auth/login", {
     *   email: loginData.identifier,
     *   password: loginData.password,
     * });
     */

    console.log("로그인 정보", loginData);
  };

  return (
    <main className="login-page">
      {/* 상단 MalGo 말풍선 로고 */}
      <img
        className="login-page__logo"
        src={malgoLogo}
        alt="MalGo 로고"
        draggable="false"
      />

      {/* 서비스 이름 */}
      <h1 className="login-page__title">Malgo</h1>

      {/* 문화까지 번역해주는 */}
      <img
        className="login-page__description"
        src={malgoDescription}
        alt="문화까지 번역해주는"
        draggable="false"
      />

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

        {/* 자동 로그인 */}
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

        {/* 로그인 버튼 */}
        <button
          className="login-form__submit"
          type="submit"
        >
          로그인
        </button>

        {/* 하단 계정 메뉴 */}
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

          <span className="login-form__separator">|</span>

          <button
            className="login-form__account-button"
            type="button"
          >
            비밀번호 찾기
          </button>

          <span className="login-form__separator">|</span>

          <button
            className="login-form__account-button"
            type="button"
          >
            회원가입
          </button>
        </nav>
      </form>
    </main>
  );
}

export default Login;