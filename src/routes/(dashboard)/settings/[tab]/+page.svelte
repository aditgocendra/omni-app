<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Input from "$lib/components/ui/input/index.js";
	import { setMode, userPrefersMode } from "mode-watcher";
	import { i18n, t, type Locale } from "$lib/i18n/index.js";
	import GlobeIcon from "@lucide/svelte/icons/globe";
	import SunIcon from "@lucide/svelte/icons/sun";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import LaptopIcon from "@lucide/svelte/icons/laptop";
	import UserIcon from "@lucide/svelte/icons/user";
	import BellIcon from "@lucide/svelte/icons/bell";
	import CheckIcon from "@lucide/svelte/icons/check";
	import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";

	let saveSuccess = $state(false);

	let profileName = $state("Alex Pratama");
	let profileEmail = $state("alex@omniflow.io");
	let profileRole = $state("Senior Omnichannel Operations Lead");

	let notifyEmail = $state(true);
	let notifySound = $state(true);
	let notifyDesktop = $state(false);

	const activeTab = $derived.by(() => {
		const param = page.params.tab;
		if (param === "account" || param === "profile") return "account";
		if (param === "notifications" || param === "notification") return "notifications";
		return "general";
	});

	function handleTabChange(value: string) {
		goto(`/settings/${value}`);
	}

	function saveSettings() {
		saveSuccess = true;
		setTimeout(() => {
			saveSuccess = false;
		}, 3000);
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div>
		<h1 class="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
			{t("settings.title")}
		</h1>
		<p class="text-xs sm:text-sm text-muted-foreground mt-1">
			{t("settings.subtitle")}
		</p>
	</div>

	<!-- Tabs for Settings -->
	<Tabs.Root value={activeTab} onValueChange={handleTabChange} class="space-y-6">
		<Tabs.List class="grid w-full max-w-md grid-cols-3 rounded-xl border border-border/80 bg-muted/60 p-1">
			<Tabs.Trigger value="general" class="rounded-lg text-xs font-semibold py-1.5">
				{t("settings.generalTab")}
			</Tabs.Trigger>
			<Tabs.Trigger value="account" class="rounded-lg text-xs font-semibold py-1.5">
				{t("settings.profileTab")}
			</Tabs.Trigger>
			<Tabs.Trigger value="notifications" class="rounded-lg text-xs font-semibold py-1.5">
				{t("settings.notificationsTab")}
			</Tabs.Trigger>
		</Tabs.List>

		<!-- General & Localization Tab -->
		<Tabs.Content value="general" class="space-y-6">
			<!-- Language Card -->
			<Card.Root class="border border-border/80 bg-card p-6 shadow-xs space-y-4">
				<div class="flex items-start gap-4">
					<div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
						<GlobeIcon class="size-5" />
					</div>
					<div>
						<h3 class="font-heading text-base font-bold text-foreground">
							{t("settings.languageHeading")}
						</h3>
						<p class="text-xs text-muted-foreground mt-0.5">
							{t("settings.languageDescription")}
						</p>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
					<!-- English (Default) -->
					<button
						onclick={() => i18n.setLocale("en")}
						class={`relative flex items-center justify-between p-4 rounded-xl border text-start transition-all cursor-pointer ${
							i18n.locale === "en"
								? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
								: "border-border/80 bg-card/60 hover:border-border hover:bg-muted/40 text-muted-foreground"
						}`}
					>
						<div class="flex items-center gap-3">
							<span class="text-2xl">🇬🇧</span>
							<div>
								<p class="text-sm font-semibold text-foreground">English</p>
								<p class="text-xs text-muted-foreground">Default system language</p>
							</div>
						</div>
						{#if i18n.locale === "en"}
							<CheckCircleIcon class="size-5 text-primary" />
						{/if}
					</button>

					<!-- Indonesian -->
					<button
						onclick={() => i18n.setLocale("id")}
						class={`relative flex items-center justify-between p-4 rounded-xl border text-start transition-all cursor-pointer ${
							i18n.locale === "id"
								? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
								: "border-border/80 bg-card/60 hover:border-border hover:bg-muted/40 text-muted-foreground"
						}`}
					>
						<div class="flex items-center gap-3">
							<span class="text-2xl">🇮🇩</span>
							<div>
								<p class="text-sm font-semibold text-foreground">Bahasa Indonesia</p>
								<p class="text-xs text-muted-foreground">Terjemahan lengkap antarmuka</p>
							</div>
						</div>
						{#if i18n.locale === "id"}
							<CheckCircleIcon class="size-5 text-primary" />
						{/if}
					</button>
				</div>
			</Card.Root>

			<!-- Theme Appearance Card -->
			<Card.Root class="border border-border/80 bg-card p-6 shadow-xs space-y-4">
				<div class="flex items-start gap-4">
					<div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
						<SunIcon class="size-5" />
					</div>
					<div>
						<h3 class="font-heading text-base font-bold text-foreground">
							{t("settings.themeHeading")}
						</h3>
						<p class="text-xs text-muted-foreground mt-0.5">
							{t("settings.themeDescription")}
						</p>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
					<!-- Light Mode -->
					<button
						onclick={() => setMode("light")}
						class={`flex flex-col items-start p-4 rounded-xl border text-start transition-all cursor-pointer ${
							userPrefersMode.current === "light"
								? "border-primary bg-primary/5 ring-1 ring-primary text-foreground"
								: "border-border/80 bg-card/60 hover:bg-muted/40 text-muted-foreground"
						}`}
					>
						<div class="flex items-center justify-between w-full mb-2">
							<SunIcon class="size-5 text-amber-500" />
							{#if userPrefersMode.current === "light"}
								<CheckIcon class="size-4 text-primary" />
							{/if}
						</div>
						<span class="text-sm font-semibold text-foreground">{t("common.lightMode")}</span>
						<span class="text-xs text-muted-foreground">Background #F8FAFD</span>
					</button>

					<!-- Dark Mode -->
					<button
						onclick={() => setMode("dark")}
						class={`flex flex-col items-start p-4 rounded-xl border text-start transition-all cursor-pointer ${
							userPrefersMode.current === "dark"
								? "border-primary bg-primary/5 ring-1 ring-primary text-foreground"
								: "border-border/80 bg-card/60 hover:bg-muted/40 text-muted-foreground"
						}`}
					>
						<div class="flex items-center justify-between w-full mb-2">
							<MoonIcon class="size-5 text-indigo-400" />
							{#if userPrefersMode.current === "dark"}
								<CheckIcon class="size-4 text-primary" />
							{/if}
						</div>
						<span class="text-sm font-semibold text-foreground">{t("common.darkMode")}</span>
						<span class="text-xs text-muted-foreground">Background #0F172A</span>
					</button>

					<!-- System Default -->
					<button
						onclick={() => setMode("system")}
						class={`flex flex-col items-start p-4 rounded-xl border text-start transition-all cursor-pointer ${
							userPrefersMode.current === "system"
								? "border-primary bg-primary/5 ring-1 ring-primary text-foreground"
								: "border-border/80 bg-card/60 hover:bg-muted/40 text-muted-foreground"
						}`}
					>
						<div class="flex items-center justify-between w-full mb-2">
							<LaptopIcon class="size-5 text-slate-500" />
							{#if userPrefersMode.current === "system"}
								<CheckIcon class="size-4 text-primary" />
							{/if}
						</div>
						<span class="text-sm font-semibold text-foreground">{t("common.systemMode")}</span>
						<span class="text-xs text-muted-foreground">Sync with OS</span>
					</button>
				</div>
			</Card.Root>
		</Tabs.Content>

		<!-- Account / Profile Tab -->
		<Tabs.Content value="account" class="space-y-6">
			<Card.Root class="border border-border/80 bg-card p-6 shadow-xs space-y-5">
				<div class="flex items-start gap-4">
					<div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
						<UserIcon class="size-5" />
					</div>
					<div>
						<h3 class="font-heading text-base font-bold text-foreground">
							{t("settings.profileHeading")}
						</h3>
						<p class="text-xs text-muted-foreground mt-0.5">
							{t("settings.profileDescription")}
						</p>
					</div>
				</div>

				<div class="space-y-4 max-w-xl pt-2">
					<div class="space-y-1.5">
						<label for="profileName" class="text-xs font-semibold text-foreground">{t("settings.name")}</label>
						<Input.Root id="profileName" bind:value={profileName} class="h-10 text-sm" />
					</div>
					<div class="space-y-1.5">
						<label for="profileEmail" class="text-xs font-semibold text-foreground">{t("settings.email")}</label>
						<Input.Root id="profileEmail" type="email" bind:value={profileEmail} class="h-10 text-sm" />
					</div>
					<div class="space-y-1.5">
						<label for="profileRole" class="text-xs font-semibold text-foreground">{t("settings.role")}</label>
						<Input.Root id="profileRole" bind:value={profileRole} class="h-10 text-sm" />
					</div>
				</div>
			</Card.Root>
		</Tabs.Content>

		<!-- Notifications Tab -->
		<Tabs.Content value="notifications" class="space-y-6">
			<Card.Root class="border border-border/80 bg-card p-6 shadow-xs space-y-5">
				<div class="flex items-start gap-4">
					<div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
						<BellIcon class="size-5" />
					</div>
					<div>
						<h3 class="font-heading text-base font-bold text-foreground">
							{t("settings.notificationHeading")}
						</h3>
						<p class="text-xs text-muted-foreground mt-0.5">
							{t("settings.notificationDescription")}
						</p>
					</div>
				</div>

				<div class="space-y-3 pt-2 max-w-xl">
					<label class="flex items-center justify-between p-3.5 rounded-xl border border-border/70 hover:bg-muted/40 cursor-pointer">
						<span class="text-xs font-medium text-foreground">{t("settings.emailAlerts")}</span>
						<input type="checkbox" bind:checked={notifyEmail} class="size-4 rounded-sm text-primary focus:ring-primary" />
					</label>
					<label class="flex items-center justify-between p-3.5 rounded-xl border border-border/70 hover:bg-muted/40 cursor-pointer">
						<span class="text-xs font-medium text-foreground">{t("settings.soundAlerts")}</span>
						<input type="checkbox" bind:checked={notifySound} class="size-4 rounded-sm text-primary focus:ring-primary" />
					</label>
					<label class="flex items-center justify-between p-3.5 rounded-xl border border-border/70 hover:bg-muted/40 cursor-pointer">
						<span class="text-xs font-medium text-foreground">{t("settings.desktopAlerts")}</span>
						<input type="checkbox" bind:checked={notifyDesktop} class="size-4 rounded-sm text-primary focus:ring-primary" />
					</label>
				</div>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>

	<!-- Save Action Button -->
	<div class="flex items-center gap-3 pt-2">
		<Button.Root onclick={saveSettings} class="h-10 px-5 gap-2 rounded-xl bg-primary text-white font-semibold text-xs shadow-sm hover:bg-primary/90">
			<CheckIcon class="size-4" />
			<span>{t("common.save")}</span>
		</Button.Root>
		{#if saveSuccess}
			<span class="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
				<CheckCircleIcon class="size-4" />
				<span>{t("common.saved")}</span>
			</span>
		{/if}
	</div>
</div>
