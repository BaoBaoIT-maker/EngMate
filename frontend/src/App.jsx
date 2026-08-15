import React from 'react';
import AppRouter from './router';
import AuthInitializer from './components/AuthInitializer';
import SplashScreen from './components/common/SplashScreen';

function App() {
  return (
    <AuthInitializer>
      <div className="min-h-screen">
        <SplashScreen />
        <AppRouter />
      </div>
    </AuthInitializer>
  );
}

export default App;
