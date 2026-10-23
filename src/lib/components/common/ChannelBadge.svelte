<script lang="ts">
	import StoreIcon from "@lucide/svelte/icons/store";
	import ShoppingBagIcon from "@lucide/svelte/icons/shopping-bag";
	import VideoIcon from "@lucide/svelte/icons/video";
	import ShoppingCartIcon from "@lucide/svelte/icons/shopping-cart";
	import { cn } from "$lib/utils.js";
	import type { SalesChannelType } from "$lib/types/index.js";

	let {
		channel,
		showLabel = true,
		class: className
	}: {
		channel: SalesChannelType | string;
		showLabel?: boolean;
		class?: string;
	} = $props();

	const channelMeta = $derived.by(() => {
		switch (channel.toLowerCase()) {
			case "shopee":
				return {
					name: "Shopee",
					icon: ShoppingBagIcon,
					colors: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25"
				};
			case "tiktok":
				return {
					name: "TikTok Shop",
					icon: VideoIcon,
					colors: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
				};
			case "tokopedia":
				return {
					name: "Tokopedia",
					icon: ShoppingCartIcon,
					colors: "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-600/25"
				};
			case "offline":
			default:
				return {
					name: "Offline POS",
					icon: StoreIcon,
					colors: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25"
				};
		}
	});
</script>

<span
	class={cn(
		"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
		channelMeta.colors,
		className
	)}
>
	<channelMeta.icon class="size-3.5 shrink-0" />
	{#if showLabel}
		<span>{channelMeta.name}</span>
	{/if}
</span>
