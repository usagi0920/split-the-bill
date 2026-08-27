import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdgGYyzuG0R0uYjdZbBnOrsiF7--XgTxA",
  authDomain: "split-bill-cloud.firebaseapp.com",
  projectId: "split-bill-cloud",
  storageBucket: "split-bill-cloud.firebasestorage.app",
  messagingSenderId: "437969027982",
  appId: "1:437969027982:web:e743e0a74a5fd7162c5adf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// アプリ起動時に必ず1回実行して認証を確立する関数
export const initAuth = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        console.log("【成功】ログイン済みです。ユーザーID:", user.uid);
        resolve(user);
        unsubscribe();
      } else {
        console.log("未ログインのため、匿名サインインを開始します...");
        signInAnonymously(auth)
          .then((result) => {
            console.log("【成功】匿名サインイン完了！ ユーザーID:", result.user.uid);
            resolve(result.user);
            unsubscribe();
          })
          .catch((error: unknown) => {
            console.error("【失敗】匿名サインインエラー:", error);
            reject(error);
          });
      }
    });
  });
};