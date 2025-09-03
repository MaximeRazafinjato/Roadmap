import { Outlet, Link, useLocation } from 'react-router-dom';
import { useHealth } from '../hooks/use-health';

const Layout = () => {
  const location = useLocation();
  const { data: health, isLoading } = useHealth();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>FtelMap</h1>
        </div>
        <ul className="nav-links">
          <li>
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/projects" 
              className={isActive('/projects') ? 'active' : ''}
            >
              Projects
            </Link>
          </li>
        </ul>
        <div className="nav-status">
          {isLoading ? (
            <span className="status-indicator loading">Checking...</span>
          ) : health?.services.database === 'Connected' ? (
            <span className="status-indicator connected">Connected</span>
          ) : (
            <span className="status-indicator disconnected">Disconnected</span>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;