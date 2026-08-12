import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { me } from "../services/api";

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("loading"); // loading | authed | unauthenticated | unreachable

  useEffect(() => {
    let cancelled = false;

    if (!localStorage.getItem("token")) {
      setStatus("unauthenticated");
      return;
    }

    me()
      .then(() => {
        if (!cancelled) setStatus("authed");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response && err.response.status === 401) {
          setStatus("unauthenticated");
        } else {
          setStatus("unreachable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Checking session...</div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "unreachable") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 gap-4">
        <p>Cannot reach the backend. Start it with mvn spring-boot:run on port 8080.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;