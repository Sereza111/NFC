import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [stats, setStats] = useState(null)

  // Безопасный парсинг JSON (может быть уже распарсен MySQL драйвером)
  const parseRaw = (raw) => {
    if (!raw) return {}
    if (typeof raw === 'object') return raw
    try {
      return JSON.parse(raw)
    } catch (e) {
      console.error('Failed to parse raw:', e)
      return {}
    }
  }

  // Проверка авторизации при загрузке
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_auth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
      fetchOrders()
      fetchStats()
    }
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    // Простая проверка пароля (можно усложнить)
    if (password === process.env.ADMIN_PASSWORD || password === 'admin123') {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_auth', 'true')
      fetchOrders()
      fetchStats()
    } else {
      alert('Неверный пароль')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_auth')
    setOrders([])
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (data.ok) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      
      if (data.ok) {
        setOrders(orders.filter(o => o.id !== orderId))
        setSelectedOrder(null)
        alert('Заказ удален')
        fetchStats() // Обновить статистику
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Ошибка удаления')
    }
  }

  const handleUpdateOrder = async (orderId, updates) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      
      if (data.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o))
        setSelectedOrder({ ...selectedOrder, ...updates })
        setEditMode(false)
        alert('Заказ обновлен')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Ошибка обновления')
    }
  }

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const raw = parseRaw(order.raw)
    return (
      order.id?.toString().includes(term) ||
      order.participant_code?.toLowerCase().includes(term) ||
      order.name?.toLowerCase().includes(term) ||
      order.email?.toLowerCase().includes(term) ||
      order.phone?.toLowerCase().includes(term) ||
      raw.name?.toLowerCase().includes(term) ||
      raw.company?.toLowerCase().includes(term)
    )
  })

  // Экран авторизации
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 max-w-md w-full"
        >
          <h1 className="text-3xl font-bold text-green-400 mb-2">Админ-панель</h1>
          <p className="text-gray-400 mb-6">Управление NFC карточками</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="Введите пароль"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors"
            >
              Войти
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // Главная панель
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-400">Админ-панель</h1>
            <p className="text-gray-400 text-sm">Управление NFC карточками</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
          >
            Выйти
          </button>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">{stats.total}</div>
              <div className="text-sm text-gray-400">Всего заказов</div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400">{stats.paid}</div>
              <div className="text-sm text-gray-400">Оплачено</div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-gray-400">В ожидании</div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400">{stats.revenue} ₽</div>
              <div className="text-sm text-gray-400">Выручка</div>
            </div>
          </div>
        )}

        {/* Поиск и фильтры */}
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/30 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по ID, имени, email, телефону, коду..."
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              />
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>
        </div>

        {/* Таблица заказов */}
        <div className="bg-black/50 backdrop-blur-sm rounded-xl border border-green-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Код</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Контакты</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Данные карточки</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Дата</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                      Загрузка...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                      {searchTerm ? 'Ничего не найдено' : 'Заказов пока нет'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const raw = parseRaw(order.raw)
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-900/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="px-4 py-3 text-sm font-mono">#{order.id}</td>
                        <td className="px-4 py-3 text-sm">
                          <code className="text-green-400">{order.participant_code || '—'}</code>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="space-y-1">
                            <div>{order.name || '—'}</div>
                            <div className="text-xs text-gray-400">{order.email || '—'}</div>
                            <div className="text-xs text-gray-400">{order.phone || '—'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="space-y-1">
                            <div>{raw.name || '—'}</div>
                            <div className="text-xs text-gray-400">{raw.title || '—'}</div>
                            <div className="text-xs text-gray-400">{raw.company || '—'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(order.created_at).toLocaleString('ru-RU')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedOrder(order)
                            }}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                          >
                            Просмотр
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteOrder(order.id)
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Модальное окно с деталями заказа */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gray-900 rounded-2xl border border-green-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-green-400">Заказ #{selectedOrder.id}</h2>
                    <p className="text-sm text-gray-400">Код: {selectedOrder.participant_code}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Превью карточки */}
                  {(() => {
                    const raw = parseRaw(selectedOrder.raw)
                    return (
                      <div className="bg-black/30 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-green-400 mb-3">Превью карточки</h3>
                        <div 
                          className="w-full aspect-[1.75/1] rounded-xl shadow-2xl p-6 text-white relative overflow-hidden border border-green-500/30" 
                          style={{ 
                            background: raw.backgroundImage 
                              ? `url(${raw.backgroundImage})`
                              : raw.backgroundStyle === 'gradient' 
                                ? `linear-gradient(135deg, ${raw.primaryColor}, ${raw.secondaryColor})` 
                                : raw.primaryColor,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="h-full flex flex-col justify-between relative z-10">
                            <div>
                              <div className="text-xs font-semibold mb-2" style={{ color: raw.textColor }}>DIGITAL CARD</div>
                              <div className="text-xl font-bold drop-shadow-lg" style={{ color: raw.textColor }}>{raw.name || 'Имя'}</div>
                              <div className="text-sm opacity-90 drop-shadow-lg" style={{ color: raw.textColor }}>{raw.title || 'Должность'}</div>
                              <div className="text-xs opacity-75 drop-shadow-lg" style={{ color: raw.textColor }}>{raw.company || 'Компания'}</div>
                            </div>
                            <div className="space-y-1 text-xs drop-shadow-lg" style={{ color: raw.textColor }}>
                              {raw.phone && <div>📞 {raw.phone}</div>}
                              {raw.email && <div>✉️ {raw.email}</div>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Контактные данные */}
                  <div className="bg-black/30 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">Контактные данные</h3>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400">ФИО:</div>
                        <div className="font-medium">{selectedOrder.name || '—'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Email:</div>
                        <div className="font-medium">{selectedOrder.email || '—'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Телефон:</div>
                        <div className="font-medium">{selectedOrder.phone || '—'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">IP:</div>
                        <div className="font-medium text-xs">{selectedOrder.ip || '—'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Доставка */}
                  {selectedOrder.delivery_address && (
                    <div className="bg-black/30 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-green-400 mb-3">Доставка</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Способ:</span> {selectedOrder.delivery_method_name || '—'}
                        </div>
                        <div>
                          <span className="text-gray-400">Адрес:</span> {selectedOrder.delivery_address || '—'}
                        </div>
                        <div>
                          <span className="text-gray-400">Индекс:</span> {selectedOrder.delivery_postal_code || '—'}
                        </div>
                        <div>
                          <span className="text-gray-400">Стоимость:</span> {selectedOrder.delivery_cost || 0} ₽
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Кнопки действий */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
                    >
                      {editMode ? 'Отменить' : 'Редактировать'}
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteOrder(selectedOrder.id)
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminPanel

