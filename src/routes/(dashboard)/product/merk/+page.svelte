<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import {
		DataTable,
		ConfirmDialog,
		type DataTableColumn,
	} from "$lib/components/common/index.js";
	import { t } from "$lib/i18n/index.js";
	import type { ProductMerkRecord } from "$lib/types/index.js";

	import PlusIcon from "@lucide/svelte/icons/plus";
	import SearchIcon from "@lucide/svelte/icons/search";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import XIcon from "@lucide/svelte/icons/x";
	import CheckIcon from "@lucide/svelte/icons/check";
	import TagIcon from "@lucide/svelte/icons/tag";
	import PackageIcon from "@lucide/svelte/icons/package";
	import GlobeIcon from "@lucide/svelte/icons/globe";

	// Initial dataset matching specifications
	let merks = $state<ProductMerkRecord[]>([
		{
			id: "mrk-1",
			merk: "Apple",
			products: 21,
			createdAt: "18/02/2026",
			origin: "Amerika Serikat",
		},
		{
			id: "mrk-2",
			merk: "Samsung",
			products: 35,
			createdAt: "20/02/2026",
			origin: "Korea Selatan",
		},
		{
			id: "mrk-3",
			merk: "Sony",
			products: 18,
			createdAt: "15/01/2026",
			origin: "Jepang",
		},
		{
			id: "mrk-4",
			merk: "Nike",
			products: 46,
			createdAt: "10/03/2026",
			origin: "Amerika Serikat",
		},
		{
			id: "mrk-5",
			merk: "Logitech",
			products: 29,
			createdAt: "22/01/2026",
			origin: "Swiss",
		},
		{
			id: "mrk-6",
			merk: "Asus",
			products: 14,
			createdAt: "14/02/2026",
			origin: "Taiwan",
		},
		{
			id: "mrk-7",
			merk: "Xiaomi",
			products: 52,
			createdAt: "01/02/2026",
			origin: "Tiongkok",
		},
		{
			id: "mrk-8",
			merk: "Adidas",
			products: 39,
			createdAt: "25/02/2026",
			origin: "Jerman",
		},
		{
			id: "mrk-9",
			merk: "Dyson",
			products: 11,
			createdAt: "05/01/2026",
			origin: "Inggris",
		},
		{
			id: "mrk-10",
			merk: "Keychron",
			products: 16,
			createdAt: "12/03/2026",
			origin: "Hong Kong",
		},
		{
			id: "mrk-11",
			merk: "Bose",
			products: 12,
			createdAt: "08/02/2026",
			origin: "Amerika Serikat",
		},
		{
			id: "mrk-12",
			merk: "Philips",
			products: 27,
			createdAt: "19/01/2026",
			origin: "Belanda",
		},
	]);

	// Filter, Sort & Pagination states
	let searchQuery = $state("");
	let sortKey = $state<string | null>(null);
	let sortDirection = $state<"asc" | "desc" | "none">("none");
	let currentPage = $state(1);
	let pageSize = $state(10); // Minimum 10 per page as specified

	// Selection & Dialog states
	let selectedIds = $state<(string | number)[]>([]);
	let selectedMerk = $state<ProductMerkRecord | null>(null);
	let merkToDelete = $state<ProductMerkRecord | null>(null);

	let isCreateModalOpen = $state(false);
	let isDetailModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isBulkDeleteModalOpen = $state(false);
	let toastMessage = $state<string | null>(null);

	// Form inputs for Create / Edit
	let formMerkName = $state("");
	let formOrigin = $state("");

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

	$effect(() => {
		searchQuery;
		currentPage = 1;
		selectedIds = [];
	});

	// Table Columns configuration (Sorting on Merk (Name) and CreatedAt)
	const columns = $derived<DataTableColumn<ProductMerkRecord>[]>([
		{
			id: "merk",
			header: t("product.merk.colMerk"),
			sortable: true,
		},
		{
			id: "products",
			header: t("product.merk.colProducts"),
			align: "center",
		},
		{
			id: "createdAt",
			header: t("product.merk.colCreatedAt"),
			sortable: true,
			accessorFn: (row: ProductMerkRecord) => parseDate(row.createdAt),
		},
		{
			id: "actions",
			header: t("product.merk.colActions"),
			align: "right",
		},
	]);

	// Filtered merks based on search input (name)
	const filteredMerks = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		return merks.filter((item) => {
			if (!q) return true;
			return (
				item.merk.toLowerCase().includes(q) ||
				(item.origin && item.origin.toLowerCase().includes(q))
			);
		});
	});

	function resetFilters() {
		searchQuery = "";
		sortKey = null;
		sortDirection = "none";
		showToast(t("product.merk.reset"));
	}

	// Action Handlers
	function openCreate() {
		formMerkName = "";
		formOrigin = "";
		isCreateModalOpen = true;
	}

	function handleSaveCreate() {
		if (!formMerkName.trim()) {
			showToast("Nama merk wajib diisi.");
			return;
		}

		const today = new Date();
		const day = String(today.getDate()).padStart(2, "0");
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const year = today.getFullYear();
		const formattedDate = `${day}/${month}/${year}`;

		const newMerk: ProductMerkRecord = {
			id: `mrk-${Date.now()}`,
			merk: formMerkName.trim(),
			products: 0,
			createdAt: formattedDate,
			origin: formOrigin.trim() || "Global",
		};

		merks = [newMerk, ...merks];
		isCreateModalOpen = false;
		showToast(t("product.merk.merkCreated", { name: newMerk.merk }));
	}

	function openDetail(m: ProductMerkRecord) {
		selectedMerk = m;
		isDetailModalOpen = true;
	}

	function openEdit(m: ProductMerkRecord) {
		selectedMerk = m;
		formMerkName = m.merk;
		formOrigin = m.origin || "";
		isEditModalOpen = true;
	}

	function handleSaveEdit() {
		if (!selectedMerk) return;
		if (!formMerkName.trim()) {
			showToast(t("product.merk.nameRequired"));
			return;
		}

		merks = merks.map((m) =>
			m.id === selectedMerk?.id
				? {
						...m,
						merk: formMerkName.trim(),
						origin: formOrigin.trim() || "Global",
					}
				: m,
		);

		isEditModalOpen = false;
		showToast(t("product.merk.merkUpdated", { name: formMerkName }));
	}

	function handleOpenDelete(m: ProductMerkRecord) {
		merkToDelete = m;
		isDeleteModalOpen = true;
	}

	function handleConfirmDelete() {
		if (!merkToDelete) return;
		const deletedName = merkToDelete.merk;
		merks = merks.filter((m) => m.id !== merkToDelete?.id);
		selectedIds = selectedIds.filter((id) => id !== merkToDelete?.id);
		showToast(t("product.merk.merkDeleted", { name: deletedName }));
		isDeleteModalOpen = false;
		merkToDelete = null;
	}

	function handleOpenBulkDelete(ids?: (string | number)[]) {
		if (ids && ids.length > 0) selectedIds = ids;
		if (selectedIds.length === 0) return;
		isBulkDeleteModalOpen = true;
	}

	function handleConfirmBulkDelete() {
		const count = selectedIds.length;
		merks = merks.filter((m) => !selectedIds.includes(m.id));
		selectedIds = [];
		isBulkDeleteModalOpen = false;
		showToast(t("product.merk.bulkMerksDeleted", { count }));
	}
