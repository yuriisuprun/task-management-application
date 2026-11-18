import React from 'react';
import { TaskList } from './components';
import './styles/index.css';

export const App: React.FC = () => {
  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="app-title">Task Management</h1>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingBottom: 'var(--spacing-2xl)', paddingTop: 'var(--spacing-2xl)' }}>
        <TaskList />
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: 'var(--spacing-xl)',
          color: 'var(--color-gray-500)',
          fontSize: '0.875rem',
          borderTop: '1px solid var(--color-gray-200)',
          marginTop: 'var(--spacing-3xl)',
          background: 'linear-gradient(135deg, var(--color-white) 0%, var(--color-gray-50) 100%)',
          fontWeight: 500,
        }}
      >
        <p>&copy; {new Date().getFullYear()} Task Management Application. All rights reserved.</p>
      </footer>
    </div>
  );
};
