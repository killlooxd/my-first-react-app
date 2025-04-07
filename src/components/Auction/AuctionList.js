import React, { useState, useContext } from 'react';
import AuctionItem from './AuctionItem';
import AuctionModal from './AuctionModal';
import { UserContext } from '../../contexts/UserContext';
import itemsData from '../../data/items.json'; // <---- Импортируем itemsData

function AuctionList({ auctions }) {
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItemInfo, setSelectedItemInfo] = useState(null); // <---- Добавляем состояние для информации о предмете
  const { user } = useContext(UserContext);

  const handleOpenModal = (auction) => {
    setSelectedAuction(auction);
    const item = itemsData.find((item) => item.name === auction.name); // <---- Находим информацию о предмете
    setSelectedItemInfo(item); // <---- Устанавливаем информацию о предмете
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedAuction(null);
    setSelectedItemInfo(null); // <---- Сбрасываем информацию о предмете при закрытии
    setOpenModal(false);
  };

  return (
    <div className='auction-list-container'>
      <h3>Текущие аукционы:</h3>
      {auctions.length === 0 ? (
        <p>Нет активных аукционов.</p>
      ) : (
        auctions.map((auction) => (
          <div
            key={auction.id}
            className='auction-card'
            onClick={() => handleOpenModal(auction)}
          >
            <AuctionItem auction={auction} isCardView={true} />
          </div>
        ))
      )}

      {selectedAuction &&
        selectedItemInfo && ( // <---- Рендерим модальное окно только если есть информация о предмете
          <AuctionModal
            open={openModal}
            onClose={handleCloseModal}
            auction={selectedAuction}
            userId={user?.uid}
            itemInfo={selectedItemInfo} // <---- Передаем информацию о предмете в модальное окно
          />
        )}
    </div>
  );
}

export default AuctionList;
