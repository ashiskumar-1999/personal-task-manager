import { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./lib/AuthContext";
import LogIn from "./components/LogIn";
import SignUp from "./components/SignUp";
import DashBoard from "./components/DashBoard";
import AddTask from "./components/AddTask";
import ProtectedRoute from "./lib/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            }
          />
          <Route path="/add-task" element={<AddTask />} />
          <Route path="/" element={<LogIn />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
