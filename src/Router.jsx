import React, { useState, useEffect } from 'react'
import App from './App.jsx'
import Requisites from './pages/Requisites.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Refund from './pages/Refund.jsx'
import Delivery from './pages/Delivery.jsx'
import Checkout from './pages/CheckoutImproved.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import NFCWrite from './pages/NFCWrite.jsx'
import DigitalCard from './pages/DigitalCard.jsx'
import AdminPanel from './pages/AdminPanel.jsx'

const Router = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleLocationChange)
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  // Scroll to top on route change and track page view in Yandex.Metrika
  useEffect(() => {
    window.scrollTo(0, 0)
    
    // Track page view in Yandex.Metrika
    if (typeof window.ym !== 'undefined') {
      window.ym(105302040, 'hit', window.location.href, {
        title: document.title
      })
    }
  }, [currentPath])

  // Simple routing logic
  // Check for dynamic routes first
  if (currentPath.startsWith('/card/')) {
    return <DigitalCard />
  }

  switch (currentPath) {
    case '/requisites':
      return <Requisites />
    case '/privacy':
      return <Privacy />
    case '/terms':
      return <Terms />
    case '/refund':
      return <Refund />
    case '/delivery':
      return <Delivery />
    case '/checkout':
      return <Checkout />
    case '/payment-success':
      return <PaymentSuccess />
    case '/nfc-write':
      return <NFCWrite />
    case '/admin-nfc-manage':
      return <AdminPanel />
    default:
      return <App />
  }
}

export default Router

