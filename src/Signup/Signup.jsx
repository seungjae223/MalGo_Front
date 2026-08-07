import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

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

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    passwordConfirm: "",
  });

  /*
   * 각각의 비밀번호 입력창 표시 여부
   */
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const isValidPassword = (password) => {
    const hasMinimumLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialCharacter = /[^A-Za-z0-9\s]/.test(password);

    return (
      hasMinimumLength &&
      hasLowercase &&
      hasUppercase &&
      hasNumber &&
      hasSpecialCharacter
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { userId, password, passwordConfirm } = formData;

    if (!userId.trim() || !password || !passwordConfirm) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (!isValidPassword(password)) {
      alert(
        "비밀번호는 8자 이상이며 영문 대소문자, 숫자, 특수문자를 포함해야 합니다."
      );
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    console.log("회원가입 정보", formData);

    /*
     * 나중에 백엔드 회원가입 API를 연결하면 됩니다.
     *
     * 회원가입 성공 후 로그인 페이지로 이동:
     * navigate("/login");
     */

    alert("회원가입 정보가 정상적으로 입력되었습니다.");
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

          <h1 className="signup-title">회원가입</h1>
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
                htmlFor="userId"
              >
                아이디
              </label>

              <input
                id="userId"
                className="signup-input"
                name="userId"
                type="email"
                value={formData.userId}
                onChange={handleChange}
                placeholder="Ex. abcd@email.com"
                autoComplete="username"
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
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="비밀번호를 입력해주세요"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previousState) => !previousState
                      )
                    }
                    aria-label={
                      showPassword
                        ? "비밀번호 숨기기"
                        : "비밀번호 보기"
                    }
                    aria-pressed={showPassword}
                  >
                    <PasswordEyeIcon
                      visible={showPassword}
                    />
                  </button>
                </div>
              </div>

              <p className="signup-password-guide">
                8자 이상, 영문 대소문자, 숫자, 특수문자를 포함해야
                합니다.
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
                    showPasswordConfirm ? "text" : "password"
                  }
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력해주세요"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowPasswordConfirm(
                      (previousState) => !previousState
                    )
                  }
                  aria-label={
                    showPasswordConfirm
                      ? "비밀번호 확인 숨기기"
                      : "비밀번호 확인 보기"
                  }
                  aria-pressed={showPasswordConfirm}
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
              >
                로그인
              </button>
            </p>

            <button
              type="submit"
              className="signup-start-button"
            >
              시작하기
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Signup;