import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import TrackerDashboard from "./components/TrackerDashboard";
import ComposeEmail from "./components/ComposeEmail";
import API_BASE_URL from "./config";

function App() {
  const [user, setUser] = useState(null);

  useEffect(()=> {
    fetch(`${API_BASE_URL}/auth/session`,  {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch((error) => console.log(error));
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        credentials: "include",
      });
  
      if (!response.ok) throw new Error("Logout failed");
  
      setUser(null);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <Router>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <NavLink to="/" style={({ isActive }) => ({ color: isActive ? "blue" : "black" })}>Dashboard</NavLink> | {' '}
          {user ? (
        <>
          <span style={{ marginLeft: "10px" }}>Welcome {user.username}</span>
          <button style={{ marginLeft: "10px" }} onClick={handleLogout}>Logout</button>
        </>
        ) : (
        <>
          <NavLink to="/login" style={({ isActive }) => ({ color: isActive ? "blue" : "black" })}>Login</NavLink> | {' '}
          <NavLink to="/register" style={({ isActive }) => ({ color: isActive ? "blue" : "black" })}>Register</NavLink>
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
