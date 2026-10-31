<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { t } from "$lib/i18n/index.js";
	import { defaultPosSettings, formatTransactionId } from "$lib/data/pos.js";
	import type { PosSettingConfig } from "$lib/types/index.js";

	import SettingsIcon from "@lucide/svelte/icons/settings";
	import CheckIcon from "@lucide/svelte/icons/check";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import ReceiptIcon from "@lucide/svelte/icons/receipt";
	import HashIcon from "@lucide/svelte/icons/hash";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import CheckCheckIcon from "@lucide/svelte/icons/check-check";

	let prefix = $state(defaultPosSettings.prefix);
	let datePattern = $state<"YYYYMMDD" | "YYMMDD" | "YYYYMM">(
		defaultPosSettings.datePattern,
	);
	let sequenceDigits = $state(defaultPosSettings.sequenceDigits);
	let separator = $state<"" | "-" | "/">(defaultPosSettings.separator);
	let counterResetFrequency = $state<
		"daily" | "monthly" | "yearly" | "never"
	>(defaultPosSettings.counterResetFrequency);
	let defaultWarehouse = $state(defaultPosSettings.defaultWarehouse);
	let defaultTaxRate = $state(defaultPosSettings.defaultTaxRate);
	let autoPrintReceipt = $state(defaultPosSettings.autoPrintReceipt);
	let allowManualDiscount = $state(defaultPosSettings.allowManualDiscount);

	let isCopied = $state(false);
	let toastMessage = $state<string | null>(null);

	const warehouseOptions = [
		"Warehouse A - Central Jakarta",
		"Warehouse B - East Surabaya",
		"Warehouse C - West Bandung",
		"Warehouse D - Semarang Hub",
	];

	const datePatternItems = [
		{ value: "YYYYMMDD", label: "YYYYMMDD (e.g. 20261030)" },
		{ value: "YYMMDD", label: "YYMMDD (e.g. 261030)" },
		{ value: "YYYYMM", label: "YYYYMM (e.g. 202610)" },
	];

	const sequenceDigitItems = [
		{ value: "3", label: "3 Digits (001 - 999)" },
		{ value: "4", label: "4 Digits (0001 - 9999)" },
		{ value: "5", label: "5 Digits (00001 - 99999)" },
	];

	const separatorItems = $derived([
		{ value: "none", label: t("pos.setting.separatorNone") },
		{ value: "-", label: t("pos.setting.separatorDash") },
		{ value: "/", label: t("pos.setting.separatorSlash") },
	]);

	const resetFrequencyItems = $derived([
		{ value: "daily", label: t("pos.setting.resetDaily") },
		{ value: "monthly", label: t("pos.setting.resetMonthly") },
		{ value: "yearly", label: t("pos.setting.resetYearly") },
		{ value: "never", label: t("pos.setting.resetNever") },
	]);

	const livePreviewId = $derived.by(() => {
		const config: PosSettingConfig = {
			prefix: prefix.trim().toUpperCase() || "ID",
			datePattern,
			sequenceDigits: Number(sequenceDigits) || 3,
			separator,
			counterResetFrequency,
			defaultWarehouse,
			defaultTaxRate,
			autoPrintReceipt,
			allowManualDiscount,
		};
		return formatTransactionId(config, 1, new Date());
	});

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3000);
	}

	function handleCopyPreview() {
		navigator.clipboard.writeText(livePreviewId);
		isCopied = true;
		setTimeout(() => {
			isCopied = false;
		}, 2000);
	}

	function handleSaveSettings() {
		// Save settings to localStorage
		if (typeof window !== "undefined") {
			const config: PosSettingConfig = {
				prefix: prefix.trim().toUpperCase() || "ID",
				datePattern,
				sequenceDigits: Number(sequenceDigits) || 3,
				separator,
				counterResetFrequency,
				defaultWarehouse,
				defaultTaxRate: Number(defaultTaxRate) || 0,
				autoPrintReceipt,
				allowManualDiscount,
			};
			localStorage.setItem(
				"cronsyst_pos_settings",
				JSON.stringify(config),
			);
		}
		showToast(t("pos.setting.saveSuccess"));
	}

	function handleResetDefaults() {
		prefix = defaultPosSettings.prefix;
		datePattern = defaultPosSettings.datePattern;
		sequenceDigits = defaultPosSettings.sequenceDigits;
		separator = defaultPosSettings.separator;
		counterResetFrequency = defaultPosSettings.counterResetFrequency;
		defaultWarehouse = defaultPosSettings.defaultWarehouse;
		defaultTaxRate = defaultPosSettings.defaultTaxRate;
		autoPrintReceipt = defaultPosSettings.autoPrintReceipt;
		allowManualDiscount = defaultPosSettings.allowManualDiscount;
		showToast(t("common.saved"));
	}
