import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import SetupPage from './SetupPage';
import MainPage from './MainPage';

function App() {
  return (
      <Routes>
        {/* 最初に表示されるページ */}
        <Route path="/" element={<SetupPage />} />
        {/* 精算を行うページ */}
        <Route path="/room/:roomId" element={<MainPage />} />
      </Routes>
  );
}

export default App;
