import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../services/firebase";
import { getMyPlayer, watchPlayer, type PlayerProfile } from "../services/api";

interface AuthState {
  user: User | null;
  player: PlayerProfile | null;
  loading: boolean;
  playerLoading: boolean;
  refreshPlayer: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  player: null,
  loading: true,
  playerLoading: false,
  refreshPlayer: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerLoading, setPlayerLoading] = useState(false);
  // Live listener on the signed-in player's doc (photo set in the app, etc.).
  const stopWatching = useRef<(() => void) | null>(null);

  function watch(p: PlayerProfile | null) {
    stopWatching.current?.();
    stopWatching.current = p ? watchPlayer(p.id, (fresh) => { if (fresh) setPlayer(fresh); }) : null;
  }

  async function fetchPlayer(uid: string) {
    setPlayerLoading(true);
    try {
      const p = await getMyPlayer(uid);
      setPlayer(p);
      watch(p);
    } catch {
      setPlayer(null);
      watch(null);
    } finally {
      setPlayerLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchPlayer(firebaseUser.uid);
      } else {
        setPlayer(null);
        watch(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      watch(null);
    };
  }, []);

  const refreshPlayer = async () => {
    if (user) await fetchPlayer(user.uid);
  };

  return (
    <AuthContext.Provider
      value={{ user, player, loading, playerLoading, refreshPlayer }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
