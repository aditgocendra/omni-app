<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { t } from "$lib/i18n/index.js";
	import { goto } from "$app/navigation";
	import { onMount, onDestroy, untrack } from "svelte";
	import type { ProductStatus, ProductVariant } from "$lib/types/index.js";

	import PlusIcon from "@lucide/svelte/icons/plus";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import CheckIcon from "@lucide/svelte/icons/check";
	import ImagePlusIcon from "@lucide/svelte/icons/image-plus";
	import PackageIcon from "@lucide/svelte/icons/package";
	import LayersIcon from "@lucide/svelte/icons/layers";
	import WarehouseIcon from "@lucide/svelte/icons/warehouse";
	import UploadCloudIcon from "@lucide/svelte/icons/upload-cloud";
	import StarIcon from "@lucide/svelte/icons/star";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import XIcon from "@lucide/svelte/icons/x";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
	import CheckCheckIcon from "@lucide/svelte/icons/check-check";
	import ScaleIcon from "@lucide/svelte/icons/scale";
	import RulerIcon from "@lucide/svelte/icons/ruler";
	import { CategorySelectDialog } from "$lib/components/common/index.js";

	interface UploadedImage {
		id: string;
		name: string;
		size: number;
		url: string;
		isPrimary: boolean;
	}

	let name = $state("");
	let sku = $state("");
	let category = $state(
		"Beauty & Personal Care > Hand, Foot & Nail Care > Foot Care",
	);
	let isCategoryDialogOpen = $state(false);
	let merk = $state("Apple");
	let warehouse = $state("Warehouse A - Central Jakarta");
	let initialStock = $state(50);
	let price = $state(12999000);
	let description = $state("");
	let status = $state<ProductStatus>("active");
	let imageUrl = $state(
		"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
	);

	// Bulk input states for variants
	let bulkSku = $state("");
	let bulkPrice = $state<number | undefined>(undefined);
	let bulkStock = $state<number | undefined>(undefined);

	// Bulk input states for weight & dimensions
	let bulkWeight = $state<number | undefined>(undefined);
	let bulkLength = $state<number | undefined>(undefined);
	let bulkWidth = $state<number | undefined>(undefined);
	let bulkHeight = $state<number | undefined>(undefined);

	let uploadedImages = $state<UploadedImage[]>([
		{
			id: "img-init-1",
			name: "iPhone-16-Pro-Main.webp",
			size: 1420000,
			url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
			isPrimary: true,
		},
		{
			id: "img-init-2",
			name: "iPhone-16-Pro-Angle.webp",
			size: 1250000,
			url: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80",
			isPrimary: false,
		},
	]);

	let dropzoneElement = $state<HTMLDivElement | null>(null);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let dropzoneInstance: unknown = null;

	let variants = $state<ProductVariant[]>([
		{
			id: "var-new-1",
			name: "Standard - 128GB",
			sku: "",
			skuSuffix: "",
			image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
			stock: 25,
			price: 12999000,
			status: "active",
			weight: 187,
			length: 14.7,
			width: 7.1,
			height: 0.8,
		},
		{
			id: "var-new-2",
			name: "Pro - 256GB",
			sku: "",
			skuSuffix: "",
			image: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80",
			stock: 25,
			price: 14999000,
			status: "active",
			weight: 199,
			length: 14.9,
			width: 7.1,
			height: 0.8,
		},
	]);

	const formattedSkuPrefix = $derived.by(() => {
		const trimmed = sku.trim().toUpperCase();
		if (!trimmed) return "SKU-";
		return trimmed.endsWith("-") ? trimmed : `${trimmed}-`;
	});

	const weightSummary = $derived.by(() => {
		const weights = variants
			.map((v) => v.weight)
			.filter((w): w is number => w != null && !isNaN(w));
		if (weights.length === 0) return "-";
		const min = Math.min(...weights);
		const max = Math.max(...weights);
		return min === max ? `${min} g` : `${min} - ${max} g`;
	});

	const dimensionsSummary = $derived.by(() => {
		const validVariants = variants.filter(
			(v) => v.length && v.width && v.height,
		);
		if (validVariants.length === 0) return "-";
		const first = validVariants[0];
		const isSame = validVariants.every(
			(v) =>
				v.length === first.length &&
				v.width === first.width &&
				v.height === first.height,
		);
		return isSame
			? `${first.length} × ${first.width} × ${first.height} cm`
			: `${validVariants.length} Sizes`;
	});

	let isSubmitting = $state(false);
	let toastMessage = $state<string | null>(null);

	const categories = [
		"Gadgets & Electronics",
		"Audio & Wearables",
		"Fashion & Footwear",
		"Computers & Accessories",
		"Home Appliances",
	];

	const merks = [
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

	const warehouses = [
		"Warehouse A - Central Jakarta",
		"Warehouse B - East Surabaya",
		"Warehouse C - West Bandung",
		"Warehouse D - Semarang Hub",
	];

	const categoryItems = categories.map((cat) => ({ value: cat, label: cat }));
	const merkItems = merks.map((mrk) => ({ value: mrk, label: mrk }));
	const warehouseItems = warehouses.map((wh) => ({ value: wh, label: wh }));

	const imagePresets = [
		{
			label: "Smartphone",
			url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
		},
		{
			label: "Headphones",
			url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
		},
		{
			label: "Sneakers",
			url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
		},
		{
			label: "Laptop",
			url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
		},
	];

	onMount(async () => {
		if (typeof window !== "undefined" && dropzoneElement) {
			try {
				const dropzoneModule = await import("dropzone");
				const DropzoneConstructor =
					dropzoneModule.default || dropzoneModule.Dropzone;
				if (DropzoneConstructor) {
					const dz = new DropzoneConstructor(dropzoneElement, {
						url: "#",
						autoProcessQueue: false,
						createImageThumbnails: false,
						previewsContainer: false,
						maxFilesize: 1024, // 1024 MB
						acceptedFiles: "image/*",
						clickable: true,
						uploadMultiple: true,
					});

					dz.on("addedfile", (file: File) => {
						handleFileUpload(file);
						try {
							// Remove from Dropzone queue to prevent mock network upload
							dz.removeFile(
								file as unknown as import("dropzone").DropzoneFile,
							);
						} catch {
							// ignore
						}
					});

					dropzoneInstance = dz;
				}
			} catch (err) {
				console.error("Failed to initialize Dropzone:", err);
			}
		}
	});

	onDestroy(() => {
		if (
			dropzoneInstance &&
			typeof (dropzoneInstance as { destroy?: () => void }).destroy ===
				"function"
		) {
			(dropzoneInstance as { destroy: () => void }).destroy();
			dropzoneInstance = null;
		}
	});

	function handleFileUpload(file: File) {
		if (!file.type.startsWith("image/")) {
			alert(t("product.create.onlyImages"));
			return;
		}
		const maxSizeBytes = 1024 * 1024 * 1024; // 1024 MB
		if (file.size > maxSizeBytes) {
			alert(t("product.create.fileTooLarge"));
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			if (!result) return;

			const isFirst = uploadedImages.length === 0;
			const newImg: UploadedImage = {
				id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
				name: file.name,
				size: file.size,
				url: result,
				isPrimary: isFirst,
			};

			uploadedImages = [...uploadedImages, newImg];
			if (isFirst || !imageUrl) {
				imageUrl = result;
			}
		};
		reader.readAsDataURL(file);
	}

	function handleManualFileInput(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			Array.from(input.files).forEach((file) => handleFileUpload(file));
		}
		input.value = "";
	}

	function setAsPrimary(id: string) {
		uploadedImages = uploadedImages.map((img) => {
			const isMatch = img.id === id;
			if (isMatch) imageUrl = img.url;
			return { ...img, isPrimary: isMatch };
		});
	}

	function removeUploadedImage(id: string) {
		const toRemove = uploadedImages.find((img) => img.id === id);
		uploadedImages = uploadedImages.filter((img) => img.id !== id);

		if (toRemove?.isPrimary && uploadedImages.length > 0) {
			uploadedImages[0].isPrimary = true;
			imageUrl = uploadedImages[0].url;
		} else if (uploadedImages.length === 0) {
			imageUrl = "";
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function handleVariantImageUpload(variantId: string, event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			alert(t("product.create.onlyImages"));
			return;
		}
		const maxSizeBytes = 1024 * 1024 * 1024; // 1024 MB
		if (file.size > maxSizeBytes) {
			alert(t("product.create.fileTooLarge"));
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			if (!result) return;

			const target = variants.find((v) => v.id === variantId);
			if (target) {
				target.image = result;
			}

			// Add to uploaded images if not already there
			const exists = uploadedImages.some((img) => img.url === result);
			if (!exists) {
				uploadedImages = [
					...uploadedImages,
					{
						id: `img-var-${Date.now()}`,
						name: file.name,
						size: file.size,
						url: result,
						isPrimary: false,
					},
				];
			}
		};
		reader.readAsDataURL(file);
		input.value = "";
	}

	function setVariantImageFromGallery(variantId: string, url: string) {
		const target = variants.find((v) => v.id === variantId);
		if (target) {
			target.image = url;
		}
	}

	function removeVariantImage(variantId: string) {
		const target = variants.find((v) => v.id === variantId);
		if (target) {
			target.image = "";
		}
	}

	function updateVariantSku(variant: ProductVariant) {
		const prefix = sku.trim().toUpperCase();
		const prefixFormatted = prefix
			? prefix.endsWith("-")
				? prefix
				: `${prefix}-`
			: "";
		const suffix = (variant.skuSuffix ?? "").trim().toUpperCase();
		variant.sku =
			prefixFormatted && suffix
				? `${prefixFormatted}${suffix}`
				: suffix || "";
	}

	function handleVariantSuffixInput(variant: ProductVariant, e: Event) {
		const target = e.target as HTMLInputElement;
		variant.skuSuffix = target.value.toUpperCase();
		updateVariantSku(variant);
	}

	function applyAllBulk() {
		const trimmedSuffix = bulkSku.trim().toUpperCase();
		variants.forEach((v, i) => {
			if (trimmedSuffix) {
				v.skuSuffix =
					variants.length > 1
						? `${trimmedSuffix}-${i + 1}`
						: trimmedSuffix;
				updateVariantSku(v);
			}
			if (bulkPrice != null && !isNaN(bulkPrice)) {
				v.price = bulkPrice;
			}
			if (bulkStock != null && !isNaN(bulkStock)) {
				v.stock = bulkStock;
			}
		});
	}

	function applyWeightDimensionsBulk() {
		variants.forEach((v) => {
			if (bulkWeight != null && !isNaN(bulkWeight)) {
				v.weight = bulkWeight;
			}
			if (bulkLength != null && !isNaN(bulkLength)) {
				v.length = bulkLength;
			}
			if (bulkWidth != null && !isNaN(bulkWidth)) {
				v.width = bulkWidth;
			}
			if (bulkHeight != null && !isNaN(bulkHeight)) {
				v.height = bulkHeight;
			}
		});
	}

	function addVariant() {
		const idx = variants.length + 1;
		const prev = variants[variants.length - 1];
		const defaultSuffix = bulkSku.trim()
			? `${bulkSku.trim().toUpperCase()}-${idx}`
			: `V${idx}`;
		const prefix = sku.trim().toUpperCase();
		const prefixFormatted = prefix
			? prefix.endsWith("-")
				? prefix
				: `${prefix}-`
			: "";

		const newVariant: ProductVariant = {
			id: `var-new-${Date.now()}`,
			name: `Model Variant ${idx}`,
			skuSuffix: defaultSuffix,
			sku: prefixFormatted
				? `${prefixFormatted}${defaultSuffix}`
				: defaultSuffix,
			image: imageUrl,
			stock: bulkStock != null && !isNaN(bulkStock) ? bulkStock : 10,
			price:
				bulkPrice != null && !isNaN(bulkPrice)
					? bulkPrice
					: price || 0,
			status: "active",
			weight: bulkWeight ?? prev?.weight ?? 200,
			length: bulkLength ?? prev?.length ?? 15,
			width: bulkWidth ?? prev?.width ?? 7.5,
			height: bulkHeight ?? prev?.height ?? 1,
		};
		variants = [...variants, newVariant];
	}

	function removeVariant(id: string) {
		variants = variants.filter((v) => v.id !== id);
	}

	function formatRupiah(amount?: number): string {
		if (amount == null) return "-";
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	}

	// Synchronize variant SKUs when product SKU prefix changes
	$effect(() => {
		const prefix = sku.trim().toUpperCase();
		const prefixFormatted = prefix
			? prefix.endsWith("-")
				? prefix
				: `${prefix}-`
			: "";
		untrack(() => {
			variants.forEach((v) => {
				const suffix = (v.skuSuffix ?? "").trim().toUpperCase();
				v.sku =
					prefixFormatted && suffix
						? `${prefixFormatted}${suffix}`
						: suffix || "";
			});
		});
	});

	function handleSubmit() {
		if (!name.trim() || !sku.trim()) {
			alert(t("product.create.nameSkuRequired"));
			return;
		}

		// Ensure all variant SKUs have prefix and default suffix if empty
		const prefix = sku.trim().toUpperCase();
		const formattedPrefix = prefix.endsWith("-") ? prefix : `${prefix}-`;
		variants.forEach((v, i) => {
			const suffix =
				(v.skuSuffix ?? "").trim().toUpperCase() || `V${i + 1}`;
			v.skuSuffix = suffix;
			v.sku = `${formattedPrefix}${suffix}`;
		});

		isSubmitting = true;
		toastMessage = t("product.create.savedRedirecting", { name });

		setTimeout(() => {
			goto("/product/manage");
		}, 1200);
	}
</script>

<svelte:head>
	<title>{t("product.create.title")} | Cronsyst</title>
</svelte:head>

<div class="space-y-6 max-w-5xl mx-auto pb-12">
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

	<!-- Header -->
	<div
		class="sticky top-16 z-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 bg-background py-4 transition-all"
	>
		<div>
			<h1
				class="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl"
			>
				{t("product.create.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
				{t("product.create.subtitle")}
			</p>
		</div>

		<div class="flex items-center gap-2.5">
			<a
				href="/product/manage"
				class="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground hover:bg-muted transition-colors"
			>
				{t("common.cancel")}
			</a>
			<Button.Root
				onclick={handleSubmit}
				disabled={isSubmitting}
				class="h-9 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
			>
				<CheckIcon class="size-3.5" />
				<span
					>{isSubmitting
						? t("product.create.saving")
						: t("product.create.saveProduct")}</span
				>
			</Button.Root>
		</div>
	</div>

	<!-- Main Form Content -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left / Main Form (2 cols) -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Section 1: Product Images & Media (Dropzone) -->
			<Card.Root
				class="p-5 rounded-xl border border-border/80 bg-card shadow-xs space-y-4"
			>
				<div
					class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-border/60"
				>
					<div>
						<h2
							class="font-heading text-sm font-bold text-foreground flex items-center gap-2"
						>
							<UploadCloudIcon class="size-4 text-primary" />
							<span>{t("product.create.uploadTitle")}</span>
						</h2>
						<p class="text-[11px] text-muted-foreground mt-0.5">
							{t("product.create.uploadDesc")}
						</p>
					</div>

					<div class="flex flex-wrap items-center gap-1.5">
						<span
							class="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
						>
							{t("product.create.ratioBadge")}
						</span>
						<span
							class="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
						>
							{t("product.create.maxSizeBadge")}
						</span>
					</div>
				</div>

				<!-- Dropzone Box -->
				<div
					bind:this={dropzoneElement}
					class="border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 transition-all rounded-xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group min-h-36"
				>
					<div
						class="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform"
					>
						<UploadCloudIcon class="size-5" />
					</div>
					<div>
						<p class="text-xs font-semibold text-foreground">
							{t("product.create.dropzonePrompt")}
						</p>
						<p class="text-[11px] text-muted-foreground mt-0.5">
							{t("product.create.dropzoneHint")}
						</p>
					</div>

					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							fileInputRef?.click();
						}}
						class="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-foreground hover:bg-muted shadow-2xs transition-colors cursor-pointer"
					>
						<PlusIcon class="size-3.5" />
						<span>{t("product.create.browseFiles")}</span>
					</button>

					<input
						type="file"
						accept="image/*"
						multiple
						class="hidden"
						bind:this={fileInputRef}
						onchange={handleManualFileInput}
					/>
				</div>

				<!-- Uploaded Gallery Grid (1:1 Ratio Square Preview) -->
				{#if uploadedImages.length > 0}
					<div class="space-y-2 pt-2">
						<div class="flex items-center justify-between">
							<span class="text-xs font-semibold text-foreground">
								{t("product.create.totalImagesCount", {
									count: uploadedImages.length,
								})}
							</span>
						</div>

						<div
							class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3"
						>
							{#each uploadedImages as img (img.id)}
								<div
									class="relative aspect-square rounded-xl border border-border/80 bg-background overflow-hidden group shadow-2xs transition-all hover:border-primary/50"
								>
									<img
										src={img.url}
										alt={img.name}
										class="size-full object-cover aspect-square transition-transform group-hover:scale-105"
									/>

									<!-- Primary Badge -->
									{#if img.isPrimary}
										<div
											class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-primary text-white text-[9px] font-bold shadow-xs flex items-center gap-1 z-10"
										>
											<StarIcon
												class="size-2.5 fill-white"
											/>
											<span
												>{t(
													"product.create.primaryCover",
												)}</span
											>
										</div>
									{/if}

									<!-- Hover Overlay Controls -->
									<div
										class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white z-20"
									>
										<div
											class="flex items-center justify-between"
										>
											<span
												class="text-[9px] font-mono opacity-80 truncate max-w-20"
											>
												{formatFileSize(img.size)}
											</span>
											<button
												type="button"
												onclick={(e) => {
													e.stopPropagation();
													removeUploadedImage(img.id);
												}}
												class="size-6 rounded-md bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
												title={t(
													"product.create.removeImage",
												)}
											>
												<Trash2Icon class="size-3" />
											</button>
										</div>

										{#if !img.isPrimary}
											<button
												type="button"
												onclick={(e) => {
													e.stopPropagation();
													setAsPrimary(img.id);
												}}
												class="w-full py-1 px-1.5 rounded bg-primary/90 hover:bg-primary text-[10px] font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
											>
												<StarIcon class="size-2.5" />
												<span
													>{t(
														"product.create.setAsPrimary",
													)}</span
												>
											</button>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</Card.Root>

			<!-- Section 2: General Info -->
			<Card.Root
				class="p-5 rounded-xl border border-border/80 bg-card shadow-xs"
			>
				<h2
					class="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2"
				>
					<PackageIcon class="size-4 text-primary" />
					<span>{t("product.create.generalInfo")}</span>
				</h2>

				<div class="space-y-6 text-xs">
					<div class="space-y-1.5">
						<Label
							for="prod-name"
							class="text-xs font-semibold text-foreground"
						>
							{t("product.create.productName")}
							<span class="text-red-500">*</span>
						</Label>
						<Input
							id="prod-name"
							type="text"
							bind:value={name}
							placeholder="e.g. Apple iPhone 16 Pro Max"
							class="h-10 text-xs"
							required
						/>
					</div>

					<div class="space-y-1.5">
						<Label
							for="prod-category"
							class="text-xs font-semibold text-foreground flex items-center justify-between"
						>
							<span>
								{t("product.create.category")}
								<span class="text-red-500">*</span>
							</span>
							{#if category}
								<span
									class="text-[10px] font-normal text-muted-foreground"
								>
									{t("product.categorySelect.clickToChange")}
								</span>
							{/if}
						</Label>
						<div class="relative group">
							<input
								id="prod-category"
								type="text"
								readonly
								value={category}
								placeholder={t("product.create.category")}
								onclick={() => (isCategoryDialogOpen = true)}
								class="h-10 w-full rounded-lg border border-border bg-card pl-3 pr-10 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all truncate"
							/>
							<button
								type="button"
								onclick={() => (isCategoryDialogOpen = true)}
								class="absolute right-2.5 top-1/2 -translate-y-1/2 size-6 rounded flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors cursor-pointer"
								title={t("product.categorySelect.dialogTitle")}
							>
								<ChevronRightIcon class="size-4" />
							</button>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div class="space-y-1.5">
							<Label
								for="prod-sku"
								class="text-xs font-semibold text-foreground"
							>
								{t("product.create.sku")}
								<span class="text-red-500">*</span>
							</Label>
							<Input
								id="prod-sku"
								type="text"
								bind:value={sku}
								placeholder="e.g. APL-IP16PM"
								class="h-10 text-xs font-mono uppercase"
								required
							/>
						</div>

						<div class="space-y-1.5">
							<Label
								class="text-xs font-semibold text-foreground"
							>
								{t("product.create.merk")}
							</Label>
							<Select.Root
								type="single"
								bind:value={merk}
								items={merkItems}
							>
								<Select.Trigger
									class="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 transition-colors"
								>
									<Select.Value
										placeholder={t("product.create.merk")}
									/>
								</Select.Trigger>
								<Select.Content>
									{#each merkItems as opt}
										<Select.Item
											value={opt.value}
											label={opt.label}
										>
											{opt.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<div
						class="mt-4 flex items-center justify-between p-3.5 rounded-lg border border-border/70 bg-muted/20"
					>
						<div>
							<span
								class="text-xs font-semibold text-foreground block"
							>
								{t("product.create.status")}
							</span>
							<span class="text-[11px] text-muted-foreground">
								{t("product.create.statusNotice")}
							</span>
						</div>
						<Switch
							checked={status === "active"}
							onCheckedChange={(checked: boolean) =>
								(status = checked ? "active" : "disable")}
						/>
					</div>
				</div>
			</Card.Root>

			<!-- Section 3: Description -->
			<Card.Root
				class="p-5 rounded-xl border border-border/80 bg-card shadow-xs"
			>
				<div class="mb-4">
					<h2
						class="font-heading text-sm font-bold text-foreground flex items-center gap-2"
					>
						<FileTextIcon class="size-4 text-primary" />
						<span>{t("product.create.descriptionSection")}</span>
					</h2>
					<p class="text-[11px] text-muted-foreground mt-0.5">
						{t("product.create.descriptionDesc")}
					</p>
				</div>

				<div class="space-y-2 text-xs">
					<Label
						for="prod-description"
						class="text-xs font-semibold text-foreground"
					>
						{t("product.create.description")}
					</Label>
					<textarea
						id="prod-description"
						bind:value={description}
						rows={5}
						placeholder={t("product.create.descriptionPlaceholder")}
						class="w-full rounded-lg border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all resize-y min-h-70 shadow-xs"
					></textarea>
					<div
						class="flex items-center justify-between text-[11px] text-muted-foreground"
					>
						<span>{t("product.create.descriptionHint")}</span>
						<span class="font-mono text-[10px]"
							>{description.length} / 3000</span
						>
					</div>
				</div>
			</Card.Root>

			<!-- Section 4: Product Variants -->
			<Card.Root
				class="p-5 rounded-xl border border-border/80 bg-card shadow-xs"
			>
				<div class="flex items-center justify-between mb-4">
					<div>
						<h2
							class="font-heading text-sm font-bold text-foreground flex items-center gap-2"
						>
							<LayersIcon class="size-4 text-primary" />
							<span>{t("product.create.variantsSection")}</span>
						</h2>
						<p class="text-[11px] text-muted-foreground mt-0.5">
							{t("product.create.variantsDesc")}
						</p>
					</div>

					<Button.Root
						type="button"
						variant="outline"
						size="sm"
						onclick={addVariant}
						class="h-8 gap-1.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
					>
						<PlusIcon class="size-3.5" />
						<span>{t("product.create.addVariant")}</span>
					</Button.Root>
				</div>

				{#if variants.length > 0}
					<div class="space-y-4">
						<!-- Bulk Edit / Apply to All Bar -->
						<div class="p-4 rounded-xl border space-y-3 shadow-2xs">
							<div
								class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-primary/10"
							>
								<div class="flex items-center gap-2">
									<div class="space-y-0.5">
										<span
											class="text-xs font-semibold text-foreground flex items-center gap-1.5"
										>
											{t("product.create.bulkEditTitle")}
										</span>
										<p
											class="text-[10px] text-muted-foreground"
										>
											{t("product.create.bulkEditDesc")}
										</p>
									</div>
								</div>

								<Button.Root
									type="button"
									variant="outline"
									size="xs"
									onclick={applyAllBulk}
									class="h-7 px-2.5 text-[11px] font-semibold text-primary border-primary/30 hover:bg-primary hover:text-white transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
								>
									<CheckCheckIcon class="size-3" />
									<span>{t("product.create.applyToAll")}</span
									>
								</Button.Root>
							</div>

							<!-- Row: SKU, Price, Stock -->
							<div
								class="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
							>
								<div>
									<Label
										class="text-[10px] font-medium text-muted-foreground block mb-1"
									>
										{t("product.create.variantSku")}
									</Label>
									<div class="flex w-full">
										<span
											class="inline-flex shrink-0 items-center rounded-l-md border border-r-0 border-input bg-muted px-2.5 sm:px-3 text-xs font-mono text-muted-foreground select-none truncate max-w-[140px]"
											title={formattedSkuPrefix}
										>
											{formattedSkuPrefix}
										</span>
										<Input
											type="text"
											bind:value={bulkSku}
											placeholder={t(
												"product.create.bulkSkuPlaceholder",
											)}
											class="rounded-l-none focus-visible:z-10 h-8 text-xs font-mono uppercase bg-background"
										/>
									</div>
								</div>

								<div>
									<Label
										class="text-[10px] font-medium text-muted-foreground block mb-1"
									>
										{t("product.create.variantPrice")}
									</Label>
									<Input
										type="number"
										min="0"
										step="1000"
										bind:value={bulkPrice}
										placeholder="0"
										class="h-8 text-xs font-mono bg-background"
									/>
								</div>

								<div>
									<Label
										class="text-[10px] font-medium text-muted-foreground block mb-1"
									>
										{t("product.create.variantStock")}
									</Label>
									<Input
										type="number"
										min="0"
										bind:value={bulkStock}
										placeholder="0"
										class="h-8 text-xs font-mono bg-background"
									/>
								</div>
							</div>
						</div>

						<!-- Variants List -->
						<div class="space-y-3">
							{#each variants as variant (variant.id)}
								<div
									class="p-3.5 rounded-xl border border-border/80 bg-muted/15 transition-colors hover:border-border"
								>
									<!-- Main Info Row -->
									<div
										class="flex flex-col sm:flex-row items-start sm:items-center gap-3"
									>
										<!-- 1:1 Variant Image Slot (Max 1 Image) -->
										<div
											class="relative size-14 rounded-lg border border-border/80 bg-background overflow-hidden flex items-center justify-center group aspect-square shadow-2xs"
										>
											{#if variant.image}
												<img
													src={variant.image}
													alt={variant.name}
													class="size-full object-cover aspect-square"
												/>
												<div
													class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5"
												>
													<DropdownMenu.Root>
														<DropdownMenu.Trigger
															class="p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
															title={t(
																"product.create.pickFromGallery",
															)}
														>
															<PencilIcon
																class="size-3"
															/>
														</DropdownMenu.Trigger>
														<DropdownMenu.Content
															align="start"
															class="w-48 p-1 text-xs"
														>
															<label
																class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-xs"
															>
																<UploadCloudIcon
																	class="size-3.5 text-primary"
																/>
																<span
																	>{t(
																		"product.create.uploadNewVariantImg",
																	)}</span
																>
																<input
																	type="file"
																	accept="image/*"
																	class="hidden"
																	onchange={(
																		e,
																	) =>
																		handleVariantImageUpload(
																			variant.id,
																			e,
																		)}
																/>
															</label>
															{#if uploadedImages.length > 0}
																<DropdownMenu.Separator
																/>
																<div
																	class="px-2 py-1 text-[10px] text-muted-foreground font-semibold"
																>
																	{t(
																		"product.create.pickFromGallery",
																	)}
																</div>
																<div
																	class="grid grid-cols-4 gap-1 p-1 max-h-36 overflow-y-auto"
																>
																	{#each uploadedImages as img (img.id)}
																		<button
																			type="button"
																			onclick={() =>
																				setVariantImageFromGallery(
																					variant.id,
																					img.url,
																				)}
																			class="aspect-square rounded border border-border/60 hover:border-primary overflow-hidden relative cursor-pointer"
																			title={img.name}
																		>
																			<img
																				src={img.url}
																				alt={img.name}
																				class="size-full object-cover aspect-square"
																			/>
																		</button>
																	{/each}
																</div>
															{/if}
														</DropdownMenu.Content>
													</DropdownMenu.Root>
													<button
														type="button"
														onclick={() =>
															removeVariantImage(
																variant.id,
															)}
														class="p-1 rounded bg-red-500/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
														title={t(
															"common.delete",
														)}
													>
														<XIcon class="size-3" />
													</button>
												</div>
											{:else}
												<DropdownMenu.Root>
													<DropdownMenu.Trigger
														class="size-full flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer border border-dashed border-border rounded-lg"
														title={t(
															"product.create.uploadNewVariantImg",
														)}
													>
														<ImagePlusIcon
															class="size-4"
														/>
														<span
															class="text-[9px] font-medium mt-0.5"
															>1:1</span
														>
													</DropdownMenu.Trigger>
													<DropdownMenu.Content
														align="start"
														class="w-48 p-1 text-xs"
													>
														<label
															class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-xs"
														>
															<UploadCloudIcon
																class="size-3.5 text-primary"
															/>
															<span
																>{t(
																	"product.create.uploadNewVariantImg",
																)}</span
															>
															<input
																type="file"
																accept="image/*"
																class="hidden"
																onchange={(e) =>
																	handleVariantImageUpload(
																		variant.id,
																		e,
																	)}
															/>
														</label>
														{#if uploadedImages.length > 0}
															<DropdownMenu.Separator
															/>
															<div
																class="px-2 py-1 text-[10px] text-muted-foreground font-semibold"
															>
																{t(
																	"product.create.pickFromGallery",
																)}
															</div>
															<div
																class="grid grid-cols-4 gap-1 p-1 max-h-36 overflow-y-auto"
															>
																{#each uploadedImages as img (img.id)}
																	<button
																		type="button"
																		onclick={() =>
																			setVariantImageFromGallery(
																				variant.id,
																				img.url,
																			)}
																		class="aspect-square rounded border border-border/60 hover:border-primary overflow-hidden relative cursor-pointer"
																		title={img.name}
																	>
																		<img
																			src={img.url}
																			alt={img.name}
																			class="size-full object-cover aspect-square"
																		/>
																	</button>
																{/each}
															</div>
														{/if}
													</DropdownMenu.Content>
												</DropdownMenu.Root>
											{/if}
										</div>

										<div class="flex-1 w-full sm:w-auto">
											<Label
												class="text-[10px] text-muted-foreground block mb-1"
											>
												{t(
													"product.create.variantName",
												)}
											</Label>
											<Input
												type="text"
												bind:value={variant.name}
												placeholder="e.g. Space Black - 256GB"
												class="h-8.5 text-xs"
											/>
										</div>

										<div class="w-full sm:w-56">
											<Label
												class="text-[10px] text-muted-foreground block mb-1"
											>
												{t("product.create.variantSku")}
											</Label>
											<div class="flex w-full">
												<span
													class="inline-flex shrink-0 items-center rounded-l-md border border-r-0 border-input bg-muted px-2 sm:px-2.5 text-xs font-mono text-muted-foreground select-none truncate max-w-[130px]"
													title={formattedSkuPrefix}
												>
													{formattedSkuPrefix}
												</span>
												<Input
													type="text"
													value={variant.skuSuffix ?? ""}
													oninput={(e) =>
														handleVariantSuffixInput(
															variant,
															e,
														)}
													placeholder={t(
														"product.create.bulkSkuPlaceholder",
													)}
													class="rounded-l-none focus-visible:z-10 h-8.5 text-xs font-mono uppercase bg-background"
												/>
											</div>
										</div>

										<div class="w-full sm:w-28">
											<Label
												class="text-[10px] text-muted-foreground block mb-1"
											>
												{t(
													"product.create.variantPrice",
												)}
											</Label>
											<Input
												type="number"
												min="0"
												step="1000"
												bind:value={variant.price}
												class="h-8.5 text-xs font-mono"
											/>
										</div>

										<div class="w-full sm:w-20">
											<Label
												class="text-[10px] text-muted-foreground block mb-1"
											>
												{t(
													"product.create.variantStock",
												)}
											</Label>
											<Input
												type="number"
												min="0"
												bind:value={variant.stock}
												class="h-8.5 text-xs font-mono"
											/>
										</div>

										<button
											type="button"
											onclick={() =>
												removeVariant(variant.id)}
											class="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
											title={t("common.delete")}
										>
											<Trash2Icon class="size-4" />
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div
						class="text-center py-6 border border-dashed border-border rounded-lg text-xs text-muted-foreground"
					>
						{t("product.create.noVariantsYet")}
					</div>
				{/if}
			</Card.Root>

			<!-- Section 5: Weight & Dimensions (Per Variant) -->
			<Card.Root
				class="p-5 rounded-xl border border-border/80 bg-card shadow-xs space-y-4"
			>
				<div
					class="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
				>
					<div>
						<h2
							class="font-heading text-sm font-bold text-foreground flex items-center gap-2"
						>
							<ScaleIcon class="size-4 text-primary" />
							<span
								>{t(
									"product.create.weightDimensionsSection",
								)}</span
							>
						</h2>
						<p class="text-[11px] text-muted-foreground mt-0.5">
							{t("product.create.weightDimensionsDesc")}
						</p>
					</div>

					{#if variants.length > 0}
						<div
							class="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md self-start sm:self-auto shrink-0"
						>
							{t("product.manage.variantsCount", {
								count: variants.length,
							})}
						</div>
					{/if}
				</div>

				{#if variants.length > 0}
					<!-- Bulk Edit for Weight & Dimensions -->
					<div
						class="p-4 rounded-xl border space-y-3 shadow-2xs bg-card"
					>
						<div
							class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-primary/10"
						>
							<div class="space-y-0.5">
								<span
									class="text-xs font-semibold text-foreground flex items-center gap-1.5"
								>
									{t("product.create.bulkEditWeightDimTitle")}
								</span>
								<p class="text-[10px] text-muted-foreground">
									{t("product.create.bulkEditWeightDimDesc")}
								</p>
							</div>

							<Button.Root
								type="button"
								variant="outline"
								size="xs"
								onclick={applyWeightDimensionsBulk}
								class="h-7 px-2.5 text-[11px] font-semibold text-primary border-primary/30 hover:bg-primary hover:text-white transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
							>
								<CheckCheckIcon class="size-3" />
								<span>{t("product.create.applyToAll")}</span>
							</Button.Root>
						</div>

						<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
							<div>
								<Label
									class="text-[10px] font-medium text-muted-foreground block mb-1"
								>
									{t("product.create.weightLabel")} (g)
								</Label>
								<div class="relative">
									<Input
										type="number"
										min="0"
										step="1"
										bind:value={bulkWeight}
										placeholder="0"
										class="h-8 text-xs font-mono pr-7 bg-background"
									/>
									<span
										class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none"
									>
										g
									</span>
								</div>
							</div>

							<div>
								<Label
									class="text-[10px] font-medium text-muted-foreground block mb-1"
								>
									{t("product.create.lengthLabel")} (cm)
								</Label>
								<div class="relative">
									<Input
										type="number"
										min="0"
										step="0.1"
										bind:value={bulkLength}
										placeholder="0"
										class="h-8 text-xs font-mono pr-8 bg-background"
									/>
									<span
										class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none"
									>
										cm
									</span>
								</div>
							</div>

							<div>
								<Label
									class="text-[10px] font-medium text-muted-foreground block mb-1"
								>
									{t("product.create.widthLabel")} (cm)
								</Label>
								<div class="relative">
									<Input
										type="number"
										min="0"
										step="0.1"
										bind:value={bulkWidth}
										placeholder="0"
										class="h-8 text-xs font-mono pr-8 bg-background"
									/>
									<span
										class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none"
									>
										cm
									</span>
								</div>
							</div>

							<div>
								<Label
									class="text-[10px] font-medium text-muted-foreground block mb-1"
								>
									{t("product.create.heightLabel")} (cm)
								</Label>
								<div class="relative">
									<Input
										type="number"
										min="0"
										step="0.1"
										bind:value={bulkHeight}
										placeholder="0"
										class="h-8 text-xs font-mono pr-8 bg-background"
									/>
									<span
										class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none"
									>
										cm
									</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Per-Variant Weight & Dimensions List -->
					<div class="space-y-3">
						{#each variants as variant (variant.id)}
							<div
								class="p-3.5 rounded-xl border border-border/80 bg-muted/15 transition-colors hover:border-border space-y-2.5"
							>
								<div
									class="flex flex-col lg:flex-row lg:items-center justify-between gap-3"
								>
									<!-- Left: Variant Image & Identity -->
									<div
										class="flex items-center gap-3 min-w-44 shrink-0"
									>
										<div
											class="relative size-12 rounded-lg border border-border/80 bg-background overflow-hidden flex items-center justify-center aspect-square shadow-2xs shrink-0"
										>
											{#if variant.image}
												<img
													src={variant.image}
													alt={variant.name}
													class="size-full object-cover aspect-square"
												/>
											{:else}
												<PackageIcon
													class="size-5 text-muted-foreground/60"
												/>
											{/if}
										</div>

										<div class="min-w-0">
											<span
												class="font-semibold text-xs text-foreground block truncate"
											>
												{variant.name ||
													t(
														"product.create.variantName",
													)}
											</span>
											<span
												class="font-mono text-[10px] text-muted-foreground uppercase block truncate"
											>
												{variant.sku || "-"}
											</span>
										</div>
									</div>

									<!-- Right: Inputs for Weight, Length, Width, Height -->
									<div
										class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1"
									>
										<!-- Weight -->
										<div>
											<Label
												class="text-[10px] font-medium text-muted-foreground block mb-1"
											>
												{t(
													"product.create.weightLabel",
												)}
											</Label>
											<div class="relative">
												<Input
													type="number"
													min="0"
													step="1"
													bind:value={variant.weight}
													placeholder="0"
													class="h-8 text-xs font-mono pr-7 bg-background"
												/>
												<span
													class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none"
												>
													g
												</span>
											</div>
										</div>

										<!-- Length -->
										<div>
											<Label
												class="text-[10px] font-medium text-muted-foreground block mb-1"
											>
												{t(
													"product.create.lengthLabel",
												)}
											</Label>
											<div class="relative">
												<Input
													type="number"
													min="0"
													step="0.1"
													bind:value={variant.length}
													placeholder="0"
													class="h-8 text-xs font-mono pr-8 bg-background"
												/>
												<span
													class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none"
												>
													cm
												</span>
											</div>
										</div>

										<!-- Width -->
										<div>
											<Label
												class="text-[10px] font-medium text-muted-foreground block mb-1"
											>
												{t("product.create.widthLabel")}
											</Label>
											<div class="relative">
												<Input
													type="number"
													min="0"
													step="0.1"
													bind:value={variant.width}
													placeholder="0"
													class="h-8 text-xs font-mono pr-8 bg-background"
												/>
												<span
													class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none"
												>
													cm
												</span>
											</div>
										</div>

										<!-- Height -->
										<div>
											<Label
												class="text-[10px] font-medium text-muted-foreground block mb-1"
											>
												{t(
													"product.create.heightLabel",
												)}
											</Label>
											<div class="relative">
												<Input
													type="number"
													min="0"
													step="0.1"
													bind:value={variant.height}
													placeholder="0"
													class="h-8 text-xs font-mono pr-8 bg-background"
												/>
												<span
													class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none"
												>
													cm
												</span>
											</div>
										</div>
									</div>
								</div>

								<!-- Variant Volumetric Info Footer -->
								{#if variant.length && variant.width && variant.height}
									<div
										class="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground"
									>
										<div class="flex items-center gap-1.5">
											<RulerIcon
												class="size-3 text-muted-foreground/70"
											/>
											<span>
												{t(
													"product.create.volumetricCalculation",
												)}: {variant.length} × {variant.width}
												× {variant.height} / 6000
											</span>
										</div>
										<span
											class="font-mono font-medium text-foreground"
										>
											{t(
												"product.create.volumetricWeight",
											)}: {(
												(variant.length *
													variant.width *
													variant.height) /
												6000
											).toFixed(2)} kg
										</span>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div
						class="text-center py-6 border border-dashed border-border rounded-lg text-xs text-muted-foreground"
					>
						{t("product.create.noVariantsYet")}
					</div>
				{/if}
			</Card.Root>

			<!-- Section 6: Warehouse -->
			<Card.Root
				class="p-5 rounded-xl border border-border/80 bg-card shadow-xs"
			>
				<h2
					class="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2"
				>
					<WarehouseIcon class="size-4 text-primary" />
					<span>{t("product.create.warehouseStock")}</span>
				</h2>

				<div class="space-y-1.5">
					<Label class="text-xs font-semibold text-foreground">
						{t("product.create.warehouse")}
					</Label>
					<Select.Root
						type="single"
						bind:value={warehouse}
						items={warehouseItems}
					>
						<Select.Trigger
							class="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 transition-colors"
						>
							<Select.Value
								placeholder={t("product.create.warehouse")}
							/>
						</Select.Trigger>
						<Select.Content>
							{#each warehouseItems as opt}
								<Select.Item
									value={opt.value}
									label={opt.label}
								>
									{opt.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</Card.Root>
		</div>

		<!-- Right / Sidebar Info (1 col) -->
		<div class="space-y-6">
			<!-- Card: Product Image Preview (1:1 Ratio) -->
			<Card.Root
				class="p-5 rounded-xl border border-border/80 bg-card shadow-xs"
			>
				<h2
					class="font-heading text-sm font-bold text-foreground mb-3 flex items-center gap-2"
				>
					<ImagePlusIcon class="size-4 text-primary" />
					<span>{t("product.create.image")}</span>
				</h2>

				<!-- Preview Image Box (1:1 Ratio) -->
				<div
					class="relative aspect-square w-full rounded-xl overflow-hidden border border-border/80 bg-muted/40 flex items-center justify-center shadow-xs"
				>
					{#if imageUrl}
						<img
							src={imageUrl}
							alt="Product preview"
							class="size-full object-cover aspect-square"
						/>
						<div
							class="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium"
						>
							1:1 Ratio
						</div>
					{:else}
						<div
							class="flex flex-col items-center gap-1.5 text-muted-foreground"
						>
							<ImagePlusIcon class="size-8 stroke-1" />
							<span class="text-[11px]"
								>{t("product.create.imagePreview")}</span
							>
						</div>
					{/if}
				</div>

				<div class="mt-3.5 space-y-2 text-xs">
					<Label for="img-url-input" class="text-xs font-semibold">
						{t("product.create.imageUrl")}
					</Label>
					<Input
						id="img-url-input"
						type="url"
						bind:value={imageUrl}
						placeholder="https://..."
						class="h-9 text-xs"
					/>
				</div>

				<!-- Pick from Uploaded Images -->
				{#if uploadedImages.length > 0}
					<div class="mt-3 pt-3 border-t border-border/60">
						<span
							class="text-[10px] text-muted-foreground block mb-2 font-medium"
						>
							{t("product.create.pickFromGallery")}
						</span>
						<div class="grid grid-cols-4 gap-2">
							{#each uploadedImages as img (img.id)}
								<button
									type="button"
									onclick={() => setAsPrimary(img.id)}
									class="aspect-square rounded-lg border {imageUrl ===
									img.url
										? 'border-primary ring-2 ring-primary/20'
										: 'border-border/60 hover:border-primary/50'} overflow-hidden relative cursor-pointer transition-all"
								>
									<img
										src={img.url}
										alt={img.name}
										class="size-full object-cover aspect-square"
									/>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Quick Presets -->
				<div class="mt-3 pt-3 border-t border-border/60">
					<span
						class="text-[10px] text-muted-foreground block mb-2 font-medium"
						>{t("product.create.quickPresets")}</span
					>
					<div class="grid grid-cols-2 gap-1.5">
						{#each imagePresets as preset}
							<button
								type="button"
								onclick={() => (imageUrl = preset.url)}
								class="text-left px-2 py-1.5 rounded-md border border-border/60 hover:border-primary text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer truncate"
							>
								{preset.label}
							</button>
						{/each}
					</div>
				</div>
			</Card.Root>

			<!-- Summary Card -->
			<Card.Root
				class="p-5 rounded-xl border border-border/80 bg-card shadow-xs space-y-3.5 text-xs"
			>
				<h3
					class="font-heading font-bold text-foreground text-xs uppercase tracking-wider"
				>
					{t("product.create.catalogSummary")}
				</h3>

				<div class="space-y-2 divide-y divide-border/50">
					<div class="flex justify-between py-1.5">
						<span class="text-muted-foreground"
							>{t("product.create.summaryName")}</span
						>
						<span
							class="font-semibold text-foreground text-right truncate max-w-36"
						>
							{name || "-"}
						</span>
					</div>
					<div class="flex justify-between py-1.5">
						<span class="text-muted-foreground"
							>{t("product.create.summarySku")}</span
						>
						<span class="font-mono font-medium text-foreground">
							{sku || "-"}
						</span>
					</div>
					<div class="flex justify-between py-1.5">
						<span class="text-muted-foreground"
							>{t("product.create.summaryCategory")}</span
						>
						<span class="font-medium text-foreground">
							{category}
						</span>
					</div>
					<div class="flex justify-between py-1.5">
						<span class="text-muted-foreground"
							>{t("product.create.summaryBrand")}</span
						>
						<span class="font-medium text-foreground">
							{merk}
						</span>
					</div>
					<div class="flex justify-between py-1.5">
						<span class="text-muted-foreground"
							>{t("product.create.summaryPrice")}</span
						>
						<span class="font-mono font-bold text-foreground">
							{formatRupiah(price)}
						</span>
					</div>
					<div class="flex justify-between py-1.5">
						<span class="text-muted-foreground"
							>{t("product.create.summaryVariants")}</span
						>
						<span class="font-semibold text-primary">
							{t("product.manage.variantsCount", {
								count: variants.length,
							})}
						</span>
					</div>
					<div class="flex justify-between py-1.5">
						<span class="text-muted-foreground"
							>{t("product.create.summaryStock")}</span
						>
						<span class="font-mono font-bold text-foreground">
							{initialStock}
							{t("product.manage.unit")}
						</span>
					</div>
					<div class="flex justify-between py-1.5">
						<span class="text-muted-foreground"
							>{t("product.create.summaryWeight")}</span
						>
						<span class="font-medium text-foreground">
							{weightSummary}
						</span>
					</div>
					<div class="flex justify-between py-1.5">
						<span class="text-muted-foreground"
							>{t("product.create.summaryDimensions")}</span
						>
						<span class="font-mono text-foreground text-[11px]">
							{dimensionsSummary}
						</span>
					</div>
				</div>
			</Card.Root>
		</div>
	</div>

	<!-- Nested Category Select Dialog -->
	<CategorySelectDialog
		bind:open={isCategoryDialogOpen}
		value={category}
		title={t("product.categorySelect.editCategoryTitle")}
		onSelect={(selectedBreadcrumb) => {
			category = selectedBreadcrumb;
		}}
	/>
</div>
