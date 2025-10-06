interface AuthProviderProps {
  children: React.ReactNode;
}

// AuthProvider no longer performs initialization — PersistLogin is responsible for
// performing silent refresh and populating auth. This avoids race conditions.
export default function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}
