import React from 'react';

const PageLoader = ({ message = 'Loading financial insights...' }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-slate-950 min-h-[400px]">
      <div className="text-center">
        <div className="relative h-12 w-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400 tracking-wide">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;
