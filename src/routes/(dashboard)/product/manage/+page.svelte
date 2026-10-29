<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import {
		DataTable,
		ConfirmDialog,
		type DataTableColumn,
	} from "$lib/components/common/index.js";
	import { t } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";
	import type { ProductRecord, ProductStatus } from "$lib/types/index.js";

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
	import PackageIcon from "@lucide/svelte/icons/package";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import LayersIcon from "@lucide/svelte/icons/layers";

	// Initial mock dataset matching user specifications
	let products = $state<ProductRecord[]>([
		{
			id: "prd-1",
			name: "Apple iPhone 15 Pro Max",
			sku: "APL-IP15PM",
			image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=150&auto=format&fit=crop&q=80",
			category: "Gadgets & Electronics",
			merk: "Apple",
			warehouse: "Warehouse A - Central Jakarta",
			stock: 120,
			price: 21999000,
			status: "active",
			createdAt: "18/02/2026",
			variants: [
				{
					id: "var-1-1",
					name: "Natural Titanium - 256GB",
					sku: "APL-IP15PM-NT-256",
					image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=150&auto=format&fit=crop&q=80",
					stock: 45,
					price: 21999000,
					status: "active",
				},
				{
					id: "var-1-2",
					name: "Blue Titanium - 512GB",
					sku: "APL-IP15PM-BL-512",
					image: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=150&auto=format&fit=crop&q=80",
					stock: 35,
					price: 25999000,
					status: "active",
				},
				{
					id: "var-1-3",
					name: "Black Titanium - 1TB",
					sku: "APL-IP15PM-BK-1TB",
					image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=150&auto=format&fit=crop&q=80",
					stock: 40,
					price: 29999000,
					status: "active",
				},
			],
		},
		{
			id: "prd-2",
			name: "Samsung Galaxy S24 Ultra",
			sku: "SSG-S24U",
			image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&auto=format&fit=crop&q=80",
			category: "Gadgets & Electronics",
			merk: "Samsung",
			warehouse: "Warehouse B - East Surabaya",
			stock: 85,
			price: 20499000,
			status: "active",
			createdAt: "20/02/2026",
			variants: [
				{
					id: "var-2-1",
					name: "Titanium Gray - 256GB",
					sku: "SSG-S24U-GR-256",
					image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&auto=format&fit=crop&q=80",
					stock: 30,
					price: 20499000,
					status: "active",
				},
				{
					id: "var-2-2",
					name: "Titanium Violet - 512GB",
					sku: "SSG-S24U-VT-512",
					image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=150&auto=format&fit=crop&q=80",
					stock: 35,
					price: 22999000,
					status: "active",
				},
				{
					id: "var-2-3",
					name: "Titanium Black - 512GB",
					sku: "SSG-S24U-BK-512",
					image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop&q=80",
					stock: 20,
					price: 22999000,
					status: "active",
				},
			],
		},
		{
			id: "prd-3",
			name: "Sony WH-1000XM5 Wireless Headphones",
			sku: "SNY-WHXM5",
			image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80",
			category: "Audio & Wearables",
			merk: "Sony",
			warehouse: "Warehouse A - Central Jakarta",
			stock: 64,
			price: 5499000,
			status: "active",
			createdAt: "15/01/2026",
			variants: [
				{
					id: "var-3-1",
					name: "Midnight Black",
					sku: "SNY-WHXM5-BLK",
					image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80",
					stock: 34,
					price: 5499000,
					status: "active",
				},
				{
					id: "var-3-2",
					name: "Silver Platinum",
					sku: "SNY-WHXM5-SLV",
					image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=150&auto=format&fit=crop&q=80",
					stock: 30,
					price: 5499000,
					status: "active",
				},
			],
		},
		{
			id: "prd-4",
			name: "Nike Air Jordan 1 Retro High OG",
			sku: "NKE-AJ1-HIGH",
			image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
			category: "Fashion & Footwear",
			merk: "Nike",
			warehouse: "Warehouse C - West Bandung",
			stock: 110,
			price: 2899000,
			status: "active",
			createdAt: "10/03/2026",
			variants: [
				{
					id: "var-4-1",
					name: "Chicago Red - Size 41",
					sku: "NKE-AJ1-CHI-41",
					image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
					stock: 25,
					price: 2899000,
					status: "active",
				},
				{
					id: "var-4-2",
					name: "Chicago Red - Size 42",
					sku: "NKE-AJ1-CHI-42",
					image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
					stock: 35,
					price: 2899000,
					status: "active",
				},
				{
					id: "var-4-3",
					name: "Shadow Grey - Size 42",
					sku: "NKE-AJ1-SHA-42",
					image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150&auto=format&fit=crop&q=80",
					stock: 25,
					price: 2799000,
					status: "active",
				},
				{
					id: "var-4-4",
					name: "Shadow Grey - Size 43",
					sku: "NKE-AJ1-SHA-43",
					image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150&auto=format&fit=crop&q=80",
					stock: 25,
					price: 2799000,
					status: "active",
				},
			],
		},
		{
			id: "prd-5",
			name: "Logitech MX Master 3S Wireless Mouse",
			sku: "LOG-MXM3S",
			image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&auto=format&fit=crop&q=80",
			category: "Computers & Accessories",
			merk: "Logitech",
			warehouse: "Warehouse D - Semarang Hub",
			stock: 90,
			price: 1549000,
			status: "active",
			createdAt: "22/01/2026",
			variants: [
				{
					id: "var-5-1",
					name: "Graphite Black",
					sku: "LOG-MXM3S-GRP",
					image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&auto=format&fit=crop&q=80",
					stock: 50,
					price: 1549000,
					status: "active",
				},
				{
					id: "var-5-2",
					name: "Pale Gray",
					sku: "LOG-MXM3S-PGR",
					image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=80",
					stock: 40,
					price: 1549000,
					status: "active",
				},
			],
		},
		{
			id: "prd-6",
			name: "Asus ROG Zephyrus G16 Gaming Laptop",
			sku: "ASU-G16-ROG",
			image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&auto=format&fit=crop&q=80",
			category: "Computers & Accessories",
			merk: "Asus",
			warehouse: "Warehouse A - Central Jakarta",
			stock: 24,
			price: 34999000,
			status: "active",
			createdAt: "14/02/2026",
			variants: [
				{
					id: "var-6-1",
					name: "Eclipse Gray - RTX 4070",
					sku: "ASU-G16-RTX4070",
					image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&auto=format&fit=crop&q=80",
					stock: 14,
					price: 34999000,
					status: "active",
				},
				{
					id: "var-6-2",
					name: "Platinum White - RTX 4080",
					sku: "ASU-G16-RTX4080",
					image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=150&auto=format&fit=crop&q=80",
					stock: 10,
					price: 42999000,
					status: "active",
				},
			],
		},
		{
			id: "prd-7",
			name: "Xiaomi Robot Vacuum X20+",
			sku: "XMI-VACX20",
			image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80",
			category: "Home Appliances",
			merk: "Xiaomi",
			warehouse: "Warehouse B - East Surabaya",
			stock: 40,
			price: 5899000,
			status: "disable",
			createdAt: "01/02/2026",
			variants: [
				{
					id: "var-7-1",
					name: "Standard White All-In-One",
					sku: "XMI-VACX20-WHT",
					image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80",
					stock: 40,
					price: 5899000,
					status: "disable",
				},
			],
		},
		{
			id: "prd-8",
			name: "Apple MacBook Air 13 M3",
			sku: "APL-MBA-M3",
			image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&auto=format&fit=crop&q=80",
			category: "Computers & Accessories",
			merk: "Apple",
			warehouse: "Warehouse A - Central Jakarta",
			stock: 75,
			price: 19999000,
			status: "active",
			createdAt: "25/02/2026",
			variants: [
				{
					id: "var-8-1",
					name: "Midnight - 16GB/512GB",
					sku: "APL-MBAM3-MID",
					image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&auto=format&fit=crop&q=80",
					stock: 40,
					price: 19999000,
					status: "active",
				},
				{
					id: "var-8-2",
					name: "Starlight - 16GB/512GB",
					sku: "APL-MBAM3-STA",
					image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=150&auto=format&fit=crop&q=80",
					stock: 35,
					price: 19999000,
					status: "active",
				},
			],
		},
		{
			id: "prd-9",
			name: "Adidas Ultraboost Light Running Shoes",
			sku: "ADS-UB-LGT",
			image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=150&auto=format&fit=crop&q=80",
			category: "Fashion & Footwear",
			merk: "Adidas",
			warehouse: "Warehouse C - West Bandung",
			stock: 95,
			price: 2499000,
			status: "active",
			createdAt: "05/01/2026",
			variants: [
				{
					id: "var-9-1",
					name: "Core Black - Size 41",
					sku: "ADS-UB-BLK-41",
					image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=150&auto=format&fit=crop&q=80",
					stock: 30,
					price: 2499000,
					status: "active",
				},
				{
					id: "var-9-2",
					name: "Core Black - Size 42",
					sku: "ADS-UB-BLK-42",
					image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=150&auto=format&fit=crop&q=80",
					stock: 35,
					price: 2499000,
					status: "active",
				},
				{
					id: "var-9-3",
					name: "Cloud White - Size 42",
					sku: "ADS-UB-WHT-42",
					image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=150&auto=format&fit=crop&q=80",
					stock: 30,
					price: 2499000,
					status: "active",
				},
			],
		},
		{
			id: "prd-10",
			name: "Dyson V12 Detect Slim Fluffy Cordless",
			sku: "DYS-V12-SLM",
			image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=150&auto=format&fit=crop&q=80",
			category: "Home Appliances",
			merk: "Dyson",
			warehouse: "Warehouse A - Central Jakarta",
			stock: 18,
			price: 11999000,
			status: "active",
			createdAt: "12/03/2026",
			variants: [
				{
					id: "var-10-1",
					name: "Yellow / Iron / Nickel",
					sku: "DYS-V12-NIC",
					image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=150&auto=format&fit=crop&q=80",
					stock: 18,
					price: 11999000,
					status: "active",
				},
			],
		},
		{
			id: "prd-11",
			name: "Sony PlayStation 5 Slim Console",
			sku: "SNY-PS5-SLM",
			image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=150&auto=format&fit=crop&q=80",
			category: "Gadgets & Electronics",
			merk: "Sony",
			warehouse: "Warehouse A - Central Jakarta",
			stock: 50,
			price: 7999000,
			status: "active",
			createdAt: "08/02/2026",
			variants: [
				{
					id: "var-11-1",
					name: "Digital Edition 1TB",
					sku: "SNY-PS5-DIG",
					image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=150&auto=format&fit=crop&q=80",
					stock: 20,
					price: 7999000,
					status: "active",
				},
				{
					id: "var-11-2",
					name: "Ultra HD Blu-ray Disc Edition",
					sku: "SNY-PS5-DSC",
					image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=150&auto=format&fit=crop&q=80",
					stock: 30,
					price: 9299000,
					status: "active",
				},
			],
		},
		{
			id: "prd-12",
			name: "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
			sku: "KEY-Q1-PRO",
			image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=150&auto=format&fit=crop&q=80",
			category: "Computers & Accessories",
			merk: "Keychron",
			warehouse: "Warehouse D - Semarang Hub",
			stock: 32,
			price: 3199000,
			status: "disable",
			createdAt: "19/01/2026",
			variants: [
				{
					id: "var-12-1",
					name: "Carbon Black - Banana Switch",
					sku: "KEY-Q1P-BAN",
					image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=150&auto=format&fit=crop&q=80",
					stock: 18,
					price: 3199000,
					status: "disable",
				},
				{
					id: "var-12-2",
					name: "Silver Grey - Red Switch",
					sku: "KEY-Q1P-RED",
					image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80",
					stock: 14,
					price: 3199000,
					status: "disable",
				},
			],
		},
	]);

	// Filter, Sort & Pagination states
	let searchQuery = $state("");
	let selectedCategory = $state("all");
	let selectedMerk = $state("all");
	let selectedWarehouse = $state("all");
	let sortKey = $state<string | null>(null);
	let sortDirection = $state<"asc" | "desc" | "none">("none");
	let currentPage = $state(1);
	let pageSize = $state(10); // Minimum 10 per page as specified

	// Selection, Expandable Rows & Dialog states
	let selectedIds = $state<(string | number)[]>([]);
	let expandedIds = $state<(string | number)[]>([]);
	let selectedProduct = $state<ProductRecord | null>(null);
	let productToDelete = $state<ProductRecord | null>(null);

	let isDetailModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isBulkDeleteModalOpen = $state(false);
	let toastMessage = $state<string | null>(null);

	// Edit form states
	let formName = $state("");
	let formSku = $state("");
	let formCategory = $state("");
	let formMerk = $state("");
	let formWarehouse = $state("");
	let formStock = $state(0);
	let formStatus = $state<ProductStatus>("active");

	// Filter options
	const categoryOptions = [
		"Gadgets & Electronics",
		"Audio & Wearables",
		"Fashion & Footwear",
		"Computers & Accessories",
		"Home Appliances",
	];

	const merkOptions = [
		"Apple",
		"Samsung",
		"Sony",
		"Nike",
		"Logitech",
		"Asus",
		"Xiaomi",
		"Adidas",
		"Dyson",
		"Keychron",
	];

	const warehouseOptions = [
		"Warehouse A - Central Jakarta",
		"Warehouse B - East Surabaya",
		"Warehouse C - West Bandung",
		"Warehouse D - Semarang Hub",
	];

	const categoryFilterItems = $derived([
		{ value: "all", label: t("product.manage.filterCategory") },
		...categoryOptions.map((c) => ({ value: c, label: c })),
	]);

	const merkFilterItems = $derived([
		{ value: "all", label: t("product.manage.filterMerk") },
		...merkOptions.map((m) => ({ value: m, label: m })),
	]);

	const warehouseFilterItems = $derived([
		{ value: "all", label: t("product.manage.filterWarehouse") },
		...warehouseOptions.map((w) => ({ value: w, label: w })),
	]);

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
		selectedCategory;
		selectedMerk;
		selectedWarehouse;
		currentPage = 1;
		selectedIds = [];
	});

	// Table Columns configuration (Sorting on Name and CreatedAt)
	const columns = $derived<DataTableColumn<ProductRecord>[]>([
		{
			id: "name",
			header: t("product.manage.colProduct"),
			sortable: true,
		},
		{
			id: "stock",
			header: t("product.manage.colStock"),
			align: "center",
		},
		{
			id: "status",
			header: t("product.manage.colStatus"),
			align: "center",
		},
		{
			id: "createdAt",
			header: t("product.manage.colCreatedAt"),
			sortable: true,
			accessorFn: (row: ProductRecord) => parseDate(row.createdAt),
		},
		{
			id: "actions",
			header: t("product.manage.colActions"),
			align: "right",
		},
	]);

	// Filtered products based on search (name, sku), category, merk, warehouse
	const filteredProducts = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();

		return products.filter((item) => {
			const matchSearch =
				!q ||
				item.name.toLowerCase().includes(q) ||
				item.sku.toLowerCase().includes(q);

			const matchCategory =
				selectedCategory === "all" ||
				item.category.toLowerCase() === selectedCategory.toLowerCase();

			const matchMerk =
				selectedMerk === "all" ||
				item.merk.toLowerCase() === selectedMerk.toLowerCase();

			const matchWarehouse =
				selectedWarehouse === "all" ||
				item.warehouse.toLowerCase() ===
					selectedWarehouse.toLowerCase();

			return matchSearch && matchCategory && matchMerk && matchWarehouse;
		});
	});

	function resetFilters() {
		searchQuery = "";
		selectedCategory = "all";
		selectedMerk = "all";
		selectedWarehouse = "all";
		sortKey = null;
		sortDirection = "none";
		showToast(t("product.manage.resetFiltersNotice"));
	}

	// Status Toggle
	function toggleProductStatus(productId: string, active: boolean) {
		const newStatus: ProductStatus = active ? "active" : "disable";
		products = products.map((p) =>
			p.id === productId ? { ...p, status: newStatus } : p,
		);
		const prod = products.find((p) => p.id === productId);
		const statusLabel = active
			? t("product.manage.statusActive")
			: t("product.manage.statusDisable");
		showToast(
			`${prod?.name ?? "Product"} ${t("product.manage.statusChangedTo")} ${statusLabel}`,
		);
	}

	function toggleRowExpanded(productId: string) {
		if (expandedIds.includes(productId)) {
			expandedIds = expandedIds.filter((id) => id !== productId);
		} else {
			expandedIds = [...expandedIds, productId];
		}
	}

	// Action Handlers
	function openDetail(product: ProductRecord) {
		selectedProduct = product;
		isDetailModalOpen = true;
	}

	function openEdit(product: ProductRecord) {
		selectedProduct = product;
		formName = product.name;
		formSku = product.sku;
		formCategory = product.category;
		formMerk = product.merk;
		formWarehouse = product.warehouse;
		formStock = product.stock;
		formStatus = product.status;
		isEditModalOpen = true;
	}

	function handleSaveEdit() {
		if (!selectedProduct) return;
		if (!formName.trim() || !formSku.trim()) {
			showToast(t("product.manage.nameSkuRequired"));
			return;
		}

		products = products.map((p) =>
			p.id === selectedProduct?.id
				? {
						...p,
						name: formName.trim(),
						sku: formSku.trim().toUpperCase(),
						category: formCategory,
						merk: formMerk,
						warehouse: formWarehouse,
						stock: Number(formStock) || 0,
						status: formStatus,
					}
				: p,
		);

		isEditModalOpen = false;
		showToast(t("product.manage.productUpdated", { name: formName }));
	}

	function handleOpenDelete(product: ProductRecord) {
		productToDelete = product;
		isDeleteModalOpen = true;
	}

	function handleConfirmDelete() {
		if (!productToDelete) return;
		const deletedName = productToDelete.name;
		products = products.filter((p) => p.id !== productToDelete?.id);
		selectedIds = selectedIds.filter((id) => id !== productToDelete?.id);
		expandedIds = expandedIds.filter((id) => id !== productToDelete?.id);
		showToast(t("product.manage.productDeleted", { name: deletedName }));
		isDeleteModalOpen = false;
		productToDelete = null;
	}

	function handleOpenBulkDelete(ids?: (string | number)[]) {
		if (ids && ids.length > 0) selectedIds = ids;
		if (selectedIds.length === 0) return;
		isBulkDeleteModalOpen = true;
	}

	function handleConfirmBulkDelete() {
		const count = selectedIds.length;
		products = products.filter((p) => !selectedIds.includes(p.id));
		expandedIds = expandedIds.filter((id) => !selectedIds.includes(id));
		selectedIds = [];
		isBulkDeleteModalOpen = false;
		showToast(t("product.manage.bulkProductsDeleted", { count }));
	}
