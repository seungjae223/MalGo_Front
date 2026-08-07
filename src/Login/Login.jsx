import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import malgoLogo from "../img/말고 로고.png";
import malgoDescription from "../img/문화까지 번역해주는.png";

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

    if (!loginData.identifier.trim()) {
      alert("아이디 또는 이메일 주소를 입력해주세요.");
      return;
    }

    if (!loginData.password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    console.log("로그인 정보", loginData);
  };

  return (
    <main className="login-page">
      <div className="login-page__content">
        {/* 로고 + 서비스명 + 설명 */}
        <section className="login-page__branding">
          <img
            className="login-page__logo"
            src={malgoLogo}
            alt="MalGo 로고"
            draggable="false"
          />

          <h1 className="login-page__title">Malgo</h1>

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