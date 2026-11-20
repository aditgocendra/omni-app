// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

const BACKEND_URL =
	process.env.BACKEND_INTERNAL_URL ||
	process.env.BACKEND_URL ||
	'http://127.0.0.1:3000';

const isProduction = process.env.NODE_ENV === 'production';

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;

	// 1. Skip static assets, internal Vite/SvelteKit endpoints, and our own API proxy
	if (
		pathname.startsWith('/_app') ||
		pathname.startsWith('/@') ||
		pathname.startsWith('/api') ||
		pathname.includes('.')
	) {
		return resolve(event);
	}

	let backendAvailable = true;
	let isSetupRequired = false;

	// 2. Check System Startup Status
	try {
		const res = await event.fetch(`${BACKEND_URL}/api/v1/auth/startup-status`);
		if (res.ok) {
			const json = await res.json();
			isSetupRequired = json.data?.isSetupRequired ?? false;
			event.locals.isSetupRequired = isSetupRequired;

			if (isSetupRequired) {
				event.locals.user = null;
				event.locals.accessToken = null;
				if (pathname !== '/startup') {
					throw redirect(307, '/startup');
				}
				return resolve(event);
			}
		}
	} catch (err: unknown) {
		if (err && typeof err === 'object' && 'status' in err) {
			const status = (err as { status: unknown }).status;
			if (status === 307 || status === 308) {
				throw err;
			}
		}
		// If backend is unreachable, mark backend as offline
		backendAvailable = false;
	}

	// 3. Blind SSR: Session Verification & Refresh Token Rotation
	let accessToken = event.cookies.get('access_token');
	const refreshToken = event.cookies.get('refresh_token');
	let user = null;

	const fetchUserProfile = async (token: string) => {
		try {
			const res = await event.fetch(`${BACKEND_URL}/api/v1/auth/me`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			if (res.ok) {
				const json = await res.json();
				return json.data;
			}
		} catch {
			// Profile fetch failed
		}
		return null;
	};

	if (backendAvailable) {
		// Try active access token
		if (accessToken) {
			user = await fetchUserProfile(accessToken);
		}

		// If access token is expired/missing, but refresh token exists:
		// SvelteKit requests new token from Hono and updates browser cookie in one breath before rendering
		if (!user && refreshToken) {
			try {
				const refreshRes = await event.fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
					method: 'POST',
					headers: {
						Cookie: `refresh_token=${refreshToken}`
					}
				});

				if (refreshRes.ok) {
					const refreshJson = await refreshRes.json();
					const newAccessToken = refreshJson.data?.accessToken;

					// Extract rotated refresh token from Hono response cookies if present
					let newRefreshToken = refreshToken;
					const setCookieHeaders = refreshRes.headers.getSetCookie
						? refreshRes.headers.getSetCookie()
						: [];

					for (const sc of setCookieHeaders) {
						const match = sc.match(/refresh_token=([^;]+)/);
						if (match) {
							newRefreshToken = match[1];
							break;
						}
					}

					if (newAccessToken) {
						accessToken = newAccessToken;

						// Update browser cookies in response
						event.cookies.set('access_token', newAccessToken, {
							path: '/',
							httpOnly: true,
							sameSite: 'strict',
							secure: isProduction,
							maxAge: 15 * 60 // 15 mins
						});

						event.cookies.set('refresh_token', newRefreshToken, {
							path: '/',
							httpOnly: true,
							sameSite: 'strict',
							secure: isProduction,
							maxAge: 7 * 24 * 60 * 60 // 7 days
						});

						user = await fetchUserProfile(newAccessToken);
					}
				} else {
					// Invalid or revoked session -> clear cookies
					event.cookies.delete('access_token', { path: '/' });
					event.cookies.delete('refresh_token', { path: '/' });
				}
			} catch (e) {
				console.warn('SSR Token refresh failed:', e);
			}
		}
	}

	event.locals.user = user;
	event.locals.accessToken = accessToken || null;
	event.locals.isSetupRequired = isSetupRequired;

	// 4. Protected Route Guard (when backend is available and not in setup)
	if (backendAvailable && !isSetupRequired) {
		// When setup is completed, nobody should stay on /startup
		if (pathname === '/startup') {
			throw redirect(307, user ? '/' : '/sign-in');
		}

		const isAuthPage = pathname === '/sign-in';

		if (!user && !isAuthPage) {
			throw redirect(307, '/sign-in');
		}

		if (user && pathname === '/sign-in') {
			throw redirect(307, '/');
		}
	}

	return resolve(event);
};
