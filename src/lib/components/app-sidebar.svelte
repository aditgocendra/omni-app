<script lang="ts">
	import BoxIcon from "@lucide/svelte/icons/box";
	import PackageIcon from "@lucide/svelte/icons/package";
	import UsersIcon from "@lucide/svelte/icons/users";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
	import NavMain from "./nav-main.svelte";
	import NavUser from "./nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { t } from "$lib/i18n/index.js";
	import { page } from "$app/state";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		collapsible = "icon",
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();

	const currentPath = $derived(page.url.pathname);

	const navMain = $derived([
		{
			title: t("nav.product"),
			url: "/product/manage",
			icon: PackageIcon,
			isActive: currentPath.startsWith("/product"),
			items: [
				{
					title: t("nav.manageProduct"),
					url: "/product/manage",
					isActive:
						currentPath.startsWith("/product/manage") ||
						currentPath === "/product",
				},
				{
					title: t("nav.categories"),
					url: "/product/categories",
					isActive: currentPath.startsWith("/product/categories"),
				},
				{
					title: t("nav.merk"),
					url: "/product/merk",
					isActive: currentPath.startsWith("/product/merk"),
				},
			],
		},
		{
			title: t("nav.inventory"),
			url: "/inventory/warehouse",
			icon: BoxIcon,
			isActive: currentPath.startsWith("/inventory"),
			items: [
				{
					title: t("nav.warehouse"),
					url: "/inventory/warehouse",
					isActive: currentPath.startsWith("/inventory/warehouse"),
				},
				{
					title: t("nav.stockTransfer"),
					url: "/inventory/stock-transfer",
					isActive: currentPath.startsWith(
						"/inventory/stock-transfer",
					),
				},
				{
					title: t("nav.stockOpname"),
					url: "/inventory/stock-opname",
					isActive: currentPath.startsWith("/inventory/stock-opname"),
				},
			],
		},
		{
			title: t("nav.user"),
			url: "/user/manage",
			icon: UsersIcon,
			isActive: currentPath.startsWith("/user"),
			items: [
				{
					title: t("nav.manageUser"),
					url: "/user/manage",
					isActive:
						currentPath.startsWith("/user/manage") ||
						currentPath === "/user",
				},
			],
		},
		{
			title: t("nav.settings"),
			url: "/settings/general",
			icon: SettingsIcon,
			isActive: currentPath.startsWith("/settings"),
			items: [
				{
					title: t("nav.general"),
					url: "/settings/general",
					isActive:
						currentPath.startsWith("/settings/general") ||
						currentPath === "/settings",
				},
				{
					title: t("nav.account"),
					url: "/settings/account",
					isActive: currentPath.startsWith("/settings/account"),
				},
				{
					title: t("nav.notifications"),
					url: "/settings/notifications",
					isActive: currentPath.startsWith("/settings/notifications"),
				},
			],
		},
	]);

	const user = {
		name: "Adit Gocendra",
		email: "adit@omniflow.id",
		avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
	};
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					size="lg"
					class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					{#snippet child({ props }: { props: Record<string, unknown> })}
						<a href="/" {...props}>
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-xs"
							>
								<GalleryVerticalEndIcon class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span
									class="font-heading font-semibold text-sm tracking-tight text-sidebar-foreground"
									>Cronsyst</span
								>
								<span
									class="text-[11px] text-muted-foreground font-medium"
									>v1.0.0</span
								>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={navMain} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
