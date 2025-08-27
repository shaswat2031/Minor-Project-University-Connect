import { useEffect } from 'react';

const NotFound = () => {
  useEffect(() => {
    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://uniconnect.prasadshaswat.tech/';
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black">
      <div className="text-center bg-gray-800 p-8 rounded-lg shadow-xl border border-blue-500/30 max-w-md w-full">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404: NOT_FOUND</h1>
        <div className="mb-6 p-4 bg-gray-900 rounded-md border border-gray-700 text-left">
          <p className="text-gray-300 mb-2"><span className="text-gray-500">Code:</span> NOT_FOUND</p>
          <p className="text-gray-300 mb-2"><span className="text-gray-500">ID:</span> bom1::9sprb-1756318510583-ab297b477533</p>
        </div>
        <p className="text-gray-400 mb-6">The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
        <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
          <div className="absolute top-0 left-0 h-full bg-blue-500 animate-progress"></div>
        </div>
        <p className="text-blue-400">Redirecting to home page...</p>
      </div>
      
      {/* Add animation */}
      <style>{`
        @keyframes progress {
          0% { width: 0% }
          100% { width: 100% }
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
