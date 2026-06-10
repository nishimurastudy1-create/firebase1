// ============================================================
//  auth.js — 認証処理
// ============================================================

import {
  auth, toast
} from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  db
} from "./firebase.js";

import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ============================================================
//  現在のユーザーを取得（Promise）
// ============================================================
export function getCurrentUser() {
  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    });
  });
}

// ============================================================
//  Firestoreにユーザードキュメントを作成（初回ログイン時）
// ============================================================
async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName:      user.displayName || "匿名ユーザー",
      email:            user.email,
      joinedRanking:    true,
      showTime:         true,
      profilePublic:    false,
      totalScore:       0,
      totalCorrect:     0,
      totalAnswered:    0,
      createdAt:        serverTimestamp(),
    });
  }
}

// ============================================================
//  Googleログイン
// ============================================================
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await ensureUserDoc(result.user);
  return result.user;
}

// ============================================================
//  メール＋パスワードログイン
// ============================================================
export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// ============================================================
//  新規登録（メール）
// ============================================================
export async function registerWithEmail(email, password, displayName) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await ensureUserDoc(result.user);
  return result.user;
}

// ============================================================
//  パスワードリセットメール
// ============================================================
export async function sendResetEmail(email) {
  await sendPasswordResetEmail(auth, email);
}

// ============================================================
//  ログアウト
// ============================================================
export async function logout() {
  await signOut(auth);
  toast("ログアウトしました");
  window.location.href = "index.html";
}

// ============================================================
//  トップバーのユーザーエリアを更新
// ============================================================
export function initAuthUI() {
  onAuthStateChanged(auth, user => {
    const area       = document.getElementById("topbar-user-area");
    const mobileArea = document.getElementById("mobile-user-area");
    if (!area) return;

    if (user) {
      const name = user.displayName || user.email;
      const html = `
        <div style="position:relative">
          <button class="btn-user" id="user-menu-btn" aria-haspopup="true" aria-expanded="false">
            <span style="font-size:16px">👤</span>
            <span>${name}</span>
          </button>
          <div id="user-dropdown" style="display:none;position:absolute;right:0;top:calc(100%+6px);background:var(--c-surface);border:1px solid var(--c-border-lt);border-radius:var(--r-lg);box-shadow:var(--shadow-md);min-width:160px;overflow:hidden;z-index:300">
            <a href="account.html" style="display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:13px;color:var(--c-text);text-decoration:none;">⚙️ アカウント設定</a>
            <button id="logout-btn" style="display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:13px;color:#a32d2d;background:none;border:none;width:100%;cursor:pointer;border-top:1px solid var(--c-border-lt)">🚪 ログアウト</button>
          </div>
        </div>`;
      area.innerHTML = html;
      if (mobileArea) mobileArea.innerHTML = `<a href="account.html">⚙️ アカウント設定</a>`;

      document.getElementById("user-menu-btn").addEventListener("click", () => {
        const dd = document.getElementById("user-dropdown");
        dd.style.display = dd.style.display === "none" ? "block" : "none";
      });
      document.addEventListener("click", e => {
        if (!e.target.closest("#user-menu-btn")) {
          const dd = document.getElementById("user-dropdown");
          if (dd) dd.style.display = "none";
        }
      });
      document.getElementById("logout-btn").addEventListener("click", logout);
    } else {
      area.innerHTML = `<a href="login.html" class="btn-user">ログイン</a>`;
      if (mobileArea) mobileArea.innerHTML = `<a href="login.html">ログイン</a>`;
    }
  });
}

// ============================================================
//  エラーコードを日本語に変換
// ============================================================
export function authErrorMessage(code) {
  const map = {
    "auth/user-not-found":       "メールアドレスが登録されていません",
    "auth/wrong-password":       "パスワードが正しくありません",
    "auth/invalid-credential":   "メールアドレスまたはパスワードが正しくありません",
    "auth/email-already-in-use": "このメールアドレスはすでに使用されています",
    "auth/weak-password":        "パスワードは6文字以上で設定してください",
    "auth/invalid-email":        "メールアドレスの形式が正しくありません",
    "auth/popup-closed-by-user": "ログインがキャンセルされました",
    "auth/too-many-requests":    "試行回数が多すぎます。しばらく後に再試行してください",
  };
  return map[code] || "エラーが発生しました。もう一度お試しください";
}
