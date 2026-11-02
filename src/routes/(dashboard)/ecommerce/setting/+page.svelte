<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { defaultEcommerceSettings } from "$lib/data/ecommerce.js";
	import type { EcommerceSettingsConfig } from "$lib/types/index.js";
	import { t } from "$lib/i18n/index.js";

	// Icons
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import WebhookIcon from "@lucide/svelte/icons/webhook";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import ActivityIcon from "@lucide/svelte/icons/activity";
	import BoxIcon from "@lucide/svelte/icons/box";
	import ShieldAlertIcon from "@lucide/svelte/icons/shield-alert";
	import SaveIcon from "@lucide/svelte/icons/save";
	import KeyIcon from "@lucide/svelte/icons/key";

	let config = $state<EcommerceSettingsConfig>({
		...defaultEcommerceSettings,
		webhookEvents: { ...defaultEcommerceSettings.webhookEvents },
	});
	let toastMessage = $state<string | null>(null);
	let isPinging = $state(false);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3500);
	}

	function handleCopyUrl() {
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			navigator.clipboard.writeText(config.webhookCallbackUrl);
		}
		showToast("Callback URL disalin ke clipboard!");
	}

	function handleTestPing() {
		isPinging = true;
		setTimeout(() => {
			isPinging = false;
			showToast(t("ecommerce.setting.pingSuccess"));
		}, 700);
	}

	function handleSave() {
		showToast(t("ecommerce.setting.saveSuccess"));
	}
</script>

<svelte:head>
	<title>{t("ecommerce.setting.title")} | OmniFlow</title>
</svelte:head>

