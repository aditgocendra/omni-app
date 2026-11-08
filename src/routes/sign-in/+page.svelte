<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import LanguageSwitcher from "$lib/components/layout/LanguageSwitcher.svelte";
	import ThemeToggle from "$lib/components/layout/ThemeToggle.svelte";
	import { authStore, DEMO_ACCOUNTS } from "$lib/stores/auth.svelte.js";
	import { t } from "$lib/i18n/index.js";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";

	// Icons
	import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
	import MailIcon from "@lucide/svelte/icons/mail";
	import LockIcon from "@lucide/svelte/icons/lock";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import EyeOffIcon from "@lucide/svelte/icons/eye-off";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import Loader2Icon from "@lucide/svelte/icons/loader-2";
	import KeyRoundIcon from "@lucide/svelte/icons/key-round";
	import ShieldIcon from "@lucide/svelte/icons/shield";
	import PackageIcon from "@lucide/svelte/icons/package";
	import StoreIcon from "@lucide/svelte/icons/store";

	// Form State
	let email = $state("admin@cronsyst.com");
	let password = $state("password123");
	let rememberMe = $state(true);

	// UI State
	let showPassword = $state(false);
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	// Forgot Password Dialog State
	let isForgotModalOpen = $state(false);
	let recoveryEmail = $state("");
	let isRecoveryLoading = $state(false);
	let recoverySuccess = $state(false);

	// Check if redirected with initialized parameter
	const isJustInitialized = $derived(
		page.url.searchParams.get("initialized") === "true",
	);

	function validateEmail(val: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = null;

		if (!email.trim() || !password) {
			errorMessage = t("auth.signIn.invalidCredentials");
			return;
		}

		if (!validateEmail(email)) {
			errorMessage = t("auth.startup.errEmail");
			return;
		}

		isLoading = true;

		setTimeout(() => {
			const res = authStore.login(email, password);
			isLoading = false;

			if (res.success) {
				successMessage = t("auth.signIn.successNotice");
				setTimeout(() => {
					goto("/");
				}, 700);
			} else {
				errorMessage =
					res.message || t("auth.signIn.invalidCredentials");
			}
		}, 600);
	}

	function handleDemoQuickFill(
		roleKey: "superAdmin" | "warehouseManager" | "cashier",
	) {
		const target = DEMO_ACCOUNTS[roleKey];
		if (target) {
			email = target.user.email;
			password = target.password;
			errorMessage = null;
		}
	}

	function handleSendRecovery() {
		if (!validateEmail(recoveryEmail)) return;
		isRecoveryLoading = true;
		setTimeout(() => {
			isRecoveryLoading = false;
			recoverySuccess = true;
			setTimeout(() => {
				isForgotModalOpen = false;
				recoverySuccess = false;
				recoveryEmail = "";
			}, 2000);
		}, 800);
	}
</script>

<svelte:head>
	<title>{t("auth.signIn.title")}</title>
</svelte:head>

<div
	class="relative min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden"
>
	<!-- Ambient Background Glow Accents -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-162.5 h-112.5 bg-linear-to-tr from-primary/15 via-blue-500/10 to-transparent blur-[120px] rounded-full -z-10"
	></div>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute -bottom-40 left-10 w-112.5 h-87.5 bg-linear-to-tr from-indigo-500/10 to-transparent blur-[100px] rounded-full -z-10"
	></div>

	<!-- Main Form Content -->
	<main class="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
		<div class="w-full max-w-md">
			<!-- Header Badge & Introduction -->
			<div class="text-center mb-6">
				<h1
					class="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
				>
					{t("auth.signIn.title")}
				</h1>
				<p
					class="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto"
				>
					{t("auth.signIn.subtitle")}
				</p>
			</div>

			<!-- Card Container -->
			<Card.Root
				class="border-border/80 bg-white/95 dark:bg-card/95 shadow-xl backdrop-blur-sm rounded-2xl overflow-hidden"
			>
				<!-- Success or Initialized Alert Notification -->
				{#if successMessage || isJustInitialized}
					<div
						class="m-5 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 animate-in fade-in slide-in-from-top-2"
					>
						<CheckCircle2Icon
							class="size-4.5 text-emerald-500 shrink-0"
						/>
						<span class="text-xs font-semibold leading-normal">
							{successMessage || t("auth.startup.successTitle")}
						</span>
					</div>
				{/if}

				<!-- Error Alert Notification -->
				{#if errorMessage}
					<div
						class="m-5 p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive dark:text-rose-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2"
					>
						<AlertCircleIcon
							class="size-4 text-destructive shrink-0 mt-0.5"
						/>
						<span class="text-xs font-medium leading-relaxed"
							>{errorMessage}</span
						>
					</div>
				{/if}

				<form onsubmit={handleSubmit}>
					<Card.Content class="p-6 sm:p-7 space-y-4.5">
						<!-- Email Input -->
						<div class="space-y-1.5">
							<Label
								for="email"
								class="text-xs font-semibold text-foreground"
							>
								{t("auth.signIn.emailLabel")}
							</Label>
							<div class="relative">
								<MailIcon
									class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
								/>
								<Input
									id="email"
									type="email"
									required
									bind:value={email}
									placeholder={t(
										"auth.signIn.emailPlaceholder",
									)}
									class="h-10 pl-10 rounded-lg border-border bg-slate-50/50 dark:bg-muted/40 text-xs sm:text-sm"
								/>
							</div>
						</div>

						<!-- Password Input -->
						<div class="space-y-1.5">
							<Label
								for="password"
								class="text-xs font-semibold text-foreground"
							>
								{t("auth.signIn.passwordLabel")}
							</Label>
							<div class="relative">
								<LockIcon
									class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
								/>
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									required
									bind:value={password}
									placeholder={t(
										"auth.signIn.passwordPlaceholder",
									)}
									class="h-10 pl-10 pr-9 rounded-lg border-border bg-slate-50/50 dark:bg-muted/40 text-xs sm:text-sm"
								/>
								<button
									type="button"
									onclick={() =>
										(showPassword = !showPassword)}
									class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
									aria-label={showPassword
										? "Hide password"
										: "Show password"}
								>
									{#if showPassword}
										<EyeOffIcon class="size-4" />
									{:else}
										<EyeIcon class="size-4" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Submit Button -->
						<Button.Root
							type="submit"
							disabled={isLoading}
							class="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-md gap-2 cursor-pointer transition-all mt-2"
						>
							{#if isLoading}
								<Loader2Icon class="size-4 animate-spin" />
								<span>{t("auth.signIn.authenticating")}</span>
							{:else}
								<span>{t("auth.signIn.submitBtn")}</span>
								<ArrowRightIcon class="size-4" />
							{/if}
						</Button.Root>
					</Card.Content>
				</form>

				<Separator />
			</Card.Root>
		</div>
	</main>
</div>
