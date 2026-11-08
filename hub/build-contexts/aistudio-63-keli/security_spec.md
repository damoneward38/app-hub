# Security Specification - KELI Healing Platform

## 1. Data Invariants
- A `Session` must have a `userId` matching the authenticated user.
- A `User` profile can only be created/updated by the user themselves (except for roles).
- `Protocol` documents can be read by anyone, but only created/edited by authenticated users.
- Administrative access is granted only to users in the `/admins/` collection.

## 2. Global Safety Net
- Default deny: `match /{document=**} { allow read, write: if false; }`

## 3. The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create a session for another user's ID.
2. **Privilege Escalation**: Attempt to set `role: 'admin'` on own user profile.
3. **Orphaned Write**: Create a protocol with a non-existent or invalid frequency list.
4. **ID Poisoning**: Use a 2KB string as a `userId`.
5. **Timestamp Fraud**: Set `createdAt` to a future date instead of `request.time`.
6. **Shadow Fields**: Add `isVerified: true` to a protocol document.
7. **Cross-User Edit**: User A attempts to delete User B's session.
8. **Malicious Frequency**: Set a frequency to -1,000,000 Hz.
9. **Admin Spoofing**: Attempt to write to the `/admins/` collection.
10. **Unauthenticated Read**: Attempt to list all users' private info.
11. **Negative Duration**: Set session duration to -60 seconds.
12. **O2 Toxicity**: Set O2 level to 500%.

## 4. Admin Bootstrap
- User Email: `damoneward38@gmail.com`
- This user should be manually added to the `admins` collection in the Firebase console, or the rules will check their email (though collection-based is safer).

## 5. Security Principles
- **Master Gate**: Access to session details is nested via UID.
- **isValid[Entity]**: Strict type and boundary checks for all inputs.
- **Action-Based Updates**: Only specific fields can change after creation.
