import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

import styles from './Header.module.scss';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header = ({onMenuClick}:HeaderProps) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((store) => store.logout);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <button onClick={onMenuClick} className={styles.menu}>☰</button>
                <h1 className={styles.title}>Challenge Tracker</h1>
            </div>

            <div className={styles.right}>
                <span className={styles.username}> Привет, {user?.username}!</span>
                <button onClick={handleLogout} className={styles.logout}>Выйти</button>
            </div>
        </header>
    );
}