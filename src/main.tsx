import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ReactGA from "react-ga4";
import * as amplitude from "@amplitude/analytics-browser";
import App from "./App";
import "./index.css";

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const AMPLITUDE_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY as string | undefined;

if (import.meta.env.PROD) {
  if (GA4_ID) ReactGA.initialize(GA4_ID);
  if (AMPLITUDE_KEY) amplitude.init(AMPLITUDE_KEY, { autocapture: true });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
