<script lang="ts">
	import "./layout.css";
	import { ModeWatcher } from "mode-watcher";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { authStore } from "$lib/stores/auth.svelte.js";
	import { onMount } from "svelte";
	import type { LayoutProps } from "./$types";

	let { data, children }: LayoutProps = $props();

	// Guard: Determine if system startup is required
	const isSetupRequired = $derived.by(() => {
		if (authStore.isStartupChecked) {
			return authStore.isSetupRequired;
		}
		return data?.isSetupRequired ?? false;
	});

	// Guard: Determine if the current route is allowed to be rendered
	const isAllowed = $derived.by(() => {
		const pathname = page.url.pathname;

		if (isSetupRequired) {
			return pathname === "/startup";
		}

		if (pathname === "/startup") {
			return false;
		}

		const hasUser = Boolean(authStore.currentUser || data?.user);

		if (!hasUser && pathname !== "/sign-in") {
			return false;
		}

		if (hasUser && pathname === "/sign-in") {
			return false;
		}

		return true;
	});

	onMount(async () => {
		if (data?.isSetupRequired !== undefined) {
			authStore.setSetupRequired(data.isSetupRequired);
		} else {
			await authStore.checkStartupStatus();
		}
	});

	// Sync auth store with server data
	$effect(() => {
		if (data?.user) {
			authStore.setCurrentUser({
				id: data.user.id || data.user.sub || "usr-1",
				name: data.user.fullName || data.user.username || "User",
				email: data.user.email,
				role: data.user.role === "SUPER_ADMIN" ? "Super Admin" : data.user.role,
				phone: data.user.phoneNumber || undefined,
			});
		} else {
			authStore.setCurrentUser(null);
		}
	});

	// Evaluate client-side route redirects
	$effect(() => {
		const pathname = page.url.pathname;
		const setupRequired = isSetupRequired;
		const hasUser = Boolean(authStore.currentUser || data?.user);

		if (setupRequired) {
			if (pathname !== "/startup") {
				goto("/startup");
			}
		} else {
			if (pathname === "/startup") {
				goto(hasUser ? "/" : "/sign-in");
			} else if (!hasUser && pathname !== "/sign-in") {
				goto("/sign-in");
			} else if (hasUser && pathname === "/sign-in") {
				goto("/");
			}
		}
	});
</script>

<svelte:head>
	<title>Cronsyst</title>
</svelte:head>

<ModeWatcher defaultMode="light" track={true} />

{#if isAllowed}
	{@render children()}
{/if}
