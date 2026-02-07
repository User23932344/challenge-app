
import { useState } from 'react';
import { Header } from './Header'; 
import { Sidebar } from './Sidebar';
import styles from './Layout.module.scss';

interface LayoutProps {
    children: React.ReactNode;
  }
  
  export const Layout = ({ children }: LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
    return (
      <div className={styles.layout}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className={styles.content}>
          {children}
        </main>
      </div>
    );
  };