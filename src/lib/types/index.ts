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

export type ProductStatus = "active" | "disable";

export interface ProductVariant {
	id: string;
	name: string;
	sku: string;
	skuSuffix?: string;
	image?: string;
	stock: number;
	price?: number;
	status?: ProductStatus;
	attributes?: Record<string, string>;
	weight?: number;
	length?: number;
	width?: number;
	height?: number;
}

export interface ProductRecord {
	id: string;
	name: string;
	sku: string;
	image: string;
	category: string;
	merk: string;
	warehouse: string;
	stock: number;
	status: ProductStatus;
	createdAt: string;
	variants?: ProductVariant[];
	price?: number;
	description?: string;
	weight?: number;
	length?: number;
	width?: number;
	height?: number;
}

export interface ProductCategoryRecord {
	id: string;
	code: string; // 3 uppercase letters, e.g. "ELC"
	category: string;
	products: number;
	createdAt: string;
	description?: string;
}

export interface ProductMerkRecord {
	id: string;
	merk: string;
	products: number;
	createdAt: string;
	origin?: string;
}

export interface PosTransactionItem {
	productId: string;
	name: string;
	sku: string;
	price: number;
	qty: number;
	total: number;
	image?: string;
}

export type PaymentMethod = "Cash" | "QRIS" | "Debit Card" | "Credit Card";

export interface PosTransactionRecord {
	id: string;
	transactionId: string; // e.g. "ID20261030001"
	date: string; // e.g. "30/10/2026 14:35"
	qty: number; // e.g. 2
	totalPayment: number; // e.g. 200000
	warehouse: string;
	cashierName: string;
	paymentMethod: PaymentMethod;
	items: PosTransactionItem[];
	notes?: string;
}

export interface PosSettingConfig {
	prefix: string;
	datePattern: "YYYYMMDD" | "YYMMDD" | "YYYYMM";
	sequenceDigits: number; // 3, 4, 5
	separator: "" | "-" | "/";
	counterResetFrequency: "daily" | "monthly" | "yearly" | "never";
	defaultWarehouse: string;
	defaultTaxRate: number;
	autoPrintReceipt: boolean;
	allowManualDiscount: boolean;
}

// ==========================================
// E-Commerce Module Types
// ==========================================

export type ShippingServiceType =
	| "Instant"
	| "Instant Prioritas"
	| "Hemat"
	| "Reguler";

export type EcommerceOrderStatus =
	| "Perlu Diproses"
	| "Telah Diproses"
	| "Siap Dikirim"
	| "Dalam Pengiriman"
	| "Selesai"
	| "Dibatalkan";

export interface EcommerceOrderItem {
	id: string;
	productId: string;
	productName: string;
	sku: string;
	variant: string; // e.g. "1 Meter", "Black - 2 Meter"
	image: string;
	price: number;
	qty: number;
	total: number;
}

export interface EcommerceOrderRecord {
	id: string;
	orderNumber: string; // e.g. "261031SHP001"
	channel: "Shopee" | "Tokopedia" | "Lazada" | "TikTok Shop";
	storeAccount: string; // e.g. "Official Store Jakarta"
	date: string; // e.g. "31/10/2026"
	orderStatus: EcommerceOrderStatus;
	shippingStatus: string; // e.g. "Perlu Diproses"
	shippingDeadline: string; // e.g. "02/11/2026 23:59"
	shippingService: ShippingServiceType;
	courierName: string; // e.g. "GrabExpress Instant", "J&T Reguler"
	trackingNumber?: string;
	revenue: number;
	customerName: string;
	customerPhone: string;
	shippingAddress: string;
	isArranged: boolean; // true if pickup or shipment has been arranged
	items: EcommerceOrderItem[];
	notes?: string;
}

export interface EcommerceCopyItem {
	id: string;
	name: string;
	sku: string;
	sourceChannel: string;
	targetChannel: string;
	price: number;
	stock: number;
	image: string;
	status: "Product" | "Draft" | "Copied";
	variantsCount: number;
	updatedAt: string;
}

export interface EcommerceStoreIntegration {
	id: string;
	channel: "Shopee" | "Tokopedia" | "Lazada" | "TikTok Shop" | "Blibli";
	storeName: string;
	storeAccount: string;
	storeUrl?: string;
	isConnected: boolean;
	connectedAt: string;
	lastSyncAt: string;
	autoSyncStock: boolean;
	autoSyncOrders: boolean;
	activeProductCount: number;
}

export interface EcommerceSettingsConfig {
	webhookCallbackUrl: string;
	webhookSecret: string;
	webhookEvents: {
		orderCreated: boolean;
		orderPaid: boolean;
		orderCancelled: boolean;
		trackingUpdated: boolean;
		stockUpdated: boolean;
	};
	stockDeductionTiming: "order_created" | "order_paid";
	stockWarehouseAllocation: "auto_nearest" | "default_warehouse";
	safetyStockBuffer: number;
}

export * from "./data-module.js";
export * from "./role-access.js";

