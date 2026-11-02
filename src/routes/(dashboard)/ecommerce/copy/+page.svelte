<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { initialEcommerceCopyProducts } from "$lib/data/ecommerce.js";
	import type { EcommerceCopyItem } from "$lib/types/index.js";
	import { t } from "$lib/i18n/index.js";

	// Icons
	import CopyIcon from "@lucide/svelte/icons/copy";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
	import SendIcon from "@lucide/svelte/icons/send";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
	import LayersIcon from "@lucide/svelte/icons/layers";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";

	let activeTab = $state<"Product" | "Draft" | "Copied">("Product");
	let items = $state<EcommerceCopyItem[]>([...initialEcommerceCopyProducts]);
	let toastMessage = $state<string | null>(null);

	// Copy Dialog state
	let isCopyModalOpen = $state(false);
	let selectedCopyProduct = $state<EcommerceCopyItem | null>(null);
	let targetChannelChoice = $state("Shopee (Official Store)");

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3500);
	}

	function formatRupiah(amount?: number): string {
		if (amount == null) return "-";
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	}

	const productItems = $derived(items.filter((i) => i.status === "Product"));
	const draftItems = $derived(items.filter((i) => i.status === "Draft"));
	const copiedItems = $derived(items.filter((i) => i.status === "Copied"));

	function openCopyModal(item: EcommerceCopyItem) {
		selectedCopyProduct = item;
		isCopyModalOpen = true;
	}

	function handleStartCopy() {
		if (!selectedCopyProduct) return;
		const newItem: EcommerceCopyItem = {
			...selectedCopyProduct,
			id: `cp-draft-${Date.now()}`,
			targetChannel: targetChannelChoice,
			status: "Draft",
			updatedAt: "31/10/2026",
		};
		items = [newItem, ...items];
		isCopyModalOpen = false;
		activeTab = "Draft";
		showToast(t("ecommerce.copy.copySuccess"));
	}

	function handlePublishDraft(id: string) {
		items = items.map((i) => {
			if (i.id === id) {
				return { ...i, status: "Copied", updatedAt: "31/10/2026" };
			}
			return i;
		});
		showToast("Draft produk berhasil dipublikasikan ke kanal marketplace!");
	}

	function handleDeleteItem(id: string) {
		items = items.filter((i) => i.id !== id);
		showToast("Item berhasil dihapus.");
	}

	function handleSyncItem(name: string) {
		showToast(`Sinkronisasi produk "${name}" berhasil diperbarui.`);
	}
</script>

<svelte:head>
	<title>{t("ecommerce.copy.title")} | OmniFlow</title>
</svelte:head>

