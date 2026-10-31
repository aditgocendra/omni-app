<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ThemeToggle from "$lib/components/layout/ThemeToggle.svelte";
	import LanguageSwitcher from "$lib/components/layout/LanguageSwitcher.svelte";
	import { t } from "$lib/i18n/index.js";
	import { defaultPosSettings, formatTransactionId } from "$lib/data/pos.js";
	import type {
		PosSettingConfig,
		PaymentMethod,
		PosTransactionItem,
	} from "$lib/types/index.js";

	import StoreIcon from "@lucide/svelte/icons/store";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import SearchIcon from "@lucide/svelte/icons/search";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import MinusIcon from "@lucide/svelte/icons/minus";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import ShoppingCartIcon from "@lucide/svelte/icons/shopping-cart";
	import CreditCardIcon from "@lucide/svelte/icons/credit-card";
	import QrCodeIcon from "@lucide/svelte/icons/qr-code";
	import BanknoteIcon from "@lucide/svelte/icons/banknote";
	import PrinterIcon from "@lucide/svelte/icons/printer";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import XIcon from "@lucide/svelte/icons/x";
	import ClockIcon from "@lucide/svelte/icons/clock";
	import UserIcon from "@lucide/svelte/icons/user";
	import PackageIcon from "@lucide/svelte/icons/package";
	import ZoomInIcon from "@lucide/svelte/icons/zoom-in";

	interface CatalogItem {
		id: string;
		name: string;
		sku: string;
		price: number;
		stock: number;
		category: string;
		image: string;
	}

	const catalogProducts: CatalogItem[] = [
		{
			id: "prd-1",
			name: "Apple iPhone 15 Pro Max 256GB",
			sku: "APL-IP15PM-NT-256",
			price: 21999000,
			stock: 45,
			category: "Gadgets & Electronics",
			image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80",
		},
		{
			id: "prd-2",
			name: "Samsung Galaxy S24 Ultra 256GB",
			sku: "SSG-S24U-GR-256",
			price: 20499000,
			stock: 30,
			category: "Gadgets & Electronics",
			image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80",
		},
		{
			id: "prd-3",
			name: "Sony WH-1000XM5 Headphones",
			sku: "SNY-WH1000XM5-BLK",
			price: 5499000,
			stock: 50,
			category: "Gadgets & Electronics",
			image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
		},
		{
			id: "prd-5",
			name: "Logitech MX Master 3S Mouse",
			sku: "LOG-MXM3S-GRP",
			price: 1549000,
			stock: 50,
			category: "Computers & Accessories",
			image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&auto=format&fit=crop&q=80",
		},
		{
			id: "prd-6",
			name: "Asus ROG Zephyrus G16 Laptop",
			sku: "ASU-G16-RTX4070",
			price: 34999000,
			stock: 14,
			category: "Computers & Accessories",
			image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=80",
		},
		{
			id: "prd-8",
			name: "MacBook Air 13 M3 16GB/512GB",
			sku: "APL-MBAM3-MID",
			price: 19999000,
			stock: 40,
			category: "Computers & Accessories",
			image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80",
		},
		{
			id: "prd-9",
			name: "Adidas Ultraboost Light Running",
			sku: "ADS-UB-BLK-41",
			price: 2499000,
			stock: 30,
			category: "Fashion & Footwear",
			image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop&q=80",
		},
		{
			id: "prd-7",
			name: "Xiaomi Robot Vacuum X20+",
			sku: "XMI-VACX20-WHT",
			price: 5899000,
			stock: 25,
			category: "Home Appliances",
			image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80",
		},
		{
			id: "prd-acc-1",
			name: "Braided Fast USB-C Cable 2M",
			sku: "ACC-CBL-2M",
			price: 200000,
			stock: 80,
			category: "Computers & Accessories",
			image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80",
		},
		{
			id: "prd-acc-2",
			name: "65W GaN Dual USB-C Fast Charger",
			sku: "ACC-CHG-65W",
			price: 450000,
			stock: 60,
			category: "Gadgets & Electronics",
			image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80",
		},
	];

	const categories = [
		"all",
		"Gadgets & Electronics",
		"Computers & Accessories",
		"Fashion & Footwear",
		"Home Appliances",
	];

	// Search & Category states
	let searchQuery = $state("");
	let selectedCategory = $state("all");

	// Cart items
	let cart = $state<PosTransactionItem[]>([]);
	let selectedPaymentMethod = $state<PaymentMethod>("QRIS");
	let cashReceived = $state<number | undefined>(undefined);

	// Checkout Success Modal
	let isSuccessModalOpen = $state(false);
	let completedTransactionId = $state("");
	let completedTransactionDate = $state("");
	let completedTotal = $state(0);
	let completedPaymentMethod = $state<PaymentMethod>("QRIS");

	// Product Image Zoom Modal
	let isZoomModalOpen = $state(false);
	let zoomedProduct = $state<CatalogItem | null>(null);

	function openZoomModal(product: CatalogItem) {
		zoomedProduct = product;
		isZoomModalOpen = true;
	}

	// Live Time
	let currentTime = $state(
		new Date().toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
		}),
	);

	if (typeof window !== "undefined") {
		setInterval(() => {
			currentTime = new Date().toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
			});
		}, 10000);
	}

	function formatRupiah(amount?: number): string {
		if (amount == null) return "Rp 0";
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	}

	// Filtered Catalog
	const filteredCatalog = $derived.by(() => {
		return catalogProducts.filter((item) => {
			const q = searchQuery.toLowerCase().trim();
			const matchSearch =
				!q ||
				item.name.toLowerCase().includes(q) ||
				item.sku.toLowerCase().includes(q);

			const matchCat =
				selectedCategory === "all" ||
				item.category === selectedCategory;

			return matchSearch && matchCat;
		});
	});

	// Totals
	const subtotal = $derived.by(() => {
		return cart.reduce((sum, item) => sum + item.total, 0);
	});

	const tax = $derived.by(() => {
		return Math.round(subtotal * 0.11);
	});

	const totalAmount = $derived.by(() => {
		return subtotal + tax;
	});

	const totalItemsCount = $derived.by(() => {
		return cart.reduce((count, item) => count + item.qty, 0);
	});

	const changeDue = $derived.by(() => {
		if (selectedPaymentMethod !== "Cash" || cashReceived == null) return 0;
		return Math.max(0, cashReceived - totalAmount);
	});

	function addToCart(product: CatalogItem) {
		const existingIndex = cart.findIndex((i) => i.productId === product.id);
		if (existingIndex >= 0) {
			const item = cart[existingIndex];
			if (item.qty < product.stock) {
				item.qty += 1;
				item.total = item.qty * item.price;
			}
		} else {
			cart = [
				...cart,
				{
					productId: product.id,
					name: product.name,
					sku: product.sku,
					price: product.price,
					qty: 1,
					total: product.price,
					image: product.image,
				},
			];
		}
	}

	function updateQty(productId: string, delta: number) {
		const target = cart.find((i) => i.productId === productId);
		if (!target) return;
		const prod = catalogProducts.find((p) => p.id === productId);
		const maxStock = prod?.stock ?? 999;

		const newQty = target.qty + delta;
		if (newQty <= 0) {
			cart = cart.filter((i) => i.productId !== productId);
		} else if (newQty <= maxStock) {
			target.qty = newQty;
			target.total = target.qty * target.price;
		}
	}

	function removeFromCart(productId: string) {
		cart = cart.filter((i) => i.productId !== productId);
	}

	function clearCart() {
		cart = [];
		cashReceived = undefined;
	}

	function handleCheckout() {
		if (cart.length === 0) return;

		// Load POS settings from localStorage if available
		let settings: PosSettingConfig = defaultPosSettings;
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("cronsyst_pos_settings");
				if (saved) settings = JSON.parse(saved);
			} catch {
				// use default
			}
		}

		// Generate transaction ID
		const randomSeq = Math.floor(Math.random() * 899) + 100;
		const now = new Date();
		const generatedId = formatTransactionId(settings, randomSeq, now);

		completedTransactionId = generatedId;
		completedTransactionDate =
			now.toLocaleDateString("id-ID") +
			" " +
			now.toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
			});
		completedTotal = totalAmount;
		completedPaymentMethod = selectedPaymentMethod;

		isSuccessModalOpen = true;
	}

	function startNewOrder() {
		cart = [];
		cashReceived = undefined;
		isSuccessModalOpen = false;
	}
