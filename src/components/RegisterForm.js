import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

const RegisterForm = ({ availableClasses }) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log('RegisterForm: Начало handleRegister');

    if (!nickname || !password || !selectedClass) {
      console.log('RegisterForm: Ошибка - не все поля заполнены');
      setRegistrationError('Пожалуйста, заполните все поля.');
      return;
    }

    if (password !== confirmPassword) {
      console.log('RegisterForm: Ошибка - пароли не совпадают');
      setRegistrationError('Пароли не совпадают.');
      return;
    }

    if (password.length < 6) {
      console.log('RegisterForm: Ошибка - пароль слишком короткий');
      setRegistrationError('Пароль должен быть не менее 6 символов.');
      return;
    }

    try {
      console.log('RegisterForm: Попытка хеширования пароля');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log('RegisterForm: Пароль успешно хеширован:', hashedPassword);

      const usersCollectionRef = collection(db, 'users');
      const userDocRef = doc(usersCollectionRef, nickname); // Используем никнейм как ID
      console.log(
        'RegisterForm: Ссылка на документ пользователя:',
        userDocRef.path
      );

      const userData = {
        nickname: nickname,
        password: hashedPassword,
        class: selectedClass,
        role: 'user',
        dkpBalance: 0,
      };
      console.log('RegisterForm: Данные для записи в Firestore:', userData);

      await setDoc(userDocRef, userData);
      console.log('RegisterForm: Данные успешно записаны в Firestore');

      alert(
        `Регистрация прошла успешно! Добро пожаловать, ${nickname} (${selectedClass})!`
      );
      console.log('RegisterForm: Окно alert показано');
      navigate('/login'); // Перенаправляем на страницу логина после успешной регистрации
      console.log('RegisterForm: Перенаправление на /login');
    } catch (error) {
      console.error('RegisterForm: Ошибка при регистрации:', error);
      setRegistrationError(`Ошибка регистрации: ${error.message}`);
      if (error.code === 'firestore/already-exists') {
        console.log(
          'RegisterForm: Ошибка - пользователь с таким никнеймом уже существует'
        );
        setRegistrationError('Пользователь с таким никнеймом уже существует.');
      } else {
        console.log('RegisterForm: Другая ошибка Firestore:', error.code);
      }
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      {registrationError && <p style={{ color: 'red' }}>{registrationError}</p>}
      <form onSubmit={handleRegister}>
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
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor='confirmPassword'>Подтвердите пароль:</label>
          <input
            type='password'
            id='confirmPassword'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor='class'>Класс:</label>
          <select
            id='class'
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            required
          >
            <option value=''>Выберите класс</option>
            {availableClasses.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>
        <button type='submit'>Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default RegisterForm;
