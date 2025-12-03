/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as alarms from "../alarms.js";
import type * as calls from "../calls.js";
import type * as crons from "../crons.js";
import type * as friends from "../friends.js";
import type * as leaderboard from "../leaderboard.js";
import type * as matching from "../matching.js";
import type * as notifications from "../notifications.js";
import type * as streaks from "../streaks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  alarms: typeof alarms;
  calls: typeof calls;
  crons: typeof crons;
  friends: typeof friends;
  leaderboard: typeof leaderboard;
  matching: typeof matching;
  notifications: typeof notifications;
  streaks: typeof streaks;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
