import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

const AddUserForm = () => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

  const handleGeneratePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8);
    setPassword(newPassword);
    setGeneratedPassword(newPassword);
    setShowGeneratedPassword(true); // Показываем сгенерированный пароль
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!nickname || !password) {
      setMessage('Пожалуйста, введите никнейм и сгенерируйте пароль.');
      return;
    }

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const usersCollectionRef = collection(db, 'users');
      const userDocRef = doc(usersCollectionRef, nickname);

      await setDoc(userDocRef, {
        nickname: nickname,
        password: hashedPassword,
        role: 'user',
        dkpBalance: 0,
      });

      setMessage(`Пользователь "${nickname}" успешно добавлен.`);
      setNickname('');
      setPassword('');
      setGeneratedPassword('');
      setShowGeneratedPassword(false); // Скрываем после добавления (опционально)
    } catch (error) {
      console.error('Ошибка при добавлении пользователя:', error);
      setMessage(`Ошибка: ${error.message}`);
    }
  };

  return (
    <div>
      <h3>Добавить нового пользователя</h3>
      <form onSubmit={handleAddUser}>
        <div>
          <label htmlFor='nickname'>Никнейм:</label>
          <input
            type='text'
            id='nickname'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor='password'>Пароль:</label>
          <input
            type='text' // Изменили type на "text", чтобы был виден
            id='password'
            value={generatedPassword} // Используем generatedPassword для отображения
            readOnly
          />
          <button type='button' onClick={handleGeneratePassword}>
            Сгенерировать пароль
          </button>
        </div>
        <button type='submit'>Добавить пользователя</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AddUserForm;
