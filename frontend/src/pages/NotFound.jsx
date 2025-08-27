import React, { useEffect } from 'react';

const NotFound = () => {
  useEffect(() => {
    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://uniconnect.prasadshaswat.tech/';
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h1>404: NOT_FOUND</h1>
      <p>Code: NOT_FOUND</p>
      <p>ID: bom1::7rhk7-1756314796099-e669db350c64</p>
      <p>Read our documentation to learn more about this error.</p>
      <p>If not found, you will be redirected shortly...</p>
    </div>
  );
};

export default NotFound;
