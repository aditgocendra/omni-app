<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import {
		DataTable,
		ConfirmDialog,
		type DataTableColumn,
	} from "$lib/components/common/index.js";
	import { t } from "$lib/i18n/index.js";
	import type { StockTransferRecord } from "$lib/types/index.js";

	import PlusIcon from "@lucide/svelte/icons/plus";
	import SearchIcon from "@lucide/svelte/icons/search";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import CheckIcon from "@lucide/svelte/icons/check";
	import XIcon from "@lucide/svelte/icons/x";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import ArrowRightLeftIcon from "@lucide/svelte/icons/arrow-right-left";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import PackageIcon from "@lucide/svelte/icons/package";

	// Initial dataset based on prompt examples
	let transfers = $state<StockTransferRecord[]>([
		{
			id: "trf-1",
			codeTransfer: "TRF-20261019-2111",
			date: "18/10/2026",
			origin: "Gudang A - Jakarta Pusat",
			destination: "Gudang B - Surabaya Timur",
			products: 82,
			status: "Success",
			manager: "Yono",
		},
		{
			id: "trf-2",
			codeTransfer: "TRF-20261019-2112",
			date: "19/10/2026",
			origin: "Gudang B - Surabaya Timur",
			destination: "Gudang C - Bandung Barat",
			products: 45,
			status: "Pending",
			manager: "Budi Santoso",
		},
		{
			id: "trf-3",
			codeTransfer: "TRF-20261020-3001",
			date: "20/10/2026",
			origin: "Gudang C - Bandung Barat",
			destination: "Gudang A - Jakarta Pusat",
			products: 120,
			status: "Pending",
			manager: "Dewi Sartika",
		},
		{
			id: "trf-4",
			codeTransfer: "TRF-20261017-0941",
			date: "17/10/2026",
			origin: "Gudang D - Semarang Hub",
			destination: "Gudang B - Surabaya Timur",
			products: 30,
			status: "Success",
			manager: "Ahmad Fauzi",
		},
		{
			id: "trf-5",
			codeTransfer: "TRF-20261015-8820",
			date: "15/10/2026",
			origin: "Gudang A - Jakarta Pusat",
			destination: "Gudang E - Medan Deli",
			products: 64,
			status: "Cancelled",
			manager: "Yono",
		},
		{
			id: "trf-6",
			codeTransfer: "TRF-20261014-1109",
			date: "14/10/2026",
			origin: "Gudang E - Medan Deli",
			destination: "Gudang C - Bandung Barat",
			products: 90,
			status: "Success",
			manager: "Hendra Gunawan",
		},
	]);

	// Filter, Sort & Pagination states
	let searchQuery = $state("");
	let selectedWarehouse = $state("all");
	let selectedStatus = $state("all");
	let sortDirection = $state<"asc" | "desc" | "none">("none");
	let currentPage = $state(1);
	let pageSize = $state(5);

	$effect(() => {
		searchQuery;
		selectedWarehouse;
		selectedStatus;
		currentPage = 1;
		selectedIds = [];
	});

	const columns = $derived<DataTableColumn<StockTransferRecord>[]>([
		{
			id: "code",
			header: t("warehouse.transfer.colCode"),
		},
		{
			id: "date",
			header: t("warehouse.transfer.colDate"),
			sortable: true,
		},
		{
			id: "origin",
			header: t("warehouse.transfer.colOrigin"),
		},
		{
			id: "destination",
			header: t("warehouse.transfer.colDestination"),
		},
		{
			id: "products",
			header: t("warehouse.transfer.colProducts"),
		},
		{
			id: "status",
			header: t("warehouse.transfer.colStatus"),
		},
		{
			id: "actions",
			header: t("warehouse.transfer.colActions"),
			align: "right",
		},
	]);

	// Dialog & Toast states
	let isCreateModalOpen = $state(false);
	let isDetailModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let transferToDelete = $state<StockTransferRecord | null>(null);
	let selectedIds = $state<(string | number)[]>([]);
	let selectedTransfer = $state<StockTransferRecord | null>(null);
	let toastMessage = $state<string | null>(null);

	// Form inputs for create/edit
	let formOrigin = $state("Gudang A - Jakarta Pusat");
	let formDestination = $state("Gudang B - Surabaya Timur");
	let formProducts = $state(20);
	let formManager = $state("Yono");

	const warehouseOptions = [
		"Gudang A - Jakarta Pusat",
		"Gudang B - Surabaya Timur",
		"Gudang C - Bandung Barat",
		"Gudang D - Semarang Hub",
		"Gudang E - Medan Deli",
	];

	const warehouseFilterOptions = $derived([
		{ value: "all", label: t("warehouse.transfer.filterWarehouse") },
		{ value: "Gudang A", label: "Gudang A - Jakarta" },
		{ value: "Gudang B", label: "Gudang B - Surabaya" },
		{ value: "Gudang C", label: "Gudang C - Bandung" },
		{ value: "Gudang D", label: "Gudang D - Semarang" },
		{ value: "Gudang E", label: "Gudang E - Medan" },
	]);

	const statusFilterOptions = $derived([
		{ value: "all", label: t("warehouse.transfer.filterStatus") },
		{ value: "success", label: "Success" },
		{ value: "pending", label: "Pending" },
		{ value: "cancelled", label: "Cancelled" },
	]);

	const formWarehouseItems = $derived(
		warehouseOptions.map((wh) => ({ value: wh, label: wh }))
	);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3000);
	}

	function parseDate(dateStr: string): number {
		const parts = dateStr.split("/");
		if (parts.length === 3) {
			const day = parseInt(parts[0], 10);
			const month = parseInt(parts[1], 10) - 1;
			const year = parseInt(parts[2], 10);
			return new Date(year, month, day).getTime();
		}
		return 0;
	}

	function toggleSortDate() {
		if (sortDirection === "none") {
			sortDirection = "asc";
		} else if (sortDirection === "asc") {
			sortDirection = "desc";
		} else {
			sortDirection = "none";
		}
	}

	function resetFilters() {
		searchQuery = "";
		selectedWarehouse = "all";
		selectedStatus = "all";
		sortDirection = "none";
		showToast("Filters reset to default.");
	}

	// Filtered & Sorted Records
	const filteredTransfers = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();

		let result = transfers.filter((item) => {
			// Search by code transfer or warehouse manager
			const matchSearch =
				!q ||
				item.codeTransfer.toLowerCase().includes(q) ||
				(item.manager && item.manager.toLowerCase().includes(q)) ||
				item.origin.toLowerCase().includes(q) ||
				item.destination.toLowerCase().includes(q);

			// Filter by warehouse (origin or destination)
			const matchWarehouse =
				selectedWarehouse === "all" ||
				item.origin.includes(selectedWarehouse) ||
				item.destination.includes(selectedWarehouse);

			// Filter by status
			const matchStatus =
				selectedStatus === "all" ||
				item.status.toLowerCase() === selectedStatus.toLowerCase();

			return matchSearch && matchWarehouse && matchStatus;
		});

		if (sortDirection !== "none") {
			result = [...result].sort((a, b) => {
				const timeA = parseDate(a.date);
				const timeB = parseDate(b.date);
				return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
			});
		}

		return result;
	});

	// Actions
	function openCreate() {
		formOrigin = "Gudang A - Jakarta Pusat";
		formDestination = "Gudang B - Surabaya Timur";
		formProducts = 25;
		formManager = "Yono";
		isCreateModalOpen = true;
	}

	function handleCreateSubmit() {
		if (formOrigin === formDestination) {
			alert("Origin and destination warehouses cannot be the same.");
			return;
		}

		const today = new Date();
		const day = String(today.getDate()).padStart(2, "0");
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const year = today.getFullYear();
		const dateStr = `${day}/${month}/${year}`;
		const randCode = Math.floor(1000 + Math.random() * 9000);
		const code = `TRF-${year}${month}${day}-${randCode}`;

		const newEntry: StockTransferRecord = {
			id: "trf-" + Date.now(),
			codeTransfer: code,
			date: dateStr,
			origin: formOrigin,
			destination: formDestination,
			products: Number(formProducts) || 1,
			status: "Pending",
			manager: formManager.trim() || "Operational Staff",
		};

		transfers = [newEntry, ...transfers];
		isCreateModalOpen = false;
		showToast(`Transfer order ${newEntry.codeTransfer} created!`);
	}

	function handleDetail(item: StockTransferRecord) {
		selectedTransfer = item;
		isDetailModalOpen = true;
	}

	function handleAccept(item: StockTransferRecord) {
		transfers = transfers.map((t) =>
			t.id === item.id ? { ...t, status: "Success" } : t,
		);
		showToast(`Transfer ${item.codeTransfer} accepted & completed!`);
	}

	function handleReject(item: StockTransferRecord) {
		transfers = transfers.map((t) =>
			t.id === item.id ? { ...t, status: "Cancelled" } : t,
		);
		showToast(`Transfer ${item.codeTransfer} rejected / cancelled.`);
	}

	function handleEdit(item: StockTransferRecord) {
		selectedTransfer = item;
		formOrigin = item.origin;
		formDestination = item.destination;
		formProducts = item.products;
		formManager = item.manager || "Yono";
		isEditModalOpen = true;
	}

	function handleEditSubmit() {
		if (!selectedTransfer) return;
		transfers = transfers.map((t) => {
			if (t.id === selectedTransfer?.id) {
				return {
					...t,
					origin: formOrigin,
					destination: formDestination,
					products: Number(formProducts) || 1,
					manager: formManager,
				};
			}
			return t;
		});
		isEditModalOpen = false;
		showToast(
			`Transfer ${selectedTransfer.codeTransfer} updated successfully!`,
		);
	}

	function handleDelete(item: StockTransferRecord) {
		transferToDelete = item;
		isDeleteModalOpen = true;
	}

	function handleOpenBulkDelete(ids?: (string | number)[]) {
		if (ids && ids.length > 0) selectedIds = ids;
		if (selectedIds.length === 0) return;
		transferToDelete = null;
		isDeleteModalOpen = true;
	}

	function handleConfirmDelete() {
		if (transferToDelete) {
			const code = transferToDelete.codeTransfer;
			const id = transferToDelete.id;
			transfers = transfers.filter((t) => t.id !== id);
			selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
			showToast(`Transfer ${code} deleted.`);
		} else {
			const count = selectedIds.length;
			transfers = transfers.filter((t) => !selectedIds.includes(t.id));
			selectedIds = [];
			showToast(`${count} transfer berhasil dihapus.`);
		}
		transferToDelete = null;
	}
