import { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const SetupPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [n1, setN1] = useState('ユーザーA');
  const [n2, setN2] = useState('ユーザーB');

  const handleStart = async() => {
    if (!title || !n1 || !n2) {
      alert("すべて入力してください！");
      return;
    }
    try {
      const newRoomRef = doc(collection(db, "rooms")); 
      const roomId = newRoomRef.id;

      const roomSettings = {
        title: title,
        name1: n1,
        name2: n2,
        createdAt: Date.now()
      };

      await setDoc(newRoomRef, roomSettings);

      navigate(`/room/${roomId}`);

    } catch (error) {
      console.error("部屋の作成に失敗しました:", error);
      alert("通信エラーが発生しました");
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          新規精算
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="イベント名" variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField label="1人目の名前" variant="outlined" value={n1} onChange={(e) => setN1(e.target.value)} fullWidth />
          <TextField label="2人目の名前" variant="outlined" value={n2} onChange={(e) => setN2(e.target.value)} fullWidth />
          <Button variant="contained" size="large" onClick={handleStart} sx={{ mt: 2 }}>
            精算をはじめる
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SetupPage;