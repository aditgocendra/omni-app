<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import Header from "$lib/components/layout/Header.svelte";
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset class="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
		<Header />
		<main class="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
