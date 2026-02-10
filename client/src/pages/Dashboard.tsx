//import { useState, useEffect } from 'react';
//import { challengesAPI } from '../api/challenges';
//import type { Challenge } from '../types';
import styles from './Dashboard.module.scss';
import { ChallengeCard } from '../components/features/ChallengeCard';

export const Dashboard = () => {
 /* const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
*/
const mockChallenge = {
    id: 1,
    title: "30 дней медитации",
    description: "Медитировать каждый день",
    type: "recurring" as const,
    status: "active" as const,
    role: "creator" as const,
    creator_id: 1,
    created_at: "2026-01-18",
    duration_days: 30
  };

  return (
    <div className={styles.container}>
      <h1>Dashboard</h1>
      <ul>
        <li><ChallengeCard challenge={mockChallenge}/></li>
      </ul>
    </div>
  );
};