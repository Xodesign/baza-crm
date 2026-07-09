import { useState } from "react";
import { Plus, Trash2, User, Calendar } from "lucide-react";

const INITIAL_ENGINEERS = [
  {
    id: 1,
    name: "Иванов Иван Иванович",
    position: "Инженер",
    phone: "+7 (999) 123-45-67",
    salary: 80000,
    workSchedule: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
    workHours: { start: "09:00", end: "18:00" },
    vacations: [
      { id: 1, start: "2025-07-01", end: "2025-07-14", type: "Основной" },
      { id: 2, start: "2025-12-25", end: "2026-01-08", type: "Новогодний" }
    ],
    status: "active"
  },
  {
    id: 2,
    name: "Петров Пётр Петрович",
    position: "Старший инженер",
    phone: "+7 (999) 234-56-78",
    salary: 95000,
    workSchedule: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
    workHours: { start: "08:00", end: "17:00" },
    vacations: [
      { id: 1, start: "2025-08-15", end: "2025-08-28", type: "Основной" }
    ],
    status: "active"
  },
  {
    id: 3,
    name: "Сидоров Алексей Сергеевич",
    position: "Инженер",
    phone: "+7 (999) 345-67-89",
    salary: 75000,
    workSchedule: { mon: false, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false },
    workHours: { start: "10:00", end: "19:00" },
    vacations: [],
    status: "active"
  }
];