</script>

<svelte:head>
	<title>{t("pos.setting.title")} | Cronsyst</title>
</svelte:head>

<div class="space-y-6">
	<!-- Toast Message -->
	{#if toastMessage}
		<div
			class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-background/95 px-4 py-3 text-xs font-medium text-foreground shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3"
		>
			<div
				class="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary"
			>
				<CheckIcon class="size-3" />
			</div>
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Header -->
	<div
		class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h1
				class="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
			>
				{t("pos.setting.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1.5">
				{t("pos.setting.subtitle")}
			</p>
		</div>

		<div class="flex items-center gap-2.5">
			<Button.Root
				type="button"
				variant="outline"
				size="sm"
				onclick={handleResetDefaults}
				class="h-9 px-3 gap-1.5 text-xs font-medium cursor-pointer"
			>
				<RotateCcwIcon class="size-3.5" />
				<span>{t("pos.setting.resetDefaults")}</span>
			</Button.Root>
			<Button.Root
				type="button"
				variant="default"
				size="sm"
				onclick={handleSaveSettings}
				class="h-9 px-4 gap-1.5 text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer shadow-xs"
			>
				<CheckIcon class="size-3.5" />
				<span>{t("pos.setting.saveBtn")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- Live Preview Hero Banner -->
	<div
		class="p-5 rounded-2xl border border-primary/25 bg-primary/5 dark:bg-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
	>
		<div class="space-y-1">
			<span
				class="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5"
			>
				<ReceiptIcon class="size-4" />
				{t("pos.setting.livePreview")}
			</span>
			<div class="flex items-center gap-3">
				<span
					class="font-mono text-2xl sm:text-3xl font-extrabold text-foreground tracking-wide"
				>
					{livePreviewId}
				</span>
				<Button.Root
					type="button"
					variant="ghost"
					size="icon-xs"
					onclick={handleCopyPreview}
					class="size-8 rounded-lg hover:bg-primary/15 text-primary cursor-pointer transition-colors"
					title="Copy sample ID"
				>
					{#if isCopied}
						<CheckCheckIcon class="size-4 text-emerald-600" />
					{:else}
						<CopyIcon class="size-4" />
					{/if}
				</Button.Root>
			</div>
			<p class="text-xs text-muted-foreground">
				{t("pos.setting.sampleResult")}
			</p>
		</div>

		<div
			class="rounded-xl border border-border/80 bg-background/80 p-3 sm:text-right shrink-0"
		>
			<span
				class="text-[10px] uppercase font-semibold text-muted-foreground block"
			>
				{t("pos.setting.resetFrequencyLabel")}
			</span>
			<span class="font-medium text-xs text-foreground capitalize">
				{counterResetFrequency}
			</span>
		</div>
	</div>

	<!-- Card 1: Format Transaction ID Configuration -->
	<Card.Root
		class="p-6 rounded-xl border border-border/80 bg-card shadow-xs space-y-5"
	>
		<div class="pb-3 border-b border-border/60">
			<h2
				class="font-heading text-sm font-bold text-foreground flex items-center gap-2"
			>
				<HashIcon class="size-4 text-primary" />
				<span>{t("pos.setting.formatTitle")}</span>
			</h2>
			<p class="text-xs text-muted-foreground mt-0.5">
				{t("pos.setting.formatDesc")}
			</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
			<!-- Prefix -->
			<div class="space-y-1.5">
				<Label class="text-xs font-semibold text-foreground">
					{t("pos.setting.prefixLabel")}
				</Label>
				<Input
					type="text"
					bind:value={prefix}
					placeholder={t("pos.setting.prefixPlaceholder")}
					class="h-9 text-xs font-mono uppercase"
				/>
				<span class="text-[10px] text-muted-foreground block">
					Fixed uppercase prefix prepended to all checkout
					transactions.
				</span>
			</div>

			<!-- Date Token Pattern -->
			<div class="space-y-1.5">
				<Label class="text-xs font-semibold text-foreground">
					{t("pos.setting.datePatternLabel")}
				</Label>
				<Select.Root
					type="single"
					bind:value={datePattern}
					items={datePatternItems}
				>
					<Select.Trigger
						class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs"
					>
						<Select.Value
							placeholder={t("pos.setting.datePatternLabel")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each datePatternItems as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<span class="text-[10px] text-muted-foreground block">
					Dynamic date stamp embedded in the receipt code.
				</span>
			</div>

			<!-- Sequence Number Digits -->
			<div class="space-y-1.5">
				<Label class="text-xs font-semibold text-foreground">
					{t("pos.setting.sequenceDigitsLabel")}
				</Label>
				<Select.Root
					type="single"
					value={String(sequenceDigits)}
					onValueChange={(val) => (sequenceDigits = Number(val))}
					items={sequenceDigitItems}
				>
					<Select.Trigger
						class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs"
					>
						<Select.Value
							placeholder={t("pos.setting.sequenceDigitsLabel")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each sequenceDigitItems as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<span class="text-[10px] text-muted-foreground block">
					Zero-padded sequence counter length.
				</span>
			</div>

			<!-- Separator -->
			<div class="space-y-1.5">
				<Label class="text-xs font-semibold text-foreground">
					{t("pos.setting.separatorLabel")}
				</Label>
				<Select.Root
					type="single"
					value={separator === "" ? "none" : separator}
					onValueChange={(val) =>
						(separator = val === "none" ? "" : (val as "-" | "/"))}
					items={separatorItems}
				>
					<Select.Trigger
						class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs"
					>
						<Select.Value
							placeholder={t("pos.setting.separatorLabel")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each separatorItems as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<span class="text-[10px] text-muted-foreground block">
					Delimiter separating prefix, date, and sequence.
				</span>
			</div>

			<!-- Counter Reset Schedule -->
			<div class="space-y-1.5 sm:col-span-2">
				<Label class="text-xs font-semibold text-foreground">
					{t("pos.setting.resetFrequencyLabel")}
				</Label>
				<Select.Root
					type="single"
					bind:value={counterResetFrequency}
					items={resetFrequencyItems}
				>
					<Select.Trigger
						class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs"
					>
						<Select.Value
							placeholder={t("pos.setting.resetFrequencyLabel")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each resetFrequencyItems as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</Card.Root>

	<!-- Card 2: General Cashier Preferences -->
	<Card.Root
		class="p-6 rounded-xl border border-border/80 bg-card shadow-xs space-y-5"
	>
		<div class="pb-3 border-b border-border/60">
			<h2
				class="font-heading text-sm font-bold text-foreground flex items-center gap-2"
			>
				<SlidersHorizontalIcon class="size-4 text-primary" />
				<span>{t("pos.setting.generalPrefTitle")}</span>
			</h2>
			<p class="text-xs text-muted-foreground mt-0.5">
				{t("pos.setting.generalPrefDesc")}
			</p>
		</div>

		<div class="space-y-4 text-xs">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<Label class="text-xs font-semibold text-foreground">
						{t("pos.setting.defaultWarehouse")}
					</Label>
					<Select.Root
						type="single"
						bind:value={defaultWarehouse}
						items={warehouseOptions.map((w) => ({
							value: w,
							label: w,
						}))}
					>
						<Select.Trigger
							class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs"
						>
							<Select.Value
								placeholder={t("pos.setting.defaultWarehouse")}
							/>
						</Select.Trigger>
						<Select.Content>
							{#each warehouseOptions as w}
								<Select.Item value={w} label={w}
									>{w}</Select.Item
								>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<Label class="text-xs font-semibold text-foreground">
						{t("pos.setting.taxRate")}
					</Label>
					<div class="relative">
						<Input
							type="number"
							min="0"
							max="100"
							bind:value={defaultTaxRate}
							class="h-9 text-xs pr-8"
						/>
						<span
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none"
						>
							%
						</span>
					</div>
				</div>
			</div>

			<!-- Switch: Auto-print Receipt -->
			<div
				class="flex items-center justify-between p-3.5 rounded-lg border border-border/70 bg-muted/20"
			>
				<div>
					<span class="text-xs font-semibold text-foreground block">
						{t("pos.setting.autoPrint")}
					</span>
					<span class="text-[11px] text-muted-foreground">
						{t("pos.setting.autoPrintDesc")}
					</span>
				</div>
				<Switch
					checked={autoPrintReceipt}
					onCheckedChange={(checked: boolean) =>
						(autoPrintReceipt = checked)}
				/>
			</div>

			<!-- Switch: Allow Manual Discount -->
			<div
				class="flex items-center justify-between p-3.5 rounded-lg border border-border/70 bg-muted/20"
			>
				<div>
					<span class="text-xs font-semibold text-foreground block">
						{t("pos.setting.allowDiscount")}
					</span>
					<span class="text-[11px] text-muted-foreground">
						{t("pos.setting.allowDiscountDesc")}
					</span>
				</div>
				<Switch
					checked={allowManualDiscount}
					onCheckedChange={(checked: boolean) =>
						(allowManualDiscount = checked)}
				/>
			</div>
		</div>
	</Card.Root>
</div>
