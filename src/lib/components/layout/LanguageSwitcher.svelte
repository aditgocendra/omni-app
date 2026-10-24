<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import LanguagesIcon from "@lucide/svelte/icons/languages";
	import CheckIcon from "@lucide/svelte/icons/check";
	import { i18n, type Locale } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";

	let { class: className }: { class?: string } = $props();

	const languages: { code: Locale; label: string; flag: string }[] = [
		{ code: "en", label: "English", flag: "🇬🇧" },
		{ code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" }
	];

	function selectLanguage(code: Locale) {
		i18n.setLocale(code);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props }: { props: Record<string, unknown> })}
			<Button.Root
				{...props}
				variant="outline"
				size="sm"
				class={cn("flex items-center gap-1.5 h-9 rounded-lg border border-border/70 bg-white dark:bg-card px-2.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-muted shadow-xs transition-colors", className)}
			>
				<LanguagesIcon class="size-4 text-muted-foreground" />
				<span class="uppercase tracking-wider font-semibold">{i18n.locale}</span>
			</Button.Root>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-44 rounded-xl border border-border/80 p-1 shadow-lg">
		<DropdownMenu.Label class="px-2 py-1.5 text-xs text-muted-foreground font-medium">
			Language / Bahasa
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		{#each languages as lang (lang.code)}
			<DropdownMenu.Item
				onSelect={() => selectLanguage(lang.code)}
				class="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer"
			>
				<div class="flex items-center gap-2">
					<span class="text-base">{lang.flag}</span>
					<span>{lang.label}</span>
				</div>
				{#if i18n.locale === lang.code}
					<CheckIcon class="size-4 text-primary" />
				{/if}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