export default function EngineersCalendar() {
  const [engineers, setEngineers] = useState(() => {
    const saved = localStorage.getItem("demo_engineers");
    return saved ? JSON.parse(saved) : INITIAL_ENGINEERS;
  });
  const [calendarView, setCalendarView] = useState('cards');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    let startDay = firstDay.getDay();
    if (startDay === 0) startDay = 7;
    for (let i = 1; i < startDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isDateInVacation = (date, vacations) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return vacations.some(v => dateStr >= v.start && dateStr <= v.end);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
  };

  const handleAddEngineer = (e) => {
    e.preventDefault();
    const form = e.target;
    const newEng = {
      id: Date.now(),
      name: form.name.value,
      position: form.position.value,
      phone: form.phone.value,
      salary: parseInt(form.salary.value) || 0,
      workSchedule: {
        mon: form.mon.checked,
        tue: form.tue.checked,
        wed: form.wed.checked,
        thu: form.thu.checked,
        fri: form.fri.checked,
        sat: form.sat.checked,
        sun: form.sun.checked,
      },
      workHours: { start: form.workStart.value, end: form.workEnd.value },
      vacations: [],
      status: 'active'
    };
    setEngineers([...engineers, newEng]);
    localStorage.setItem("demo_engineers", JSON.stringify([...engineers, newEng]));
    form.reset();
  };

  const handleDeleteEngineer = (id) => {
    if (confirm('Удалить инженера?')) {
      const updated = engineers.filter(e => e.id !== id);
      setEngineers(updated);
      localStorage.setItem("demo_engineers", JSON.stringify(updated));
    }
  };

  const handleAddVacation = (engineerId, e) => {
    e.preventDefault();
    const form = e.target;
    const newVac = {
      id: Date.now(),
      start: form.vacStart.value,
      end: form.vacEnd.value,
      type: form.vacType.value
    };
    const updated = engineers.map(eng => 
      eng.id === engineerId 
        ? { ...eng, vacations: [...eng.vacations, newVac] }
        : eng
    );
    setEngineers(updated);
    localStorage.setItem("demo_engineers", JSON.stringify(updated));
    form.reset();
  };

  const handleDeleteVacation = (engineerId, vacId) => {
    const updated = engineers.map(eng => 
      eng.id === engineerId 
        ? { ...eng, vacations: eng.vacations.filter(v => v.id !== vacId) }
        : eng
    );
    setEngineers(updated);
    localStorage.setItem("demo_engineers", JSON.stringify(updated));
  };

  const monthDays = getMonthDays(currentMonth);
  const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDayStatus = (date, engineer) => {
    if (!date) return null;
    const dayOfWeek = date.getDay();
    const dayKey = dayKeys[(dayOfWeek + 6) % 7];
    if (!engineer.workSchedule[dayKey]) return 'day-off';
    if (isDateInVacation(date, engineer.vacations)) return 'vacation';
    return 'working';
  };

  return (
    <>
      <div className="content-header">
        <h2>Календарь инженеров</h2>
        <div className="header-actions">
          <button 
            className={`btn ${calendarView === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCalendarView('cards')}
          >
            <User size={16} /> Карточки
          </button>
          <button 
            className={`btn ${calendarView === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCalendarView('calendar')}
          >
            <Calendar size={16} /> Календарь
          </button>
        </div>
      </div>
      
      {calendarView === 'cards' ? (
        <>
          {/* Список инженеров */}
          <div className="engineers-grid">
            {engineers.map(eng => (
              <div key={eng.id} className="engineer-card">
                <div className="engineer-header">
                  <div className="engineer-avatar">
                    <User size={32} />
                  </div>
                  <div className="engineer-info">
                    <h3>{eng.name}</h3>
                    <p className="engineer-position">{eng.position}</p>
                    <p className="engineer-phone">{eng.phone}</p>
                  </div>
                  <button 
                    className="btn-icon btn-delete"
                    onClick={() => handleDeleteEngineer(eng.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="engineer-stats">
                  <div className="stat-item">
                    <span className="stat-label">Зарплата:</span>
                    <span className="stat-value salary">{formatCurrency(eng.salary)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">График:</span>
                    <span className="stat-value">{eng.workHours.start} - {eng.workHours.end}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Рабочие дни:</span>
                    <span className="stat-value">
                      {dayNames.map((d, i) => (
                        eng.workSchedule[dayKeys[i]] && <span key={i} className="workday-badge">{d}</span>
                      ))}
                    </span>
                  </div>
                </div>
                
                <div className="engineer-vacations">
                  <h4>Отпуска</h4>
                  {eng.vacations.length === 0 ? (
                    <p className="no-vacations">Нет отпусков</p>
                  ) : (
                    <div className="vacations-list">
                      {eng.vacations.map(vac => (
                        <div key={vac.id} className="vacation-item">
                          <span className="vacation-dates">{vac.start} - {vac.end}</span>
                          <span className="vacation-type">{vac.type}</span>
                          <button 
                            className="btn-icon btn-delete btn-sm"
                            onClick={() => handleDeleteVacation(eng.id, vac.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <form onSubmit={(e) => handleAddVacation(eng.id, e)} className="add-vacation-form">
                    <input type="date" name="vacStart" required placeholder="Начало" />
                    <input type="date" name="vacEnd" required placeholder="Конец" />
                    <select name="vacType">
                      <option value="Основной">Основной</option>
                      <option value="Дополнительный">Дополнительный</option>
                      <option value="Больничный">Больничный</option>
                      <option value="Новогодний">Новогодний</option>
                    </select>
                    <button type="submit" className="btn btn-sm btn-primary">+ Отпуск</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
          
          {/* Форма добавления инженера */}
          <div className="add-form-section">
            <h3><Plus size={20} /> Добавить инженера</h3>
            <form onSubmit={handleAddEngineer} className="add-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>ФИО</label>
                  <input type="text" name="name" required placeholder="Иванов Иван Иванович" />
                </div>
                <div className="form-group">
                  <label>Должность</label>
                  <input type="text" name="position" required placeholder="Инженер" />
                </div>
                <div className="form-group">
                  <label>Телефон</label>
                  <input type="tel" name="phone" placeholder="+7 (999) 123-45-67" />
                </div>
                <div className="form-group">
                  <label>Зарплата (руб/мес)</label>
                  <input type="number" name="salary" min="0" placeholder="80000" />
                </div>
                <div className="form-group">
                  <label>Начало работы</label>
                  <input type="time" name="workStart" defaultValue="09:00" />
                </div>
                <div className="form-group">
                  <label>Конец работы</label>
                  <input type="time" name="workEnd" defaultValue="18:00" />
                </div>
                <div className="form-group form-group-full">
                  <label>Рабочие дни</label>
                  <div className="workdays-checkboxes">
                    <label><input type="checkbox" name="mon" defaultChecked /> Пн</label>
                    <label><input type="checkbox" name="tue" defaultChecked /> Вт</label>
                    <label><input type="checkbox" name="wed" defaultChecked /> Ср</label>
                    <label><input type="checkbox" name="thu" defaultChecked /> Чт</label>
                    <label><input type="checkbox" name="fri" defaultChecked /> Пт</label>
                    <label><input type="checkbox" name="sat" /> Сб</label>
                    <label><input type="checkbox" name="sun" /> Вс</label>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <Plus size={18} /> Добавить инженера
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          {/* Календарный вид */}
          <div className="calendar-header">
            <button onClick={prevMonth} className="btn btn-secondary">←</button>
            <h3>{monthName}</h3>
            <button onClick={nextMonth} className="btn btn-secondary">→</button>
          </div>
          
          <div className="calendar-grid">
            <div className="calendar-days-header">
              {dayNames.map(d => <div key={d} className="day-name">{d}</div>)}
            </div>
            
            <div className="calendar-days">
              {monthDays.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="calendar-cell empty" />;
                
                return (
                  <div key={date.toISOString()} className="calendar-cell">
                    <div className="day-number">{date.getDate()}</div>
                    <div className="engineers-status">
                      {engineers.map(eng => {
                        const status = getDayStatus(date, eng);
                        return (
                          <div key={eng.id} className={`engineer-status ${status}`} title={eng.name}>
                            <span className="eng-initial">{eng.name.charAt(0)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="calendar-legend">
            <div className="legend-item"><span className="legend-dot working"></span> Работает</div>
            <div className="legend-item"><span className="legend-dot day-off"></span> Выходной</div>
            <div className="legend-item"><span className="legend-dot vacation"></span> Отпуск</div>
          </div>
          
          <div className="engineers-list-compact">
            <h4>Список инженеров</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Должность</th>
                  <th>Телефон</th>
                  <th>Зарплата</th>
                  <th>График</th>
                </tr>
              </thead>
              <tbody>
                {engineers.map(eng => (
                  <tr key={eng.id}>
                    <td><strong>{eng.name}</strong></td>
                    <td>{eng.position}</td>
                    <td>{eng.phone}</td>
                    <td className="salary-cell">{formatCurrency(eng.salary)}</td>
                    <td>{eng.workHours.start}-{eng.workHours.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
