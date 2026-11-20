import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
		isSetupRequired: locals.isSetupRequired ?? false
	};
};