</script>

<svelte:head>
	<title>{t("product.merk.title")} | Cronsyst</title>
</svelte:head>

<div class="space-y-6">
	<!-- Toast Notification Banner -->
	{#if toastMessage}
		<div
			class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-background/95 px-4 py-3 text-xs font-medium text-foreground shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3"
		>
			<div
				class="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary"
			>
				<CheckIcon class="size-3" />
			</div>
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Header & Action Bar [Title Modul judul dan sub judul (kegunaan) - tombol create] (justify between - center) -->
	<div
		class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h1
				class="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
			>
				{t("product.merk.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1.5">
				{t("product.merk.subtitle")}
			</p>
		</div>

		<div>
			<Button.Root
				onclick={openCreate}
				size="default"
				class="h-10 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
			>
				<PlusIcon class="size-4" />
				<span>{t("product.merk.createBtn")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- Search & Filters Container [search kolom (name) - width full, tombol reset] (full size) -->
	<div class="w-full space-y-3">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<!-- Search Column (name) - width full -->
			<div class="relative flex-1">
				<SearchIcon
					class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10"
				/>
				<Input
					type="text"
					role="searchbox"
					bind:value={searchQuery}
					placeholder={t("product.merk.searchPlaceholder")}
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
				<span>{t("product.merk.reset")}</span>
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

	<!-- Merk Table Card (DataTable with Pagination min 10 & Sorting on Name and CreatedAt) -->
	<DataTable
		data={filteredMerks}
		{columns}
		bind:page={currentPage}
		bind:perPage={pageSize}
		perPageOptions={[10, 20, 50, 100]}
		bind:sortKey
		bind:sortDirection
		emptyMessage={t("product.merk.emptyState")}
		emptyIcon={TagIcon}
		selectable={true}
		bind:selectedIds
		onBulkDelete={handleOpenBulkDelete}
	>
		{#snippet cell({
			item,
			column,
		}: {
			item: ProductMerkRecord;
			column: DataTableColumn<ProductMerkRecord>;
		})}
			{#if column.id === "merk"}
				<!-- Merk: berisi (nama merk) -->
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs"
					>
						{item.merk.slice(0, 2).toUpperCase()}
					</div>
					<div class="flex flex-col">
						<button
							type="button"
							class="text-left text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
							onclick={() => openDetail(item)}
						>
							{item.merk}
						</button>
						{#if item.origin}
							<span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
								<GlobeIcon class="size-2.5" />
								{item.origin}
							</span>
						{/if}
					</div>
				</div>
			{:else if column.id === "products"}
				<!-- Products: (21) -->
				<span
					class="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground bg-muted/60 px-2.5 py-1 rounded-md"
				>
					<PackageIcon class="size-3 text-muted-foreground" />
					{item.products}
				</span>
			{:else if column.id === "createdAt"}
				<!-- CreatedAt: 18/02/2026 -->
				<span
					class="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
				>
					<CalendarIcon class="size-3 text-muted-foreground/70" />
					{item.createdAt}
				</span>
			{:else if column.id === "actions"}
				<!-- Actions: More button with Dropdown menu (detail, edit, delete) -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class={buttonVariants({
							variant: "ghost",
							size: "icon-sm",
							class: "bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
						})}
						aria-label="Merk actions"
					>
						<EllipsisVerticalIcon class="size-4" />
						<span class="sr-only">Actions</span>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-44 p-1">
						<DropdownMenu.Item
							onclick={() => openDetail(item)}
							class="cursor-pointer gap-2 text-xs py-1.5"
						>
							<EyeIcon class="size-3.5 text-muted-foreground" />
							<span>{t("product.merk.actionDetail")}</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => openEdit(item)}
							class="cursor-pointer gap-2 text-xs py-1.5"
						>
							<PencilIcon
								class="size-3.5 text-muted-foreground"
							/>
							<span>{t("product.merk.actionEdit")}</span>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							onclick={() => handleOpenDelete(item)}
							class="cursor-pointer gap-2 text-xs py-1.5 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
						>
							<Trash2Icon class="size-3.5" />
							<span>{t("product.merk.actionDelete")}</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		{/snippet}
	</DataTable>
</div>

<!-- Modal 1: Create Merk -->
<Dialog.Root bind:open={isCreateModalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("product.merk.createMerkTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("product.merk.createMerkDesc")}
			</Dialog.Description>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSaveCreate();
			}}
			class="space-y-4 py-2 text-xs"
		>
			<div class="space-y-1.5">
				<Label for="create-merk-name" class="text-xs font-semibold">
					{t("product.merk.brandName")} <span class="text-red-500">*</span>
				</Label>
				<Input
					id="create-merk-name"
					type="text"
					bind:value={formMerkName}
					placeholder="e.g. Apple, Sony, Nike"
					class="h-9 text-xs"
					required
				/>
			</div>

			<div class="space-y-1.5">
				<Label for="create-merk-origin" class="text-xs font-semibold">
					{t("product.merk.originCountry")}
				</Label>
				<Input
					id="create-merk-origin"
					type="text"
					bind:value={formOrigin}
					placeholder={t("product.merk.originPlaceholder")}
					class="h-9 text-xs"
				/>
			</div>

			<Dialog.Footer class="pt-2 gap-2">
				<Button.Root
					type="button"
					variant="outline"
					onclick={() => (isCreateModalOpen = false)}
					class="h-9 text-xs"
				>
					{t("common.cancel")}
				</Button.Root>
				<Button.Root
					type="submit"
					class="h-9 text-xs bg-primary text-white hover:bg-primary/90"
				>
					{t("common.save")}
				</Button.Root>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Modal 2: Detail Merk -->
<Dialog.Root bind:open={isDetailModalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("product.merk.detailMerkTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("product.merk.detailMerkDesc")}
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedMerk}
			<div class="space-y-3.5 py-2 text-xs">
				<div class="flex items-center gap-3.5 p-3.5 rounded-xl border border-border/70 bg-muted/30">
					<div
						class="flex size-12 items-center justify-center font-bold text-base text-primary bg-primary/10 border border-primary/20 rounded-xl"
					>
						{selectedMerk.merk.slice(0, 2).toUpperCase()}
					</div>
					<div>
						<h3 class="font-heading text-sm font-bold text-foreground">
							{selectedMerk.merk}
						</h3>
						<p class="text-xs text-muted-foreground mt-0.5">
							{t("product.merk.registeredProducts", { count: selectedMerk.products })}
						</p>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]">{t("product.merk.originLabel")}</span>
						<span class="font-semibold text-foreground text-xs mt-1 block">
							{selectedMerk.origin || "Global"}
						</span>
					</div>

					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]">{t("product.merk.registeredDate")}</span>
						<span class="font-mono text-foreground text-xs mt-1 block font-medium">
							{selectedMerk.createdAt}
						</span>
					</div>
				</div>
			</div>
		{/if}

		<Dialog.Footer class="pt-2">
			<Button.Root
				variant="outline"
				onclick={() => (isDetailModalOpen = false)}
				class="h-9 text-xs"
			>
				{t("common.cancel")}
			</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Modal 3: Edit Merk -->
<Dialog.Root bind:open={isEditModalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("product.merk.editMerkTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("product.merk.editMerkDesc")}
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedMerk}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSaveEdit();
				}}
				class="space-y-4 py-2 text-xs"
			>
				<div class="space-y-1.5">
					<Label for="edit-merk-name" class="text-xs font-semibold">
						{t("product.merk.brandName")} <span class="text-red-500">*</span>
					</Label>
					<Input
						id="edit-merk-name"
						type="text"
						bind:value={formMerkName}
						class="h-9 text-xs"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<Label for="edit-merk-origin" class="text-xs font-semibold">
						{t("product.merk.originCountry")}
					</Label>
					<Input
						id="edit-merk-origin"
						type="text"
						bind:value={formOrigin}
						class="h-9 text-xs"
					/>
				</div>

				<Dialog.Footer class="pt-2 gap-2">
					<Button.Root
						type="button"
						variant="outline"
						onclick={() => (isEditModalOpen = false)}
						class="h-9 text-xs"
					>
						{t("common.cancel")}
					</Button.Root>
					<Button.Root
						type="submit"
						class="h-9 text-xs bg-primary text-white hover:bg-primary/90"
					>
						{t("common.save")}
					</Button.Root>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Modal 4: Delete Confirmation (Single & Bulk) -->
<ConfirmDialog
	bind:open={isDeleteModalOpen}
	title={t("product.merk.deleteTitle")}
	description={t("product.merk.deleteDesc")}
	variant="danger"
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmDelete}
>
	{#if merkToDelete}
		<p>
			{t("product.merk.deleteConfirmSingleQuestion")}
			<strong class="text-red-600 dark:text-red-400 font-bold">
				{merkToDelete.merk}
			</strong>?
		</p>
		<p class="text-xs text-muted-foreground">
			{t("product.merk.deleteConfirmSingleWarning")}
		</p>
	{/if}
</ConfirmDialog>

<ConfirmDialog
	bind:open={isBulkDeleteModalOpen}
	title={t("product.merk.deleteBulkTitle", { count: selectedIds.length })}
	description={t("product.merk.deleteBulkDesc")}
	variant="danger"
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmBulkDelete}
>
	<p>
		{t("product.merk.deleteConfirmBulkQuestion", {
			count: selectedIds.length,
		})}
	</p>
	<p class="text-xs text-muted-foreground">
		{t("product.merk.deleteConfirmBulkWarn")}
	</p>
</ConfirmDialog>
