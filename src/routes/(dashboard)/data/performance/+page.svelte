<script lang="ts">
	import MetricCard from "$lib/components/common/MetricCard.svelte";
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import RangeCalendar from "$lib/components/ui/range-calendar/range-calendar.svelte";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import {
		initialPerformanceOrders,
		initialPerformanceProducts,
	} from "$lib/data/performance-data.js";
	import type {
		PerformanceOrderRecord,
		PerformanceProductRecord,
	} from "$lib/types/index.js";
	import { t } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";
	import type { DateRange } from "bits-ui";
	import {
		CalendarDate,
		getLocalTimeZone,
		today,
	} from "@internationalized/date";

	// Icons
	import SearchIcon from "@lucide/svelte/icons/search";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import CheckIcon from "@lucide/svelte/icons/check";
	import DownloadIcon from "@lucide/svelte/icons/download";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import DollarSignIcon from "@lucide/svelte/icons/dollar-sign";
	import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
	import ShoppingBagIcon from "@lucide/svelte/icons/shopping-bag";
	import PackageIcon from "@lucide/svelte/icons/package";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import XCircleIcon from "@lucide/svelte/icons/x-circle";
	import ClockIcon from "@lucide/svelte/icons/clock";
	import StoreIcon from "@lucide/svelte/icons/store";

	// Active Tab State: "orders" | "products"
	let activeTab = $state<"orders" | "products">("orders");

	// Toast message
	let toastMessage = $state<string | null>(null);
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3500);
	}

	// Copy Order Number feedback
	let copiedOrderNumber = $state<string | null>(null);
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;
	async function copyOrderNumber(num: string) {
		try {
			await navigator.clipboard.writeText(num);
			copiedOrderNumber = num;
			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				if (copiedOrderNumber === num) copiedOrderNumber = null;
			}, 2000);
			showToast(t("data.performance.copiedToast", { number: num }));
		} catch {
			showToast(t("data.performance.copyFailedToast"));
		}
	}

	// Currency Formatter
	function formatRupiah(amount: number): string {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	}

	// ==========================================
	// TAB 1: ORDERS STATE & FILTERING
	// ==========================================
	const todayDate = today(getLocalTimeZone());
	let ordersDateRange = $state<DateRange>({
		start: undefined,
		end: undefined,
	});

	// Search dropdown & input (Only submitted on button click)
	let ordersSearchType = $state<"orderNumber" | "product">("orderNumber");
	let ordersSearchInput = $state("");
	let appliedOrdersSearchType = $state<"orderNumber" | "product">(
		"orderNumber",
	);
	let appliedOrdersSearchInput = $state("");

	// Dropdown filters
	let selectedPlatform = $state("all");
	let selectedWarehouse = $state("all");
	let selectedShopeeAccount = $state("all");
	let selectedStatus = $state("all");

	// Selection & Sorting
	let selectedOrderIds = $state<string[]>([]);
	let ordersSortKey = $state<
		"orderDate" | "status" | "revenue" | "profit" | null
	>("orderDate");
	let ordersSortDirection = $state<"asc" | "desc">("desc");

	// Pagination
	let ordersCurrentPage = $state(1);
	let ordersPerPage = $state(10);

	function submitOrdersSearch() {
		appliedOrdersSearchType = ordersSearchType;
		appliedOrdersSearchInput = ordersSearchInput.trim();
		ordersCurrentPage = 1;
	}

	function resetOrdersFilters() {
		ordersDateRange = { start: undefined, end: undefined };
		ordersSearchType = "orderNumber";
		ordersSearchInput = "";
		appliedOrdersSearchType = "orderNumber";
		appliedOrdersSearchInput = "";
		selectedPlatform = "all";
		selectedWarehouse = "all";
		selectedShopeeAccount = "all";
		selectedStatus = "all";
		ordersCurrentPage = 1;
		selectedOrderIds = [];
		showToast(t("data.performance.filterResetToast"));
	}

	function handleOrdersSort(
		key: "orderDate" | "status" | "revenue" | "profit",
	) {
		if (ordersSortKey === key) {
			ordersSortDirection =
				ordersSortDirection === "asc" ? "desc" : "asc";
		} else {
			ordersSortKey = key;
			ordersSortDirection = "desc";
		}
	}

	// Helper to parse "DD/MM/YYYY" to Date
	function parseDateStr(str: string): Date {
		const parts = str.split("/");
		if (parts.length === 3) {
			return new Date(
				Number(parts[2]),
				Number(parts[1]) - 1,
				Number(parts[0]),
			);
		}
		return new Date();
	}

	// Filtered Orders
	const filteredOrders = $derived.by(() => {
		return initialPerformanceOrders.filter((order) => {
			// Search filter
			if (appliedOrdersSearchInput) {
				const term = appliedOrdersSearchInput.toLowerCase();
				if (appliedOrdersSearchType === "orderNumber") {
					if (!order.orderNumber.toLowerCase().includes(term))
						return false;
				} else {
					if (!order.productName.toLowerCase().includes(term))
						return false;
				}
			}

			// Date Range filter
			if (ordersDateRange.start) {
				const orderDateObj = parseDateStr(order.orderDate);
				orderDateObj.setHours(0, 0, 0, 0);

				const startDate = new Date(
					ordersDateRange.start.year,
					ordersDateRange.start.month - 1,
					ordersDateRange.start.day,
				);
				startDate.setHours(0, 0, 0, 0);

				if (orderDateObj < startDate) return false;

				if (ordersDateRange.end) {
					const endDate = new Date(
						ordersDateRange.end.year,
						ordersDateRange.end.month - 1,
						ordersDateRange.end.day,
					);
					endDate.setHours(23, 59, 59, 999);
					if (orderDateObj > endDate) return false;
				}
			}

			// Platform filter
			if (
				selectedPlatform !== "all" &&
				order.platform !== selectedPlatform
			) {
				return false;
			}

			// Warehouse filter
			if (
				selectedWarehouse !== "all" &&
				order.warehouse !== selectedWarehouse
			) {
				return false;
			}

			// Shopee Account filter
			if (
				selectedShopeeAccount !== "all" &&
				order.shopeeAccount !== selectedShopeeAccount
			) {
				return false;
			}

			// Status filter
			if (selectedStatus !== "all" && order.status !== selectedStatus) {
				return false;
			}

			return true;
		});
	});

	// Sorted Orders
	const sortedOrders = $derived.by(() => {
		const list = [...filteredOrders];
		if (!ordersSortKey) return list;

		return list.sort((a, b) => {
			let comp = 0;
			if (ordersSortKey === "orderDate") {
				comp =
					parseDateStr(a.orderDate).getTime() -
					parseDateStr(b.orderDate).getTime();
			} else if (ordersSortKey === "status") {
				comp = a.status.localeCompare(b.status);
			} else if (ordersSortKey === "revenue") {
				comp = a.revenue - b.revenue;
			} else if (ordersSortKey === "profit") {
				comp = a.profit - b.profit;
			}
			return ordersSortDirection === "asc" ? comp : -comp;
		});
	});

	// 4 Cards KPI metrics calculated based on filtered orders
	const kpiRevenue = $derived(
		filteredOrders.reduce(
			(sum, ord) => sum + (ord.status !== "Cancelled" ? ord.revenue : 0),
			0,
		),
	);
	const kpiHppTotal = $derived(
		filteredOrders.reduce(
			(sum, ord) => sum + (ord.status !== "Cancelled" ? ord.hppTotal : 0),
			0,
		),
	);
	const kpiProfit = $derived(
		filteredOrders.reduce((sum, ord) => sum + ord.profit, 0),
	);
	const kpiTotalOrders = $derived(filteredOrders.length);
	const kpiCompletedOrders = $derived(
		filteredOrders.filter((ord) => ord.status === "Completed").length,
	);
	const kpiCancelledOrders = $derived(
		filteredOrders.filter((ord) => ord.status === "Cancelled").length,
	);
	const kpiPendingOrders = $derived(
		filteredOrders.filter(
			(ord) => ord.status === "Pending" || ord.status === "Processing",
		).length,
	);

	// Orders Pagination
	const ordersTotalPages = $derived(
		Math.ceil(sortedOrders.length / ordersPerPage) || 1,
	);
	const paginatedOrders = $derived(
		sortedOrders.slice(
			(ordersCurrentPage - 1) * ordersPerPage,
			ordersCurrentPage * ordersPerPage,
		),
	);

	const isAllOrdersSelected = $derived(
		paginatedOrders.length > 0 &&
			paginatedOrders.every((o) => selectedOrderIds.includes(o.id)),
	);

	function toggleAllOrders() {
		if (isAllOrdersSelected) {
			const pageIds = paginatedOrders.map((o) => o.id);
			selectedOrderIds = selectedOrderIds.filter(
				(id) => !pageIds.includes(id),
			);
		} else {
			const toAdd = paginatedOrders
				.map((o) => o.id)
				.filter((id) => !selectedOrderIds.includes(id));
			selectedOrderIds = [...selectedOrderIds, ...toAdd];
		}
	}

	function toggleOrderSelect(id: string) {
		if (selectedOrderIds.includes(id)) {
			selectedOrderIds = selectedOrderIds.filter((i) => i !== id);
		} else {
			selectedOrderIds = [...selectedOrderIds, id];
		}
	}

	// ==========================================
	// TAB 2: PRODUCT STATE & FILTERING
	// ==========================================
	let productSearchInput = $state("");
	let appliedProductSearch = $state("");
	let productDateRange = $state<DateRange>({
		start: undefined,
		end: undefined,
	});

	let selectedProductIds = $state<string[]>([]);
	let productSortDirection = $state<"asc" | "desc">("desc");
	let productCurrentPage = $state(1);
	let productPerPage = $state(10);

	// Detail Dialog State
	let isDetailDialogOpen = $state(false);
	let activeDetailProduct = $state<PerformanceProductRecord | null>(null);

	function openProductDetail(prod: PerformanceProductRecord) {
		activeDetailProduct = prod;
		isDetailDialogOpen = true;
	}

	function submitProductSearch() {
		appliedProductSearch = productSearchInput.trim();
		productCurrentPage = 1;
	}

	function resetProductFilters() {
		productSearchInput = "";
		appliedProductSearch = "";
		productDateRange = { start: undefined, end: undefined };
		productCurrentPage = 1;
		selectedProductIds = [];
		showToast(t("data.performance.productFilterResetToast"));
	}

	function handleProductSortSold() {
		productSortDirection = productSortDirection === "asc" ? "desc" : "asc";
	}

	function exportProductData() {
		showToast(t("data.performance.exportToast"));
	}

	const filteredProducts = $derived.by(() => {
		return initialPerformanceProducts.filter((prod) => {
			if (appliedProductSearch) {
				const term = appliedProductSearch.toLowerCase();
				const matchName = prod.productName.toLowerCase().includes(term);
				const matchSku = prod.sku.toLowerCase().includes(term);
				if (!matchName && !matchSku) return false;
			}

			if (productDateRange.start) {
				const prodDate = parseDateStr(prod.createdAt);
				prodDate.setHours(0, 0, 0, 0);

				const startDate = new Date(
					productDateRange.start.year,
					productDateRange.start.month - 1,
					productDateRange.start.day,
				);
				startDate.setHours(0, 0, 0, 0);

				if (prodDate < startDate) return false;

				if (productDateRange.end) {
					const endDate = new Date(
						productDateRange.end.year,
						productDateRange.end.month - 1,
						productDateRange.end.day,
					);
					endDate.setHours(23, 59, 59, 999);
					if (prodDate > endDate) return false;
				}
			}

			return true;
		});
	});

	const sortedProducts = $derived.by(() => {
		const list = [...filteredProducts];
		return list.sort((a, b) => {
			return productSortDirection === "asc"
				? a.sold - b.sold
				: b.sold - a.sold;
		});
	});

	const productTotalPages = $derived(
		Math.ceil(sortedProducts.length / productPerPage) || 1,
	);
	const paginatedProducts = $derived(
		sortedProducts.slice(
			(productCurrentPage - 1) * productPerPage,
			productCurrentPage * productPerPage,
		),
	);

	const isAllProductsSelected = $derived(
		paginatedProducts.length > 0 &&
			paginatedProducts.every((p) => selectedProductIds.includes(p.id)),
	);

	function toggleAllProducts() {
		if (isAllProductsSelected) {
			const pageIds = paginatedProducts.map((p) => p.id);
			selectedProductIds = selectedProductIds.filter(
				(id) => !pageIds.includes(id),
			);
		} else {
			const toAdd = paginatedProducts
				.map((p) => p.id)
				.filter((id) => !selectedProductIds.includes(id));
			selectedProductIds = [...selectedProductIds, ...toAdd];
		}
	}

	function toggleProductSelect(id: string) {
		if (selectedProductIds.includes(id)) {
			selectedProductIds = selectedProductIds.filter((i) => i !== id);
		} else {
			selectedProductIds = [...selectedProductIds, id];
		}
	}

	// Dropdown filter options (English first / reactive with i18n)
	const ordersSearchTypeOptions = $derived([
		{
			value: "orderNumber",
			label: t("data.performance.searchOrderNumber"),
		},
		{ value: "product", label: t("data.performance.searchProduct") },
	]);

	const platformFilterItems = $derived([
		{ value: "all", label: t("data.performance.allPlatforms") },
		{ value: "Shopee", label: "Shopee" },
		{ value: "Tokopedia", label: "Tokopedia" },
		{ value: "TikTok Shop", label: "TikTok Shop" },
		{ value: "Lazada", label: "Lazada" },
	]);

	const warehouseFilterItems = $derived([
		{ value: "all", label: t("data.performance.allWarehouses") },
		{
			value: "Gudang Utama - Central Jakarta",
			label: "Central Jakarta",
		},
		{
			value: "Gudang Surabaya - Rungkut",
			label: "Surabaya - Rungkut",
		},
		{
			value: "Gudang Barat - Tangerang",
			label: "Tangerang",
		},
	]);

	const shopeeAccountFilterItems = $derived([
		{ value: "all", label: t("data.performance.allAccounts") },
		{
			value: "Official Store Jakarta",
			label: "Official Store Jakarta",
		},
		{
			value: "Gadget Hub ID",
			label: "Gadget Hub ID",
		},
		{
			value: "Fashion & Access ID",
			label: "Fashion & Access ID",
		},
	]);

	const statusFilterItems = $derived([
		{ value: "all", label: t("data.performance.allStatuses") },
		{ value: "Completed", label: t("data.performance.completed") },
		{ value: "Processing", label: t("data.performance.processing") },
		{ value: "Pending", label: t("data.performance.pending") },
		{ value: "Cancelled", label: t("data.performance.cancelled") },
	]);

	// Status badge helper
	function getStatusBadge(status: string) {
		switch (status) {
			case "Completed":
				return {
					label: t("data.performance.completed"),
					variant: "default",
					class: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
				};
			case "Processing":
				return {
					label: t("data.performance.processing"),
					variant: "secondary",
					class: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
				};
			case "Pending":
				return {
					label: t("data.performance.pending"),
					variant: "outline",
					class: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
				};
			case "Cancelled":
				return {
					label: t("data.performance.cancelled"),
					variant: "destructive",
					class: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
				};
			default:
				return { label: status, variant: "secondary", class: "" };
		}
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:p-6 mx-auto w-full">
	<!-- Toast notification -->
	{#if toastMessage}
		<div
			class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2"
		>
			<CheckCircle2Icon class="size-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Header Title & Subtitle -->
	<div class="flex flex-col gap-1">
		<h1
			class="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
		>
			{t("data.performance.title")}
		</h1>
		<p class="text-xs sm:text-sm text-muted-foreground">
			{t("data.performance.subtitle")}
		</p>
	</div>

	<!-- Top Navigation Tabs (Orders vs Product) -->
	<Tabs.Root bind:value={activeTab} class="w-full">
		<Tabs.List
			class="grid w-full max-w-sm grid-cols-2 rounded-xl border border-border/80 bg-muted/60 p-1"
		>
			<Tabs.Trigger
				value="orders"
				class="rounded-lg text-xs font-semibold py-1.5"
			>
				{t("data.performance.tabOrders")}
			</Tabs.Trigger>
			<Tabs.Trigger
				value="products"
				class="rounded-lg text-xs font-semibold py-1.5"
			>
				{t("data.performance.tabProducts")}
			</Tabs.Trigger>
		</Tabs.List>

		<!-- ==================================================================== -->
		<!-- TAB 1: ORDERS PERFORMANCE                                           -->
		<!-- ==================================================================== -->
		<Tabs.Content
			value="orders"
			class="mt-6 flex flex-col gap-6 outline-hidden"
		>
			<!-- 4 KPI Cards based on current filter using reusable MetricCard -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard
					title={t("data.performance.revenue")}
					value={formatRupiah(kpiRevenue)}
					description={t("data.performance.revenueDesc", {
						count: filteredOrders.filter(
							(o) => o.status !== "Cancelled",
						).length,
					})}
					icon={DollarSignIcon}
				/>

				<MetricCard
					title={t("data.performance.cogsTotal")}
					value={formatRupiah(kpiHppTotal)}
					description={t("data.performance.cogsTotalDesc")}
					icon={PackageIcon}
				/>

				<MetricCard
					title={t("data.performance.profit")}
					value={formatRupiah(kpiProfit)}
					description={t("data.performance.profitDesc")}
					valueClass="text-emerald-600 dark:text-emerald-400"
					icon={TrendingUpIcon}
				/>

				<MetricCard
					title={t("data.performance.ordersStatus")}
					value={`${kpiTotalOrders}`}
					icon={ShoppingBagIcon}
				>
					<div class="flex items-center gap-2.5 text-[11px] pt-1">
						<span
							class="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1"
						>
							<span
								class="size-1.5 rounded-full bg-emerald-500 inline-block"
							></span>
							{kpiCompletedOrders}
							{t("data.performance.completed")}
						</span>
						{#if kpiPendingOrders > 0}
							<span
								class="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"
							>
								<span
									class="size-1.5 rounded-full bg-blue-500 inline-block"
								></span>
								{kpiPendingOrders}
								{t("data.performance.processing")}
							</span>
						{/if}
						<span
							class="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1"
						>
							<span
								class="size-1.5 rounded-full bg-rose-500 inline-block"
							></span>
							{kpiCancelledOrders}
							{t("data.performance.cancelled")}
						</span>
					</div>
				</MetricCard>
			</div>

			<!-- Filter & Search Bar (Full Width & Request on Search Button Click) -->
			<Card.Root
				class="p-4 border-border bg-white dark:bg-card shadow-xs rounded-xl flex flex-col gap-3"
			>
				<!-- Row 1: Search Dropdown & Input & Submit Button (Width Full) -->
				<div
					class="flex flex-col sm:flex-row items-center gap-2 w-full"
				>
					<!-- Search Type Selector -->
					<div class="w-full sm:w-44 shrink-0">
						<Select.Root
							type="single"
							bind:value={ordersSearchType}
							items={ordersSearchTypeOptions}
						>
							<Select.Trigger
								class="h-10 w-full rounded-lg border border-border bg-slate-50 dark:bg-muted/50 px-3 text-xs font-medium text-foreground cursor-pointer"
							>
								<Select.Value
									placeholder={t(
										"data.performance.searchType",
									)}
								/>
							</Select.Trigger>
							<Select.Content>
								{#each ordersSearchTypeOptions as opt}
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
					<div class="relative w-full flex-1">
						<SearchIcon
							class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
						/>
						<Input
							type="text"
							placeholder={ordersSearchType === "orderNumber"
								? t("data.performance.searchOrderPlaceholder")
								: t(
										"data.performance.searchProductPlaceholder",
									)}
							bind:value={ordersSearchInput}
							onkeydown={(e) => {
								if (e.key === "Enter") submitOrdersSearch();
							}}
							class="h-10 w-full pl-9 pr-3 rounded-lg border-border bg-white dark:bg-card text-xs sm:text-sm"
						/>
					</div>

					<!-- Submit Search Button -->
					<Button.Root
						type="button"
						onclick={submitOrdersSearch}
						class="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-lg shrink-0 gap-1.5 cursor-pointer shadow-xs"
					>
						<SearchIcon class="size-3.5" />
						<span>{t("data.performance.search")}</span>
					</Button.Root>
				</div>

				<!-- Row 2: Secondary Filters (Date Range, Platform, Warehouse, Shopee Account, Status, Reset) -->
				<div
					class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-border/60"
				>
					<!-- Date Range Picker -->
					<div class="w-full">
						<Popover.Root>
							<Popover.Trigger>
								{#snippet child({ props })}
									<Button.Root
										{...props}
										variant="outline"
										class="h-9 w-full justify-start text-left text-xs font-normal border-border bg-white dark:bg-card px-2.5 shadow-xs truncate cursor-pointer"
									>
										<CalendarIcon
											class="mr-2 size-3.5 text-muted-foreground shrink-0"
										/>
										<span class="truncate">
											{#if ordersDateRange.start}
												{#if ordersDateRange.end}
													{ordersDateRange.start
														.day}/{ordersDateRange
														.start
														.month}/{ordersDateRange
														.start.year} - {ordersDateRange
														.end
														.day}/{ordersDateRange
														.end
														.month}/{ordersDateRange
														.end.year}
												{:else}
													{ordersDateRange.start
														.day}/{ordersDateRange
														.start
														.month}/{ordersDateRange
														.start.year}
												{/if}
											{:else}
												{t("data.performance.allDates")}
											{/if}
										</span>
									</Button.Root>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-3" align="start">
								<div
									class="flex items-center gap-1.5 pb-2 border-b border-border mb-2"
								>
									<Button.Root
										variant="outline"
										size="sm"
										class="h-7 text-[11px] px-2.5"
										onclick={() => {
											ordersDateRange = {
												start: todayDate,
												end: todayDate,
											};
										}}
									>
										{t("data.performance.today")}
									</Button.Root>
									<Button.Root
										variant="outline"
										size="sm"
										class="h-7 text-[11px] px-2.5"
										onclick={() => {
											const past7 = todayDate.subtract({
												days: 6,
											});
											ordersDateRange = {
												start: past7,
												end: todayDate,
											};
										}}
									>
										{t("data.performance.sevenDays")}
									</Button.Root>
									<Button.Root
										variant="outline"
										size="sm"
										class="h-7 text-[11px] px-2.5"
										onclick={() => {
											const past30 = todayDate.subtract({
												days: 29,
											});
											ordersDateRange = {
												start: past30,
												end: todayDate,
											};
										}}
									>
										{t("data.performance.thirtyDays")}
									</Button.Root>
									<Button.Root
										variant="ghost"
										size="sm"
										class="h-7 text-[11px] px-2.5 text-muted-foreground"
										onclick={() => {
											ordersDateRange = {
												start: undefined,
												end: undefined,
											};
										}}
									>
										{t("data.performance.all")}
									</Button.Root>
								</div>
								<RangeCalendar bind:value={ordersDateRange} />
							</Popover.Content>
						</Popover.Root>
					</div>

					<!-- Platform Filter -->
					<div class="w-full">
						<Select.Root
							type="single"
							bind:value={selectedPlatform}
							items={platformFilterItems}
						>
							<Select.Trigger
								class="h-9 w-full rounded-lg border border-border bg-white dark:bg-card px-2.5 text-xs text-foreground cursor-pointer shadow-xs truncate"
							>
								<Select.Value
									placeholder={t(
										"data.performance.allPlatforms",
									)}
								/>
							</Select.Trigger>
							<Select.Content>
								{#each platformFilterItems as opt}
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

					<!-- Warehouse Filter -->
					<div class="w-full">
						<Select.Root
							type="single"
							bind:value={selectedWarehouse}
							items={warehouseFilterItems}
						>
							<Select.Trigger
								class="h-9 w-full rounded-lg border border-border bg-white dark:bg-card px-2.5 text-xs text-foreground cursor-pointer shadow-xs truncate"
							>
								<Select.Value
									placeholder={t(
										"data.performance.allWarehouses",
									)}
								/>
							</Select.Trigger>
							<Select.Content>
								{#each warehouseFilterItems as opt}
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

					<!-- Shopee Account Filter -->
					<div class="w-full">
						<Select.Root
							type="single"
							bind:value={selectedShopeeAccount}
							items={shopeeAccountFilterItems}
						>
							<Select.Trigger
								class="h-9 w-full rounded-lg border border-border bg-white dark:bg-card px-2.5 text-xs text-foreground cursor-pointer shadow-xs truncate"
							>
								<Select.Value
									placeholder={t(
										"data.performance.allAccounts",
									)}
								/>
							</Select.Trigger>
							<Select.Content>
								{#each shopeeAccountFilterItems as opt}
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

					<!-- Status Filter -->
					<div class="w-full">
						<Select.Root
							type="single"
							bind:value={selectedStatus}
							items={statusFilterItems}
						>
							<Select.Trigger
								class="h-9 w-full rounded-lg border border-border bg-white dark:bg-card px-2.5 text-xs text-foreground cursor-pointer shadow-xs truncate"
							>
								<Select.Value
									placeholder={t(
										"data.performance.allStatuses",
									)}
								/>
							</Select.Trigger>
							<Select.Content>
								{#each statusFilterItems as opt}
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

					<!-- Reset Button -->
					<div class="w-full">
						<Button.Root
							variant="outline"
							onclick={resetOrdersFilters}
							class="h-9 w-full gap-1.5 rounded-lg border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted shadow-xs cursor-pointer"
						>
							<RotateCcwIcon
								class="size-3.5 text-muted-foreground"
							/>
							<span>{t("data.performance.resetFilter")}</span>
						</Button.Root>
					</div>
				</div>
			</Card.Root>

			<!-- Orders Table Card with sorting on Order Date, Status, Revenue, Profit -->
			<Card.Root
				class="p-0 border-border bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden"
			>
				<Table.Root>
					<Table.Header
						class="bg-slate-50 dark:bg-muted/50 border-b border-border"
					>
						<Table.Row class="hover:bg-transparent">
							<!-- Checkbox -->
							<Table.Head class="p-3 w-10 text-center">
								<Checkbox
									checked={isAllOrdersSelected}
									onCheckedChange={toggleAllOrders}
									aria-label={t(
										"data.performance.selectAllOrders",
									)}
								/>
							</Table.Head>
							<!-- Order Number -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
							>
								{t("data.performance.colOrderNumber")}
							</Table.Head>
							<!-- Order Date (Sortable) -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
							>
								<button
									type="button"
									onclick={() =>
										handleOrdersSort("orderDate")}
									class="flex items-center gap-1 font-semibold hover:text-foreground cursor-pointer transition-colors"
								>
									<span
										>{t(
											"data.performance.colOrderDate",
										)}</span
									>
									{#if ordersSortKey === "orderDate"}
										{#if ordersSortDirection === "asc"}
											<ArrowUpIcon
												class="size-3.5 text-primary"
											/>
										{:else}
											<ArrowDownIcon
												class="size-3.5 text-primary"
											/>
										{/if}
									{:else}
										<ArrowUpDownIcon
											class="size-3.5 text-muted-foreground/60"
										/>
									{/if}
								</button>
							</Table.Head>
							<!-- Status (Sortable) -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
							>
								<button
									type="button"
									onclick={() => handleOrdersSort("status")}
									class="flex items-center gap-1 font-semibold hover:text-foreground cursor-pointer transition-colors"
								>
									<span
										>{t("data.performance.colStatus")}</span
									>
									{#if ordersSortKey === "status"}
										{#if ordersSortDirection === "asc"}
											<ArrowUpIcon
												class="size-3.5 text-primary"
											/>
										{:else}
											<ArrowDownIcon
												class="size-3.5 text-primary"
											/>
										{/if}
									{:else}
										<ArrowUpDownIcon
											class="size-3.5 text-muted-foreground/60"
										/>
									{/if}
								</button>
							</Table.Head>
							<!-- Product -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-50"
							>
								{t("data.performance.colProduct")}
							</Table.Head>
							<!-- SKU -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
							>
								{t("data.performance.colSku")}
							</Table.Head>
							<!-- Qty -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center"
							>
								{t("data.performance.colQty")}
							</Table.Head>
							<!-- Revenue (Sortable) -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right"
							>
								<button
									type="button"
									onclick={() => handleOrdersSort("revenue")}
									class="flex items-center gap-1 ml-auto font-semibold hover:text-foreground cursor-pointer transition-colors"
								>
									<span
										>{t(
											"data.performance.colRevenue",
										)}</span
									>
									{#if ordersSortKey === "revenue"}
										{#if ordersSortDirection === "asc"}
											<ArrowUpIcon
												class="size-3.5 text-primary"
											/>
										{:else}
											<ArrowDownIcon
												class="size-3.5 text-primary"
											/>
										{/if}
									{:else}
										<ArrowUpDownIcon
											class="size-3.5 text-muted-foreground/60"
										/>
									{/if}
								</button>
							</Table.Head>
							<!-- HPP / Unit -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right"
							>
								{t("data.performance.colCogsUnit")}
							</Table.Head>
							<!-- HPP Total -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right"
							>
								{t("data.performance.colCogsTotal")}
							</Table.Head>
							<!-- Profit (Sortable) -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right"
							>
								<button
									type="button"
									onclick={() => handleOrdersSort("profit")}
									class="flex items-center gap-1 ml-auto font-semibold hover:text-foreground cursor-pointer transition-colors"
								>
									<span
										>{t("data.performance.colProfit")}</span
									>
									{#if ordersSortKey === "profit"}
										{#if ordersSortDirection === "asc"}
											<ArrowUpIcon
												class="size-3.5 text-primary"
											/>
										{:else}
											<ArrowDownIcon
												class="size-3.5 text-primary"
											/>
										{/if}
									{:else}
										<ArrowUpDownIcon
											class="size-3.5 text-muted-foreground/60"
										/>
									{/if}
								</button>
							</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body class="divide-y divide-border/60">
						{#if paginatedOrders.length === 0}
							<Table.Row>
								<Table.Cell
									colspan={11}
									class="p-8 text-center text-muted-foreground"
								>
									<div
										class="flex flex-col items-center justify-center gap-2"
									>
										<PackageIcon
											class="size-8 text-muted-foreground/50"
										/>
										<p class="text-sm font-medium">
											{t(
												"data.performance.noOrdersFound",
											)}
										</p>
										<Button.Root
											variant="outline"
											size="sm"
											onclick={resetOrdersFilters}
										>
											{t("data.performance.resetFilter")}
										</Button.Root>
									</div>
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each paginatedOrders as order (order.id)}
								{@const badge = getStatusBadge(order.status)}
								<Table.Row
									class="hover:bg-slate-50/70 dark:hover:bg-muted/40 transition-colors"
								>
									<!-- Checkbox -->
									<Table.Cell class="p-3 text-center">
										<Checkbox
											checked={selectedOrderIds.includes(
												order.id,
											)}
											onCheckedChange={() =>
												toggleOrderSelect(order.id)}
											aria-label={`Select ${order.orderNumber}`}
										/>
									</Table.Cell>
									<!-- Order Number -->
									<Table.Cell
										class="p-3 font-mono text-[11px] font-medium text-foreground"
									>
										<div class="flex items-center gap-1.5">
											<span>{order.orderNumber}</span>
											<button
												type="button"
												onclick={() =>
													copyOrderNumber(
														order.orderNumber,
													)}
												class="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
												title={t(
													"data.performance.copyOrderTooltip",
												)}
											>
												{#if copiedOrderNumber === order.orderNumber}
													<CheckIcon
														class="size-3 text-emerald-500"
													/>
												{:else}
													<CopyIcon class="size-3" />
												{/if}
											</button>
										</div>
										<div
											class="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"
										>
											<span
												class="inline-block size-1.5 rounded-full bg-primary/70"
											></span>
											<span>{order.platform}</span>
										</div>
									</Table.Cell>
									<!-- Order Date -->
									<Table.Cell
										class="p-3 text-foreground whitespace-nowrap text-xs"
									>
										{order.orderDate}
									</Table.Cell>
									<!-- Status -->
									<Table.Cell class="p-3 whitespace-nowrap">
										<Badge
											variant="outline"
											class={cn(
												"text-[10px] px-2 py-0.5 font-medium border",
												badge.class,
											)}
										>
											{badge.label}
										</Badge>
									</Table.Cell>
									<!-- Product -->
									<Table.Cell
										class="p-3 font-medium text-foreground max-w-60 truncate text-xs"
										title={order.productName}
									>
										{order.productName}
									</Table.Cell>
									<!-- SKU -->
									<Table.Cell
										class="p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap"
									>
										{order.sku}
									</Table.Cell>
									<!-- Qty -->
									<Table.Cell
										class="p-3 text-center font-semibold text-foreground text-xs"
									>
										{order.qty}
									</Table.Cell>
									<!-- Revenue -->
									<Table.Cell
										class="p-3 text-right font-medium text-foreground whitespace-nowrap text-xs"
									>
										{formatRupiah(order.revenue)}
									</Table.Cell>
									<!-- HPP / Unit -->
									<Table.Cell
										class="p-3 text-right text-muted-foreground whitespace-nowrap text-xs"
									>
										{formatRupiah(order.hppUnit)}
									</Table.Cell>
									<!-- HPP Total -->
									<Table.Cell
										class="p-3 text-right text-muted-foreground whitespace-nowrap text-xs"
									>
										{formatRupiah(order.hppTotal)}
									</Table.Cell>
									<!-- Profit -->
									<Table.Cell
										class="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-xs"
									>
										{formatRupiah(order.profit)}
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>

				<!-- Orders Pagination Bar using shadcn Pagination component (Minimum 10 per page) -->
				<div
					class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-slate-50/50 dark:bg-muted/20"
				>
					<div
						class="flex items-center gap-3 text-xs text-muted-foreground"
					>
						<span>
							{t("data.performance.showingOrders", {
								start:
									(ordersCurrentPage - 1) * ordersPerPage + 1,
								end: Math.min(
									ordersCurrentPage * ordersPerPage,
									sortedOrders.length,
								),
								total: sortedOrders.length,
							})}
						</span>
						<div class="flex items-center gap-1.5 ml-2">
							<span>{t("data.performance.perPage")}</span>
							<select
								bind:value={ordersPerPage}
								onchange={() => (ordersCurrentPage = 1)}
								class="h-8 rounded border border-border bg-white dark:bg-card px-2 text-xs text-foreground cursor-pointer"
							>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
								<option value={100}>100</option>
							</select>
						</div>
					</div>

					<!-- shadcn-svelte Pagination Root -->
					<div class="flex items-center justify-end w-full sm:w-auto">
						<Pagination.Root
							count={Math.max(sortedOrders.length, 1)}
							perPage={ordersPerPage}
							bind:page={ordersCurrentPage}
							siblingCount={1}
							class="mx-0 w-auto"
						>
							{#snippet children({ pages, currentPage })}
								<Pagination.Content
									class="gap-1 flex items-center"
								>
									<Pagination.Item>
										<Pagination.Previous
											class="h-8 px-2.5 text-xs font-medium rounded-md cursor-pointer bg-white dark:bg-card text-foreground hover:bg-slate-50 dark:hover:bg-muted border border-border/80 shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
										/>
									</Pagination.Item>
									{#each pages as pageItem (pageItem.key)}
										{#if pageItem.type === "ellipsis"}
											<Pagination.Item>
												<Pagination.Ellipsis
													class="size-8"
												/>
											</Pagination.Item>
										{:else}
											<Pagination.Item>
												<Pagination.Link
													page={pageItem}
													isActive={currentPage ===
														pageItem.value}
													class={cn(
														"size-8 text-xs font-semibold rounded-md cursor-pointer transition-colors shadow-xs flex items-center justify-center",
														currentPage ===
															pageItem.value
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
			</Card.Root>
		</Tabs.Content>

		<!-- ==================================================================== -->
		<!-- TAB 2: PRODUCT PERFORMANCE                                          -->
		<!-- ==================================================================== -->
		<Tabs.Content
			value="products"
			class="mt-6 flex flex-col gap-6 outline-hidden"
		>
			<!-- Title Modul & Tombol Export (justify-between items-center) -->
			<div
				class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
			>
				<div>
					<h2
						class="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground"
					>
						{t("data.performance.productSectionTitle")}
					</h2>
					<p class="text-xs text-muted-foreground mt-0.5">
						{t("data.performance.productSectionSubtitle")}
					</p>
				</div>
				<!-- Export Button -->
				<Button.Root
					type="button"
					variant="outline"
					onclick={exportProductData}
					class="gap-1.5 h-9 rounded-lg border-border bg-white dark:bg-card px-3.5 text-xs font-semibold text-foreground shadow-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-muted shrink-0"
				>
					<DownloadIcon class="size-3.5 text-muted-foreground" />
					<span>{t("data.performance.exportData")}</span>
				</Button.Root>
			</div>

			<!-- Search & Filter Bar (Width Full, Date Range, Submit on Button Click, Reset) -->
			<Card.Root
				class="p-4 border-border bg-white dark:bg-card shadow-xs rounded-xl flex flex-col sm:flex-row items-center gap-3"
			>
				<!-- Search Product Name / SKU (Width Full) -->
				<div class="relative w-full flex-1">
					<SearchIcon
						class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
					/>
					<Input
						type="text"
						placeholder={t(
							"data.performance.productSearchPlaceholder",
						)}
						bind:value={productSearchInput}
						onkeydown={(e) => {
							if (e.key === "Enter") submitProductSearch();
						}}
						class="h-10 w-full pl-9 pr-3 rounded-lg border-border bg-white dark:bg-card text-xs sm:text-sm"
					/>
				</div>

				<!-- Date Range Filter -->
				<div class="w-full sm:w-64 shrink-0">
					<Popover.Root>
						<Popover.Trigger>
							{#snippet child({ props })}
								<Button.Root
									{...props}
									variant="outline"
									class="h-10 w-full justify-start text-left text-xs font-normal border-border bg-white dark:bg-card px-3 shadow-xs truncate cursor-pointer"
								>
									<CalendarIcon
										class="mr-2 size-3.5 text-muted-foreground shrink-0"
									/>
									<span class="truncate">
										{#if productDateRange.start}
											{#if productDateRange.end}
												{productDateRange.start
													.day}/{productDateRange
													.start
													.month}/{productDateRange
													.start.year} - {productDateRange
													.end.day}/{productDateRange
													.end
													.month}/{productDateRange
													.end.year}
											{:else}
												{productDateRange.start
													.day}/{productDateRange
													.start
													.month}/{productDateRange
													.start.year}
											{/if}
										{:else}
											{t(
												"data.performance.filterCreatedDate",
											)}
										{/if}
									</span>
								</Button.Root>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-3" align="start">
							<div
								class="flex items-center gap-1.5 pb-2 border-b border-border mb-2"
							>
								<Button.Root
									variant="outline"
									size="sm"
									class="h-7 text-[11px] px-2.5"
									onclick={() => {
										productDateRange = {
											start: todayDate,
											end: todayDate,
										};
									}}
								>
									{t("data.performance.today")}
								</Button.Root>
								<Button.Root
									variant="outline"
									size="sm"
									class="h-7 text-[11px] px-2.5"
									onclick={() => {
										const past7 = todayDate.subtract({
											days: 6,
										});
										productDateRange = {
											start: past7,
											end: todayDate,
										};
									}}
								>
									{t("data.performance.sevenDays")}
								</Button.Root>
								<Button.Root
									variant="ghost"
									size="sm"
									class="h-7 text-[11px] px-2.5 text-muted-foreground"
									onclick={() => {
										productDateRange = {
											start: undefined,
											end: undefined,
										};
									}}
								>
									{t("data.performance.all")}
								</Button.Root>
							</div>
							<RangeCalendar bind:value={productDateRange} />
						</Popover.Content>
					</Popover.Root>
				</div>

				<!-- Search Submit Button -->
				<Button.Root
					type="button"
					onclick={submitProductSearch}
					class="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-lg shrink-0 gap-1.5 cursor-pointer shadow-xs w-full sm:w-auto"
				>
					<SearchIcon class="size-3.5" />
					<span>{t("data.performance.search")}</span>
				</Button.Root>

				<!-- Reset Button -->
				<Button.Root
					variant="outline"
					onclick={resetProductFilters}
					class="h-10 gap-1.5 rounded-lg border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted shadow-xs cursor-pointer shrink-0 w-full sm:w-auto"
				>
					<RotateCcwIcon class="size-3.5 text-muted-foreground" />
					<span>{t("data.performance.resetFilter")}</span>
				</Button.Root>
			</Card.Root>

			<!-- Products Table Card with Sort on Sold -->
			<Card.Root
				class="border-border bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden"
			>
				<Table.Root>
					<Table.Header
						class="bg-slate-50 dark:bg-muted/50 border-b border-border"
					>
						<Table.Row class="hover:bg-transparent">
							<!-- Checkbox -->
							<Table.Head class="p-3 w-10 text-center">
								<Checkbox
									checked={isAllProductsSelected}
									onCheckedChange={toggleAllProducts}
									aria-label={t(
										"data.performance.selectAllProducts",
									)}
								/>
							</Table.Head>
							<!-- Product (Photo + Name + SKU) -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-70"
							>
								{t("data.performance.colProduct")}
							</Table.Head>
							<!-- Sold (Sortable) -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center"
							>
								<button
									type="button"
									onclick={handleProductSortSold}
									class="flex items-center gap-1 mx-auto font-semibold hover:text-foreground cursor-pointer transition-colors"
								>
									<span>{t("data.performance.colSold")}</span>
									{#if productSortDirection === "asc"}
										<ArrowUpIcon
											class="size-3.5 text-primary"
										/>
									{:else}
										<ArrowDownIcon
											class="size-3.5 text-primary"
										/>
									{/if}
								</button>
							</Table.Head>
							<!-- Revenue -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right"
							>
								{t("data.performance.colProductRevenue")}
							</Table.Head>
							<!-- CreatedAt -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center"
							>
								{t("data.performance.colCreatedAt")}
							</Table.Head>
							<!-- Action -->
							<Table.Head
								class="p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center w-24"
							>
								{t("data.performance.colAction")}
							</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body class="divide-y divide-border/60">
						{#if paginatedProducts.length === 0}
							<Table.Row>
								<Table.Cell
									colspan={6}
									class="p-8 text-center text-muted-foreground"
								>
									<div
										class="flex flex-col items-center justify-center gap-2"
									>
										<PackageIcon
											class="size-8 text-muted-foreground/50"
										/>
										<p class="text-sm font-medium">
											{t(
												"data.performance.noProductsFound",
											)}
										</p>
										<Button.Root
											variant="outline"
											size="sm"
											onclick={resetProductFilters}
										>
											{t("data.performance.resetFilter")}
										</Button.Root>
									</div>
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each paginatedProducts as prod (prod.id)}
								<Table.Row
									class="hover:bg-slate-50/70 dark:hover:bg-muted/40 transition-colors"
								>
									<!-- Checkbox -->
									<Table.Cell class="p-3 text-center">
										<Checkbox
											checked={selectedProductIds.includes(
												prod.id,
											)}
											onCheckedChange={() =>
												toggleProductSelect(prod.id)}
											aria-label={`Select ${prod.productName}`}
										/>
									</Table.Cell>
									<!-- Product (Photo + Name + SKU) -->
									<Table.Cell class="p-3">
										<div class="flex items-center gap-3">
											<img
												src={prod.photo}
												alt={prod.productName}
												class="size-11 rounded-lg object-cover border border-border shrink-0 bg-muted"
											/>
											<div class="flex flex-col gap-0.5">
												<span
													class="font-medium text-foreground text-xs sm:text-sm leading-tight"
												>
													{prod.productName}
												</span>
												<span
													class="font-mono text-[11px] text-muted-foreground"
												>
													{prod.sku}
												</span>
											</div>
										</div>
									</Table.Cell>
									<!-- Sold -->
									<Table.Cell class="p-3 text-center">
										<span
											class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
										>
											{prod.sold}
											{t("data.performance.units")}
										</span>
									</Table.Cell>
									<!-- Revenue -->
									<Table.Cell
										class="p-3 text-right font-semibold text-foreground whitespace-nowrap text-xs"
									>
										{formatRupiah(prod.revenue)}
									</Table.Cell>
									<!-- CreatedAt -->
									<Table.Cell
										class="p-3 text-center text-muted-foreground whitespace-nowrap text-xs"
									>
										{prod.createdAt}
									</Table.Cell>
									<!-- Action (Detail Icon Button) -->
									<Table.Cell class="p-3 text-center">
										<Button.Root
											variant="ghost"
											size="icon"
											onclick={() =>
												openProductDetail(prod)}
											class="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted cursor-pointer"
											title={t(
												"data.performance.viewChannelBreakdown",
											)}
										>
											<EyeIcon class="size-4" />
										</Button.Root>
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>

				<!-- Product Pagination Bar using shadcn Pagination component (Minimum 10 per page) -->
				<div
					class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-slate-50/50 dark:bg-muted/20"
				>
					<div
						class="flex items-center gap-3 text-xs text-muted-foreground"
					>
						<span>
							{t("data.performance.showingProducts", {
								start:
									(productCurrentPage - 1) * productPerPage +
									1,
								end: Math.min(
									productCurrentPage * productPerPage,
									sortedProducts.length,
								),
								total: sortedProducts.length,
							})}
						</span>
						<div class="flex items-center gap-1.5 ml-2">
							<span>{t("data.performance.perPage")}</span>
							<select
								bind:value={productPerPage}
								onchange={() => (productCurrentPage = 1)}
								class="h-8 rounded border border-border bg-white dark:bg-card px-2 text-xs text-foreground cursor-pointer"
							>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
								<option value={100}>100</option>
							</select>
						</div>
					</div>

					<!-- shadcn-svelte Pagination Root -->
					<div class="flex items-center justify-end w-full sm:w-auto">
						<Pagination.Root
							count={Math.max(sortedProducts.length, 1)}
							perPage={productPerPage}
							bind:page={productCurrentPage}
							siblingCount={1}
							class="mx-0 w-auto"
						>
							{#snippet children({ pages, currentPage })}
								<Pagination.Content
									class="gap-1 flex items-center"
								>
									<Pagination.Item>
										<Pagination.Previous
											class="h-8 px-2.5 text-xs font-medium rounded-md cursor-pointer bg-white dark:bg-card text-foreground hover:bg-slate-50 dark:hover:bg-muted border border-border/80 shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
										/>
									</Pagination.Item>
									{#each pages as pageItem (pageItem.key)}
										{#if pageItem.type === "ellipsis"}
											<Pagination.Item>
												<Pagination.Ellipsis
													class="size-8"
												/>
											</Pagination.Item>
										{:else}
											<Pagination.Item>
												<Pagination.Link
													page={pageItem}
													isActive={currentPage ===
														pageItem.value}
													class={cn(
														"size-8 text-xs font-semibold rounded-md cursor-pointer transition-colors shadow-xs flex items-center justify-center",
														currentPage ===
															pageItem.value
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
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>

	<!-- Detail Dialog: Modal showing platform breakdown and quantities -->
	<Dialog.Root bind:open={isDetailDialogOpen}>
		<Dialog.Content class="sm:max-w-md max-h-[90vh] overflow-y-auto">
			{#if activeDetailProduct}
				<Dialog.Header>
					<Dialog.Title
						class="font-heading text-lg font-bold flex items-center gap-2"
					>
						<StoreIcon class="size-5 text-primary" />
						{t("data.performance.dialogTitle")}
					</Dialog.Title>
					<Dialog.Description class="text-xs text-muted-foreground">
						{t("data.performance.dialogDesc")}
					</Dialog.Description>
				</Dialog.Header>

				<!-- Product summary preview -->
				<div
					class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-muted/40 border border-border mt-3"
				>
					<img
						src={activeDetailProduct.photo}
						alt={activeDetailProduct.productName}
						class="size-12 rounded-lg object-cover border border-border shrink-0"
					/>
					<div class="flex flex-col min-w-0">
						<span
							class="font-medium text-xs sm:text-sm text-foreground truncate"
						>
							{activeDetailProduct.productName}
						</span>
						<span
							class="font-mono text-[11px] text-muted-foreground"
						>
							{activeDetailProduct.sku}
						</span>
						<div class="flex items-center gap-3 text-[11px] mt-1">
							<span class="text-primary font-semibold"
								>{t("data.performance.totalSoldLabel", {
									count: activeDetailProduct.sold,
								})}</span
							>
							<span class="text-muted-foreground font-medium"
								>• {formatRupiah(
									activeDetailProduct.revenue,
								)}</span
							>
						</div>
					</div>
				</div>

				<!-- Channel breakdown list with bar progress -->
				<div class="flex flex-col gap-3 mt-4">
					<span
						class="text-xs font-semibold text-foreground uppercase tracking-wider"
					>
						{t("data.performance.platformBreakdown")}
					</span>
					{#each activeDetailProduct.channelBreakdown as ch}
						<div
							class="flex flex-col gap-1.5 p-3 rounded-lg border border-border/80 bg-white dark:bg-card"
						>
							<div
								class="flex items-center justify-between text-xs"
							>
								<span
									class="font-semibold text-foreground flex items-center gap-1.5"
								>
									<span
										class="size-2 rounded-full bg-primary inline-block"
									></span>
									{ch.platform}
								</span>
								<div class="flex items-center gap-2">
									<span class="font-bold text-foreground"
										>{ch.soldQty}
										{t("data.performance.units")}</span
									>
									<span class="text-muted-foreground"
										>({ch.percentage}%)</span
									>
								</div>
							</div>
							<!-- Progress bar -->
							<div
								class="h-1.5 w-full bg-slate-100 dark:bg-muted rounded-full overflow-hidden"
							>
								<div
									class="h-full bg-primary rounded-full transition-all"
									style="width: {ch.percentage}%"
								></div>
							</div>
							<div
								class="text-[11px] text-muted-foreground text-right mt-0.5"
							>
								{t("data.performance.turnoverLabel")}:
								<span class="font-medium text-foreground"
									>{formatRupiah(ch.revenue)}</span
								>
							</div>
						</div>
					{/each}
				</div>

				<Dialog.Footer class="mt-4">
					<Button.Root
						type="button"
						variant="outline"
						onclick={() => (isDetailDialogOpen = false)}
						class="w-full sm:w-auto text-xs"
					>
						{t("data.performance.close")}
					</Button.Root>
				</Dialog.Footer>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
</div>
