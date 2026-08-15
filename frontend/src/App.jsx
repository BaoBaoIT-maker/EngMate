import React from 'react';
import AppRouter from './router';
import AuthInitializer from './components/AuthInitializer';
import SplashScreen from './components/common/SplashScreen';

function App() {
  return (
    <>
      {/* SplashScreen nằm NGOÀI AuthInitializer để luôn được mount */}
      {/* dù AuthInitializer chưa render children (return null khi chưa ready) */}
      <SplashScreen />
      <AuthInitializer>
        <div className="min-h-screen">
          <AppRouter />
        </div>
      </AuthInitializer>
    </>
  );
}

export default App;
