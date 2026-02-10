import type { Challenge } from '../../types';
import styles from './ChallengeCard.module.scss';

interface ChallengeCardProps {
  challenge: Challenge;
}

export const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  return (
    <div className={styles.challenge}>
      <div className={styles.header}>
        <h3 className={styles.title}>{challenge.title}</h3>
        <span className={`${styles.badge} ${styles[challenge.status]}`}>
          {challenge.status}
        </span>
      </div>

      {challenge.description && (
        <p className={styles.description}>{challenge.description}</p>
      )}

      <div className={styles.meta}>
        <span className={styles.type}>
          {challenge.type === 'one-time' ? '🎯 Разовый' : '🔄 Повторяющийся'}
        </span>
        {challenge.duration_days && (
          <span className={styles.duration}>{challenge.duration_days} дней</span>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.role}>
          {challenge.role === 'creator' ? '👑 Создатель' : '👤 Участник'}
        </span>
        <span className={styles.date}>
          {new Date(challenge.created_at).toLocaleDateString('ru-RU')}
        </span>
      </div>
    </div>
  );
};