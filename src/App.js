import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Splash from "./Splash/Splash";
import Login from "./Login/Login";
import Signup from "./Signup/Signup";
import MainPage from "./Mainpage/MainPage";

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

        {/* 메인 화면 */}
        <Route
          path="/main"
          element={<MainPage />}
        />

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