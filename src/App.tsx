import { useState } from 'react'
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, List, ListItem, ListItemText, Divider, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import './App.css'

interface Payment{
  id: number;
  payer: string;
  title: string;
  amount: number;
}

function App() {
  const [name1, setName1] = useState<string>('ユーザーA');
  const [name2, setName2] = useState<string>('ユーザーB');

  const[payments, setPayments] = useState<Payment[]>([]);
  const[inputPayer, setInputPayer] = useState<string>('');
  const[inputTitle, setInputTitle] = useState<string>('');
  const[inputAmount, setInputAmount] = useState<number>(0);

  const handleAddPayment = () => {
    if (!inputPayer || !inputTitle || inputAmount <= 0 || !name1 || !name2){
      alert("入力内容を確認してください");
      return;
    }

    const newPayment: Payment = {
      id: Date.now(),
      payer: inputPayer,
      title: inputTitle,
      amount: inputAmount,
    };

    setPayments([...payments, newPayment]);

    setInputTitle('');
    setInputAmount(0);

  }

  let total1 = 0;
  let total2 = 0;

  payments.forEach((p)=>{
    if (p.payer === name1){
      total1 += p.amount;
    } else if (p.payer === name2){
      total2 += p.amount;
    }
  })

  const totalAmount = total1 + total2;
  const average = totalAmount / 2;
  const diff = total1 - average;

  return (
    <Box sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
      <Typography 
        variant="h5" 
        component="h1" 
        sx={{ mt: 3, mb: 6, fontWeight: 'bold' }}
      >
        割り勘ツール
      </Typography>

      <Box sx={{ display:'flex', gap:2, mb:4 }}>
        <TextField
          label="1人目の名前"
          variant="standard"
          value={name1}
          onChange={(e) => setName1(e.target.value)}
          fullWidth
        />
        <TextField
          label="2人目の名前"
          variant="standard"
          value={name2}
          onChange={(e) => setName1(e.target.value)}
          fullWidth
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel>払った人</InputLabel>
          <Select
            value={inputPayer}
            label="払った人"
            onChange={(e) => setInputPayer(e.target.value)}
          >
            <MenuItem value={name1}>{name1}</MenuItem>
            <MenuItem value={name2}>{name2}</MenuItem>
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
          onChange={(e) => setInputAmount(Number(e.target.value))} 
          slotProps={{
            htmlInput: { min: 0 }
          }}
        />

        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddPayment}
        >
          追加する
        </Button>
      </Box>

      <Divider />

      <List>
        {payments.map((p) => (
          <ListItem key={p.id}>
            <ListItemText 
              primary={`${p.payer} さんが 「${p.title}」 に${p.amount.toLocaleString()}円 払いました`} 
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{mt:4, p:2, bgcollor:'#f0f7ff', borderRadius: 2  }}>
        <Typography variant="h6">精算結果</Typography>

        {diff > 0?(
          <Typography>
            {name2}→{name1}へ<strong>{diff.toLocaleString()}円渡してね</strong>
          </Typography>
        ) : diff < 0 ? (
          <Typography>
          {name1}から{name2}へ<strong>{Math.abs(diff).toLocaleString()}円渡してね</strong>
          </Typography>
        ) : (
          <Typography>ピッタリ</Typography>
        )
        }
      </Box>
      

    </Box>
  )
}

export default App