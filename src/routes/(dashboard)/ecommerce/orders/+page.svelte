<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import DataTable from "$lib/components/common/DataTable.svelte";
	import type { DataTableColumn } from "$lib/components/common/data-table-types.js";
	import { initialEcommerceOrders } from "$lib/data/ecommerce.js";
	import type {
		EcommerceOrderRecord,
		EcommerceOrderItem,
		ShippingServiceType,
	} from "$lib/types/index.js";
	import { t } from "$lib/i18n/index.js";

	// Icons
	import SearchIcon from "@lucide/svelte/icons/search";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import TruckIcon from "@lucide/svelte/icons/truck";
	import SendIcon from "@lucide/svelte/icons/send";
	import PrinterIcon from "@lucide/svelte/icons/printer";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import ClockIcon from "@lucide/svelte/icons/clock";
	import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import PackageIcon from "@lucide/svelte/icons/package";
	import LayersIcon from "@lucide/svelte/icons/layers";
	import ZapIcon from "@lucide/svelte/icons/zap";
	import TagIcon from "@lucide/svelte/icons/tag";
	import BarcodeIcon from "@lucide/svelte/icons/scan-barcode";
	import MapPinIcon from "@lucide/svelte/icons/map-pin";
	import UserIcon from "@lucide/svelte/icons/user";
	import PhoneIcon from "@lucide/svelte/icons/phone";
	import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
	import StatusDot from "#lib/components/common/StatusDot.svelte";

	// Orders state
	let orders = $state<EcommerceOrderRecord[]>([...initialEcommerceOrders]);
	let selectedIds = $state<(string | number)[]>([]);
	let toastMessage = $state<string | null>(null);

	// Search & Filters
	let searchType = $state<"orderNumber" | "product">("orderNumber");
	let searchKeywordInput = $state("");
	let appliedSearchType = $state<"orderNumber" | "product">("orderNumber");
	let appliedSearchKeyword = $state("");
	let selectedShopeeAccount = $state("all");
	let selectedStatus = $state("all");

	// Pagination & Sorting
	let currentPage = $state(1);
	let perPage = $state(10);
	let sortKey = $state<string | null>("date");
	let sortDirection = $state<"asc" | "desc" | "none">("desc");

	// Modals State
	let isPickupModalOpen = $state(false);
	let isShipmentModalOpen = $state(false);
	let isPrintModalOpen = $state(false);
	let isDetailModalOpen = $state(false);
	let activeOrder = $state<EcommerceOrderRecord | null>(null);

	// Modal form fields
	let pickupWarehouse = $state(
		"Gudang Utama - Central Jakarta (Jl. Gatot Subroto No. 8)",
	);
	let pickupTimeWindow = $state("14:00 - 17:00 Hari Ini");
	let shipmentMethod = $state<"dropoff" | "courier">("dropoff");
	let dropoffBranch = $state("Gerai J&T Express Tomang (Jl. Mandala No. 12)");

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3500);
	}

	function parseDate(dateStr: string): number {
		// Format: "DD/MM/YYYY"
		if (!dateStr) return 0;
		const parts = dateStr.split("/");
		if (parts.length === 3) {
			const day = parseInt(parts[0], 10);
			const month = parseInt(parts[1], 10) - 1;
			const year = parseInt(parts[2], 10);
			return new Date(year, month, day).getTime();
		}
		return 0;
	}

	function formatRupiah(amount?: number): string {
		if (amount == null) return "-";
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	}

	function formatDeadline(val: string): string {
		if (!val) return "-";
		const match = val.match(/\d{2}\/\d{2}\/\d{4}/);
		const date = match ? match[0] : "02/11/2026";
		return t("ecommerce.orders.deadlineNotice", { date });
	}

	function handleApplySearch() {
		appliedSearchType = searchType;
		appliedSearchKeyword = searchKeywordInput.trim().toLowerCase();
		currentPage = 1;
	}

	function handleResetFilters() {
		searchType = "orderNumber";
		searchKeywordInput = "";
		appliedSearchType = "orderNumber";
		appliedSearchKeyword = "";
		selectedShopeeAccount = "all";
		selectedStatus = "all";
		sortKey = "date";
		sortDirection = "desc";
		currentPage = 1;
		selectedIds = [];
		showToast(t("ecommerce.orders.reset"));
	}

	// Dropdown Options
	const searchTypeOptions = $derived([
		{
			value: "orderNumber",
			label: t("ecommerce.orders.searchTypeOrderNumber"),
		},
		{ value: "product", label: t("ecommerce.orders.searchTypeProduct") },
	]);

	const shopeeAccountOptions = $derived([
		{ value: "all", label: t("ecommerce.orders.allShopeeAccounts") },
		{ value: "Official Store Jakarta", label: "Official Store Jakarta" },
		{ value: "Surabaya Branch Store", label: "Surabaya Branch Store" },
		{ value: "Bandung Lifestyle Shop", label: "Bandung Lifestyle Shop" },
	]);

	const statusOptions = $derived([
		{ value: "all", label: t("ecommerce.orders.allStatuses") },
		{
			value: "Perlu Diproses",
			label: t("ecommerce.orders.statusToProcess"),
		},
		{
			value: "Telah Diproses",
			label: t("ecommerce.orders.statusProcessed"),
		},
	]);

	// Filtered & Sorted Data
	const filteredOrders = $derived(
		orders.filter((order) => {
			// Account filter
			if (
				selectedShopeeAccount !== "all" &&
				order.storeAccount !== selectedShopeeAccount
			) {
				return false;
			}

			// Status filter
			if (selectedStatus !== "all") {
				if (order.orderStatus !== selectedStatus) return false;
			}

			// Search keyword filter (applied only when search button is triggered)
			if (appliedSearchKeyword) {
				if (appliedSearchType === "orderNumber") {
					return order.orderNumber
						.toLowerCase()
						.includes(appliedSearchKeyword);
				} else if (appliedSearchType === "product") {
					return order.items.some(
						(i) =>
							i.productName
								.toLowerCase()
								.includes(appliedSearchKeyword) ||
							i.variant
								.toLowerCase()
								.includes(appliedSearchKeyword) ||
							i.sku.toLowerCase().includes(appliedSearchKeyword),
					);
				}
			}

			return true;
		}),
	);

	const sortedOrders = $derived(
		[...filteredOrders].sort((a, b) => {
			if (!sortKey || sortDirection === "none") return 0;

			if (sortKey === "date") {
				const valA = parseDate(a.date);
				const valB = parseDate(b.date);
				return sortDirection === "asc" ? valA - valB : valB - valA;
			}

			if (sortKey === "shippingStatus") {
				const valA = a.shippingStatus.toLowerCase();
				const valB = b.shippingStatus.toLowerCase();
				return sortDirection === "asc"
					? valA.localeCompare(valB)
					: valB.localeCompare(valA);
			}

			if (sortKey === "revenue") {
				return sortDirection === "asc"
					? a.revenue - b.revenue
					: b.revenue - a.revenue;
			}

			return 0;
		}),
	);

	const paginatedOrders = $derived(
		sortedOrders.slice((currentPage - 1) * perPage, currentPage * perPage),
	);

	// Columns configuration
	const columns = $derived<DataTableColumn<EcommerceOrderRecord>[]>([
		{
			id: "product",
			header: t("ecommerce.orders.colProduct"),
			class: "min-w-[320px]",
		},
		{
			id: "shippingStatus",
			header: t("ecommerce.orders.colShippingStatus"),
			sortable: true,
			accessorFn: (row: EcommerceOrderRecord) => row.shippingStatus,
			class: "min-w-[260px]",
		},
		{
			id: "shippingService",
			header: t("ecommerce.orders.colShippingServices"),
			align: "left",
			class: "min-w-[150px]",
		},
		{
			id: "revenue",
			header: t("ecommerce.orders.colRevenue"),
			sortable: true,
			accessorFn: (row: EcommerceOrderRecord) => row.revenue,
			align: "left",
			class: "min-w-[130px]",
		},
		{
			id: "date",
			header: t("ecommerce.orders.colDate"),
			sortable: true,
			accessorFn: (row: EcommerceOrderRecord) => parseDate(row.date),
			align: "center",
			class: "min-w-[110px]",
		},
		{
			id: "actions",
			header: t("ecommerce.orders.colActions"),
			align: "right",
			class: "min-w-[160px]",
		},
	]);

	function handleSort(key: string, direction: "asc" | "desc" | "none") {
		sortKey = key;
		sortDirection = direction;
	}

	// Action triggers
	function openPickupModal(order: EcommerceOrderRecord) {
		activeOrder = order;
		isPickupModalOpen = true;
	}

	function confirmPickup() {
		if (!activeOrder) return;
		orders = orders.map((o) => {
			if (o.id === activeOrder?.id) {
				return {
					...o,
					orderStatus: "Telah Diproses",
					shippingStatus: "Telah Diproses",
					isArranged: true,
					trackingNumber:
						o.trackingNumber ||
						`GRB-${Math.floor(100000000 + Math.random() * 900000000)}`,
				};
			}
			return o;
		});
		showToast(
			t("ecommerce.orders.pickupSuccess", {
				order: activeOrder.orderNumber,
			}),
		);
		isPickupModalOpen = false;
	}

	function openShipmentModal(order: EcommerceOrderRecord) {
		activeOrder = order;
		isShipmentModalOpen = true;
	}

	function confirmShipment() {
		if (!activeOrder) return;
		orders = orders.map((o) => {
			if (o.id === activeOrder?.id) {
				return {
					...o,
					orderStatus: "Telah Diproses",
					shippingStatus: "Telah Diproses",
					isArranged: true,
					trackingNumber:
						o.trackingNumber ||
						`JT-${Math.floor(100000000 + Math.random() * 900000000)}`,
				};
			}
			return o;
		});
		showToast(
			t("ecommerce.orders.shipmentSuccess", {
				order: activeOrder.orderNumber,
			}),
		);
		isShipmentModalOpen = false;
	}

	function openPrintModal(order: EcommerceOrderRecord) {
		activeOrder = order;
		isPrintModalOpen = true;
	}

	function openDetailModal(order: EcommerceOrderRecord) {
		activeOrder = order;
		isDetailModalOpen = true;
	}
