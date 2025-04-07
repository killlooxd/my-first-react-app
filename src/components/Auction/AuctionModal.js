import React, { useState, useEffect, useContext } from 'react';
import CountdownTimer from '../CountdownTimer';
import { db } from '../../firebaseConfig';
import {
  doc as firestoreDoc,
  collection,
  getDoc,
  runTransaction,
  deleteDoc,
} from 'firebase/firestore';
import itemsData from '../../data/items.json';
import { UserContext } from '../../contexts/UserContext';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600 },
  bgcolor: '#1e272e',
  color: '#f5f5f5',
  border: '1px solid #34495e',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  outline: 'none',
};

function AuctionModal({ open, onClose, auction, userId, itemInfo }) {
  // <---- Получаем проп itemInfo
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [bidError, setBidError] = useState('');
  const [userBalance, setUserBalance] = useState(null);
  const { user } = useContext(UserContext);
  const imageUrl = itemInfo?.imageUrl; // Получаем imageUrl из itemInfo
  const itemTier = itemInfo?.tier; // Получаем tier из itemInfo
  const questlogUrl = itemInfo?.questlogUrl; // Получаем questlogUrl из itemInfo

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userId) {
        const userDocRef = firestoreDoc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserBalance(userDocSnap.data().dkpBalance);
        } else {
          console.warn('Документ пользователя не найден:', userId);
          setUserBalance(0);
        }
      } else {
        console.warn('UserID не передан в модальное окно.');
        setUserBalance(null);
      }
    };

    fetchUserBalance();
  }, [userId]);

  const handleDelete = async () => {
    console.log('handleDelete function called for auction ID:', auction.id);
    if (
      window.confirm(`Вы уверены, что хотите удалить лот "${auction.name}"?`)
    ) {
      try {
        const auctionDocRef = firestoreDoc(db, 'auctions', auction.id);
        const auctionSnap = await getDoc(auctionDocRef);

        if (auctionSnap.exists()) {
          const auctionData = auctionSnap.data();
          const leadingBidderId = auctionData.leadingBidderId;
          const currentBid = auctionData.currentBid;

          if (leadingBidderId && currentBid > 0) {
            const userDocRef = firestoreDoc(db, 'users', leadingBidderId);
            await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userDocRef);
              if (userDoc.exists()) {
                const currentBalance = userDoc.data().dkpBalance;
                transaction.update(userDocRef, {
                  dkpBalance: currentBalance + currentBid,
                });
                console.log(
                  `Возвращено ${currentBid} ДКП пользователю ${leadingBidderId} за удаленный лот.`
                );
              } else {
                console.warn(`Не найден пользователь с ID: ${leadingBidderId}`);
              }
            });
          }
        }

        await deleteDoc(auctionDocRef);
        onClose();
      } catch (error) {
        console.error('Ошибка удаления лота:', error);
        alert('Не удалось удалить лот.');
      }
    }
  };

  const handleBidChange = (event) => setBidAmount(event.target.value);

  const handlePlaceBid = async (event) => {
    event.stopPropagation();
    if (isBidding) return;
    if (!userId) {
      setBidError('UserID отсутствует, невозможно сделать ставку.');
      return;
    }

    const bid = parseInt(bidAmount);

    if (isNaN(bid) || bid <= 0) {
      setBidError('Пожалуйста, введите корректную ставку.');
      return;
    }

    if (userBalance === null || bid > userBalance) {
      setBidError('Недостаточно ДКП для ставки.');
      return;
    }

    const currentBid = auction.currentBid || auction.startBid;
    if (bid <= currentBid) {
      setBidError(`Ваша ставка должна быть выше ${currentBid} ДКП.`);
      return;
    }

    setIsBidding(true);
    try {
      const auctionRef = firestoreDoc(db, 'auctions', auction.id);
      const bidsCollectionRef = collection(auctionRef, 'bids');
      const userDocRef = firestoreDoc(db, 'users', userId);

      await runTransaction(db, async (transaction) => {
        const auctionDoc = await transaction.get(auctionRef);
        if (!auctionDoc.exists()) {
          throw new Error('Документ аукциона не найден.');
        }
        const auctionData = auctionDoc.data();
        const previousLeadingBidderId = auctionData.leadingBidderId;
        const previousBid = auctionData.currentBid || auctionData.startBid;

        if (
          previousLeadingBidderId &&
          previousLeadingBidderId !== userId &&
          previousBid > 0
        ) {
          const previousBidderRef = firestoreDoc(
            db,
            'users',
            previousLeadingBidderId
          );
          const previousBidderDoc = await transaction.get(previousBidderRef);
          if (previousBidderDoc.exists()) {
            const previousBalance = previousBidderDoc.data().dkpBalance;
            transaction.update(previousBidderRef, {
              dkpBalance: previousBalance + previousBid,
            });
            console.log(
              `Возвращено ${previousBid} ДКП пользователю ${previousLeadingBidderId} (ставка перебита).`
            );
          } else {
            console.warn(
              `Не найден пользователь с ID: ${previousLeadingBidderId}`
            );
          }
        }

        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw new Error('Документ пользователя не найден.');
        }
        const currentBalance = userDoc.data().dkpBalance;
        if (bid > currentBalance) {
          throw new Error('Недостаточно ДКП для ставки.');
        }

        const newBidRef = firestoreDoc(bidsCollectionRef);
        transaction.set(newBidRef, {
          bidderId: userId,
          amount: bid,
          timestamp: new Date(),
        });
        transaction.update(userDocRef, { dkpBalance: currentBalance - bid });
        transaction.update(auctionRef, {
          currentBid: bid,
          leadingBidderId: userId,
        });

        setUserBalance(currentBalance - bid);
      });

      setBidAmount('');
      setBidError('');
      onClose();
    } catch (error) {
      console.error('Ошибка при размещении ставки:', error);
      setBidError(`Не удалось разместить ставку: ${error}`);
    } finally {
      setIsBidding(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby='auction-modal-title'
      aria-describedby='auction-modal-description'
    >
      <Box sx={style}>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, color: '#f5f5f5' }}
        >
          <CloseIcon />
        </IconButton>
        <Typography
          id='auction-modal-title'
          variant='h6'
          component='h2'
          mb={2}
          color='inherit'
        >
          {auction.name || 'Предмет'}
        </Typography>
        {itemTier && (
          <Typography variant='subtitle1' color='#81ecec' mb={1}>
            Tier: {itemTier}
          </Typography>
        )}
        {imageUrl && questlogUrl ? ( // <---- Оборачиваем изображение ссылкой, если есть questlogUrl
          <a
            href={questlogUrl}
            target='_blank'
            rel='noopener noreferrer'
            style={{
              display: 'block',
              maxWidth: '100%',
              height: 'auto',
              marginBottom: 2,
            }}
          >
            <img
              src={imageUrl}
              alt={auction.name}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </a>
        ) : imageUrl ? ( // <---- Отображаем изображение, если нет questlogUrl
          <img
            src={imageUrl}
            alt={auction.name}
            style={{ maxWidth: '100%', height: 'auto', marginBottom: 2 }}
          />
        ) : null}
        {auction.tier && (
          <Typography variant='body2' color='#800080' mb={1}>
            Tier (из аукциона): {auction.tier}
          </Typography>
        )}

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle2' color='#ffeaa7'>
              Начальная ставка:{' '}
              <Typography variant='body1' component='span' color='inherit'>
                {auction.startBid} ДКП
              </Typography>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle2' color='#ffeaa7'>
              Текущая ставка:{' '}
              <Typography variant='body1' component='span' color='inherit'>
                {auction.currentBid || auction.startBid} ДКП
              </Typography>
            </Typography>
          </Grid>
          {auction.leadingBidderId && (
            <Grid item xs={12} sm={6}>
              <Typography variant='subtitle2' color='#ffeaa7'>
                Лидер:{' '}
                <Typography variant='body1' component='span' color='inherit'>
                  {auction.leadingBidderId}
                </Typography>
              </Typography>
            </Grid>
          )}
          {userBalance !== null && (
            <Grid item xs={12} sm={6}>
              <Typography variant='subtitle2' color='#ffeaa7'>
                Ваш баланс:{' '}
                <Typography variant='body1' component='span' color='inherit'>
                  {userBalance} ДКП
                </Typography>
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant='body2' color='#ced6e0'>
              Осталось времени: <CountdownTimer endTime={auction.endTime} />
            </Typography>
          </Grid>
          {auction.trait && (
            <Grid item xs={12}>
              <Typography variant='body2' color='#ced6e0' mb={2}>
                Характеристика: {auction.trait}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TextField
            label='Ваша ставка'
            type='number'
            value={bidAmount}
            onChange={handleBidChange}
            variant='outlined'
            size='small'
            fullWidth
            InputProps={{ style: { color: '#f5f5f5' } }}
            InputLabelProps={{ style: { color: '#f5f5f5' } }}
          />
          <Button
            variant='contained'
            onClick={handlePlaceBid}
            disabled={isBidding || userBalance === null || !userId}
            sx={{
              color: '#f5f5f5',
              bgcolor: '#00b894',
              '&:hover': { bgcolor: '#00a884' },
            }}
          >
            {isBidding ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              'Сделать ставку'
            )}
          </Button>
        </Box>
        {bidError && (
          <Typography color='#e74c3c' variant='caption'>
            {bidError}
          </Typography>
        )}

        {user?.role === 'admin' && (
          <Button
            variant='outlined'
            color='error'
            onClick={handleDelete}
            fullWidth
            sx={{
              mt: 2,
              color: '#e74c3c',
              borderColor: '#e74c3c',
              '&:hover': { borderColor: '#c0392b' },
            }}
          >
            Удалить лот
          </Button>
        )}
      </Box>
    </Modal>
  );
}

export default AuctionModal;
