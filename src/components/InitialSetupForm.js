import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const InitialSetupForm = ({ availableClasses }) => {
  const [newClass, setNewClass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const { user, setFirstLoginCheck } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!newClass) {
      setError('Пожалуйста, выберите класс.');
      return;
    }

    if (!newPassword) {
      setError('Пожалуйста, введите новый пароль.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Новый пароль должен быть не менее 6 символов.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Новые пароли не совпадают.');
      return;
    }

    try {
      // **Здесь должна быть ваша логика обновления класса и пароля пользователя в Firestore**
      // Вам понадобится UID пользователя (доступен через user.uid из контекста)
      // и, возможно, функцию для хеширования нового пароля (bcrypt).

      // Пример (вам нужно адаптировать под вашу функцию обновления данных пользователя):
      // await updateUserProfile(user.uid, newClass, await bcrypt.hash(newPassword, 10));

      // После успешного обновления вызываем setFirstLoginCheck, чтобы сбросить флаг
      await setFirstLoginCheck(user.uid);
      navigate('/'); // Перенаправляем на главную страницу
    } catch (updateError) {
      console.error('Ошибка при обновлении профиля:', updateError);
      setError('Ошибка при обновлении профиля.');
    }
  };

  if (!user) {
    // Обработка ситуации, когда пользователь неожиданно отсутствует
    return <div>Ошибка: Пользователь не найден.</div>;
  }

  return (
    <div>
      <h2>Первоначальная настройка</h2>
      <p>Пожалуйста, выберите свой класс и установите новый пароль.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='newClass'>Класс:</label>
          <select
            id='newClass'
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            required
          >
            <option value=''>Выберите класс</option>
            {availableClasses &&
              availableClasses.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label htmlFor='newPassword'>Новый пароль:</label>
          <input
            type='password'
            id='newPassword'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor='confirmNewPassword'>Подтвердите новый пароль:</label>
          <input
            type='password'
            id='confirmNewPassword'
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </div>
        <button type='submit'>Сохранить</button>
      </form>
    </div>
  );
};

export default InitialSetupForm;