</script>

<svelte:head>
	<title>{t("ecommerce.orders.title")} | OmniFlow</title>
</svelte:head>

<div class="space-y-5 p-4 sm:p-6 lg:p-8 mx-auto">
	<!-- Toast Notification -->
	{#if toastMessage}
		<div
			class="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl animate-in slide-in-from-bottom-5 duration-200"
		>
			<CheckCircle2Icon class="size-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Header: Title, Subtitle & Mass Shipping Button (justify-between, items-center) -->
	<div
		class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-border/60"
	>
		<div>
			<h1
				class="font-heading text-2xl font-bold tracking-tight text-foreground"
			>
				{t("ecommerce.orders.title")}
			</h1>
			<p
				class="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed"
			>
				{t("ecommerce.orders.subtitle")}
			</p>
		</div>

		<!-- Tombol Pengiriman Massal (Redirect ke /ecommerce/orders/mass-shipping) -->
		<Button.Root
			variant="default"
			href="/ecommerce/orders/mass-shipping"
			class="h-9 px-4 text-xs font-semibold bg-primary text-white hover:bg-primary/90 shadow-xs cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-center"
		>
			<TruckIcon class="size-4" />
			<span>{t("ecommerce.orders.massShippingBtn")}</span>
		</Button.Root>
	</div>

	<!-- Filter & Search Bar: Width Full, Dropdown Search Type, Account Filter, Status Filter, Reset -->
	<div
		class="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3 sm:p-4 shadow-2xs"
	>
		<div
			class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 w-full"
		>
			<!-- Combined Search Dropdown + Text Input + Trigger Search Button -->
			<div
				class="flex flex-1 items-stretch rounded-lg border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
			>
				<!-- Search Mode Dropdown -->
				<div class="border-r border-border/70 bg-muted/30 shrink-0">
					<Select.Root
						type="single"
						bind:value={searchType}
						items={searchTypeOptions}
					>
						<Select.Trigger
							class="rounded-r-none h-9 border-0 bg-transparent px-3 text-xs font-medium focus:ring-0 focus:ring-offset-0 cursor-pointer min-w-32"
						>
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							{#each searchTypeOptions as opt}
								<Select.Item
									value={opt.value}
									label={opt.label}
								>
									{opt.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Search Input -->
				<input
					type="text"
					bind:value={searchKeywordInput}
					onkeydown={(e) => {
						if (e.key === "Enter") handleApplySearch();
					}}
					placeholder={searchType === "orderNumber"
						? "Cari nomor pesanan (cth: 261031SHP001)..."
						: "Cari nama produk, SKU, atau varian..."}
					class="flex-1 min-w-0 bg-transparent px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none"
				/>

				<!-- Trigger Search Button -->
				<Button.Root
					type="button"
					size="sm"
					onclick={handleApplySearch}
					class="rounded-l-none rounded-r-lg h-9 px-4 text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer flex items-center gap-1.5 shrink-0"
				>
					<SearchIcon class="size-3.5" />
					<span>{t("ecommerce.orders.searchBtn")}</span>
				</Button.Root>
			</div>

			<!-- Filter Shopee Account -->
			<div class="w-full lg:w-56 shrink-0">
				<Select.Root
					type="single"
					bind:value={selectedShopeeAccount}
					items={shopeeAccountOptions}
				>
					<Select.Trigger
						class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium cursor-pointer"
					>
						<Select.Value
							placeholder={t(
								"ecommerce.orders.filterShopeeAccount",
							)}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each shopeeAccountOptions as acc}
							<Select.Item value={acc.value} label={acc.label}>
								{acc.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Filter Order Status (Semua, Perlu Diproses, Telah Diproses) -->
			<div class="w-full lg:w-48 shrink-0">
				<Select.Root
					type="single"
					bind:value={selectedStatus}
					items={statusOptions}
				>
					<Select.Trigger
						class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium cursor-pointer"
					>
						<Select.Value
							placeholder={t("ecommerce.orders.filterStatus")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each statusOptions as st}
							<Select.Item value={st.value} label={st.label}>
								{st.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Reset Button -->
			<Button.Root
				type="button"
				variant="outline"
				size="sm"
				onclick={handleResetFilters}
				class="h-9 px-3.5 text-xs font-medium gap-1.5 cursor-pointer shrink-0 w-full lg:w-auto"
			>
				<RotateCcwIcon class="size-3.5 text-muted-foreground" />
				<span>{t("ecommerce.orders.reset")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- Orders DataTable with Collapsible Rows & Minimum Pagination 10 -->
	<div
		class="rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden"
	>
		<DataTable
			data={paginatedOrders}
			{columns}
			page={currentPage}
			{perPage}
			perPageOptions={[10, 20, 50]}
			{sortKey}
			{sortDirection}
			onSort={handleSort}
			selectable={true}
			{selectedIds}
			onSelectionChange={(ids) => (selectedIds = ids)}
		>
			{#snippet cell({ item, column })}
				{#if column.id === "product"}
					<!-- Product: Photo, Product Name, Variant -->
					<div class="flex items-start gap-2.5 py-1">
						<!-- Thumbnail Photo of primary item -->
						<div
							class="size-11 rounded-lg border border-border/80 bg-muted/40 overflow-hidden shrink-0 flex items-center justify-center relative"
						>
							{#if item.items[0]?.image}
								<img
									src={item.items[0].image}
									alt={item.items[0].productName}
									class="size-full object-cover"
								/>
							{:else}
								<PackageIcon
									class="size-5 text-muted-foreground"
								/>
							{/if}
						</div>

						<!-- Info text -->
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-1.5 mb-0.5">
								<button
									type="button"
									class="font-mono text-[11px] font-bold text-foreground hover:text-primary transition-colors cursor-pointer text-left"
									onclick={() => openDetailModal(item)}
								>
									{item.orderNumber}
								</button>
								<span
									class="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20"
								>
									{item.channel}
								</span>
							</div>

							<p
								class="font-medium text-xs text-foreground truncate max-w-xs sm:max-w-md"
							>
								{item.items[0]?.productName ?? "-"}
							</p>

							<div
								class="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground"
							>
								<span
									class="inline-flex items-center gap-1 font-medium text-foreground/80"
								>
									<LayersIcon
										class="size-3 text-primary/70 shrink-0"
									/>
									Variant : {item.items[0]?.variant ?? "-"}
								</span>
								{#if item.items.length > 1}
									<span
										class="text-[10px] text-primary font-semibold"
									>
										+{item.items.length - 1} varian lainnya
									</span>
								{/if}
							</div>
						</div>
					</div>
				{:else if column.id === "shippingStatus"}
					<!-- Status Shipping: Status Pengiriman + Batas Waktu Warning -->
					<div class="space-y-1.5 py-1">
						<span
							class="inline-flex items-center gap-1.5 text-xs font-medium"
						>
							<StatusDot
								status={item.orderStatus === "Telah Diproses"
									? "online"
									: "pending"}
								ping={item.orderStatus === "Perlu Diproses"}
							/>
							<span class="capitalize">{item.shippingStatus}</span
							>
						</span>

						<!-- Batas Waktu Notice -->
						<p
							class="text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1"
						>
							<span>{formatDeadline(item.shippingDeadline)}</span>
						</p>
					</div>
				{:else if column.id === "shippingService"}
					<!-- Shipping Services: Instant, Instant Prioritas, Hemat, atau Reguler -->

					<div
						class="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground bg-muted/60 px-2.5 py-1 rounded-md"
					>
						{item.shippingService}
					</div>
				{:else if column.id === "revenue"}
					<span class="font-mono text-xs font-bold text-foreground">
						{formatRupiah(item.revenue)}
					</span>
				{:else if column.id === "date"}
					<div class="text-center py-1">
						<span
							class="font-mono text-xs text-muted-foreground font-medium"
						>
							{item.date}
						</span>
					</div>
				{:else if column.id === "actions"}
					<!-- Actions:
					   - If Instant / Instant Prioritas & !isArranged: Atur Pickup
					   - If Reguler / Hemat & !isArranged: Atur Pengiriman
					   - If already arranged (or Telah Diproses): Icon Detail & Cetak Label
					-->
					<div class="flex items-center justify-end gap-1.5 py-1">
						{#if !item.isArranged && item.orderStatus !== "Telah Diproses"}
							{#if item.shippingService === "Instant" || item.shippingService === "Instant Prioritas"}
								<Button.Root
									type="button"
									size="xs"
									onclick={() => openPickupModal(item)}
									class="h-7 px-2.5 text-[11px] font-semibold bg-foreground text-background hover:bg-foreground/90 cursor-pointer gap-1 shadow-xs"
								>
									<TruckIcon class="size-3" />
									<span
										>{t(
											"ecommerce.orders.arrangePickup",
										)}</span
									>
								</Button.Root>
							{:else}
								<Button.Root
									type="button"
									size="xs"
									onclick={() => openShipmentModal(item)}
									class="h-7 px-2.5 text-[11px] font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer gap-1 shadow-xs"
								>
									<SendIcon class="size-3" />
									<span
										>{t(
											"ecommerce.orders.arrangeShipment",
										)}</span
									>
								</Button.Root>
							{/if}
						{:else}
							<!-- Sudah diatur: button Icon Detail dan Cetak Label -->
							<Button.Root
								type="button"
								variant="outline"
								size="icon-xs"
								onclick={() => openDetailModal(item)}
								class="size-7 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
								title={t("ecommerce.orders.detail")}
							>
								<EyeIcon class="size-3.5" />
							</Button.Root>

							<Button.Root
								type="button"
								variant="outline"
								size="xs"
								onclick={() => openPrintModal(item)}
								class="h-7 px-2.5 text-[11px] font-semibold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer gap-1 shadow-2xs"
							>
								<PrinterIcon class="size-3.5" />
								<span>{t("ecommerce.orders.printLabel")}</span>
							</Button.Root>
						{/if}
					</div>
				{/if}
			{/snippet}
		</DataTable>
	</div>
</div>

<!-- Modal 1: Atur Pickup (Untuk Instant / Instant Prioritas) -->
<Dialog.Root bind:open={isPickupModalOpen}>
	<Dialog.Content class="max-w-md p-6 sm:rounded-2xl">
		{#if activeOrder}
			<Dialog.Header>
				<Dialog.Title
					class="font-heading text-lg font-bold flex items-center gap-2"
				>
					<TruckIcon class="size-5 text-primary" />
					<span>{t("ecommerce.orders.pickupModalTitle")}</span>
				</Dialog.Title>
				<Dialog.Description class="text-xs text-muted-foreground">
					{t("ecommerce.orders.pickupModalDesc")}
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4 my-2 text-xs">
				<div
					class="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1"
				>
					<div class="flex justify-between items-center text-[11px]">
						<span class="text-muted-foreground">No. Pesanan:</span>
						<span class="font-mono font-bold text-foreground"
							>{activeOrder.orderNumber}</span
						>
					</div>
					<div class="flex justify-between items-center text-[11px]">
						<span class="text-muted-foreground">Layanan:</span>
						<span class="font-semibold text-primary"
							>{activeOrder.shippingService} ({activeOrder.courierName})</span
						>
					</div>
					<div class="flex justify-between items-center text-[11px]">
						<span class="text-muted-foreground">Penerima:</span>
						<span class="text-foreground"
							>{activeOrder.customerName}</span
						>
					</div>
				</div>

				<div>
					<Label
						class="text-xs font-semibold text-foreground mb-1 block"
					>
						{t("ecommerce.orders.pickupAddress")}
					</Label>
					<Input
						type="text"
						bind:value={pickupWarehouse}
						class="text-xs h-9"
					/>
				</div>

				<div>
					<Label
						class="text-xs font-semibold text-foreground mb-1 block"
					>
						{t("ecommerce.orders.pickupTimeSlot")}
					</Label>
					<Select.Root
						type="single"
						bind:value={pickupTimeWindow}
						items={[
							{
								value: "14:00 - 17:00 Hari Ini",
								label: "14:00 - 17:00 Hari Ini (Slot Tercepat)",
							},
							{
								value: "17:00 - 20:00 Hari Ini",
								label: "17:00 - 20:00 Hari Ini",
							},
							{
								value: "09:00 - 12:00 Besok Pagi",
								label: "09:00 - 12:00 Besok Pagi",
							},
						]}
					>
						<Select.Trigger class="h-9 w-full text-xs">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Item
								value="14:00 - 17:00 Hari Ini"
								label="14:00 - 17:00 Hari Ini (Slot Tercepat)"
							>
								14:00 - 17:00 Hari Ini (Slot Tercepat)
							</Select.Item>
							<Select.Item
								value="17:00 - 20:00 Hari Ini"
								label="17:00 - 20:00 Hari Ini"
							>
								17:00 - 20:00 Hari Ini
							</Select.Item>
							<Select.Item
								value="09:00 - 12:00 Besok Pagi"
								label="09:00 - 12:00 Besok Pagi"
							>
								09:00 - 12:00 Besok Pagi
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<Dialog.Footer
				class="flex flex-row items-center justify-end gap-2 pt-2"
			>
				<Button.Root
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (isPickupModalOpen = false)}
					class="cursor-pointer text-xs h-9"
				>
					{t("common.cancel")}
				</Button.Root>
				<Button.Root
					type="button"
					size="sm"
					onclick={confirmPickup}
					class="bg-primary text-white hover:bg-primary/90 font-semibold cursor-pointer text-xs h-9"
				>
					{t("ecommerce.orders.confirmPickup")}
				</Button.Root>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Modal 2: Atur Pengiriman (Untuk Reguler / Hemat) -->
<Dialog.Root bind:open={isShipmentModalOpen}>
	<Dialog.Content class="max-w-md p-6 sm:rounded-2xl">
		{#if activeOrder}
			<Dialog.Header>
				<Dialog.Title
					class="font-heading text-lg font-bold flex items-center gap-2"
				>
					<SendIcon class="size-5 text-primary" />
					<span>{t("ecommerce.orders.shipmentModalTitle")}</span>
				</Dialog.Title>
				<Dialog.Description class="text-xs text-muted-foreground">
					{t("ecommerce.orders.shipmentModalDesc")}
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4 my-2 text-xs">
				<div
					class="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1"
				>
					<div class="flex justify-between items-center text-[11px]">
						<span class="text-muted-foreground">No. Pesanan:</span>
						<span class="font-mono font-bold text-foreground"
							>{activeOrder.orderNumber}</span
						>
					</div>
					<div class="flex justify-between items-center text-[11px]">
						<span class="text-muted-foreground"
							>Kurir Pengiriman:</span
						>
						<span class="font-semibold text-primary"
							>{activeOrder.courierName} ({activeOrder.shippingService})</span
						>
					</div>
				</div>

				<div class="space-y-2">
					<Label class="text-xs font-semibold text-foreground block">
						{t("ecommerce.orders.shipmentMethod")}
					</Label>
					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							onclick={() => (shipmentMethod = "dropoff")}
							class="p-3 rounded-xl border text-left cursor-pointer transition-all {shipmentMethod ===
							'dropoff'
								? 'border-primary bg-primary/5 text-primary font-semibold shadow-2xs'
								: 'border-border bg-card text-muted-foreground hover:bg-muted/50'}"
						>
							<div class="flex items-center gap-2 mb-1">
								<MapPinIcon class="size-4" />
								<span class="text-xs">Drop-off</span>
							</div>
							<p
								class="text-[10px] text-muted-foreground leading-tight"
							>
								Antar langsung paket ke gerai cabang kurir
								terdekat.
							</p>
						</button>

						<button
							type="button"
							onclick={() => (shipmentMethod = "courier")}
							class="p-3 rounded-xl border text-left cursor-pointer transition-all {shipmentMethod ===
							'courier'
								? 'border-primary bg-primary/5 text-primary font-semibold shadow-2xs'
								: 'border-border bg-card text-muted-foreground hover:bg-muted/50'}"
						>
							<div class="flex items-center gap-2 mb-1">
								<TruckIcon class="size-4" />
								<span class="text-xs">Pick Up</span>
							</div>
							<p
								class="text-[10px] text-muted-foreground leading-tight"
							>
								Kurir jemput paket ke alamat gudang utama.
							</p>
						</button>
					</div>
				</div>

				{#if shipmentMethod === "dropoff"}
					<div>
						<Label
							class="text-xs font-semibold text-foreground mb-1 block"
						>
							{t("ecommerce.orders.dropoffBranch")}
						</Label>
						<Input
							type="text"
							bind:value={dropoffBranch}
							class="text-xs h-9"
						/>
					</div>
				{/if}
			</div>

			<Dialog.Footer
				class="flex flex-row items-center justify-end gap-2 pt-2"
			>
				<Button.Root
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (isShipmentModalOpen = false)}
					class="cursor-pointer text-xs h-9"
				>
					{t("common.cancel")}
				</Button.Root>
				<Button.Root
					type="button"
					size="sm"
					onclick={confirmShipment}
					class="bg-primary text-white hover:bg-primary/90 font-semibold cursor-pointer text-xs h-9"
				>
					{t("ecommerce.orders.confirmShipment")}
				</Button.Root>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Modal 3: Pratinjau & Cetak Label Pengiriman (Thermal A6 format) -->
<Dialog.Root bind:open={isPrintModalOpen}>
	<Dialog.Content class="max-w-md p-6 sm:rounded-2xl">
		{#if activeOrder}
			<Dialog.Header>
				<Dialog.Title
					class="font-heading text-lg font-bold flex items-center gap-2"
				>
					<PrinterIcon class="size-5 text-primary" />
					<span>{t("ecommerce.orders.printModalTitle")}</span>
				</Dialog.Title>
				<Dialog.Description class="text-xs text-muted-foreground">
					{t("ecommerce.orders.printModalDesc")}
				</Dialog.Description>
			</Dialog.Header>

			<!-- Thermal Label Style Paper -->
			<div
				class="my-3 p-4 rounded-xl border border-dashed border-border/80 bg-background space-y-3 text-xs shadow-inner"
			>
				<div
					class="flex justify-between items-center border-b border-border/80 pb-2.5"
				>
					<div class="flex items-center gap-2">
						<span
							class="font-black text-sm tracking-tight text-foreground"
							>{activeOrder.channel}</span
						>
						<span
							class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-foreground"
						>
							{activeOrder.shippingService}
						</span>
					</div>
					<span class="font-bold text-xs text-primary"
						>{activeOrder.courierName}</span
					>
				</div>

				<!-- Barcode Simulator -->
				<div
					class="text-center py-2 bg-muted/20 rounded border border-border/50"
				>
					<div
						class="font-mono text-xl tracking-widest font-black text-foreground"
					>
						||| | |||| || ||| |||| | |||
					</div>
					<span class="font-mono text-xs font-bold text-foreground">
						{activeOrder.trackingNumber ?? "NO-RESI-PENDING"}
					</span>
				</div>

				<div
					class="grid grid-cols-2 gap-2 border-y border-border/70 py-2 text-[11px]"
				>
					<div>
						<span
							class="text-[9px] uppercase font-bold text-muted-foreground block"
							>PENGIRIM</span
						>
						<p class="font-semibold text-foreground truncate">
							{activeOrder.storeAccount}
						</p>
						<p class="text-[10px] text-muted-foreground">
							Jakarta Pusat, DKI Jakarta
						</p>
					</div>
					<div>
						<span
							class="text-[9px] uppercase font-bold text-muted-foreground block"
							>PENERIMA</span
						>
						<p class="font-semibold text-foreground truncate">
							{activeOrder.customerName}
						</p>
						<p
							class="text-[10px] text-muted-foreground leading-tight line-clamp-2"
						>
							{activeOrder.shippingAddress}
						</p>
					</div>
				</div>

				<div class="space-y-1 text-[11px]">
					<span
						class="text-[9px] uppercase font-bold text-muted-foreground block"
						>DAFTAR BARANG</span
					>
					{#each activeOrder.items as itm}
						<div
							class="flex justify-between items-center text-[10px]"
						>
							<span class="truncate max-w-50 text-foreground">
								{itm.qty}x {itm.productName} ({itm.variant})
							</span>
							<span class="font-mono text-muted-foreground"
								>{itm.sku}</span
							>
						</div>
					{/each}
				</div>
			</div>

			<Dialog.Footer
				class="flex flex-row items-center justify-end gap-2 pt-1"
			>
				<Button.Root
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (isPrintModalOpen = false)}
					class="cursor-pointer text-xs h-9"
				>
					{t("common.close")}
				</Button.Root>
				<Button.Root
					type="button"
					size="sm"
					onclick={() => window.print()}
					class="bg-primary text-white hover:bg-primary/90 font-semibold cursor-pointer text-xs h-9 gap-1.5"
				>
					<PrinterIcon class="size-3.5" />
					<span>{t("ecommerce.orders.printBtn")}</span>
				</Button.Root>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Modal 4: Detail Lengkap Pesanan -->
<Dialog.Root bind:open={isDetailModalOpen}>
	<Dialog.Content class="max-w-lg p-6 sm:rounded-2xl">
		{#if activeOrder}
			<Dialog.Header>
				<div class="flex items-center gap-2">
					<Dialog.Title class="font-heading text-lg font-bold">
						{activeOrder.orderNumber}
					</Dialog.Title>
					<Badge variant="outline" class="text-xs">
						{activeOrder.channel} • {activeOrder.storeAccount}
					</Badge>
				</div>
				<Dialog.Description class="text-xs text-muted-foreground">
					{t("ecommerce.orders.colDate")}: {activeOrder.date}
				</Dialog.Description>
			</Dialog.Header>

			<div
				class="space-y-3.5 my-2 text-xs max-h-[60vh] overflow-y-auto pr-1"
			>
				<!-- Customer & Shipping -->
				<div
					class="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-2"
				>
					<div class="flex items-center justify-between">
						<span
							class="text-[10px] uppercase font-bold text-muted-foreground"
							>Penerima</span
						>
						<span class="font-mono text-[11px] text-primary"
							>{activeOrder.customerPhone}</span
						>
					</div>
					<p class="font-semibold text-foreground text-xs">
						{activeOrder.customerName}
					</p>
					<p class="text-muted-foreground text-xs leading-relaxed">
						{activeOrder.shippingAddress}
					</p>
				</div>

				<!-- Items breakdown -->
				<div>
					<Label
						class="text-xs font-semibold text-foreground mb-1.5 block"
					>
						Daftar Produk ({activeOrder.items.length})
					</Label>
					<div
						class="divide-y divide-border/60 border border-border/80 rounded-lg overflow-hidden bg-background"
					>
						{#each activeOrder.items as itm}
							<div
								class="p-2.5 flex items-center justify-between"
							>
								<div class="flex items-center gap-2 min-w-0">
									<img
										src={itm.image}
										alt={itm.productName}
										class="size-9 rounded object-cover border border-border/60 shrink-0"
									/>
									<div class="min-w-0">
										<p
											class="font-medium text-xs text-foreground truncate"
										>
											{itm.productName}
										</p>
										<p
											class="text-[10px] text-muted-foreground font-mono"
										>
											Varian: {itm.variant} • SKU: {itm.sku}
										</p>
									</div>
								</div>
								<div class="text-right shrink-0">
									<p
										class="font-mono font-bold text-xs text-foreground"
									>
										{formatRupiah(itm.total)}
									</p>
									<p
										class="text-[10px] text-muted-foreground font-mono"
									>
										{itm.qty} × {formatRupiah(itm.price)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Financial summary -->
				<div
					class="p-3 rounded-lg border border-border/80 bg-card space-y-1.5"
				>
					<div
						class="flex justify-between text-muted-foreground text-xs"
					>
						<span>Total Pembayaran:</span>
						<span class="font-mono font-bold text-sm text-primary"
							>{formatRupiah(activeOrder.revenue)}</span
						>
					</div>
					<div
						class="flex justify-between text-muted-foreground text-[11px]"
					>
						<span>Jasa Kirim:</span>
						<span
							>{activeOrder.shippingService} - {activeOrder.courierName}</span
						>
					</div>
					{#if activeOrder.trackingNumber}
						<div
							class="flex justify-between text-muted-foreground text-[11px]"
						>
							<span>No. Resi:</span>
							<span
								class="font-mono font-semibold text-foreground"
								>{activeOrder.trackingNumber}</span
							>
						</div>
					{/if}
				</div>
			</div>

			<Dialog.Footer
				class="flex flex-row items-center justify-end gap-2 pt-1"
			>
				<Button.Root
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (isDetailModalOpen = false)}
					class="cursor-pointer text-xs h-9"
				>
					{t("common.close")}
				</Button.Root>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
