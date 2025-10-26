import React from 'react'
import Navbar from '../components/Navbar'
import LandingPage from '../components/LandingPage'
import Footer from '../components/Footer'

const MainPage = () => {
  return (
    <div className='w-full min-h-screen'>
      <Navbar/>
      <LandingPage />
      <Footer />
    </div>
  )
}

export default MainPage