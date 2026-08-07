import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Splash from "./Splash/Splash";
import Login from "./Login/Login";

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