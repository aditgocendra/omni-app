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
	import type { ProductCategoryRecord } from "$lib/types/index.js";

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
	import TagsIcon from "@lucide/svelte/icons/tags";
	import PackageIcon from "@lucide/svelte/icons/package";

	// Initial dataset matching specifications
	let categories = $state<ProductCategoryRecord[]>([
		{
			id: "cat-1",
			code: "ELC",
			category: "Gadget & Elektronik",
			products: 17,
			createdAt: "18/02/2026",
			description: "Peralatan elektronik, smartphone, tablet, dan wearable smart tech.",
		},
		{
			id: "cat-2",
			code: "AUD",
			category: "Audio & Wearables",
			products: 24,
			createdAt: "20/02/2026",
			description: "Headset, earphone TWS, speaker bluetooth, dan audio amplifier.",
		},
		{
			id: "cat-3",
			code: "FAS",
			category: "Fashion & Footwear",
			products: 42,
			createdAt: "15/01/2026",
			description: "Pakaian kasual, sneakers pria & wanita, tas, dan aksesoris fashion.",
		},
		{
			id: "cat-4",
			code: "KMP",
			category: "Komputer & Aksesoris",
			products: 38,
			createdAt: "10/03/2026",
			description: "Komponen PC, laptop gaming, mouse, mechanical keyboard, dan monitor.",
		},
		{
			id: "cat-5",
			code: "HOM",
			category: "Home Appliances",
			products: 19,
			createdAt: "22/01/2026",
			description: "Penyedot debu robot, air purifier, blender, dan peralatan rumah pintar.",
		},
		{
			id: "cat-6",
			code: "BEA",
			category: "Kecantikan & Perawatan",
			products: 31,
			createdAt: "14/02/2026",
			description: "Skincare harian, kosmetik wajah, body lotion, dan parfum pria/wanita.",
		},
		{
			id: "cat-7",
			code: "SPO",
			category: "Olahraga & Outdoor",
			products: 28,
			createdAt: "01/02/2026",
			description: "Perlengkapan fitness gym, tenda camping, matras yoga, dan jersey sport.",
		},
		{
			id: "cat-8",
			code: "OTO",
			category: "Otomotif & Kendaraan",
			products: 15,
			createdAt: "25/02/2026",
			description: "Helm motor, oli mesin, lampu LED mobil, dan perkakas darurat jalan.",
		},
		{
			id: "cat-9",
			code: "MKN",
			category: "Makanan & Minuman",
			products: 56,
			createdAt: "05/01/2026",
			description: "Kopi biji nusantara, snack camilan gurih, dan minuman kesehatan siap saji.",
		},
		{
			id: "cat-10",
			code: "IBU",
			category: "Ibu & Perlengkapan Bayi",
			products: 22,
			createdAt: "12/03/2026",
			description: "Stroller bayi, botol susu steril, popok lembut, dan perlengkapan MPASI.",
		},
		{
			id: "cat-11",
			code: "HOB",
			category: "Hobi & Koleksi Mainan",
			products: 14,
			createdAt: "08/02/2026",
			description: "Action figure anime, diecast mobil 1:64, papan boardgame, dan puzzle 3D.",
		},
		{
			id: "cat-12",
			code: "BKK",
			category: "Buku & Alat Kantor",
			products: 35,
			createdAt: "19/01/2026",
			description: "Buku bisnis & manajemen, notebook jurnal, pulpen gel, dan binder file.",
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
	let selectedCategory = $state<ProductCategoryRecord | null>(null);
	let categoryToDelete = $state<ProductCategoryRecord | null>(null);

	let isCreateModalOpen = $state(false);
	let isDetailModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isBulkDeleteModalOpen = $state(false);
	let toastMessage = $state<string | null>(null);

	// Form inputs for Create / Edit
	let formCode = $state("");
	let formCategoryName = $state("");
	let formDescription = $state("");

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

	// Table Columns configuration (Sorting on Category (Name) and CreatedAt)
	const columns = $derived<DataTableColumn<ProductCategoryRecord>[]>([
		{
			id: "code",
			header: t("product.categories.colCode"),
			align: "center",
		},
		{
			id: "category",
			header: t("product.categories.colCategory"),
			sortable: true,
		},
		{
			id: "products",
			header: t("product.categories.colProducts"),
			align: "center",
		},
		{
			id: "createdAt",
			header: t("product.categories.colCreatedAt"),
			sortable: true,
			accessorFn: (row: ProductCategoryRecord) => parseDate(row.createdAt),
		},
		{
			id: "actions",
			header: t("product.categories.colActions"),
			align: "right",
		},
	]);

	// Filtered categories based on search input (name)
	const filteredCategories = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		return categories.filter((item) => {
			if (!q) return true;
			return (
				item.category.toLowerCase().includes(q) ||
				item.code.toLowerCase().includes(q)
			);
		});
	});

	function resetFilters() {
		searchQuery = "";
		sortKey = null;
		sortDirection = "none";
		showToast(t("product.categories.reset"));
	}

	// Action Handlers
	function openCreate() {
		formCode = "";
		formCategoryName = "";
		formDescription = "";
		isCreateModalOpen = true;
	}

	function handleSaveCreate() {
		if (!formCode.trim() || !formCategoryName.trim()) {
			showToast(t("product.categories.codeNameRequired"));
			return;
		}

		const cleanCode = formCode.trim().toUpperCase().slice(0, 3);
		const today = new Date();
		const day = String(today.getDate()).padStart(2, "0");
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const year = today.getFullYear();
		const formattedDate = `${day}/${month}/${year}`;

		const newCat: ProductCategoryRecord = {
			id: `cat-${Date.now()}`,
			code: cleanCode,
			category: formCategoryName.trim(),
			products: 0,
			createdAt: formattedDate,
			description: formDescription.trim() || "New retail category.",
		};

		categories = [newCat, ...categories];
		isCreateModalOpen = false;
		showToast(t("product.categories.categoryCreated", { name: newCat.category, code: newCat.code }));
	}

	function openDetail(cat: ProductCategoryRecord) {
		selectedCategory = cat;
		isDetailModalOpen = true;
	}

	function openEdit(cat: ProductCategoryRecord) {
		selectedCategory = cat;
		formCode = cat.code;
		formCategoryName = cat.category;
		formDescription = cat.description || "";
		isEditModalOpen = true;
	}

	function handleSaveEdit() {
		if (!selectedCategory) return;
		if (!formCode.trim() || !formCategoryName.trim()) {
			showToast(t("product.categories.codeNameRequired"));
			return;
		}

		const cleanCode = formCode.trim().toUpperCase().slice(0, 3);
		categories = categories.map((c) =>
			c.id === selectedCategory?.id
				? {
						...c,
						code: cleanCode,
						category: formCategoryName.trim(),
						description: formDescription.trim(),
					}
				: c,
		);

		isEditModalOpen = false;
		showToast(t("product.categories.categoryUpdated", { name: formCategoryName }));
	}

	function handleOpenDelete(cat: ProductCategoryRecord) {
		categoryToDelete = cat;
		isDeleteModalOpen = true;
	}

	function handleConfirmDelete() {
		if (!categoryToDelete) return;
		const deletedName = categoryToDelete.category;
		categories = categories.filter((c) => c.id !== categoryToDelete?.id);
		selectedIds = selectedIds.filter((id) => id !== categoryToDelete?.id);
		showToast(t("product.categories.categoryDeleted", { name: deletedName }));
		isDeleteModalOpen = false;
		categoryToDelete = null;
	}

	function handleOpenBulkDelete(ids?: (string | number)[]) {
		if (ids && ids.length > 0) selectedIds = ids;
		if (selectedIds.length === 0) return;
		isBulkDeleteModalOpen = true;
	}

	function handleConfirmBulkDelete() {
		const count = selectedIds.length;
		categories = categories.filter((c) => !selectedIds.includes(c.id));
		selectedIds = [];
		isBulkDeleteModalOpen = false;
		showToast(t("product.categories.bulkCategoriesDeleted", { count }));
	}
</script>

<svelte:head>
	<title>{t("product.categories.title")} | Cronsyst</title>
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
				{t("product.categories.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1.5">
				{t("product.categories.subtitle")}
			</p>
		</div>

		<div>
			<Button.Root
				onclick={openCreate}
				size="default"
				class="h-10 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
			>
				<PlusIcon class="size-4" />
				<span>{t("product.categories.createBtn")}</span>
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
					placeholder={t("product.categories.searchPlaceholder")}
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
				<span>{t("product.categories.reset")}</span>
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

	<!-- Categories Table Card (DataTable with Pagination min 10 & Sorting on Name and CreatedAt) -->
	<DataTable
		data={filteredCategories}
		{columns}
		bind:page={currentPage}
		bind:perPage={pageSize}
		perPageOptions={[10, 20, 50, 100]}
		bind:sortKey
		bind:sortDirection
		emptyMessage={t("product.categories.emptyState")}
		emptyIcon={TagsIcon}
		selectable={true}
		bind:selectedIds
		onBulkDelete={handleOpenBulkDelete}
	>
		{#snippet cell({
			item,
			column,
		}: {
			item: ProductCategoryRecord;
			column: DataTableColumn<ProductCategoryRecord>;
		})}
			{#if column.id === "code"}
				<!-- Code: 3 huruf misal ELC -->
				<span
					class="inline-flex items-center justify-center font-mono font-bold text-xs tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md"
				>
					{item.code}
				</span>
			{:else if column.id === "category"}
				<!-- Category: nama kategori -->
				<div class="flex flex-col">
					<button
						type="button"
						class="text-left text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
						onclick={() => openDetail(item)}
					>
						{item.category}
					</button>
					{#if item.description}
						<span
							class="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5"
						>
							{item.description}
						</span>
					{/if}
				</div>
			{:else if column.id === "products"}
				<!-- Products: count (17) -->
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
						aria-label="Category actions"
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
							<span>{t("product.categories.actionDetail")}</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => openEdit(item)}
							class="cursor-pointer gap-2 text-xs py-1.5"
						>
							<PencilIcon
								class="size-3.5 text-muted-foreground"
							/>
							<span>{t("product.categories.actionEdit")}</span>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							onclick={() => handleOpenDelete(item)}
							class="cursor-pointer gap-2 text-xs py-1.5 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
						>
							<Trash2Icon class="size-3.5" />
							<span>{t("product.categories.actionDelete")}</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		{/snippet}
	</DataTable>
</div>

<!-- Modal 1: Create Category -->
<Dialog.Root bind:open={isCreateModalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("product.categories.createCategoryTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("product.categories.createCategoryDesc")}
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
				<Label for="create-cat-code" class="text-xs font-semibold">
					{t("product.categories.categoryCode")} <span class="text-red-500">*</span>
				</Label>
				<Input
					id="create-cat-code"
					type="text"
					maxlength={3}
					bind:value={formCode}
					placeholder="e.g. ELC"
					class="h-9 text-xs font-mono uppercase tracking-wider"
					required
				/>
				<span class="text-[11px] text-muted-foreground">
					{t("product.categories.codeHint")}
				</span>
			</div>

			<div class="space-y-1.5">
				<Label for="create-cat-name" class="text-xs font-semibold">
					{t("product.categories.categoryName")} <span class="text-red-500">*</span>
				</Label>
				<Input
					id="create-cat-name"
					type="text"
					bind:value={formCategoryName}
					placeholder="e.g. Gadgets & Electronics"
					class="h-9 text-xs"
					required
				/>
			</div>

			<div class="space-y-1.5">
				<Label for="create-cat-desc" class="text-xs font-semibold">
					{t("product.categories.description")}
				</Label>
				<textarea
					id="create-cat-desc"
					rows="3"
					bind:value={formDescription}
					placeholder={t("product.categories.descPlaceholder")}
					class="w-full rounded-md border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
				></textarea>
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

<!-- Modal 2: Detail Category -->
<Dialog.Root bind:open={isDetailModalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("product.categories.detailCategoryTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("product.categories.detailCategoryDesc")}
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedCategory}
			<div class="space-y-3.5 py-2 text-xs">
				<div class="flex items-center gap-3.5 p-3.5 rounded-xl border border-border/70 bg-muted/30">
					<span
						class="inline-flex size-12 items-center justify-center font-mono font-bold text-base tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-xl"
					>
						{selectedCategory.code}
					</span>
					<div>
						<h3 class="font-heading text-sm font-bold text-foreground">
							{selectedCategory.category}
						</h3>
						<p class="text-xs text-muted-foreground mt-0.5">
							{t("product.categories.registeredProducts", { count: selectedCategory.products })}
						</p>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]">{t("product.categories.prefixCode")}</span>
						<span class="font-mono font-bold text-foreground text-xs mt-1 block">
							{selectedCategory.code}
						</span>
					</div>

					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]">{t("product.categories.createdDate")}</span>
						<span class="font-mono text-foreground text-xs mt-1 block font-medium">
							{selectedCategory.createdAt}
						</span>
					</div>
				</div>

				{#if selectedCategory.description}
					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px] mb-1">{t("product.categories.description")}</span>
						<p class="text-foreground text-xs leading-relaxed">
							{selectedCategory.description}
						</p>
					</div>
				{/if}
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

<!-- Modal 3: Edit Category -->
<Dialog.Root bind:open={isEditModalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("product.categories.editCategoryTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("product.categories.editCategoryDesc")}
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedCategory}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSaveEdit();
				}}
				class="space-y-4 py-2 text-xs"
			>
				<div class="space-y-1.5">
					<Label for="edit-cat-code" class="text-xs font-semibold">
						{t("product.categories.categoryCode")} <span class="text-red-500">*</span>
					</Label>
					<Input
						id="edit-cat-code"
						type="text"
						maxlength={3}
						bind:value={formCode}
						class="h-9 text-xs font-mono uppercase tracking-wider"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<Label for="edit-cat-name" class="text-xs font-semibold">
						{t("product.categories.categoryName")} <span class="text-red-500">*</span>
					</Label>
					<Input
						id="edit-cat-name"
						type="text"
						bind:value={formCategoryName}
						class="h-9 text-xs"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<Label for="edit-cat-desc" class="text-xs font-semibold">
						{t("product.categories.description")}
					</Label>
					<textarea
						id="edit-cat-desc"
						rows="3"
						bind:value={formDescription}
						class="w-full rounded-md border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
					></textarea>
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
	title={t("product.categories.deleteTitle")}
	description={t("product.categories.deleteDesc")}
	variant="danger"
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmDelete}
>
	{#if categoryToDelete}
		<p>
			{t("product.categories.deleteConfirmSingleQuestion")}
			<strong class="text-red-600 dark:text-red-400 font-bold">
				{categoryToDelete.category} ({categoryToDelete.code})
			</strong>?
		</p>
		<p class="text-xs text-muted-foreground">
			{t("product.categories.deleteConfirmSingleWarning")}
		</p>
	{/if}
</ConfirmDialog>

<ConfirmDialog
	bind:open={isBulkDeleteModalOpen}
	title={t("product.categories.deleteBulkTitle", { count: selectedIds.length })}
	description={t("product.categories.deleteBulkDesc")}
	variant="danger"
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmBulkDelete}
>
	<p>
		{t("product.categories.deleteConfirmBulkQuestion", {
			count: selectedIds.length,
		})}
	</p>
	<p class="text-xs text-muted-foreground">
		{t("product.categories.deleteConfirmBulkWarn")}
	</p>
</ConfirmDialog>
