# BruinBazaar Firestore Database Schema

All collection names are **lowercase** per project conventions. Timestamps use Firestore `Timestamp`.

---

## 1. `users`

User profiles (synced/created after Firebase Auth signup). One document per authenticated user.

| Field           | Type      | Required | Description |
|----------------|-----------|----------|-------------|
| uid            | string    | ✓        | Firebase Auth UID (document ID) |
| email          | string    | ✓        | UCLA email (@ucla.edu or @g.ucla.edu) |
| displayName    | string    | ✓        | User's display name |
| year           | string    |          | "Freshman" \| "Sophomore" \| "Junior" \| "Senior" \| "Graduate" |
| major          | string    |          | Major (optional) |
| createdAt      | timestamp | ✓        | Account creation time |
| emailVerified  | boolean   | ✓        | Whether email has been verified |

**Path:** `users/{userId}`  
**Indexes:** None required for single-doc reads by `userId`.

---

## 2. `listings`

Marketplace listings (items for sale). Queried by category, sold status, and userId.

| Field        | Type      | Required | Description |
|-------------|-----------|----------|-------------|
| id          | string    | ✓        | Auto-generated (document ID) |
| userId      | string    | ✓        | Seller's Firebase Auth UID |
| sellerName  | string    | ✓        | Seller display name |
| sellerYear  | string    |          | Seller year |
| title       | string    | ✓        | Max 100 chars |
| description | string    | ✓        | Max 500 chars |
| price       | number    | ✓        | 0–9999 |
| category    | string    | ✓        | "Furniture" \| "Electronics" \| "Clothes" \| "Misc" |
| condition   | string    | ✓        | "New" \| "Like New" \| "Good" \| "Fair" \| "Poor" |
| photos      | string[]  | ✓        | Firebase Storage URLs (1–5) |
| location    | object    | ✓        | `{ lat: number, lng: number, address?: string }` |
| meetupSpots | string[]  | ✓        | e.g. ["Powell Library", "Custom: Westwood Blvd"] |
| sold        | boolean   | ✓        | Whether item is sold |
| createdAt   | timestamp | ✓        | Creation time |
| updatedAt   | timestamp | ✓        | Last update time |

**Path:** `listings/{listingId}`  
**Indexes:** See `firestore.indexes.json` for compound indexes on `sold`, `category`, `userId`, `createdAt`.

---

## 3. `conversations`

Chat threads between buyer and seller. Subcollection `messages` holds individual messages.

### 3.1 Conversation document

| Field           | Type      | Required | Description |
|----------------|-----------|----------|-------------|
| id             | string    | ✓        | Auto-generated (document ID) |
| participants   | string[]  | ✓        | [buyerId, sellerId] (Firebase Auth UIDs) |
| listingId     | string    | ✓        | Reference to listing |
| listingTitle  | string    | ✓        | Snapshot of listing title |
| lastMessage   | string    |          | Preview of last message |
| lastMessageTime | timestamp | ✓      | For sorting conversation list |
| unreadBy      | string[]  |          | User IDs who haven’t read latest message |

**Path:** `conversations/{conversationId}`

### 3.2 Messages subcollection

| Field     | Type      | Required | Description |
|----------|-----------|----------|-------------|
| id       | string    | ✓        | Auto-generated (document ID) |
| senderId | string    | ✓        | Firebase Auth UID of sender |
| text     | string    | ✓        | Message content |
| timestamp| timestamp | ✓        | Send time (use for `orderBy`) |
| read     | boolean   | ✓        | Read receipt |

**Path:** `conversations/{conversationId}/messages/{messageId}`  
**Indexes:** Collection group index on `messages` for `timestamp` ASC.

---

## 4. `isos`

ISO (“In Search Of”) posts — wanted ads. Same flow as listings but for items users want to buy.

| Field        | Type      | Required | Description |
|-------------|-----------|----------|-------------|
| id          | string    | ✓        | Auto-generated (document ID) |
| userId      | string    | ✓        | Poster's Firebase Auth UID |
| sellerName  | string    | ✓        | Poster display name (kept for consistency) |
| sellerYear  | string    |          | Poster year |
| title       | string    | ✓        | Max 100 chars (what they’re looking for) |
| description | string    | ✓        | Max 500 chars |
| price       | number    |          | Max price willing to pay (optional) |
| category    | string    | ✓        | "Furniture" \| "Electronics" \| "Clothes" \| "Misc" |
| condition   | string    |          | Preferred condition |
| photos      | string[]  |          | Optional reference images (Storage URLs) |
| location    | object    | ✓        | `{ lat: number, lng: number, address?: string }` |
| meetupSpots | string[]  | ✓        | Preferred meetup locations |
| found       | boolean   | ✓        | Whether the item was found (replaces "sold") |
| createdAt   | timestamp | ✓        | Creation time |
| updatedAt   | timestamp | ✓        | Last update time |

**Path:** `isos/{isoId}`  
**Indexes:** See `firestore.indexes.json` for compound indexes on `found`, `category`, `userId`, `createdAt`.

---

## Query patterns (cursorrules)

- Use `where()` before `orderBy()`.
- Default limit: 20; paginate with `startAfter()` for infinite scroll.
- Create compound indexes when Firebase prompts; predefined in `firestore.indexes.json`.
