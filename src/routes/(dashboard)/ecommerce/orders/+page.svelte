<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import RangeCalendar from "$lib/components/ui/range-calendar/range-calendar.svelte";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { initialEcommerceOrders } from "$lib/data/ecommerce.js";
	import type {
		EcommerceOrderRecord,
		EcommerceOrderItem,
		ShippingServiceType,
	} from "$lib/types/index.js";
	import { t } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";
	import StatusDot from "$lib/components/common/StatusDot.svelte";
	import type { DateRange } from "bits-ui";
	import { getLocalTimeZone, today } from "@internationalized/date";

	// Icons
	import SearchIcon from "@lucide/svelte/icons/search";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import TruckIcon from "@lucide/svelte/icons/truck";
	import SendIcon from "@lucide/svelte/icons/send";
	import PrinterIcon from "@lucide/svelte/icons/printer";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import PackageIcon from "@lucide/svelte/icons/package";
	import LayersIcon from "@lucide/svelte/icons/layers";
	import MapPinIcon from "@lucide/svelte/icons/map-pin";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import CheckIcon from "@lucide/svelte/icons/check";
	import ShoppingBagIcon from "@lucide/svelte/icons/shopping-bag";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";

	// Orders state
	let orders = $state<EcommerceOrderRecord[]>([...initialEcommerceOrders]);
	let selectedIds = $state<(string | number)[]>([]);
	let toastMessage = $state<string | null>(null);
	let copiedOrderNumber = $state<string | null>(null);
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;

	// Search & Filters
	const todayDate = today(getLocalTimeZone());
	let dateRange = $state<DateRange>({
		start: todayDate,
		end: todayDate,
	});
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

	async function copyOrderNumber(orderNum: string) {
		try {
			await navigator.clipboard.writeText(orderNum);
			copiedOrderNumber = orderNum;
			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				if (copiedOrderNumber === orderNum) copiedOrderNumber = null;
			}, 2000);
			showToast(
				t("ecommerce.orders.orderNumberCopied", { number: orderNum }) ||
					`Nomor pesanan ${orderNum} berhasil disalin!`,
			);
		} catch {
			showToast(`No. Pesanan: ${orderNum}`);
		}
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

	function formatDateRange(range: DateRange): string {
		if (!range?.start) return "Semua Tanggal";
		const startStr = `${String(range.start.day).padStart(2, "0")}/${String(range.start.month).padStart(2, "0")}/${range.start.year}`;
		if (
			!range.end ||
			(range.start.day === range.end.day &&
				range.start.month === range.end.month &&
				range.start.year === range.end.year)
		) {
			const isToday =
				range.start.day === todayDate.day &&
				range.start.month === todayDate.month &&
				range.start.year === todayDate.year;
			return isToday ? `${startStr} (Hari Ini)` : startStr;
		}
		const endStr = `${String(range.end.day).padStart(2, "0")}/${String(range.end.month).padStart(2, "0")}/${range.end.year}`;
		return `${startStr} - ${endStr}`;
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
		dateRange = {
			start: todayDate,
			end: todayDate,
		};
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

			// Date range filter
			if (dateRange?.start) {
				const orderTime = parseDate(order.date);
				const startTime = new Date(
					dateRange.start.year,
					dateRange.start.month - 1,
					dateRange.start.day,
				).getTime();
				const endVal = dateRange.end ?? dateRange.start;
				const endTime = new Date(
					endVal.year,
					endVal.month - 1,
					endVal.day,
					23,
					59,
					59,
					999,
				).getTime();

				if (orderTime < startTime || orderTime > endTime) {
					return false;
				}
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

	const pageItemKeys = $derived(paginatedOrders.map((o) => o.id));
	const isAllSelected = $derived(
		pageItemKeys.length > 0 &&
			pageItemKeys.every((k) => selectedIds.includes(k)),
	);
	const isSomeSelected = $derived(
		pageItemKeys.some((k) => selectedIds.includes(k)) && !isAllSelected,
	);
	const totalPages = $derived(Math.ceil(sortedOrders.length / perPage) || 1);
	const rangeStart = $derived(
		sortedOrders.length === 0 ? 0 : (currentPage - 1) * perPage + 1,
	);
	const rangeEnd = $derived(
		Math.min(currentPage * perPage, sortedOrders.length),
	);

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedIds = selectedIds.filter(
				(id) => !pageItemKeys.includes(String(id)),
			);
		} else {
			selectedIds = Array.from(
				new Set([...selectedIds, ...pageItemKeys]),
			);
		}
	}

	function toggleSelectItem(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function clearSelection() {
		selectedIds = [];
	}

	function handleSort(columnId: string) {
		let nextDir: "asc" | "desc" | "none" = "asc";
		if (sortKey === columnId) {
			if (sortDirection === "asc") nextDir = "desc";
			else if (sortDirection === "desc") {
				sortKey = null;
				nextDir = "none";
			} else {
				nextDir = "asc";
			}
		} else {
			nextDir = "asc";
		}
		sortKey = nextDir === "none" ? null : columnId;
		sortDirection = nextDir;
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

			<!-- Filter Date Range Picker (Default: Hari Ini / Today) -->
			<div class="w-full lg:w-64 shrink-0">
				<Popover.Root>
					<Popover.Trigger
						class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium cursor-pointer flex items-center justify-between text-foreground hover:bg-muted/40 transition-colors"
					>
						<div class="flex items-center gap-2 truncate">
							<CalendarIcon
								class="size-3.5 text-muted-foreground shrink-0"
							/>
							<span class="truncate"
								>{formatDateRange(dateRange)}</span
							>
						</div>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-3" align="start">
						<div class="space-y-3">
							<div
								class="flex items-center justify-between border-b border-border/60 pb-2 gap-2"
							>
								<span
									class="text-xs font-semibold text-foreground"
									>Pilih Rentang</span
								>
								<div class="flex items-center gap-1">
									<Button.Root
										type="button"
										variant="ghost"
										size="xs"
										class="h-6 text-[11px] px-2 text-primary font-medium hover:bg-primary/10 cursor-pointer"
										onclick={() => {
											dateRange = {
												start: todayDate,
												end: todayDate,
											};
										}}
									>
										Hari Ini
									</Button.Root>
									<Button.Root
										type="button"
										variant="ghost"
										size="xs"
										class="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
										onclick={() => {
											dateRange = {
												start: todayDate.subtract({
													days: 7,
												}),
												end: todayDate,
											};
										}}
									>
										7 Hari
									</Button.Root>
									<Button.Root
										type="button"
										variant="ghost"
										size="xs"
										class="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
										onclick={() => {
											dateRange = {
												start: undefined,
												end: undefined,
											};
										}}
									>
										Semua
									</Button.Root>
								</div>
							</div>
							<RangeCalendar
								bind:value={dateRange}
								class="rounded-md border border-border/60"
							/>
						</div>
					</Popover.Content>
				</Popover.Root>
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

	<!-- Bulk Action / Selection Toolbar -->
	{#if selectedIds.length > 0}
		<div
			class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs shadow-2xs"
		>
			<div class="flex items-center gap-2.5">
				<span class="font-semibold text-primary">
					{selectedIds.length}
					{t("ecommerce.orders.selectedCount")}
				</span>
			</div>
			<div class="flex items-center gap-2">
				<Button.Root
					type="button"
					variant="ghost"
					size="xs"
					onclick={clearSelection}
					class="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
				>
					{t("ecommerce.orders.deselect")}
				</Button.Root>
				<Button.Root
					type="button"
					size="xs"
					class="h-7 px-3 text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer shadow-xs gap-1.5"
					href="/ecommerce/orders/mass-shipping"
				>
					<TruckIcon class="size-3" />
					<span
						>{t("ecommerce.orders.massShippingBtn")} ({selectedIds.length})</span
					>
				</Button.Root>
			</div>
		</div>
	{/if}

	<!-- List Column Header (Desktop) -->
	<div
		class="hidden lg:grid grid-cols-[minmax(320px,3fr)_minmax(220px,2fr)_minmax(160px,1.5fr)_minmax(140px,1.2fr)_minmax(160px,1.5fr)] gap-4 px-5 py-3 rounded-xl border border-border/70 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground shadow-2xs items-center"
	>
		<!-- Kolom 1: Produk (dengan Select All Checkbox) -->
		<div class="flex items-center gap-3">
			<Checkbox
				checked={isAllSelected}
				indeterminate={isSomeSelected}
				onCheckedChange={toggleSelectAll}
				aria-label={t("ecommerce.orders.selectAll")}
			/>
			<span>{t("ecommerce.orders.colProduct")}</span>
		</div>

		<!-- Kolom 2: Status Shipping (Sortable) -->
		<div class="flex items-center">
			<button
				type="button"
				onclick={() => handleSort("shippingStatus")}
				class="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group"
				title="Klik untuk sort Status Shipping"
			>
				<span>{t("ecommerce.orders.colShippingStatus")}</span>
				{#if sortKey === "shippingStatus" && sortDirection === "asc"}
					<ArrowUpIcon class="size-3.5 text-primary" />
				{:else if sortKey === "shippingStatus" && sortDirection === "desc"}
					<ArrowDownIcon class="size-3.5 text-primary" />
				{:else}
					<ArrowUpDownIcon
						class="size-3 text-muted-foreground/50 group-hover:text-muted-foreground"
					/>
				{/if}
			</button>
		</div>

		<!-- Kolom 3: Shipping Services (Rata Kiri) -->
		<div class="flex items-center">
			<span>{t("ecommerce.orders.colShippingServices")}</span>
		</div>

		<!-- Kolom 4: Revenue (Sortable & Rata Kiri) -->
		<div class="flex items-center">
			<button
				type="button"
				onclick={() => handleSort("revenue")}
				class="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group"
				title="Klik untuk sort Revenue"
			>
				<span>{t("ecommerce.orders.colRevenue")}</span>
				{#if sortKey === "revenue" && sortDirection === "asc"}
					<ArrowUpIcon class="size-3.5 text-primary" />
				{:else if sortKey === "revenue" && sortDirection === "desc"}
					<ArrowDownIcon class="size-3.5 text-primary" />
				{:else}
					<ArrowUpDownIcon
						class="size-3 text-muted-foreground/50 group-hover:text-muted-foreground"
					/>
				{/if}
			</button>
		</div>

		<!-- Kolom 5: Actions (Rata Kanan) -->
		<div class="text-right">
			<span>{t("ecommerce.orders.colActions")}</span>
		</div>
	</div>

	<!-- Orders Card List -->
	{#if paginatedOrders.length === 0}
		<Card.Root
			class="p-12 text-center border border-border/80 bg-card rounded-xl"
		>
			<div
				class="flex flex-col items-center justify-center gap-2 text-muted-foreground"
			>
				<PackageIcon class="size-10 text-muted-foreground/40" />
				<h4 class="text-sm font-semibold text-foreground">
					Tidak ada pesanan ditemukan
				</h4>
				<p class="text-xs">
					Coba sesuaikan kata kunci pencarian atau filter status
					pesanan.
				</p>
				<Button.Root
					type="button"
					variant="outline"
					size="sm"
					onclick={handleResetFilters}
					class="mt-2 text-xs cursor-pointer gap-1.5"
				>
					<RotateCcwIcon class="size-3.5" />
					<span>{t("ecommerce.orders.reset")}</span>
				</Button.Root>
			</div>
		</Card.Root>
	{:else}
		<div class="space-y-4">
			{#each paginatedOrders as item (item.id)}
				<Card.Root
					class="p-0 gap-0 overflow-hidden border border-border/80 bg-card shadow-2xs hover:border-primary/40 transition-colors"
				>
					<!-- Card Header / Bagian Atas: Asal Pesanan Shopee & Ujung Kiri No Pesanan + Tombol Copy -->
					<div
						class="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 bg-muted/40 border-b border-border/70 text-xs"
					>
						<!-- Ujung Kiri: Checkbox, No Pesanan + Tombol Copy, Asal Pesanan Shopee -->
						<div
							class="flex flex-wrap items-center gap-2.5 sm:gap-3"
						>
							<!-- Checkbox -->
							<Checkbox
								checked={selectedIds.includes(item.id)}
								onCheckedChange={() =>
									toggleSelectItem(item.id)}
								aria-label="Pilih pesanan {item.orderNumber}"
							/>

							<!-- No. Pesanan dengan tombol copy disampingnya -->
							<div class="flex items-center gap-1.5">
								<span
									class="text-muted-foreground font-mono text-[11px] font-medium hidden xs:inline"
									>No.</span
								>
								<button
									type="button"
									class="font-mono text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer text-left"
									onclick={() => openDetailModal(item)}
									title="Lihat rincian pesanan"
								>
									{item.orderNumber}
								</button>

								<Button.Root
									variant="ghost"
									size="icon-xs"
									type="button"
									class="size-6 rounded text-muted-foreground hover:text-foreground cursor-pointer"
									onclick={(e) => {
										e.stopPropagation();
										copyOrderNumber(item.orderNumber);
									}}
									title={copiedOrderNumber ===
									item.orderNumber
										? "Tersalin!"
										: t("ecommerce.orders.copyOrderNumber")}
								>
									{#if copiedOrderNumber === item.orderNumber}
										<CheckIcon
											class="size-3 text-emerald-600 dark:text-emerald-400"
										/>
									{:else}
										<CopyIcon class="size-3" />
									{/if}
								</Button.Root>
							</div>

							<span class="text-border hidden sm:inline">|</span>

							<!-- Asal Pesanan Shopee -->
							<div class="flex items-center gap-1.5">
								<span
									class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ee4d2d]/10 text-[#ee4d2d] dark:text-[#ff6d4d] border border-[#ee4d2d]/25 shadow-2xs"
								>
									<ShoppingBagIcon
										class="size-3 text-[#ee4d2d] dark:text-[#ff6d4d]"
									/>
									<span>Shopee</span>
								</span>
								<span
									class="text-xs font-medium text-foreground/80 font-mono"
								>
									{item.storeAccount}
								</span>
							</div>
						</div>

						<!-- Ujung Kanan: Tanggal Pesanan & Customer Info -->
						<div
							class="flex items-center gap-2 text-xs text-muted-foreground font-mono ml-auto"
						>
							<span
								class="hidden sm:inline font-sans text-muted-foreground"
								>{item.customerName}</span
							>
							<span class="hidden sm:inline text-border">•</span>
							<div
								class="flex items-center gap-1 text-foreground/80 font-medium"
							>
								<CalendarIcon
									class="size-3.5 text-muted-foreground"
								/>
								<span>{item.date}</span>
							</div>
						</div>
					</div>

					<!-- Card Content / Baris Data Pesanan -->
					<Card.Content class="p-4 sm:p-5">
						<div
							class="grid grid-cols-1 lg:grid-cols-[minmax(320px,3fr)_minmax(220px,2fr)_minmax(160px,1.5fr)_minmax(140px,1.2fr)_minmax(160px,1.5fr)] gap-4 items-center"
						>
							<!-- 1. Produk -->
							<div class="flex items-start gap-3">
								<div
									class="size-13 rounded-lg border border-border/80 bg-muted/40 overflow-hidden shrink-0 flex items-center justify-center relative"
								>
									{#if item.items[0]?.image}
										<img
											src={item.items[0].image}
											alt={item.items[0].productName}
											class="size-full object-cover"
										/>
									{:else}
										<PackageIcon
											class="size-6 text-muted-foreground"
										/>
									{/if}
								</div>

								<div class="min-w-0 flex-1">
									<p
										class="font-medium text-xs text-foreground line-clamp-2 leading-snug"
										title={item.items[0]?.productName}
									>
										{item.items[0]?.productName ?? "-"}
									</p>

									<div
										class="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground"
									>
										<span
											class="inline-flex items-center gap-1 font-medium text-foreground/80 bg-muted/60 px-2 py-0.5 rounded"
										>
											<LayersIcon
												class="size-3 text-primary/70 shrink-0"
											/>
											Variant : {item.items[0]?.variant ??
												"-"}
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

							<!-- 2. Status Shipping -->
							<div class="space-y-1.5">
								<span
									class="inline-flex items-center gap-1.5 text-xs font-semibold"
								>
									<StatusDot
										status={item.orderStatus ===
										"Telah Diproses"
											? "online"
											: "pending"}
										ping={item.orderStatus ===
											"Perlu Diproses"}
									/>
									<span class="capitalize"
										>{item.shippingStatus}</span
									>
								</span>

								<p
									class="text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1"
								>
									<span
										>{formatDeadline(
											item.shippingDeadline,
										)}</span
									>
								</p>
							</div>

							<!-- 3. Shipping Services (Rata Kiri) -->
							<div class="space-y-1 text-left">
								<div
									class="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground bg-muted/60 px-2.5 py-1 rounded-md"
								>
									{item.shippingService}
								</div>
							</div>

							<!-- 4. Revenue / Total Pembayaran (Rata Kiri) -->
							<div class="text-left space-y-0.5">
								<span
									class="font-mono text-xs font-bold text-foreground block"
								>
									{formatRupiah(item.revenue)}
								</span>
							</div>

							<!-- 5. Actions -->
							<div
								class="flex items-center justify-start lg:justify-end gap-1.5"
							>
								{#if !item.isArranged && item.orderStatus !== "Telah Diproses"}
									{#if item.shippingService === "Instant" || item.shippingService === "Instant Prioritas"}
										<Button.Root
											type="button"
											size="xs"
											onclick={() =>
												openPickupModal(item)}
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
											onclick={() =>
												openShipmentModal(item)}
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
										<span
											>{t(
												"ecommerce.orders.printLabel",
											)}</span
										>
									</Button.Root>
								{/if}
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}

	<!-- Pagination Controls (Minimum 10 per page) -->
	<div
		class="flex flex-col sm:flex-row items-center justify-between gap-3 border border-border/70 rounded-xl px-4 py-3 text-xs text-muted-foreground bg-card shadow-2xs"
	>
		<div
			class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start"
		>
			<div class="flex items-center gap-2">
				<span>
					Showing <span class="font-medium text-foreground"
						>{rangeStart}</span
					>
					to
					<span class="font-medium text-foreground">{rangeEnd}</span>
					of
					<span class="font-medium text-foreground"
						>{sortedOrders.length}</span
					>
					entries
				</span>
				{#if selectedIds.length > 0}
					<span
						class="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
					>
						{selectedIds.length}
						{t("ecommerce.orders.selectedCount")}
					</span>
				{/if}
			</div>

			<div class="flex items-center gap-1.5 ms-2">
				<span class="hidden md:inline text-muted-foreground text-xs"
					>Per page:</span
				>
				<Select.Root
					type="single"
					value={String(perPage)}
					onValueChange={(v) => {
						if (v) {
							perPage = Number(v);
							currentPage = 1;
						}
					}}
					items={[10, 20, 50].map((opt) => ({
						value: String(opt),
						label: String(opt),
					}))}
				>
					<Select.Trigger
						size="sm"
						class="h-7 w-18 text-xs font-semibold border border-border bg-white dark:bg-card text-foreground cursor-pointer hover:bg-slate-50 dark:hover:bg-muted shadow-xs transition-colors"
					>
						<Select.Value placeholder={String(perPage)} />
					</Select.Trigger>
					<Select.Content>
						{#each [10, 20, 50] as opt}
							<Select.Item
								value={String(opt)}
								label={String(opt)}
							>
								{opt}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<!-- Pagination Controls: Next & Previous Page Always Visible -->
		<div class="flex items-center justify-end w-full sm:w-auto">
			<Pagination.Root
				count={Math.max(sortedOrders.length, 1)}
				{perPage}
				bind:page={currentPage}
				siblingCount={1}
				class="mx-0 w-auto"
			>
				{#snippet children({ pages, currentPage })}
					<Pagination.Content class="gap-1 flex items-center">
						<Pagination.Item>
							<Pagination.Previous
								class="h-8 px-2.5 text-xs font-medium rounded-md cursor-pointer bg-white dark:bg-card text-foreground hover:bg-slate-50 dark:hover:bg-muted border border-border/80 shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
							/>
						</Pagination.Item>
						{#each pages as pageItem (pageItem.key)}
							{#if pageItem.type === "ellipsis"}
								<Pagination.Item>
									<Pagination.Ellipsis class="size-8" />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link
										page={pageItem}
										isActive={currentPage ===
											pageItem.value}
										class={cn(
											"size-8 text-xs font-semibold rounded-md cursor-pointer transition-colors shadow-xs flex items-center justify-center",
											currentPage === pageItem.value
												? "bg-primary! text-white! border-primary! hover:bg-primary/90! hover:text-white!"
												: "text-foreground bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted border border-border/80",
										)}
									>
										{pageItem.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.Next
								class="h-8 px-2.5 text-xs font-medium rounded-md cursor-pointer bg-white dark:bg-card text-foreground hover:bg-slate-50 dark:hover:bg-muted border border-border/80 shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
							/>
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
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
