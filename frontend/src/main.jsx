import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// React 앱 시작점
// BrowserRouter로 감싸서 페이지 라우팅이 가능하게 한다.
ReactDOM.createRoot(document.getElementById("root")).render(
 
      <App />

);