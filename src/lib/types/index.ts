export type SalesChannelType = "shopee" | "tiktok" | "offline" | "tokopedia";

export interface OmnichannelMetric {
	title: string;
	value: string | number;
	description?: string;
	trend?: "up" | "down" | "neutral";
	trendValue?: string;
}

export interface OmnichannelTransaction {
	id: string;
	invoiceNumber: string;
	channel: SalesChannelType;
	amount: number;
	amountFormatted: string;
	itemsCount: number;
	timestamp: string;
	status: "completed" | "processing" | "pending" | "cancelled";
	statusLabel: string;
}

export interface WarehouseStockItem {
	sku: string;
	name: string;
	category: string;
	stock: number;
	minStock: number;
	warehouseLocation: string;
	isLowStock: boolean;
}

export interface BranchLocation {
	name: string;
	code: string;
	type: "warehouse" | "store";
	plan: string;
}

export interface WarehouseRecord {
	id: string;
	warehouse: string;
	products: number;
	manager: string;
	createdAt: string;
	location?: string;
}

export type TransferStatus = "Success" | "Pending" | "Cancelled";

export interface StockTransferRecord {
	id: string;
	codeTransfer: string;
	date: string;
	origin: string;
	destination: string;
	products: number;
	status: TransferStatus;
	manager?: string;
}

export type OpnameStatus = "Completed" | "Draft";

export interface StockOpnameRecord {
	id: string;
	code: string;
	date: string;
	warehouse: string;
	productsVariant: string;
	recorder: string;
	status: OpnameStatus;
}

export type UserStatus = "active" | "disable";

export interface UserRecord {
	id: string;
	name: string;
	email: string;
	role: string;
	status: UserStatus;
	createdAt: string;
	phone?: string;
	avatar?: string;
}
