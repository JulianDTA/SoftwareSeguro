import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import keycloak from "./auth/keycloak";
import { AuthProvider } from "./auth/AuthContext";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/site.css";

keycloak
  .init({
    onLoad: "check-sso",
    silentCheckSsoRedirectUri: window.location.origin + "/app/silent-check-sso.html",
    pkceMethod: "S256",
    checkLoginIframe: false,
  })
  .then(() => {
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <BrowserRouter basename="/app">
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
  });
