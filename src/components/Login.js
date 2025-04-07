import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const Login = () => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Состояние для отображения ошибки
  const { login, loading } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Сбрасываем сообщение об ошибке при новой попытке
    const success = await login(nickname, password);
    if (success) {
      navigate('/');
    } else {
      setError('Неверный никнейм или пароль.');
    }
  };

  if (loading) {
    return <div>Загрузка...</div>; // Можно заменить на более информативное сообщение
  }

  return (
    <div>
      <h2>Вход</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}{' '}
      {/* Отображаем сообщение об ошибке */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='nickname'>Никнейм:</label>
          <input
            type='text'
            id='nickname'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor='password'>Пароль:</label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type='submit' disabled={loading}>
          Войти
        </button>
      </form>
    </div>
  );
};

export default Login;
