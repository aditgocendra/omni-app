<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { initialOperationalCosts } from "$lib/data/performance-data.js";
	import type { OperationalCostItem, CostCategory } from "$lib/types/index.js";
	import { t } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";

	// Icons
	import PlusIcon from "@lucide/svelte/icons/plus";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import WalletIcon from "@lucide/svelte/icons/wallet";
	import UsersIcon from "@lucide/svelte/icons/users";
	import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
	import ShoppingBagIcon from "@lucide/svelte/icons/shopping-bag";
	import SaveIcon from "@lucide/svelte/icons/save";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";

	// State
	let costItems = $state<OperationalCostItem[]>([...initialOperationalCosts]);
	let activeCategory = $state<CostCategory>("service_fee");
	let toastMessage = $state<string | null>(null);

	// Dialog State (Add / Edit)
	let isDialogOpen = $state(false);
	let isEditing = $state(false);
	let editingId = $state<string | null>(null);

	// Form fields
	let formName = $state("");
	let formCategory = $state<CostCategory>("service_fee");
	let formType = $state<"fixed_per_order" | "fixed_monthly" | "percentage" | "incident">("fixed_per_order");
	let formAmount = $state<number>(0);
	let formUnit = $state("per pesanan");
	let formDescription = $state("");
	let formMonthlyAllocation = $state<number>(0);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3500);
	}

	function formatRupiah(val: number): string {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(val);
	}

	// Filtered list by active tab
	const currentList = $derived(
		costItems.filter((item) => item.category === activeCategory),
	);

	// Summary KPI calculations
	const totalServiceMonthly = $derived(
		costItems
			.filter((c) => c.category === "service_fee" && c.isActive)
			.reduce((sum, c) => sum + c.allocatedMonthly, 0),
	);

	const totalPayrollMonthly = $derived(
		costItems
			.filter((c) => c.category === "payroll" && c.isActive)
			.reduce((sum, c) => sum + c.allocatedMonthly, 0),
	);

	const totalContingencyMonthly = $derived(
		costItems
			.filter((c) => c.category === "contingency" && c.isActive)
			.reduce((sum, c) => sum + c.amount, 0),
	);

	const totalGrandMonthly = $derived(
		totalServiceMonthly + totalPayrollMonthly + totalContingencyMonthly,
	);

	// Open Add Dialog
	function openAddDialog(defaultCat?: CostCategory) {
		isEditing = false;
		editingId = null;
		formName = "";
		formCategory = defaultCat || activeCategory;
		if (formCategory === "service_fee") {
			formType = "fixed_per_order";
			formUnit = "per pesanan";
			formAmount = 2500;
			formMonthlyAllocation = 2500000;
		} else if (formCategory === "payroll") {
			formType = "fixed_monthly";
			formUnit = "per bulan";
			formAmount = 4500000;
			formMonthlyAllocation = 4500000;
		} else {
			formType = "incident";
			formUnit = "plafon / bulan";
			formAmount = 2000000;
			formMonthlyAllocation = 1000000;
		}
		formDescription = "";
		isDialogOpen = true;
	}

	// Open Edit Dialog
	function openEditDialog(item: OperationalCostItem) {
		isEditing = true;
		editingId = item.id;
		formName = item.name;
		formCategory = item.category;
		formType = item.type;
		formAmount = item.amount;
		formUnit = item.unit || "";
		formDescription = item.description;
		formMonthlyAllocation = item.allocatedMonthly;
		isDialogOpen = true;
	}

	function saveCostItem() {
		if (!formName.trim()) {
			showToast("Nama komponen biaya wajib diisi!");
			return;
		}

		const todayStr = "06/11/2026";

		if (isEditing && editingId) {
			costItems = costItems.map((item) => {
				if (item.id === editingId) {
					return {
						...item,
						name: formName.trim(),
						category: formCategory,
						type: formType,
						amount: Number(formAmount),
						unit: formUnit,
						description: formDescription.trim(),
						allocatedMonthly: Number(formMonthlyAllocation),
						updatedAt: todayStr,
					};
				}
				return item;
			});
			showToast(`Biaya "${formName}" berhasil diperbarui`);
		} else {
			const newItem: OperationalCostItem = {
				id: `cost-${Date.now()}`,
				name: formName.trim(),
				category: formCategory,
				type: formType,
				amount: Number(formAmount),
				unit: formUnit,
				description: formDescription.trim(),
				isActive: true,
				allocatedMonthly: Number(formMonthlyAllocation),
				updatedAt: todayStr,
			};
			costItems = [newItem, ...costItems];
			showToast(`Komponen biaya "${formName}" berhasil ditambahkan`);
		}

		isDialogOpen = false;
	}

	function toggleActive(id: string) {
		costItems = costItems.map((item) => {
			if (item.id === id) {
				const next = !item.isActive;
				showToast(`Status "${item.name}" diubah menjadi ${next ? "Aktif" : "Nonaktif"}`);
				return { ...item, isActive: next };
			}
			return item;
		});
	}

	function deleteCostItem(id: string) {
		const target = costItems.find((c) => c.id === id);
		costItems = costItems.filter((c) => c.id !== id);
		showToast(`Biaya "${target?.name || id}" telah dihapus`);
	}

	function saveAllSettings() {
		showToast("Semua konfigurasi biaya operasional berhasil disimpan ke sistem!");
	}

	function resetToDefault() {
		costItems = [...initialOperationalCosts];
		showToast("Pengaturan biaya dikembalikan ke default");
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
	<!-- Toast notification -->
	{#if toastMessage}
		<div
			class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2"
		>
			<CheckCircle2Icon class="size-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Header Title & Action Buttons -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
				{t("nav.dataCost")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground">
				Konfigurasi biaya operasional layanan per pesanan, beban penggajian staf, dan alokasi dana tidak terduga.
			</p>
		</div>

		<div class="flex items-center gap-2 shrink-0">
			<Button.Root
				variant="outline"
				size="sm"
				onclick={resetToDefault}
				class="gap-1.5 h-9 rounded-lg border-border text-xs cursor-pointer shadow-xs"
			>
				<RotateCcwIcon class="size-3.5 text-muted-foreground" />
				<span>Reset Default</span>
			</Button.Root>

			<Button.Root
				size="sm"
				onclick={saveAllSettings}
				class="gap-1.5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
			>
				<SaveIcon class="size-3.5" />
				<span>Simpan Pengaturan</span>
			</Button.Root>
		</div>
	</div>

	<!-- 4 KPI Summary Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- Card 1: Total Grand Monthly -->
		<Card.Root class="p-5 border-border bg-white dark:bg-card shadow-xs rounded-xl flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Beban Operasional</span>
				<div class="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
					<WalletIcon class="size-4" />
				</div>
			</div>
			<div class="mt-3">
				<div class="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
					{formatRupiah(totalGrandMonthly)}
				</div>
				<p class="text-[11px] text-muted-foreground mt-1">
					Estimasi total anggaran per bulan
				</p>
			</div>
		</Card.Root>

		<!-- Card 2: Service Fee Monthly -->
		<Card.Root class="p-5 border-border bg-white dark:bg-card shadow-xs rounded-xl flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Layanan Per Pesanan</span>
				<div class="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
					<ShoppingBagIcon class="size-4" />
				</div>
			</div>
			<div class="mt-3">
				<div class="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
					{formatRupiah(totalServiceMonthly)}
				</div>
				<p class="text-[11px] text-muted-foreground mt-1">
					Material packing & biaya penanganan
				</p>
			</div>
		</Card.Root>

		<!-- Card 3: Payroll Monthly -->
		<Card.Root class="p-5 border-border bg-white dark:bg-card shadow-xs rounded-xl flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Operasional Gaji</span>
				<div class="size-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
					<UsersIcon class="size-4" />
				</div>
			</div>
			<div class="mt-3">
				<div class="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
					{formatRupiah(totalPayrollMonthly)}
				</div>
				<p class="text-[11px] text-muted-foreground mt-1">
					Gaji staf gudang, admin & CS
				</p>
			</div>
		</Card.Root>

		<!-- Card 4: Contingency Monthly -->
		<Card.Root class="p-5 border-border bg-white dark:bg-card shadow-xs rounded-xl flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Biaya Tidak Terduga</span>
				<div class="size-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
					<AlertCircleIcon class="size-4" />
				</div>
			</div>
			<div class="mt-3">
				<div class="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
					{formatRupiah(totalContingencyMonthly)}
				</div>
				<p class="text-[11px] text-muted-foreground mt-1">
					Plafon cadangan klaim retur & darurat
				</p>
			</div>
		</Card.Root>
	</div>

	<!-- 3 Sub Categories Tabs -->
	<Tabs.Root bind:value={activeCategory} class="w-full">
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-1">
			<Tabs.List class="h-11 bg-transparent p-0 gap-6">
				<!-- Tab 1: Operasional Layanan Per Pesanan -->
				<Tabs.Trigger
					value="service_fee"
					class="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-2 font-heading text-xs sm:text-sm font-semibold text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none cursor-pointer"
				>
					<ShoppingBagIcon class="mr-2 size-4" />
					Layanan Per Pesanan
				</Tabs.Trigger>

				<!-- Tab 2: Operasional Gaji -->
				<Tabs.Trigger
					value="payroll"
					class="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-2 font-heading text-xs sm:text-sm font-semibold text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none cursor-pointer"
				>
					<UsersIcon class="mr-2 size-4" />
					Operasional Gaji
				</Tabs.Trigger>

				<!-- Tab 3: Operasional Tidak Terduga -->
				<Tabs.Trigger
					value="contingency"
					class="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-2 font-heading text-xs sm:text-sm font-semibold text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none cursor-pointer"
				>
					<AlertCircleIcon class="mr-2 size-4" />
					Operasional Tidak Terduga
				</Tabs.Trigger>
			</Tabs.List>

			<!-- Add Item Button for Current Category -->
			<Button.Root
				size="sm"
				onclick={() => openAddDialog(activeCategory)}
				class="gap-1.5 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer shadow-xs"
			>
				<PlusIcon class="size-3.5" />
				<span>Tambah Komponen Biaya</span>
			</Button.Root>
		</div>

		<!-- CONTENT LIST FOR EACH CATEGORY -->
		<div class="mt-6">
			<Card.Root class="border-border bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-left text-xs">
						<thead class="bg-slate-50 dark:bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
							<tr>
								<th class="p-4">Komponen Pengeluaran</th>
								<th class="p-4">Tipe Biaya</th>
								<th class="p-4 text-right">Besaran / Tarif</th>
								<th class="p-4 text-right">Alokasi Bulanan</th>
								<th class="p-4 text-center">Status</th>
								<th class="p-4 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border/60">
							{#if currentList.length === 0}
								<tr>
									<td colspan="6" class="p-8 text-center text-muted-foreground">
										Belum ada komponen biaya di kategori ini.
									</td>
								</tr>
							{:else}
								{#each currentList as item (item.id)}
									<tr class="hover:bg-slate-50/70 dark:hover:bg-muted/40 transition-colors">
										<!-- Komponen Pengeluaran -->
										<td class="p-4">
											<div class="flex flex-col gap-0.5">
												<span class="font-semibold text-sm text-foreground">
													{item.name}
												</span>
												<span class="text-xs text-muted-foreground max-w-md">
													{item.description}
												</span>
												<span class="text-[10px] text-muted-foreground/80 mt-1">
													Terakhir diperbarui: {item.updatedAt}
												</span>
											</div>
										</td>

										<!-- Tipe Biaya -->
										<td class="p-4 whitespace-nowrap">
											<Badge variant="outline" class="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-muted font-medium">
												{#if item.type === "fixed_per_order"}
													Flat / Pesanan
												{:else if item.type === "percentage"}
													Persentase Omzet
												{:else if item.type === "fixed_monthly"}
													Rutin Bulanan
												{:else}
													Plafon Darurat
												{/if}
											</Badge>
										</td>

										<!-- Besaran / Tarif -->
										<td class="p-4 text-right font-medium text-foreground whitespace-nowrap">
											{#if item.type === "percentage"}
												{item.amount}% <span class="text-[11px] text-muted-foreground">({item.unit})</span>
											{:else}
												{formatRupiah(item.amount)} <span class="text-[11px] text-muted-foreground">/{item.unit}</span>
											{/if}
										</td>

										<!-- Alokasi Bulanan -->
										<td class="p-4 text-right font-bold text-foreground whitespace-nowrap">
											{formatRupiah(item.allocatedMonthly)}
										</td>

										<!-- Status Switch -->
										<td class="p-4 text-center whitespace-nowrap">
											<div class="inline-flex items-center gap-2">
												<Switch
													checked={item.isActive}
													onCheckedChange={() => toggleActive(item.id)}
													aria-label={`Toggle ${item.name}`}
												/>
												<span class={cn("text-[11px] font-medium", item.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
													{item.isActive ? "Aktif" : "Nonaktif"}
												</span>
											</div>
										</td>

										<!-- Aksi (Edit & Delete) -->
										<td class="p-4 text-right whitespace-nowrap">
											<div class="flex items-center justify-end gap-1">
												<Button.Root
													variant="ghost"
													size="icon"
													onclick={() => openEditDialog(item)}
													class="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
													title="Edit Biaya"
												>
													<PencilIcon class="size-3.5" />
												</Button.Root>
												<Button.Root
													variant="ghost"
													size="icon"
													onclick={() => deleteCostItem(item.id)}
													class="size-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
													title="Hapus Biaya"
												>
													<Trash2Icon class="size-3.5" />
												</Button.Root>
											</div>
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</Card.Root>
		</div>
	</Tabs.Root>

	<!-- Add / Edit Cost Modal Dialog -->
	<Dialog.Root bind:open={isDialogOpen}>
		<Dialog.Content class="sm:max-w-lg">
			<Dialog.Header>
				<Dialog.Title class="font-heading text-lg font-bold">
					{isEditing ? "Edit Komponen Biaya Operasional" : "Tambah Komponen Biaya Operasional"}
				</Dialog.Title>
				<Dialog.Description class="text-xs text-muted-foreground">
					Atur nama, kategori, skema penghitungan, serta nominal alokasi anggaran operasional.
				</Dialog.Description>
			</Dialog.Header>

			<div class="flex flex-col gap-4 py-2">
				<!-- Kategori Biaya -->
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-semibold">Kategori Operasional</Label>
					<Select.Root
						type="single"
						bind:value={formCategory}
						items={[
							{ value: "service_fee", label: "Operasional Layanan Per Pesanan" },
							{ value: "payroll", label: "Operasional Gaji" },
							{ value: "contingency", label: "Operasional Tidak Terduga" },
						]}
					>
						<Select.Trigger class="h-9 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs cursor-pointer shadow-xs">
							<Select.Value placeholder="Pilih Kategori" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="service_fee" label="Operasional Layanan Per Pesanan">Operasional Layanan Per Pesanan</Select.Item>
							<Select.Item value="payroll" label="Operasional Gaji">Operasional Gaji</Select.Item>
							<Select.Item value="contingency" label="Operasional Tidak Terduga">Operasional Tidak Terduga</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Nama Komponen Biaya -->
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-semibold">Nama Komponen Pengeluaran</Label>
					<Input
						type="text"
						placeholder="Contoh: Bubble Wrap Ekstra, Gaji Staf Packing, Cadangan Retur..."
						bind:value={formName}
						class="h-9 text-xs"
					/>
				</div>

				<!-- Skema Tipe Biaya & Besaran -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div class="flex flex-col gap-1.5">
						<Label class="text-xs font-semibold">Tipe Skema</Label>
						<Select.Root
							type="single"
							bind:value={formType}
							items={[
								{ value: "fixed_per_order", label: "Flat per Pesanan (Rp)" },
								{ value: "fixed_monthly", label: "Tetap Bulanan (Rp)" },
								{ value: "percentage", label: "Persentase (%)" },
								{ value: "incident", label: "Plafon Darurat (Rp)" },
							]}
						>
							<Select.Trigger class="h-9 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs cursor-pointer shadow-xs">
								<Select.Value placeholder="Pilih Skema" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="fixed_per_order" label="Flat per Pesanan (Rp)">Flat per Pesanan (Rp)</Select.Item>
								<Select.Item value="fixed_monthly" label="Tetap Bulanan (Rp)">Tetap Bulanan (Rp)</Select.Item>
								<Select.Item value="percentage" label="Persentase (%)">Persentase (%)</Select.Item>
								<Select.Item value="incident" label="Plafon Darurat (Rp)">Plafon Darurat (Rp)</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<div class="flex flex-col gap-1.5">
						<Label class="text-xs font-semibold">Besaran / Nominal</Label>
						<Input
							type="number"
							placeholder="Contoh: 3500 atau 2.5"
							bind:value={formAmount}
							class="h-9 text-xs"
						/>
					</div>
				</div>

				<!-- Alokasi Anggaran Bulanan -->
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-semibold">Estimasi Total Alokasi Bulanan (Rp)</Label>
					<Input
						type="number"
						placeholder="Contoh: 5000000"
						bind:value={formMonthlyAllocation}
						class="h-9 text-xs"
					/>
				</div>

				<!-- Keterangan / Deskripsi -->
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-semibold">Keterangan Tambahan</Label>
					<Input
						type="text"
						placeholder="Jelaskan peruntukan komponen biaya ini..."
						bind:value={formDescription}
						class="h-9 text-xs"
					/>
				</div>
			</div>

			<Dialog.Footer class="mt-4 gap-2">
				<Button.Root
					type="button"
					variant="outline"
					onclick={() => (isDialogOpen = false)}
					class="text-xs h-9 cursor-pointer"
				>
					Batal
				</Button.Root>
				<Button.Root
					type="button"
					onclick={saveCostItem}
					class="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
				>
					{isEditing ? "Perbarui Biaya" : "Simpan Biaya"}
				</Button.Root>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>

