
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.scss';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    return (
        <>

            <aside className={isOpen ? styles.sidebarOpen : styles.sidebarClosed}>
                <nav>
                    <Link className={styles.link} to="/dashboard" onClick={onClose}>Dashboard</Link>
                    <Link className={styles.link} to="/challenges" onClick={onClose}>Мои челленджи</Link>
                    <Link className={styles.link} to="/challenges/create" onClick={onClose}>Создать челлендж</Link>
                    <Link className={styles.link} to="/profile" onClick={onClose}>Профиль</Link>
                </nav>
            </aside>

            {isOpen && <div className={styles.overlay} onClick={onClose} />}
        </>
    );
}