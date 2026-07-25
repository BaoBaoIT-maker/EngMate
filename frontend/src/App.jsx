import React from 'react';
import AppRouter from './router';
import AuthInitializer from './components/AuthInitializer';

function App() {
  return (
    <AuthInitializer>
      <div className="min-h-screen">
        <AppRouter />
      </div>
    </AuthInitializer>
  );
}

export default App;
