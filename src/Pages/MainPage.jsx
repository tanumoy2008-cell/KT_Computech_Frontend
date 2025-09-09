import React from 'react'
import Navbar from '../components/Navbar'
import LandingPage from '../components/LandingPage'
import ProductSection from '../components/ProductSection'
import Footer from '../components/Footer'

const MainPage = () => {
  return (
    <div className='w-full min-h-screen'>
      <Navbar/>
      <LandingPage />
      <ProductSection />
      <Footer />
    </div>
  )
}

export default MainPage