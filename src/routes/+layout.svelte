<script lang="ts">
	import "./layout.css";
	import { ModeWatcher } from "mode-watcher";
	import type { LayoutProps } from "./$types";

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>Cronsyst</title>
</svelte:head>

<ModeWatcher defaultMode="light" track={true} />

{@render children()}
