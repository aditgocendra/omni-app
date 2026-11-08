<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import LanguageSwitcher from "$lib/components/layout/LanguageSwitcher.svelte";
	import ThemeToggle from "$lib/components/layout/ThemeToggle.svelte";
	import { authStore } from "$lib/stores/auth.svelte.js";
	import { t } from "$lib/i18n/index.js";
	import { goto } from "$app/navigation";

	// Icons
	import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
	import UserIcon from "@lucide/svelte/icons/user";
	import MailIcon from "@lucide/svelte/icons/mail";
	import PhoneIcon from "@lucide/svelte/icons/phone";
	import LockIcon from "@lucide/svelte/icons/lock";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import EyeOffIcon from "@lucide/svelte/icons/eye-off";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import Loader2Icon from "@lucide/svelte/icons/loader-2";
	import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";

	// Form State
	let storeName = $state("");
	let fullName = $state("");
	let email = $state("");
	let phone = $state("");
	let password = $state("");
	let confirmPassword = $state("");
	let agreeTerms = $state(false);

	// UI State
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	// Password strength check
	const isPasswordLengthValid = $derived(password.length >= 8);
	const isPasswordMatch = $derived(
		password.length > 0 &&
			confirmPassword.length > 0 &&
			password === confirmPassword,
	);

	function validateEmail(val: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = null;

		// Validations
		if (
			!storeName.trim() ||
			!fullName.trim() ||
			!email.trim() ||
			!phone.trim() ||
			!password
		) {
			errorMessage = t("auth.startup.errRequired");
			return;
		}

		if (!validateEmail(email)) {
			errorMessage = t("auth.startup.errEmail");
			return;
		}

		if (password.length < 8) {
			errorMessage = t("auth.startup.errPasswordLength");
			return;
		}

		if (password !== confirmPassword) {
			errorMessage = t("auth.startup.errPasswordMatch");
			return;
		}

		if (!agreeTerms) {
			errorMessage = t("auth.startup.errAgreeTerms");
			return;
		}

		isLoading = true;

		// Simulate setup processing
		setTimeout(() => {
			try {
				authStore.setupSuperAdmin({
					storeName: storeName.trim(),
					fullName: fullName.trim(),
					email: email.trim(),
					phone: phone.trim(),
					password,
				});

				isLoading = false;
				successMessage = t("auth.startup.successDesc");

				// Redirect to dashboard overview after brief success display
				setTimeout(() => {
					goto("/");
				}, 1500);
			} catch {
				isLoading = false;
				errorMessage =
					"An unexpected error occurred during initialization.";
			}
		}, 800);
	}
</script>

<svelte:head>
	<title>{t("auth.startup.title")} | Cronsyst Omnichannel</title>
</svelte:head>

<div
	class="relative min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden"
