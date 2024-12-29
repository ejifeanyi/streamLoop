export interface User {
	id: string;
	email: string;
	name: string;
	picture?: string;
	googleId: string;
}

export interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: Error | null;
	login: () => void;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
}
