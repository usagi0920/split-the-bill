import { useEffect, useState } from 'react';
import { TextField, Button, Box, Typography, Container, Paper } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom'; 
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const SetupPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>(); 
  const [title, setTitle] = useState('');
  const [n1, setN1] = useState('ユーザーA');
  const [n2, setN2] = useState('ユーザーB');

  useEffect(() => {
    if (!roomId) return;

    const fetchRoomSettings = async () => {
      try {
        const roomDocRef = doc(db, "rooms", roomId);
        const roomDocSnap = await getDoc(roomDocRef);

        if (roomDocSnap.exists()) {
          const data = roomDocSnap.data();
          setTitle(data.title || '');
          setN1(data.name1 || 'ユーザーA');
          setN2(data.name2 || 'ユーザーB');
        }
      } catch (error) {
        console.error("部屋情報の取得に失敗しました:", error);
      }
    };

    fetchRoomSettings();
  }, [roomId]);

  const handleStart = async() => {
    if (!title || !n1 || !n2) {
      alert("すべて入力してください！");
      return;
    }
    try {
      // 編集の場合
      if (roomId) {
        const roomDocRef = doc(db, "rooms", roomId);
        // 新しく作らず、今の部屋のデータを上書きします
        await updateDoc(roomDocRef, {
          title: title,
          name1: n1,
          name2: n2,
        });

        // 保存できたら、元の割り勘画面に戻る
        navigate(`/room/${roomId}`);

      } else {
        // ➕ URLに roomId がない場合（新規作成モード）
        const newRoomRef = doc(collection(db, "rooms")); 
        const newRoomId = newRoomRef.id;

        const roomSettings = {
          title: title,
          name1: n1,
          name2: n2,
          createdAt: Date.now()
        };

        await setDoc(newRoomRef, roomSettings);
        navigate(`/room/${newRoomId}`);
      }

    } catch (error) {
      console.error("処理に失敗しました:", error);
      alert("通信エラーが発生しました");
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          {roomId ? '精算内容の変更' : '新規精算'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="イベント名" variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField label="1人目の名前" variant="outlined" value={n1} onChange={(e) => setN1(e.target.value)} fullWidth />
          <TextField label="2人目の名前" variant="outlined" value={n2} onChange={(e) => setN2(e.target.value)} fullWidth />
          <Button variant="contained" size="large" onClick={handleStart} sx={{ mt: 2 }}>
            {roomId ? '変更を保存する' : '精算をはじめる'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SetupPage;