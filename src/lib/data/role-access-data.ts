import type {
	RoleRecord,
	ModulePermissionGroup,
} from "$lib/types/index.js";

export const initialRoles: RoleRecord[] = [
	{
		id: "role-1",
		name: "Super Admin",
		key: "super_admin",
		description:
			"Full unrestricted access across all omnichannel operations, financial data, and security governance.",
		usersCount: 2,
		status: "active",
		isSystem: true,
		createdAt: "15/01/2026",
	},
	{
		id: "role-2",
		name: "Admin",
		key: "admin",
		description:
			"Primary operational administration for product catalog, marketplace order processing, and user accounts.",
		usersCount: 3,
		status: "active",
		isSystem: true,
		createdAt: "18/01/2026",
	},
	{
		id: "role-3",
		name: "Warehouse Manager",
		key: "warehouse_manager",
		description:
			"Supervises multi-facility warehouse stock, inter-warehouse transfers, physical audits, and dispatch.",
		usersCount: 3,
		status: "active",
		isSystem: false,
		createdAt: "22/01/2026",
	},
	{
		id: "role-4",
		name: "Inventory Staff",
		key: "inventory_staff",
		description:
			"Handles day-to-day stock opname counts, shelf inventory logs, and outbound parcel packaging.",
		usersCount: 4,
		status: "active",
		isSystem: false,
		createdAt: "01/02/2026",
	},
	{
		id: "role-5",
		name: "Cashier",
		key: "cashier",
		description:
			"Frontline retail point of sale counter operator, checkout receipts, and cash register shifts.",
		usersCount: 3,
		status: "active",
		isSystem: false,
		createdAt: "10/02/2026",
	},
	{
		id: "role-6",
		name: "Finance & Accounting",
		key: "finance",
		description:
			"Financial analytics reporting, gross profit HPP margins, operational cost parameters, and asset valuation.",
		usersCount: 1,
		status: "active",
		isSystem: false,
		createdAt: "20/02/2026",
	},
	{
		id: "role-7",
		name: "E-Commerce Specialist",
		key: "ecommerce_specialist",
		description:
			"Manages multi-store marketplace listings, mass shipping dispatches, and flash sale product copies.",
		usersCount: 2,
		status: "active",
		isSystem: false,
		createdAt: "24/02/2026",
	},
	{
		id: "role-8",
		name: "Customer Support Lead",
		key: "customer_support",
		description:
			"Customer service resolution, marketplace order inquiries, return claims, and customer satisfaction.",
		usersCount: 2,
		status: "active",
		isSystem: false,
		createdAt: "26/02/2026",
	},
	{
		id: "role-9",
		name: "Store Supervisor",
		key: "store_supervisor",
		description:
			"Supervises offline retail stores, cashier shifts, daily cash closings, and point of sale terminals.",
		usersCount: 1,
		status: "active",
		isSystem: false,
		createdAt: "28/02/2026",
	},
	{
		id: "role-10",
		name: "Auditor & Compliance",
		key: "auditor",
		description:
			"Independent operational audit reviews, inventory stock opname reconciliation, and valuation checks.",
		usersCount: 1,
		status: "active",
		isSystem: false,
		createdAt: "02/03/2026",
	},
	{
		id: "role-11",
		name: "Junior Catalog Staff",
		key: "catalog_staff",
		description:
			"Assists with entering product specifications, uploading variant images, and SKU tagging.",
		usersCount: 2,
		status: "disable",
		isSystem: false,
		createdAt: "05/03/2026",
	},
];

