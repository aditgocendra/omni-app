<script module lang="ts">
	export type { DataTableColumn } from "./data-table-types.js";
</script>

<script lang="ts" generics="T">
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Skeleton from "$lib/components/ui/skeleton/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
	import InboxIcon from "@lucide/svelte/icons/inbox";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import { cn } from "$lib/utils.js";
	import { t } from "$lib/i18n/index.js";
	import type { Component, Snippet } from "svelte";
	import type { DataTableColumn } from "./data-table-types.js";

	interface Props {
		data: T[];
		columns: DataTableColumn<T>[];
		page?: number;
		perPage?: number;
		perPageOptions?: number[];
		showPagination?: boolean;
		showPageSize?: boolean;
		showItemCount?: boolean;
		sortKey?: string | null;
		sortDirection?: "asc" | "desc" | "none";
		onSort?: (key: string, direction: "asc" | "desc" | "none") => void;
		emptyMessage?: string;
		emptyIcon?: Component<{ class?: string }>;
		loading?: boolean;
		class?: string;
		tableClass?: string;
		rowClass?: string | ((item: T, index: number) => string);
		onRowClick?: (item: T, index: number) => void;
		cell?: Snippet<
			[{ item: T; column: DataTableColumn<T>; index: number }]
		>;
		emptySnippet?: Snippet;
		toolbarSnippet?: Snippet;
		footerSnippet?: Snippet;

		selectable?: boolean;
		selectedIds?: (string | number)[];
		onSelectionChange?: (selectedIds: (string | number)[]) => void;
		onBulkDelete?: (selectedIds: (string | number)[]) => void;
		bulkActionSnippet?: Snippet<
			[{ selectedCount: number; clearSelection: () => void }]
		>;
		selectedLabel?: string;
		deselectLabel?: string;
		deleteLabel?: string;
	}

	let {
		data = [],
		columns = [],
		page = $bindable(1),
		perPage = $bindable(10),
		perPageOptions = [5, 10, 20, 50],
		showPagination = true,
		showPageSize = true,
		showItemCount = true,
		sortKey = $bindable(null),
		sortDirection = $bindable("none"),
		onSort,
		emptyMessage = "No data found",
		emptyIcon = InboxIcon,
		loading = false,
		class: className,
		tableClass,
		rowClass,
		onRowClick,
		cell: cellSnippet,
		emptySnippet,
		toolbarSnippet,
		footerSnippet,
		selectable = false,
		selectedIds = $bindable([]),
		onSelectionChange,
		onBulkDelete,
		bulkActionSnippet,
		selectedLabel,
		deselectLabel,
		deleteLabel,
	}: Props = $props();

	const effectiveSelectedLabel = $derived(
		selectedLabel ??
			(selectedIds.length > 1
				? t("common.selectedItems")
				: t("common.selectedItem"))
	);
	const effectiveDeselectLabel = $derived(
		deselectLabel ?? t("common.deselect")
	);
	const effectiveDeleteLabel = $derived(deleteLabel ?? t("common.delete"));

	function handleSort(columnId: string) {
		let nextDir: "asc" | "desc" | "none" = "asc";
		if (sortKey === columnId) {
			if (sortDirection === "asc") nextDir = "desc";
			else if (sortDirection === "desc") nextDir = "none";
			else nextDir = "asc";
		}
		sortKey = nextDir === "none" ? null : columnId;
		sortDirection = nextDir;
		onSort?.(columnId, nextDir);
	}

	// Internal sorting if not handled externally via onSort
	const sortedData = $derived.by(() => {
		if (onSort || !sortKey || sortDirection === "none") {
			return data;
		}

		const col = columns.find((c) => c.id === sortKey);
		return [...data].sort((a, b) => {
			let valA: unknown = col?.accessorFn
				? col.accessorFn(a)
				: (a as Record<string, unknown>)[sortKey!];
			let valB: unknown = col?.accessorFn
				? col.accessorFn(b)
				: (b as Record<string, unknown>)[sortKey!];

			if (valA == null) valA = "";
			if (valB == null) valB = "";

			if (typeof valA === "number" && typeof valB === "number") {
				return sortDirection === "asc" ? valA - valB : valB - valA;
			}
			return sortDirection === "asc"
				? String(valA).localeCompare(String(valB))
				: String(valB).localeCompare(String(valA));
		});
	});

	const totalItems = $derived(sortedData.length);
	const totalPages = $derived(Math.max(1, Math.ceil(totalItems / perPage)));

	// Keep page within valid bounds
	$effect(() => {
		if (page > totalPages) {
			page = totalPages;
		} else if (page < 1) {
			page = 1;
		}
	});

	const paginatedData = $derived.by(() => {
		if (!showPagination) return sortedData;
		const start = (page - 1) * perPage;
		const end = start + perPage;
		return sortedData.slice(start, end);
	});

	const rangeStart = $derived(
		totalItems === 0 ? 0 : (page - 1) * perPage + 1,
	);
	const rangeEnd = $derived(Math.min(page * perPage, totalItems));

	function getItemKey(item: T, index: number): string | number {
		if (item && typeof item === "object") {
			if (
				"id" in item &&
				(typeof item.id === "string" || typeof item.id === "number")
			) {
				return item.id;
			}
			if (
				"code" in item &&
				(typeof item.code === "string" || typeof item.code === "number")
			) {
				return item.code;
			}
		}
		return index;
	}

	function getCellValue(item: T, key: string): string {
		if (item && typeof item === "object" && key in item) {
			const val = (item as Record<string, unknown>)[key];
			return val != null ? String(val) : "";
		}
		return "";
	}

	const pageItemKeys = $derived(
		paginatedData.map((item, idx) => getItemKey(item, idx)),
	);

	const isAllSelected = $derived(
		pageItemKeys.length > 0 &&
			pageItemKeys.every((k) => selectedIds.includes(k)),
	);

	const isSomeSelected = $derived(
		pageItemKeys.some((k) => selectedIds.includes(k)) && !isAllSelected,
	);

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedIds = selectedIds.filter((id) => !pageItemKeys.includes(id));
		} else {
			const set = new Set([...selectedIds, ...pageItemKeys]);
			selectedIds = Array.from(set);
		}
		onSelectionChange?.(selectedIds);
	}

	function toggleSelectItem(key: string | number) {
		if (selectedIds.includes(key)) {
			selectedIds = selectedIds.filter((id) => id !== key);
		} else {
			selectedIds = [...selectedIds, key];
		}
		onSelectionChange?.(selectedIds);
	}

	function clearSelection() {
		selectedIds = [];
		onSelectionChange?.(selectedIds);
	}
