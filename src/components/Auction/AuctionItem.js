import React from 'react';
import itemsData from '../../data/items.json';
import '../AuctionItem.css';

function AuctionItem({ auction, isCardView }) {
  const itemInfo = itemsData.find((item) => item.name === auction.name);
  const imageUrl = itemInfo ? itemInfo.imageUrl : null;
  const questlogUrl = itemInfo ? itemInfo.questlogUrl : null;

  return (
    <div className={`auction-item ${isCardView ? 'card-view' : ''}`}>
      <div className='image-container' data-ql-link={questlogUrl}>
        {imageUrl && <img src={imageUrl} alt={auction.name} />}
      </div>
      <div className='item-details'>
        <h4>{auction.name}</h4>
        {auction.currentBid && <p>Текущая ставка: {auction.currentBid} ДКП</p>}
        {!auction.currentBid && <p>Начальная ставка: {auction.startBid} ДКП</p>}
        {/* Другая информация о лоте */}
      </div>
    </div>
  );
}

export default AuctionItem;
