export interface User {
    id: number;
    username: string;
    email: string;
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
    role?: 'creator' | 'participant';
    accepted_at?: string;
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
  
  export interface Notification {
    id: number;
    user_id: number;
    type: 'challenge_invite' | 'challenge_accepted' | 'progress_marked' | 'comment_added';
    title: string;
    message: string;
    challenge_id?: number;
    progress_id?: number;
    from_user_id?: number;
    from_username?: string;
    is_read: boolean;
    created_at: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
  }