</script>

<svelte:head>
	<title>{t("product.manage.title")} | Cronsyst</title>
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
	<!-- Catatan: tombol create mengarah ke page : product/manage/create sehingga bukan dialog -->
	<div
		class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h1
				class="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
			>
				{t("product.manage.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1.5">
				{t("product.manage.subtitle")}
			</p>
		</div>

		<div>
			<a
				href="/product/manage/create"
				class={cn(
					buttonVariants({ variant: "default", size: "default" }),
					"h-10 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer",
				)}
			>
				<PlusIcon class="size-4" />
				<span>{t("product.manage.createBtn")}</span>
			</a>
		</div>
	</div>

	<!-- Search & Filters Container [search kolom (name, sku) - width full, filter berdasar category, filter berdasar merk, filter berdasar gudang, tombol reset] (full size) -->
	<div class="w-full space-y-3">
		<div class="flex flex-col gap-3 lg:flex-row lg:items-center">
			<!-- Search Column (name, sku) - full width -->
			<div class="relative flex-1">
				<SearchIcon
					class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10"
				/>
				<Input
					type="text"
					role="searchbox"
					bind:value={searchQuery}
					placeholder={t("product.manage.searchPlaceholder")}
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

			<!-- Filter by Category -->
			<div class="w-full sm:w-52">
				<Select.Root
					type="single"
					bind:value={selectedCategory}
					items={categoryFilterItems}
				>
					<Select.Trigger
						class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/60 transition-colors"
					>
						<Select.Value
							placeholder={t("product.manage.filterCategory")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each categoryFilterItems as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Filter by Merk -->
			<div class="w-full sm:w-44">
				<Select.Root
					type="single"
					bind:value={selectedMerk}
					items={merkFilterItems}
				>
					<Select.Trigger
						class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/60 transition-colors"
					>
						<Select.Value
							placeholder={t("product.manage.filterMerk")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each merkFilterItems as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Filter by Warehouse (Gudang) -->
			<div class="w-full sm:w-56">
				<Select.Root
					type="single"
					bind:value={selectedWarehouse}
					items={warehouseFilterItems}
				>
					<Select.Trigger
						class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/60 transition-colors"
					>
						<Select.Value
							placeholder={t("product.manage.filterWarehouse")}
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
				variant="outline"
				onclick={resetFilters}
				class="h-10 gap-1.5 rounded-lg border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold text-foreground hover:bg-slate-50 dark:hover:bg-muted hover:text-foreground shadow-xs cursor-pointer shrink-0 transition-colors group/reset"
				title="Reset all filters"
			>
				<RotateCcwIcon
					class="size-3.5 text-muted-foreground group-hover/reset:text-foreground transition-colors"
				/>
				<span>{t("product.manage.reset")}</span>
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

	<!-- Product Management Table Card (DataTable with Pagination min 10 & Sorting on Name and CreatedAt & Collapsible Row) -->
	<DataTable
		data={filteredProducts}
		{columns}
		bind:page={currentPage}
		bind:perPage={pageSize}
		perPageOptions={[10, 20, 50, 100]}
		bind:sortKey
		bind:sortDirection
		emptyMessage={t("product.manage.emptyState")}
		emptyIcon={PackageIcon}
		selectable={true}
		bind:selectedIds
		bind:expandedIds
		onBulkDelete={handleOpenBulkDelete}
	>
		{#snippet cell({
			item,
			column,
		}: {
			item: ProductRecord;
			column: DataTableColumn<ProductRecord>;
		})}
			{#if column.id === "name"}
				<!-- Product: (gambar product, nama produk, sku) + collapsible button for variant -->
				<div class="flex items-center gap-3">
					<!-- Collapsible trigger for product variants -->
					{#if item.variants && item.variants.length > 0}
						<Button.Root
							variant="ghost"
							type="button"
							onclick={(e) => {
								e.stopPropagation();
								toggleRowExpanded(item.id);
							}}
							size="icon"
							class="flex size-7 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
							title={expandedIds.includes(item.id)
								? t("product.manage.toggleVariantsClose")
								: t("product.manage.toggleVariantsOpen")}
							aria-label="Toggle product variants"
						>
							{#if expandedIds.includes(item.id)}
								<ChevronDownIcon class="size-4 text-primary" />
							{:else}
								<ChevronRightIcon class="size-4" />
							{/if}
						</Button.Root>
					{:else}
						<div class="size-7 shrink-0"></div>
					{/if}

					<!-- Product Image -->
					<div
						class="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted/40 shadow-xs"
					>
						<img
							src={item.image}
							alt={item.name}
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					</div>

					<!-- Product Name, SKU, Category & Variants Badge -->
					<div class="flex flex-col min-w-0">
						<button
							type="button"
							class="text-left text-xs font-semibold text-foreground truncate max-w-xs sm:max-w-md hover:text-primary transition-colors cursor-pointer"
							onclick={() => openDetail(item)}
						>
							{item.name}
						</button>
						<div class="flex flex-wrap items-center gap-2 mt-0.5">
							<span
								class="font-mono text-[11px] text-muted-foreground"
							>
								{item.sku}
							</span>
							<span class="text-[10px] text-muted-foreground/60"
								>•</span
							>
							<span
								class="text-[11px] text-muted-foreground font-medium"
							>
								{item.merk}
							</span>
							{#if item.variants && item.variants.length > 0}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
								>
									<LayersIcon class="size-2.5" />
									{t("product.manage.variantsCount", {
										count: item.variants.length,
									})}
								</span>
							{/if}
						</div>
					</div>
				</div>
			{:else if column.id === "stock"}
				<!-- Stok: e.g. 100 -->
				<span
					class="font-mono text-xs font-bold text-foreground bg-slate-100 dark:bg-muted/70 px-2.5 py-1 rounded-md shadow-xs"
				>
					{item.stock}
				</span>
			{:else if column.id === "status"}
				<!-- Status: Switch Button - Active / Disable -->
				<div class="flex items-center justify-center gap-2">
					<Switch
						checked={item.status === "active"}
						onCheckedChange={(checked: boolean) =>
							toggleProductStatus(item.id, checked)}
						size="sm"
						aria-label="Toggle product status"
					/>
				</div>
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
						aria-label="Product actions"
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
							<span>{t("product.manage.actionDetail")}</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => openEdit(item)}
							class="cursor-pointer gap-2 text-xs py-1.5"
						>
							<PencilIcon
								class="size-3.5 text-muted-foreground"
							/>
							<span>{t("product.manage.actionEdit")}</span>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							onclick={() => handleOpenDelete(item)}
							class="cursor-pointer gap-2 text-xs py-1.5 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
						>
							<Trash2Icon class="size-3.5" />
							<span>{t("product.manage.actionDelete")}</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		{/snippet}

		<!-- Collapsible Nested Variant Row -->
		{#snippet expandedRowSnippet({ item }: { item: ProductRecord })}
			<div
				class="p-4 sm:p-5 border-y border-border/70 animate-in fade-in slide-in-from-top-1 duration-200"
			>
				<div class="flex items-center gap-2 mb-3">
					<div
						class="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary"
					>
						<LayersIcon class="size-3.5" />
					</div>
					<h4
						class="text-xs font-bold text-foreground tracking-wider"
					>
						{t("product.manage.variantsTitle", {
							count: item.variants?.length ?? 0,
						})}
					</h4>
				</div>

				{#if item.variants && item.variants.length > 0}
					<div
						class="overflow-hidden rounded-lg border border-border/80 bg-white dark:bg-card shadow-xs"
					>
						<table class="w-full text-xs">
							<thead>
								<tr
									class="border-b border-border/70 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase"
								>
									<th class="py-2.5 px-4 text-left">
										{t("product.manage.variant")}
									</th>
									<th class="py-2.5 px-4 text-right">
										{t("product.manage.variantPrice")}
									</th>
									<th class="py-2.5 px-4 text-center">
										{t("product.manage.variantStock")}
									</th>
								</tr>
							</thead>
							<tbody
								class="divide-y divide-border/50 font-normal"
							>
								{#each item.variants as variant}
									<tr
										class="hover:bg-muted/30 transition-colors"
									>
										<!-- Variant: Gambar Variant, Nama Variant, Sku Variant -->
										<td class="py-2.5 px-4">
											<div
												class="flex items-center gap-3"
											>
												<div
													class="relative size-10 shrink-0 overflow-hidden rounded-md border border-border/70 bg-muted/30 shadow-2xs"
												>
													<img
														src={variant.image ||
															item.image}
														alt={variant.name}
														class="h-full w-full object-cover"
														loading="lazy"
													/>
												</div>
												<div
													class="flex flex-col min-w-0"
												>
													<span
														class="font-semibold text-xs text-foreground truncate"
													>
														{variant.name}
													</span>
													<span
														class="font-mono text-[11px] text-muted-foreground"
													>
														{variant.sku}
													</span>
												</div>
											</div>
										</td>
										<!-- Price: harga idr -->
										<td
											class="py-2.5 px-4 text-right font-medium font-mono text-foreground"
										>
											{formatRupiah(variant.price)}
										</td>
										<!-- Stock: 20 -->
										<td class="py-2.5 px-4 text-center">
											<span
												class="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 font-mono text-xs font-semibold text-foreground"
											>
												{variant.stock}
											</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="text-xs text-muted-foreground italic">
						{t("product.manage.noVariantsFound")}
					</p>
				{/if}
			</div>
		{/snippet}
	</DataTable>
</div>

<!-- Modal 1: Detail Product -->
<Dialog.Root bind:open={isDetailModalOpen}>
	<Dialog.Content class="sm:max-w-xl">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("product.manage.detailProductTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("product.manage.detailProductDesc")}
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedProduct}
			<div class="space-y-4 py-2 text-xs">
				<div
					class="flex items-center gap-4 p-3.5 rounded-xl border border-border/70 bg-muted/30"
				>
					<img
						src={selectedProduct.image}
						alt={selectedProduct.name}
						class="size-16 rounded-lg object-cover border border-border"
					/>
					<div class="flex-1 min-w-0">
						<h3
							class="font-heading text-sm font-bold text-foreground truncate"
						>
							{selectedProduct.name}
						</h3>
						<p
							class="font-mono text-xs text-muted-foreground mt-0.5"
						>
							SKU: {selectedProduct.sku}
						</p>
						<div class="flex items-center gap-2 mt-1">
							<span
								class="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md"
							>
								{selectedProduct.category}
							</span>
							<span
								class="text-[11px] font-medium text-muted-foreground"
							>
								{t("product.manage.brand")}: {selectedProduct.merk}
							</span>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]">
							{t("product.manage.totalStock")}
						</span>
						<span
							class="font-mono text-sm font-bold text-foreground mt-0.5 block"
						>
							{selectedProduct.stock}
							{t("product.manage.unit")}
						</span>
					</div>

					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]">
							{t("product.manage.colStatus")}
						</span>
						<span
							class={cn(
								"inline-flex items-center gap-1.5 mt-1 font-semibold text-xs",
								selectedProduct.status === "active"
									? "text-emerald-600 dark:text-emerald-400"
									: "text-muted-foreground",
							)}
						>
							<span
								class={cn(
									"size-2 rounded-full",
									selectedProduct.status === "active"
										? "bg-emerald-500"
										: "bg-slate-400",
								)}
							></span>
							{selectedProduct.status === "active"
								? t("product.manage.statusActive")
								: t("product.manage.statusDisable")}
						</span>
					</div>

					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]">
							{t("product.manage.basePrice")}
						</span>
						<span
							class="font-mono text-xs font-semibold text-foreground mt-1 block"
						>
							{formatRupiah(selectedProduct.price)}
						</span>
					</div>

					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]">
							{t("product.manage.colCreatedAt")}
						</span>
						<span
							class="font-mono text-xs text-foreground mt-1 block font-medium"
						>
							{selectedProduct.createdAt}
						</span>
					</div>
				</div>

				<div class="p-3 rounded-lg border border-border/60 bg-card">
					<span class="text-muted-foreground block text-[11px]">
						{t("product.manage.storageWarehouse")}
					</span>
					<span class="font-medium text-foreground mt-0.5 block">
						{selectedProduct.warehouse}
					</span>
				</div>

				<!-- Variants in Detail Dialog -->
				{#if selectedProduct.variants && selectedProduct.variants.length > 0}
					<div class="space-y-2">
						<h4
							class="font-bold text-xs text-foreground uppercase tracking-wider"
						>
							{t("product.manage.variantsList", {
								count: selectedProduct.variants.length,
							})}
						</h4>
						<div
							class="max-h-56 overflow-y-auto rounded-lg border border-border"
						>
							<table class="w-full text-xs">
								<thead>
									<tr
										class="bg-muted/50 border-b border-border text-[11px] text-muted-foreground"
									>
										<th class="py-2.5 px-3 text-left"
											>{t("product.manage.variant")}</th
										>
										<th class="py-2.5 px-3 text-right"
											>{t(
												"product.manage.variantPrice",
											)}</th
										>
										<th class="py-2.5 px-3 text-center"
											>{t(
												"product.manage.variantStock",
											)}</th
										>
									</tr>
								</thead>
								<tbody
									class="divide-y divide-border font-normal"
								>
									{#each selectedProduct.variants as v}
										<tr class="hover:bg-muted/20">
											<td class="py-2 px-3">
												<div
													class="flex items-center gap-2.5"
												>
													<img
														src={v.image ||
															selectedProduct.image}
														alt={v.name}
														class="size-8 rounded-md object-cover border border-border shrink-0"
													/>
													<div
														class="flex flex-col min-w-0"
													>
														<span
															class="font-semibold text-foreground truncate"
															>{v.name}</span
														>
														<span
															class="font-mono text-[10px] text-muted-foreground"
															>{v.sku}</span
														>
													</div>
												</div>
											</td>
											<td
												class="py-2 px-3 text-right font-medium font-mono"
											>
												{formatRupiah(v.price)}
											</td>
											<td
												class="py-2 px-3 text-center font-mono"
											>
												<span
													class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold"
												>
													{v.stock}
												</span>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
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

<!-- Modal 2: Edit Product -->
<Dialog.Root bind:open={isEditModalOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("product.manage.editProductTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("product.manage.editProductDesc")}
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedProduct}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSaveEdit();
				}}
				class="space-y-3.5 py-2 text-xs"
			>
				<div class="space-y-1">
					<Label for="edit-prod-name" class="text-xs font-semibold"
						>{t("product.manage.productName")}</Label
					>
					<Input
						id="edit-prod-name"
						type="text"
						bind:value={formName}
						class="h-9 text-xs"
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<Label for="edit-prod-sku" class="text-xs font-semibold"
							>{t("product.manage.productSku")}</Label
						>
						<Input
							id="edit-prod-sku"
							type="text"
							bind:value={formSku}
							class="h-9 text-xs font-mono uppercase"
							required
						/>
					</div>

					<div class="space-y-1">
						<Label
							for="edit-prod-stock"
							class="text-xs font-semibold"
							>{t("product.manage.colStock")}</Label
						>
						<Input
							id="edit-prod-stock"
							type="number"
							min="0"
							bind:value={formStock}
							class="h-9 text-xs font-mono"
							required
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<Label class="text-xs font-semibold"
							>{t("product.manage.category")}</Label
						>
						<select
							bind:value={formCategory}
							class="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"
						>
							{#each categoryOptions as cat}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-1">
						<Label class="text-xs font-semibold"
							>{t("product.manage.brand")}</Label
						>
						<select
							bind:value={formMerk}
							class="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"
						>
							{#each merkOptions as mrk}
								<option value={mrk}>{mrk}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="space-y-1">
					<Label class="text-xs font-semibold"
						>{t("product.manage.warehouse")}</Label
					>
					<select
						bind:value={formWarehouse}
						class="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"
					>
						{#each warehouseOptions as wh}
							<option value={wh}>{wh}</option>
						{/each}
					</select>
				</div>

				<div
					class="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20"
				>
					<div>
						<span
							class="text-xs font-semibold text-foreground block"
							>{t("product.manage.colStatus")}</span
						>
						<span class="text-[11px] text-muted-foreground"
							>{t("product.manage.activateProductNotice")}</span
						>
					</div>
					<Switch
						checked={formStatus === "active"}
						onCheckedChange={(checked: boolean) =>
							(formStatus = checked ? "active" : "disable")}
					/>
				</div>

				<Dialog.Footer class="pt-4 gap-2">
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

<!-- Modal 3: Delete Confirmation (Single & Bulk) -->
<ConfirmDialog
	bind:open={isDeleteModalOpen}
	title={t("product.manage.deleteTitle")}
	description={t("product.manage.deleteDesc")}
	variant="danger"
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmDelete}
>
	{#if productToDelete}
		<p>
			{t("product.manage.deleteConfirmSingleQuestion")}
			<strong class="text-red-600 dark:text-red-400 font-bold">
				{productToDelete.name} ({productToDelete.sku})
			</strong>?
		</p>
		<p class="text-xs text-muted-foreground">
			{t("product.manage.deleteConfirmSingleWarning")}
		</p>
	{/if}
</ConfirmDialog>

<ConfirmDialog
	bind:open={isBulkDeleteModalOpen}
	title={t("product.manage.deleteBulkTitle", { count: selectedIds.length })}
	description={t("product.manage.deleteBulkDesc")}
	variant="danger"
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmBulkDelete}
>
	<p>
		{t("product.manage.deleteConfirmBulkQuestion", {
			count: selectedIds.length,
		})}
	</p>
	<p class="text-xs text-muted-foreground">
		{t("product.manage.deleteConfirmBulkWarn")}
	</p>
</ConfirmDialog>
