/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const STATIC_CACHE = `pl-static-${version}`;
const ASSETS = [...build, ...files];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys
					.filter(
						(k) => k !== STATIC_CACHE && (k.startsWith('pl-static-') || k.startsWith('pl-runtime-'))
					)
					.map((k) => caches.delete(k))
			);
			await sw.clients.claim();
		})()
	);
});

function isApi(url: URL): boolean {
	return url.pathname.startsWith('/api/');
}

function isAsset(url: URL): boolean {
	return ASSETS.includes(url.pathname) || url.pathname.startsWith('/_app/');
}

sw.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;

	const url = new URL(req.url);
	if (url.origin !== sw.location.origin) return;

	if (isApi(url)) {
		event.respondWith(networkOnly(req, true));
		return;
	}

	if (isAsset(url)) {
		event.respondWith(cacheFirst(req));
		return;
	}

	event.respondWith(networkOnly(req, false));
});

async function cacheFirst(request: Request): Promise<Response> {
	const cached = await caches.match(request);
	if (cached) return cached;
	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(STATIC_CACHE);
			cache.put(request, response.clone());
		}
		return response;
	} catch (e) {
		return cached ?? Response.error();
	}
}

async function networkOnly(request: Request, apiRequest: boolean): Promise<Response> {
	try {
		return await fetch(request);
	} catch (e) {
		const message = 'Du bist offline. Bitte später erneut versuchen.';
		if (!apiRequest) {
			return new Response(message, {
				status: 503,
				headers: { 'content-type': 'text/plain; charset=utf-8' }
			});
		}
		return new Response(JSON.stringify({ message }), {
			status: 503,
			headers: { 'content-type': 'application/json; charset=utf-8' }
		});
	}
}
