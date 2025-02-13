import { useEffect, useState } from "react";
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

  useEffect(()=> {
    fetch("http://localhost:3001/auth/session",  {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch((error) => console.log(error));
  }, [])

  return (
    <Router>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/">Dashboard</Link> | {' '}
        {user ? (
          <>
            <span style={{ marginLeft: '10px' }}> Welcome {user.username}</span>
            <button
              style={{ marginLeft: '10px' }}
              onClick={() => {
                fetch("http://localhost:3001/auth/logout", {credentials: "include"})
                  .then(() => setUser(null))
                  .catch((error) => {
                    console.log(error);
                  });
              }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link> | {' '}
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
