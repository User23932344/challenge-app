export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: string;
  }
  
  export interface Challenge {
    id: number;
    title: string;
    description?: string;
    type: 'one-time' | 'recurring';
    frequency?: string;
    duration_days?: number;
    target_value?: number;
    metric_unit?: string;
    stake_description?: string;
    creator_id: number;
    created_at: string;
    start_date?: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
  }
  
  export interface ChallengeParticipant {
    id: number;
    challenge_id: number;
    user_id: number;
    accepted_at?: string;
    role: 'creator' | 'participant';
  }
  
  export interface Progress {
    id: number;
    participant_id: number;
    date: string;
    completed: boolean;
    value?: number;
    note?: string;
    proof_url?: string;
    completed_at?: string;
  }
  
  export interface JwtPayload {
    userId: number;
    username: string;
  }