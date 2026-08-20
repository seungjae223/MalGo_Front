import {
  useEffect,
  useState,
} from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";

import Splash from "./Splash/Splash";
import Login from "./Login/Login";
import Signup from "./Signup/Signup";
import MainPage from "./Mainpage/MainPage";
import SummaryPage from "./Summarypage/SummaryPage";
import MyPage from "./Mypage/MyPage";
import TranslationHistory from "./TranslationHistory/TranslationHistory";
import TranslationHistoryDetail from "./TranslationHistory/TranslationHistoryDetail";
import Footer from "./Footer/Footer";
import { authApi } from "./api/malgoApi";
import {
  AUTH_EXPIRED_EVENT,
  getMemberId,
  clearStoredAuth,
  saveStoredAuth,
} from "./api/auth";

function RequireAuth({ memberId }) {
  const [isAuthenticated, setIsAuthenticated] =
    useState(() => memberId !== null);

  useEffect(() => {
    setIsAuthenticated(memberId !== null);
  }, [memberId]);

  useEffect(() => {
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener(
      AUTH_EXPIRED_EVENT,
      handleAuthExpired
    );

    return () => {
      window.removeEventListener(
        AUTH_EXPIRED_EVENT,
        handleAuthExpired
      );
    };
  }, []);

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}

/*
 * 모든 페이지에서 공통 푸터를 표시합니다.
 *
 * app-page-content:
 * 고정된 푸터가 페이지 콘텐츠를 덮지 않도록
 * App.css의 공통 여백을 적용하는 영역입니다.
 */
function FooterLayout() {
  return (
    <div className="footer-layout">
      <div className="app-page-content">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}

function App() {
  const [isBootstrappingAuth, setIsBootstrappingAuth] =
    useState(true);
  const [memberId, setMemberId] = useState(() =>
    getMemberId()
  );

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const memberId = await authApi.restore();

        if (cancelled) {
          return;
        }

        setMemberId(memberId);
        saveStoredAuth(
          {
            isLoggedIn: true,
            memberId,
            loginAt: new Date().toISOString(),
            user: { id: memberId },
          },
          false
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error?.status === 401) {
          clearStoredAuth();
          setMemberId(null);
        }
      } finally {
        if (!cancelled) {
          setIsBootstrappingAuth(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setMemberId(null);
    };

    window.addEventListener(
      AUTH_EXPIRED_EVENT,
      handleAuthExpired
    );

    return () => {
      window.removeEventListener(
        AUTH_EXPIRED_EVENT,
        handleAuthExpired
      );
    };
  }, []);

  if (isBootstrappingAuth) {
    return <div />;
  }

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        {/*
         * 모든 실제 페이지를 FooterLayout 안에 배치해
         * 어느 화면에서도 공통 푸터가 표시되도록 합니다.
         */}
        <Route element={<FooterLayout />}>
          {/* 첫 화면 */}
          <Route
            index
            element={<Splash />}
          />

          {/* 로그인 화면 */}
          <Route
            path="login"
            element={<Login />}
          />

          {/* 회원가입 화면 */}
          <Route
            path="signup"
            element={<Signup />}
          />

          <Route
            element={<RequireAuth memberId={memberId} />}
          >
            {/* 메인 화면 */}
            <Route
              path="main"
              element={<MainPage />}
            />

            {/* 대화 내용 요약 화면 */}
            <Route
              path="summary"
              element={<SummaryPage />}
            />

            {/* 마이페이지 */}
            <Route
              path="mypage"
              element={<MyPage />}
            />

            {/* 최근 번역 기록 목록 */}
            <Route
              path="translation-history"
              element={<TranslationHistory />}
            />

            {/* 최근 번역 기록 채팅 상세 */}
            <Route
              path="translation-history/:historyId"
              element={<TranslationHistoryDetail />}
            />
          </Route>

          {/* 존재하지 않는 주소는 첫 화면으로 이동 */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
