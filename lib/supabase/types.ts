export type WaitlistStatus = "pending" | "confirmed" | "unsubscribed" | "deleted";
export type WaitlistPlatform = "web" | "ios" | "android";

export interface WaitlistUser {
  id: string;
  email: string;
  platforms: WaitlistPlatform[] | null;
  interest: string | null;
  status: WaitlistStatus;
  referral_code: string;
  referred_by_user_id: string | null;
  referral_count: number;
  created_at: string;
  confirmed_at: string | null;
  consent_text_version: string;
  consent_at: string;
  consent_ip_hash: string | null;
  consent_user_agent_hash: string | null;
  updated_at: string;
}

export interface DoiToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface ReferralEvent {
  id: string;
  referrer_user_id: string;
  referred_user_id: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      waitlist_users: {
        Row: WaitlistUser;
        Insert: Omit<WaitlistUser, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<WaitlistUser>;
      };
      doi_tokens: {
        Row: DoiToken;
        Insert: Omit<DoiToken, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<DoiToken>;
      };
      referral_events: {
        Row: ReferralEvent;
        Insert: Omit<ReferralEvent, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<ReferralEvent>;
      };
    };
  };
}
