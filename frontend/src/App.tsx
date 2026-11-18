import React from 'react';
import { TaskList } from './components';
import './styles/index.css';

export const App: React.FC = () => {
  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="app-title">📝 Task Management</h1>
            <p style={{ color: 'var(--color-gray-600)', margin: 0 }}>
              Stay organized and productive
            </p>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingBottom: 'var(--spacing-2xl)' }}>
        <TaskList />
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: 'var(--spacing-lg)',
          color: 'var(--color-gray-500)',
          fontSize: '0.875rem',
          borderTop: '1px solid var(--color-gray-200)',
          marginTop: 'var(--spacing-2xl)',
        }}
      >
        <p>&copy; 2024 Task Management Application. All rights reserved.</p>
      </footer>
    </div>
  );
};
