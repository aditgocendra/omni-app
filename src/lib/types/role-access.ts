export type RoleStatus = "active" | "disable";

export interface RoleRecord {
	id: string;
	name: string;
	key: string;
	description: string;
	usersCount: number;
	status: RoleStatus;
	isSystem?: boolean;
	createdAt: string;
	updatedAt?: string;
}

export type PermissionAction =
	| "view"
	| "create"
	| "edit"
	| "delete"
	| "manage"
	| "export";

export interface PermissionItem {
	id: string;
	name: string;
	description: string;
	action: PermissionAction;
}

export interface ModulePermissionGroup {
	id: string;
	name: string;
	description: string;
	permissions: PermissionItem[];
}

