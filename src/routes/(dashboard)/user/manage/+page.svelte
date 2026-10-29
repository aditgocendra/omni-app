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
	import type { UserRecord, UserStatus } from "$lib/types/index.js";

	import PlusIcon from "@lucide/svelte/icons/plus";
	import SearchIcon from "@lucide/svelte/icons/search";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import KeyRoundIcon from "@lucide/svelte/icons/key-round";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import XIcon from "@lucide/svelte/icons/x";
	import CheckIcon from "@lucide/svelte/icons/check";
	import UsersIcon from "@lucide/svelte/icons/users";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";

	// Initial mock dataset matching user specifications
	let users = $state<UserRecord[]>([
		{
			id: "usr-1",
			name: "Yono Bakrie",
			email: "example@cronsyst.com",
			role: "Super Admin",
			status: "active",
			createdAt: "18/02/2026",
			phone: "+62 812-3456-7890",
		},
		{
			id: "usr-2",
			name: "Siti Nurhaliza",
			email: "siti.nur@cronsyst.com",
			role: "Admin",
			status: "active",
			createdAt: "20/02/2026",
			phone: "+62 813-8899-1234",
		},
		{
			id: "usr-3",
			name: "Budi Santoso",
			email: "budi.santoso@cronsyst.com",
			role: "Warehouse Manager",
			status: "active",
			createdAt: "15/01/2026",
			phone: "+62 821-4567-8901",
		},
		{
			id: "usr-4",
			name: "Dewi Sartika",
			email: "dewi.sartika@cronsyst.com",
			role: "Inventory Staff",
			status: "active",
			createdAt: "10/03/2026",
			phone: "+62 856-7890-1234",
		},
		{
			id: "usr-5",
			name: "Ahmad Fauzi",
			email: "ahmad.fauzi@cronsyst.com",
			role: "Warehouse Manager",
			status: "disable",
			createdAt: "22/01/2026",
			phone: "+62 878-1122-3344",
		},
		{
			id: "usr-6",
			name: "Hendra Gunawan",
			email: "hendra.g@cronsyst.com",
			role: "Cashier",
			status: "active",
			createdAt: "14/02/2026",
			phone: "+62 819-9988-7766",
		},
		{
			id: "usr-7",
			name: "Maya Safitri",
			email: "maya.safitri@cronsyst.com",
			role: "Admin",
			status: "active",
			createdAt: "01/02/2026",
			phone: "+62 812-9876-5432",
		},
		{
			id: "usr-8",
			name: "Rizky Pratama",
			email: "rizky.p@cronsyst.com",
			role: "Inventory Staff",
			status: "disable",
			createdAt: "25/02/2026",
			phone: "+62 857-1234-5678",
		},
		{
			id: "usr-9",
			name: "Anisa Rahma",
			email: "anisa.rahma@cronsyst.com",
			role: "Cashier",
			status: "active",
			createdAt: "05/01/2026",
			phone: "+62 813-7766-5544",
		},
		{
			id: "usr-10",
			name: "Eko Prasetyo",
			email: "eko.prasetyo@cronsyst.com",
			role: "Warehouse Manager",
			status: "active",
			createdAt: "12/03/2026",
			phone: "+62 822-3344-5566",
		},
		{
			id: "usr-11",
			name: "Denny Caknan",
			email: "denny.c@cronsyst.com",
			role: "Inventory Staff",
			status: "disable",
			createdAt: "08/02/2026",
			phone: "+62 811-2233-4455",
		},
		{
			id: "usr-12",
			name: "Fajar Alfian",
			email: "fajar.alfian@cronsyst.com",
			role: "Admin",
			status: "active",
			createdAt: "19/01/2026",
			phone: "+62 815-6677-8899",
		},
		{
			id: "usr-13",
			name: "Rian Ardianto",
			email: "rian.ardianto@cronsyst.com",
			role: "Cashier",
			status: "active",
			createdAt: "28/02/2026",
			phone: "+62 817-4455-6677",
		},
		{
			id: "usr-14",
			name: "Greysia Polii",
			email: "greysia.p@cronsyst.com",
			role: "Super Admin",
			status: "active",
			createdAt: "02/01/2026",
			phone: "+62 818-8877-6655",
		},
		{
			id: "usr-15",
			name: "Anthony Ginting",
			email: "anthony.g@cronsyst.com",
			role: "Inventory Staff",
			status: "disable",
			createdAt: "11/02/2026",
			phone: "+62 812-1133-5577",
		},
	]);

	// Filter, Sort & Pagination states
	let searchQuery = $state("");
	let selectedRole = $state("all");
	let sortKey = $state<string | null>(null);
	let sortDirection = $state<"asc" | "desc" | "none">("none");
	let currentPage = $state(1);
	let pageSize = $state(10); // Minimum 10 per page as specified

	// Selection & Dialog states
	let selectedIds = $state<(string | number)[]>([]);
	let selectedUser = $state<UserRecord | null>(null);
	let userToDelete = $state<UserRecord | null>(null);

	let isCreateModalOpen = $state(false);
	let isDetailModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isResetPasswordModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isBulkDeleteModalOpen = $state(false);

	let toastMessage = $state<string | null>(null);
	let newGeneratedPassword = $state("");
	let isPasswordCopied = $state(false);

	// Form inputs for Create / Edit
	let formName = $state("");
	let formEmail = $state("");
	let formRole = $state("Admin");
	let formStatus = $state<UserStatus>("active");
	let formPhone = $state("");
	let formPassword = $state("");

	const roleOptions = [
		"Super Admin",
		"Admin",
		"Warehouse Manager",
		"Inventory Staff",
		"Cashier",
	];

	const roleFilterOptions = $derived([
		{ value: "all", label: t("user.manage.filterRole") },
		...roleOptions.map((role) => ({ value: role, label: role })),
	]);

	const formRoleSelectOptions = $derived(
		roleOptions.map((role) => ({ value: role, label: role })),
	);

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
		selectedRole;
		currentPage = 1;
		selectedIds = [];
	});

	// Table Columns configuration (Sorting on Name and CreatedAt)
	const columns = $derived<DataTableColumn<UserRecord>[]>([
		{
			id: "name",
			header: t("user.manage.colName"),
			sortable: true,
		},
		{
			id: "email",
			header: t("user.manage.colEmail"),
		},
		{
			id: "role",
			header: t("user.manage.colRole"),
		},
		{
			id: "status",
			header: t("user.manage.colStatus"),
		},
		{
			id: "createdAt",
			header: t("user.manage.colCreatedAt"),
			sortable: true,
			accessorFn: (row: UserRecord) => parseDate(row.createdAt),
		},
		{
			id: "actions",
			header: t("user.manage.colActions"),
			align: "right",
		},
	]);

	// Filtered users based on search name and role filter
	const filteredUsers = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();

		return users.filter((item) => {
			// Search strictly by name
			const matchName = !q || item.name.toLowerCase().includes(q);

			// Filter by role
			const matchRole =
				selectedRole === "all" ||
				item.role.toLowerCase() === selectedRole.toLowerCase();

			return matchName && matchRole;
		});
	});

	function resetFilters() {
		searchQuery = "";
		selectedRole = "all";
		sortKey = null;
		sortDirection = "none";
		showToast(t("user.manage.resetFiltersNotice"));
	}

	// Status Toggle
	function toggleUserStatus(userId: string, active: boolean) {
		const newStatus: UserStatus = active ? "active" : "disable";
		users = users.map((u) =>
			u.id === userId ? { ...u, status: newStatus } : u,
		);
		const user = users.find((u) => u.id === userId);
		const statusLabel = active
			? t("user.manage.statusActive")
			: t("user.manage.statusDisable");
		showToast(
			`${user?.name ?? "User"} ${t("user.manage.statusChangedTo")} ${statusLabel}`,
		);
	}

	// Actions Modals Handlers
	function openDetail(user: UserRecord) {
		selectedUser = user;
		isDetailModalOpen = true;
	}

	function openCreate() {
		formName = "";
		formEmail = "";
		formRole = "Admin";
		formStatus = "active";
		formPhone = "";
		formPassword = "";
		isCreateModalOpen = true;
	}

	function handleSaveCreate() {
		if (!formName.trim() || !formEmail.trim()) {
			showToast("Nama dan email wajib diisi.");
			return;
		}

		const today = new Date();
		const day = String(today.getDate()).padStart(2, "0");
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const year = today.getFullYear();
		const formattedDate = `${day}/${month}/${year}`;

		const newUser: UserRecord = {
			id: `usr-${Date.now()}`,
			name: formName.trim(),
			email: formEmail.trim().toLowerCase(),
			role: formRole,
			status: formStatus,
			createdAt: formattedDate,
			phone: formPhone.trim() || "+62 812-0000-0000",
		};

		users = [newUser, ...users];
		isCreateModalOpen = false;
		showToast(`${newUser.name} berhasil ditambahkan.`);
	}

	function openEdit(user: UserRecord) {
		selectedUser = user;
		formName = user.name;
		formEmail = user.email;
		formRole = user.role;
		formStatus = user.status;
		formPhone = user.phone || "";
		isEditModalOpen = true;
	}

	function handleSaveEdit() {
		if (!selectedUser) return;
		if (!formName.trim() || !formEmail.trim()) {
			showToast("Nama dan email wajib diisi.");
			return;
		}

		users = users.map((u) =>
			u.id === selectedUser?.id
				? {
						...u,
						name: formName.trim(),
						email: formEmail.trim().toLowerCase(),
						role: formRole,
						status: formStatus,
						phone: formPhone.trim(),
					}
				: u,
		);

		isEditModalOpen = false;
		showToast(`Data ${formName} berhasil diperbarui.`);
	}

	function openResetPassword(user: UserRecord) {
		selectedUser = user;
		newGeneratedPassword = generateRandomPassword();
		isPasswordCopied = false;
		isResetPasswordModalOpen = true;
	}

	function generateRandomPassword(): string {
		const chars =
			"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
		let pwd = "";
		for (let i = 0; i < 10; i++) {
			pwd += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return pwd;
	}

	function handleCopyPassword() {
		if (navigator?.clipboard) {
			navigator.clipboard.writeText(newGeneratedPassword);
			isPasswordCopied = true;
			setTimeout(() => {
				isPasswordCopied = false;
			}, 2000);
			showToast("Password berhasil disalin ke clipboard.");
		}
	}

	function handleSaveResetPassword() {
		isResetPasswordModalOpen = false;
		showToast(
			`Password untuk ${selectedUser?.name} berhasil diatur ulang.`,
		);
	}

	function handleOpenDelete(user: UserRecord) {
		userToDelete = user;
		isDeleteModalOpen = true;
	}

	function handleConfirmDelete() {
		if (!userToDelete) return;
		users = users.filter((u) => u.id !== userToDelete?.id);
		selectedIds = selectedIds.filter((id) => id !== userToDelete?.id);
		showToast(`Pengguna ${userToDelete.name} berhasil dihapus.`);
		isDeleteModalOpen = false;
		userToDelete = null;
	}

	function handleOpenBulkDelete(ids?: (string | number)[]) {
		if (ids && ids.length > 0) selectedIds = ids;
		if (selectedIds.length === 0) return;
		isBulkDeleteModalOpen = true;
	}

	function handleConfirmBulkDelete() {
		const count = selectedIds.length;
		users = users.filter((u) => !selectedIds.includes(u.id));
		selectedIds = [];
		isBulkDeleteModalOpen = false;
		showToast(`${count} pengguna terpilih berhasil dihapus.`);
	}
</script>

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
				{t("user.manage.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1.5">
				{t("user.manage.subtitle")}
			</p>
		</div>

		<div>
			<Button.Root
				onclick={openCreate}
				size="default"
				class="h-10 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
			>
				<PlusIcon class="size-4" />
				<span>{t("user.manage.createBtn")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- Search & Filters Container [search kolom (name) - width full, filter berdasar role, tombol reset] (full size) -->
	<div class="w-full space-y-3">
		<div class="flex flex-col gap-3 lg:flex-row lg:items-center">
			<!-- Search Column (name) - full width -->
			<div class="relative flex-1">
				<SearchIcon
					class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10"
				/>
				<Input
					type="text"
					role="searchbox"
					bind:value={searchQuery}
					placeholder={t("user.manage.searchPlaceholder")}
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

			<!-- Filter by Role -->
			<div class="w-full sm:w-56">
				<Select.Root
					type="single"
					bind:value={selectedRole}
					items={roleFilterOptions}
				>
					<Select.Trigger
						class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/60 transition-colors"
					>
						<Select.Value
							placeholder={t("user.manage.filterRole")}
						/>
					</Select.Trigger>
					<Select.Content>
						{#each roleFilterOptions as opt}
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
				<span>{t("user.manage.reset")}</span>
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

	<!-- User Management Table Card (DataTable with Pagination min 10 & Sorting on Name and CreatedAt) -->
	<DataTable
		data={filteredUsers}
		{columns}
		bind:page={currentPage}
		bind:perPage={pageSize}
		perPageOptions={[10, 20, 50, 100]}
		bind:sortKey
		bind:sortDirection
		emptyMessage={t("user.manage.emptyState")}
		emptyIcon={UsersIcon}
		selectable={true}
		bind:selectedIds
		onBulkDelete={handleOpenBulkDelete}
	>
		{#snippet cell({
			item,
			column,
		}: {
			item: UserRecord;
			column: DataTableColumn<UserRecord>;
		})}
			{#if column.id === "name"}
				<div class="flex flex-col">
					<span class="text-xs font-semibold text-foreground">
						{item.name}
					</span>
					{#if item.phone}
						<span class="text-[10px] text-muted-foreground">
							{item.phone}
						</span>
					{/if}
				</div>
			{:else if column.id === "email"}
				<span class="font-mono text-xs text-muted-foreground">
					{item.email}
				</span>
			{:else if column.id === "role"}
				<span
					class="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground bg-muted/60 px-2.5 py-1 rounded-md"
				>
					{item.role}
				</span>
			{:else if column.id === "status"}
				<!-- Switch Button - Active / Disable -->
				<div class="flex items-center gap-2.5">
					<Switch
						checked={item.status === "active"}
						onCheckedChange={(checked: boolean) =>
							toggleUserStatus(item.id, checked)}
						size="sm"
						aria-label="Toggle user status"
					/>
				</div>
			{:else if column.id === "createdAt"}
				<span
					class="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
				>
					<CalendarIcon class="size-3 text-muted-foreground/70" />
					{item.createdAt}
				</span>
			{:else if column.id === "actions"}
				<!-- Actions: More button with Dropdown menu (detail, edit, reset password, delete) -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class={buttonVariants({
							variant: "ghost",
							size: "icon-sm",
							class: "bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
						})}
						aria-label="Actions"
					>
						<EllipsisVerticalIcon class="size-4" />
						<span class="sr-only">Actions</span>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-48 p-1">
						<DropdownMenu.Item
							onclick={() => openDetail(item)}
							class="cursor-pointer gap-2 text-xs py-1.5"
						>
							<EyeIcon class="size-3.5 text-muted-foreground" />
							<span>{t("user.manage.actionDetail")}</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => openEdit(item)}
							class="cursor-pointer gap-2 text-xs py-1.5"
						>
							<PencilIcon
								class="size-3.5 text-muted-foreground"
							/>
							<span>{t("user.manage.actionEdit")}</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => openResetPassword(item)}
							class="cursor-pointer gap-2 text-xs py-1.5"
						>
							<KeyRoundIcon
								class="size-3.5 text-muted-foreground"
							/>
							<span>{t("user.manage.actionResetPassword")}</span>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							onclick={() => handleOpenDelete(item)}
							class="cursor-pointer gap-2 text-xs py-1.5 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
						>
							<Trash2Icon class="size-3.5" />
							<span>{t("user.manage.actionDelete")}</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		{/snippet}
	</DataTable>
</div>

<!-- Modal 1: Detail User -->
<Dialog.Root bind:open={isDetailModalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("user.manage.detailUserTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("user.manage.detailUserDesc")}
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedUser}
			<div class="space-y-4 py-2">
				<div
					class="flex items-center gap-3.5 p-3 rounded-xl border border-border/70 bg-muted/30"
				>
					<div
						class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base"
					>
						{selectedUser.name.charAt(2)}
					</div>
					<div>
						<h3
							class="font-heading text-sm font-bold text-foreground"
						>
							{selectedUser.name}
						</h3>
						<p class="text-xs text-muted-foreground font-mono">
							{selectedUser.email}
						</p>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3 text-xs">
					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]"
							>{t("user.manage.colRole")}</span
						>
						<span
							class="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground bg-muted/60 px-2.5 py-1 rounded-md"
						>
							{selectedUser.role}
						</span>
					</div>

					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]"
							>{t("user.manage.colStatus")}</span
						>
						<span
							class={cn(
								"inline-flex items-center gap-1.5 mt-1 font-semibold text-xs",
								selectedUser.status === "active"
									? "text-emerald-600 dark:text-emerald-400"
									: "text-muted-foreground",
							)}
						>
							<span
								class={cn(
									"size-2 rounded-full",
									selectedUser.status === "active"
										? "bg-emerald-500"
										: "bg-slate-400",
								)}
							></span>
							{selectedUser.status === "active"
								? t("user.manage.statusActive")
								: t("user.manage.statusDisable")}
						</span>
					</div>

					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]"
							>Phone Number</span
						>
						<span class="font-medium text-foreground mt-1 block">
							{selectedUser.phone || "-"}
						</span>
					</div>

					<div class="p-3 rounded-lg border border-border/60 bg-card">
						<span class="text-muted-foreground block text-[11px]"
							>{t("user.manage.colCreatedAt")}</span
						>
						<span
							class="font-mono text-foreground mt-1 block font-medium"
						>
							{selectedUser.createdAt}
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

<!-- Modal 2: Create User -->
<Dialog.Root bind:open={isCreateModalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("user.manage.createUserTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("user.manage.createUserDesc")}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-3.5 py-2">
			<div class="space-y-1">
				<Label class="text-xs font-semibold text-foreground"
					>{t("user.manage.colName")} *</Label
				>
				<Input
					bind:value={formName}
					placeholder="Contoh: Yono Bakrie"
					class="h-9 text-xs bg-white dark:bg-card"
				/>
			</div>

			<div class="space-y-1">
				<Label class="text-xs font-semibold text-foreground"
					>{t("user.manage.colEmail")} *</Label
				>
				<Input
					type="email"
					bind:value={formEmail}
					placeholder="Contoh: yono@cronsyst.com"
					class="h-9 text-xs bg-white dark:bg-card"
				/>
			</div>

			<div class="space-y-1">
				<Label class="text-xs font-semibold text-foreground"
					>Phone Number</Label
				>
				<Input
					bind:value={formPhone}
					placeholder="+62 812-xxxx-xxxx"
					class="h-9 text-xs bg-white dark:bg-card"
				/>
			</div>

			<div class="space-y-1">
				<Label class="text-xs font-semibold text-foreground"
					>{t("user.manage.colRole")}</Label
				>
				<Select.Root
					type="single"
					bind:value={formRole}
					items={formRoleSelectOptions}
				>
					<Select.Trigger
						class="h-9 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs"
					>
						<Select.Value placeholder="Select role" />
					</Select.Trigger>
					<Select.Content>
						{#each formRoleSelectOptions as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div
				class="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20"
			>
				<div>
					<span class="text-xs font-semibold text-foreground block"
						>{t("user.manage.colStatus")}</span
					>
					<span class="text-[11px] text-muted-foreground"
						>Aktivasi akun pengguna saat dibuat</span
					>
				</div>
				<Switch
					checked={formStatus === "active"}
					onCheckedChange={(checked: boolean) =>
						(formStatus = checked ? "active" : "disable")}
					size="default"
				/>
			</div>
		</div>

		<Dialog.Footer class="pt-3 gap-2">
			<Button.Root
				variant="outline"
				onclick={() => (isCreateModalOpen = false)}
				class="h-9 text-xs"
			>
				{t("common.cancel")}
			</Button.Root>
			<Button.Root
				onclick={handleSaveCreate}
				class="h-9 text-xs bg-primary text-white hover:bg-primary/90 font-semibold"
			>
				{t("user.manage.createBtn")}
			</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Modal 3: Edit User -->
<Dialog.Root bind:open={isEditModalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("user.manage.editUserTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("user.manage.editUserDesc")}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-3.5 py-2">
			<div class="space-y-1">
				<Label class="text-xs font-semibold text-foreground"
					>{t("user.manage.colName")} *</Label
				>
				<Input
					bind:value={formName}
					class="h-9 text-xs bg-white dark:bg-card"
				/>
			</div>

			<div class="space-y-1">
				<Label class="text-xs font-semibold text-foreground"
					>{t("user.manage.colEmail")} *</Label
				>
				<Input
					type="email"
					bind:value={formEmail}
					class="h-9 text-xs bg-white dark:bg-card"
				/>
			</div>

			<div class="space-y-1">
				<Label class="text-xs font-semibold text-foreground"
					>Phone Number</Label
				>
				<Input
					bind:value={formPhone}
					class="h-9 text-xs bg-white dark:bg-card"
				/>
			</div>

			<div class="space-y-1">
				<Label class="text-xs font-semibold text-foreground"
					>{t("user.manage.colRole")}</Label
				>
				<Select.Root
					type="single"
					bind:value={formRole}
					items={formRoleSelectOptions}
				>
					<Select.Trigger
						class="h-9 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs"
					>
						<Select.Value placeholder="Select role" />
					</Select.Trigger>
					<Select.Content>
						{#each formRoleSelectOptions as opt}
							<Select.Item value={opt.value} label={opt.label}>
								{opt.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div
				class="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20"
			>
				<div>
					<span class="text-xs font-semibold text-foreground block"
						>{t("user.manage.colStatus")}</span
					>
					<span class="text-[11px] text-muted-foreground"
						>Status akses operasional akun</span
					>
				</div>
				<Switch
					checked={formStatus === "active"}
					onCheckedChange={(checked: boolean) =>
						(formStatus = checked ? "active" : "disable")}
					size="default"
				/>
			</div>
		</div>

		<Dialog.Footer class="pt-3 gap-2">
			<Button.Root
				variant="outline"
				onclick={() => (isEditModalOpen = false)}
				class="h-9 text-xs"
			>
				{t("common.cancel")}
			</Button.Root>
			<Button.Root
				onclick={handleSaveEdit}
				class="h-9 text-xs bg-primary text-white hover:bg-primary/90 font-semibold"
			>
				{t("common.save")}
			</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Modal 4: Reset Password -->
<Dialog.Root bind:open={isResetPasswordModalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base font-bold text-foreground">
				{t("user.manage.resetPasswordTitle")}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">
				{t("user.manage.resetPasswordDesc")}
			</Dialog.Description>
		</Dialog.Header>

		{#if selectedUser}
			<div class="space-y-4 py-2">
				<div class="p-3 rounded-lg border border-border/70 bg-muted/30">
					<span class="text-[11px] text-muted-foreground block"
						>Pengguna Target:</span
					>
					<span class="text-xs font-bold text-foreground"
						>{selectedUser.name}</span
					>
					<span class="text-xs text-muted-foreground font-mono block"
						>{selectedUser.email}</span
					>
				</div>

				<div class="space-y-1.5">
					<Label class="text-xs font-semibold text-foreground">
						{t("user.manage.newPasswordLabel")}
					</Label>
					<div class="flex items-center gap-2">
						<Input
							bind:value={newGeneratedPassword}
							class="h-9 text-xs font-mono font-bold tracking-wider bg-white dark:bg-card"
						/>
						<Button.Root
							type="button"
							variant="outline"
							size="icon"
							onclick={() =>
								(newGeneratedPassword =
									generateRandomPassword())}
							class="size-9 shrink-0 cursor-pointer"
							title="Generate password baru"
						>
							<RefreshCwIcon class="size-3.5" />
						</Button.Root>
						<Button.Root
							type="button"
							variant="outline"
							size="icon"
							onclick={handleCopyPassword}
							class="size-9 shrink-0 cursor-pointer"
							title="Salin password"
						>
							{#if isPasswordCopied}
								<CheckIcon class="size-3.5 text-emerald-600" />
							{:else}
								<CopyIcon class="size-3.5" />
							{/if}
						</Button.Root>
					</div>
					<p class="text-[11px] text-muted-foreground">
						Kata sandi sementara ini dapat langsung diberikan kepada
						pengguna.
					</p>
				</div>
			</div>
		{/if}

		<Dialog.Footer class="pt-3 gap-2">
			<Button.Root
				variant="outline"
				onclick={() => (isResetPasswordModalOpen = false)}
				class="h-9 text-xs"
			>
				{t("common.cancel")}
			</Button.Root>
			<Button.Root
				onclick={handleSaveResetPassword}
				class="h-9 text-xs bg-primary text-white hover:bg-primary/90 font-semibold"
			>
				{t("user.manage.savePassword")}
			</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Modal 5: Delete Single Confirmation -->
<ConfirmDialog
	bind:open={isDeleteModalOpen}
	variant="danger"
	title={t("user.manage.deleteTitle")}
	description={t("user.manage.deleteDesc")}
	message={`${t("user.manage.deleteConfirmSingleQuestion")} "${userToDelete?.name}"?`}
	submessage={t("user.manage.deleteConfirmSingleWarning")}
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmDelete}
	onCancel={() => {
		isDeleteModalOpen = false;
		userToDelete = null;
	}}
/>

<!-- Modal 6: Delete Bulk Confirmation -->
<ConfirmDialog
	bind:open={isBulkDeleteModalOpen}
	variant="danger"
	title={t("user.manage.deleteBulkTitle", {
		count: selectedIds.length.toString(),
	})}
	description={t("user.manage.deleteBulkDesc")}
	message={t("user.manage.deleteConfirmBulkQuestion", {
		count: selectedIds.length.toString(),
	})}
	submessage={t("user.manage.deleteConfirmBulkWarn")}
	confirmLabel={t("common.deleteNow")}
	cancelLabel={t("common.cancel")}
	onConfirm={handleConfirmBulkDelete}
	onCancel={() => {
		isBulkDeleteModalOpen = false;
	}}
/>
