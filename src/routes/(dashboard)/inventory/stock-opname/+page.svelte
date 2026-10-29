<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { t } from "$lib/i18n/index.js";
	import type { StockOpnameRecord, OpnameStatus } from "$lib/types/index.js";
	import {
		DataTable,
		ConfirmDialog,
		type DataTableColumn,
	} from "$lib/components/common/index.js";

	import PlusIcon from "@lucide/svelte/icons/plus";
	import SearchIcon from "@lucide/svelte/icons/search";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import ClipboardCheckIcon from "@lucide/svelte/icons/clipboard-check";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import LayersIcon from "@lucide/svelte/icons/layers";
	import XIcon from "@lucide/svelte/icons/x";
	import CheckIcon from "@lucide/svelte/icons/check";
	import WarehouseIcon from "@lucide/svelte/icons/warehouse";

	// Initial dataset based on prompt examples
	let opnameList = $state<StockOpnameRecord[]>([
		{
			id: "op-1",
			code: "OP-2993420-123",
			date: "18/05/2026",
			warehouse: "Gudang A - Jakarta Pusat",
			productsVariant: "120 Variant",
			recorder: "Yono Bakrie",
			status: "Completed",
		},
		{
			id: "op-2",
			code: "OP-2993420-124",
			date: "12/06/2026",
			warehouse: "Gudang B - Surabaya Timur",
			productsVariant: "85 Variant",
			recorder: "Budi Santoso",
			status: "Draft",
		},
		{
			id: "op-3",
			code: "OP-2993421-456",
			date: "25/06/2026",
			warehouse: "Gudang C - Bandung Barat",
			productsVariant: "210 Variant",
			recorder: "Dewi Sartika",
			status: "Completed",
		},
		{
			id: "op-4",
			code: "OP-2993422-789",
			date: "04/07/2026",
			warehouse: "Gudang D - Semarang Hub",
			productsVariant: "64 Variant",
			recorder: "Ahmad Fauzi",
			status: "Draft",
		},
		{
			id: "op-5",
			code: "OP-2993423-012",
			date: "19/07/2026",
			warehouse: "Gudang E - Medan Deli",
			productsVariant: "140 Variant",
			recorder: "Hendra Gunawan",
			status: "Completed",
		},
		{
			id: "op-6",
			code: "OP-2993424-345",
			date: "02/08/2026",
			warehouse: "Gudang A - Jakarta Pusat",
			productsVariant: "95 Variant",
			recorder: "Yono Bakrie",
			status: "Draft",
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

	const columns = $derived<DataTableColumn<StockOpnameRecord>[]>([
		{
			id: "code",
			header: t("warehouse.opname.colCode"),
		},
		{
			id: "date",
			header: t("warehouse.opname.colDate"),
			sortable: true,
		},
		{
			id: "warehouse",
			header: t("warehouse.opname.colWarehouse"),
		},
		{
			id: "products",
			header: t("warehouse.opname.colProducts"),
		},
		{
			id: "recorder",
			header: t("warehouse.opname.colRecorder"),
		},
		{
			id: "status",
			header: t("warehouse.opname.colStatus"),
		},
		{
			id: "actions",
			header: t("warehouse.opname.colActions"),
			align: "right",
		},
	]);

	// Dialog & Toast states
	let isCreateModalOpen = $state(false);
	let isDetailModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let opnameToDelete = $state<StockOpnameRecord | null>(null);
	let selectedIds = $state<(string | number)[]>([]);
	let selectedOpname = $state<StockOpnameRecord | null>(null);
	let toastMessage = $state<string | null>(null);

	// Form inputs for create/edit
	let formWarehouse = $state("Gudang A - Jakarta Pusat");
	let formVariants = $state(120);
	let formRecorder = $state("Yono Bakrie");
	let formStatus = $state<OpnameStatus>("Draft");

	const warehouseOptions = [
		"Gudang A - Jakarta Pusat",
		"Gudang B - Surabaya Timur",
		"Gudang C - Bandung Barat",
		"Gudang D - Semarang Hub",
		"Gudang E - Medan Deli",
	];

	const warehouseFilterOptions = $derived([
		{ value: "all", label: t("warehouse.opname.filterWarehouse") },
		{ value: "Gudang A", label: "Gudang A - Jakarta" },
		{ value: "Gudang B", label: "Gudang B - Surabaya" },
		{ value: "Gudang C", label: "Gudang C - Bandung" },
		{ value: "Gudang D", label: "Gudang D - Semarang" },
		{ value: "Gudang E", label: "Gudang E - Medan" },
	]);

	const statusFilterOptions = $derived([
		{ value: "all", label: t("warehouse.opname.filterStatus") },
		{ value: "completed", label: "Completed" },
		{ value: "draft", label: "Draft" },
	]);

	const formWarehouseItems = $derived(
		warehouseOptions.map((wh) => ({ value: wh, label: wh })),
	);

	const createStatusItems = [
		{ value: "Draft", label: "Draft (In Progress)" },
		{ value: "Completed", label: "Completed (Finalized)" },
	];

	const editStatusItems = [
		{ value: "Draft", label: "Draft" },
		{ value: "Completed", label: "Completed" },
	];

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
	const filteredOpnames = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();

		let result = opnameList.filter((item) => {
			// Search based on code, warehouse, or recorder
			const matchSearch =
				!q ||
				item.code.toLowerCase().includes(q) ||
				item.warehouse.toLowerCase().includes(q) ||
				item.recorder.toLowerCase().includes(q);

			// Filter by warehouse
			const matchWarehouse =
				selectedWarehouse === "all" ||
				item.warehouse.includes(selectedWarehouse);

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
		formWarehouse = "Gudang A - Jakarta Pusat";
		formVariants = 100;
		formRecorder = "Yono Bakrie";
		formStatus = "Draft";
		isCreateModalOpen = true;
	}

	function handleCreateSubmit() {
		if (!formRecorder.trim()) {
			alert("Please enter the name of the recorder.");
			return;
		}

		const today = new Date();
		const day = String(today.getDate()).padStart(2, "0");
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const year = today.getFullYear();
		const dateStr = `${day}/${month}/${year}`;
		const randPart = Math.floor(1000000 + Math.random() * 9000000);
		const randTail = Math.floor(100 + Math.random() * 900);
		const code = `OP-${randPart}-${randTail}`;

		const newEntry: StockOpnameRecord = {
			id: "op-" + Date.now(),
			code,
			date: dateStr,
			warehouse: formWarehouse,
			productsVariant: `${formVariants} Variant`,
			recorder: formRecorder.trim(),
			status: formStatus,
		};

		opnameList = [newEntry, ...opnameList];
		isCreateModalOpen = false;
		showToast(`Stock Opname ${newEntry.code} registered!`);
	}

	function handleDetail(item: StockOpnameRecord) {
		selectedOpname = item;
		isDetailModalOpen = true;
	}

	function handleEdit(item: StockOpnameRecord) {
		selectedOpname = item;
		formWarehouse = item.warehouse;
		const matchNum = item.productsVariant.match(/\d+/);
		formVariants = matchNum ? parseInt(matchNum[0], 10) : 50;
		formRecorder = item.recorder;
		formStatus = item.status;
		isEditModalOpen = true;
	}

	function handleEditSubmit() {
		if (!selectedOpname) return;
		opnameList = opnameList.map((op) => {
			if (op.id === selectedOpname?.id) {
				return {
					...op,
					warehouse: formWarehouse,
					productsVariant: `${formVariants} Variant`,
					recorder: formRecorder.trim(),
					status: formStatus,
				};
			}
			return op;
		});
		isEditModalOpen = false;
		showToast(`Stock Opname ${selectedOpname.code} updated!`);
	}

	function handleDelete(item: StockOpnameRecord) {
		opnameToDelete = item;
		isDeleteModalOpen = true;
	}

	function handleOpenBulkDelete(ids?: (string | number)[]) {
		if (ids && ids.length > 0) selectedIds = ids;
		if (selectedIds.length === 0) return;
		opnameToDelete = null;
		isDeleteModalOpen = true;
	}

	function handleConfirmDelete() {
		if (opnameToDelete) {
			const code = opnameToDelete.code;
			const id = opnameToDelete.id;
			opnameList = opnameList.filter((op) => op.id !== id);
			selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
			showToast(`Stock Opname ${code} deleted.`);
		} else {
			const count = selectedIds.length;
			opnameList = opnameList.filter(
				(op) => !selectedIds.includes(op.id),
			);
			selectedIds = [];
			showToast(`${count} stock opname berhasil dihapus.`);
		}
		opnameToDelete = null;
	}
</script>

<svelte:head>
	<title>{t("warehouse.opname.title")} | Cronsyst</title>
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
				{t("warehouse.opname.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1.5">
				{t("warehouse.opname.subtitle")}
			</p>
		</div>

		<div>
			<Button.Root
				onclick={openCreate}
				size="default"
				class="h-9.5 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
			>
				<PlusIcon class="size-4" />
				<span>{t("warehouse.opname.createBtn")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- Search & Filters Container (full size, search, filter warehouse, filter status, reset button) -->
	<div class="w-full space-y-3">
		<div class="flex flex-col gap-3 lg:flex-row lg:items-center">
			<!-- Search Column (based on code, warehouse, or recorder) - width full -->
			<div class="relative flex-1">
				<SearchIcon
					class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10"
				/>
				<Input
					type="text"
					role="searchbox"
					bind:value={searchQuery}
					placeholder={t("warehouse.opname.searchPlaceholder")}
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
					<Select.Trigger
						class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/60 transition-colors"
					>
						<Select.Value
							placeholder={t("warehouse.opname.filterWarehouse")}
						/>
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
					<Select.Trigger
						class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/60 transition-colors"
					>
						<Select.Value
							placeholder={t("warehouse.opname.filterStatus")}
						/>
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
				<RotateCcwIcon
					class="size-3.5 text-muted-foreground group-hover/reset:text-foreground transition-colors"
				/>
				<span>{t("warehouse.opname.reset")}</span>
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

	<!-- Stock Opname Table Card (Reusable DataTable with Pagination & Selection) -->
	<DataTable
		data={filteredOpnames}
		{columns}
		bind:page={currentPage}
		bind:perPage={pageSize}
		perPageOptions={[5, 10, 20, 50]}
		sortKey="date"
		{sortDirection}
		onSort={() => toggleSortDate()}
		emptyMessage={t("warehouse.opname.emptyState")}
		emptyIcon={ClipboardCheckIcon}
		selectable={true}
		bind:selectedIds
		onBulkDelete={handleOpenBulkDelete}
	>
		{#snippet cell({ item, column }: { item: StockOpnameRecord; column: DataTableColumn<StockOpnameRecord> })}
			{#if column.id === "code"}
				<span class="font-mono text-xs font-bold text-primary">
					{item.code}
				</span>
			{:else if column.id === "date"}
				<span
					class="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground"
				>
					<CalendarIcon class="size-3 text-muted-foreground/70" />
					{item.date}
				</span>
			{:else if column.id === "warehouse"}
				<span class="text-xs font-medium text-foreground">
					{item.warehouse}
				</span>
			{:else if column.id === "products"}
				<Badge
					variant="secondary"
					class="font-medium text-xs tracking-tight bg-primary/10 text-primary hover:bg-primary/15 border-transparent gap-1 px-2.5 py-0.5"
				>
					<LayersIcon class="size-3" />
					<span>{item.productsVariant}</span>
				</Badge>
			{:else if column.id === "recorder"}
				<span class="font-medium">{item.recorder}</span>
			{:else if column.id === "status"}
				{#if item.status === "Completed"}
					<span
						class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
					>
						<span class="size-1.5 rounded-full bg-emerald-500"
						></span>
						{item.status}
					</span>
				{:else}
					<span
						class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400"
					>
						<span class="size-1.5 rounded-full bg-slate-400"></span>
						{item.status}
					</span>
				{/if}
			{:else if column.id === "actions"}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class={buttonVariants({
							variant: "ghost",
							size: "icon-sm",
							class: "bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
						})}
						aria-label="More actions"
					>
						<EllipsisVerticalIcon class="size-4" />
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
							<span>{t("warehouse.opname.detail")}</span>
						</DropdownMenu.Item>

						<!-- Edit -->
						<DropdownMenu.Item
							onclick={() => handleEdit(item)}
							class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted"
						>
							<PencilIcon
								class="size-3.5 text-muted-foreground"
							/>
							<span>{t("warehouse.opname.edit")}</span>
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
							<span>{t("warehouse.opname.delete")}</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		{/snippet}

		{#snippet emptySnippet()}
			<div class="flex flex-col items-center justify-center gap-2">
				<ClipboardCheckIcon class="size-8 text-muted-foreground/40" />
				<p>{t("warehouse.opname.emptyState")}</p>
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

<!-- Modal: Create Stock Opname -->
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
					{t("warehouse.opname.createBtn")}
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
						for="create-opname-warehouse"
						class="text-xs font-semibold text-foreground"
					>
						{t("warehouse.opname.colWarehouse")}
					</label>
					<Select.Root
						type="single"
						bind:value={formWarehouse}
						items={formWarehouseItems}
					>
						<Select.Trigger
							id="create-opname-warehouse"
							class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground shadow-xs"
						>
							<Select.Value placeholder="Select warehouse" />
						</Select.Trigger>
						<Select.Content>
							{#each warehouseOptions as wh}
								<Select.Item value={wh} label={wh}
									>{wh}</Select.Item
								>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<label
						for="create-opname-variants"
						class="text-xs font-semibold text-foreground"
					>
						Variants Count Audited
					</label>
					<input
						id="create-opname-variants"
						type="number"
						min="1"
						bind:value={formVariants}
						class="h-9 w-full rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<label
						for="create-opname-recorder"
						class="text-xs font-semibold text-foreground"
					>
						{t("warehouse.opname.colRecorder")} Name
					</label>
					<input
						id="create-opname-recorder"
						type="text"
						bind:value={formRecorder}
						class="h-9 w-full rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<label
						for="create-opname-status"
						class="text-xs font-semibold text-foreground"
					>
						Audit Status
					</label>
					<Select.Root
						type="single"
						value={formStatus}
						onValueChange={(v: string) => {
							if (v === "Draft" || v === "Completed")
								formStatus = v;
						}}
						items={createStatusItems}
					>
						<Select.Trigger
							id="create-opname-status"
							class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground shadow-xs"
						>
							<Select.Value placeholder="Select status" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item
								value="Draft"
								label="Draft (In Progress)"
							>
								Draft (In Progress)
							</Select.Item>
							<Select.Item
								value="Completed"
								label="Completed (Finalized)"
							>
								Completed (Finalized)
							</Select.Item>
						</Select.Content>
					</Select.Root>
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
						Save Opname
					</Button.Root>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal: Detail Stock Opname -->
{#if isDetailModalOpen && selectedOpname}
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
					<ClipboardCheckIcon class="size-4.5 text-primary" />
					<h3 class="font-heading text-lg font-bold text-foreground">
						Stock Opname Audit
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
					<span class="text-muted-foreground">Audit Code:</span>
					<span class="font-mono font-bold text-primary"
						>{selectedOpname.code}</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Audit Date:</span>
					<span class="font-mono text-foreground"
						>{selectedOpname.date}</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Audited Warehouse:</span
					>
					<span class="font-semibold text-foreground text-right"
						>{selectedOpname.warehouse}</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Audited Products:</span>
					<Badge variant="secondary" class="font-semibold text-xs">
						{selectedOpname.productsVariant}
					</Badge>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Field Recorder:</span>
					<span class="font-semibold text-foreground"
						>{selectedOpname.recorder}</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Final Status:</span>
					<span class="font-semibold text-foreground"
						>{selectedOpname.status}</span
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

<!-- Modal: Edit Stock Opname -->
{#if isEditModalOpen && selectedOpname}
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
					Edit Stock Opname
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
						for="edit-opname-warehouse"
						class="text-xs font-semibold text-foreground"
						>Warehouse</label
					>
					<Select.Root
						type="single"
						bind:value={formWarehouse}
						items={formWarehouseItems}
					>
						<Select.Trigger
							id="edit-opname-warehouse"
							class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground shadow-xs"
						>
							<Select.Value placeholder="Select warehouse" />
						</Select.Trigger>
						<Select.Content>
							{#each warehouseOptions as wh}
								<Select.Item value={wh} label={wh}
									>{wh}</Select.Item
								>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<label
						for="edit-opname-variants"
						class="text-xs font-semibold text-foreground"
						>Variant Count</label
					>
					<input
						id="edit-opname-variants"
						type="number"
						min="1"
						bind:value={formVariants}
						class="h-9 w-full rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<label
						for="edit-opname-recorder"
						class="text-xs font-semibold text-foreground"
						>Recorder Name</label
					>
					<input
						id="edit-opname-recorder"
						type="text"
						bind:value={formRecorder}
						class="h-9 w-full rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<label
						for="edit-opname-status"
						class="text-xs font-semibold text-foreground"
						>Status</label
					>
					<Select.Root
						type="single"
						value={formStatus}
						onValueChange={(v: string) => {
							if (v === "Draft" || v === "Completed")
								formStatus = v;
						}}
						items={editStatusItems}
					>
						<Select.Trigger
							id="edit-opname-status"
							class="h-9 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs text-foreground shadow-xs hover:bg-slate-50"
						>
							<Select.Value placeholder="Select status" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="Draft" label="Draft"
								>Draft</Select.Item
							>
							<Select.Item value="Completed" label="Completed"
								>Completed</Select.Item
							>
						</Select.Content>
					</Select.Root>
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
						Update Opname
					</Button.Root>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal: Delete Confirmation (Single & Bulk) -->
<ConfirmDialog
	bind:open={isDeleteModalOpen}
	title={opnameToDelete
		? t("warehouse.opname.deleteTitle")
		: t("warehouse.opname.deleteBulkTitle", { count: selectedIds.length })}
	description={opnameToDelete
		? t("warehouse.opname.deleteDesc")
		: t("warehouse.opname.deleteBulkDesc")}
	variant="danger"
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmDelete}
>
	{#if opnameToDelete}
		<p>
			{t("warehouse.opname.deleteConfirmSingleQuestion")}
			<strong class="text-red-600 dark:text-red-400 font-bold"
				>{opnameToDelete.code}</strong
			>?
		</p>
		<p class="text-xs text-muted-foreground">
			{t("warehouse.opname.deleteConfirmSingleWarning")}
		</p>
	{:else}
		<p>
			{t("warehouse.opname.deleteConfirmBulkQuestion", {
				count: selectedIds.length,
			})}
		</p>
		<p class="text-xs text-muted-foreground">
			{t("warehouse.opname.deleteConfirmBulkWarn")}
		</p>
	{/if}
</ConfirmDialog>
