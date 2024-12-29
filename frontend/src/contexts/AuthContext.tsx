import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface User {
	id: string;
	name: string;
	email: string;
	picture?: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	login: () => void;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const checkAuth = async () => {
		try {
			const response = await fetch("http://localhost:5000/auth/status", {
				credentials: "include",
			});
			const data = await response.json();

			if (data.authenticated) {
				setUser(data.user);
			} else {
				setUser(null);
			}
		} catch (err) {
			setError("Authentication check failed");
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	const login = () => {
		window.location.href = "http://localhost:5000/auth/google";
	};

	const logout = async () => {
		try {
			await fetch("http://localhost:5000/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			setUser(null);
		} catch (err) {
			setError("Logout failed");
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, error, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
