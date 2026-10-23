<script lang="ts">
	import { toggleMode, mode } from "mode-watcher";
	import * as Button from "$lib/components/ui/button/index.js";
	import SunIcon from "@lucide/svelte/icons/sun";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import { cn } from "$lib/utils.js";

	let { class: className }: { class?: string } = $props();
</script>

<Button.Root
	variant="ghost"
	size="icon"
	onclick={toggleMode}
	class={cn("relative size-9 rounded-lg border border-border/70 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted text-foreground shadow-xs transition-all", className)}
	aria-label="Toggle theme"
>
	<SunIcon class="size-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
	<MoonIcon class="absolute size-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
	<span class="sr-only">Toggle theme</span>
</Button.Root>
