import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 text-white font-bold text-2xl mb-4">
            E
          </div>
          <h1 className="text-2xl font-bold gradient-text">Expensora</h1>
          <p className="text-dark-400 mt-1">Personal Finance Manager</p>
        </div>
        <div className="glass-card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
