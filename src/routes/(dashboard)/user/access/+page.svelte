<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { t } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";
	import { page } from "$app/state";
	import type {
		RoleRecord,
		ModulePermissionGroup,
		PermissionAction,
	} from "$lib/types/index.js";
	import {
		initialRoles,
		modulePermissionGroups,
		initialRolePermissions,
		allPermissionIds,
	} from "$lib/data/role-access-data.js";

	import KeyRoundIcon from "@lucide/svelte/icons/key-round";
	import ShieldAlertIcon from "@lucide/svelte/icons/shield-alert";
	import ShieldIcon from "@lucide/svelte/icons/shield";
	import SaveIcon from "@lucide/svelte/icons/save";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import SearchIcon from "@lucide/svelte/icons/search";
	import CheckCheckIcon from "@lucide/svelte/icons/check-check";
	import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
	import LockIcon from "@lucide/svelte/icons/lock";
	import CheckIcon from "@lucide/svelte/icons/check";
	import XIcon from "@lucide/svelte/icons/x";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";

	// Roles State
	let roles = $state<RoleRecord[]>([...initialRoles]);
	let rolePermissions = $state<Record<string, string[]>>({
		...Object.fromEntries(
			Object.entries(initialRolePermissions).map(([k, v]) => [k, [...v]]),
		),
	});

	// URL query param detection for active role
	let selectedRoleKey = $state<string>("super_admin");

	// Initialize selected role from URL query param if present
	$effect(() => {
		const paramRole = page.url.searchParams.get("role");
		if (paramRole && roles.some((r) => r.key === paramRole)) {
			selectedRoleKey = paramRole;
		}
	});

	let searchQuery = $state("");
	let selectedModuleId = $state<string>("all");
	let isSaving = $state(false);
	let toastMessage = $state<string | null>(null);

	// Derived Active Role
	const activeRole = $derived(
		roles.find((r) => r.key === selectedRoleKey) || roles[0],
	);
	const isSuperAdmin = $derived(selectedRoleKey === "super_admin");

	// Role Select Options
	const roleSelectOptions = $derived(
		roles.map((r) => ({
			value: r.key,
			label: r.name,
		})),
	);

	// Permissions counts for active role
	const totalPermissionsCount = $derived(allPermissionIds.length);
	const currentGrantedIds = $derived<string[]>(
		isSuperAdmin
			? [...allPermissionIds]
			: rolePermissions[selectedRoleKey] || [],
	);
	const grantedCount = $derived(currentGrantedIds.length);
	const grantedPercentage = $derived(
		Math.round((grantedCount / totalPermissionsCount) * 100),
	);

	// Filtered Module Permission Groups
	const filteredModuleGroups = $derived(
		modulePermissionGroups
			.filter((group) => {
				if (selectedModuleId === "all") return true;
				return group.id === selectedModuleId;
			})
			.map((group) => {
				const query = searchQuery.trim().toLowerCase();
				if (!query) return group;

				const matchedPermissions = group.permissions.filter(
					(perm) =>
						perm.name.toLowerCase().includes(query) ||
						perm.description.toLowerCase().includes(query) ||
						perm.action.toLowerCase().includes(query) ||
						group.name.toLowerCase().includes(query),
				);

				return {
					...group,
					permissions: matchedPermissions,
				};
			})
			.filter((group) => group.permissions.length > 0),
	);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3500);
	}

	function isGranted(permissionId: string): boolean {
		if (isSuperAdmin) return true;
		return currentGrantedIds.includes(permissionId);
	}

	function togglePermission(permissionId: string) {
		if (isSuperAdmin) return;

		const current = rolePermissions[selectedRoleKey] || [];
		if (current.includes(permissionId)) {
			rolePermissions[selectedRoleKey] = current.filter(
				(id) => id !== permissionId,
			);
		} else {
			rolePermissions[selectedRoleKey] = [...current, permissionId];
		}
	}

	function handleGrantAll() {
		if (isSuperAdmin) return;
		rolePermissions[selectedRoleKey] = [...allPermissionIds];
		showToast(t("user.access.grantAll"));
	}

	function handleRevokeAll() {
		if (isSuperAdmin) return;
		rolePermissions[selectedRoleKey] = [];
		showToast(t("user.access.revokeAll"));
	}

	function handleResetDefaults() {
		if (isSuperAdmin) return;
		const defaults = initialRolePermissions[selectedRoleKey] || [];
		rolePermissions[selectedRoleKey] = [...defaults];
		showToast(
			t("user.access.toastReset").replace("{role}", activeRole.name),
		);
	}

	function toggleGroup(group: ModulePermissionGroup) {
		if (isSuperAdmin) return;

		const groupPermissionIds = group.permissions.map((p) => p.id);
		const current = rolePermissions[selectedRoleKey] || [];
		const allInGroupGranted = groupPermissionIds.every((id) =>
			current.includes(id),
		);

		if (allInGroupGranted) {
			// Revoke group
			rolePermissions[selectedRoleKey] = current.filter(
				(id) => !groupPermissionIds.includes(id),
			);
		} else {
			// Grant group
			const combined = Array.from(
				new Set([...current, ...groupPermissionIds]),
			);
			rolePermissions[selectedRoleKey] = combined;
		}
	}

	function handleSave() {
		isSaving = true;
		setTimeout(() => {
			isSaving = false;
			showToast(
				t("user.access.toastSaved").replace("{role}", activeRole.name),
			);
		}, 500);
	}

	function getActionBadge(action: PermissionAction) {
		switch (action) {
			case "view":
				return {
					label: t("user.access.actionView"),
					class: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
				};
			case "create":
				return {
					label: t("user.access.actionCreate"),
					class: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
				};
			case "edit":
				return {
					label: t("user.access.actionEdit"),
					class: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
				};
			case "delete":
				return {
					label: t("user.access.actionDelete"),
					class: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
				};
			case "manage":
				return {
					label: t("user.access.actionManage"),
					class: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
				};
			case "export":
				return {
					label: t("user.access.actionExport"),
					class: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
				};
			default:
				return {
					label: action,
					class: "bg-muted text-muted-foreground border-border",
				};
		}
	}
