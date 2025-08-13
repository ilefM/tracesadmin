import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
};

export const AuthContext = createContext<AuthContextType | null>(null);
