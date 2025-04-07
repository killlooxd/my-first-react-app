import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Импортируем App (который теперь оборачивает Provider и Router)
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
