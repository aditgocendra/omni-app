<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { initialEcommerceStores } from "$lib/data/ecommerce.js";
	import type { EcommerceStoreIntegration } from "$lib/types/index.js";
	import { t } from "$lib/i18n/index.js";

	// Icons
	import StoreIcon from "@lucide/svelte/icons/store";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import XCircleIcon from "@lucide/svelte/icons/x-circle";
	import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
	import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
	import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
	import GlobeIcon from "@lucide/svelte/icons/globe";

	let stores = $state<EcommerceStoreIntegration[]>([...initialEcommerceStores]);
	let toastMessage = $state<string | null>(null);

	// Connect Store Modal
	let isConnectModalOpen = $state(false);
	let newStoreChannel = $state<
		"Shopee" | "Tokopedia" | "Lazada" | "TikTok Shop" | "Blibli"
	>("Shopee");
	let newStoreName = $state("");
	let newStoreAccount = $state("");
	let isSubmitting = $state(false);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3500);
	}

	function handleSyncStore(storeName: string) {
		stores = stores.map((s) => {
			if (s.storeName === storeName) {
				return { ...s, lastSyncAt: "31/10/2026 21:30" };
			}
			return s;
		});
		showToast(`Sinkronisasi data toko "${storeName}" berhasil.`);
	}

	function handleToggleConnection(id: string) {
		stores = stores.map((s) => {
			if (s.id === id) {
				const nextStatus = !s.isConnected;
				return {
					...s,
					isConnected: nextStatus,
					lastSyncAt: nextStatus ? "31/10/2026 21:30" : s.lastSyncAt,
				};
			}
			return s;
		});
		showToast("Status koneksi toko diperbarui.");
	}

	function handleConnectNewStore() {
		if (!newStoreName.trim()) {
			newStoreName = `OmniFlow ${newStoreChannel} Store`;
		}
		if (!newStoreAccount.trim()) {
			newStoreAccount = `${newStoreChannel.toLowerCase()}_store_id`;
		}

		isSubmitting = true;
		setTimeout(() => {
			const newStore: EcommerceStoreIntegration = {
				id: `str-${Date.now()}`,
				channel: newStoreChannel,
				storeName: newStoreName,
				storeAccount: newStoreAccount,
				storeUrl: `https://${newStoreChannel.toLowerCase()}.com/${newStoreAccount}`,
				isConnected: true,
				connectedAt: "31/10/2026",
				lastSyncAt: "31/10/2026 21:30",
				autoSyncStock: true,
				autoSyncOrders: true,
				activeProductCount: 120,
			};

			stores = [newStore, ...stores];
			isSubmitting = false;
			isConnectModalOpen = false;
			newStoreName = "";
			newStoreAccount = "";
			showToast(t("ecommerce.integration.connectSuccess"));
		}, 600);
	}
</script>

