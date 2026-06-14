import { useState, useEffect } from 'react'
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, List, ListItem, ListItemText, Divider, Typography, Tabs, Tab, Dialog, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './App.css'
import { useNavigate } from 'react-router-dom';
// Firebase
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';


interface Payment{
  id: string;
  payerId: 'user1' | 'user2';
  title: string;
  amount: number;
  user1expense: number;
  user2expense: number;
}

const MainPage = () => {

  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState<number>(0);

  const settings = JSON.parse(localStorage.getItem('WARIKAN_SETTINGS') || '{"title":"旅行","name1":"ユーザーA","name2":"ユーザーB"}');
  const { title, name1, name2 } = settings;

  const[payments, setPayments] = useState<Payment[]>(() => {
    const savedData = localStorage.getItem('split-bill-data');
    if (savedData){
      return JSON.parse(savedData);
    }
    return[];
  });
  const[inputPayer, setInputPayer] = useState<string>('user1');
  const[inputTitle, setInputTitle] = useState<string>('');
  const[inputAmount, setInputAmount] = useState<number>(0);
  const[inputExpense1, setInputExpense1] = useState<number>(0);
  const[inputExpense2, setInputExpense2] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogAmount, setDialogAmount] = useState<number>(0);
  const [dialogExpense1, setDialogExpense1] = useState<number>(0);
  const [dialogExpense2, setDialogExpense2] = useState<number>(0);
  const [dialogPayer, setDialogPayer] = useState<string>('user1');

  useEffect(() => {
    const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      
      const firebasePayments = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          payerId: data.payerId,
          title: data.title,
          amount: data.amount,
          user1expense: data.user1expense,
          user2expense: data.user2expense,
        } as Payment;
      });

      setPayments(firebasePayments);
    });

    return () => unsubscribe();
  }, []);

  const handleAddPayment = async() => {
    if (inputTitle.trim() === '') {
      alert("「何に？」を入力してください");
      return;
    }
    if (inputAmount <= 0) {
      alert("金額には0より大きい数値を入力してください");
      return;
    }

    const newPaymentData = {
      payerId: inputPayer as 'user1' | 'user2',
      title: inputTitle,
      amount: inputAmount,
      user1expense: inputAmount / 2,
      user2expense: inputAmount / 2,
      createdAt: Date.now(),
    };

    try {
      await addDoc(collection(db, "payments"), newPaymentData);

      setInputTitle('');
      setInputAmount(0);
      
    } catch (error) {
      console.error("Firebaseへの保存に失敗しました:", error);
      alert("通信エラーが発生しました");
    }


  }

  const handleAddDetailedPayment = async () => {

    if (inputTitle.trim() === '') {
      alert("「何に？」を入力してください");
      return;
    }
    if (inputExpense1 + inputExpense2 <= 0) {
      alert("かかったお金を入力してください");
      return;
    }

    const newPaymentData = {
      payerId: inputPayer as 'user1' | 'user2',
      title: inputTitle,
      amount: inputExpense1 + inputExpense2,
      user1expense: inputExpense1,
      user2expense: inputExpense2,
      createdAt: Date.now(),
    };

    try {
      await addDoc(collection(db, "payments"), newPaymentData);

      // 保存が成功したら、入力欄をリセット
      setInputTitle('');
      setInputExpense1(0);
      setInputExpense2(0);

    } catch (error) {
      console.error("Firebaseへの保存に失敗しました:", error);
      alert("通信エラーが発生しました");
    }

  }

  const handleDeletePayment = async (id: string) => {
    // paymentsのリストの中から、指定されたidと一致しないものを残す
    const result = confirm("本当に削除しますか？");
    if(!result) return;

    try {
      await deleteDoc(doc(db, "payments", id));

    } catch (error) {
      console.error("削除に失敗しました:", error);
      alert("通信エラーが発生しました");
    }
  }

  const handleAllDeletePayment = async() =>{
    const result = confirm("本当に全ての精算履歴を削除しますか？");
    if (!result) return;

    try {
      const batch = writeBatch(db);

      payments.forEach((p) => {
        const docRef = doc(db, "payments", p.id);
        batch.delete(docRef);
      });

      await batch.commit();

      navigate('/');

    } catch (error) {
      console.error("全削除に失敗しました:", error);
      alert("通信エラーが発生しました");
    }

  }

  const handleEditPayment =  (payment: Payment) => {
    setEditingId(payment.id);

    setDialogPayer(payment.payerId);
    setDialogTitle(payment.title);

    if(payment.user1expense === payment.amount / 2){
      setTabValue(0);
      setDialogAmount(payment.amount);
    } else {
      setTabValue(1);
      setDialogExpense1(payment.user1expense);
      setDialogExpense2(payment.user2expense);
    }
    setIsDialogOpen(true);
  }

  const handleSaveEdit = async() => {
    if (editingId === null) return;

    if (dialogTitle === '') {
      alert("「何に？」を入力してください");
      return; 
    }

    if (tabValue === 0){
      if (dialogAmount <= 0) {
        alert("金額を正しく入力してください");
        return;
      }
    } else {
      if (dialogExpense1 <= 0 && dialogExpense2 <= 0) {
        alert("負担額を入力してください");
        return;
      }
    }

    const updatePayment:Payment = {
      id: editingId,
      payerId: dialogPayer as 'user1' | 'user2',
      title: dialogTitle,
      amount: tabValue === 0 ? dialogAmount : dialogExpense1 + dialogExpense2,
      user1expense: tabValue === 0 ? dialogAmount/2 : dialogExpense1,
      user2expense: tabValue === 0 ? dialogAmount/2 : dialogExpense2
    }

    const updatePaymentData = {
      payerId: dialogPayer as 'user1' | 'user2',
      title: dialogTitle,
      amount: tabValue === 0 ? dialogAmount : dialogExpense1 + dialogExpense2,
      user1expense: tabValue === 0 ? dialogAmount/2 : dialogExpense1,
      user2expense: tabValue === 0 ? dialogAmount/2 : dialogExpense2
    }

    try {
      await updateDoc(doc(db, "payments", editingId), updatePaymentData);

      setIsDialogOpen(false);
      setEditingId(null);
      setDialogTitle('');
      setDialogAmount(0);
      setDialogExpense1(0);
      setDialogExpense2(0);
      setDialogPayer('user1');

    } catch (error) {
      console.error("上書き保存に失敗しました:", error);
      alert("通信エラーが発生しました");
    }
  }

  let total1 = 0;
  let total2 = 0;
  // 詳しい割り勘用
  let expenseTotal1 = 0;
  let expenseTotal2 = 0;

  payments.forEach((p)=>{
    if (p.payerId === 'user1'){
      total1 += p.amount;
    } else if (p.payerId === 'user2'){
      total2 += p.amount;
    }
    expenseTotal1 += p.user1expense;
    expenseTotal2 += p.user2expense;
  })

  const totalAmount = total1 + total2;
  // 払った額-本来個人が払う金額
  const user1Balance = total1 - expenseTotal1;
  const user2Balance = total2 - expenseTotal2;

  return (
    <Box sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
      <Typography 
        variant="h5" 
        component="h1" 
        sx={{ mt: 3, mb: 6, fontWeight: 'bold' }}
      >
        {title}の精算
      </Typography>

      <Tabs
        value = {tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label= "かんたん割り勘" />
        <Tab label= "詳しく割り勘" />
      </Tabs>

      {tabValue === 0 && (

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel>払った人</InputLabel>
          <Select
            value={inputPayer}
            label="払った人"
            onChange={(e) => setInputPayer(e.target.value)}
          >
            <MenuItem value="user1">{name1}</MenuItem>
            <MenuItem value="user2">{name2}</MenuItem>
          </Select>
        </FormControl>

        <TextField 
          label="何に？" 
          variant="outlined" 
          value={inputTitle} 
          onChange={(e) => setInputTitle(e.target.value)} 
        />

        <TextField 
          label="いくら？" 
          type="number" 
          variant="outlined" 
          value={inputAmount === 0 ? '' : inputAmount} 
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val < 0) return;
            setInputAmount(val);
          }}
          slotProps={{
            htmlInput: { min: 0 }
          }}
        />

        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddPayment}
          sx={{ borderRadius: '999px' }} 
        >
          追加する
        </Button>
      </Box>

      )}
      {tabValue === 1 && (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          <FormControl fullWidth>
            <InputLabel>払った人</InputLabel>
            <Select
              value={inputPayer}
              label="払った人"
              onChange={(e) => setInputPayer(e.target.value)}
            >
              <MenuItem value="user1">{name1}</MenuItem>
              <MenuItem value="user2">{name2}</MenuItem>
            </Select>
          </FormControl>

          <TextField 
            label="何に？" 
            variant="outlined" 
            value={inputTitle} 
            onChange={(e) => setInputTitle(e.target.value)} 
          />

          <TextField 
            label={`${name1}のかかったお金`} 
            type="number" 
            variant="outlined" 
            fullWidth
            value={inputExpense1 === 0 ? '' : inputExpense1} 
            onChange={(e) => setInputExpense1(Number(e.target.value))} 
          />
          <TextField 
            label={`${name2}のかかったお金`} 
            type="number" 
            variant="outlined" 
            fullWidth
            value={inputExpense2 === 0 ? '' : inputExpense2} 
            onChange={(e) => setInputExpense2(Number(e.target.value))} 
          />
          <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold', textAlign: 'right' }}>
            支払総額：{(inputExpense1 + inputExpense2).toLocaleString()} 円
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddDetailedPayment}
            sx={{ borderRadius: '999px' }} 
          >
            追加する
          </Button>
        </Box>
      )}

      <Divider />

      <List>
        {payments.map((p) => (
          <ListItem
            key={p.id}
            secondaryAction={ // リストの右端にボタンを置く設定
              <Box>
                <IconButton edge="end" aria-label="delete" onClick={() => handleEditPayment(p)}>
                  <EditIcon />
                </IconButton>

                <IconButton edge="end" aria-label="delete" onClick={() => handleDeletePayment(p.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText 
              primary={`${p.payerId === 'user1' ? name1 : name2} が 「${p.title}」 に${p.amount.toLocaleString()}円 払った`} 
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{mt:4, p:2, bgcolor:'#f0f7ff', borderRadius: 4  }}>
        <Typography variant="h6">合計金額</Typography>

        
          <Typography>合計{totalAmount.toLocaleString()}円</Typography>
            <Typography>払った内訳：{name1} さん{total1.toLocaleString()}円、{name2} さん {total2.toLocaleString()}円</Typography>
            <Typography>かかった内訳：{name1} さん{expenseTotal1.toLocaleString()}円、{name2} さん {expenseTotal2.toLocaleString()}円</Typography>
      </Box>

      <Box sx={{mt:4, p:2, bgcolor:'#f0f7ff', borderRadius: 4  }}>
        <Typography variant="h6">精算結果</Typography>

        {user1Balance > 0 ? (
          // user1が払いすぎている場合 ➔ user2がuser1に渡す
          <Typography>
            {name2} が {name1} へ <strong>{user1Balance.toLocaleString()} 円渡す</strong>
          </Typography>
        ) : user1Balance < 0 ? (
          // user1が足りない（＝user2が払いすぎている）場合 ➔ user1がuser2に渡す
          <Typography>
            {name1} が {name2} へ <strong>{Math.abs(user2Balance).toLocaleString()} 円渡す</strong>
          </Typography>
        ) : (
          <Typography>ピッタリです！</Typography>
        )}
      </Box>

      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2, textAlign: 'left' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span>名前・イベント名を変更する</span>
          <Typography variant="caption" component="span">※ここまでの精算は保持されます</Typography>
        </Box>
      </Button>

      {payments.length > 0 && (
        <Button 
          variant="outlined" 
          color="error" 
          fullWidth
          onClick={handleAllDeletePayment}
          sx={{ mt: 1, mb: 4, borderRadius: '999px' }}
          
        >
          すべての履歴をリセットする
        </Button>
      )}

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>精算を編集する</DialogTitle>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ※{tabValue === 0 ? 'かんたん割り勘' : '詳しく割り勘'}モードで編集中
          </Typography>

          <FormControl fullWidth>
            <InputLabel>払った人</InputLabel>
            <Select
              value={dialogPayer}
              label="払った人"
              onChange={(e) => setDialogPayer(e.target.value)}
            >
              <MenuItem value="user1">{name1}</MenuItem>
              <MenuItem value="user2">{name2}</MenuItem>
            </Select>
          </FormControl>

          <TextField 
            label="何に？" 
            fullWidth 
            value={dialogTitle} 
            onChange={(e) => setDialogTitle(e.target.value)} 
          />

          {tabValue === 0 ? (
            <TextField 
              label="金額" 
              type="number" 
              fullWidth 
              value={dialogAmount === 0 ? '' : dialogAmount} 
              onChange={(e) => setDialogAmount(Number(e.target.value))} 
            />
          ) : (
            <>
              <TextField 
                label={`${name1}の負担`} 
                type="number" 
                fullWidth 
                value={dialogExpense1 === 0 ? '' : dialogExpense1} 
                onChange={(e) => setDialogExpense1(Number(e.target.value))} 
              />
              <TextField 
                label={`${name2}の負担`} 
                type="number" 
                fullWidth 
                value={dialogExpense2 === 0 ? '' : dialogExpense2} 
                onChange={(e) => setDialogExpense2(Number(e.target.value))} 
              />
            </>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="contained" fullWidth onClick={handleSaveEdit} sx={{ borderRadius: '999px' }} >
              上書き保存
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setIsDialogOpen(false);
                setEditingId(null);
                setDialogTitle('');
                setDialogAmount(0);
                setDialogExpense1(0);
                setDialogExpense2(0);
                setDialogPayer('user1');
              }}
              sx={{ borderRadius: '999px' }} 
              >
              キャンセル
            </Button>
        </Box>
        </Box>
      </Dialog>
      

    </Box>
  )
}

export default MainPage;