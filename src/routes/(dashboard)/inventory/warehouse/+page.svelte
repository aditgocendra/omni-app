<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import {
		DataTable,
		ConfirmDialog,
		type DataTableColumn,
	} from "$lib/components/common/index.js";
	import { t } from "$lib/i18n/index.js";
	import type { WarehouseRecord } from "$lib/types/index.js";

	import PlusIcon from "@lucide/svelte/icons/plus";
	import SearchIcon from "@lucide/svelte/icons/search";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import WarehouseIcon from "@lucide/svelte/icons/warehouse";
	import PackageIcon from "@lucide/svelte/icons/package";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import XIcon from "@lucide/svelte/icons/x";
	import CheckIcon from "@lucide/svelte/icons/check";

	// Initial data matching requirements
	let warehouses = $state<WarehouseRecord[]>([
		{
			id: "wh-1",
			warehouse: "Gudang A - Jakarta Pusat",
			products: 12,
			manager: "Yono",
			createdAt: "18/02/2026",
			location: "Kav. 12, Kawasan Industri Pulogadung, Jakarta",
		},
		{
			id: "wh-2",
			warehouse: "Gudang B - Surabaya Timur",
			products: 84,
			manager: "Budi Santoso",
			createdAt: "10/01/2026",
			location: "Jl. Rungkut Industri Raya No. 45, Surabaya",
		},
		{
			id: "wh-3",
			warehouse: "Gudang C - Bandung Barat",
			products: 56,
			manager: "Dewi Sartika",
			createdAt: "05/03/2026",
			location: "Jl. Soekarno Hatta No. 88, Bandung",
		},
		{
			id: "wh-4",
			warehouse: "Gudang D - Semarang Hub",
			products: 38,
			manager: "Ahmad Fauzi",
			createdAt: "22/01/2026",
			location: "Kawasan Industri Wijayakusuma, Semarang",
		},
		{
			id: "wh-5",
			warehouse: "Gudang E - Medan Deli",
			products: 95,
			manager: "Hendra Gunawan",
			createdAt: "14/02/2026",
			location: "Jl. Kolonel Yos Sudarso KM 9.5, Medan",
		},
		{
			id: "wh-6",
			warehouse: "Gudang F - Makassar Mariso",
			products: 29,
			manager: "Nurhaliza Putri",
			createdAt: "28/02/2026",
			location: "Jl. Nusantara No. 120, Pelabuhan Makassar",
		},
	]);

	// Search, Sort & Pagination state
	let searchQuery = $state("");
	let sortDirection = $state<"asc" | "desc" | "none">("none");
	let currentPage = $state(1);
	let pageSize = $state(5);

	$effect(() => {
		// Reset to first page when search changes
		searchQuery;
		currentPage = 1;
		selectedIds = [];
	});

	const columns = $derived<DataTableColumn<WarehouseRecord>[]>([
		{
			id: "warehouse",
			header: t("warehouse.manage.colWarehouse"),
		},
		{
			id: "products",
			header: t("warehouse.manage.colProducts"),
		},
		{
			id: "manager",
			header: t("warehouse.manage.colManager"),
		},
		{
			id: "createdAt",
			header: t("warehouse.manage.colCreatedAt"),
			sortable: true,
		},
		{
			id: "actions",
			header: t("warehouse.manage.colActions"),
			align: "right",
		},
	]);

	// Dialog & Toast States
	let isCreateModalOpen = $state(false);
	let isDetailModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let warehouseToDelete = $state<WarehouseRecord | null>(null);
	let selectedIds = $state<(string | number)[]>([]);
	let selectedWarehouse = $state<WarehouseRecord | null>(null);
	let toastMessage = $state<string | null>(null);

	// Form inputs for create/edit
	let formWarehouse = $state("");
	let formManager = $state("");
	let formProducts = $state(0);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3000);
	}

	function parseDate(dateStr: string): number {
		// Expects DD/MM/YYYY
		const parts = dateStr.split("/");
		if (parts.length === 3) {
			const day = parseInt(parts[0], 10);
			const month = parseInt(parts[1], 10) - 1;
			const year = parseInt(parts[2], 10);
			return new Date(year, month, day).getTime();
		}
		return 0;
	}

	function toggleSortCreatedAt() {
		if (sortDirection === "none") {
			sortDirection = "asc";
		} else if (sortDirection === "asc") {
			sortDirection = "desc";
		} else {
			sortDirection = "none";
		}
	}

	// Filter and Sort derived data
	const filteredWarehouses = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		let result = warehouses.filter((item) => {
			if (!q) return true;
			const matchWarehouse = item.warehouse.toLowerCase().includes(q);
			const matchManager = item.manager.toLowerCase().includes(q);
			return matchWarehouse || matchManager;
		});

		if (sortDirection !== "none") {
			result = [...result].sort((a, b) => {
				const timeA = parseDate(a.createdAt);
				const timeB = parseDate(b.createdAt);
				return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
			});
		}

		return result;
	});

	// Actions
	function openCreate() {
		formWarehouse = "";
		formManager = "";
		formProducts = 0;
		isCreateModalOpen = true;
	}

	function handleCreateSubmit() {
		if (!formWarehouse.trim() || !formManager.trim()) {
			alert("Please fill in warehouse name and manager name.");
			return;
		}

		const today = new Date();
		const day = String(today.getDate()).padStart(2, "0");
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const year = today.getFullYear();
		const dateStr = `${day}/${month}/${year}`;

		const newEntry: WarehouseRecord = {
			id: "wh-" + Date.now(),
			warehouse: formWarehouse.trim(),
			products: Number(formProducts) || 0,
			manager: formManager.trim(),
			createdAt: dateStr,
			location: "Kawasan Logistik Nasional",
		};

		warehouses = [newEntry, ...warehouses];
		isCreateModalOpen = false;
		showToast(`${newEntry.warehouse} successfully created!`);
	}

	function handleDetail(item: WarehouseRecord) {
		selectedWarehouse = item;
		isDetailModalOpen = true;
	}

	function handleCopy(item: WarehouseRecord) {
		const copyText = `Warehouse: ${item.warehouse} | Manager: ${item.manager} | Products: ${item.products} | CreatedAt: ${item.createdAt}`;
		if (navigator?.clipboard) {
			navigator.clipboard.writeText(copyText);
		}
		showToast(`Copied data for ${item.warehouse} to clipboard!`);
	}

	function handleEdit(item: WarehouseRecord) {
		selectedWarehouse = item;
		formWarehouse = item.warehouse;
		formManager = item.manager;
		formProducts = item.products;
		isEditModalOpen = true;
	}

	function handleEditSubmit() {
		if (!selectedWarehouse) return;
		warehouses = warehouses.map((w) => {
			if (w.id === selectedWarehouse?.id) {
				return {
					...w,
					warehouse: formWarehouse.trim(),
					manager: formManager.trim(),
					products: Number(formProducts) || 0,
				};
			}
			return w;
		});
		isEditModalOpen = false;
		showToast(`Updated ${formWarehouse.trim()} successfully!`);
	}

	function handleDelete(item: WarehouseRecord) {
		warehouseToDelete = item;
		isDeleteModalOpen = true;
	}

	function handleOpenBulkDelete(ids?: (string | number)[]) {
		if (ids && ids.length > 0) selectedIds = ids;
		if (selectedIds.length === 0) return;
		warehouseToDelete = null;
		isDeleteModalOpen = true;
	}

	function handleConfirmDelete() {
		if (warehouseToDelete) {
			const name = warehouseToDelete.warehouse;
			const id = warehouseToDelete.id;
			warehouses = warehouses.filter((w) => w.id !== id);
			selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
			showToast(`${name} deleted.`);
		} else {
			const count = selectedIds.length;
			warehouses = warehouses.filter((w) => !selectedIds.includes(w.id));
			selectedIds = [];
			showToast(`${count} gudang berhasil dihapus.`);
		}
		warehouseToDelete = null;
		isDeleteModalOpen = false;
	}
