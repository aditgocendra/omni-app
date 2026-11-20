import type { ModulePermissionGroup } from "./role-access.js";

/**
 * Reusable API Types for Omni-App matching Backend (b-app) OpenAPI / Scalar Specifications
 * Reference: http://localhost:3000/api/v1/docs
 */

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "WAREHOUSE_ADMIN" | "CASHIER" | (string & {});
export type BackendUserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type BackendRoleStatus = "ACTIVE" | "INACTIVE";

/**
 * Role Master DTO Schema
 */
export interface RoleResponseData {
	id: string;
	key: string;
	name: string;
	description?: string | null;
	isSystem: boolean;
	status: BackendRoleStatus;
	usersCount?: number;
}

/**
 * Permission Master DTO Schema
 */
export interface PermissionData {
	id: string;
	code: string;
	name: string;
	module: string;
	action: string;
	description?: string | null;
}

/**
 * Role Details DTO Schema with full permissions
 */
export interface RoleDetailData extends RoleResponseData {
	permissions?: PermissionData[];
	permissionCodes?: string[];
	createdAt: string | Date;
	updatedAt: string | Date;
}

/**
 * Access Matrix & Permissions Catalog Schema
 */
export interface RoleAccessDetailData extends RoleResponseData {
	permissionCodes: string[];
	createdAt: string | Date;
	updatedAt: string | Date;
}

export interface AccessMatrixData {
	modules: ModulePermissionGroup[];
	roles: RoleAccessDetailData[];
	allPermissionCodes: string[];
}

/**
 * Backend User DTO Schema (UserResponse)
 */
export interface BackendUser {
	id: string;
	email: string;
	username: string;
	fullName?: string | null;
	phoneNumber?: string | null;
	roleId?: string;
	role: UserRole;
	roleDetails?: RoleResponseData;
	permissions?: string[];
	status: BackendUserStatus;
	createdAt: string | Date;
	updatedAt: string | Date;
}

/**
 * Startup Status DTO Schema (StartupStatusData)
 */
export interface StartupStatusData {
	isSetupRequired: boolean;
	hasSuperAdmin: boolean;
	userCount: number;
}

/**
 * Login Response DTO Schema (LoginResponseData)
 */
export interface LoginResponseData {
	accessToken: string;
	user: BackendUser;
}

/**
 * Refresh Response DTO Schema (RefreshResponseData)
 */
export interface RefreshResponseData {
	accessToken: string;
}

/**
 * Register Request Payload (RegisterRequest)
 */
export interface RegisterRequestPayload {
	email: string;
	username: string;
	fullName?: string;
	password: string;
	phoneNumber?: string;
	role?: UserRole;
}

/**
 * Login Request Payload (LoginRequest)
 */
export interface LoginRequestPayload {
	email: string;
	password: string;
}

/**
 * User Pagination and List Response
 */
export interface UserPaginationData {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface UserListResponseData {
	items: BackendUser[];
	pagination: UserPaginationData;
}

export interface CreateUserRequestPayload {
	email: string;
	username?: string;
	fullName?: string;
	password: string;
	phoneNumber?: string;
	roleId?: string;
	role?: string;
	status?: BackendUserStatus;
}

export interface UpdateUserRequestPayload {
	fullName?: string;
	email?: string;
	username?: string;
	phoneNumber?: string;
	roleId?: string;
	role?: string;
	status?: BackendUserStatus;
}

export interface UpdateUserStatusPayload {
	status: BackendUserStatus;
}

export interface AdminResetPasswordPayload {
	password?: string;
	newPassword?: string;
}

export interface BulkDeleteUsersPayload {
	ids: string[];
}

/**
 * Generic API Success Envelope
 */
export interface ApiSuccessResponse<T> {
	success: true;
	message: string;
	data: T;
}

/**
 * Zod validation issue structure from backend validation errors
 */
export interface ApiValidationErrorIssue {
	code?: string;
	path?: (string | number)[];
	message: string;
	expected?: string;
	received?: string;
	origin?: string;
	minimum?: number;
	maximum?: number;
}

/**
 * Validation error container from @hono/zod-openapi
 */
export interface ApiValidationErrorObject {
	name?: string;
	message?: string;
	issues?: ApiValidationErrorIssue[];
}

/**
 * Generic API Error Envelope
 * Accommodates standard ErrorResponse schema, Zod validation errors, and BFF error responses
 */
export interface ApiErrorResponse {
	success: false;
	message?: string;
	error?: ApiValidationErrorObject | string;
	errors?: ApiValidationErrorIssue[] | Record<string, string[] | string> | unknown;
}

/**
 * Generic API Response Union Type
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Discriminated Type Guard for Success Response
 */
export function isApiSuccess<T>(res: ApiResponse<T> | null | undefined): res is ApiSuccessResponse<T> {
	return Boolean(res && res.success === true && "data" in res);
}

/**
 * Discriminated Type Guard for Error Response
 */
export function isApiError(res: unknown): res is ApiErrorResponse {
	return typeof res === "object" && res !== null && (res as { success?: unknown }).success === false;
}

/**
 * Type-safe error message extractor from API response payloads
 */
export function extractApiErrorMessage(data: unknown, fallbackMessage = "An unexpected error occurred"): string {
	if (!data || typeof data !== "object") {
		return fallbackMessage;
	}

	const res = data as Partial<ApiErrorResponse>;

	// 1. Direct message field
	if (typeof res.message === "string" && res.message.trim().length > 0) {
		return res.message;
	}

	// 2. Error object from Zod OpenAPI
	if (res.error) {
		if (typeof res.error === "string") {
			return res.error;
		}
		if (typeof res.error === "object") {
			if (Array.isArray(res.error.issues) && res.error.issues.length > 0) {
				const messages = res.error.issues
					.map((i) => i.message)
					.filter((m): m is string => Boolean(m) && m.trim().length > 0);
				if (messages.length > 0) {
					return messages.join(", ");
				}
			}
			if (typeof res.error.message === "string" && res.error.message.trim().length > 0) {
				return res.error.message;
			}
		}
	}

	// 3. Array of error issues
	if (Array.isArray(res.errors) && res.errors.length > 0) {
		const extracted = res.errors
			.map((errItem) => {
				if (typeof errItem === "string") return errItem;
				if (typeof errItem === "object" && errItem !== null && "message" in errItem) {
					return String((errItem as { message: unknown }).message);
				}
				return null;
			})
			.filter((m): m is string => Boolean(m));
		if (extracted.length > 0) {
			return extracted.join(", ");
		}
	}

	return fallbackMessage;
}

/**
 * Type-safe unknown catch clause error extractor
 */
export function extractUnknownErrorMessage(err: unknown, fallbackMessage = "An unexpected error occurred"): string {
	if (err instanceof Error) {
		return err.message;
	}
	if (typeof err === "string" && err.trim().length > 0) {
		return err;
	}
	return fallbackMessage;
}