<div class="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
	<!-- Toast Notification -->
	{#if toastMessage}
		<div
			class="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl animate-in slide-in-from-bottom-5 duration-200"
		>
			<CheckCircle2Icon class="size-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Header -->
	<div class="pb-2 border-b border-border/60">
		<h1 class="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
			<CopyIcon class="size-6 text-primary" />
			<span>{t("ecommerce.copy.title")}</span>
		</h1>
		<p class="text-xs text-muted-foreground mt-0.5 max-w-2xl">
			{t("ecommerce.copy.subtitle")}
		</p>
	</div>

	<!-- Tabs : Product, Draft, Copied -->
	<Tabs.Root bind:value={activeTab} class="space-y-4">
		<Tabs.List class="grid w-full max-w-md grid-cols-3 h-10 p-1 bg-muted/70 rounded-xl">
			<Tabs.Trigger value="Product" class="text-xs font-semibold rounded-lg cursor-pointer">
				{t("ecommerce.copy.tabProduct")} ({productItems.length})
			</Tabs.Trigger>
			<Tabs.Trigger value="Draft" class="text-xs font-semibold rounded-lg cursor-pointer">
				{t("ecommerce.copy.tabDraft")} ({draftItems.length})
			</Tabs.Trigger>
			<Tabs.Trigger value="Copied" class="text-xs font-semibold rounded-lg cursor-pointer">
				{t("ecommerce.copy.tabCopied")} ({copiedItems.length})
			</Tabs.Trigger>
		</Tabs.List>

		<!-- TAB 1: PRODUCT TABLE -->
		<Tabs.Content value="Product" class="focus-visible:outline-none">
			<div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
				<div class="overflow-x-auto">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-border/70 bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
								<th class="py-3 px-4 text-left">{t("ecommerce.copy.colName")}</th>
								<th class="py-3 px-4 text-left">{t("ecommerce.copy.colSource")}</th>
								<th class="py-3 px-4 text-left">{t("ecommerce.copy.colTarget")}</th>
								<th class="py-3 px-4 text-right">{t("ecommerce.copy.colPrice")}</th>
								<th class="py-3 px-4 text-center">{t("ecommerce.copy.colStock")}</th>
								<th class="py-3 px-4 text-center">{t("ecommerce.copy.colStatus")}</th>
								<th class="py-3 px-4 text-right">{t("ecommerce.copy.colActions")}</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border/60">
							{#each productItems as item}
								<tr class="hover:bg-muted/20 transition-colors">
									<td class="py-3 px-4">
										<div class="flex items-center gap-3">
											<img
												src={item.image}
												alt={item.name}
												class="size-10 rounded-lg object-cover border border-border/70 shrink-0"
											/>
											<div class="min-w-0 max-w-sm">
												<p class="font-medium text-xs text-foreground truncate">{item.name}</p>
												<span class="font-mono text-[10px] text-muted-foreground">
													{item.sku} • {item.variantsCount} varian
												</span>
											</div>
										</div>
									</td>
									<td class="py-3 px-4 font-medium text-foreground">
										{item.sourceChannel}
									</td>
									<td class="py-3 px-4">
										<span class="inline-flex items-center gap-1 text-primary font-medium">
											<ArrowRightIcon class="size-3 text-muted-foreground" />
											{item.targetChannel}
										</span>
									</td>
									<td class="py-3 px-4 text-right font-mono font-bold text-foreground">
										{formatRupiah(item.price)}
									</td>
									<td class="py-3 px-4 text-center font-mono">
										{item.stock} unit
									</td>
									<td class="py-3 px-4 text-center">
										<Badge variant="outline" class="text-[10px] bg-primary/5 text-primary border-primary/20">
											Siap Disalin
										</Badge>
									</td>
									<td class="py-3 px-4 text-right">
										<Button.Root
											type="button"
											size="xs"
											onclick={() => openCopyModal(item)}
											class="h-7 px-3 text-[11px] font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer gap-1.5 shadow-2xs"
										>
											<CopyIcon class="size-3" />
											<span>{t("ecommerce.copy.copyBtn")}</span>
										</Button.Root>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</Tabs.Content>

		<!-- TAB 2: DRAFT TABLE -->
		<Tabs.Content value="Draft" class="focus-visible:outline-none">
			<div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
				<div class="overflow-x-auto">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-border/70 bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
								<th class="py-3 px-4 text-left">{t("ecommerce.copy.colName")}</th>
								<th class="py-3 px-4 text-left">{t("ecommerce.copy.colSource")}</th>
								<th class="py-3 px-4 text-left">{t("ecommerce.copy.colTarget")}</th>
								<th class="py-3 px-4 text-right">{t("ecommerce.copy.colPrice")}</th>
								<th class="py-3 px-4 text-center">{t("ecommerce.copy.colStock")}</th>
								<th class="py-3 px-4 text-center">{t("ecommerce.copy.colStatus")}</th>
								<th class="py-3 px-4 text-right">{t("ecommerce.copy.colActions")}</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border/60">
							{#each draftItems as item}
								<tr class="hover:bg-muted/20 transition-colors">
									<td class="py-3 px-4">
										<div class="flex items-center gap-3">
											<img
												src={item.image}
												alt={item.name}
												class="size-10 rounded-lg object-cover border border-border/70 shrink-0"
											/>
											<div class="min-w-0 max-w-sm">
												<p class="font-medium text-xs text-foreground truncate">{item.name}</p>
												<span class="font-mono text-[10px] text-muted-foreground">
													{item.sku} • {item.variantsCount} varian
												</span>
											</div>
										</div>
									</td>
									<td class="py-3 px-4 font-medium text-foreground">
										{item.sourceChannel}
									</td>
									<td class="py-3 px-4">
										<span class="inline-flex items-center gap-1 text-primary font-medium">
											<ArrowRightIcon class="size-3 text-muted-foreground" />
											{item.targetChannel}
										</span>
									</td>
									<td class="py-3 px-4 text-right font-mono font-bold text-foreground">
										{formatRupiah(item.price)}
									</td>
									<td class="py-3 px-4 text-center font-mono">
										{item.stock} unit
									</td>
									<td class="py-3 px-4 text-center">
										<Badge variant="outline" class="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
											Draft Review
										</Badge>
									</td>
									<td class="py-3 px-4 text-right">
										<div class="flex items-center justify-end gap-1.5">
											<Button.Root
												type="button"
												size="xs"
												onclick={() => handlePublishDraft(item.id)}
												class="h-7 px-2.5 text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer gap-1"
											>
												<SendIcon class="size-3" />
												<span>{t("ecommerce.copy.publishDraft")}</span>
											</Button.Root>
											<Button.Root
												type="button"
												variant="ghost"
												size="icon-xs"
												onclick={() => handleDeleteItem(item.id)}
												class="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
												title="Hapus Draft"
											>
												<Trash2Icon class="size-3.5" />
											</Button.Root>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</Tabs.Content>

		<!-- TAB 3: COPIED TABLE -->
		<Tabs.Content value="Copied" class="focus-visible:outline-none">
			<div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
				<div class="overflow-x-auto">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-border/70 bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
								<th class="py-3 px-4 text-left">{t("ecommerce.copy.colName")}</th>
								<th class="py-3 px-4 text-left">{t("ecommerce.copy.colSource")}</th>
								<th class="py-3 px-4 text-left">{t("ecommerce.copy.colTarget")}</th>
								<th class="py-3 px-4 text-right">{t("ecommerce.copy.colPrice")}</th>
								<th class="py-3 px-4 text-center">{t("ecommerce.copy.colStock")}</th>
								<th class="py-3 px-4 text-center">{t("ecommerce.copy.colStatus")}</th>
								<th class="py-3 px-4 text-right">{t("ecommerce.copy.colActions")}</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border/60">
							{#each copiedItems as item}
								<tr class="hover:bg-muted/20 transition-colors">
									<td class="py-3 px-4">
										<div class="flex items-center gap-3">
											<img
												src={item.image}
												alt={item.name}
												class="size-10 rounded-lg object-cover border border-border/70 shrink-0"
											/>
											<div class="min-w-0 max-w-sm">
												<p class="font-medium text-xs text-foreground truncate">{item.name}</p>
												<span class="font-mono text-[10px] text-muted-foreground">
													{item.sku} • {item.variantsCount} varian
												</span>
											</div>
										</div>
									</td>
									<td class="py-3 px-4 font-medium text-foreground">
										{item.sourceChannel}
									</td>
									<td class="py-3 px-4">
										<span class="inline-flex items-center gap-1 text-primary font-medium">
											<ArrowRightIcon class="size-3 text-muted-foreground" />
											{item.targetChannel}
										</span>
									</td>
									<td class="py-3 px-4 text-right font-mono font-bold text-foreground">
										{formatRupiah(item.price)}
									</td>
									<td class="py-3 px-4 text-center font-mono">
										{item.stock} unit
									</td>
									<td class="py-3 px-4 text-center">
										<Badge variant="default" class="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
											<CheckCircle2Icon class="size-3" />
											Tersinkron
										</Badge>
									</td>
									<td class="py-3 px-4 text-right">
										<Button.Root
											type="button"
											variant="outline"
											size="xs"
											onclick={() => handleSyncItem(item.name)}
											class="h-7 px-2.5 text-[11px] font-medium cursor-pointer gap-1"
										>
											<RefreshCwIcon class="size-3" />
											<span>{t("ecommerce.copy.syncNow")}</span>
										</Button.Root>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

<!-- Copy Dialog Modal -->
<Dialog.Root bind:open={isCopyModalOpen}>
	<Dialog.Content class="max-w-md p-6 sm:rounded-2xl">
		{#if selectedCopyProduct}
			<Dialog.Header>
				<Dialog.Title class="font-heading text-lg font-bold flex items-center gap-2">
					<CopyIcon class="size-5 text-primary" />
					<span>{t("ecommerce.copy.copyModalTitle")}</span>
				</Dialog.Title>
				<Dialog.Description class="text-xs text-muted-foreground">
					{t("ecommerce.copy.copyModalDesc")}
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4 my-2 text-xs">
				<div class="p-3 rounded-lg border border-border/70 bg-muted/20 flex items-center gap-3">
					<img
						src={selectedCopyProduct.image}
						alt={selectedCopyProduct.name}
						class="size-11 rounded-lg object-cover border border-border/80 shrink-0"
					/>
					<div class="min-w-0 flex-1">
						<p class="font-semibold text-foreground truncate">{selectedCopyProduct.name}</p>
						<p class="font-mono text-[10px] text-muted-foreground">
							{selectedCopyProduct.sku} • {formatRupiah(selectedCopyProduct.price)}
						</p>
					</div>
				</div>

				<div>
					<Label class="text-xs font-semibold text-foreground mb-1 block">
						{t("ecommerce.copy.selectTargetStore")}
					</Label>
					<Select.Root
						type="single"
						bind:value={targetChannelChoice}
						items={[
							{ value: "Shopee (Official Store Jakarta)", label: "Shopee (Official Store Jakarta)" },
							{ value: "Tokopedia Official", label: "Tokopedia Official" },
							{ value: "TikTok Shop Indonesia", label: "TikTok Shop Indonesia" },
							{ value: "Lazada Flagship", label: "Lazada Flagship" },
						]}
					>
						<Select.Trigger class="h-9 w-full text-xs">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="Shopee (Official Store Jakarta)" label="Shopee (Official Store Jakarta)">
								Shopee (Official Store Jakarta)
							</Select.Item>
							<Select.Item value="Tokopedia Official" label="Tokopedia Official">
								Tokopedia Official
							</Select.Item>
							<Select.Item value="TikTok Shop Indonesia" label="TikTok Shop Indonesia">
								TikTok Shop Indonesia
							</Select.Item>
							<Select.Item value="Lazada Flagship" label="Lazada Flagship">
								Lazada Flagship
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<Dialog.Footer class="flex flex-row items-center justify-end gap-2 pt-2">
				<Button.Root
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (isCopyModalOpen = false)}
					class="cursor-pointer text-xs h-9"
				>
					{t("common.cancel")}
				</Button.Root>
				<Button.Root
					type="button"
					size="sm"
					onclick={handleStartCopy}
					class="bg-primary text-white hover:bg-primary/90 font-semibold cursor-pointer text-xs h-9 gap-1.5"
				>
					<CopyIcon class="size-3.5" />
					<span>{t("ecommerce.copy.confirmCopy")}</span>
				</Button.Root>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

