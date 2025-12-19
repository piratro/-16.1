
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { RollingStock, Trip, User } from './types';
import { getSmartScheduleAdvice } from './services/geminiService';

// --- Components ---

const Navbar: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => (
    <nav class="bg-slate-800 text-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center gap-2">
                    <i class="fas fa-train-subway text-blue-400 text-2xl"></i>
                    <span class="font-bold text-xl tracking-tight">RailTrack Pro</span>
                </div>
                {user && (
                    <div class="hidden md:block">
                        <div class="ml-10 flex items-baseline space-x-4">
                            <Link to="/" class="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium">Панель</Link>
                            <Link to="/stock" class="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium">Рухомий склад</Link>
                            <Link to="/trips" class="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium">Графік рейсів</Link>
                        </div>
                    </div>
                )}
                <div class="flex items-center gap-4">
                    {user ? (
                        <div class="flex items-center gap-3">
                            <span class="text-slate-300 text-sm">{user.username} ({user.role})</span>
                            <button onClick={onLogout} class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition">Вийти</button>
                        </div>
                    ) : (
                        <Link to="/login" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition">Увійти</Link>
                    )}
                </div>
            </div>
        </div>
    </nav>
);

const Dashboard: React.FC<{ stock: RollingStock[]; trips: Trip[] }> = ({ stock, trips }) => {
    const [advice, setAdvice] = useState<any[]>([]);
    const [loadingAdvice, setLoadingAdvice] = useState(false);

    const fetchAdvice = async () => {
        setLoadingAdvice(true);
        const result = await getSmartScheduleAdvice(stock, trips);
        setAdvice(result);
        setLoadingAdvice(false);
    };

    return (
        <div class="space-y-6 animate-fadeIn">
            <header class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-slate-800">Панель управління</h1>
                <button 
                    onClick={fetchAdvice}
                    disabled={loadingAdvice}
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                    <i class={`fas ${loadingAdvice ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                    AI Аналітика
                </button>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 class="text-slate-500 text-sm font-semibold uppercase mb-2">Активні потяги</h3>
                    <p class="text-4xl font-bold text-slate-900">{trips.filter(t => t.status === 'In Progress').length}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 class="text-slate-500 text-sm font-semibold uppercase mb-2">Технічне обслуговування</h3>
                    <p class="text-4xl font-bold text-orange-600">{stock.filter(s => s.status === 'Maintenance').length}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 class="text-slate-500 text-sm font-semibold uppercase mb-2">Доступно вагонів</h3>
                    <p class="text-4xl font-bold text-green-600">{stock.filter(s => s.status === 'Available').length}</p>
                </div>
            </div>

            {advice.length > 0 && (
                <div class="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-inner">
                    <h2 class="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <i class="fas fa-brain"></i> Поради від AI помічника
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {advice.map((item, idx) => (
                            <div key={idx} class="bg-white p-4 rounded shadow-sm border border-indigo-100">
                                <h4 class="font-bold text-indigo-700 mb-1">{item.title}</h4>
                                <p class="text-slate-600 text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h2 class="font-bold text-slate-700">Найближчі рейси</h2>
                    <Link to="/trips" class="text-blue-600 text-sm hover:underline">Переглянути всі</Link>
                </div>
                <div class="divide-y divide-slate-100">
                    {trips.slice(0, 5).map(trip => (
                        <div key={trip.id} class="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    <i class="fas fa-route"></i>
                                </div>
                                <div>
                                    <p class="font-semibold text-slate-800">{trip.route}</p>
                                    <p class="text-xs text-slate-500">{new Date(trip.departureTime).toLocaleString('uk-UA')}</p>
                                </div>
                            </div>
                            <span class={`px-3 py-1 rounded-full text-xs font-medium 
                                ${trip.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 
                                  trip.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-green-100 text-green-700'}`}>
                                {trip.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StockManagement: React.FC<{ stock: RollingStock[]; onAdd: (s: RollingStock) => void; onDelete: (id: string) => void }> = ({ stock, onAdd, onDelete }) => {
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState<Partial<RollingStock>>({ type: 'Locomotive', status: 'Available' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            name: newItem.name || 'Unknown',
            type: newItem.type as any,
            status: newItem.status as any,
            capacity: Number(newItem.capacity) || 0,
            lastMaintenance: new Date().toISOString().split('T')[0]
        });
        setShowForm(false);
        setNewItem({ type: 'Locomotive', status: 'Available' });
    };

    return (
        <div class="space-y-6">
            <header class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-slate-800">Рухомий склад</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    {showForm ? 'Скасувати' : 'Додати одиницю'}
                </button>
            </header>

            {showForm && (
                <form onSubmit={handleSubmit} class="bg-white p-6 rounded-xl shadow-md border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideDown">
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold">Назва/Модель</label>
                        <input required type="text" onChange={e => setNewItem({...newItem, name: e.target.value})} class="border rounded p-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold">Тип</label>
                        <select onChange={e => setNewItem({...newItem, type: e.target.value as any})} class="border rounded p-2">
                            <option value="Locomotive">Локомотив</option>
                            <option value="Passenger Carriage">Пасажирський вагон</option>
                            <option value="Freight Wagon">Вантажний вагон</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold">Вантажопідйомність / Місткість</label>
                        <input type="number" onChange={e => setNewItem({...newItem, capacity: Number(e.target.value)})} class="border rounded p-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold">Статус</label>
                        <select onChange={e => setNewItem({...newItem, status: e.target.value as any})} class="border rounded p-2">
                            <option value="Available">Доступний</option>
                            <option value="Maintenance">В ремонті</option>
                        </select>
                    </div>
                    <button class="md:col-span-2 bg-green-600 text-white p-2 rounded hover:bg-green-700 transition font-bold">Зберегти</button>
                </form>
            )}

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Одиниця</th>
                            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Тип</th>
                            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Параметри</th>
                            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Статус</th>
                            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Дії</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        {stock.map(item => (
                            <tr key={item.id} class="hover:bg-slate-50 transition">
                                <td class="px-6 py-4 font-semibold text-slate-800">{item.name}</td>
                                <td class="px-6 py-4 text-slate-600">{item.type}</td>
                                <td class="px-6 py-4 text-slate-500 text-sm">{item.capacity} {item.type === 'Passenger Carriage' ? 'місць' : 'тонн'}</td>
                                <td class="px-6 py-4">
                                    <span class={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right space-x-2">
                                    <button class="text-blue-600 hover:text-blue-800"><i class="fas fa-edit"></i></button>
                                    <button onClick={() => onDelete(item.id)} class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TripManagement: React.FC<{ trips: Trip[]; onAdd: (t: Trip) => void }> = ({ trips, onAdd }) => {
    const [showForm, setShowForm] = useState(false);
    const [newTrip, setNewTrip] = useState<Partial<Trip>>({ status: 'Scheduled' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            trainId: `RT-${Math.floor(Math.random()*1000)}`,
            route: newTrip.route || 'Unknown Route',
            departureTime: newTrip.departureTime || new Date().toISOString(),
            arrivalTime: newTrip.arrivalTime || new Date().toISOString(),
            status: 'Scheduled',
            assignedStockIds: []
        });
        setShowForm(false);
    };

    return (
        <div class="space-y-6">
            <header class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-slate-800">Планування рейсів</h1>
                <button onClick={() => setShowForm(!showForm)} class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">Новий рейс</button>
            </header>

            {showForm && (
                <form onSubmit={handleSubmit} class="bg-white p-6 rounded-xl shadow-md border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideDown">
                    <div class="flex flex-col gap-1 md:col-span-2">
                        <label class="text-sm font-semibold">Маршрут (з - до)</label>
                        <input required type="text" placeholder="Київ - Львів" onChange={e => setNewTrip({...newTrip, route: e.target.value})} class="border rounded p-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold">Час відправлення</label>
                        <input required type="datetime-local" onChange={e => setNewTrip({...newTrip, departureTime: e.target.value})} class="border rounded p-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold">Час прибуття</label>
                        <input required type="datetime-local" onChange={e => setNewTrip({...newTrip, arrivalTime: e.target.value})} class="border rounded p-2" />
                    </div>
                    <button class="md:col-span-2 bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition font-bold">Запланувати</button>
                </form>
            )}

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="divide-y divide-slate-100">
                    {trips.map(trip => (
                        <div key={trip.id} class="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xl">
                                    <i class="fas fa-train"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-slate-900">{trip.route}</h3>
                                    <p class="text-sm text-slate-500">ID Рейсу: {trip.trainId}</p>
                                </div>
                            </div>
                            <div class="flex-1 md:px-10">
                                <div class="flex items-center gap-3 text-sm text-slate-600">
                                    <i class="far fa-calendar-alt"></i>
                                    <span>{new Date(trip.departureTime).toLocaleString('uk-UA')}</span>
                                    <i class="fas fa-arrow-right mx-2 text-slate-300"></i>
                                    <span>{new Date(trip.arrivalTime).toLocaleString('uk-UA')}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                    ${trip.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 
                                      trip.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 
                                      'bg-green-100 text-green-700'}`}>
                                    {trip.status}
                                </span>
                                <button class="p-2 text-slate-400 hover:text-slate-600"><i class="fas fa-ellipsis-v"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LoginPage: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<'Admin' | 'Manager' | 'Viewer'>('Manager');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin({ id: '1', username, role });
    };

    return (
        <div class="flex justify-center items-center min-h-[70vh]">
            <div class="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
                <div class="text-center mb-8">
                    <i class="fas fa-train text-blue-600 text-5xl mb-4"></i>
                    <h1 class="text-2xl font-bold text-slate-800">Вхід до системи</h1>
                    <p class="text-slate-500">RailTrack Pro v1.0</p>
                </div>
                <form onSubmit={handleSubmit} class="space-y-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold">Ім'я користувача</label>
                        <input required type="text" value={username} onChange={e => setUsername(e.target.value)} class="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Введіть ім'я..." />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold">Роль</label>
                        <select value={role} onChange={e => setRole(e.target.value as any)} class="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="Admin">Адміністратор</option>
                            <option value="Manager">Менеджер депо</option>
                            <option value="Viewer">Диспетчер (тільки перегляд)</option>
                        </select>
                    </div>
                    <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition transform hover:scale-[1.02]">
                        Увійти
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Main App ---

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [stock, setStock] = useState<RollingStock[]>([
        { id: '1', name: 'Siemens Vectron', type: 'Locomotive', status: 'Available', capacity: 0, lastMaintenance: '2023-10-15' },
        { id: '2', name: 'ChME3-2144', type: 'Locomotive', status: 'Maintenance', capacity: 0, lastMaintenance: '2023-11-20' },
        { id: '3', name: 'Standard Freight', type: 'Freight Wagon', status: 'Available', capacity: 60, lastMaintenance: '2024-01-05' },
        { id: '4', name: 'InterCity Carriage', type: 'Passenger Carriage', status: 'Available', capacity: 80, lastMaintenance: '2024-02-10' },
    ]);
    const [trips, setTrips] = useState<Trip[]>([
        { id: '101', trainId: 'RT-101', route: 'Київ - Львів', departureTime: '2024-05-01T10:00', arrivalTime: '2024-05-01T17:00', status: 'Scheduled', assignedStockIds: ['1', '4'] },
        { id: '102', trainId: 'RT-102', route: 'Харків - Одеса', departureTime: '2024-05-01T08:00', arrivalTime: '2024-05-01T20:00', status: 'In Progress', assignedStockIds: ['3'] },
    ]);

    const handleAddStock = (item: RollingStock) => setStock([...stock, item]);
    const handleDeleteStock = (id: string) => setStock(stock.filter(s => s.id !== id));
    const handleAddTrip = (trip: Trip) => setTrips([trip, ...trips]);

    return (
        <Router>
            <div class="min-h-screen bg-slate-50">
                <Navbar user={user} onLogout={() => setUser(null)} />
                <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/login" element={<LoginPage onLogin={u => setUser(u)} />} />
                        <Route path="/" element={user ? <Dashboard stock={stock} trips={trips} /> : <LoginPage onLogin={u => setUser(u)} />} />
                        <Route path="/stock" element={user ? <StockManagement stock={stock} onAdd={handleAddStock} onDelete={handleDeleteStock} /> : <LoginPage onLogin={u => setUser(u)} />} />
                        <Route path="/trips" element={user ? <TripManagement trips={trips} onAdd={handleAddTrip} /> : <LoginPage onLogin={u => setUser(u)} />} />
                    </Routes>
                </main>
                <footer class="text-center py-8 text-slate-400 text-sm border-t border-slate-200 mt-12 bg-white">
                    <p>&copy; 2024 RailTrack Systems. Всі права захищені.</p>
                </footer>
            </div>
        </Router>
    );
};

export default App;
