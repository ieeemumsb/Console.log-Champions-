/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

import type * as events from "../events.js";

import type * as accounts from "../accounts.js";
import type * as alerts from "../alerts.js";
import type * as budgets from "../budgets.js";
import type * as dashboard from "../dashboard.js";
import type * as departments from "../departments.js";
import type * as events from "../events.js";
import type * as financial_records from "../financial_records.js";
import type * as forecasts from "../forecasts.js";

import type * as http from "../http.js";
import type * as reports from "../reports.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{

  events: typeof events;
  accounts: typeof accounts;
  alerts: typeof alerts;
  budgets: typeof budgets;
  dashboard: typeof dashboard;
  departments: typeof departments;
  events: typeof events;
  financial_records: typeof financial_records;
  forecasts: typeof forecasts;
  http: typeof http;
  reports: typeof reports;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
