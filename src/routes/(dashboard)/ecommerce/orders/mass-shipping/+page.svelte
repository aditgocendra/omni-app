<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { initialEcommerceOrders } from "$lib/data/ecommerce.js";
	import type { EcommerceOrderRecord } from "$lib/types/index.js";
	import { t } from "$lib/i18n/index.js";

	// Icons
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import TruckIcon from "@lucide/svelte/icons/truck";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import PrinterIcon from "@lucide/svelte/icons/printer";
	import SendIcon from "@lucide/svelte/icons/send";
	import PackageIcon from "@lucide/svelte/icons/package";
	import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";

	// Mass Shipping state
	let pendingOrders = $state<EcommerceOrderRecord[]>(
		initialEcommerceOrders.filter((o) => o.orderStatus === "Perlu Diproses"),
	);
	let selectedIds = $state<string[]>(
		initialEcommerceOrders
			.filter((o) => o.orderStatus === "Perlu Diproses")
			.map((o) => o.id),
	);
	let bulkMethod = $state<"dropoff" | "pickup">("dropoff");
	let isProcessed = $state(false);
	let toastMessage = $state<string | null>(null);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3500);
	}

	function toggleSelectAll() {
		if (selectedIds.length === pendingOrders.length) {
			selectedIds = [];
		} else {
			selectedIds = pendingOrders.map((o) => o.id);
		}
	}

	function toggleOrder(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function handleBulkProcess() {
		if (selectedIds.length === 0) return;
		isProcessed = true;
		showToast(
			t("ecommerce.massShipping.bulkSuccess", {
				count: selectedIds.length,
			}),
		);
	}

	function formatRupiah(amount?: number): string {
		if (amount == null) return "-";
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	}
</script>

<svelte:head>
	<title>{t("ecommerce.massShipping.title")} | OmniFlow</title>
</svelte:head>

<div class="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
	<!-- Toast Notification -->
	{#if toastMessage}
		<div
			class="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl animate-in slide-in-from-bottom-5 duration-200"
		>
			<CheckCircle2Icon class="size-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Header: Back button + Title & Subtitle -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
		<div class="flex items-center gap-3">
			<Button.Root
				variant="outline"
				size="icon-sm"
				href="/ecommerce/orders"
				class="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
				title={t("ecommerce.massShipping.backToOrders")}
			>
				<ArrowLeftIcon class="size-4" />
			</Button.Root>
			<div>
				<h1 class="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
					<TruckIcon class="size-6 text-primary" />
					<span>{t("ecommerce.massShipping.title")}</span>
				</h1>
				<p class="text-xs text-muted-foreground mt-0.5">
					{t("ecommerce.massShipping.subtitle")}
				</p>
			</div>
		</div>

		{#if isProcessed}
			<Button.Root
				type="button"
				size="sm"
				onclick={() => window.print()}
				class="h-9 px-4 text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer gap-2"
			>
				<PrinterIcon class="size-4" />
				<span>Cetak Semua Label ({selectedIds.length})</span>
			</Button.Root>
		{/if}
	</div>

	<!-- Steps Tracker Bar -->
	<div class="grid grid-cols-3 gap-2 p-3 rounded-xl border border-border/80 bg-card text-center text-xs">
		<div class="p-2 rounded-lg font-semibold {selectedIds.length > 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}">
			{t("ecommerce.massShipping.step1")} ({selectedIds.length} dipilih)
		</div>
		<div class="p-2 rounded-lg font-semibold {bulkMethod ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}">
			{t("ecommerce.massShipping.step2")} ({bulkMethod === 'dropoff' ? 'Drop-off Gerai' : 'Pickup Gudang'})
		</div>
		<div class="p-2 rounded-lg font-semibold {isProcessed ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}">
			{t("ecommerce.massShipping.step3")} {isProcessed ? '(Selesai)' : ''}
		</div>
	</div>

	<!-- Method Selection -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
		<button
			type="button"
			onclick={() => (bulkMethod = "dropoff")}
			class="p-4 rounded-xl border text-left cursor-pointer transition-all {bulkMethod === 'dropoff'
				? 'border-primary bg-primary/5 ring-1 ring-primary/30'
				: 'border-border bg-card hover:bg-muted/40'}"
		>
			<div class="flex items-center gap-2 mb-1">
				<SendIcon class="size-4 text-primary" />
				<span class="text-xs font-bold text-foreground">Drop-off Massal ke Gerai Kurir</span>
			</div>
			<p class="text-[11px] text-muted-foreground">
				Paket dibawa langsung ke gerai agen kurir rekanan (J&T, SiCepat, SPX, Anteraja).
			</p>
		</button>

		<button
			type="button"
			onclick={() => (bulkMethod = "pickup")}
			class="p-4 rounded-xl border text-left cursor-pointer transition-all {bulkMethod === 'pickup'
				? 'border-primary bg-primary/5 ring-1 ring-primary/30'
				: 'border-border bg-card hover:bg-muted/40'}"
		>
			<div class="flex items-center gap-2 mb-1">
				<TruckIcon class="size-4 text-primary" />
				<span class="text-xs font-bold text-foreground">Pickup Massal ke Gudang Utama</span>
			</div>
			<p class="text-[11px] text-muted-foreground">
				Armada kurir menjemput paket sekaligus ke Gudang Pusat OmniFlow Jakarta.
			</p>
		</button>
	</div>

	<!-- Batch Orders Table -->
	<div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
		<div class="p-3 sm:p-4 border-b border-border/70 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<Checkbox
					checked={selectedIds.length === pendingOrders.length && pendingOrders.length > 0}
					onCheckedChange={toggleSelectAll}
				/>
				<span class="text-xs font-semibold text-foreground">
					{t("ecommerce.massShipping.selectedOrders")} ({selectedIds.length} dari {pendingOrders.length} pesanan)
				</span>
			</div>

			<Button.Root
				type="button"
				size="sm"
				disabled={selectedIds.length === 0 || isProcessed}
				onclick={handleBulkProcess}
				class="h-8 px-4 text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer disabled:opacity-50"
			>
				{t("ecommerce.massShipping.applyBulk")} ({selectedIds.length})
			</Button.Root>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-xs">
				<thead>
					<tr class="border-b border-border/70 bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
						<th class="py-2.5 px-3 w-10"></th>
						<th class="py-2.5 px-3 text-left">No. Pesanan</th>
						<th class="py-2.5 px-3 text-left">Kanal / Toko</th>
						<th class="py-2.5 px-3 text-left">Item Produk</th>
						<th class="py-2.5 px-3 text-center">Jasa Kirim</th>
						<th class="py-2.5 px-3 text-right">Nilai Pesanan</th>
						<th class="py-2.5 px-3 text-center">Status / Resi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border/60">
					{#each pendingOrders as order}
						<tr class="hover:bg-muted/20 transition-colors {selectedIds.includes(order.id) ? 'bg-primary/2' : ''}">
							<td class="py-2.5 px-3 text-center">
								<Checkbox
									checked={selectedIds.includes(order.id)}
									onCheckedChange={() => toggleOrder(order.id)}
								/>
							</td>
							<td class="py-2.5 px-3 font-mono font-bold text-foreground">
								{order.orderNumber}
							</td>
							<td class="py-2.5 px-3">
								<span class="font-medium text-foreground block">{order.storeAccount}</span>
								<span class="text-[10px] text-muted-foreground">{order.channel}</span>
							</td>
							<td class="py-2.5 px-3">
								<div class="flex items-center gap-2">
									<img
										src={order.items[0]?.image}
										alt={order.items[0]?.productName}
										class="size-8 rounded object-cover border border-border/60 shrink-0"
									/>
									<div class="min-w-0 max-w-xs">
										<p class="font-medium text-xs text-foreground truncate">{order.items[0]?.productName}</p>
										<p class="text-[10px] text-muted-foreground">Varian: {order.items[0]?.variant}</p>
									</div>
								</div>
							</td>
							<td class="py-2.5 px-3 text-center">
								<span class="font-mono text-xs font-semibold text-primary block">{order.shippingService}</span>
								<span class="text-[10px] text-muted-foreground">{order.courierName}</span>
							</td>
							<td class="py-2.5 px-3 text-right font-mono font-bold text-foreground">
								{formatRupiah(order.revenue)}
							</td>
							<td class="py-2.5 px-3 text-center">
								{#if isProcessed && selectedIds.includes(order.id)}
									<span class="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
										<CheckCircle2Icon class="size-3" />
										Resi: BATCH-{order.orderNumber.slice(-4)}
									</span>
								{:else}
									<Badge variant="outline" class="text-[10px]">
										{order.orderStatus}
									</Badge>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

