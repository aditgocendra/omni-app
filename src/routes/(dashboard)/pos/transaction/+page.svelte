<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import {
		DataTable,
		ConfirmDialog,
		type DataTableColumn,
	} from "$lib/components/common/index.js";
	import { t } from "$lib/i18n/index.js";
	import type {
		PosTransactionRecord,
		PaymentMethod,
	} from "$lib/types/index.js";
	import { initialPosTransactions } from "$lib/data/pos.js";

	import StoreIcon from "@lucide/svelte/icons/store";
	import SearchIcon from "@lucide/svelte/icons/search";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import XIcon from "@lucide/svelte/icons/x";
	import CheckIcon from "@lucide/svelte/icons/check";
	import ReceiptIcon from "@lucide/svelte/icons/receipt";
	import CreditCardIcon from "@lucide/svelte/icons/credit-card";
	import PackageIcon from "@lucide/svelte/icons/package";

	// Initial dataset
	let transactions = $state<PosTransactionRecord[]>([
		...initialPosTransactions,
	]);

	// Filter, Sort & Pagination states
	let searchQuery = $state("");
	let selectedWarehouse = $state("all");
	let sortKey = $state<string | null>("date");
	let sortDirection = $state<"asc" | "desc" | "none">("desc");
	let currentPage = $state(1);
	let pageSize = $state(10);
	let selectedIds = $state<(string | number)[]>([]);

	// Dialog states
	let isDetailModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isBulkDeleteModalOpen = $state(false);

	let selectedTransaction = $state<PosTransactionRecord | null>(null);
	let transactionToDelete = $state<PosTransactionRecord | null>(null);

	// Edit Form states
	let editWarehouse = $state("");
	let editPaymentMethod = $state<PaymentMethod>("Cash");
	let editNotes = $state("");

	// Toast state
	let toastMessage = $state<string | null>(null);

	const warehouseOptions = [
		"Warehouse A - Central Jakarta",
		"Warehouse B - East Surabaya",
		"Warehouse C - West Bandung",
		"Warehouse D - Semarang Hub",
	];

	const paymentMethods: PaymentMethod[] = [
		"Cash",
		"QRIS",
		"Debit Card",
		"Credit Card",
	];

	const warehouseFilterItems = $derived([
		{ value: "all", label: t("pos.transaction.filterWarehouse") },
		...warehouseOptions.map((w) => ({ value: w, label: w })),
	]);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3000);
	}

	function formatDateOnly(dateStr: string): string {
		if (!dateStr) return "-";
		return dateStr.split(" ")[0];
	}

	function parseDate(dateStr: string): number {
		// Format: "DD/MM/YYYY" or "DD/MM/YYYY HH:mm"
		const [datePart, timePart] = dateStr.split(" ");
		if (!datePart) return 0;
		const parts = datePart.split("/");
		if (parts.length === 3) {
			const day = parseInt(parts[0], 10);
			const month = parseInt(parts[1], 10) - 1;
			const year = parseInt(parts[2], 10);
			let hour = 0;
			let min = 0;
			if (timePart) {
				const timeTokens = timePart.split(":");
				hour = parseInt(timeTokens[0], 10) || 0;
				min = parseInt(timeTokens[1], 10) || 0;
			}
			return new Date(year, month, day, hour, min).getTime();
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

	$effect(() => {
		searchQuery;
		selectedWarehouse;
		currentPage = 1;
		selectedIds = [];
	});

	// Table Columns configuration (Sorting on Date)
	const columns = $derived<DataTableColumn<PosTransactionRecord>[]>([
		{
			id: "transactionId",
			header: t("pos.transaction.colTransactionId"),
		},
		{
			id: "date",
			header: t("pos.transaction.colDate"),
			sortable: true,
			accessorFn: (row: PosTransactionRecord) => parseDate(row.date),
		},
		{
			id: "qty",
			header: t("pos.transaction.colQty"),
			align: "center",
		},
		{
			id: "totalPayment",
			header: t("pos.transaction.colTotalPayment"),
			align: "right",
		},
		{
			id: "actions",
			header: t("pos.transaction.colActions"),
			align: "right",
		},
	]);

	// Filtered & Sorted Records
	const filteredTransactions = $derived.by(() => {
		return transactions.filter((t) => {
			const q = searchQuery.toLowerCase().trim();
			const matchSearch =
				!q ||
				t.transactionId.toLowerCase().includes(q) ||
				t.cashierName.toLowerCase().includes(q) ||
				(t.notes && t.notes.toLowerCase().includes(q));

			const matchWarehouse =
				selectedWarehouse === "all" ||
				t.warehouse === selectedWarehouse;

			return matchSearch && matchWarehouse;
		});
	});

	const sortedTransactions = $derived.by(() => {
		if (!sortKey || sortDirection === "none") return filteredTransactions;

		return [...filteredTransactions].sort((a, b) => {
			if (sortKey === "date") {
				const valA = parseDate(a.date);
				const valB = parseDate(b.date);
				return sortDirection === "asc" ? valA - valB : valB - valA;
			}
			return 0;
		});
	});

	function handleSort(key: string, direction: "asc" | "desc" | "none") {
		sortKey = key;
		sortDirection = direction;
	}

	function handleResetFilters() {
		searchQuery = "";
		selectedWarehouse = "all";
		sortKey = "date";
		sortDirection = "desc";
		showToast(t("pos.transaction.resetFiltersNotice"));
	}

	// Action Handlers
	function openDetail(trx: PosTransactionRecord) {
		selectedTransaction = trx;
		isDetailModalOpen = true;
	}

	function openEdit(trx: PosTransactionRecord) {
		selectedTransaction = trx;
		editWarehouse = trx.warehouse;
		editPaymentMethod = trx.paymentMethod;
		editNotes = trx.notes || "";
		isEditModalOpen = true;
	}

	function handleSaveEdit() {
		if (!selectedTransaction) return;

		transactions = transactions.map((t) =>
			t.id === selectedTransaction?.id
				? {
						...t,
						warehouse: editWarehouse,
						paymentMethod: editPaymentMethod,
						notes: editNotes.trim(),
					}
				: t,
		);

		isEditModalOpen = false;
		showToast(
			t("pos.transaction.transactionUpdated", {
				id: selectedTransaction.transactionId,
			}),
		);
	}

	function handleOpenDelete(trx: PosTransactionRecord) {
		transactionToDelete = trx;
		isDeleteModalOpen = true;
	}

	function handleConfirmDelete() {
		if (!transactionToDelete) return;
		const deletedId = transactionToDelete.transactionId;
		transactions = transactions.filter(
			(t) => t.id !== transactionToDelete?.id,
		);
		selectedIds = selectedIds.filter(
			(id) => id !== transactionToDelete?.id,
		);
		showToast(t("pos.transaction.transactionDeleted", { id: deletedId }));
		isDeleteModalOpen = false;
		transactionToDelete = null;
	}

	function handleOpenBulkDelete(ids?: (string | number)[]) {
		if (ids && ids.length > 0) selectedIds = ids;
		if (selectedIds.length === 0) return;
		isBulkDeleteModalOpen = true;
	}

	function handleConfirmBulkDelete() {
		const count = selectedIds.length;
		transactions = transactions.filter((t) => !selectedIds.includes(t.id));
		selectedIds = [];
		isBulkDeleteModalOpen = false;
		showToast(t("pos.transaction.bulkDeleted", { count }));
	}
</script>

<svelte:head>
	<title>{t("pos.transaction.title")} | Cronsyst</title>
</svelte:head>

<div class="space-y-6">
	<!-- Toast Message -->
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

	<!-- Header & Action Bar [Title Modul judul dan sub judul (kegunaan) - tombol cashier (redirect kehalaman cashier)] (justify between - center) -->
	<!-- Catatan: tombol cashier mengarah ke page : /cashier sehingga bukan dialog dan diluar dashboard -->
	<div
		class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h1
				class="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
			>
				{t("pos.transaction.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1.5">
				{t("pos.transaction.subtitle")}
			</p>
		</div>

		<div>
			<Button.Root
				variant="default"
				href="/cashier"
				class="h-10 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
			>
				<StoreIcon class="size-4" />
				<span>{t("pos.transaction.cashierBtn")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- Search & Filters Container [search kolom (Transaction ID) - width full, filter berdasar gudang, tombol reset] (full size) -->
	<div class="w-full space-y-3">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<!-- Search Column (Transaction ID) - full width -->
			<div class="relative flex-1">
				<SearchIcon
					class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10"
				/>
				<Input
					type="text"
					role="searchbox"
					bind:value={searchQuery}
					placeholder={t("pos.transaction.searchPlaceholder")}
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
			<div class="w-full sm:w-64">
				<Select.Root
					type="single"
					bind:value={selectedWarehouse}
					items={warehouseFilterItems}
				>
					<Select.Trigger
						class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/60 transition-colors"
					>
						<Select.Value
							placeholder={t("pos.transaction.filterWarehouse")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each warehouseFilterItems as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Reset Button -->
			<Button.Root
				type="button"
				variant="outline"
				size="default"
				onclick={handleResetFilters}
				class="h-10 px-4 text-xs font-semibold gap-1.5 border-border bg-white text-foreground hover:bg-slate-50 dark:bg-card dark:border-border dark:hover:bg-muted cursor-pointer shrink-0"
			>
				<RotateCcwIcon class="size-3.5" />
				<span>{t("pos.transaction.reset")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- Data Table Section -->
	<DataTable
		data={sortedTransactions}
		{columns}
		selectable={true}
		{selectedIds}
		onSelectionChange={(ids) => (selectedIds = ids)}
		onBulkDelete={handleOpenBulkDelete}
		{sortKey}
		{sortDirection}
		onSort={handleSort}
		bind:page={currentPage}
		bind:perPage={pageSize}
		perPageOptions={[10, 20, 50, 100]}
		emptyMessage={t("pos.transaction.emptyState")}
		tableClass="w-full border-collapse"
	>
		{#snippet cell({ item, column })}
			{#if column.id === "transactionId"}
				<div class="flex items-center gap-2.5 py-1">
					<div class="min-w-0">
						<span
							class="font-mono text-xs font-semibold text-foreground tracking-tight block truncate"
						>
							{item.transactionId}
						</span>
						<span
							class="text-[11px] text-muted-foreground block truncate"
						>
							{item.warehouse}
						</span>
					</div>
				</div>
			{:else if column.id === "date"}
				<div
					class="flex items-center gap-1.5 text-xs text-muted-foreground"
				>
					<CalendarIcon class="size-3.5 shrink-0 opacity-70" />
					<span class="font-mono text-foreground font-medium"
						>{formatDateOnly(item.date)}</span
					>
				</div>
			{:else if column.id === "qty"}
				<div
					class="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground bg-muted/60 px-2.5 py-1 rounded-md"
				>
					{item.qty}
					{t("pos.transaction.unit")}
				</div>
			{:else if column.id === "totalPayment"}
				<div class="text-right">
					<span class="font-mono text-xs font-bold text-foreground">
						{formatRupiah(item.totalPayment)}
					</span>
					<span class="block text-[10px] text-muted-foreground">
						{item.paymentMethod}
					</span>
				</div>
			{:else if column.id === "actions"}
				<div class="flex items-center justify-end">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
							title={t("pos.transaction.colActions")}
						>
							<EllipsisVerticalIcon class="size-4" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							align="end"
							class="w-36 p-1 text-xs"
						>
							<DropdownMenu.Item
								onclick={() => openDetail(item)}
								class="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted cursor-pointer text-xs"
							>
								<EyeIcon
									class="size-3.5 text-muted-foreground"
								/>
								<span>{t("pos.transaction.actionDetail")}</span>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onclick={() => openEdit(item)}
								class="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted cursor-pointer text-xs"
							>
								<PencilIcon
									class="size-3.5 text-muted-foreground"
								/>
								<span>{t("pos.transaction.actionEdit")}</span>
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onclick={() => handleOpenDelete(item)}
								class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer text-xs"
							>
								<Trash2Icon class="size-3.5" />
								<span>{t("pos.transaction.actionDelete")}</span>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{/if}
		{/snippet}
	</DataTable>
</div>

<!-- Transaction Detail Modal -->
<Dialog.Root bind:open={isDetailModalOpen}>
	<Dialog.Content class="max-w-xl p-6 sm:rounded-2xl">
		<Dialog.Header>
			<Dialog.Title
				class="font-heading text-lg font-bold flex items-center gap-2"
			>
				<ReceiptIcon class="size-5 text-primary" />
				<span>{t("pos.transaction.detailTitle")}</span>
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("pos.transaction.detailDesc", {
					id: selectedTransaction?.transactionId || "",
				})}
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedTransaction}
			<div class="space-y-4 my-2 text-xs">
				<!-- Meta Info Grid -->
				<div
					class="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/20"
				>
					<div>
						<span
							class="text-[10px] uppercase font-semibold text-muted-foreground block"
						>
							{t("pos.transaction.colTransactionId")}
						</span>
						<span
							class="font-mono font-bold text-sm text-foreground"
						>
							{selectedTransaction.transactionId}
						</span>
					</div>
					<div>
						<span
							class="text-[10px] uppercase font-semibold text-muted-foreground block"
						>
							{t("pos.transaction.colDate")}
						</span>
						<span class="font-mono text-xs text-foreground">
							{formatDateOnly(selectedTransaction.date)}
						</span>
					</div>
					<div>
						<span
							class="text-[10px] uppercase font-semibold text-muted-foreground block"
						>
							{t("pos.transaction.warehouse")}
						</span>
						<span class="text-xs text-foreground font-medium">
							{selectedTransaction.warehouse}
						</span>
					</div>
					<div>
						<span
							class="text-[10px] uppercase font-semibold text-muted-foreground block"
						>
							{t("pos.transaction.cashier")}
						</span>
						<span class="text-xs text-foreground font-medium">
							{selectedTransaction.cashierName}
						</span>
					</div>
					<div>
						<span
							class="text-[10px] uppercase font-semibold text-muted-foreground block"
						>
							{t("pos.transaction.paymentMethod")}
						</span>
						<span
							class="inline-flex items-center gap-1 font-semibold text-primary"
						>
							<CreditCardIcon class="size-3" />
							{selectedTransaction.paymentMethod}
						</span>
					</div>
					<div>
						<span
							class="text-[10px] uppercase font-semibold text-muted-foreground block"
						>
							{t("pos.transaction.colTotalPayment")}
						</span>
						<span class="font-mono font-bold text-sm text-primary">
							{formatRupiah(selectedTransaction.totalPayment)}
						</span>
					</div>
				</div>

				<!-- Items Purchased Table -->
				<div>
					<Label
						class="text-xs font-semibold text-foreground mb-2 block"
					>
						{t("pos.transaction.itemsPurchased")} ({selectedTransaction
							.items.length})
					</Label>
					<div
						class="rounded-lg border border-border/70 divide-y divide-border/60 overflow-hidden"
					>
						{#each selectedTransaction.items as itm}
							<div
								class="flex items-center justify-between p-2.5 bg-background"
							>
								<div class="flex items-center gap-2.5 min-w-0">
									<div
										class="size-9 rounded-md border border-border/80 bg-muted/40 overflow-hidden flex items-center justify-center shrink-0"
									>
										{#if itm.image}
											<img
												src={itm.image}
												alt={itm.name}
												class="size-full object-cover"
											/>
										{:else}
											<PackageIcon
												class="size-4 text-muted-foreground"
											/>
										{/if}
									</div>
									<div class="min-w-0">
										<p
											class="font-medium text-xs text-foreground truncate"
										>
											{itm.name}
										</p>
										<p
											class="font-mono text-[10px] text-muted-foreground"
										>
											{itm.sku}
										</p>
									</div>
								</div>
								<div class="text-right shrink-0">
									<p
										class="font-mono font-medium text-xs text-foreground"
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

				<!-- Notes -->
				{#if selectedTransaction.notes}
					<div
						class="p-3 rounded-lg border border-border/60 bg-muted/10"
					>
						<span
							class="text-[10px] uppercase font-semibold text-muted-foreground block mb-0.5"
						>
							{t("pos.transaction.notes")}
						</span>
						<p class="text-xs text-foreground">
							{selectedTransaction.notes}
						</p>
					</div>
				{/if}
			</div>
		{/if}

		<Dialog.Footer>
			<Button.Root
				type="button"
				variant="outline"
				size="sm"
				onclick={() => (isDetailModalOpen = false)}
				class="cursor-pointer"
			>
				{t("common.cancel")}
			</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Transaction Edit Modal -->
<Dialog.Root bind:open={isEditModalOpen}>
	<Dialog.Content class="max-w-md p-6 sm:rounded-2xl">
		<Dialog.Header>
			<Dialog.Title
				class="font-heading text-lg font-bold flex items-center gap-2"
			>
				<PencilIcon class="size-5 text-primary" />
				<span>{t("pos.transaction.editTitle")}</span>
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("pos.transaction.editDesc")}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 my-2 text-xs">
			<div>
				<Label class="text-xs font-semibold text-foreground mb-1 block">
					{t("pos.transaction.warehouse")}
				</Label>
				<Select.Root
					type="single"
					bind:value={editWarehouse}
					items={warehouseOptions.map((w) => ({
						value: w,
						label: w,
					}))}
				>
					<Select.Trigger
						class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs"
					>
						<Select.Value
							placeholder={t("pos.transaction.warehouse")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each warehouseOptions as w}
							<Select.Item value={w} label={w}>{w}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div>
				<Label class="text-xs font-semibold text-foreground mb-1 block">
					{t("pos.transaction.paymentMethod")}
				</Label>
				<Select.Root
					type="single"
					bind:value={editPaymentMethod}
					items={paymentMethods.map((m) => ({ value: m, label: m }))}
				>
					<Select.Trigger
						class="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs"
					>
						<Select.Value
							placeholder={t("pos.transaction.paymentMethod")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each paymentMethods as m}
							<Select.Item value={m} label={m}>{m}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div>
				<Label class="text-xs font-semibold text-foreground mb-1 block">
					{t("pos.transaction.notes")}
				</Label>
				<Textarea
					bind:value={editNotes}
					rows={3}
					placeholder="e.g. Special receipt request..."
					class="w-full text-xs"
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button.Root
				type="button"
				variant="outline"
				size="sm"
				onclick={() => (isEditModalOpen = false)}
				class="cursor-pointer"
			>
				{t("common.cancel")}
			</Button.Root>
			<Button.Root
				type="button"
				size="sm"
				onclick={handleSaveEdit}
				class="cursor-pointer bg-primary text-white hover:bg-primary/90"
			>
				{t("common.save")}
			</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Single Delete Confirmation -->
<ConfirmDialog
	bind:open={isDeleteModalOpen}
	title={t("pos.transaction.deleteTitle")}
	description={t("pos.transaction.deleteDesc")}
	confirmLabel={t("common.delete")}
	cancelLabel={t("common.cancel")}
	variant="danger"
	onConfirm={handleConfirmDelete}
	onCancel={() => {
		isDeleteModalOpen = false;
		transactionToDelete = null;
	}}
>
	<p class="text-xs text-muted-foreground">
		{t("pos.transaction.deleteConfirmQuestion")}
		<strong class="text-foreground"
			>{transactionToDelete?.transactionId}</strong
		>?
	</p>
	<p class="text-[11px] text-red-500 mt-1">
		{t("pos.transaction.deleteConfirmWarning")}
	</p>
</ConfirmDialog>

<!-- Bulk Delete Confirmation -->
<ConfirmDialog
	bind:open={isBulkDeleteModalOpen}
	title={t("pos.transaction.deleteBulkTitle", { count: selectedIds.length })}
	description={t("pos.transaction.deleteBulkDesc")}
	confirmLabel={t("common.delete")}
	cancelLabel={t("common.cancel")}
	variant="danger"
	onConfirm={handleConfirmBulkDelete}
	onCancel={() => {
		isBulkDeleteModalOpen = false;
	}}
>
	<p class="text-xs text-muted-foreground">
		{t("pos.transaction.deleteConfirmBulkQuestion", {
			count: selectedIds.length,
		})}
	</p>
	<p class="text-[11px] text-red-500 mt-1">
		{t("pos.transaction.deleteConfirmBulkWarn")}
	</p>
</ConfirmDialog>
