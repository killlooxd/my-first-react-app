import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import AuctionList from './AuctionList';
import CreateAuctionForm from './CreateAuctionForm';
import { UserContext } from '../../contexts/UserContext'; // Импортируем UserContext

function Auction() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext); // Получаем объект user из контекста

  useEffect(() => {
    const auctionsRef = collection(db, 'auctions');

    const unsubscribe = onSnapshot(
      auctionsRef,
      (snapshot) => {
        const auctionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAuctions(auctionsData);
        setLoading(false);
      },
      (err) => {
        console.error('Ошибка загрузки аукционов:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Загрузка аукционов...</p>;
  }

  if (error) {
    return <p>Ошибка загрузки аукционов: {error}</p>;
  }

  return (
    <div>
      <h2>Аукцион</h2>
      {user && user.role === 'admin' && <CreateAuctionForm />}{' '}
      {/* Условное отображение формы */}
      <AuctionList auctions={auctions} />
    </div>
  );
}

export default Auction;
