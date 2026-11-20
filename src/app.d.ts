// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id?: string;
				sub?: string;
				email: string;
				username: string;
				fullName?: string | null;
				phoneNumber?: string | null;
				role: string;
			} | null;
			accessToken: string | null;
			isSetupRequired?: boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
