import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import TrackerDashboard from "./components/TrackerDashboard";
import ComposeEmail from "./components/ComposeEmail";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <nav>
        <Link to="/">Dashboard</Link>
        {user ? (
          <>
            <span> Welcome {user.username}</span>
            <button
              onClick={() => {
                fetch("http://localhost:3001/auth/logout", {
                  credentials: "include",
                })
                  .then(() => setUser(null))
                  .catch((error) => {
                    console.log(error);
                  });
              }}
            >
              LogOut
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <div>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <>
                  <ComposeEmail />
                  <TrackerDashboard />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
