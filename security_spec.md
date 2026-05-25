# Security Specifications: Fidelis Private Ledger (Zero-Trust)

This document establishes the Attribute-Based Access Control (ABAC) invariants, the "Dirty Dozen" vulnerability attack scenarios, and the validation patterns required to enforce data isolation, payload integrity, and domain-level validation.

---

## 1. Data Invariants

1. **Strict User Isolation**:
   - A user can only read, write, update, or delete resource paths prefix-matched with their authenticated unique identifier (`/users/{userId}`). Access to any path outside `/users/$(request.auth.uid)` must be denied.
2. **Schema & Typings Integrity**:
   - All transactions must explicitly designate `type` as either `'income'` or `'expense'`.
   - All transaction and category amounts, names, and description fields must conform to strict upper boundary sizes (e.g., no descriptions $> 250$ chars; no categories $> 30$ chars) to prevent Denial of Wallet storage abuse.
3. **Temporal Integrity**:
   - Time-series ledger keys مثل `createdAt` or `updatedAt` must match the server-generated auth time (`request.time`) during creation and modifications.
4. **Authenticity of Sub-Resources**:
   - A sub-resource category or transaction document must contain a `userId` property that matches `request.auth.uid`.

---

## 2. The "Dirty Dozen" Vulnerability Payloads

These 12 payloads represent structured threats that our security rules must synchronously block with `PERMISSION_DENIED`:

### Identity & Spoofing Attacks
1. **User Spoofing (Foreign Document Write)**:
   - *Attack*: Authenticated user `attacker_uid` attempts to update `/users/victim_uid` to hijack their profile.
2. **Identity Attribute Injection (Owner Spoofing)**:
   - *Attack*: Writing `userId: "victim_uid"` inside `/users/attacker_uid/transactions/tx-001` to attribute transactions to someone else.
3. **Immutability Bypass**:
   - *Attack*: Updating an existing category `/users/attacker_uid/categories/cat-001` to modify `userId` or `createdAt` to escape audit logs.

### Value & Schema Poisoning Attacks
4. **Invalid Transaction Type (Enum Violation)**:
   - *Attack*: Creating a transaction with `type: "asset_transfer"` to corrupt query aggregations.
5. **Denial of Wallet Storage Attack (Massive Payload)**:
   - *Attack*: Creating a transaction with a `note` containing 500KB of random gibberish to inflate storage charges.
6. **Negative Transfer Attack**:
   - *Attack*: Creating a transaction with a negative amount (`amount: -5000`) or non-numeric amount (`amount: "NaN"`) to corrupt ledger calculations.
7. **Empty String Layout Crasher**:
   - *Attack*: Creating a category with empty strings `""` for name, icon, or color to break layout rendering on the dashboard.
8. **Invalid Path ID Poisoning**:
   - *Attack*: Attempting a single-document write using an enormously long ID containing poison SQL/regex components like `/users/attacker_uid/transactions/POISON_.._select_*_from_users`.

### Relational & Boundary Corruption
9. **Orphaned Sub-Resource (Non-existent Category Link)**:
   - *Attack*: Specifying a random, non-existent `categoryId` like `"invalid-uuid-9999"` during transaction creation.
10. **State/Category Cross-Pollination**:
    - *Attack*: Attempting to change a transaction's category from an `expense` category to an `income` category while the transaction type itself remains `expense`.
11. **Direct Data Scraping (Secure List Bypass)**:
    - *Attack*: Unauthenticated scan or querying `/users/victim_uid/transactions` directly.
12. **PII Collection Harvesting**:
    - *Attack*: Trying to scan `/users` or reading another user's personal details document.

---

## 3. Recommended Firebase Security Rules Schema Blueprint

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Global Safety Net - Default Deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
