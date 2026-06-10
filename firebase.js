// ============================================================
//  firebase.js — Firebase 初期化 & 共通ユーティリティ
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAnalytics }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey:            "AIzaSyAt8voQxE_Sd5AJWkbMxp26cfc_VBTLzR8",
  authDomain:        "nishimura-study.firebaseapp.com",
  projectId:         "nishimura-study",
  storageBucket:     "nishimura-study.firebasestorage.app",
  messagingSenderId: "1081021984108",
  appId:             "1:1081021984108:web:88dbdf2f907af7267a5749",
  measurementId:     "G-57F4PFE29P"
};

const app       = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const analytics = getAnalytics(app);

// ============================================================
//  テーマ管理
// ============================================================
const THEME_KEY = "rek-theme";
const THEMES = ["history", "geo", "civics", "dark", "light"];

export function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "history";
  applyTheme(saved);
  return saved;
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === "history" ? "" : theme;
  if (theme !== "history") {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  localStorage.setItem(THEME_KEY, theme);
  // アクティブドットを更新
  document.querySelectorAll(".theme-dot").forEach(d => {
    d.classList.toggle("active", d.dataset.t === theme);
  });
}

export function initThemeSwitcher() {
  const current = loadTheme();
  document.querySelectorAll(".theme-dot").forEach(dot => {
    dot.classList.toggle("active", dot.dataset.t === current);
    dot.addEventListener("click", () => applyTheme(dot.dataset.t));
  });
}

// ============================================================
//  モバイルナビ
// ============================================================
export function initMobileNav() {
  const btn = document.querySelector(".btn-menu");
  const nav = document.querySelector(".mobile-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}

// ============================================================
//  トースト通知
// ============================================================
export function toast(msg, type = "default", duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity .3s";
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ============================================================
//  ローディングオーバーレイ
// ============================================================
export function showLoading() {
  const el = document.createElement("div");
  el.className = "loading-overlay";
  el.id = "loading-overlay";
  el.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(el);
}
export function hideLoading() {
  document.getElementById("loading-overlay")?.remove();
}

// ============================================================
//  共通トップバー HTML を挿入するヘルパー
// ============================================================
export function renderTopbar(activePage = "") {
  const pages = [
    { href: "index.html",    label: "概要" },
    { href: "news.html",     label: "お知らせ" },
    { href: "timeline.html", label: "年表" },
    { href: "quiz-select.html", label: "クイズ" },
    { href: "ranking.html",  label: "ランキング" },
  ];

  const navLinks = pages.map(p =>
    `<a href="${p.href}" class="${activePage === p.label ? "active" : ""}">${p.label}</a>`
  ).join("");

  const themeDots = ["history","geo","civics","dark","light"].map(t =>
    `<div class="theme-dot" data-t="${t}" title="${t}" aria-label="${t}テーマ"></div>`
  ).join("");

  return `
  <nav class="topbar" role="navigation" aria-label="メインナビゲーション">
    <a href="index.html" class="topbar-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      歴史タイムライン
    </a>
    <div class="topbar-nav">${navLinks}</div>
    <div class="topbar-right">
      <div class="theme-switcher" aria-label="テーマ切り替え">${themeDots}</div>
      <div id="topbar-user-area"></div>
    </div>
    <button class="btn-menu" aria-label="メニュー" aria-expanded="false">☰</button>
  </nav>
  <nav class="mobile-nav" aria-label="モバイルナビゲーション">
    ${pages.map(p => `<a href="${p.href}">${p.label}</a>`).join("")}
    <div id="mobile-user-area" style="margin-top:8px;"></div>
  </nav>`;
}

// ============================================================
//  フッター HTML
// ============================================================
export function renderFooter() {
  return `
  <footer class="footer">
    <div class="footer-links">
      <a href="terms.html">利用規約</a>
      <a href="privacy.html">プライバシーポリシー</a>
      <a href="contact.html">お問い合わせ</a>
    </div>
    <span>© 2026 歴史タイムライン</span>
  </footer>`;
}
