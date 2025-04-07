import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from 'firebase/firestore';
import bcrypt from 'bcryptjs';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [blockDuration, setBlockDuration] = useState(0);
  const [isFirstLogin, setIsFirstLogin] = useState(false); // НОВОЕ СОСТОЯНИЕ

  // ... (useEffect для блокировки попыток входа)

  useEffect(() => {
    const storedNickname = localStorage.getItem('userNickname');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const simulateLoadingDelay = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (storedNickname && isLoggedIn) {
        try {
          const usersCollection = collection(db, 'users');
          const querySnapshot = await getDocs(
            query(usersCollection, where('nickname', '==', storedNickname))
          );
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setUser({
              uid: userDoc.id,
              nickname: userData.nickname,
              role: userData.role,
            });
            // Проверяем флаг needsInitialSetup при автоматическом логине
            if (userData.needsInitialSetup) {
              setIsFirstLogin(true);
            } else {
              setIsFirstLogin(false);
            }
          } else {
            localStorage.removeItem('userNickname');
            localStorage.removeItem('isLoggedIn');
          }
        } catch (error) {
          console.error('Ошибка при автоматическом логине:', error);
          localStorage.removeItem('userNickname');
          localStorage.removeItem('isLoggedIn');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    simulateLoadingDelay();
  }, []);

  const login = async (nickname, password) => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(
        query(usersCollection, where('nickname', '==', nickname))
      );

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userDocId = userDoc.id;

        const isPasswordCorrect = await bcrypt.compare(
          password,
          userData.password
        );

        if (isPasswordCorrect) {
          setUser({
            uid: userDocId,
            nickname: userData.nickname,
            role: userData.role,
          });
          localStorage.setItem('userNickname', userData.nickname);
          localStorage.setItem('isLoggedIn', 'true');
          // Проверяем флаг needsInitialSetup при логине
          setIsFirstLogin(userData.needsInitialSetup || false);
          setLoading(false);
          return true;
        } else {
          console.log('Неверный пароль');
          setLoading(false);
          return false;
        }
      } else {
        console.log('Пользователь не найден');
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Ошибка при логине:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userNickname');
    localStorage.removeItem('isLoggedIn');
    setIsFirstLogin(false); // Сбрасываем состояние при выходе
    // Дополнительная логика выхода, например, перенаправление
  };

  // Функция для установки флага needsInitialSetup после первого входа
  const setFirstLoginCheck = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { needsInitialSetup: false });
      setIsFirstLogin(false); // Обновляем состояние в контексте
    } catch (error) {
      console.error('Ошибка при обновлении флага firstLogin:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, loading, login, logout, isFirstLogin, setFirstLoginCheck }}
    >
      {' '}
      {/* Экспортируем новое состояние и функцию */}
      {children}
    </UserContext.Provider>
  );
};
