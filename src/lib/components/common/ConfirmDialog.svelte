<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
	import InfoIcon from "@lucide/svelte/icons/info";
	import CheckIcon from "@lucide/svelte/icons/check";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import type { Component, Snippet } from "svelte";
	import { cn } from "$lib/utils.js";
	import { t } from "$lib/i18n/index.js";

	type DialogVariant = "danger" | "warning" | "info" | "success";

	interface Props {
		open?: boolean;
		title?: string;
		description?: string;
		message?: string;
		submessage?: string;
		variant?: DialogVariant;
		icon?: Component<{ class?: string }>;
		confirmLabel?: string;
		cancelLabel?: string;
		confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
		loading?: boolean;
		class?: string;
		onConfirm?: () => void | Promise<void>;
		onCancel?: () => void;
		children?: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		description,
		message,
		submessage,
		variant = "danger",
		icon: CustomIcon,
		confirmLabel,
		cancelLabel,
		confirmVariant,
		loading = false,
		class: className,
		onConfirm,
		onCancel,
		children,
	}: Props = $props();

	const effectiveTitle = $derived(title ?? t("common.confirmAction"));
	const effectiveCancelLabel = $derived(cancelLabel ?? t("common.cancel"));

	// Computed default labels and button variants based on dialog variant
	const defaultConfirmLabel = $derived.by(() => {
		if (confirmLabel) return confirmLabel;
		switch (variant) {
			case "danger":
				return t("common.deleteNow");
			case "warning":
				return t("common.confirm");
			case "success":
				return t("common.save");
			default:
				return t("common.confirm");
		}
	});

	const effectiveButtonVariant = $derived.by(() => {
		if (confirmVariant) return confirmVariant;
		return variant === "danger" ? "destructive" : "default";
	});

	// Variant styling maps for the header icon badge
	const badgeStyles: Record<DialogVariant, string> = {
		danger: "bg-red-500/10 text-red-600 dark:text-red-400",
		warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
		info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	};

	const buttonStyles: Record<DialogVariant, string> = {
		danger: "bg-red-600 hover:bg-red-700 text-white",
		warning: "bg-amber-600 hover:bg-amber-700 text-white",
		info: "bg-primary hover:bg-primary/90 text-white",
		success: "bg-emerald-600 hover:bg-emerald-700 text-white",
	};

	// Default icons per variant
	const defaultIcons: Record<DialogVariant, Component<{ class?: string }>> = {
		danger: Trash2Icon,
		warning: AlertTriangleIcon,
		info: InfoIcon,
		success: CheckIcon,
	};

	const ResolvedIcon = $derived(CustomIcon || defaultIcons[variant]);

	async function handleConfirm() {
		if (loading) return;
		if (onConfirm) {
			await onConfirm();
		}
		open = false;
	}

	function handleCancel() {
		if (loading) return;
		if (onCancel) {
			onCancel();
		}
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class={cn(
			"w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-xl",
			className
		)}
	>
		<!-- Header with badge icon and title -->
		<Dialog.Header class="pb-3 border-b border-border/60 text-left">
			<div class="flex items-center gap-3">
				<div
					class={cn(
						"flex size-10 shrink-0 items-center justify-center rounded-full",
						badgeStyles[variant]
					)}
				>
					<ResolvedIcon class="size-5" />
				</div>
				<div>
					<Dialog.Title class="font-heading text-base font-bold text-foreground">
						{effectiveTitle}
					</Dialog.Title>
					{#if description}
						<Dialog.Description class="text-xs text-muted-foreground mt-0.5">
							{description}
						</Dialog.Description>
					{:else}
						<Dialog.Description class="sr-only">
							{effectiveTitle}
						</Dialog.Description>
					{/if}
				</div>
			</div>
		</Dialog.Header>

		<!-- Body: text message or custom slot -->
		<div class="py-3 text-xs sm:text-sm text-foreground space-y-2">
			{#if children}
				{@render children()}
			{:else}
				{#if message}
					<p>{message}</p>
				{/if}
				{#if submessage}
					<p class="text-xs text-muted-foreground">{submessage}</p>
				{/if}
			{/if}
		</div>

		<!-- Footer actions -->
		<Dialog.Footer
			class="flex items-center justify-end gap-2 pt-3 border-t border-border/60"
		>
			<Button.Root
				type="button"
				variant="outline"
				size="sm"
				disabled={loading}
				onclick={handleCancel}
				class="text-xs cursor-pointer"
			>
				{effectiveCancelLabel}
			</Button.Root>

			<Button.Root
				type="button"
				variant={effectiveButtonVariant}
				size="sm"
				disabled={loading}
				onclick={handleConfirm}
				class={cn(
					"text-xs font-semibold cursor-pointer gap-1.5 shadow-xs transition-colors",
					variant === "danger"
						? "bg-red-600 hover:bg-red-700 text-white border-transparent"
						: (!confirmVariant && buttonStyles[variant])
				)}
			>
				{#if loading}
					<LoaderCircleIcon class="size-3.5 animate-spin" />
					<span>{t("common.processing")}</span>
				{:else}
					{#if variant === "danger"}
						<Trash2Icon class="size-3.5 text-white" />
					{/if}
					<span>{defaultConfirmLabel}</span>
				{/if}
			</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