<div class="space-y-6 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
	<!-- Toast Notification -->
	{#if toastMessage}
		<div
			class="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl animate-in slide-in-from-bottom-5 duration-200"
		>
			<CheckCircle2Icon class="size-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
		<div>
			<h1 class="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<SettingsIcon class="size-6 text-primary" />
				<span>{t("ecommerce.setting.title")}</span>
			</h1>
			<p class="text-xs text-muted-foreground mt-0.5">
				{t("ecommerce.setting.subtitle")}
			</p>
		</div>

		<Button.Root
			type="button"
			onclick={handleSave}
			class="h-9 px-4 text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-center"
		>
			<SaveIcon class="size-4" />
			<span>{t("ecommerce.setting.saveBtn")}</span>
		</Button.Root>
	</div>

	<!-- SECTION 1: WEBHOOK & EVENT PUSH -->
	<div class="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
		<div class="flex items-center gap-2.5 pb-3 border-b border-border/60">
			<div class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
				<WebhookIcon class="size-4" />
			</div>
			<div>
				<h2 class="text-sm font-bold text-foreground">
					{t("ecommerce.setting.webhookTitle")}
				</h2>
				<p class="text-xs text-muted-foreground">
					{t("ecommerce.setting.webhookDesc")}
				</p>
			</div>
		</div>

		<!-- Callback URL -->
		<div class="space-y-2">
			<Label class="text-xs font-semibold text-foreground">
				{t("ecommerce.setting.callbackUrl")}
			</Label>
			<div class="flex items-center gap-2">
				<Input
					type="text"
					bind:value={config.webhookCallbackUrl}
					class="font-mono text-xs h-9 bg-background"
				/>
				<Button.Root
					type="button"
					variant="outline"
					size="sm"
					onclick={handleCopyUrl}
					class="h-9 px-3 text-xs cursor-pointer gap-1.5 shrink-0"
				>
					<CopyIcon class="size-3.5" />
					<span class="hidden sm:inline">{t("ecommerce.setting.copyUrl")}</span>
				</Button.Root>
				<Button.Root
					type="button"
					variant="outline"
					size="sm"
					disabled={isPinging}
					onclick={handleTestPing}
					class="h-9 px-3 text-xs cursor-pointer gap-1.5 shrink-0"
				>
					<ActivityIcon class="size-3.5 text-primary" />
					<span>{isPinging ? "Testing..." : t("ecommerce.setting.testPing")}</span>
				</Button.Root>
			</div>
		</div>

		<!-- Secret Key -->
		<div class="space-y-2">
			<Label class="text-xs font-semibold text-foreground">
				{t("ecommerce.setting.secretKey")}
			</Label>
			<div class="flex items-center gap-2">
				<div class="relative flex-1">
					<Input
						type="password"
						bind:value={config.webhookSecret}
						class="font-mono text-xs h-9 bg-background pr-10"
					/>
					<KeyIcon class="size-3.5 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
				</div>
			</div>
		</div>

		<!-- Event Push Switches -->
		<div class="space-y-3 pt-2">
			<Label class="text-xs font-semibold text-foreground block">
				{t("ecommerce.setting.pushEvents")}
			</Label>

			<div class="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden bg-background">
				<div class="p-3.5 flex items-center justify-between">
					<div class="space-y-0.5 pr-4">
						<p class="text-xs font-medium text-foreground">{t("ecommerce.setting.eventOrderCreated")}</p>
						<p class="text-[11px] text-muted-foreground">Memicu sinkronisasi instan saat pembeli checkout pesanan baru.</p>
					</div>
					<Switch bind:checked={config.webhookEvents.orderCreated} />
				</div>

				<div class="p-3.5 flex items-center justify-between">
					<div class="space-y-0.5 pr-4">
						<p class="text-xs font-medium text-foreground">{t("ecommerce.setting.eventOrderPaid")}</p>
						<p class="text-[11px] text-muted-foreground">Payload dikirim saat pembayaran escrow marketplace telah terverifikasi.</p>
					</div>
					<Switch bind:checked={config.webhookEvents.orderPaid} />
				</div>

				<div class="p-3.5 flex items-center justify-between">
					<div class="space-y-0.5 pr-4">
						<p class="text-xs font-medium text-foreground">{t("ecommerce.setting.eventOrderCancelled")}</p>
						<p class="text-[11px] text-muted-foreground">Otomatis mengembalikan kuota stok yang sempat dipotong.</p>
					</div>
					<Switch bind:checked={config.webhookEvents.orderCancelled} />
				</div>

				<div class="p-3.5 flex items-center justify-between">
					<div class="space-y-0.5 pr-4">
						<p class="text-xs font-medium text-foreground">{t("ecommerce.setting.eventTrackingUpdated")}</p>
						<p class="text-[11px] text-muted-foreground">Memperbarui status pengiriman kurir dan nomor resi secara real-time.</p>
					</div>
					<Switch bind:checked={config.webhookEvents.trackingUpdated} />
				</div>

				<div class="p-3.5 flex items-center justify-between">
					<div class="space-y-0.5 pr-4">
						<p class="text-xs font-medium text-foreground">{t("ecommerce.setting.eventStockUpdated")}</p>
						<p class="text-[11px] text-muted-foreground">Kirim sinyal webhook ketika stok produk mencapai batas kritis (low stock alert).</p>
					</div>
					<Switch bind:checked={config.webhookEvents.stockUpdated} />
				</div>
			</div>
		</div>
	</div>

	<!-- SECTION 2: PEMOTONGAN STOCK PRODUK -->
	<div class="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
		<div class="flex items-center gap-2.5 pb-3 border-b border-border/60">
			<div class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
				<BoxIcon class="size-4" />
			</div>
			<div>
				<h2 class="text-sm font-bold text-foreground">
					{t("ecommerce.setting.stockDeductionTitle")}
				</h2>
				<p class="text-xs text-muted-foreground">
					{t("ecommerce.setting.stockDeductionDesc")}
				</p>
			</div>
		</div>

		<!-- Deduction Timing Selection -->
		<div class="space-y-2.5">
			<Label class="text-xs font-semibold text-foreground block">
				{t("ecommerce.setting.deductionTiming")}
			</Label>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<button
					type="button"
					onclick={() => (config.stockDeductionTiming = "order_created")}
					class="p-4 rounded-xl border text-left cursor-pointer transition-all {config.stockDeductionTiming === 'order_created'
						? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-2xs'
						: 'border-border bg-card hover:bg-muted/40'}"
				>
					<p class="text-xs font-bold text-foreground mb-1">Saat Pesanan Dibuat</p>
					<p class="text-[11px] text-muted-foreground leading-relaxed">
						{t("ecommerce.setting.timingOrderCreated")}
					</p>
				</button>

				<button
					type="button"
					onclick={() => (config.stockDeductionTiming = "order_paid")}
					class="p-4 rounded-xl border text-left cursor-pointer transition-all {config.stockDeductionTiming === 'order_paid'
						? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-2xs'
						: 'border-border bg-card hover:bg-muted/40'}"
				>
					<p class="text-xs font-bold text-foreground mb-1">Saat Pembayaran Terkonfirmasi</p>
					<p class="text-[11px] text-muted-foreground leading-relaxed">
						{t("ecommerce.setting.timingOrderPaid")}
					</p>
				</button>
			</div>
		</div>

		<!-- Warehouse Allocation -->
		<div class="space-y-2.5 pt-2">
			<Label class="text-xs font-semibold text-foreground block">
				{t("ecommerce.setting.warehouseAllocation")}
			</Label>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<button
					type="button"
					onclick={() => (config.stockWarehouseAllocation = "auto_nearest")}
					class="p-3.5 rounded-xl border text-left cursor-pointer transition-all {config.stockWarehouseAllocation === 'auto_nearest'
						? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-2xs'
						: 'border-border bg-card hover:bg-muted/40'}"
				>
					<p class="text-xs font-bold text-foreground mb-0.5">Gudang Terdekat Otomatis</p>
					<p class="text-[11px] text-muted-foreground leading-relaxed">
						{t("ecommerce.setting.allocNearest")}
					</p>
				</button>

				<button
					type="button"
					onclick={() => (config.stockWarehouseAllocation = "default_warehouse")}
					class="p-3.5 rounded-xl border text-left cursor-pointer transition-all {config.stockWarehouseAllocation === 'default_warehouse'
						? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-2xs'
						: 'border-border bg-card hover:bg-muted/40'}"
				>
					<p class="text-xs font-bold text-foreground mb-0.5">Gudang Utama Default</p>
					<p class="text-[11px] text-muted-foreground leading-relaxed">
						{t("ecommerce.setting.allocDefault")}
					</p>
				</button>
			</div>
		</div>

		<!-- Safety Stock Buffer -->
		<div class="space-y-2 pt-2 border-t border-border/60">
			<div class="flex items-center justify-between">
				<div>
					<Label class="text-xs font-semibold text-foreground block">
						{t("ecommerce.setting.bufferStock")}
					</Label>
					<p class="text-[11px] text-muted-foreground">
						{t("ecommerce.setting.bufferStockDesc")}
					</p>
				</div>
				<div class="w-28 shrink-0">
					<Input
						type="number"
						min="0"
						max="100"
						bind:value={config.safetyStockBuffer}
						class="text-xs h-9 font-mono text-center"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Save Action Footer -->
	<div class="flex justify-end pt-2">
		<Button.Root
			type="button"
			onclick={handleSave}
			class="h-10 px-6 text-xs font-bold bg-primary text-white hover:bg-primary/90 cursor-pointer flex items-center gap-2 shadow-md"
		>
			<SaveIcon class="size-4" />
			<span>{t("ecommerce.setting.saveBtn")}</span>
		</Button.Root>
	</div>
</div>

