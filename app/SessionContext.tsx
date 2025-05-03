import { createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";

interface SessionContextType {
  session: Session | null;
}

export const SessionContext = createContext<SessionContextType>({
  session: null,
});

export function useSessionContext() {
  return useContext(SessionContext);
}
