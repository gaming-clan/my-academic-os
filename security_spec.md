# Security Specification - Academic OS

This document outlines the Security Specification, data invariants, the "Dirty Dozen" vulnerability test payloads, and test plans for the Academic OS.

## 1. Data Invariants

- **Ownership Isolation**: Every document (Course, Assignment, Note, Task, Profile) belongs to a specific user identified by `userId`. Users can only read or write their own documents.
- **Id Integrity**: Document IDs must be valid alphanumeric strings of reasonable length (up to 128 characters) and match the regular expression `^[a-zA-Z0-9_\-]+$`.
- **Relational Integrity**:
  - An Assignment must reference an existing Course owned by the same user.
  - A Note must reference an existing Course owned by the same user.
- **Temporal Integrity**: `createdAt` and `updatedAt` are immutable or verified using `request.time`.
- **Value Constraints**:
  - String limits (e.g., titles up to 100 characters, contents up to 50000 characters).
  - Integer range checks (e.g., weights between 0 and 100, progress between 0 and 100).
  - Enumerated status checks (e.g., Task status must be "Not Started", "In Progress", or "Completed").

## 2. The "Dirty Dozen" Payloads

Here are 12 malicious payloads designed to test database security:

1. **Identity Spoofing in Course Creation**: Creating a course with `userId` set to another user's UID.
2. **Ghost Field Injection in Course Creation**: Creating a course containing a random field `isPremium: true` to bypass schemas.
3. **Huge Course ID Poisoning**: Specifying a 2MB document ID containing control characters.
4. **Invalid Course Progress**: Creating/updating a Course with `progress = 150` or `progress = -5`.
5. **Unauthorized Task Read**: Attempting to read another user's Task list.
6. **Self-Elevated Profile Group**: Modifying a profile to include systemic/unauthorized administrative privileges.
7. **Orphaned Assignment**: Creating an assignment referencing a course that doesn't exist or belongs to someone else.
8. **Immutability Breach on Assignment ID**: Attempting to change an assignment's `userId` on update.
9. **Fake Client Timestamp**: Setting a client-constructed date-time string on `createdAt` instead of using `request.time`.
10. **Note Size Exhaustion**: Saving a note with 10MB of payload content.
11. **Task Status Poisoning**: Setting a Task status to `"SuperCompleted"`.
12. **Blanket Query Scraping**: Attempting to query `courses` without filtering by the authenticated user's ID.

## 3. Test Runner

For the purpose of the sandbox simulation, the following is our test matrix verifying that all of these malicious operations are blocked by Firestore Security Rules.
