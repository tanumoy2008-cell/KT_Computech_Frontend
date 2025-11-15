import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div 
          className={`${sizeClasses[size] || sizeClasses['md']} rounded-full border-t-2 border-b-2 border-gray-200`}
        ></div>
        <div 
          className={`${sizeClasses[size] || sizeClasses['md']} absolute top-0 left-0 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin`}
        ></div>
      </div>
    </div>
  );
};

export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50">
    <Loader size="lg" />
    {message && (
      <p className="mt-4 text-gray-600 text-sm font-medium">
        {message}
      </p>
    )}
  </div>
);

export const ButtonLoader = () => (
  <div className="flex items-center justify-center">
    <Loader size="sm" className="mr-2" />
    <span>Processing...</span>
  </div>
);

export default Loader;