</script>

<Card.Root
	class={cn(
		"overflow-hidden border border-border/80 bg-card shadow-xs rounded-xl p-0",
		className,
	)}
>
	{#if toolbarSnippet}
		<div class="p-4 border-b border-border/60">
			{@render toolbarSnippet()}
		</div>
	{/if}

	{#if selectable && selectedIds.length > 0}
		<div
			class="flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 bg-primary/10 dark:bg-primary/15 px-4 py-2.5 text-xs text-foreground transition-all animate-in fade-in slide-in-from-top-1"
		>
			<div class="flex items-center gap-2.5">
				<span
					class="inline-flex size-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold shadow-xs"
				>
					{selectedIds.length}
				</span>
				<span class="font-medium text-foreground">
					{selectedIds.length} {effectiveSelectedLabel}
				</span>
				<button
					type="button"
					onclick={clearSelection}
					class="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer transition-colors"
				>
					{effectiveDeselectLabel}
				</button>
			</div>

			<div class="flex items-center gap-2">
				{#if bulkActionSnippet}
					{@render bulkActionSnippet({
						selectedCount: selectedIds.length,
						clearSelection,
					})}
				{/if}
				{#if onBulkDelete}
					<Button.Root
						type="button"
						variant="destructive"
						size="sm"
						onclick={() => onBulkDelete?.(selectedIds)}
						class="h-8 gap-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors"
					>
						<Trash2Icon class="size-3.5 text-white" />
						<span>{effectiveDeleteLabel} ({selectedIds.length})</span>
					</Button.Root>
				{/if}
			</div>
		</div>
	{/if}

	<div class="overflow-x-auto">
		<Table.Root class={cn("w-full", tableClass)}>
			<Table.Header>
				<Table.Row
					class="border-b border-border/70 hover:bg-transparent"
				>
					{#if selectable}
						<Table.Head class="w-12 px-4 py-3.5 text-center">
							<div class="flex items-center justify-center">
								<Checkbox
									checked={isAllSelected}
									indeterminate={isSomeSelected}
									onCheckedChange={() => toggleSelectAll()}
									aria-label="Select all rows"
								/>
							</div>
						</Table.Head>
					{/if}
					{#each columns as col (col.id)}
						<Table.Head
							class={cn(
								"py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
								col.align === "right" && "text-right",
								col.align === "center" && "text-center",
								col.headerClass,
							)}
						>
							{#if col.sortable}
								<button
									type="button"
									onclick={() => handleSort(col.id)}
									class={cn(
										"inline-flex items-center gap-1.5 font-semibold uppercase hover:text-foreground transition-colors cursor-pointer group",
										col.align === "right" && "ms-auto",
										col.align === "center" && "mx-auto",
									)}
									title="Click to sort by {col.header}"
								>
									<span>{col.header}</span>
									{#if sortKey === col.id && sortDirection === "asc"}
										<ArrowUpIcon
											class="size-3.5 text-primary"
										/>
									{:else if sortKey === col.id && sortDirection === "desc"}
										<ArrowDownIcon
											class="size-3.5 text-primary"
										/>
									{:else}
										<ArrowUpDownIcon
											class="size-3.5 text-muted-foreground/60 group-hover:text-foreground transition-colors"
										/>
									{/if}
								</button>
							{:else}
								<span>{col.header}</span>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>

			<Table.Body>
				{#if loading}
					{#each Array(perPage > 5 ? 5 : perPage) as _, i}
						<Table.Row class="border-b border-border/40">
							{#if selectable}
								<Table.Cell class="w-12 px-4 py-3.5 text-center">
									<div class="flex items-center justify-center">
										<Skeleton.Root
											class="size-4 rounded"
										/>
									</div>
								</Table.Cell>
							{/if}
							{#each columns as col}
								<Table.Cell class="py-3.5 px-4">
									<Skeleton.Root
										class="h-4 w-full max-w-30 rounded"
									/>
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				{:else if paginatedData.length === 0}
					<Table.Row>
						<Table.Cell
							colspan={columns.length + (selectable ? 1 : 0)}
							class="py-12 text-center text-sm text-muted-foreground"
						>
							{#if emptySnippet}
								{@render emptySnippet()}
							{:else}
								<div
									class="flex flex-col items-center justify-center gap-2"
								>
									{#if emptyIcon}
										{@const Icon = emptyIcon}
										<Icon
											class="size-8 text-muted-foreground/40"
										/>
									{/if}
									<p>{emptyMessage}</p>
								</div>
							{/if}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each paginatedData as item, rowIndex (getItemKey(item, rowIndex))}
						{@const itemKey = getItemKey(item, rowIndex)}
						{@const isSelected = selectable && selectedIds.includes(itemKey)}
						<Table.Row
							class={cn(
								"border-b border-border/50 hover:bg-muted/40 transition-colors",
								isSelected && "bg-primary/5 dark:bg-primary/10",
								typeof rowClass === "function"
									? rowClass(item, rowIndex)
									: rowClass,
								onRowClick ? "cursor-pointer" : "",
							)}
							onclick={() => onRowClick?.(item, rowIndex)}
						>
							{#if selectable}
								<Table.Cell
									class="w-12 px-4 py-3.5 text-center"
									onclick={(e) => e.stopPropagation()}
								>
									<div class="flex items-center justify-center">
										<Checkbox
											checked={isSelected}
											onCheckedChange={() => toggleSelectItem(itemKey)}
											aria-label="Select row"
										/>
									</div>
								</Table.Cell>
							{/if}
							{#each columns as col (col.id)}
								<Table.Cell
									class={cn(
										"py-3.5 px-4",
										col.align === "right" && "text-right",
										col.align === "center" && "text-center",
										col.cellClass,
									)}
								>
									{#if col.cell}
										{@render col.cell(item, rowIndex)}
									{:else if cellSnippet}
										{@render cellSnippet({
											item,
											column: col,
											index: rowIndex,
										})}
									{:else if col.accessorFn}
										{col.accessorFn(item)}
									{:else}
										{getCellValue(item, col.id)}
									{/if}
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Table Footer with Info & Pagination Controls -->
	{#if footerSnippet}
		<div class="border-t border-border/60 p-4">
			{@render footerSnippet()}
		</div>
	{:else if showPagination || showItemCount}
		<div
			class="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground bg-muted/10"
		>
			<div
				class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start"
			>
				{#if showItemCount}
					<div class="flex items-center gap-2">
						<span>
							Showing <span class="font-medium text-foreground"
								>{rangeStart}</span
							>
							to
							<span class="font-medium text-foreground"
								>{rangeEnd}</span
							>
							of
							<span class="font-medium text-foreground"
								>{totalItems}</span
							> entries
						</span>
						{#if selectable && selectedIds.length > 0}
							<span class="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
								{selectedIds.length} {selectedLabel}
							</span>
						{/if}
					</div>
				{/if}

				{#if showPageSize && totalItems > 0}
					<div class="flex items-center gap-1.5 ms-2">
						<span
							class="hidden md:inline text-muted-foreground text-xs"
							>Per page:</span
						>
						<Select.Root
							type="single"
							value={String(perPage)}
							onValueChange={(v) => {
								if (v) {
									perPage = Number(v);
									page = 1;
								}
							}}
							items={perPageOptions.map((opt) => ({
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
								{#each perPageOptions as opt}
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
				{/if}
			</div>

			{#if showPagination && totalPages > 1}
				<div class="flex items-center justify-end w-full sm:w-auto">
					<Pagination.Root
						count={totalItems}
						{perPage}
						bind:page
						siblingCount={1}
						class="mx-0 w-auto"
					>
						{#snippet children({ pages, currentPage })}
							<Pagination.Content class="gap-1">
								<Pagination.Item>
									<Pagination.Previous
										class="h-8 px-2.5 text-xs font-medium rounded-md cursor-pointer bg-white dark:bg-card text-foreground hover:bg-slate-50 dark:hover:bg-muted border border-border/80 shadow-xs transition-colors"
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
													"size-8 text-xs font-semibold rounded-md cursor-pointer transition-colors shadow-xs",
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
										class="h-8 px-2.5 text-xs font-medium rounded-md cursor-pointer bg-white dark:bg-card text-foreground hover:bg-slate-50 dark:hover:bg-muted border border-border/80 shadow-xs transition-colors"
									/>
								</Pagination.Item>
							</Pagination.Content>
						{/snippet}
					</Pagination.Root>
				</div>
			{/if}
		</div>
	{/if}
</Card.Root>
