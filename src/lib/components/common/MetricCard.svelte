<script lang="ts">
	import type { Component } from "svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
	import TrendingDownIcon from "@lucide/svelte/icons/trending-down";
	import { cn } from "$lib/utils.js";

	let {
		title,
		value,
		description,
		trend = "neutral",
		trendValue,
		icon: IconComponent,
		class: className
	}: {
		title: string;
		value: string | number;
		description?: string;
		trend?: "up" | "down" | "neutral";
		trendValue?: string;
		icon?: Component<{ class?: string }>;
		class?: string;
	} = $props();
</script>

<Card.Root class={cn("overflow-hidden border border-border/80 bg-card p-5 shadow-xs transition-all hover:shadow-md", className)}>
	<div class="flex items-start justify-between gap-4">
		<div class="space-y-1">
			<p class="text-xs font-medium tracking-wider text-muted-foreground uppercase">{title}</p>
			<h3 class="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">{value}</h3>
		</div>
		{#if IconComponent}
			<div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
				<IconComponent class="size-5.5" />
			</div>
		{/if}
	</div>

	{#if description || trendValue}
		<div class="mt-4 flex items-center gap-2 text-xs">
			{#if trendValue}
				<span
					class={cn(
						"inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
						trend === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
						trend === "down" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
						trend === "neutral" && "bg-slate-500/10 text-muted-foreground"
					)}
				>
					{#if trend === "up"}
						<TrendingUpIcon class="size-3" />
					{:else if trend === "down"}
						<TrendingDownIcon class="size-3" />
					{/if}
					<span>{trendValue}</span>
				</span>
			{/if}
			{#if description}
				<span class="truncate text-muted-foreground">{description}</span>
			{/if}
		</div>
	{/if}
</Card.Root>
