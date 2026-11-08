import type { UserRecord } from "$lib/types/index.js";

const isBrowser = typeof window !== "undefined";

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: string;
	avatar?: string;
	phone?: string;
	storeName?: string;
}

export interface SuperAdminSetupData {
	storeName: string;
	fullName: string;
	email: string;
	phone: string;
	password: string;
}

export const DEMO_ACCOUNTS: Record<string, { user: AuthUser; password: string }> = {
	superAdmin: {
		user: {
			id: "usr-admin-1",
			name: "Adit Gocendra",
			email: "admin@cronsyst.com",
			role: "Super Admin",
			phone: "+62 812-3456-7890",
			storeName: "Cronsyst Omnichannel ID",
			avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
		},
		password: "password123",
	},
	warehouseManager: {
		user: {
			id: "usr-wh-1",
			name: "Budi Santoso",
			email: "budi.santoso@cronsyst.com",
			role: "Warehouse Manager",
			phone: "+62 813-8899-5678",
			storeName: "Cronsyst Omnichannel ID",
			avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
		},
		password: "password123",
	},
	cashier: {
		user: {
			id: "usr-cashier-1",
			name: "Rina Wijaya",
			email: "rina.cashier@cronsyst.com",
			role: "Cashier",
			phone: "+62 815-1234-9988",
			storeName: "Cronsyst Omnichannel ID",
			avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
		},
		password: "password123",
	},
};

class AuthStore {
	#isInitialized = $state<boolean>(false);
	#currentUser = $state<AuthUser | null>(null);
	#superAdmin = $state<SuperAdminSetupData | null>(null);

	constructor() {
		if (isBrowser) {
			const initSaved = localStorage.getItem("cronsyst_is_initialized");
			this.#isInitialized = initSaved === "true";

			const adminSaved = localStorage.getItem("cronsyst_super_admin");
			if (adminSaved) {
				try {
					this.#superAdmin = JSON.parse(adminSaved);
				} catch {
					this.#superAdmin = null;
				}
			}

			const userSaved = localStorage.getItem("cronsyst_auth_user");
			if (userSaved) {
				try {
					this.#currentUser = JSON.parse(userSaved);
				} catch {
					this.#currentUser = null;
				}
			}
		}
	}

	get isInitialized(): boolean {
		return this.#isInitialized;
	}

	get currentUser(): AuthUser | null {
		return this.#currentUser;
	}

	get superAdmin(): SuperAdminSetupData | null {
		return this.#superAdmin;
	}

	setupSuperAdmin(data: SuperAdminSetupData): AuthUser {
		const newAdminUser: AuthUser = {
			id: "usr-super-admin",
			name: data.fullName,
			email: data.email,
			role: "Super Admin",
			phone: data.phone,
			storeName: data.storeName,
			avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
		};

		this.#superAdmin = data;
		this.#isInitialized = true;
		this.#currentUser = newAdminUser;

		if (isBrowser) {
			localStorage.setItem("cronsyst_is_initialized", "true");
			localStorage.setItem("cronsyst_super_admin", JSON.stringify(data));
			localStorage.setItem("cronsyst_auth_user", JSON.stringify(newAdminUser));
		}

		return newAdminUser;
	}

	login(email: string, pass: string): { success: boolean; user?: AuthUser; message?: string } {
		const cleanEmail = email.trim().toLowerCase();

		// Check if matches created Super Admin
		if (this.#superAdmin && this.#superAdmin.email.toLowerCase() === cleanEmail) {
			if (this.#superAdmin.password === pass) {
				const user: AuthUser = {
					id: "usr-super-admin",
					name: this.#superAdmin.fullName,
					email: this.#superAdmin.email,
					role: "Super Admin",
					phone: this.#superAdmin.phone,
					storeName: this.#superAdmin.storeName,
					avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
				};
				this.#currentUser = user;
				if (isBrowser) {
					localStorage.setItem("cronsyst_auth_user", JSON.stringify(user));
				}
				return { success: true, user };
			}
			return { success: false, message: "Incorrect password." };
		}

		// Check demo accounts
		for (const key of Object.keys(DEMO_ACCOUNTS)) {
			const item = DEMO_ACCOUNTS[key];
			if (item.user.email.toLowerCase() === cleanEmail) {
				if (item.password === pass) {
					this.#currentUser = item.user;
					if (isBrowser) {
						localStorage.setItem("cronsyst_auth_user", JSON.stringify(item.user));
					}
					return { success: true, user: item.user };
				}
				return { success: false, message: "Incorrect password." };
			}
		}

		// Fallback for any password123 with a standard email format to assist preview
		if (pass === "password123" && cleanEmail.includes("@")) {
			const fallbackUser: AuthUser = {
				id: `usr-${Date.now()}`,
				name: cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
				email: cleanEmail,
				role: "Super Admin",
				storeName: "Cronsyst Retail Store",
				avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
			};
			this.#currentUser = fallbackUser;
			if (isBrowser) {
				localStorage.setItem("cronsyst_auth_user", JSON.stringify(fallbackUser));
			}
			return { success: true, user: fallbackUser };
		}

		return { success: false, message: "User not found or invalid credentials." };
	}

	quickDemoLogin(roleKey: "superAdmin" | "warehouseManager" | "cashier"): AuthUser {
		const target = DEMO_ACCOUNTS[roleKey] || DEMO_ACCOUNTS.superAdmin;
		this.#currentUser = target.user;
		if (isBrowser) {
			localStorage.setItem("cronsyst_is_initialized", "true");
			localStorage.setItem("cronsyst_auth_user", JSON.stringify(target.user));
		}
		return target.user;
	}

	logout() {
		this.#currentUser = null;
		if (isBrowser) {
			localStorage.removeItem("cronsyst_auth_user");
		}
	}
}

export const authStore = new AuthStore();