<svelte:head>
	<title>{t("ecommerce.integration.title")} | OmniFlow</title>
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

	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
		<div>
			<h1 class="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<GlobeIcon class="size-6 text-primary" />
				<span>{t("ecommerce.integration.title")}</span>
			</h1>
			<p class="text-xs text-muted-foreground mt-0.5 max-w-2xl">
				{t("ecommerce.integration.subtitle")}
			</p>
		</div>

		<!-- Tombol Hubungkan Toko Baru -->
		<Button.Root
			type="button"
			onclick={() => (isConnectModalOpen = true)}
			class="h-9 px-4 text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-center shadow-xs"
		>
			<PlusIcon class="size-4" />
			<span>{t("ecommerce.integration.connectStoreBtn")}</span>
		</Button.Root>
	</div>

	<!-- Marketplace Platforms Overview Cards -->
	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
		{#each ["Shopee", "Tokopedia", "TikTok Shop", "Lazada", "Blibli"] as platform}
			{@const connectedCount = stores.filter((s) => s.channel === platform && s.isConnected).length}
			<div class="p-3.5 rounded-xl border border-border/80 bg-card flex flex-col justify-between space-y-2">
				<div class="flex items-center justify-between">
					<span class="font-bold text-xs text-foreground">{platform}</span>
					{#if connectedCount > 0}
						<span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
					{:else}
						<span class="size-2 rounded-full bg-muted-foreground/40"></span>
					{/if}
				</div>
				<div class="flex items-center justify-between text-[11px] text-muted-foreground">
					<span>Toko Aktif:</span>
					<span class="font-bold font-mono text-foreground">{connectedCount} Toko</span>
				</div>
			</div>
		{/each}
	</div>

	<!-- List Toko Yang Sudah Terhubung Dengan Aplikasi -->
	<div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
		<div class="p-4 border-b border-border/70 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<StoreIcon class="size-4 text-primary" />
				<h2 class="text-xs font-bold text-foreground uppercase tracking-wider">
					{t("ecommerce.integration.connectedStores")} ({stores.length})
				</h2>
			</div>

			<span class="text-[11px] text-muted-foreground">
				Multi-store Channel API v2.4
			</span>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-xs">
				<thead>
					<tr class="border-b border-border/70 bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
						<th class="py-3 px-4 text-left">{t("ecommerce.integration.colStoreName")}</th>
						<th class="py-3 px-4 text-left">{t("ecommerce.integration.colChannel")}</th>
						<th class="py-3 px-4 text-left">{t("ecommerce.integration.colAccount")}</th>
						<th class="py-3 px-4 text-center">{t("ecommerce.integration.colStatus")}</th>
						<th class="py-3 px-4 text-center">Auto-Sync</th>
						<th class="py-3 px-4 text-center">{t("ecommerce.integration.colActiveProducts")}</th>
						<th class="py-3 px-4 text-center">{t("ecommerce.integration.colLastSync")}</th>
						<th class="py-3 px-4 text-right">{t("ecommerce.integration.colActions")}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border/60">
					{#each stores as store}
						<tr class="hover:bg-muted/20 transition-colors">
							<td class="py-3 px-4">
								<div class="min-w-0">
									<p class="font-semibold text-xs text-foreground truncate">{store.storeName}</p>
									{#if store.storeUrl}
										<a
											href={store.storeUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5 truncate max-w-xs"
										>
											<span>{store.storeUrl}</span>
											<ExternalLinkIcon class="size-2.5" />
										</a>
									{/if}
								</div>
							</td>
							<td class="py-3 px-4">
								<Badge variant="outline" class="font-medium text-[11px]">
									{store.channel}
								</Badge>
							</td>
							<td class="py-3 px-4 font-mono text-muted-foreground text-[11px]">
								{store.storeAccount}
							</td>
							<td class="py-3 px-4 text-center">
								{#if store.isConnected}
									<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
										<CheckCircle2Icon class="size-3" />
										{t("ecommerce.integration.statusActive")}
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
										<XCircleIcon class="size-3" />
										{t("ecommerce.integration.statusInactive")}
									</span>
								{/if}
							</td>
							<td class="py-3 px-4 text-center">
								<div class="flex items-center justify-center gap-2">
									<span class="text-[10px] {store.autoSyncStock ? 'text-primary font-semibold' : 'text-muted-foreground'}">Stok</span>
									<span class="text-[10px] text-muted-foreground">•</span>
									<span class="text-[10px] {store.autoSyncOrders ? 'text-primary font-semibold' : 'text-muted-foreground'}">Pesanan</span>
								</div>
							</td>
							<td class="py-3 px-4 text-center font-mono">
								{store.activeProductCount} SKU
							</td>
							<td class="py-3 px-4 text-center font-mono text-muted-foreground text-[11px]">
								{store.lastSyncAt}
							</td>
							<td class="py-3 px-4 text-right">
								<div class="flex items-center justify-end gap-1.5">
									{#if store.isConnected}
										<Button.Root
											type="button"
											variant="outline"
											size="xs"
											onclick={() => handleSyncStore(store.storeName)}
											class="h-7 px-2 text-[11px] cursor-pointer gap-1"
											title={t("ecommerce.integration.syncBtn")}
										>
											<RefreshCwIcon class="size-3 text-muted-foreground" />
											<span class="hidden sm:inline">{t("ecommerce.integration.syncBtn")}</span>
										</Button.Root>
										<Button.Root
											type="button"
											variant="ghost"
											size="xs"
											onclick={() => handleToggleConnection(store.id)}
											class="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 cursor-pointer"
										>
											{t("ecommerce.integration.disconnectBtn")}
										</Button.Root>
									{:else}
										<Button.Root
											type="button"
											size="xs"
											onclick={() => handleToggleConnection(store.id)}
											class="h-7 px-2.5 text-[11px] font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer"
										>
											{t("ecommerce.integration.reconnectBtn")}
										</Button.Root>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Modal Dialog: Penghubungan Toko E-Commerce Baru -->
<Dialog.Root bind:open={isConnectModalOpen}>
	<Dialog.Content class="max-w-md p-6 sm:rounded-2xl">
		<Dialog.Header>
			<Dialog.Title class="font-heading text-lg font-bold flex items-center gap-2">
				<ShieldCheckIcon class="size-5 text-primary" />
				<span>{t("ecommerce.integration.connectModalTitle")}</span>
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("ecommerce.integration.connectModalDesc")}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 my-2 text-xs">
			<div>
				<Label class="text-xs font-semibold text-foreground mb-1 block">
					{t("ecommerce.integration.selectPlatform")}
				</Label>
				<Select.Root
					type="single"
					bind:value={newStoreChannel}
					items={[
						{ value: "Shopee", label: "Shopee Open Platform" },
						{ value: "Tokopedia", label: "Tokopedia Seller API" },
						{ value: "TikTok Shop", label: "TikTok Shop Partner Center" },
						{ value: "Lazada", label: "Lazada Open Platform" },
						{ value: "Blibli", label: "Blibli Merchant API" },
					]}
				>
					<Select.Trigger class="h-9 w-full text-xs">
						<Select.Value />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="Shopee" label="Shopee Open Platform">Shopee Open Platform</Select.Item>
						<Select.Item value="Tokopedia" label="Tokopedia Seller API">Tokopedia Seller API</Select.Item>
						<Select.Item value="TikTok Shop" label="TikTok Shop Partner Center">TikTok Shop Partner Center</Select.Item>
						<Select.Item value="Lazada" label="Lazada Open Platform">Lazada Open Platform</Select.Item>
						<Select.Item value="Blibli" label="Blibli Merchant API">Blibli Merchant API</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div>
				<Label class="text-xs font-semibold text-foreground mb-1 block">
					Nama Toko Anda
				</Label>
				<Input
					type="text"
					bind:value={newStoreName}
					placeholder="Contoh: OmniFlow Jakarta Official Store"
					class="text-xs h-9"
				/>
			</div>

			<div>
				<Label class="text-xs font-semibold text-foreground mb-1 block">
					{t("ecommerce.integration.storeUrlOrUsername")}
				</Label>
				<Input
					type="text"
					bind:value={newStoreAccount}
					placeholder="Contoh: omniflow_jakarta"
					class="text-xs h-9"
				/>
			</div>

			<div class="p-3 rounded-xl border border-border/70 bg-muted/20 text-[11px] text-muted-foreground space-y-1">
				<p class="font-semibold text-foreground flex items-center gap-1.5">
					<ShieldCheckIcon class="size-3.5 text-primary" />
					<span>Keamanan Otorisasi OAuth 2.0</span>
				</p>
				<p class="leading-relaxed">
					Sistem akan mengarahkan Anda ke portal login resmi marketplace untuk memberikan izin akses sinkronisasi stok dan pesanan secara aman tanpa menyimpan kata sandi akun Anda.
				</p>
			</div>
		</div>

		<Dialog.Footer class="flex flex-row items-center justify-end gap-2 pt-2">
			<Button.Root
				type="button"
				variant="outline"
				size="sm"
				onclick={() => (isConnectModalOpen = false)}
				class="cursor-pointer text-xs h-9"
			>
				{t("common.cancel")}
			</Button.Root>
			<Button.Root
				type="button"
				size="sm"
				disabled={isSubmitting}
				onclick={handleConnectNewStore}
				class="bg-primary text-white hover:bg-primary/90 font-semibold cursor-pointer text-xs h-9 gap-1.5"
			>
				<span>{isSubmitting ? "Menghubungkan..." : t("ecommerce.integration.proceedAuth")}</span>
			</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