</script>

<svelte:head>
	<title>{t("user.access.title")} | OmniFlow</title>
</svelte:head>

<!-- Toast Notification -->
{#if toastMessage}
	<div
		class="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl animate-in slide-in-from-bottom-5 duration-200"
	>
		<CheckCircle2Icon class="size-4 text-emerald-400" />
		<span>{toastMessage}</span>
	</div>
{/if}

<div class="space-y-6 w-full">
	<!-- Page Header -->
	<div
		class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60"
	>
		<div>
			<h1
				class="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2"
			>
				<KeyRoundIcon class="size-6 text-primary" />
				<span>{t("user.access.title")}</span>
			</h1>
			<p class="text-xs text-muted-foreground mt-1">
				{t("user.access.subtitle")}
			</p>
		</div>

		<div class="flex items-center gap-3">
			<Button.Root
				type="button"
				onclick={handleSave}
				disabled={isSaving}
				class="h-9 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer flex items-center gap-2 shadow-xs shrink-0"
			>
				{#if isSaving}
					<LoaderCircleIcon class="size-4 animate-spin" />
				{:else}
					<SaveIcon class="size-4" />
				{/if}
				<span>{t("user.access.savePermissions")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- Active Role Selector Card & Metrics -->
	<Card.Root class="border-border/70 shadow-2xs overflow-hidden">
		<Card.Header class="pb-3 border-b border-border/50 bg-muted/20">
			<div
				class="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
			>
				<!-- Role Switcher -->
				<div class="flex flex-col sm:flex-row sm:items-center gap-3">
					<span
						class="text-xs font-bold text-foreground uppercase tracking-wider shrink-0 flex items-center gap-1.5"
					>
						<ShieldIcon class="size-3.5 text-primary" />
						{t("user.access.selectRoleLabel")}:
					</span>
					<div class="w-full sm:w-80 shrink-0">
						<Select.Root
							type="single"
							bind:value={selectedRoleKey}
							items={roleSelectOptions}
						>
							<Select.Trigger
								class="h-9 w-full sm:w-50 shrink-0 text-xs font-medium bg-background justify-between"
							>
								<Select.Value class="truncate text-left" />
							</Select.Trigger>
							<Select.Content>
								{#each roleSelectOptions as opt}
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

				<!-- Role Quick Pills -->
				<div
					class="flex flex-wrap items-center gap-1.5 overflow-x-auto"
				>
					{#each roles as r}
						<button
							type="button"
							onclick={() => (selectedRoleKey = r.key)}
							class={cn(
								"px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border",
								selectedRoleKey === r.key
									? "bg-primary text-primary-foreground border-primary shadow-2xs"
									: "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border",
							)}
						>
							{r.name}
						</button>
					{/each}
				</div>
			</div>
		</Card.Header>

		<Card.Content class="p-4 sm:p-6 space-y-4">
			<!-- Role Details Banner -->
			<div
				class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card"
			>
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<h2 class="text-base font-bold text-foreground">
							{activeRole.name}
						</h2>
						{#if activeRole.isSystem}
							<Badge
								variant="secondary"
								class="text-[10px] px-1.5 py-0 h-4 font-medium bg-primary/10 text-primary border-primary/20"
							>
								{t("user.role.badgeSystem")}
							</Badge>
						{:else}
							<Badge
								variant="outline"
								class="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground"
							>
								{t("user.role.badgeCustom")}
							</Badge>
						{/if}
						<code
							class="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
						>
							{activeRole.key}
						</code>
					</div>
					<p
						class="text-xs text-muted-foreground max-w-2xl leading-relaxed"
					>
						{activeRole.description}
					</p>
				</div>

				<!-- Permissions Status / Progress -->
				<div
					class="flex flex-col sm:items-end gap-1.5 shrink-0 min-w-48"
				>
					<div class="flex items-center gap-2">
						<span class="text-xs font-semibold text-foreground">
							{grantedCount} / {totalPermissionsCount}
						</span>
						<Badge
							class={cn(
								"text-[10px] font-bold px-2 py-0.5",
								grantedPercentage === 100
									? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
									: "bg-primary/10 text-primary border-primary/20",
							)}
						>
							{grantedPercentage}% Granted
						</Badge>
					</div>

					<!-- Visual Progress Bar -->
					<div
						class="w-full h-2 rounded-full bg-muted overflow-hidden"
					>
						<div
							class={cn(
								"h-full transition-all duration-300",
								grantedPercentage === 100
									? "bg-emerald-500"
									: "bg-primary",
							)}
							style="width: {grantedPercentage}%"
						></div>
					</div>
				</div>
			</div>

			<!-- Super Admin Unrestricted Alert -->
			{#if isSuperAdmin}
				<div
					class="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 text-foreground"
				>
					<LockIcon class="size-5 text-primary shrink-0 mt-0.5" />
					<div class="space-y-1">
						<h3 class="text-xs font-bold text-primary">
							{t("user.access.superAdminNoticeTitle")}
						</h3>
						<p
							class="text-xs text-muted-foreground leading-relaxed"
						>
							{t("user.access.superAdminNoticeDesc")}
						</p>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Action & Filter Bar (full width) -->
	<Card.Root class="w-full space-y-3 border-border/70 shadow-2xs">
		<Card.Content
			class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3"
		>
			<!-- Search & Module Filter -->
			<div
				class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1"
			>
				<!-- Search Column - full width -->
				<div class="relative flex-1">
					<SearchIcon
						class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10"
					/>
					<Input
						type="text"
						role="searchbox"
						bind:value={searchQuery}
						placeholder={t("user.access.searchPermissions")}
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

				<!-- Module Filter -->
				<div class="w-full sm:w-56 shrink-0">
					<Select.Root
						type="single"
						bind:value={selectedModuleId}
						items={[
							{
								value: "all",
								label: t("user.access.filterModule"),
							},
							...modulePermissionGroups.map((g) => ({
								value: g.id,
								label: g.name,
							})),
						]}
					>
						<Select.Trigger
							class="h-10 w-full rounded-lg border border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground shadow-xs cursor-pointer hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/60 transition-colors justify-between"
						>
							<Select.Value
								placeholder={t("user.access.filterModule")}
								class="truncate text-left"
							/>
						</Select.Trigger>
						<Select.Content>
							<Select.Item
								value="all"
								label={t("user.access.filterModule")}
							>
								{t("user.access.filterModule")}
							</Select.Item>
							{#each modulePermissionGroups as g}
								<Select.Item value={g.id} label={g.name}>
									{g.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Bulk Action Buttons -->
			<div class="flex flex-wrap items-center gap-2 shrink-0">
				<Button.Root
					variant="outline"
					size="sm"
					type="button"
					disabled={isSuperAdmin}
					onclick={handleGrantAll}
					class="h-10 px-3.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-card hover:bg-muted text-foreground flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs transition-colors"
				>
					<CheckCheckIcon
						class="size-4 text-emerald-600 dark:text-emerald-400"
					/>
					<span>{t("user.access.grantAll")}</span>
				</Button.Root>

				<Button.Root
					variant="outline"
					size="sm"
					type="button"
					disabled={isSuperAdmin}
					onclick={handleRevokeAll}
					class="h-10 px-3.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-card hover:bg-muted text-foreground flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs transition-colors"
				>
					<XIcon class="size-4 text-rose-600 dark:text-rose-400" />
					<span>{t("user.access.revokeAll")}</span>
				</Button.Root>

				<Button.Root
					variant="outline"
					size="sm"
					type="button"
					disabled={isSuperAdmin}
					onclick={handleResetDefaults}
					class="h-10 px-3.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-card hover:bg-muted text-foreground flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs transition-colors"
				>
					<RotateCcwIcon class="size-4 text-muted-foreground" />
					<span>{t("user.access.resetDefaults")}</span>
				</Button.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Permissions Matrix by Module -->
	<div class="space-y-5">
		{#if filteredModuleGroups.length === 0}
			<Card.Root class="border-border/70 shadow-2xs">
				<Card.Content class="p-12 text-center">
					<div
						class="flex flex-col items-center justify-center gap-2"
					>
						<ShieldAlertIcon
							class="size-10 text-muted-foreground/40"
						/>
						<p class="text-sm font-semibold text-foreground">
							{t("user.access.emptyState")}
						</p>
						<Button.Root
							variant="outline"
							size="sm"
							onclick={() => {
								searchQuery = "";
								selectedModuleId = "all";
							}}
							class="text-xs h-8 mt-2"
						>
							{t("user.role.reset")}
						</Button.Root>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			{#each filteredModuleGroups as group (group.id)}
				{@const groupPermIds = group.permissions.map((p) => p.id)}
				{@const groupEnabledCount = groupPermIds.filter((id) =>
					isGranted(id),
				).length}
				{@const isAllInGroupGranted =
					groupEnabledCount === group.permissions.length}

				<Card.Root class="border-border/70 shadow-2xs overflow-hidden">
					<!-- Module Group Header -->
					<Card.Header
						class="pb-3 border-b border-border/50 bg-muted/30"
					>
						<div
							class="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
						>
							<div class="space-y-0.5">
								<div class="flex items-center gap-2">
									<Card.Title
										class="text-sm font-bold text-foreground"
									>
										{group.name}
									</Card.Title>
									<Badge
										variant="outline"
										class="text-[10px] font-semibold bg-background"
									>
										{groupEnabledCount} / {group.permissions
											.length} active
									</Badge>
								</div>
								<Card.Description
									class="text-xs text-muted-foreground"
								>
									{group.description}
								</Card.Description>
							</div>

							<!-- Quick Group Toggle Button -->
							<Button.Root
								variant="ghost"
								size="sm"
								type="button"
								disabled={isSuperAdmin}
								onclick={() => toggleGroup(group)}
								class="h-8 px-2.5 text-xs font-medium cursor-pointer self-start sm:self-auto hover:bg-muted text-muted-foreground hover:text-foreground"
							>
								{#if isAllInGroupGranted}
									<XIcon class="size-3 mr-1 text-rose-500" />
									<span>Revoke Module</span>
								{:else}
									<CheckIcon
										class="size-3 mr-1 text-emerald-500"
									/>
									<span>Grant Module</span>
								{/if}
							</Button.Root>
						</div>
					</Card.Header>

					<!-- Module Permission Items Grid -->
					<Card.Content class="p-4 sm:p-5">
						<div
							class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
						>
							{#each group.permissions as perm (perm.id)}
								{@const granted = isGranted(perm.id)}
								{@const badgeInfo = getActionBadge(perm.action)}

								<div
									class={cn(
										"flex items-start justify-between gap-3 p-3.5 rounded-lg border transition-all",
										granted
											? "border-primary/30 bg-primary/2 shadow-2xs"
											: "border-border/70 bg-card hover:border-border",
									)}
								>
									<div
										class="space-y-1.5 flex-1 min-w-0 pr-2"
									>
										<div
											class="flex items-center gap-2 flex-wrap"
										>
											<span
												class="text-xs font-semibold text-foreground leading-tight"
											>
												{perm.name}
											</span>
											<Badge
												class={cn(
													"text-[10px] px-1.5 py-0 h-4 font-medium border uppercase tracking-wider",
													badgeInfo.class,
												)}
											>
												{badgeInfo.label}
											</Badge>
										</div>
										<p
											class="text-[11px] text-muted-foreground leading-snug"
										>
											{perm.description}
										</p>
										<code
											class="text-[10px] font-mono text-muted-foreground/80 block"
										>
											{perm.id}
										</code>
									</div>

									<div class="pt-0.5 shrink-0">
										<Switch
											checked={granted}
											disabled={isSuperAdmin}
											onCheckedChange={() =>
												togglePermission(perm.id)}
											class="cursor-pointer data-[state=checked]:bg-primary"
										/>
									</div>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		{/if}
	</div>

	<!-- Bottom Action Bar -->
	<div class="flex items-center justify-between pt-2">
		<a
			href="/user/role"
			class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
		>
			<ShieldIcon class="size-3.5" />
			<span>Back to Roles List</span>
		</a>

		<Button.Root
			type="button"
			onclick={handleSave}
			disabled={isSaving}
			class="h-9 px-5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer flex items-center gap-2 shadow-sm"
		>
			{#if isSaving}
				<LoaderCircleIcon class="size-4 animate-spin" />
			{:else}
				<SaveIcon class="size-4" />
			{/if}
			<span>{t("user.access.savePermissions")}</span>
		</Button.Root>
	</div>
</div>
