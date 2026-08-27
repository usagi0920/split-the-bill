import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SetupPage from './SetupPage';
import MainPage from './MainPage';
import { auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';

function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // アプリが開いた瞬間に、直接「匿名ログイン」を叩き込む！
    // （すでにログイン済みの場合は一瞬で終わります）
    signInAnonymously(auth)
      .then(() => {
        setIsAuthReady(true); // ログイン完了したら初めて画面を出す
      })
      .catch((error) => {
        console.error("認証エラー:", error);
        alert("認証に失敗しました。");
      });
  }, []);

  // ログイン処理が終わるまでは「接続中...」でブロックする
  if (!isAuthReady) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>接続中...</div>;
  }

  // ログイン完了後、初めていつもの画面を表示
  return (
      <Routes>
        <Route path="/" element={<SetupPage />} />
        <Route path="/edit/:roomId" element={<SetupPage />} />
        <Route path="/room/:roomId" element={<MainPage />} />
      </Routes>
  );
}

export default App;