</script>

<svelte:head>
	<title>{t("warehouse.manage.title")} | Cronsyst</title>
</svelte:head>

<div class="space-y-6">
	<!-- Toast Feedback Notification -->
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
				{t("warehouse.manage.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1.5">
				{t("warehouse.manage.subtitle")}
			</p>
		</div>

		<div>
			<Button.Root
				onclick={openCreate}
				size="default"
				class="h-9.5 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
			>
				<PlusIcon class="size-4" />
				<span>{t("warehouse.manage.createBtn")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- Search Column (based on Warehouse, Manager) - Full Size -->
	<div class="w-full">
		<div class="relative w-full">
			<SearchIcon
				class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10"
			/>
			<Input
				type="text"
				role="searchbox"
				bind:value={searchQuery}
				placeholder={t("warehouse.manage.searchPlaceholder")}
				class="h-10 w-full rounded-lg border border-border/80 bg-white dark:bg-card pl-10 pr-9 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary shadow-xs transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => (searchQuery = "")}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
					aria-label="Clear search"
				>
					<XIcon class="size-4" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Warehouse Table Card (Reusable DataTable with Pagination & Selection) -->
	<DataTable
		data={filteredWarehouses}
		{columns}
		bind:page={currentPage}
		bind:perPage={pageSize}
		perPageOptions={[5, 10, 20, 50]}
		sortKey="createdAt"
		{sortDirection}
		onSort={() => toggleSortCreatedAt()}
		emptyMessage={t("warehouse.manage.emptyState")}
		emptyIcon={WarehouseIcon}
		selectable={true}
		bind:selectedIds
		onBulkDelete={handleOpenBulkDelete}
	>
		{#snippet cell({ item, column })}
			{#if column.id === "warehouse"}
				<div>
					<span
						class="font-medium text-xs sm:text-sm text-foreground block"
					>
						{item.warehouse}
					</span>
					{#if item.location}
						<span
							class="text-[11px] text-muted-foreground block truncate max-w-xs"
						>
							{item.location}
						</span>
					{/if}
				</div>
			{:else if column.id === "products"}
				<span
					class="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground bg-muted/60 px-2.5 py-1 rounded-md"
				>
					<PackageIcon class="size-3 text-muted-foreground" />
					{item.products}
				</span>
			{:else if column.id === "manager"}
				<span class="font-medium">{item.manager}</span>
			{:else if column.id === "createdAt"}
				<span
					class="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground"
				>
					<CalendarIcon class="size-3 text-muted-foreground/70" />
					{item.createdAt}
				</span>
			{:else if column.id === "actions"}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button.Root
								variant="ghost"
								size="icon-sm"
								class="size-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
								{...props}
								aria-label="More actions"
							>
								<EllipsisVerticalIcon class="size-4" />
							</Button.Root>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						align="end"
						class="w-40 rounded-lg shadow-md border border-border/80 bg-card p-1"
					>
						<!-- Detail -->
						<DropdownMenu.Item
							onclick={() => handleDetail(item)}
							class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted"
						>
							<EyeIcon class="size-3.5 text-muted-foreground" />
							<span>{t("warehouse.manage.detail")}</span>
						</DropdownMenu.Item>

						<!-- Copy -->
						<DropdownMenu.Item
							onclick={() => handleCopy(item)}
							class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted"
						>
							<CopyIcon class="size-3.5 text-muted-foreground" />
							<span>{t("warehouse.manage.copy")}</span>
						</DropdownMenu.Item>

						<!-- Edit -->
						<DropdownMenu.Item
							onclick={() => handleEdit(item)}
							class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted"
						>
							<PencilIcon
								class="size-3.5 text-muted-foreground"
							/>
							<span>{t("warehouse.manage.edit")}</span>
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
							<span>{t("warehouse.manage.delete")}</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		{/snippet}

		{#snippet emptySnippet()}
			<div class="flex flex-col items-center justify-center gap-2">
				<WarehouseIcon class="size-8 text-muted-foreground/40" />
				<p>{t("warehouse.manage.emptyState")}</p>
				{#if searchQuery}
					<Button.Root
						variant="ghost"
						size="sm"
						onclick={() => (searchQuery = "")}
						class="text-xs text-primary"
					>
						Clear search query
					</Button.Root>
				{/if}
			</div>
		{/snippet}
	</DataTable>
</div>

<!-- Modal: Create Warehouse -->
<Dialog.Root bind:open={isCreateModalOpen}>
	<Dialog.Content
		class="w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-xl"
	>
		<Dialog.Header class="pb-4 border-b border-border/60 text-left">
			<Dialog.Title class="font-heading text-lg font-bold text-foreground">
				{t("warehouse.manage.createBtn")}
			</Dialog.Title>
			<Dialog.Description class="sr-only">
				Form tambah data fasilitas gudang baru
			</Dialog.Description>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleCreateSubmit();
			}}
			class="space-y-4 pt-4"
		>
			<div class="space-y-1.5">
				<Label
					for="create-warehouse-name"
					class="text-xs font-semibold text-foreground"
				>
					{t("warehouse.manage.colWarehouse")} Name
				</Label>
				<Input
					id="create-warehouse-name"
					type="text"
					bind:value={formWarehouse}
					placeholder="e.g. Gudang G - Bali Denpasar"
					class="h-9 w-full rounded-lg border-border/80 bg-background px-3 text-xs"
					required
				/>
			</div>

			<div class="space-y-1.5">
				<Label
					for="create-warehouse-manager"
					class="text-xs font-semibold text-foreground"
				>
					{t("warehouse.manage.colManager")}
				</Label>
				<Input
					id="create-warehouse-manager"
					type="text"
					bind:value={formManager}
					placeholder="e.g. Yono Santoso"
					class="h-9 w-full rounded-lg border-border/80 bg-background px-3 text-xs"
					required
				/>
			</div>

			<div class="space-y-1.5">
				<Label
					for="create-warehouse-products"
					class="text-xs font-semibold text-foreground"
				>
					{t("warehouse.manage.colProducts")} Count
				</Label>
				<Input
					id="create-warehouse-products"
					type="number"
					min="0"
					bind:value={formProducts}
					class="h-9 w-full rounded-lg border-border/80 bg-background px-3 text-xs"
				/>
			</div>

			<Dialog.Footer
				class="flex items-center justify-end gap-2 pt-4 border-t border-border/60"
			>
				<Button.Root
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (isCreateModalOpen = false)}
					class="text-xs cursor-pointer"
				>
					{t("common.cancel")}
				</Button.Root>
				<Button.Root
					type="submit"
					size="sm"
					class="text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer"
				>
					Save Warehouse
				</Button.Root>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Modal: Detail Warehouse -->
<Dialog.Root bind:open={isDetailModalOpen}>
	<Dialog.Content
		class="w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-xl"
	>
		{#if selectedWarehouse}
			<Dialog.Header class="pb-4 border-b border-border/60 text-left">
				<div class="flex items-center gap-2">
					<WarehouseIcon class="size-4.5 text-primary" />
					<Dialog.Title class="font-heading text-lg font-bold text-foreground">
						Warehouse Detail
					</Dialog.Title>
				</div>
				<Dialog.Description class="sr-only">
					Informasi detail fasilitas gudang
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-3.5 py-4 text-xs">
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Warehouse Name:</span>
					<span class="font-semibold text-foreground"
						>{selectedWarehouse.warehouse}</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Manager In-Charge:</span>
					<span class="font-semibold text-foreground"
						>{selectedWarehouse.manager}</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground"
						>Total Stored Products:</span
					>
					<span class="font-semibold text-foreground"
						>{selectedWarehouse.products} SKUs</span
					>
				</div>
				<div
					class="flex justify-between items-center py-2 border-b border-border/40"
				>
					<span class="text-muted-foreground">Registered Date:</span>
					<span class="font-mono text-foreground"
						>{selectedWarehouse.createdAt}</span
					>
				</div>
				{#if selectedWarehouse.location}
					<div
						class="flex justify-between items-start py-2 border-b border-border/40"
					>
						<span class="text-muted-foreground">Address / Hub:</span>
						<span
							class="font-medium text-foreground text-right max-w-50"
							>{selectedWarehouse.location}</span
						>
					</div>
				{/if}
			</div>

			<Dialog.Footer class="flex items-center justify-end pt-2">
				<Button.Root
					type="button"
					size="sm"
					onclick={() => (isDetailModalOpen = false)}
					class="text-xs cursor-pointer"
				>
					Close
				</Button.Root>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Modal: Edit Warehouse -->
<Dialog.Root bind:open={isEditModalOpen}>
	<Dialog.Content
		class="w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-xl"
	>
		{#if selectedWarehouse}
			<Dialog.Header class="pb-4 border-b border-border/60 text-left">
				<Dialog.Title class="font-heading text-lg font-bold text-foreground">
					Edit Warehouse
				</Dialog.Title>
				<Dialog.Description class="sr-only">
					Perbarui informasi fasilitas gudang
				</Dialog.Description>
			</Dialog.Header>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleEditSubmit();
				}}
				class="space-y-4 pt-4"
			>
				<div class="space-y-1.5">
					<Label
						for="edit-warehouse-name"
						class="text-xs font-semibold text-foreground"
					>
						Warehouse Name
					</Label>
					<Input
						id="edit-warehouse-name"
						type="text"
						bind:value={formWarehouse}
						class="h-9 w-full rounded-lg border-border/80 bg-background px-3 text-xs"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<Label
						for="edit-warehouse-manager"
						class="text-xs font-semibold text-foreground"
					>
						Manager
					</Label>
					<Input
						id="edit-warehouse-manager"
						type="text"
						bind:value={formManager}
						class="h-9 w-full rounded-lg border-border/80 bg-background px-3 text-xs"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<Label
						for="edit-warehouse-products"
						class="text-xs font-semibold text-foreground"
					>
						Products Count
					</Label>
					<Input
						id="edit-warehouse-products"
						type="number"
						min="0"
						bind:value={formProducts}
						class="h-9 w-full rounded-lg border-border/80 bg-background px-3 text-xs"
					/>
				</div>

				<Dialog.Footer
					class="flex items-center justify-end gap-2 pt-4 border-t border-border/60"
				>
					<Button.Root
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (isEditModalOpen = false)}
						class="text-xs cursor-pointer"
					>
						Cancel
					</Button.Root>
					<Button.Root
						type="submit"
						size="sm"
						class="text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer"
					>
						Update Changes
					</Button.Root>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Modal: Delete Confirmation (Single & Bulk) -->
<ConfirmDialog
	bind:open={isDeleteModalOpen}
	title={warehouseToDelete
		? t("warehouse.manage.deleteTitle")
		: t("warehouse.manage.deleteBulkTitle", { count: selectedIds.length })}
	description={warehouseToDelete
		? t("warehouse.manage.deleteDesc")
		: t("warehouse.manage.deleteBulkDesc")}
	variant="danger"
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmDelete}
>
	{#if warehouseToDelete}
		<p>
			{t("warehouse.manage.deleteConfirmSingleQuestion")} <strong
				class="text-red-600 dark:text-red-400 font-bold"
				>{warehouseToDelete.warehouse}</strong
			>?
		</p>
		<p class="text-xs text-muted-foreground">
			{t("warehouse.manage.deleteConfirmSingleWarning")}
		</p>
	{:else}
		<p>
			{t("warehouse.manage.deleteConfirmBulkQuestion", { count: selectedIds.length })}
		</p>
		<p class="text-xs text-muted-foreground">
			{t("warehouse.manage.deleteConfirmBulkWarn")}
		</p>
	{/if}
</ConfirmDialog>
