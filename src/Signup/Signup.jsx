import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

import { getNetworkErrorMessage } from "../api/client";
import { authApi } from "../api/malgoApi";

/*
 * 비밀번호 표시 상태에 따라
 * 눈 아이콘 모양을 변경합니다.
 */
function PasswordEyeIcon({ visible }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M2.5 12C4.6 7.9 7.8 5.8 12 5.8C16.2 5.8 19.4 7.9 21.5 12C19.4 16.1 16.2 18.2 12 18.2C7.8 18.2 4.6 16.1 2.5 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="12"
        r="2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {visible && (
        <path
          d="M4 4L20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function Signup() {
  const navigate = useNavigate();

  /*
   * 백엔드 회원가입 페이로드와 동일한 필드명입니다.
   */
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
  });

  /*
   * 각각의 비밀번호 입력창 표시 여부
   */
  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showPasswordConfirm,
    setShowPasswordConfirm,
  ] = useState(false);

  /*
   * 회원가입 요청 중인지 확인합니다.
   * 버튼을 여러 번 누르는 중복 요청을 방지합니다.
   */
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  /*
   * 백엔드 Bean Validation과 같은 8~100자 범위를 확인합니다.
   */
  const isValidPassword = (password) => {
    return (
      password.length >= 8 &&
      password.length <= 100
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const username = formData.username.trim();
    const password = formData.password;
    const passwordConfirm =
      formData.passwordConfirm;

    /*
     * 입력값 검증
     */
    if (!username) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (username.length > 30) {
      alert("아이디는 30자 이하로 입력해주세요.");
      return;
    }

    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (!passwordConfirm) {
      alert("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (!isValidPassword(password)) {
      alert("비밀번호는 8자 이상 100자 이하로 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * 회원가입 API 요청
       *
       * POST /api/v1/auth/signup
       */
      await authApi.signup({
        username,
        password,
        passwordConfirm,
      });

      /*
       * 회원가입 성공
       */
      alert("회원가입이 완료되었습니다.");

      /*
       * 회원가입 완료 후 로그인 페이지로 이동합니다.
       */
      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("회원가입 요청 실패:", error);

      /*
       * fetch 자체가 실패한 경우
       *
       * 백엔드 미실행
       * API 주소 오류
       * CORS 오류
       * 네트워크 오류
       */
      alert(getNetworkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-screen">
      <section className="signup-page">
        {/* 상단 영역 */}
        <header className="signup-header">
          <button
            type="button"
            className="signup-back-button"
            onClick={() => navigate("/login")}
            aria-label="로그인 페이지로 돌아가기"
            disabled={isSubmitting}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M15 18L9 12L15 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <h1 className="signup-title">
            회원가입
          </h1>
        </header>

        {/* 회원가입 폼 */}
        <form
          className="signup-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="signup-fields">
            {/* 아이디 */}
            <div className="signup-field signup-field-id">
              <label
                className="signup-label"
                htmlFor="username"
              >
                아이디
              </label>

              <input
                id="username"
                className="signup-input"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ex. test123"
                maxLength={30}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>

            {/* 비밀번호 */}
            <div className="signup-password-area">
              <div className="signup-field">
                <label
                  className="signup-label"
                  htmlFor="password"
                >
                  비밀번호
                </label>

                <div className="signup-input-wrapper">
                  <input
                    id="password"
                    className="signup-input signup-input-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="비밀번호를 입력해주세요"
                    minLength={8}
                    maxLength={100}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previousState) =>
                          !previousState
                      )
                    }
                    aria-label={
                      showPassword
                        ? "비밀번호 숨기기"
                        : "비밀번호 보기"
                    }
                    aria-pressed={showPassword}
                    disabled={isSubmitting}
                  >
                    <PasswordEyeIcon
                      visible={showPassword}
                    />
                  </button>
                </div>
              </div>

              <p className="signup-password-guide">
                비밀번호는 8자 이상 100자 이하로 입력해주세요.
              </p>
            </div>

            {/* 비밀번호 확인 */}
            <div className="signup-field">
              <label
                className="signup-label"
                htmlFor="passwordConfirm"
              >
                비밀번호 확인
              </label>

              <div className="signup-input-wrapper">
                <input
                  id="passwordConfirm"
                  className="signup-input signup-input-password"
                  name="passwordConfirm"
                  type={
                    showPasswordConfirm
                      ? "text"
                      : "password"
                  }
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력해주세요"
                  minLength={8}
                  maxLength={100}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowPasswordConfirm(
                      (previousState) =>
                        !previousState
                    )
                  }
                  aria-label={
                    showPasswordConfirm
                      ? "비밀번호 확인 숨기기"
                      : "비밀번호 확인 보기"
                  }
                  aria-pressed={showPasswordConfirm}
                  disabled={isSubmitting}
                >
                  <PasswordEyeIcon
                    visible={showPasswordConfirm}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 화면 하단 */}
          <div className="signup-bottom">
            <p className="signup-login-message">
              이미 계정이 있으신가요?{" "}

              <button
                type="button"
                className="signup-login-link"
                onClick={() => navigate("/login")}
                disabled={isSubmitting}
              >
                로그인
              </button>
            </p>

            <button
              type="submit"
              className="signup-start-button"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting
                ? "가입 중..."
                : "시작하기"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Signup;
