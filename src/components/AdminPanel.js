import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Navigate } from 'react-router-dom';
import AddUserForm from './AddUserForm';
import UserList from './UserList'; // Импортируем UserList

const AdminPanel = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to='/login' replace />;
  }

  return (
    <div>
      <h2>Административная Панель</h2>
      <p>Добро пожаловать в административную панель, {user.nickname}!</p>
      <AddUserForm />
      <UserList /> {/* Отображаем список пользователей */}
      {/* Здесь может быть другая функциональность админ панели */}
    </div>
  );
};

export default AdminPanel;
