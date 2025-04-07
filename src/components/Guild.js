import React, { useContext, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import './Guild.css';

const activityDkpValues = {
  'prime-time': 10,
  'riftstone': 25,
  'boonstone': 25,
  'guild-boss': 15,
  'siege': 15,
  'bonus': 5,
};

const healerTemplarClasses = ['Seeker', 'Templar'];

const Guild = ({ members, onAddDkp, onRemoveDkp }) => {
  const { user } = useContext(UserContext);
  const [addDkpMemberId, setAddDkpMemberId] = useState(null);
  const [addDkpActivity, setAddDkpActivity] = useState('');
  const [removeDkpMemberId, setRemoveDkpMemberId] = useState(null);
  const [removeDkpAmount, setRemoveDkpAmount] = useState('');

  const handleAddDkpClick = (memberId) => {
    setAddDkpMemberId(memberId);
    setAddDkpActivity('');
  };

  const handleRemoveDkpClick = (memberId) => {
    setRemoveDkpMemberId(memberId);
    setRemoveDkpAmount('');
  };

  const handleAddDkpActivityChange = (event) => {
    setAddDkpActivity(event.target.value);
  };

  const handleRemoveDkpAmountChange = (event) => {
    setRemoveDkpAmount(event.target.value);
  };

  const handleAddDkpSubmit = (memberId) => {
    if (onAddDkp && addDkpActivity) {
      const baseAmount = activityDkpValues[addDkpActivity] || 0;
      const member = members.find((m) => m.id === memberId);
      let finalAmount = baseAmount;

      if (member && healerTemplarClasses.includes(member.class)) {
        finalAmount *= 2;
      }

      if (finalAmount > 0) {
        onAddDkp(memberId, finalAmount);
        setAddDkpMemberId(null);
        setAddDkpActivity('');
      } else {
        alert('Пожалуйста, выберите активность для начисления ДКП.');
      }
    } else {
      alert('Пожалуйста, выберите активность для начисления ДКП.');
    }
  };

  const handleRemoveDkpSubmit = (memberId) => {
    if (onRemoveDkp && removeDkpAmount) {
      const amount = parseInt(removeDkpAmount);
      if (!isNaN(amount)) {
        onRemoveDkp(memberId, amount);
        setRemoveDkpMemberId(null);
        setRemoveDkpAmount('');
      } else {
        alert('Пожалуйста, введите корректное число для списания ДКП.');
      }
    } else {
      alert('Пожалуйста, введите количество ДКП для списания.');
    }
  };

  return (
    <div className='guild-container'>
      <h2>Гильдия</h2>
      {members && members.length > 0 ? (
        <ul className='guild-list'>
          {members.map((member) => (
            <li key={member.id} className='guild-member'>
              <span className='member-info'>
                {member.nickname} ({member.class || 'Нет класса'}) - ДКП:{' '}
                {member.dkpBalance || 0}
              </span>
              {user && user.role === 'admin' && (
                <div className='dkp-controls'>
                  {!addDkpMemberId || addDkpMemberId !== member.id ? (
                    <button
                      className='add-dkp-button'
                      onClick={() => handleAddDkpClick(member.id)}
                    >
                      Начислить
                    </button>
                  ) : (
                    <div className='dkp-input'>
                      <select
                        value={addDkpActivity}
                        onChange={handleAddDkpActivityChange}
                        className='dkp-select'
                      >
                        <option value=''>Выберите активность</option>
                        {Object.keys(activityDkpValues).map((activity) => (
                          <option key={activity} value={activity}>
                            {activity} ({activityDkpValues[activity]} ДКП)
                          </option>
                        ))}
                      </select>
                      <button
                        className='dkp-submit-button'
                        onClick={() => handleAddDkpSubmit(member.id)}
                      >
                        OK
                      </button>
                      <button
                        className='dkp-cancel-button'
                        onClick={() => setAddDkpMemberId(null)}
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                  {!removeDkpMemberId || removeDkpMemberId !== member.id ? (
                    <button
                      className='remove-dkp-button'
                      onClick={() => handleRemoveDkpClick(member.id)}
                    >
                      Списать
                    </button>
                  ) : (
                    <div className='dkp-input'>
                      <input
                        type='number'
                        value={removeDkpAmount}
                        onChange={handleRemoveDkpAmountChange}
                        className='dkp-input-field'
                        placeholder='Кол-во'
                      />
                      <button
                        className='dkp-submit-button'
                        onClick={() => handleRemoveDkpSubmit(member.id)}
                      >
                        OK
                      </button>
                      <button
                        className='dkp-cancel-button'
                        onClick={() => setRemoveDkpMemberId(null)}
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Список участников гильдии пуст.</p>
      )}
    </div>
  );
};

export default Guild;
