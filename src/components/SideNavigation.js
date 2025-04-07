import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import './SideNavigation.css';

const SideNavigation = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className='side-navigation'>
      <div className='logo'>
        <Link to='/'>Моя Гильдия</Link>
      </div>
      <ul className='nav-links'>
        <li>
          <Link to='/'>Гильдия</Link>
        </li>
        <li>
          <Link to='/auction'>Аукцион</Link>
        </li>
        <li>
          <Link to='/events'>События</Link>
        </li>
        <li>
          <Link to='/schedule'>Расписание</Link>
        </li>
        {user && user.role === 'admin' && (
          <li>
            <Link to='/admin'>Админ Панель</Link>
          </li>
        )}
        <li className='user-info'>
          {user ? (
            <>
              <span className='nickname'>Привет, {user.nickname}!</span>
              <button className='logout-button' onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <Link to='/login'>Войти</Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default SideNavigation;
