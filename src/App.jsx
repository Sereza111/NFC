import React from 'react'
import Hero from './components/Hero.jsx'
import CardCustomizer from './components/CardCustomizer.jsx'
import FAQ from './components/FAQ.jsx'
import Promo from './components/Promo.jsx'
import Benefits from './components/Benefits.jsx'
import Footer from './components/Footer.jsx'

const App = () => {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <Promo />
      <Benefits />
      <CardCustomizer />
      <FAQ />
      <Footer />
    </div>
  )
}

export default App

