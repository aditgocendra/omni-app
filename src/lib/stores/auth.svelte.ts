import {
	type BackendUser,
	type StartupStatusData,
	type LoginResponseData,
	type RegisterRequestPayload,
	type LoginRequestPayload,
	type ApiResponse,
	isApiSuccess,
	extractApiErrorMessage,
	extractUnknownErrorMessage,
} from "$lib/types/api.js";

const isBrowser = typeof window !== "undefined";
const API_BASE = "/api/v1";

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: string;
	avatar?: string;
	phone?: string;
}

export interface SuperAdminSetupData {
	fullName: string;
	username: string;
	email: string;
	phone: string;
	password: string;
}

export type StartupStatus = StartupStatusData;

export interface RegisterResult {
	success: boolean;
	message?: string;
	data?: BackendUser;
}

export interface LoginResult {
	success: boolean;
	user?: AuthUser;
	message?: string;
}

class AuthStore {
	#isInitialized = $state<boolean>(false);
	#isStartupChecked = $state<boolean>(false);
	#isSetupRequired = $state<boolean>(false);
	#currentUser = $state<AuthUser | null>(null);

	constructor() {
		if (isBrowser) {
			// Security & Privacy Cleanup:
			// Remove any legacy sensitive tokens and user identity from localStorage.
			// Authentication state is strictly managed in-memory and via HttpOnly Cookies.
			try {
				localStorage.removeItem("cronsyst_access_token");
				localStorage.removeItem("cronsyst_auth_user");
				localStorage.removeItem("cronsyst_super_admin");
				localStorage.removeItem("cronsyst_is_initialized");
			} catch {
				// Ignore if storage access is restricted
			}
		}
	}

	get isInitialized(): boolean {
		return this.#isInitialized;
	}

	get isStartupChecked(): boolean {
		return this.#isStartupChecked;
	}

	get isSetupRequired(): boolean {
		return this.#isSetupRequired;
	}

	get currentUser(): AuthUser | null {
		return this.#currentUser;
	}

	setSetupRequired(val: boolean): void {
		this.#isSetupRequired = val;
		this.#isInitialized = !val;
		this.#isStartupChecked = true;
		if (val) {
			this.#currentUser = null;
		}
	}

	setCurrentUser(user: AuthUser | null): void {
		this.#currentUser = user;
		if (user) {
			this.#isInitialized = true;
			this.#isSetupRequired = false;
			this.#isStartupChecked = true;
		}
	}

	/**
	 * Check with backend whether startup is required (database has 0 users)
	 */
	async checkStartupStatus(): Promise<StartupStatus> {
		try {
			const res = await fetch(`${API_BASE}/auth/startup-status`);
			if (res.ok) {
				const json = (await res.json().catch(() => null)) as ApiResponse<StartupStatusData> | null;
				if (json && isApiSuccess(json)) {
					const status: StartupStatus = json.data;
					this.#isSetupRequired = status.isSetupRequired;
					this.#isInitialized = !status.isSetupRequired;
					this.#isStartupChecked = true;
					return status;
				}
			}
		} catch (err: unknown) {
			console.warn("Could not reach backend startup-status API, falling back to local state:", extractUnknownErrorMessage(err));
		}

		// Fallback to local state if backend is offline
		const fallbackStatus: StartupStatus = {
			isSetupRequired: !this.#isInitialized,
			hasSuperAdmin: this.#isInitialized,
			userCount: this.#isInitialized ? 1 : 0,
		};
		this.#isSetupRequired = fallbackStatus.isSetupRequired;
		this.#isStartupChecked = true;
		return fallbackStatus;
	}

	/**
	 * Register Super Admin on backend b-app with role: SUPER_ADMIN
	 */
	async registerSuperAdmin(data: SuperAdminSetupData): Promise<RegisterResult> {
		const payload: RegisterRequestPayload = {
			email: data.email.trim(),
			username: data.username.trim(),
			fullName: data.fullName.trim() || undefined,
			password: data.password,
			phoneNumber: data.phone.trim() || undefined,
			role: "SUPER_ADMIN",
		};

		try {
			const res = await fetch(`${API_BASE}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const json = (await res.json().catch(() => null)) as ApiResponse<BackendUser> | null;

			if (!res.ok || !json || !isApiSuccess(json)) {
				const message = extractApiErrorMessage(json, "Failed to register Super Admin on backend.");
				return {
					success: false,
					message,
				};
			}

			// Mark setup as completed
			this.setSetupRequired(false);

			// Automatically login
			await this.login(data.email, data.password);

			return {
				success: true,
				data: json.data,
			};
		} catch (err: unknown) {
			const message = extractUnknownErrorMessage(err, "An unexpected error occurred during initialization.");
			console.error("Backend registration error:", message);
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Authenticate user via backend login endpoint
	 */
	async login(email: string, pass: string): Promise<LoginResult> {
		const payload: LoginRequestPayload = {
			email: email.trim().toLowerCase(),
			password: pass,
		};

		try {
			const res = await fetch(`${API_BASE}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const json = (await res.json().catch(() => null)) as ApiResponse<LoginResponseData> | null;

			if (res.ok && json && isApiSuccess(json)) {
				const backendUser = json.data.user;
				const user: AuthUser = {
					id: backendUser.id,
					name: backendUser.fullName || backendUser.username,
					email: backendUser.email,
					role: backendUser.role === "SUPER_ADMIN" ? "Super Admin" : backendUser.role,
					phone: backendUser.phoneNumber || undefined,
					avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
				};

				this.#currentUser = user;
				return { success: true, user };
			}

			const message = extractApiErrorMessage(json, "Invalid email or password.");
			return {
				success: false,
				message,
			};
		} catch (err: unknown) {
			const message = extractUnknownErrorMessage(err, "Unable to connect to authentication server. Please try again later.");
			console.error("Backend login error:", message);
			return {
				success: false,
				message: "Unable to connect to authentication server. Please try again later.",
			};
		}
	}

	async logout(): Promise<void> {
		this.#currentUser = null;
		if (isBrowser) {
			try {
				localStorage.removeItem("cronsyst_auth_user");
				localStorage.removeItem("cronsyst_access_token");
				localStorage.removeItem("cronsyst_super_admin");
				localStorage.removeItem("cronsyst_is_initialized");
			} catch {
				// Ignore
			}
			try {
				await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
			} catch {
				// Ignore if offline
			}
		}
	}
}

export const authStore = new AuthStore();
