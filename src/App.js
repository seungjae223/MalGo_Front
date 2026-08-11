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
import Footer from "./Footer/Footer";

/*
 * 메인 화면과 요약 화면에서만
 * 공통 푸터를 표시합니다.
 */
function FooterLayout() {
  return (
    <div className="footer-layout">
      <Outlet />

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 첫 화면 */}
        <Route
          path="/"
          element={<Splash />}
        />

        {/* 로그인 화면 */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* 회원가입 화면 */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* 푸터가 표시되는 화면 */}
        <Route element={<FooterLayout />}>
          {/* 메인 화면 */}
          <Route
            path="/main"
            element={<MainPage />}
          />

          {/* 대화 내용 요약 화면 */}
          <Route
            path="/summary"
            element={<SummaryPage />}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;