</script>

<svelte:head>
	<title>{t("warehouse.transfer.title")} | Cronsyst</title>
</svelte:head>

<div class="space-y-6">
	<!-- Toast Notification -->
	{#if toastMessage}
		<div
			class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-primary/20 bg-card px-4 py-3 text-sm text-foreground shadow-lg shadow-black/10 transition-all animate-in fade-in slide-in-from-bottom-2"
		>
			<CheckIcon class="size-4.5 text-emerald-500" />
			<span class="font-medium">{toastMessage}</span>
		</div>
	{/if}

	<!-- Module Header: Title, Subtitle, and Create Button (justify-between, items-center) -->
	<div
		class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5"
	>
		<div>
			<h1
				class="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
			>
				{t("warehouse.transfer.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1.5">
				{t("warehouse.transfer.subtitle")}
			</p>
		</div>

		<div>
			<Button.Root
				onclick={openCreate}
				size="default"
				class="h-9.5 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
			>
				<PlusIcon class="size-4" />
				<span>{t("warehouse.transfer.createBtn")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- Search & Filters Container (full size, search, filter warehouse, filter status, reset button) -->
	<div class="w-full space-y-3">
		<div class="flex flex-col gap-3 lg:flex-row lg:items-center">
			<!-- Search Column (based on code transfer or warehouse manager) - width full -->
			<div class="relative flex-1">
				<SearchIcon
					class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10"
				/>
				<Input
					type="text"
					role="searchbox"
					bind:value={searchQuery}
					placeholder={t("warehouse.transfer.searchPlaceholder")}
					class="h-10 w-full rounded-lg border border-border/80 bg-white dark:bg-card pl-10 pr-9 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary shadow-xs transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = "")}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
						aria-label="Clear search"
					>
						<XIcon class="size-4" />
					</button>
				{/if}
			</div>

			<!-- Filter by Warehouse -->
			<div class="w-full sm:w-56">
				<Select.Root
					type="single"
					bind:value={selectedWarehouse}
					items={warehouseFilterOptions}
				>
					<Select.Trigger class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/60 transition-colors">
						<Select.Value placeholder={t("warehouse.transfer.filterWarehouse")} />
					</Select.Trigger>
					<Select.Content>
						{#each warehouseFilterOptions as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Filter by Status -->
			<div class="w-full sm:w-44">
				<Select.Root
					type="single"
					bind:value={selectedStatus}
					items={statusFilterOptions}
				>
					<Select.Trigger class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/60 transition-colors">
						<Select.Value placeholder={t("warehouse.transfer.filterStatus")} />
					</Select.Trigger>
					<Select.Content>
						{#each statusFilterOptions as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Reset Button -->
			<Button.Root
				variant="outline"
				onclick={resetFilters}
				class="h-10 gap-1.5 rounded-lg border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold text-foreground hover:bg-slate-50 dark:hover:bg-muted hover:text-foreground shadow-xs cursor-pointer shrink-0 transition-colors group/reset"
				title="Reset all filters"
			>
				<RotateCcwIcon class="size-3.5 text-muted-foreground group-hover/reset:text-foreground transition-colors" />
				<span>{t("warehouse.transfer.reset")}</span>
			</Button.Root>

			{#if selectedIds.length > 0}
				<Button.Root
					type="button"
					variant="destructive"
					size="default"
					onclick={() => handleOpenBulkDelete()}
					class="h-10 gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3.5 text-xs font-semibold shadow-xs cursor-pointer shrink-0 transition-all animate-in fade-in"
				>
					<Trash2Icon class="size-3.5" />
					<span>{t("common.delete")} ({selectedIds.length})</span>
				</Button.Root>
			{/if}
		</div>
	</div>

	<!-- Stock Transfer Table Card (Reusable DataTable with Pagination & Selection) -->
	<DataTable
		data={filteredTransfers}
		{columns}
		bind:page={currentPage}
		bind:perPage={pageSize}
		perPageOptions={[5, 10, 20, 50]}
		sortKey="date"
		{sortDirection}
		onSort={() => toggleSortDate()}
		emptyMessage={t("warehouse.transfer.emptyState")}
		emptyIcon={ArrowRightLeftIcon}
		selectable={true}
		bind:selectedIds
		onBulkDelete={handleOpenBulkDelete}
	>
		{#snippet cell({ item, column })}
			{#if column.id === "code"}
				<span class="font-mono text-xs font-bold text-primary">
					{item.codeTransfer}
				</span>
			{:else if column.id === "date"}
				<span
					class="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground"
				>
					<CalendarIcon class="size-3 text-muted-foreground/70" />
					{item.date}
				</span>
			{:else if column.id === "origin"}
				<div
					class="flex items-center gap-1.5 text-xs text-foreground font-medium"
				>
					<span>{item.origin}</span>
				</div>
			{:else if column.id === "destination"}
				<div
					class="flex items-center gap-1.5 text-xs text-foreground font-medium"
				>
					<span>{item.destination}</span>
				</div>
			{:else if column.id === "products"}
				<span
					class="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground bg-muted/60 px-2.5 py-1 rounded-md"
				>
					<PackageIcon class="size-3 text-muted-foreground" />
					{item.products} units
				</span>
			{:else if column.id === "status"}
				{#if item.status === "Success"}
					<span
						class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
					>
						<span class="size-1.5 rounded-full bg-emerald-500"
						></span>
						{item.status}
					</span>
				{:else if item.status === "Pending"}
					<span
						class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400"
					>
						<span class="size-1.5 rounded-full bg-amber-500"></span>
						{item.status}
					</span>
				{:else}
					<span
						class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400"
					>
						<span class="size-1.5 rounded-full bg-rose-500"></span>
						{item.status}
					</span>
				{/if}
			{:else if column.id === "actions"}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button.Root
								variant="ghost"
								size="icon-sm"
								class="size-8 rounded-md border border-border/70 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shadow-xs transition-colors"
								{...props}
								aria-label="More actions"
							>
								<EllipsisVerticalIcon class="size-4" />
							</Button.Root>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						align="end"
						class="w-40 rounded-lg shadow-md border border-border/80 bg-white dark:bg-card p-1"
					>
						<!-- Detail -->
						<DropdownMenu.Item
							onclick={() => handleDetail(item)}
							class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted"
						>
							<EyeIcon class="size-3.5 text-muted-foreground" />
							<span>{t("warehouse.transfer.detail")}</span>
						</DropdownMenu.Item>

						{#if item.status === "Pending"}
							<!-- Accept -->
							<DropdownMenu.Item
								onclick={() => handleAccept(item)}
								class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
							>
								<CheckIcon class="size-3.5 text-emerald-500" />
								<span>{t("warehouse.transfer.accept")}</span>
							</DropdownMenu.Item>

							<!-- Reject -->
							<DropdownMenu.Item
								onclick={() => handleReject(item)}
								class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
							>
								<XIcon class="size-3.5 text-rose-500" />
								<span>{t("warehouse.transfer.reject")}</span>
							</DropdownMenu.Item>
						{/if}

						<!-- Edit -->
						<DropdownMenu.Item
							onclick={() => handleEdit(item)}
							class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted"
						>
							<PencilIcon
								class="size-3.5 text-muted-foreground"
							/>
							<span>{t("warehouse.transfer.edit")}</span>
						</DropdownMenu.Item>

						<DropdownMenu.Separator
							class="my-1 border-t border-border/60"
						/>

						<!-- Delete -->
						<DropdownMenu.Item
							onclick={() => handleDelete(item)}
							class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer text-destructive hover:bg-destructive/10"
						>
							<Trash2Icon class="size-3.5 text-destructive" />
							<span>{t("warehouse.transfer.delete")}</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		{/snippet}

		{#snippet emptySnippet()}
			<div class="flex flex-col items-center justify-center gap-2">
				<ArrowRightLeftIcon class="size-8 text-muted-foreground/40" />
				<p>{t("warehouse.transfer.emptyState")}</p>
				<Button.Root
					variant="ghost"
					size="sm"
					onclick={resetFilters}
					class="text-xs text-primary"
				>
					Clear filters
				</Button.Root>
			</div>
		{/snippet}
	</DataTable>
</div>

<!-- Modal: Create Stock Transfer -->
{#if isCreateModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
	>
		<div
			class="relative w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-xl transition-all"
		>
			<div
				class="flex items-center justify-between pb-4 border-b border-border/60"
			>
				<h3 class="font-heading text-lg font-bold text-foreground">
					{t("warehouse.transfer.createBtn")}
				</h3>
				<button
					type="button"
					onclick={() => (isCreateModalOpen = false)}
					class="rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
				>
					<XIcon class="size-4" />
				</button>
			</div>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleCreateSubmit();
				}}
				class="space-y-4 pt-4"
			>
				<div class="space-y-1.5">
					<label
						for="create-origin-warehouse"
						class="text-xs font-semibold text-foreground"
					>
						{t("warehouse.transfer.colOrigin")}
					</label>
					<Select.Root
						type="single"
						bind:value={formOrigin}
						items={formWarehouseItems}
					>
						<Select.Trigger
							id="create-origin-warehouse"
							class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground shadow-xs"
						>
							<Select.Value placeholder="Select origin warehouse" />
						</Select.Trigger>
						<Select.Content>
							{#each warehouseOptions as wh}
								<Select.Item value={wh} label={wh}>{wh}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<label
						for="create-destination-warehouse"
						class="text-xs font-semibold text-foreground"
					>
						{t("warehouse.transfer.colDestination")}
					</label>
					<Select.Root
						type="single"
						bind:value={formDestination}
						items={formWarehouseItems}
					>
						<Select.Trigger
							id="create-destination-warehouse"
							class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground shadow-xs"
						>
							<Select.Value placeholder="Select destination warehouse" />
						</Select.Trigger>
						<Select.Content>
							{#each warehouseOptions as wh}
								<Select.Item value={wh} label={wh}>{wh}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<label
						for="create-transfer-products"
						class="text-xs font-semibold text-foreground"
					>
						{t("warehouse.transfer.colProducts")} Count
					</label>
					<input
						id="create-transfer-products"
						type="number"
						min="1"
						bind:value={formProducts}
						class="h-9 w-full rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<label
						for="create-transfer-manager"
						class="text-xs font-semibold text-foreground"
					>
						Operational Manager In-Charge
					</label>
					<input
						id="create-transfer-manager"
						type="text"
						bind:value={formManager}
						class="h-9 w-full rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div
					class="flex items-center justify-end gap-2 pt-4 border-t border-border/60"
				>
					<Button.Root
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (isCreateModalOpen = false)}
						class="text-xs cursor-pointer bg-white dark:bg-card hover:bg-slate-50 border border-border shadow-xs"
					>
						{t("common.cancel")}
					</Button.Root>
					<Button.Root
						type="submit"
						size="sm"
						class="text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer"
					>
						Dispatch Transfer
					</Button.Root>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal: Detail Stock Transfer -->
{#if isDetailModalOpen && selectedTransfer}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
	>
		<div
			class="relative w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-xl transition-all"
		>
			<div
				class="flex items-center justify-between pb-4 border-b border-border/60"
			>
				<div class="flex items-center gap-2">
					<ArrowRightLeftIcon class="size-4.5 text-primary" />
					<h3 class="font-heading text-lg font-bold text-foreground">
						Transfer Order Detail
					</h3>
				</div>
				<button
					type="button"
					onclick={() => (isDetailModalOpen = false)}
					class="rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
				>
					<XIcon class="size-4" />
				</button>
			</div>

			<div class="space-y-3.5 py-4 text-xs">
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Code Transfer:</span>
					<span class="font-mono font-bold text-primary"
						>{selectedTransfer.codeTransfer}</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Date:</span>
					<span class="font-mono text-foreground"
						>{selectedTransfer.date}</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Origin Hub:</span>
					<span class="font-semibold text-foreground text-right"
						>{selectedTransfer.origin}</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Destination Hub:</span>
					<span class="font-semibold text-foreground text-right"
						>{selectedTransfer.destination}</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground"
						>Quantity Dispatched:</span
					>
					<span class="font-semibold text-foreground"
						>{selectedTransfer.products} Items</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Status:</span>
					<span class="font-semibold text-foreground"
						>{selectedTransfer.status}</span
					>
				</div>
			</div>

			<div class="flex items-center justify-end pt-2">
				<Button.Root
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (isDetailModalOpen = false)}
					class="text-xs cursor-pointer bg-white dark:bg-card hover:bg-slate-50 border border-border shadow-xs"
				>
					Close
				</Button.Root>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Edit Stock Transfer -->
{#if isEditModalOpen && selectedTransfer}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
	>
		<div
			class="relative w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-xl transition-all"
		>
			<div
				class="flex items-center justify-between pb-4 border-b border-border/60"
			>
				<h3 class="font-heading text-lg font-bold text-foreground">
					Edit Stock Transfer
				</h3>
				<button
					type="button"
					onclick={() => (isEditModalOpen = false)}
					class="rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
				>
					<XIcon class="size-4" />
				</button>
			</div>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleEditSubmit();
				}}
				class="space-y-4 pt-4"
			>
				<div class="space-y-1.5">
					<label
						for="edit-transfer-origin"
						class="text-xs font-semibold text-foreground"
						>Origin</label
					>
					<Select.Root
						type="single"
						bind:value={formOrigin}
						items={formWarehouseItems}
					>
						<Select.Trigger
							id="edit-transfer-origin"
							class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground shadow-xs"
						>
							<Select.Value placeholder="Select origin warehouse" />
						</Select.Trigger>
						<Select.Content>
							{#each warehouseOptions as wh}
								<Select.Item value={wh} label={wh}>{wh}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<label
						for="edit-transfer-destination"
						class="text-xs font-semibold text-foreground"
						>Destination</label
					>
					<Select.Root
						type="single"
						bind:value={formDestination}
						items={formWarehouseItems}
					>
						<Select.Trigger
							id="edit-transfer-destination"
							class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground shadow-xs"
						>
							<Select.Value placeholder="Select destination warehouse" />
						</Select.Trigger>
						<Select.Content>
							{#each warehouseOptions as wh}
								<Select.Item value={wh} label={wh}>{wh}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<label
						for="edit-transfer-products"
						class="text-xs font-semibold text-foreground"
						>Products</label
					>
					<input
						id="edit-transfer-products"
						type="number"
						min="1"
						bind:value={formProducts}
						class="h-9 w-full rounded-lg border border-border/80 bg-white dark:bg-card px-3 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
						required
					/>
				</div>

				<div
					class="flex items-center justify-end gap-2 pt-4 border-t border-border/60"
				>
					<Button.Root
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (isEditModalOpen = false)}
						class="text-xs cursor-pointer bg-white dark:bg-card hover:bg-slate-50 border border-border shadow-xs"
					>
						Cancel
					</Button.Root>
					<Button.Root
						type="submit"
						size="sm"
						class="text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer"
					>
						Update Transfer
					</Button.Root>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal: Delete Confirmation (Single & Bulk) -->
<ConfirmDialog
	bind:open={isDeleteModalOpen}
	title={transferToDelete
		? t("warehouse.transfer.deleteTitle")
		: t("warehouse.transfer.deleteBulkTitle", { count: selectedIds.length })}
	description={transferToDelete
		? t("warehouse.transfer.deleteDesc")
		: t("warehouse.transfer.deleteBulkDesc")}
	variant="danger"
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmDelete}
>
	{#if transferToDelete}
		<p>
			{t("warehouse.transfer.deleteConfirmSingleQuestion")} <strong class="text-red-600 dark:text-red-400 font-bold">{transferToDelete.codeTransfer}</strong>?
		</p>
		<p class="text-xs text-muted-foreground">
			{t("warehouse.transfer.deleteConfirmSingleWarning")}
		</p>
	{:else}
		<p>
			{t("warehouse.transfer.deleteConfirmBulkQuestion", { count: selectedIds.length })}
		</p>
		<p class="text-xs text-muted-foreground">
			{t("warehouse.transfer.deleteConfirmBulkWarn")}
		</p>
	{/if}
</ConfirmDialog>
