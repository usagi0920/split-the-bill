import { initializeApp } from "firebase/app";
// 👇 データベース（Firestore）を使うための機能を道具箱から追加でインポートします
import { getFirestore } from "firebase/firestore";

// Googleから発行された、あなた専用の接続鍵（アドレス）
const firebaseConfig = {
  apiKey: "AIzaSyBdgGYyzuG0R0uYjdZbBnOrsiF7--XgTxA",
  authDomain: "split-bill-cloud.firebaseapp.com",
  projectId: "split-bill-cloud",
  storageBucket: "split-bill-cloud.firebasestorage.app",
  messagingSenderId: "437969027982",
  appId: "1:437969027982:web:e743e0a74a5fd7162c5adf"
};

// 1. Firebase全体を初期化（起動）する
const app = initializeApp(firebaseConfig);

// 2. このアプリ専用のデータベース（Firestore）の接続窓口を開く
export const db = getFirestore(app);