export const modulePermissionGroups: ModulePermissionGroup[] = [
	{
		id: "overview",
		name: "Dashboard & Overview",
		description: "High-level omnichannel sales metrics, channel volume charts, and recent transaction invoices.",
		permissions: [
			{
				id: "overview.view",
				name: "View Dashboard Overview",
				description: "Allows viewing real-time order monitoring, revenue cards, and channel summaries.",
				action: "view",
			},
			{
				id: "overview.export",
				name: "Export Overview Reports",
				description: "Allows exporting overview summaries and chart metrics into CSV / Excel.",
				action: "export",
			},
		],
	},
	{
		id: "product",
		name: "Product Catalog",
		description: "Manage products, variant SKU attributes, brands (merk), and category taxonomy.",
		permissions: [
			{
				id: "product.view",
				name: "View Products & SKUs",
				description: "Allows browsing master product catalog, prices, and variant lists.",
				action: "view",
			},
			{
				id: "product.create",
				name: "Create New Product",
				description: "Allows adding new products, SKU combinations, and uploading product media.",
				action: "create",
			},
			{
				id: "product.edit",
				name: "Edit Products & Variants",
				description: "Allows updating product information, specifications, variant pricing, and status.",
				action: "edit",
			},
			{
				id: "product.delete",
				name: "Delete Products",
				description: "Allows permanently removing product records from the catalog.",
				action: "delete",
			},
			{
				id: "product.categories",
				name: "Manage Categories",
				description: "Allows adding, editing, and deleting 3-letter product categories.",
				action: "manage",
			},
			{
				id: "product.merk",
				name: "Manage Brands (Merk)",
				description: "Allows adding, editing, and deleting brand taxonomy.",
				action: "manage",
			},
		],
	},
	{
		id: "inventory",
		name: "Inventory & Warehouses",
		description: "Multi-warehouse stock allocations, inter-facility transfers, and stock opname auditing.",
		permissions: [
			{
				id: "inventory.warehouse.view",
				name: "View Warehouses",
				description: "Allows viewing warehouse locations, managers, and assigned SKU capacities.",
				action: "view",
			},
			{
				id: "inventory.warehouse.manage",
				name: "Manage Warehouses",
				description: "Allows creating, updating, and modifying warehouse facilities.",
				action: "manage",
			},
			{
				id: "inventory.transfer.view",
				name: "View Stock Transfers",
				description: "Allows viewing origin, destination, and status of stock movements.",
				action: "view",
			},
			{
				id: "inventory.transfer.create",
				name: "Request Stock Transfer",
				description: "Allows creating inter-warehouse stock transfer requisitions.",
				action: "create",
			},
			{
				id: "inventory.transfer.approve",
				name: "Approve Stock Transfer",
				description: "Allows approving, completing, or rejecting stock transfer shipments.",
				action: "manage",
			},
			{
				id: "inventory.opname.view",
				name: "View Stock Opname",
				description: "Allows reviewing physical count audit records and discrepancy logs.",
				action: "view",
			},
			{
				id: "inventory.opname.create",
				name: "Execute Stock Opname",
				description: "Allows conducting physical inventory counts and adjusting stock discrepancies.",
				action: "create",
			},
		],
	},
	{
		id: "pos",
		name: "Point Of Sale (POS)",
		description: "Retail store checkout register, transaction history, receipts, and cashier formatting.",
		permissions: [
			{
				id: "pos.cashier",
				name: "Operate Cashier Register",
				description: "Allows accessing fullscreen cashier station to charge cart orders.",
				action: "manage",
			},
			{
				id: "pos.transaction.view",
				name: "View POS Transactions",
				description: "Allows viewing in-store transaction history and item receipts.",
				action: "view",
			},
			{
				id: "pos.transaction.edit",
				name: "Edit Transaction Notes",
				description: "Allows updating notes, warehouse allocation, and payment labels.",
				action: "edit",
			},
			{
				id: "pos.transaction.delete",
				name: "Void / Delete Transactions",
				description: "Allows deleting or voiding recorded checkout transactions.",
				action: "delete",
			},
			{
				id: "pos.setting",
				name: "Configure POS Settings",
				description: "Allows modifying receipt ID numbering patterns and register preferences.",
				action: "manage",
			},
		],
	},
	{
		id: "ecommerce",
		name: "E-Commerce Channels",
		description: "Multi-channel marketplace orders, mass dispatch, product duplication, and webhooks.",
		permissions: [
			{
				id: "ecommerce.orders.view",
				name: "View Marketplace Orders",
				description: "Allows viewing orders from Shopee, TikTok Shop, Tokopedia, and Lazada.",
				action: "view",
			},
			{
				id: "ecommerce.orders.process",
				name: "Process Shipping & Pickup",
				description: "Allows scheduling courier pickups, drop-offs, and generating airway bills.",
				action: "manage",
			},
			{
				id: "ecommerce.orders.mass_shipping",
				name: "Execute Mass Shipping",
				description: "Allows batch airway bill generation and bulk label PDF printing.",
				action: "manage",
			},
			{
				id: "ecommerce.copy",
				name: "Copy Products to Channels",
				description: "Allows duplicating catalog products between store storefronts.",
				action: "manage",
			},
			{
				id: "ecommerce.integration",
				name: "Manage Store Integrations",
				description: "Allows authorizing and connecting new marketplace seller accounts.",
				action: "manage",
			},
			{
				id: "ecommerce.setting",
				name: "Configure Webhooks & Rules",
				description: "Allows setting up webhook endpoints and automated stock deduction triggers.",
				action: "manage",
			},
		],
	},
	{
		id: "data",
		name: "Business Data & Financials",
		description: "COGS profitability, order financial performance, operational expenses, and asset valuation.",
		permissions: [
			{
				id: "data.performance.view",
				name: "View Performance Analytics",
				description: "Allows analyzing orders revenue, COGS, gross profit margins, and sold counts.",
				action: "view",
			},
			{
				id: "data.performance.export",
				name: "Export Sales Data",
				description: "Allows exporting performance datasets to CSV / spreadsheet format.",
				action: "export",
			},
			{
				id: "data.cost.view",
				name: "View Operational Costs",
				description: "Allows monitoring per-order service costs, payroll, and contingency allocations.",
				action: "view",
			},
			{
				id: "data.cost.manage",
				name: "Configure Cost Settings",
				description: "Allows editing operational cost items, active toggle switches, and allowances.",
				action: "manage",
			},
			{
				id: "data.asset.view",
				name: "View Asset Valuation",
				description: "Allows inspecting inventory capital asset value per SKU across warehouses.",
				action: "view",
			},
			{
				id: "data.asset.export",
				name: "Export Asset Reports",
				description: "Allows downloading asset valuation summaries and warehouse breakdowns.",
				action: "export",
			},
		],
	},
	{
		id: "user",
		name: "User & Role Governance",
		description: "Staff accounts, role definitions, and role-based feature permission matrix.",
		permissions: [
			{
				id: "user.manage.view",
				name: "View User Accounts",
				description: "Allows viewing list of team members, roles, and status.",
				action: "view",
			},
			{
				id: "user.manage.create",
				name: "Create User Accounts",
				description: "Allows registering new staff members and assigning roles.",
				action: "create",
			},
			{
				id: "user.manage.edit",
				name: "Edit User Accounts",
				description: "Allows updating user profiles, roles, and resetting credentials.",
				action: "edit",
			},
			{
				id: "user.manage.delete",
				name: "Delete User Accounts",
				description: "Allows permanently removing staff accounts from the system.",
				action: "delete",
			},
			{
				id: "user.role.manage",
				name: "Manage Roles",
				description: "Allows creating, updating, and removing custom system roles.",
				action: "manage",
			},
			{
				id: "user.access.manage",
				name: "Manage Role Permissions",
				description: "Allows granting and revoking feature access per role in permission matrix.",
				action: "manage",
			},
		],
	},
	{
		id: "settings",
		name: "System Settings",
		description: "Global business preferences, personal profile security, and alert notifications.",
		permissions: [
			{
				id: "settings.general",
				name: "Manage General Settings",
				description: "Allows configuring store branding, address, currency, and timezone.",
				action: "manage",
			},
			{
				id: "settings.account",
				name: "Manage Account Security",
				description: "Allows changing personal avatar, password, and contact details.",
				action: "manage",
			},
			{
				id: "settings.notifications",
				name: "Manage Notifications",
				description: "Allows configuring low stock alerts, order notifications, and sound preferences.",
				action: "manage",
			},
		],
	},
];

