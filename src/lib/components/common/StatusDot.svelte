<script lang="ts">
	import { cn } from "$lib/utils.js";

	export type StatusType = "online" | "offline" | "busy" | "pending" | "resolved";

	let {
		status = "online",
		ping = false,
		class: className
	}: {
		status?: StatusType | string;
		ping?: boolean;
		class?: string;
	} = $props();

	const colorClass = $derived.by(() => {
		switch (status.toLowerCase()) {
			case "online":
			case "resolved":
				return "bg-emerald-500";
			case "busy":
				return "bg-rose-500";
			case "pending":
				return "bg-amber-500";
			default:
				return "bg-slate-400";
		}
	});
</script>

<span class={cn("relative flex size-2.5 items-center justify-center", className)}>
	{#if ping}
		<span class={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", colorClass)}></span>
	{/if}
	<span class={cn("relative inline-flex size-2 rounded-full", colorClass)}></span>
</span>
