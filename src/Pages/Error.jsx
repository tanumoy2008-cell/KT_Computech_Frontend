import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Add these styles to your global CSS or in a style tag
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(2deg); }
  }
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 15s ease infinite;
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
  
  .text-gradient {
    background: linear-gradient(45deg, #006045, #004d38, #008060);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    animation: gradient 8s ease infinite;
  }
`;

const errorMessages = {
  401: {
    title: 'Access Denied',
    message: 'Please log in to access your account.',
    emoji: '🔒',
    buttonText: 'Login to Your Account',
    redirectTo: '/login'
  },
  403: {
    title: 'Restricted Area',
    message: 'You need special permission to view this page.',
    emoji: '🚫',
    buttonText: 'Back to Store',
    redirectTo: '/'
  },
  404: {
    title: 'Page Not Found',
    message:
      "We couldn’t find the page you’re looking for. But we’ve got plenty of good stuff waiting for you.",
    emoji: '📦',
    buttonText: 'Browse Our Collection',
    redirectTo: '/'
  },
  500: {
    title: 'Something Went Wrong',
    message: 'Our team has been notified. Please try again in a moment.',
    emoji: '🛠️',
    buttonText: 'Refresh Page',
    redirectTo: '/'
  },
  default: {
    title: 'Oops!',
    message: 'Something unexpected happened. Our team is on it!',
    emoji: '⚠️',
    buttonText: 'Back to Home',
    redirectTo: '/'
  }
};

const quickLinks = [
  { label: 'Go to Homepage', path: '/' },
  { label: 'Browse Products', path: '/product/all' },
  { label: 'Contact Support', path: '/contact' }
];

const Error = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorCode, setErrorCode] = useState(404);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code') || 404;
    const parsed = parseInt(code, 10);
    setErrorCode(parsed in errorMessages ? parsed : 'default');
  }, [location]);

  const { title, message, emoji, buttonText, redirectTo } =
    errorMessages[errorCode] || errorMessages.default;

  const handleAction = () => {
    if (errorCode === 401) {
      navigate('/login', { state: { from: location.pathname } });
    } else {
      navigate(redirectTo);
    }
  };

  // Add styles to the document head once
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.25
      }
    }
  };

  const itemVariants = {
    hidden: { y: 18, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-400 to-[#afafafbe] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-[#006045] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            x: [0, 30, 0],
            y: [0, -40, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute top-1/2 right-0 w-[32rem] h-[32rem] bg-[#004d38] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            rotate: [0, -15, 0]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: 5
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[28rem] h-[28rem] bg-[#008060] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            rotate: [0, 20, 0]
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: 10
          }}
        />
      </div>

      {/* Main glass card */}
      <motion.div
        className="relative glass-effect rounded-3xl shadow-2xl p-8 max-w-xl w-full mx-4 overflow-hidden border border-white/40"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Top accent bar */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#006045] via-[#008060] to-[#004d38]"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />

        <motion.div
          className="relative text-center pt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Emoji / icon block */}
          <motion.div
            className="inline-block p-6 mb-6 rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-lg border border-white/50"
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <motion.div
              className="text-6xl md:text-7xl"
              animate={{
                y: [0, -8, 0],
                rotate: [0, 4, -4, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut'
              }}
            >
              {emoji}
            </motion.div>
          </motion.div>

          {/* Title & message */}
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-gradient mb-2 leading-18 tracking-tight"
            variants={itemVariants}
          >
            {title}
          </motion.h1>

          <motion.p
            className="text-gray-600 mb-2 text-base md:text-lg leading-relaxed max-w-md mx-auto"
            variants={itemVariants}
          >
            {message}
          </motion.p>

          <motion.p
            className="text-xs md:text-sm text-gray-500 mb-8"
            variants={itemVariants}
          >
            Looks like you took a wrong turn. Let’s get you back to something
            interesting ✨
          </motion.p>

          {/* Primary & secondary actions */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
          >
            <motion.button
              onClick={handleAction}
              className="group w-full bg-gradient-to-r from-[#006045] to-[#008060] hover:from-[#004d38] hover:to-[#006045] text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-500 flex items-center justify-center space-x-3 relative overflow-hidden"
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                boxShadow:
                  '0 18px 35px -16px rgba(0, 0, 0, 0.35), 0 10px 15px -10px rgba(0, 0, 0, 0.15)'
              }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10 font-semibold">{buttonText}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 relative z-10 transition-transform duration-500 group-hover:translate-x-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <motion.span
                className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  transition: { duration: 0.3 }
                }}
              />
            </motion.button>

            <motion.button
              onClick={() => window.history.back()}
              className="group text-[#006045] hover:text-[#004d38] font-medium flex items-center justify-center mx-auto transition-colors duration-300"
              variants={itemVariants}
              whileHover={{ x: -2 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5 transition-transform duration-300 group-hover:-translate-x-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="relative">
                Go back
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#006045]"
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              </span>
            </motion.button>
          </motion.div>

          {/* Quick links section */}
          <motion.div
            className="mt-8 pt-5 border-t border-gray-900/70 text-left"
            variants={itemVariants}
          >
            <p className="text-xs uppercase tracking-[0.15em] text-gray-600 mb-3">
              QUICK LINKS
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickLinks.map((link, idx) => (
                <motion.button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="text-xs md:text-sm px-3.5 py-2 rounded-full bg-white/70 hover:bg-white shadow-sm hover:shadow-md border border-gray-100/80 text-gray-700 flex items-center gap-1.5 transition-all"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#008060] animate-pulse" />
                  {link.label}
                </motion.button>
              ))}
            </div>

            <div className="mt-6 text-xs md:text-sm text-gray-500 text-center">
              <p className="inline-flex items-center space-x-2">
                <span className="text-black">Error code:</span>
                <span className="font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-[40px] md:text-base font-mono tracking-wider">
                  {errorCode}
                </span>
              </p>
              <p className="mt-3">
                Need assistance?{' '}
                <button
                  className="text-[#006045] hover:text-[#004d38] font-medium hover:underline underline-offset-4 decoration-1 decoration-[#006045]/50 transition-all duration-300"
                  onClick={() => navigate('/contact')}
                >
                  Contact our support team
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Error;