// Helper to get all permission IDs
export const allPermissionIds: string[] = modulePermissionGroups.flatMap((group) =>
	group.permissions.map((p) => p.id)
);

// Initial Role Permissions mapping
export const initialRolePermissions: Record<string, string[]> = {
	super_admin: [...allPermissionIds],
	admin: allPermissionIds.filter(
		(id) =>
			!id.startsWith("data.cost.manage") &&
			id !== "user.role.manage" &&
			id !== "user.access.manage"
	),
	warehouse_manager: [
		"overview.view",
		"product.view",
		"inventory.warehouse.view",
		"inventory.warehouse.manage",
		"inventory.transfer.view",
		"inventory.transfer.create",
		"inventory.transfer.approve",
		"inventory.opname.view",
		"inventory.opname.create",
		"ecommerce.orders.view",
		"ecommerce.orders.process",
		"ecommerce.orders.mass_shipping",
		"data.asset.view",
		"data.asset.export",
		"settings.account",
	],
	inventory_staff: [
		"product.view",
		"inventory.warehouse.view",
		"inventory.transfer.view",
		"inventory.transfer.create",
		"inventory.opname.view",
		"inventory.opname.create",
		"settings.account",
	],
	cashier: [
		"product.view",
		"pos.cashier",
		"pos.transaction.view",
		"settings.account",
	],
	finance: [
		"overview.view",
		"overview.export",
		"product.view",
		"pos.transaction.view",
		"ecommerce.orders.view",
		"data.performance.view",
		"data.performance.export",
		"data.cost.view",
		"data.cost.manage",
		"data.asset.view",
		"data.asset.export",
		"settings.account",
	],
	ecommerce_specialist: [
		"overview.view",
		"product.view",
		"ecommerce.orders.view",
		"ecommerce.orders.process",
		"ecommerce.orders.mass_shipping",
		"ecommerce.copy",
		"settings.account",
	],
	customer_support: [
		"overview.view",
		"product.view",
		"ecommerce.orders.view",
		"ecommerce.orders.process",
		"pos.transaction.view",
		"settings.account",
	],
	store_supervisor: [
		"overview.view",
		"product.view",
		"pos.cashier",
		"pos.transaction.view",
		"pos.transaction.refund",
		"pos.setting",
		"settings.account",
	],
	auditor: [
		"overview.view",
		"overview.export",
		"product.view",
		"inventory.warehouse.view",
		"inventory.transfer.view",
		"inventory.opname.view",
		"data.performance.view",
		"data.performance.export",
		"data.cost.view",
		"data.asset.view",
		"data.asset.export",
		"settings.account",
	],
	catalog_staff: [
		"product.view",
		"product.create",
		"product.edit",
		"settings.account",
	],
};