>
	<!-- Ambient Background Glow Accents -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-175 h-125 bg-linear-to-tr from-primary/15 via-blue-500/10 to-indigo-500/5 blur-[120px] rounded-full -z-10"
	></div>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute -bottom-40 right-10 w-125 h-100 bg-linear-to-bl from-emerald-500/10 via-teal-500/5 to-transparent blur-[100px] rounded-full -z-10"
	></div>

	<!-- Main Form Content -->
	<main class="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
		<div class="w-full max-w-xl">
			<!-- Header Badge & Introduction -->
			<div class="text-center mb-6">
				<Badge
					variant="secondary"
					class="gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border border-primary/20 bg-primary/10 text-primary dark:text-primary-foreground mb-3 shadow-2xs"
				>
					<SparklesIcon class="size-3" />
					<span>{t("auth.startup.badge")}</span>
				</Badge>
				<h1
					class="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
				>
					{t("auth.startup.title")}
				</h1>
				<p
					class="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md mx-auto"
				>
					{t("auth.startup.subtitle")}
				</p>
			</div>

			<!-- Card Container -->
			<Card.Root
				class="border-border/80 bg-white/95 dark:bg-card/95 shadow-xl backdrop-blur-sm rounded-2xl overflow-hidden"
			>
				<!-- Success Alert Notification -->
				{#if successMessage}
					<div
						class="m-5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 animate-in fade-in slide-in-from-top-2"
					>
						<CheckCircle2Icon
							class="size-5 text-emerald-500 shrink-0 mt-0.5"
						/>
						<div class="text-xs sm:text-sm">
							<p class="font-semibold">
								{t("auth.startup.successTitle")}
							</p>
							<p
								class="text-xs text-emerald-700/90 dark:text-emerald-400 mt-0.5"
							>
								{successMessage}
							</p>
						</div>
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
					<Card.Content class="p-6 sm:p-8 space-y-6">
						<!-- Section 1: Super Admin Account Information -->
						<div class="space-y-4 pt-2">
							<!-- Full Name -->
							<div class="space-y-1.5">
								<Label
									for="fullName"
									class="text-xs font-semibold text-foreground"
								>
									{t("auth.startup.fullNameLabel")}
									<span class="text-destructive">*</span>
								</Label>
								<div class="relative">
									<UserIcon
										class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
									/>
									<Input
										id="fullName"
										type="text"
										required
										bind:value={fullName}
										placeholder={t(
											"auth.startup.fullNamePlaceholder",
										)}
										class="h-10 pl-10 rounded-lg border-border bg-slate-50/50 dark:bg-muted/40 text-xs sm:text-sm"
									/>
								</div>
							</div>

							<!-- Email and Phone Grid -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div class="space-y-1.5">
									<Label
										for="email"
										class="text-xs font-semibold text-foreground"
									>
										{t("auth.startup.emailLabel")}
										<span class="text-destructive">*</span>
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
												"auth.startup.emailPlaceholder",
											)}
											class="h-10 pl-10 rounded-lg border-border bg-slate-50/50 dark:bg-muted/40 text-xs sm:text-sm"
										/>
									</div>
								</div>

								<div class="space-y-1.5">
									<Label
										for="phone"
										class="text-xs font-semibold text-foreground"
									>
										{t("auth.startup.phoneLabel")}
										<span class="text-destructive">*</span>
									</Label>
									<div class="relative">
										<PhoneIcon
											class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
										/>
										<Input
											id="phone"
											type="tel"
											required
											bind:value={phone}
											placeholder={t(
												"auth.startup.phonePlaceholder",
											)}
											class="h-10 pl-10 rounded-lg border-border bg-slate-50/50 dark:bg-muted/40 text-xs sm:text-sm"
										/>
									</div>
								</div>
							</div>

							<!-- Password & Confirm Password Grid -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div class="space-y-1.5">
									<Label
										for="password"
										class="text-xs font-semibold text-foreground"
									>
										{t("auth.startup.passwordLabel")}
										<span class="text-destructive">*</span>
									</Label>
									<div class="relative">
										<LockIcon
											class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
										/>
										<Input
											id="password"
											type={showPassword
												? "text"
												: "password"}
											required
											bind:value={password}
											placeholder={t(
												"auth.startup.passwordPlaceholder",
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

								<div class="space-y-1.5">
									<Label
										for="confirmPassword"
										class="text-xs font-semibold text-foreground"
									>
										{t("auth.startup.confirmPasswordLabel")}
										<span class="text-destructive">*</span>
									</Label>
									<div class="relative">
										<LockIcon
											class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
										/>
										<Input
											id="confirmPassword"
											type={showConfirmPassword
												? "text"
												: "password"}
											required
											bind:value={confirmPassword}
											placeholder={t(
												"auth.startup.confirmPasswordPlaceholder",
											)}
											class="h-10 pl-10 pr-9 rounded-lg border-border bg-slate-50/50 dark:bg-muted/40 text-xs sm:text-sm"
										/>
										<button
											type="button"
											onclick={() =>
												(showConfirmPassword =
													!showConfirmPassword)}
											class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
											aria-label={showConfirmPassword
												? "Hide password"
												: "Show password"}
										>
											{#if showConfirmPassword}
												<EyeOffIcon class="size-4" />
											{:else}
												<EyeIcon class="size-4" />
											{/if}
										</button>
									</div>
								</div>
							</div>

							<!-- Password validation hints -->
							<div
								class="flex items-center gap-4 text-[11px] pt-1"
							>
								<span
									class="flex items-center gap-1 font-medium transition-colors {isPasswordLengthValid
										? 'text-emerald-600 dark:text-emerald-400'
										: 'text-muted-foreground'}"
								>
									<span
										class="size-1.5 rounded-full {isPasswordLengthValid
											? 'bg-emerald-500'
											: 'bg-muted-foreground/50'}"
									></span>
									Min. 8 characters
								</span>
								{#if confirmPassword.length > 0}
									<span
										class="flex items-center gap-1 font-medium transition-colors {isPasswordMatch
											? 'text-emerald-600 dark:text-emerald-400'
											: 'text-rose-600 dark:text-rose-400'}"
									>
										<span
											class="size-1.5 rounded-full {isPasswordMatch
												? 'bg-emerald-500'
												: 'bg-rose-500'}"
										></span>
										{isPasswordMatch
											? "Passwords match"
											: "Passwords do not match"}
									</span>
								{/if}
							</div>
						</div>

						<!-- Terms & Governance Checkbox -->
						<div class="pt-2 border-t border-border/60">
							<div class="flex items-start gap-3">
								<Checkbox
									id="agreeTerms"
									bind:checked={agreeTerms}
									class="mt-0.5 rounded cursor-pointer"
								/>
								<Label
									for="agreeTerms"
									class="text-xs text-muted-foreground leading-normal font-normal cursor-pointer select-none"
								>
									{t("auth.startup.agreeTerms")}
								</Label>
							</div>
						</div>

						<!-- Submit Button -->
						<Button.Root
							type="submit"
							disabled={isLoading}
							class="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-md gap-2 cursor-pointer transition-all"
						>
							{#if isLoading}
								<Loader2Icon class="size-4 animate-spin" />
								<span>{t("auth.startup.initializing")}</span>
							{:else}
								<span>{t("auth.startup.submitBtn")}</span>
								<ArrowRightIcon class="size-4" />
							{/if}
						</Button.Root>
					</Card.Content>
				</form>
			</Card.Root>
		</div>
	</main>
</div>
