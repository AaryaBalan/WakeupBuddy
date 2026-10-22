# 👤 Convex Backend - Users Functions Reference (`convex/users.js`)

This document provides a technical specification for all functions managing user identities, authentication, profile settings, and community moderation.

---

## 1. `createUser` (Mutation)

### Purpose
Registers a new user account, enforces email uniqueness, securely hashes the password with bcrypt, and sets up default profile fields.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `name` | `v.string()` | Yes | Full display name |
| `email` | `v.string()` | Yes | Unique email address |
| `password` | `v.string()` | Yes | Plaintext password |
| `phone` | `v.string()` | Yes | Phone number for wake-up calls |
| `bio` | `v.optional(v.string())` | No | Optional user bio |

### Execution Logic
1. Queries `users` using `.withIndex('by_email', q => q.eq('email', args.email))`.
2. If an existing record is found, throws an Error: `"User already exists"`.
3. Hashes password synchronously using `bcrypt.hashSync(args.password, 10)` (synchronous method ensures compatibility with Convex's determinism requirements).
4. Derives initial `username` from email prefix (e.g. `alex@example.com` -> `alex`).
5. Inserts document into `users` table and returns the generated `Id<"users">`.

### Return Value
`Id<"users">` - The newly created user document ID.

### Example Client Usage
```javascript
const createUser = useMutation(api.users.createUser);
const userId = await createUser({
    name: "Alex Rivera",
    email: "alex@example.com",
    password: "SecurePassword123!",
    phone: "+15551234567",
    bio: "Early bird aspiring"
});
```

---

## 2. `loginUser` (Mutation)

### Purpose
Authenticates user login credentials against the stored bcrypt password hash.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `email` | `v.string()` | Yes | User's email |
| `password` | `v.string()` | Yes | Plaintext password entered in login form |

### Execution Logic
1. Looks up the user by email using index `by_email`.
2. If not found, returns `{ success: false, error: "User not found" }`.
3. Validates the password using `bcrypt.compareSync(args.password, user.password)`.
4. If invalid, returns `{ success: false, error: "Incorrect password" }`.
5. If valid, returns `{ success: true, user: { ...safeUserFields } }`, stripping the password hash for security.

### Return Value
```typescript
{
    success: boolean,
    error?: string,
    user?: {
        _id: Id<"users">,
        name: string,
        email: string,
        username: string,
        bio: string,
        streak: number,
        maxStreak: number,
        profile_code: string,
        phone: string
    }
}
```

---

## 3. `getUserByEmail` (Query)

### Purpose
Reactive query fetching full profile details for a user given their email.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `email` | `v.string()` | Yes | Target user email |

### Execution Logic
Performs index lookup on `users.by_email` and returns the matching document.

### Return Value
`Document<"users"> | null`

---

## 4. `getUserById` (Query)

### Purpose
Fetches sanitized public profile information by user ID.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userId` | `v.id("users")` | Yes | Target user ID |

### Execution Logic
1. Executes `ctx.db.get(args.userId)`.
2. Returns sanitized object omitting the `password` field.

---

## 5. `updateUser` (Mutation)

### Purpose
Updates editable user profile fields (name, bio, phone number, profile image).

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `v.id("users")` | Yes | User document ID |
| `name` | `v.optional(v.string())` | No | New display name |
| `bio` | `v.optional(v.string())` | No | New bio |
| `phone` | `v.optional(v.string())` | No | New phone number |
| `profileImage` | `v.optional(v.string())` | No | Image URL / seed |

### Execution Logic
Patches only the defined fields in the `users` document using `ctx.db.patch(id, updates)`.

---

## 6. `changePassword` (Mutation)

### Purpose
Allows an authenticated user to change their password after verifying their current password.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userId` | `v.id("users")` | Yes | User document ID |
| `currentPassword` | `v.string()` | Yes | Existing plaintext password |
| `newPassword` | `v.string()` | Yes | New plaintext password |

### Execution Logic
1. Retrieves user record.
2. Checks `bcrypt.compareSync(args.currentPassword, user.password)`. If mismatched, returns `{ success: false, error: "Current password is incorrect" }`.
3. Hashes new password with `bcrypt.hashSync(args.newPassword, 10)` and patches `users` document.
4. Returns `{ success: true, message: "Password changed successfully" }`.

---

## 7. `getAllUsers` (Query)

### Purpose
Fetches a list of all registered users for the **Explore** discovery screen, omitting password data and excluding the requesting user.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `excludeEmail` | `v.optional(v.string())` | No | Email of the calling user to exclude from results |

### Execution Logic
Collects all users from `users` table and filters out `args.excludeEmail`. Maps each record to return safe public profile keys.

---

## 8. `updateProfileCode` (Mutation)

### Purpose
Updates the `profile_code` string used to deterministically render the user's DiceBear avatar.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `v.id("users")` | Yes | User ID |
| `profile_code` | `v.string()` | Yes | New avatar seed |

---

## 9. `reportUser` (Mutation)

### Purpose
Files a moderation report against an abusive or fraudulent user. Prevents self-reporting and duplicate spam reports, and increments the reported user's `reportCount`.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `reporterEmail` | `v.string()` | Yes | Email of the user submitting the report |
| `reportedUserId` | `v.id("users")` | Yes | Target user being reported |
| `reason` | `v.string()` | Yes | Category of violation |
| `description` | `v.optional(v.string())` | No | Additional context |

### Execution Logic
1. Confirms reporter exists and ensures `reporter._id !== args.reportedUserId` (throws `"Cannot report yourself"`).
2. Checks if reporter already has a pending report against this user (throws `"You have already reported this user"`).
3. Inserts document into `reports` table with status `"pending"`.
4. Increments `reportCount` on target user's document (`reportCount = (reportCount || 0) + 1`). If `reportCount > 3`, client automatically enforces banned state.

---

## 10. `hasReportedUser` (Query)

### Purpose
Checks whether the current user has already submitted a report against a given user ID to disable duplicate report buttons in the UI.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `reporterEmail` | `v.string()` | Yes | Calling user email |
| `reportedUserId` | `v.id("users")` | Yes | Target user ID |

### Return Value
`boolean` - `true` if report exists, otherwise `false`.
