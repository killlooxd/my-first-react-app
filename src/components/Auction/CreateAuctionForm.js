import React, { useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import itemsData from '../../data/items.json';

const AUCTIONS_COLLECTION = 'auctions';
const availableDurations = [1, 3, 6, 12, 24, 48];
const availableTraits = [
  'Attack Speed',
  'Bind Chance',
  'Bind Resistance',
  'Buff Duration',
  'Collison Chance',
  'Collision Resistance',
  'Construct Bonus Damage',
  'Cooldown Speed',
  'Critical Hit Chance',
  'Debuff Duration',
  'Demon Bonuse Damage',
  'Health Regen',
  'Heavy Attack Chance',
  'Hit Chance',
  'Humanoid Bonus Damage',
  'Magic Endurance',
  'Magic Evasion',
  'Mana Cost Efficiency',
  'Mana Regen',
  'Max Health',
  'Max Mana',
  'Max Stamina',
  'Melee Endurance',
  'Melee Evasion',
  'Movement Speed',
  'Petrification Chance',
  'Petrification Resistance',
  'Range',
  'Ranged Endurance',
  'Ranged Evasion',
  'Silence Chance',
  'Silence Resistance',
  'Skill Damage Boost',
  'Skill Damage Resistance',
  'Sleep Chance',
  'Sleep Resistance',
  'Stun Chance',
  'Stun Resistance',
  'Undead Bonus Damage',
  'Weaken Chance',
  'Weaken Resistance',
  'Wildkin Bonus Damage',
]; // Расширенный список трейтов

function CreateAuctionForm() {
  const [selectedItemName, setSelectedItemName] = useState('');
  const [name, setName] = useState('');
  const [startBid, setStartBid] = useState('');
  const [duration, setDuration] = useState('');
  const [trait, setTrait] = useState('');
  const [questlogUrl, setQuestlogUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleItemChange = (event) => {
    const itemName = event.target.value;
    setSelectedItemName(itemName);
    const selectedItem = itemsData.find((item) => item.name === itemName);
    if (selectedItem) {
      setName(selectedItem.name);
      setQuestlogUrl(selectedItem.questlogUrl || '');
    } else {
      setName('');
      setQuestlogUrl('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!selectedItemName || !startBid || !duration || !trait || !questlogUrl) {
      setErrorMessage('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    try {
      const endTime = new Date(
        Date.now() + parseInt(duration) * 60 * 60 * 1000
      ).toISOString();

      const auctionData = {
        name,
        startBid: parseInt(startBid),
        currentBid: null,
        endTime,
        trait,
        questlogUrl,
      };

      await addDoc(collection(db, AUCTIONS_COLLECTION), auctionData);
      resetForm();
      alert('Лот успешно выставлен на аукцион!');
    } catch (error) {
      console.error('Ошибка добавления лота в Firestore:', error);
      setErrorMessage('Не удалось выставить лот на аукцион.');
    }
  };

  const resetForm = () => {
    setSelectedItemName('');
    setName('');
    setStartBid('');
    setDuration('');
    setTrait('');
    setQuestlogUrl('');
  };

  return (
    <div>
      <h2>Выставить новый лот на аукцион</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='item'>Выберите лот:</label>
          <select
            id='item'
            value={selectedItemName}
            onChange={handleItemChange}
            required
          >
            <option value=''>-- Выберите предмет --</option>
            {itemsData.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor='name'>Название:</label>
          <input type='text' id='name' value={name} readOnly />
        </div>
        <div>
          <label htmlFor='startBid'>Начальная ставка:</label>
          <input
            type='number'
            id='startBid'
            value={startBid}
            onChange={(e) => setStartBid(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor='duration'>Время активности (в часах):</label>
          <select
            id='duration'
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          >
            <option value=''>-- Выберите время --</option>
            {availableDurations.map((hours) => (
              <option key={hours} value={hours}>
                {hours}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor='trait'>Trait:</label>
          <select
            id='trait'
            value={trait}
            onChange={(e) => setTrait(e.target.value)}
            required
          >
            <option value=''>-- Выберите Trait --</option>
            {availableTraits.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor='questlogUrl'>Questlog URL:</label>
          <input type='url' id='questlogUrl' value={questlogUrl} readOnly />
        </div>
        <button type='submit'>Выставить на аукцион</button>
      </form>
    </div>
  );
}

export default CreateAuctionForm;
