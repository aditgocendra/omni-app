<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import {
		nestedCategories,
		getAllFlattenedCategories,
		resolvePathFromBreadcrumb,
		getNodeName,
		type CategoryNode,
		type FlattenedCategory,
	} from "$lib/data/nested-categories.js";
	import { t, i18n } from "$lib/i18n/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
	import SearchIcon from "@lucide/svelte/icons/search";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import XIcon from "@lucide/svelte/icons/x";
	import InfoIcon from "@lucide/svelte/icons/info";
	import { cn } from "$lib/utils.js";

	interface Props {
		open?: boolean;
		value?: string;
		title?: string;
		class?: string;
		onSelect?: (breadcrumb: string, selectedNode?: CategoryNode) => void;
		onCancel?: () => void;
	}

	let {
		open = $bindable(false),
		value = "",
		title,
		class: className,
		onSelect,
		onCancel,
	}: Props = $props();

	// Effective dialog title (English first)
	const effectiveTitle = $derived(
		title || t("product.categorySelect.dialogTitle"),
	);

	// Search state
	let searchQuery = $state("");
	let showGuideModal = $state(false);

	// Currently active path of CategoryNodes: [Level 0, Level 1, Level 2, ...]
	let selectedPath = $state<CategoryNode[]>([]);

	// Container refs for horizontal and column scrolling
	let columnsContainerRef = $state<HTMLDivElement | null>(null);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);

	// All flattened categories for fast search (reactive to current locale)
	const allFlattened = $derived(
		getAllFlattenedCategories(nestedCategories, [], i18n.locale),
	);

	// Filtered categories based on search input
	const searchResults = $derived.by<FlattenedCategory[]>(() => {
		const q = searchQuery.trim().toLowerCase();
		if (q.length < 1) return [];
		return allFlattened
			.filter(
				(item) =>
					item.node.name.toLowerCase().includes(q) ||
					(item.node.nameId &&
						item.node.nameId.toLowerCase().includes(q)) ||
					item.breadcrumb.toLowerCase().includes(q),
			)
			.slice(0, 50); // limit to 50 results for smooth performance
	});

	// Current breadcrumb string from selectedPath in active locale
	const currentBreadcrumb = $derived.by(() => {
		if (selectedPath.length === 0) return "";
		return selectedPath
			.map((node) => getNodeName(node, i18n.locale))
			.join(" > ");
	});

	// Check if selection is valid for confirmation
	const isConfirmEnabled = $derived(selectedPath.length > 0);

	// Compute active columns to display
	// Column 0 is always root categories
	// Column 1 is children of selectedPath[0], Column 2 is children of selectedPath[1], etc.
	const activeColumns = $derived.by(() => {
		const cols: { level: number; items: CategoryNode[] }[] = [];
		// Level 0
		cols.push({ level: 0, items: nestedCategories });

		// Subsequent levels
		for (let i = 0; i < selectedPath.length; i++) {
			const currentSelected = selectedPath[i];
			if (
				currentSelected?.children &&
				currentSelected.children.length > 0
			) {
				cols.push({
					level: i + 1,
					items: currentSelected.children,
				});
			}
		}

		return cols;
	});

	// When dialog opens or value changes, initialize selection from value
	$effect(() => {
		if (open) {
			searchQuery = "";
			if (value && value.trim()) {
				const resolved = resolvePathFromBreadcrumb(
					value,
					nestedCategories,
				);
				if (resolved.length > 0) {
					selectedPath = resolved;
				} else {
					// Fallback: check if matches top level directly
					const trimmed = value.trim().toLowerCase();
					const top = nestedCategories.find(
						(c) =>
							c.name.toLowerCase() === trimmed ||
							(c.nameId && c.nameId.toLowerCase() === trimmed),
					);
					selectedPath = top ? [top] : [];
				}
			}
			// Update scroll buttons
			setTimeout(() => {
				updateScrollButtons();
				scrollActiveColumnsToEnd();
			}, 100);
		}
	});

	function handleItemClick(level: number, node: CategoryNode) {
		// Truncate path up to this level and set the new selected node
		const newPath = selectedPath.slice(0, level);
		newPath.push(node);
		selectedPath = newPath;

		// Automatically scroll horizontal container towards the newly revealed column
		setTimeout(() => {
			scrollActiveColumnsToEnd();
			updateScrollButtons();
		}, 50);
	}

	function handleSelectSearchResult(result: FlattenedCategory) {
		selectedPath = [...result.path];
		searchQuery = "";
		setTimeout(() => {
			scrollActiveColumnsToEnd();
			updateScrollButtons();
		}, 100);
	}

	function updateScrollButtons() {
		if (!columnsContainerRef) return;
		const { scrollLeft, scrollWidth, clientWidth } = columnsContainerRef;
		canScrollLeft = scrollLeft > 10;
		canScrollRight = scrollLeft + clientWidth < scrollWidth - 10;
	}

	function scrollColumns(direction: "left" | "right") {
		if (!columnsContainerRef) return;
		const amount = 240;
		columnsContainerRef.scrollBy({
			left: direction === "right" ? amount : -amount,
			behavior: "smooth",
		});
		setTimeout(updateScrollButtons, 300);
	}

	function scrollActiveColumnsToEnd() {
		if (!columnsContainerRef) return;
		columnsContainerRef.scrollTo({
			left: columnsContainerRef.scrollWidth,
			behavior: "smooth",
		});
	}

	function handleResetSearch() {
		searchQuery = "";
		setTimeout(() => {
			scrollActiveColumnsToEnd();
			updateScrollButtons();
		}, 50);
	}

	function handleConfirm() {
		if (!isConfirmEnabled) return;
		const leaf = selectedPath[selectedPath.length - 1];
		if (onSelect) {
			onSelect(currentBreadcrumb, leaf);
		}
		open = false;
	}

	function handleCancel() {
		if (onCancel) {
			onCancel();
		}
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		showCloseButton={false}
		class={cn(
			"w-[96vw] max-w-285 sm:max-w-[96vw] md:max-w-[96vw] lg:max-w-285 p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all",
			className,
		)}
	>
		<!-- Header -->
		<div
			class="flex items-center justify-between px-6 py-4 border-b border-border/70"
		>
			<Dialog.Title
				class="font-heading text-base font-bold text-foreground"
			>
				{effectiveTitle}
			</Dialog.Title>
			<button
				type="button"
				onclick={handleCancel}
				class="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
				title={t("product.categorySelect.close")}
			>
				<XIcon class="size-4" />
			</button>
		</div>

		<!-- Dialog Body -->
		<div class="p-6 space-y-4">
			<!-- Top Filter / Helper Bar -->
			<div class="flex items-center gap-2">
				<!-- Search input -->
				<div class="relative flex-1 sm:w-80 md:w-96 sm:flex-none">
					<Input
						type="text"
						bind:value={searchQuery}
						placeholder={t(
							"product.categorySelect.searchPlaceholder",
						)}
						class="h-9 pr-9 text-xs bg-background placeholder:text-muted-foreground/70 border-border/80 focus:border-primary/60"
					/>
					<div
						class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
					>
						<SearchIcon class="size-4" />
					</div>
				</div>

				<!-- Reset Search Button -->
				<Button.Root
					type="button"
					variant="outline"
					size="icon"
					onclick={handleResetSearch}
					class="size-9 rounded-lg border border-border/80 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/80 shadow-xs cursor-pointer shrink-0 transition-colors group/reset"
					title={t("product.categorySelect.resetSearch")}
					aria-label={t("product.categorySelect.resetSearch")}
				>
					<RotateCcwIcon
						class="size-3.5 text-muted-foreground group-hover/reset:text-foreground transition-colors"
					/>
				</Button.Root>
			</div>

			<!-- Guide Notice Box (Collapsible) -->
			{#if showGuideModal}
				<div
					class="p-3.5 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start justify-between gap-2 animate-in fade-in slide-in-from-top-2"
				>
					<div class="flex items-start gap-2.5">
						<InfoIcon class="size-4 text-primary shrink-0 mt-0.5" />
						<div class="space-y-1">
							<p class="font-semibold text-primary">
								{t("product.categorySelect.guideTitle")}
							</p>
							<p
								class="text-[11px] leading-relaxed text-muted-foreground"
							>
								{t("product.categorySelect.guideDesc")}
							</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (showGuideModal = false)}
						class="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
					>
						<XIcon class="size-3.5" />
					</button>
				</div>
			{/if}

			<!-- Search Results Container -->
			{#if searchQuery.trim().length >= 1}
				<div
					class="border border-border/80 rounded-xl bg-card p-2 h-100 flex flex-col overflow-hidden"
				>
					<div
						class="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground shrink-0 border-b border-border/40 pb-2"
					>
						{t("product.categorySelect.searchResults", {
							count: searchResults.length,
						})}
					</div>
					{#if searchResults.length > 0}
						<div class="flex-1 overflow-y-auto space-y-1 p-0.5 divide-y divide-border/40">
							{#each searchResults as item}
								<button
									type="button"
									onclick={() => handleSelectSearchResult(item)}
									class="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group cursor-pointer"
								>
									<div class="truncate pr-2">
										<span
											class="text-foreground group-hover:text-primary font-medium"
										>
											{item.breadcrumb}
										</span>
									</div>
									<ChevronRightIcon
										class="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary"
									/>
								</button>
							{/each}
						</div>
					{:else}
						<div
							class="flex-1 flex flex-col items-center justify-center py-8 text-center text-xs text-muted-foreground space-y-1"
						>
							<p>
								{t("product.categorySelect.noResults", {
									query: searchQuery,
								})}
							</p>
							<p class="text-[11px] text-muted-foreground/80">
								{t("product.categorySelect.noResultsHint")}
							</p>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Cascading Multi-Column Container -->
				<div
					class="relative border border-border/80 rounded-xl bg-muted/20 dark:bg-muted/10 overflow-hidden h-100"
				>
					<!-- Horizontal scrolling area -->
					<div
						bind:this={columnsContainerRef}
						onscroll={updateScrollButtons}
						class="flex overflow-x-auto divide-x divide-border/70 h-full scroll-smooth select-none"
					>
						{#each activeColumns as col, colIdx (col.level)}
							<div
								class="flex-1 min-w-60 max-w-71.25 shrink-0 p-2 overflow-y-auto h-full flex flex-col space-y-0.5"
							>
								{#each col.items as item (item.id)}
									{@const isSelected =
										selectedPath[colIdx]?.id === item.id}
									{@const hasChildren =
										item.children &&
										item.children.length > 0}
									{@const itemName = getNodeName(
										item,
										i18n.locale,
									)}
									<button
										type="button"
										onclick={() =>
											handleItemClick(colIdx, item)}
										class={cn(
											"w-full flex items-center justify-between px-3 py-2 text-xs rounded-md text-left transition-all cursor-pointer group",
											isSelected
												? "bg-primary text-primary-foreground font-semibold shadow-xs"
												: "text-foreground/90 hover:text-foreground hover:bg-muted/80 dark:hover:bg-muted/50",
										)}
									>
										<span
											class="truncate pr-1"
											title={itemName}
										>
											{itemName}
										</span>
										{#if hasChildren}
											<ChevronRightIcon
												class={cn(
													"size-3.5 shrink-0 transition-colors",
													isSelected
														? "text-primary-foreground"
														: "text-muted-foreground/60 group-hover:text-muted-foreground",
												)}
											/>
										{/if}
									</button>
								{/each}
							</div>
						{/each}
					</div>

					<!-- Floating Navigation Arrow Right -->
					{#if canScrollRight}
						<button
							type="button"
							onclick={() => scrollColumns("right")}
							class="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-card/90 hover:bg-card border border-border/80 text-foreground backdrop-blur-xs shadow-md flex items-center justify-center transition-all cursor-pointer z-20 hover:scale-105 active:scale-95"
							title={t("product.categorySelect.scrollRight")}
						>
							<ChevronRightIcon class="size-4.5" />
						</button>
					{/if}

					<!-- Floating Navigation Arrow Left -->
					{#if canScrollLeft}
						<button
							type="button"
							onclick={() => scrollColumns("left")}
							class="absolute left-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-card/90 hover:bg-card border border-border/80 text-foreground backdrop-blur-xs shadow-md flex items-center justify-center transition-all cursor-pointer z-20 hover:scale-105 active:scale-95"
							title={t("product.categorySelect.scrollLeft")}
						>
							<ChevronLeftIcon class="size-4.5" />
						</button>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div
			class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-muted/10 border-t border-border/70"
		>
			<!-- Selected Breadcrumb display -->
			<div
				class="text-xs text-foreground truncate max-w-2xl sm:max-w-3xl"
			>
				<span class="text-muted-foreground font-medium">
					{t("product.categorySelect.selectedLabel")}{" "}
				</span>
				{#if currentBreadcrumb}
					<span class="font-bold text-foreground">
						{currentBreadcrumb}
					</span>
				{:else}
					<span class="text-muted-foreground italic">
						{t("product.categorySelect.noCategorySelected")}
					</span>
				{/if}
			</div>

			<!-- Action Buttons -->
			<div class="flex items-center gap-2 justify-end shrink-0">
				<Button.Root
					type="button"
					variant="outline"
					size="default"
					onclick={handleCancel}
					class="h-9 px-4 text-xs font-medium cursor-pointer"
				>
					{t("common.cancel")}
				</Button.Root>
				<Button.Root
					type="button"
					variant="default"
					size="default"
					disabled={!isConfirmEnabled}
					onclick={handleConfirm}
					class="h-9 px-5 text-xs font-semibold bg-primary text-white hover:bg-primary/90 shadow-xs cursor-pointer transition-all disabled:opacity-50"
				>
					{t("common.confirm")}
				</Button.Root>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
