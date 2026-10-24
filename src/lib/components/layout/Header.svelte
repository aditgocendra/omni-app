<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import * as Separator from "$lib/components/ui/separator/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import SearchIcon from "@lucide/svelte/icons/search";
	import BellIcon from "@lucide/svelte/icons/bell";
	import LanguageSwitcher from "$lib/components/layout/LanguageSwitcher.svelte";
	import ThemeToggle from "$lib/components/layout/ThemeToggle.svelte";
	import { t } from "$lib/i18n/index.js";
	import { page } from "$app/state";

	const currentPath = $derived(page.url.pathname);
	const isRoot = $derived(currentPath === "/");

	const breadcrumbItems = $derived.by(() => {
		if (isRoot) return [];

		if (currentPath.startsWith("/inventory")) {
			let subPage = t("nav.warehouse");
			if (currentPath.startsWith("/inventory/stock-transfer")) {
				subPage = t("nav.stockTransfer");
			} else if (currentPath.startsWith("/inventory/stock-opname")) {
				subPage = t("nav.stockOpname");
			} else if (currentPath.startsWith("/inventory/warehouse")) {
				subPage = t("nav.warehouse");
			}
			return [
				{ label: t("nav.inventory"), href: "/inventory/warehouse" },
				{ label: subPage },
			];
		}

		if (currentPath.startsWith("/user")) {
			let subPage = t("nav.manageUser");
			return [
				{ label: t("nav.user"), href: "/user/manage" },
				{ label: subPage },
			];
		}

		if (currentPath.startsWith("/settings")) {
			let subPage = t("nav.general");
			if (currentPath.startsWith("/settings/account")) {
				subPage = t("nav.account");
			} else if (currentPath.startsWith("/settings/notifications")) {
				subPage = t("nav.notifications");
			} else if (currentPath.startsWith("/settings/general")) {
				subPage = t("nav.general");
			}
			return [
				{ label: t("nav.settings"), href: "/settings/general" },
				{ label: subPage },
			];
		}

		return [{ label: t("common.dashboardTitle") }];
	});
</script>

<header
	class="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-md transition-[width,height] ease-linear"
>
	<div class="flex items-center gap-3">
		<Sidebar.Trigger
			class="-ms-1 size-9 dark:bg-card text-foreground hover:bg-slate-50 dark:hover:bg-muted transition-colors"
		/>
		<Separator.Root orientation="vertical" class="h-4 bg-border/80" />
		<Breadcrumb.Root class="hidden sm:block">
			<Breadcrumb.List>
				<Breadcrumb.Item>
					{#if isRoot}
						<Breadcrumb.Page
							class="text-xs font-semibold text-foreground"
						>
							{t("common.dashboardTitle")}
						</Breadcrumb.Page>
					{:else}
						<Breadcrumb.Link
							href="/"
							class="text-xs text-muted-foreground hover:text-foreground"
						>
							{t("common.dashboardTitle")}
						</Breadcrumb.Link>
					{/if}
				</Breadcrumb.Item>
				{#each breadcrumbItems as item, index}
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						{#if item.href && index < breadcrumbItems.length - 1}
							<Breadcrumb.Link
								href={item.href}
								class="text-xs text-muted-foreground hover:text-foreground"
							>
								{item.label}
							</Breadcrumb.Link>
						{:else}
							<Breadcrumb.Page
								class="text-xs font-semibold text-foreground"
							>
								{item.label}
							</Breadcrumb.Page>
						{/if}
					</Breadcrumb.Item>
				{/each}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>

	<!-- Center/Right Search & Controls -->
	<div class="flex items-center gap-2.5">
		<div class="relative hidden md:block w-64 lg:w-80">
			<SearchIcon
				class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<input
				type="search"
				placeholder={t("common.search")}
				class="h-9 w-full rounded-lg border border-border/70 bg-white dark:bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs transition-all"
			/>
		</div>

		<!-- Notification Button -->
		<Button.Root
			variant="ghost"
			size="icon"
			class="relative size-9 rounded-lg border border-border/70 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted text-foreground shadow-xs transition-colors"
			aria-label={t("common.notifications")}
		>
			<BellIcon class="size-4.5" />
			<span
				class="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background"
			></span>
		</Button.Root>

		<!-- Language Switcher -->
		<LanguageSwitcher />

		<!-- Theme Toggle -->
		<ThemeToggle />
	</div>
</header>
