import { useState, useEffect } from 'react'
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, List, ListItem, ListItemText, Divider, Typography, Tabs, Tab, Dialog, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './App.css'
import { useNavigate } from 'react-router-dom';

interface Payment{
  id: number;
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogAmount, setDialogAmount] = useState<number>(0);
  const [dialogExpense1, setDialogExpense1] = useState<number>(0);
  const [dialogExpense2, setDialogExpense2] = useState<number>(0);


  useEffect(() => {
    localStorage.setItem('split-bill-data', JSON.stringify(payments));
  }, [payments]);

  const handleAddPayment = () => {
    if (!inputPayer || !inputTitle || inputAmount <= 0 ){
      alert("入力内容を確認してください");
      return;
    }

    const newPayment: Payment = {
      id: Date.now(),
      payerId: inputPayer as 'user1' | 'user2',
      title: inputTitle,
      amount: inputAmount,
      user1expense: inputAmount / 2,
      user2expense: inputAmount / 2,
    };

    setPayments([...payments, newPayment]);

    setInputTitle('');
    setInputAmount(0);

  }

  const handleAddDetailedPayment = () => {

    if (!inputPayer || !inputTitle || (inputExpense1 <= 0 && inputExpense2 <= 0) ){
      alert("入力内容を確認してください");
      return;
    }
    const newPayment: Payment = {
      id: Date.now(),
      payerId: inputPayer as 'user1' | 'user2',
      title: inputTitle,
      amount: inputExpense1 + inputExpense2,
      user1expense: inputExpense1,
      user2expense: inputExpense2,
    };
    setPayments([...payments, newPayment]);

    setInputTitle('');
    setInputExpense1(0);
    setInputExpense2(0);

  }

  const handleDeletePayment = (id: number) => {
    // paymentsのリストの中から、指定されたidと一致しないものを残す
    const result = confirm("本当に削除しますか？");

    if(!result) return;

    const newPayments = payments.filter((p)=> p.id !== id);

    // 新しいリストでstateを更新
    setPayments(newPayments);
  }

  const handleEditPayment =  (payment: Payment) => {
    // 編集データのIDをstateに入れる
    setEditingId(payment.id);

    // 2
    setInputPayer(payment.payerId);
    // setInputTitle(payment.title);
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

  const handleSaveEdit = () => {
    if (editingId === null) return;

    const updatePayment:Payment = {
      id: editingId,
      payerId: inputPayer as 'user1' | 'user2',
      title: dialogTitle,
      amount: tabValue === 0 ? dialogAmount : dialogExpense1 + dialogExpense2,
      user1expense: tabValue === 0 ? dialogAmount/2 : dialogExpense1,
      user2expense: tabValue === 0 ? dialogAmount/2 : dialogExpense2
    }

    const newPayments = payments.map((p)=>{
      if (p.id === editingId){
        return updatePayment;
      }
      return p;
    })

    setPayments(newPayments);
    setIsDialogOpen(false);
    setEditingId(null);
    setDialogTitle('');
    setDialogAmount(0);
    setDialogExpense1(0);
    setDialogExpense2(0);
  }

  let total1 = 0;
  let total2 = 0;
  // 詳しい割り勘用
  let expenseTotal1 = 0;
  let expenseTotal2 = 0;

  payments.forEach((p)=>{
    if (p.payerId === 'user1'){
      total1 += p.amount;
    } else if (p.payerId === 'user2'){ // ここはelseで分岐書かなくても良い
      total2 += p.amount;
    }
    expenseTotal1 += p.user1expense;
    expenseTotal2 += p.user2expense;
  })

  const totalAmount = total1 + total2;
  // 払った額-本来個人が払う金額
  const user1Balance = total1 - expenseTotal1;
  const user2Balance = total2 - expenseTotal2;

  useEffect(() => {
    localStorage.setItem('split-bill-data', JSON.stringify(payments));
  }, [payments]);

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

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>精算を編集する</DialogTitle>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ※{tabValue === 0 ? 'かんたん割り勘' : '詳しく割り勘'}モードで編集中
          </Typography>

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