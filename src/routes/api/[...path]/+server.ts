// @ts-nocheck
import type { RequestHandler } from './$types';

const BACKEND_URL =
	process.env.BACKEND_INTERNAL_URL ||
	process.env.BACKEND_URL ||
	'http://127.0.0.1:3000';

const isProduction = process.env.NODE_ENV === 'production';

async function proxyRequest(event: Parameters<RequestHandler>[0]) {
	const { request, params, url, cookies } = event;
	const targetPath = params.path;
	const targetUrl = new URL(`/api/${targetPath}${url.search}`, BACKEND_URL);

	// Prepare request headers to forward to Hono backend
	const forwardHeaders = new Headers();

	for (const [key, value] of request.headers.entries()) {
		// Omit hop-by-hop headers
		const lowerKey = key.toLowerCase();
		if (
			lowerKey === 'host' ||
			lowerKey === 'connection' ||
			lowerKey === 'content-length' ||
			lowerKey === 'keep-alive' ||
			lowerKey === 'transfer-encoding'
		) {
			continue;
		}
		forwardHeaders.set(key, value);
	}

	// Forward client cookies
	const cookieHeader = request.headers.get('cookie') || '';
	if (cookieHeader) {
		forwardHeaders.set('cookie', cookieHeader);
	}

	// Auto-inject Authorization header from access_token cookie if not explicitly provided
	const accessTokenCookie = cookies.get('access_token');
	if (!forwardHeaders.has('authorization') && accessTokenCookie) {
		forwardHeaders.set('authorization', `Bearer ${accessTokenCookie}`);
	}

	// Read body for mutation methods
	let body: ArrayBuffer | undefined = undefined;
	if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
		const arrayBuffer = await request.arrayBuffer();
		if (arrayBuffer.byteLength > 0) {
			body = arrayBuffer;
		}
	}

	try {
		const backendRes = await fetch(targetUrl.toString(), {
			method: request.method,
			headers: forwardHeaders,
			body,
			redirect: 'manual'
		});

		// Check for Set-Cookie headers from Hono (e.g. refresh_token)
		const setCookieHeaders = backendRes.headers.getSetCookie
			? backendRes.headers.getSetCookie()
			: [];

		for (const cookieStr of setCookieHeaders) {
			// Extract cookie name and value
			const [nameVal, ...attrs] = cookieStr.split(';');
			const [cookieName, ...cookieValParts] = nameVal.trim().split('=');
			const cookieValue = cookieValParts.join('=');

			if (cookieName) {
				cookies.set(cookieName, cookieValue, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: isProduction,
					maxAge: 7 * 24 * 60 * 60 // 7 days
				});
			}
		}

		// Read response body
		const responseData = await backendRes.arrayBuffer();

		// Check if this was a login or logout to manage cookies
		const pathname = url.pathname;
		if (backendRes.ok && pathname.endsWith('/auth/login')) {
			try {
				const text = new TextDecoder().decode(responseData);
				const json = JSON.parse(text);
				const accessToken = json.data?.accessToken;
				if (accessToken) {
					cookies.set('access_token', accessToken, {
						path: '/',
						httpOnly: true,
						sameSite: 'strict',
						secure: isProduction,
						maxAge: 15 * 60 // 15 minutes
					});
				}
			} catch {
				// Ignore parse error
			}
		} else if (backendRes.ok && pathname.endsWith('/auth/logout')) {
			cookies.delete('access_token', { path: '/' });
			cookies.delete('refresh_token', { path: '/' });
		} else if (backendRes.ok && pathname.endsWith('/auth/refresh')) {
			try {
				const text = new TextDecoder().decode(responseData);
				const json = JSON.parse(text);
				const accessToken = json.data?.accessToken;
				if (accessToken) {
					cookies.set('access_token', accessToken, {
						path: '/',
						httpOnly: true,
						sameSite: 'strict',
						secure: isProduction,
						maxAge: 15 * 60 // 15 minutes
					});
				}
			} catch {
				// Ignore parse error
			}
		}

		// Prepare response headers for the browser
		const clientHeaders = new Headers();
		const contentType = backendRes.headers.get('content-type');
		if (contentType) {
			clientHeaders.set('content-type', contentType);
		}

		return new Response(responseData, {
			status: backendRes.status,
			statusText: backendRes.statusText,
			headers: clientHeaders
		});
	} catch (err: unknown) {
		return new Response(
			JSON.stringify({
				success: false,
				message: 'Backend server is unreachable or offline.'
			}),
			{
				status: 502,
				headers: { 'content-type': 'application/json' }
			}
		);
	}
}

export const GET: RequestHandler = (event) => proxyRequest(event);
export const POST: RequestHandler = (event) => proxyRequest(event);
export const PUT: RequestHandler = (event) => proxyRequest(event);
export const PATCH: RequestHandler = (event) => proxyRequest(event);
export const DELETE: RequestHandler = (event) => proxyRequest(event);
export const OPTIONS: RequestHandler = (event) => proxyRequest(event);