</script>

<svelte:head>
	<title>{t("cashier.title")} | Cronsyst POS</title>
</svelte:head>

<div
	class="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-white"
>
	<!-- Standalone POS Header Bar -->
	<header
		class="h-16 border-b border-border/80 bg-card px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs"
	>
		<!-- Left: Back Button & Branding -->
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<div
					class="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs"
				>
					<StoreIcon class="size-4" />
				</div>
				<div>
					<h1
						class="font-heading font-bold text-sm tracking-tight leading-none text-foreground"
					>
						Cronsyst POS
					</h1>
					<p class="text-[11px] text-muted-foreground mt-0.5">
						Register #01 • Warehouse A
					</p>
				</div>
			</div>
		</div>

		<!-- Right: Status, Time, Theme & i18n -->
		<div class="flex items-center gap-2.5">
			<div
				class="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-border/60 bg-muted/40 text-xs"
			>
				<ClockIcon class="size-3.5 text-muted-foreground" />
				<span class="font-mono font-medium">{currentTime}</span>
			</div>

			<div
				class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/60 bg-muted/40 text-xs"
			>
				<UserIcon class="size-3.5 text-primary" />
				<span class="font-medium">Adit Gocendra</span>
			</div>

			<LanguageSwitcher />
			<ThemeToggle />
		</div>
	</header>

	<!-- Main Cashier Split Screen -->
	<div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
		<!-- Left / Center: Catalog & Products Grid (2/3 width) -->
		<main
			class="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 border-r border-border/70"
		>
			<!-- Top Filter Bar -->
			<div class="space-y-3">
				<!-- Search Input -->
				<div class="relative w-full">
					<SearchIcon
						class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
					/>
					<Input
						type="text"
						bind:value={searchQuery}
						placeholder={t("cashier.searchProduct")}
						class="h-10 pl-10 pr-9 text-xs sm:text-sm bg-card shadow-xs"
					/>
					{#if searchQuery}
						<button
							type="button"
							onclick={() => (searchQuery = "")}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							<XIcon class="size-4" />
						</button>
					{/if}
				</div>

				<!-- Category Horizontal Pills -->
				<div
					class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
				>
					{#each categories as cat}
						<button
							type="button"
							onclick={() => (selectedCategory = cat)}
							class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer {selectedCategory ===
							cat
								? 'bg-primary text-white shadow-xs'
								: 'bg-card border border-border text-foreground hover:bg-muted'}"
						>
							{cat === "all" ? t("cashier.allCategories") : cat}
						</button>
					{/each}
				</div>
			</div>

			<!-- Product Grid -->
			<div class="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-3.5">
				{#each filteredCatalog as product (product.id)}
					<div
						role="button"
						tabindex="0"
						onclick={() => addToCart(product)}
						onkeydown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								addToCart(product);
							}
						}}
						class="group flex flex-col text-left p-3 rounded-xl border border-border/80 bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer relative"
					>
						<!-- Image Container -->
						<div
							class="aspect-square w-full rounded-lg overflow-hidden bg-muted/40 mb-2.5 relative"
						>
							<img
								src={product.image}
								alt={product.name}
								class="size-full object-cover group-hover:scale-105 transition-transform"
							/>

							<!-- Enlarge / Zoom Button -->
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									openZoomModal(product);
								}}
								class="absolute top-1.5 right-1.5 size-7 rounded-lg bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 shadow-xs cursor-pointer backdrop-blur-xs z-10 hover:scale-105 active:scale-95"
								title={t("cashier.zoomImage")}
								aria-label={t("cashier.zoomImage")}
							>
								<ZoomInIcon class="size-3.5" />
							</button>

							<span
								class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] font-mono text-white backdrop-blur-xs"
							>
								{t("cashier.stockAvailable", {
									count: product.stock,
								})}
							</span>
						</div>

						<!-- Info -->
						<div class="flex-1 flex flex-col justify-between">
							<div>
								<span
									class="text-[10px] font-mono text-muted-foreground block truncate"
								>
									{product.sku}
								</span>
								<h3
									class="font-medium text-xs text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors"
								>
									{product.name}
								</h3>
							</div>

							<div
								class="mt-2 pt-2 border-t border-border/50 flex items-center justify-between"
							>
								<span
									class="font-mono font-bold text-xs text-primary"
								>
									{formatRupiah(product.price)}
								</span>
								<div
									class="size-6 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors"
								>
									<PlusIcon class="size-3.5" />
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			{#if filteredCatalog.length === 0}
				<div class="text-center py-12 text-muted-foreground text-xs">
					<PackageIcon class="size-8 mx-auto mb-2 opacity-50" />
					<p>No products found matching your search.</p>
				</div>
			{/if}
		</main>

		<!-- Right: Current Order & Checkout Drawer (1/3 width, min-w 380px) -->
		<aside
			class="w-full lg:w-96 xl:w-105 bg-card flex flex-col shrink-0 shadow-lg border-t lg:border-t-0"
		>
			<!-- Order Header -->
			<div
				class="p-4 border-b border-border/80 flex items-center justify-between"
			>
				<div class="flex items-center gap-2">
					<ShoppingCartIcon class="size-4 text-primary" />
					<h2 class="font-heading font-bold text-sm text-foreground">
						{t("cashier.cartTitle")}
					</h2>
					<span
						class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-mono font-semibold"
					>
						{totalItemsCount}
					</span>
				</div>

				{#if cart.length > 0}
					<Button.Root
						type="button"
						variant="ghost"
						size="xs"
						onclick={clearCart}
						class="text-[11px] text-muted-foreground hover:text-red-500 cursor-pointer"
					>
						{t("cashier.clearCart")}
					</Button.Root>
				{/if}
			</div>

			<!-- Cart Items List (Scrollable) -->
			<div
				class="flex-1 overflow-y-auto p-4 space-y-3 min-h-60 max-h-[42vh] lg:max-h-none"
			>
				{#each cart as item (item.productId)}
					<div
						class="p-2.5 rounded-xl border border-border/80 bg-muted/20 flex items-center gap-3"
					>
						<div
							class="size-12 rounded-lg border border-border/80 bg-background overflow-hidden shrink-0"
						>
							{#if item.image}
								<img
									src={item.image}
									alt={item.name}
									class="size-full object-cover"
								/>
							{:else}
								<PackageIcon
									class="size-5 m-auto text-muted-foreground"
								/>
							{/if}
						</div>

						<div class="min-w-0 flex-1">
							<h4
								class="font-medium text-xs text-foreground truncate"
							>
								{item.name}
							</h4>
							<p
								class="font-mono text-[10px] text-muted-foreground"
							>
								{item.sku}
							</p>
							<p
								class="font-mono font-bold text-xs text-primary mt-0.5"
							>
								{formatRupiah(item.total)}
							</p>
						</div>

						<!-- Qty Controls -->
						<div
							class="flex items-center gap-1.5 shrink-0 bg-background border border-border/80 rounded-lg p-1"
						>
							<button
								type="button"
								onclick={() => updateQty(item.productId, -1)}
								class="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
							>
								{#if item.qty === 1}
									<Trash2Icon class="size-3 text-red-500" />
								{:else}
									<MinusIcon class="size-3" />
								{/if}
							</button>
							<span
								class="font-mono font-bold text-xs px-1 min-w-5 text-center"
								>{item.qty}</span
							>
							<button
								type="button"
								onclick={() => updateQty(item.productId, 1)}
								class="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
							>
								<PlusIcon class="size-3" />
							</button>
						</div>
					</div>
				{/each}

				{#if cart.length === 0}
					<div
						class="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground"
					>
						<div
							class="size-12 rounded-full bg-muted flex items-center justify-center mb-2"
						>
							<ShoppingCartIcon class="size-6 stroke-1" />
						</div>
						<p class="font-semibold text-xs text-foreground">
							{t("cashier.cartEmpty")}
						</p>
						<p class="text-[11px] mt-1 max-w-52">
							{t("cashier.cartEmptyHint")}
						</p>
					</div>
				{/if}
			</div>

			<!-- Checkout Drawer Footer -->
			<div class="p-4 border-t border-border/80 bg-card space-y-3.5">
				<!-- Subtotals & Tax Breakdown -->
				<div
					class="space-y-1.5 text-xs text-muted-foreground border-b border-border/60 pb-3"
				>
					<div class="flex justify-between">
						<span>{t("cashier.subtotal")}</span>
						<span class="font-mono font-medium text-foreground"
							>{formatRupiah(subtotal)}</span
						>
					</div>
					<div class="flex justify-between">
						<span>{t("cashier.tax")}</span>
						<span class="font-mono font-medium text-foreground"
							>{formatRupiah(tax)}</span
						>
					</div>
					<div
						class="flex justify-between text-sm font-bold text-foreground pt-1.5"
					>
						<span>{t("cashier.total")}</span>
						<span class="font-mono text-lg text-primary"
							>{formatRupiah(totalAmount)}</span
						>
					</div>
				</div>

				<!-- Payment Method Selector -->
				<div class="space-y-1.5">
					<Label class="text-[11px] font-semibold text-foreground">
						{t("cashier.selectPaymentMethod")}
					</Label>
					<div class="grid grid-cols-4 gap-1.5">
						<button
							type="button"
							onclick={() => (selectedPaymentMethod = "QRIS")}
							class="flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all {selectedPaymentMethod ===
							'QRIS'
								? 'border-primary bg-primary/10 text-primary font-bold'
								: 'border-border/80 hover:bg-muted text-muted-foreground'}"
						>
							<QrCodeIcon class="size-4" />
							<span class="text-[10px]">QRIS</span>
						</button>
						<button
							type="button"
							onclick={() => (selectedPaymentMethod = "Cash")}
							class="flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all {selectedPaymentMethod ===
							'Cash'
								? 'border-primary bg-primary/10 text-primary font-bold'
								: 'border-border/80 hover:bg-muted text-muted-foreground'}"
						>
							<BanknoteIcon class="size-4" />
							<span class="text-[10px]">{t("cashier.cash")}</span>
						</button>
						<button
							type="button"
							onclick={() =>
								(selectedPaymentMethod = "Debit Card")}
							class="flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all {selectedPaymentMethod ===
							'Debit Card'
								? 'border-primary bg-primary/10 text-primary font-bold'
								: 'border-border/80 hover:bg-muted text-muted-foreground'}"
						>
							<CreditCardIcon class="size-4" />
							<span class="text-[10px]">Debit</span>
						</button>
						<button
							type="button"
							onclick={() =>
								(selectedPaymentMethod = "Credit Card")}
							class="flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all {selectedPaymentMethod ===
							'Credit Card'
								? 'border-primary bg-primary/10 text-primary font-bold'
								: 'border-border/80 hover:bg-muted text-muted-foreground'}"
						>
							<CreditCardIcon class="size-4" />
							<span class="text-[10px]">Credit</span>
						</button>
					</div>
				</div>

				<!-- Cash Tender & Change Due -->
				{#if selectedPaymentMethod === "Cash" && cart.length > 0}
					<div
						class="p-2.5 rounded-lg border border-border/80 bg-muted/20 space-y-2 text-xs"
					>
						<div class="flex items-center justify-between">
							<span class="text-[11px] text-muted-foreground"
								>{t("cashier.amountPaid")}:</span
							>
							<Input
								type="number"
								min="0"
								step="1000"
								bind:value={cashReceived}
								placeholder={String(totalAmount)}
								class="h-7 w-32 font-mono text-xs text-right"
							/>
						</div>
						<div
							class="flex items-center justify-between font-semibold pt-1 border-t border-border/50"
						>
							<span class="text-[11px] text-foreground"
								>{t("cashier.changeDue")}:</span
							>
							<span class="font-mono text-emerald-600 font-bold"
								>{formatRupiah(changeDue)}</span
							>
						</div>
					</div>
				{/if}

				<!-- Charge Button -->
				<Button.Root
					type="button"
					onclick={handleCheckout}
					disabled={cart.length === 0}
					class="w-full h-11 text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
				>
					<span
						>{t("cashier.checkoutBtn")} • {formatRupiah(
							totalAmount,
						)}</span
					>
				</Button.Root>
			</div>
		</aside>
	</div>
</div>

<!-- Payment Successful Receipt Modal -->
<Dialog.Root bind:open={isSuccessModalOpen}>
	<Dialog.Content class="max-w-md p-6 sm:rounded-2xl">
		<div class="text-center space-y-3">
			<div
				class="size-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto animate-in zoom-in-75"
			>
				<CheckCircle2Icon class="size-8" />
			</div>

			<Dialog.Title
				class="font-heading text-xl font-bold text-foreground"
			>
				{t("cashier.paymentSuccess")}
			</Dialog.Title>

			<Dialog.Description class="text-xs text-muted-foreground">
				{t("cashier.paymentSuccessDesc", {
					id: completedTransactionId,
				})}
			</Dialog.Description>
		</div>

		<!-- Digital Receipt Paper Style -->
		<div
			class="my-4 p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-3 text-xs"
		>
			<div
				class="flex justify-between items-center text-[11px] text-muted-foreground border-b border-border/60 pb-2"
			>
				<span class="font-mono font-bold text-foreground"
					>{completedTransactionId}</span
				>
				<span class="font-mono">{completedTransactionDate}</span>
			</div>

			<div class="space-y-1.5 divide-y divide-border/40">
				{#each cart as item}
					<div class="flex justify-between items-center pt-1.5">
						<div class="min-w-0 pr-2">
							<p
								class="font-medium text-xs text-foreground truncate"
							>
								{item.name}
							</p>
							<p
								class="font-mono text-[10px] text-muted-foreground"
							>
								{item.qty} × {formatRupiah(item.price)}
							</p>
						</div>
						<span class="font-mono font-medium text-foreground"
							>{formatRupiah(item.total)}</span
						>
					</div>
				{/each}
			</div>

			<div class="border-t border-border/70 pt-2 space-y-1">
				<div
					class="flex justify-between text-muted-foreground text-[11px]"
				>
					<span>{t("cashier.subtotal")}</span>
					<span class="font-mono">{formatRupiah(subtotal)}</span>
				</div>
				<div
					class="flex justify-between text-muted-foreground text-[11px]"
				>
					<span>{t("cashier.tax")}</span>
					<span class="font-mono">{formatRupiah(tax)}</span>
				</div>
				<div
					class="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border/60"
				>
					<span>{t("cashier.total")}</span>
					<span class="font-mono text-primary"
						>{formatRupiah(completedTotal)}</span
					>
				</div>
				<div
					class="flex justify-between text-[11px] text-muted-foreground pt-0.5"
				>
					<span>{t("pos.transaction.paymentMethod")}:</span>
					<span class="font-semibold text-foreground"
						>{completedPaymentMethod}</span
					>
				</div>
			</div>
		</div>

		<Dialog.Footer class="flex flex-col sm:flex-row gap-2">
			<Button.Root
				type="button"
				variant="outline"
				size="sm"
				onclick={() => window.print()}
				class="h-9 gap-1.5 text-xs font-semibold cursor-pointer w-full sm:w-auto"
			>
				<PrinterIcon class="size-4" />
				<span>{t("cashier.printReceipt")}</span>
			</Button.Root>
			<Button.Root
				type="button"
				size="sm"
				onclick={startNewOrder}
				class="h-9 gap-1.5 text-xs font-bold bg-primary text-white hover:bg-primary/90 cursor-pointer w-full sm:flex-1"
			>
				<span>{t("cashier.newTransaction")}</span>
			</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Product Image Zoom Modal (1:1 Ratio) -->
<Dialog.Root bind:open={isZoomModalOpen}>
	<Dialog.Content class="max-w-md p-5 sm:rounded-2xl">
		{#if zoomedProduct}
			<Dialog.Header class="pb-1 text-left">
				<Dialog.Title
					class="font-heading text-base font-bold text-foreground truncate"
				>
					{zoomedProduct.name}
				</Dialog.Title>
				<Dialog.Description
					class="text-xs text-muted-foreground font-mono flex items-center gap-2"
				>
					<span>{zoomedProduct.sku}</span>
					<span>•</span>
					<span class="font-bold text-primary"
						>{formatRupiah(zoomedProduct.price)}</span
					>
				</Dialog.Description>
			</Dialog.Header>

			<!-- 1:1 Aspect Ratio Image Container -->
			<div
				class="aspect-square w-full rounded-xl overflow-hidden bg-muted/30 border border-border/80 relative my-2 flex items-center justify-center shadow-inner"
			>
				<img
					src={zoomedProduct.image.includes("w=300")
						? zoomedProduct.image.replace("w=300", "w=800")
						: zoomedProduct.image}
					alt={zoomedProduct.name}
					class="size-full object-cover aspect-square transition-transform"
				/>
			</div>

			<Dialog.Footer
				class="flex flex-row items-center justify-between gap-2 pt-1 sm:justify-between"
			>
				<div class="text-xs text-muted-foreground font-mono">
					{t("cashier.stockAvailable", {
						count: zoomedProduct.stock,
					})}
				</div>
				<div class="flex items-center gap-2">
					<Button.Root
						type="button"
						size="sm"
						onclick={() => {
							if (zoomedProduct) addToCart(zoomedProduct);
							isZoomModalOpen = false;
						}}
						class="h-8 px-3 text-xs font-semibold bg-primary text-white hover:bg-primary/90 cursor-pointer gap-1.5"
					>
						<PlusIcon class="size-3.5" />
						<span>{t("cashier.addToCart")}</span>
					</Button.Root>
				</div>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
