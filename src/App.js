import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Guild from './components/Guild';
import Auction from './components/Auction/Auction';
import Events from './components/Events';
import Schedule from './components/Schedule';
import Login from './components/Login';
import RegisterForm from './components/RegisterForm';
import AdminPanel from './components/AdminPanel';
import SideNavigation from './components/SideNavigation';
import { UserContext, UserProvider } from './contexts/UserContext';
import { db } from './firebaseConfig';
import {
  collection,
  doc,
  updateDoc, // Импортируем updateDoc для обновления DKP
  onSnapshot, // Импортируем onSnapshot
} from 'firebase/firestore';
import LoadingScreen from './components/LoadingScreen';
import './App.css';
import InitialSetupForm from './components/InitialSetupForm'; // Импортируем InitialSetupForm

const availableClasses = [
  'Battleweaver',
  'Berserker',
  'Cavalier',
  'Crusader',
  'Darkblighter',
  'Disciple',
  'Eradicator',
  'Fury',
  'Gladiator',
  'Impaler',
  'Infiltrator',
  'Invocator',
  'Liberator',
  'Outrider',
  'Paladin',
  'Raider',
  'Ranger',
  'Ravager',
  'Scorpion',
  'Scout',
  'Seeker',
  'Sentinel',
  'Shadowdancer',
  'Spellblade',
  'Steelheart',
  'Templar',
  'Voidlance',
  'Warden',
];

const USERS_COLLECTION = 'users'; // Название коллекции с пользователями

function AppContent() {
  const [users, setUsers] = useState([]); // State для хранения пользователей
  const { user, loading, isFirstLogin } = useContext(UserContext); // Получаем isFirstLogin

  useEffect(() => {
    const usersCollectionRef = collection(db, USERS_COLLECTION);
    const unsubscribe = onSnapshot(
      usersCollectionRef,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        console.log('Данные пользователей обновлены (onSnapshot):', usersData);
      },
      (error) => {
        console.error('Ошибка подписки на изменения пользователей:', error);
      }
    );

    // Возвращаем функцию отписки при размонтировании компонента
    return () => unsubscribe();
  }, []);

  const handleAddDkp = async (userId, amount) => {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userDocRef, {
        dkpBalance:
          (users.find((u) => u.id === userId)?.dkpBalance || 0) +
          parseInt(amount),
      });
      // Обновляем локальное состояние (можно убрать, так как onSnapshot обновит его)
      // setUsers((prevUsers) => ... );
    } catch (error) {
      console.error('Ошибка начисления ДКП:', error);
    }
  };

  const handleRemoveDkp = async (userId, amount) => {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userDocRef, {
        dkpBalance: Math.max(
          0,
          (users.find((u) => u.id === userId)?.dkpBalance || 0) -
            parseInt(amount)
        ),
      });
      // Обновляем локальное состояние (можно убрать, так как onSnapshot обновит его)
      // setUsers((prevUsers) => ... );
    } catch (error) {
      console.error('Ошибка списания ДКП:', error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Условный рендеринг InitialSetupForm
  if (user && isFirstLogin) {
    return (
      <div className='card'>
        <InitialSetupForm availableClasses={availableClasses} />
      </div>
    );
  }

  return (
    <div className='app-layout'>
      <SideNavigation />
      <div className='main-content'>
        <header className='App-header'>
          <h1>ДКП Гильдии</h1>
        </header>
        <main className='page-container'>
          <Routes>
            <Route
              path='/'
              element={
                user ? (
                  <div className='card'>
                    <Guild
                      members={users}
                      onAddDkp={handleAddDkp}
                      onRemoveDkp={handleRemoveDkp}
                    />
                  </div>
                ) : (
                  <Navigate to='/login' replace />
                )
              }
            />
            <Route
              path='/register'
              element={
                <div className='card'>
                  <RegisterForm availableClasses={availableClasses} />
                </div>
              }
            />
            <Route
              path='/auction'
              element={
                <div className='card'>
                  <Auction />
                </div>
              }
            />
            <Route
              path='/events'
              element={
                <div className='card'>
                  <Events />
                </div>
              }
            />
            <Route
              path='/schedule'
              element={
                <div className='card'>
                  <Schedule />
                </div>
              }
            />
            <Route
              path='/login'
              element={
                <div className='card'>
                  <Login />
                </div>
              }
            />
            <Route
              path='/admin'
              element={
                user && user.role === 'admin' ? (
                  <div className='card'>
                    <AdminPanel />
                  </div>
                ) : (
                  <Navigate to='/login' replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
