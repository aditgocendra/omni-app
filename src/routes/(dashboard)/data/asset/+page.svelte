<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { initialAssetProducts } from "$lib/data/performance-data.js";
	import type { AssetProductRecord } from "$lib/types/index.js";
	import { t } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";

	// Icons
	import SearchIcon from "@lucide/svelte/icons/search";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
	import Building2Icon from "@lucide/svelte/icons/building-2";
	import PackageIcon from "@lucide/svelte/icons/package";
	import CoinsIcon from "@lucide/svelte/icons/coins";
	import MapPinIcon from "@lucide/svelte/icons/map-pin";
	import DownloadIcon from "@lucide/svelte/icons/download";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";

	// State
	let products = $state<AssetProductRecord[]>([...initialAssetProducts]);
	let selectedWarehouse = $state("all");
	let searchQuery = $state("");
	let selectedIds = $state<string[]>([]);
	let expandedSkuIds = $state<string[]>([]);
	let toastMessage = $state<string | null>(null);

	// Sorting on Qty, Amount
	let sortKey = $state<"qty" | "amount" | null>("amount");
	let sortDirection = $state<"asc" | "desc">("desc");

	// Pagination
	let currentPage = $state(1);
	let perPage = $state(10);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3500);
	}

	function formatRupiah(val: number): string {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(val);
	}

	// Toggle collapsible per SKU
	function toggleExpand(id: string) {
		if (expandedSkuIds.includes(id)) {
			expandedSkuIds = expandedSkuIds.filter((i) => i !== id);
		} else {
			expandedSkuIds = [...expandedSkuIds, id];
		}
	}

	// All unique warehouse names
	const allWarehouses = [
		"Gudang Utama - Central Jakarta",
		"Gudang Surabaya - Rungkut",
		"Gudang Barat - Tangerang",
	];

	// Filtered & computed products based on selected warehouse and search query
	const computedProducts = $derived.by(() => {
		return products
			.map((prod) => {
				if (selectedWarehouse === "all") {
					return {
						...prod,
						displayQty: prod.qty,
						displayAmount: prod.amount,
						displayWarehouses: prod.warehouses,
					};
				}

				const whMatch = prod.warehouses.filter(
					(wh) => wh.warehouseName === selectedWarehouse,
				);
				const whQty = whMatch.reduce((sum, w) => sum + w.qty, 0);
				const whAmount = whQty * prod.hpp;

				return {
					...prod,
					displayQty: whQty,
					displayAmount: whAmount,
					displayWarehouses: whMatch,
				};
			})
			.filter((item) => {
				// Only keep items with available qty in that warehouse or if all
				if (selectedWarehouse !== "all" && item.displayQty === 0) return false;

				if (searchQuery.trim()) {
					const term = searchQuery.toLowerCase().trim();
					const matchName = item.productName.toLowerCase().includes(term);
					const matchSku = item.sku.toLowerCase().includes(term);
					if (!matchName && !matchSku) return false;
				}

				return true;
			});
	});

	// Sorted products based on Qty or Amount
	const sortedProducts = $derived.by(() => {
		const list = [...computedProducts];
		if (!sortKey) return list;

		return list.sort((a, b) => {
			let comp = 0;
			if (sortKey === "qty") {
				comp = a.displayQty - b.displayQty;
			} else if (sortKey === "amount") {
				comp = a.displayAmount - b.displayAmount;
			}
			return sortDirection === "asc" ? comp : -comp;
		});
	});

	// 3 Cards Metrics
	// 1. Total Asset: calculated based on HPP modal of all products in selected warehouse or overall
	const totalAssetValue = $derived(
		sortedProducts.reduce((sum, p) => sum + p.displayAmount, 0),
	);
	// 2. Total Product
	const totalProductsCount = $derived(sortedProducts.length);
	// 3. Total Warehouse
	const totalWarehouseCount = $derived(
		selectedWarehouse === "all" ? allWarehouses.length : 1,
	);

	// Pagination slicing
	const totalPages = $derived(Math.ceil(sortedProducts.length / perPage) || 1);
	const paginatedProducts = $derived(
		sortedProducts.slice((currentPage - 1) * perPage, currentPage * perPage),
	);

	// Select All on Current Page
	const isAllSelected = $derived(
		paginatedProducts.length > 0 &&
			paginatedProducts.every((p) => selectedIds.includes(p.id)),
	);

	function toggleAll() {
		if (isAllSelected) {
			const pageIds = paginatedProducts.map((p) => p.id);
			selectedIds = selectedIds.filter((id) => !pageIds.includes(id));
		} else {
			const toAdd = paginatedProducts
				.map((p) => p.id)
				.filter((id) => !selectedIds.includes(id));
			selectedIds = [...selectedIds, ...toAdd];
		}
	}

	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((i) => i !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function handleSort(key: "qty" | "amount") {
		if (sortKey === key) {
			sortDirection = sortDirection === "asc" ? "desc" : "asc";
		} else {
			sortKey = key;
			sortDirection = "desc";
		}
	}

	function resetFilters() {
		selectedWarehouse = "all";
		searchQuery = "";
		currentPage = 1;
		selectedIds = [];
		showToast("Filter nilai aset berhasil direset");
	}

	function exportAssetReport() {
		showToast("Mengunduh laporan valuasi aset inventaris (Excel)...");
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
	<!-- Toast notification -->
	{#if toastMessage}
		<div
			class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2"
		>
			<CheckCircle2Icon class="size-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Title Modul judul dan sub judul (kegunaan) - justify-between items-center -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
				{t("nav.dataAsset")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground">
				Valuasi total modal inventaris, ketersediaan stok fisik per produk, dan persebaran unit di setiap gudang penyimpanan.
			</p>
		</div>

		<Button.Root
			type="button"
			variant="outline"
			onclick={exportAssetReport}
			class="gap-1.5 h-9 rounded-lg border-border bg-white dark:bg-card px-3.5 text-xs font-semibold text-foreground shadow-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-muted shrink-0"
		>
			<DownloadIcon class="size-3.5 text-muted-foreground" />
			<span>Export Laporan Aset</span>
		</Button.Root>
	</div>

	<!-- 3 Card : Total Asset (dihitung berdasarkan HPP modal), Total Product, Total Warehouse -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<!-- Card 1: Total Asset -->
		<Card.Root class="p-5 border-border bg-white dark:bg-card shadow-xs rounded-xl flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Total Nilai Aset (HPP Modal)
				</span>
				<div class="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
					<CoinsIcon class="size-4" />
				</div>
			</div>
			<div class="mt-3">
				<div class="font-heading text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
					{formatRupiah(totalAssetValue)}
				</div>
				<p class="text-[11px] text-muted-foreground mt-1">
					{#if selectedWarehouse === "all"}
						Akumulasi modal fisik di seluruh gudang
					{:else}
						Akumulasi modal pada {selectedWarehouse}
					{/if}
				</p>
			</div>
		</Card.Root>

		<!-- Card 2: Total Product -->
		<Card.Root class="p-5 border-border bg-white dark:bg-card shadow-xs rounded-xl flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Total Master Produk
				</span>
				<div class="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
					<PackageIcon class="size-4" />
				</div>
			</div>
			<div class="mt-3">
				<div class="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
					{totalProductsCount} <span class="text-xs font-normal text-muted-foreground">Jenis SKU Produk</span>
				</div>
				<p class="text-[11px] text-muted-foreground mt-1">
					Tercatat aktif dalam kalkulasi inventaris
				</p>
			</div>
		</Card.Root>

		<!-- Card 3: Total Warehouse -->
		<Card.Root class="p-5 border-border bg-white dark:bg-card shadow-xs rounded-xl flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Total Fasilitas Gudang
				</span>
				<div class="size-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
					<Building2Icon class="size-4" />
				</div>
			</div>
			<div class="mt-3">
				<div class="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
					{totalWarehouseCount} <span class="text-xs font-normal text-muted-foreground">Fasilitas Aktif</span>
				</div>
				<p class="text-[11px] text-muted-foreground mt-1">
					{#if selectedWarehouse === "all"}
						Hub sentral Jakarta, Surabaya & Tangerang
					{:else}
						Difilter pada 1 fasilitas gudang
					{/if}
				</p>
			</div>
		</Card.Root>
	</div>

	<!-- Filter Bar: Search SKU / Product & Warehouse Selector -->
	<Card.Root class="p-4 border-border bg-white dark:bg-card shadow-xs rounded-xl flex flex-col sm:flex-row items-center gap-3">
		<!-- Search SKU or Product Name (Width Full) -->
		<div class="relative w-full flex-1">
			<SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
			<Input
				type="text"
				placeholder="Cari berdasarkan nama produk atau SKU (e.g. iPhone, APL-IP15PM)..."
				bind:value={searchQuery}
				class="h-10 w-full pl-9 pr-3 rounded-lg border-border bg-white dark:bg-card text-xs sm:text-sm"
			/>
		</div>

		<!-- Warehouse Selector Dropdown -->
		<div class="w-full sm:w-64 shrink-0">
			<Select.Root
				type="single"
				bind:value={selectedWarehouse}
				items={[
					{ value: "all", label: "Semua Fasilitas Gudang" },
					{ value: "Gudang Utama - Central Jakarta", label: "Gudang Utama - Jakarta" },
					{ value: "Gudang Surabaya - Rungkut", label: "Gudang Surabaya - Rungkut" },
					{ value: "Gudang Barat - Tangerang", label: "Gudang Barat - Tangerang" },
				]}
			>
				<Select.Trigger class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs text-foreground cursor-pointer shadow-xs truncate">
					<Select.Value placeholder="Pilih Gudang" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all" label="Semua Fasilitas Gudang">Semua Fasilitas Gudang</Select.Item>
					<Select.Item value="Gudang Utama - Central Jakarta" label="Gudang Utama - Jakarta">Gudang Utama - Jakarta</Select.Item>
					<Select.Item value="Gudang Surabaya - Rungkut" label="Gudang Surabaya - Rungkut">Gudang Surabaya - Rungkut</Select.Item>
					<Select.Item value="Gudang Barat - Tangerang" label="Gudang Barat - Tangerang">Gudang Barat - Tangerang</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Reset Button -->
		<Button.Root
			variant="outline"
			onclick={resetFilters}
			class="h-10 gap-1.5 rounded-lg border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted shadow-xs cursor-pointer shrink-0 w-full sm:w-auto"
		>
			<RotateCcwIcon class="size-3.5 text-muted-foreground" />
			<span>Reset</span>
		</Button.Root>
	</Card.Root>

	<!-- Table Card with Collapsible per SKU & Sort on Qty, Amount -->
	<Card.Root class="border-border bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-slate-50 dark:bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
					<tr>
						<!-- Checkbox -->
						<th class="p-3 w-10 text-center">
							<Checkbox
								checked={isAllSelected}
								onCheckedChange={toggleAll}
								aria-label="Pilih Semua Aset"
							/>
						</th>
						<!-- Expand Toggle icon header -->
						<th class="p-3 w-10 text-center"></th>
						<!-- Product (Photo Product, Nama Produk, SKU) -->
						<th class="p-3 min-w-[280px]">Product</th>
						<!-- HPP Modal Satuan -->
						<th class="p-3 text-right">HPP / Unit</th>
						<!-- Qty (Sortable) -->
						<th class="p-3 text-center">
							<button
								type="button"
								onclick={() => handleSort("qty")}
								class="flex items-center gap-1 mx-auto font-semibold hover:text-foreground cursor-pointer transition-colors"
							>
								<span>Qty Unit</span>
								{#if sortKey === "qty"}
									{#if sortDirection === "asc"}
										<ArrowUpIcon class="size-3.5 text-primary" />
									{:else}
										<ArrowDownIcon class="size-3.5 text-primary" />
									{/if}
								{:else}
									<ArrowUpDownIcon class="size-3.5 text-muted-foreground/60" />
								{/if}
							</button>
						</th>
						<!-- Amount (Sortable) -->
						<th class="p-3 text-right">
							<button
								type="button"
								onclick={() => handleSort("amount")}
								class="flex items-center gap-1 ml-auto font-semibold hover:text-foreground cursor-pointer transition-colors"
							>
								<span>Amount (Total Aset)</span>
								{#if sortKey === "amount"}
									{#if sortDirection === "asc"}
										<ArrowUpIcon class="size-3.5 text-primary" />
									{:else}
										<ArrowDownIcon class="size-3.5 text-primary" />
									{/if}
								{:else}
									<ArrowUpDownIcon class="size-3.5 text-muted-foreground/60" />
								{/if}
							</button>
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border/60">
					{#if paginatedProducts.length === 0}
						<tr>
							<td colspan="6" class="p-8 text-center text-muted-foreground">
								<div class="flex flex-col items-center justify-center gap-2">
									<PackageIcon class="size-8 text-muted-foreground/50" />
									<p class="text-sm font-medium">Tidak ada produk inventaris yang cocok dengan kriteria pencarian</p>
									<Button.Root variant="outline" size="sm" onclick={resetFilters}>
										Reset Filter
									</Button.Root>
								</div>
							</td>
						</tr>
					{:else}
						{#each paginatedProducts as prod (prod.id)}
							{@const isExpanded = expandedSkuIds.includes(prod.id)}
							<!-- Main Row -->
							<tr class={cn("hover:bg-slate-50/70 dark:hover:bg-muted/40 transition-colors", isExpanded && "bg-slate-50/40 dark:bg-muted/20")}>
								<!-- Checkbox -->
								<td class="p-3 text-center">
									<Checkbox
										checked={selectedIds.includes(prod.id)}
										onCheckedChange={() => toggleSelect(prod.id)}
										aria-label={`Pilih ${prod.productName}`}
									/>
								</td>

								<!-- Expand Chevron Toggle Button -->
								<td class="p-3 text-center">
									<Button.Root
										variant="ghost"
										size="icon"
										onclick={() => toggleExpand(prod.id)}
										class="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
										title={isExpanded ? "Tutup Rincian Gudang" : "Lihat Rincian Persebaran Gudang"}
									>
										{#if isExpanded}
											<ChevronDownIcon class="size-4 text-primary" />
										{:else}
											<ChevronRightIcon class="size-4" />
										{/if}
									</Button.Root>
								</td>

								<!-- Product (Photo + Name + SKU) -->
								<td class="p-3">
									<div class="flex items-center gap-3">
										<img
											src={prod.photo}
											alt={prod.productName}
											class="size-11 rounded-lg object-cover border border-border shrink-0 bg-muted"
										/>
										<div class="flex flex-col gap-0.5">
											<span class="font-medium text-foreground text-xs sm:text-sm leading-tight">
												{prod.productName}
											</span>
											<span class="font-mono text-[11px] text-muted-foreground">
												{prod.sku}
											</span>
										</div>
									</div>
								</td>

								<!-- HPP Modal Satuan -->
								<td class="p-3 text-right text-muted-foreground whitespace-nowrap">
									{formatRupiah(prod.hpp)}
								</td>

								<!-- Qty Unit -->
								<td class="p-3 text-center">
									<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
										{prod.displayQty} Unit
									</span>
								</td>

								<!-- Amount (Qty * HPP) -->
								<td class="p-3 text-right font-bold text-foreground whitespace-nowrap">
									{formatRupiah(prod.displayAmount)}
								</td>
							</tr>

							<!-- Collapsible Row per SKU (Breakdown per Warehouse) -->
							{#if isExpanded}
								<tr class="bg-slate-50/80 dark:bg-muted/30 border-b border-border/80 animate-in fade-in">
									<td colspan="6" class="p-3 sm:px-8 sm:py-4">
										<div class="rounded-xl border border-border/70 bg-white dark:bg-card p-4 shadow-xs">
											<div class="flex items-center justify-between pb-3 border-b border-border mb-3">
												<div class="flex items-center gap-2">
													<Building2Icon class="size-4 text-primary" />
													<span class="font-heading font-semibold text-xs sm:text-sm text-foreground">
														Rincian Persebaran Stok & Valuasi Aset: <span class="font-mono text-muted-foreground text-xs">({prod.sku})</span>
													</span>
												</div>
												<span class="text-xs text-muted-foreground">
													{prod.displayWarehouses.length} Gudang Penyimpanan
												</span>
											</div>

											<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
												{#each prod.displayWarehouses as wh}
													<div class="flex flex-col gap-2 p-3 rounded-lg border border-border/60 bg-slate-50/50 dark:bg-muted/40">
														<div class="flex items-start justify-between gap-2">
															<div class="flex flex-col">
																<span class="font-semibold text-xs text-foreground">
																	{wh.warehouseName}
																</span>
																<span class="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
																	<MapPinIcon class="size-3 text-muted-foreground/70" />
																	{wh.location}
																</span>
															</div>
															<Badge
																variant="outline"
																class={cn(
																	"text-[10px] px-2 py-0.5",
																	wh.qty <= wh.minSafetyStock
																		? "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
																		: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
																)}
															>
																{wh.qty <= wh.minSafetyStock ? "Menipis" : "Aman"}
															</Badge>
														</div>

														<div class="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
															<span class="text-muted-foreground">Kuantitas:</span>
															<span class="font-bold text-foreground">{wh.qty} Unit</span>
														</div>

														<div class="flex items-center justify-between text-xs">
															<span class="text-muted-foreground">Valuasi Aset:</span>
															<span class="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(wh.amount)}</span>
														</div>
													</div>
												{/each}
											</div>
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pagination Bar (Minimum 10 per page) -->
		<div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-slate-50/50 dark:bg-muted/20">
			<div class="flex items-center gap-3 text-xs text-muted-foreground">
				<span>
					Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, sortedProducts.length)} dari {sortedProducts.length} produk aset
				</span>
				<div class="flex items-center gap-1.5 ml-2">
					<span>Per halaman:</span>
					<select
						bind:value={perPage}
						onchange={() => (currentPage = 1)}
						class="h-8 rounded border border-border bg-white dark:bg-card px-2 text-xs text-foreground cursor-pointer"
					>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
					</select>
				</div>
			</div>

			<div class="flex items-center gap-1">
				<Button.Root
					variant="outline"
					size="sm"
					disabled={currentPage <= 1}
					onclick={() => (currentPage = Math.max(1, currentPage - 1))}
					class="h-8 px-3 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					Previous
				</Button.Root>
				<div class="px-3 text-xs font-medium text-foreground">
					Halaman {currentPage} dari {totalPages}
				</div>
				<Button.Root
					variant="outline"
					size="sm"
					disabled={currentPage >= totalPages}
					onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
					class="h-8 px-3 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					Next
				</Button.Root>
			</div>
		</div>
	</Card.Root>
</div>

