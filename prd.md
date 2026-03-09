# BruinBazaar - Product Requirements Document

## Executive Summary

BruinBazaar is a UCLA-exclusive secondhand marketplace that solves the fragmentation, safety, and geographic mismatch problems students face when buying/selling campus-related goods. Built for a 5-week timeline with a mobile-first, bulletin board-inspired design.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [User Personas](#user-personas)
3. [Product Goals](#product-goals)
4. [Technical Specifications](#technical-specifications)
5. [Feature Requirements](#feature-requirements)
6. [User Flows](#user-flows)
7. [Design System](#design-system)
8. [Success Metrics](#success-metrics)
9. [Timeline](#timeline)

---

## Problem Statement

**One-Line Synthesis:**
"UCLA students waste time across fragmented marketplaces and risk unsafe transactions to find secondhand goods that are often too far away to pick up."

### Market Context

- **Target Market:** 30,000+ UCLA undergrads within 2-mile radius of campus
- **Current Behavior:** 51.7% have used marketplace apps for college purchases
- **Pain Points:**
  1. **Geographic Mismatch:** Items 10+ miles away, impractical for car-less students
  2. **Platform Fragmentation:** Students check 3-4 different apps
  3. **Trust Deficit:** 43% cite safety/trust as major concern

### Why Now?

- Post-pandemic budget consciousness (60%+ seek cost-cutting)
- Gen Z sustainability mindset
- Predictable buying/selling cycles (Sept/June move periods, 15,000+ students)
- 80% of students live within 1.5 miles of campus

---

## User Personas

### Persona 1: "The Hill Hopper" (Sofia)
- **Year:** 2nd year
- **Housing:** Moving from dorms → University Apartments
- **Behavior:** Needs furniture FAST, budget-conscious, no car
- **Pain Points:** Can't travel to LA for furniture, doesn't trust strangers
- **Goal:** Furnish apartment for <$500 in 1 week
- **Quote:** "I just need a desk and someone who won't murder me when I pick it up"

### Persona 2: "The Sustainable Senior" (Marcus)
- **Year:** 4th year
- **Housing:** Off-campus apartment
- **Behavior:** Active seller, downsizing before graduation, eco-conscious
- **Pain Points:** Facebook attracts lowballers from all LA, shipping annoying
- **Goal:** Sell everything locally before June, minimal hassle
- **Quote:** "I'd rather give my stuff to another Bruin than deal with Facebook randoms"

### Persona 3: "The Hesitant Freshman" (Aisha)
- **Year:** 1st year
- **Housing:** On-campus (The Hill)
- **Behavior:** Never used secondhand apps, wants to try but nervous
- **Pain Points:** Doesn't know if it's safe, overwhelmed by options
- **Goal:** Save money on dorm decor/mini-fridge without getting scammed
- **Quote:** "I don't even know where to start - there's like 5 different apps?"

---

## Product Goals

### In Scope - MVP (Week 1-3)

1. ✅ Verified UCLA-only marketplace (email domain validation)
2. ✅ Hyperlocal filtering (Westwood-focused, distance-based)
3. ✅ Bulletin board UI for listings
4. ✅ Safe meetup facilitation (suggest public campus spots)
5. ✅ Basic categories (Furniture, Electronics, Clothes, Misc)
6. ✅ Simple messaging (in-app chat)
7. ✅ Mobile-responsive web app

### Out of Scope - v1.0 (Future Iterations)

- In-app payments (Venmo/Zelle links only)
- Native iOS/Android apps (PWA first)
- Ratings/review system
- Advanced search (AI-powered, saved searches)
- Shipping integration
- Admin moderation tools
- Analytics dashboard

### Anti-Goals

- ❌ Not competing with Depop on fashion/aesthetic
- ❌ Not building another Craigslist
- ❌ Not supporting non-UCLA users

---

## Technical Specifications

### Tech Stack
```yaml
Frontend:
  Framework: React 18+
  Build Tool: Vite
  Styling: TailwindCSS
  State Management: React Context + Hooks
  Routing: React Router v6

Backend:
  Platform: Firebase
  Services:
    - Authentication: Firebase Auth (email/password)
    - Database: Firestore
    - Storage: Firebase Storage (5GB free tier)
    - Hosting: Firebase Hosting
  
Analytics:
  Primary: Firebase Analytics
  Secondary: Mixpanel (optional, Week 3+)

Development:
  Package Manager: npm
  Version Control: Git
  Deployment: Firebase CLI
```

### Browser Support

- Chrome/Edge (latest 2 versions)
- Safari iOS (latest 2 versions)
- Firefox (latest 2 versions)
- Mobile-first responsive: 375px - 1920px

### Performance Requirements

- Page Load: <3 seconds
- Image Upload: <5 seconds for 5 photos
- Real-time Chat: <500ms message delivery
- Lighthouse Score: >90 mobile

---

## Feature Requirements

### Week 1 - Must Have (MVP Demo)

#### 1. Authentication System

**User Stories:**
- As a UCLA student, I want to sign up with my UCLA email so I know I'm in a trusted community
- As a user, I want to verify my email before accessing the platform to ensure account security

**Acceptance Criteria:**
- [ ] Sign up form validates email domain (@ucla.edu or @g.ucla.edu only)
- [ ] Non-UCLA emails are rejected with clear error message
- [ ] Email verification link sent automatically on signup
- [ ] Users cannot access app features until email is verified
- [ ] Login form with email/password authentication
- [ ] Password reset functionality via email
- [ ] User profile creation: name, year, major (optional)
- [ ] Protected routes redirect to login if unauthenticated

**Technical Implementation:**
```javascript
// Email validation regex
const UCLA_EMAIL_REGEX = /^[^\s@]+@(ucla\.edu|g\.ucla\.edu)$/;

// Firestore user schema
{
  uid: string,
  email: string,
  displayName: string,
  year: string, // "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate"
  major: string,
  createdAt: timestamp,
  emailVerified: boolean
}
```

---

#### 2. Bulletin Board Homepage

**User Stories:**
- As a buyer, I want to browse listings in a visual grid so I can quickly scan available items
- As a user, I want to filter by category and distance so I find relevant items faster

**Acceptance Criteria:**
- [ ] 2-column masonry grid layout on mobile
- [ ] 3-4 column grid on tablet/desktop
- [ ] Each listing card shows: photo, title, price, distance, category
- [ ] Category filter pills: All, Furniture, Electronics, Clothes, Misc
- [ ] Distance filter: 0.5mi, 1mi, 2mi, All Westwood
- [ ] Infinite scroll or pagination (20 items per page)
- [ ] Empty state when no listings match filters
- [ ] Loading skeleton screens during data fetch
- [ ] Pull-to-refresh on mobile

**Technical Implementation:**
```javascript
// Firestore listings query
const listingsRef = collection(db, 'listings');
const q = query(
  listingsRef,
  where('category', '==', selectedCategory),
  where('sold', '==', false),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// Listing card data structure
{
  id: string,
  userId: string,
  title: string,
  price: number,
  photos: string[], // Firebase Storage URLs
  category: string,
  condition: string,
  distance: number, // calculated from user location
  createdAt: timestamp
}
```

---

#### 3. Create Listing Flow

**User Stories:**
- As a seller, I want to upload photos and details so buyers can see what I'm selling
- As a seller, I want to suggest meetup locations so transactions are safe and convenient

**Acceptance Criteria:**

**Screen 1: Photo Upload**
- [ ] Upload 1-5 photos (required: at least 1)
- [ ] Drag to reorder photos
- [ ] Delete individual photos
- [ ] Image compression before upload (max 1MB per photo)
- [ ] Preview thumbnails
- [ ] "Next" button disabled until ≥1 photo uploaded

**Screen 2: Listing Details**
- [ ] Form fields: title (required), description (required), price (required), category (required), condition (required)
- [ ] Title: max 100 characters
- [ ] Description: max 500 characters, multiline
- [ ] Price: number input, $0-9999
- [ ] Category dropdown: Furniture, Electronics, Clothes, Misc
- [ ] Condition dropdown: New, Like New, Good, Fair, Poor
- [ ] "Next" button disabled until all required fields filled

**Screen 3: Location & Meetup**
- [ ] Auto-detect user location (request permission)
- [ ] Manual location entry if auto-detect denied
- [ ] Suggested meetup spots checkboxes:
  - Powell Library
  - Ackerman Union
  - De Neve Plaza
  - Bruin Plaza
  - Custom location (text input)
- [ ] Map preview showing approximate location (blurred for privacy)
- [ ] "Post Listing" button creates listing in Firestore

**Technical Implementation:**
```javascript
// Firestore listing schema
{
  id: string (auto-generated),
  userId: string,
  sellerName: string,
  sellerYear: string,
  title: string,
  description: string,
  price: number,
  category: "Furniture" | "Electronics" | "Clothes" | "Misc",
  condition: "New" | "Like New" | "Good" | "Fair" | "Poor",
  photos: string[], // Firebase Storage URLs
  location: {
    lat: number,
    lng: number,
    address: string (optional)
  },
  meetupSpots: string[], // ["Powell Library", "Custom: Westwood Blvd"]
  sold: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

#### 4. Listing Detail Page

**User Stories:**
- As a buyer, I want to see all listing details and seller info so I can decide if I want it
- As a seller, I want to mark my listing as sold or delete it when needed

**Acceptance Criteria:**

**Buyer View:**
- [ ] Photo carousel with swipe gestures
- [ ] Photo indicator (1/5, 2/5, etc.)
- [ ] Display: title, price (large, UCLA Gold), category, condition, distance
- [ ] Expandable description (show first 3 lines, "Read more" if longer)
- [ ] Suggested meetup spots as chips/tags
- [ ] Mini-map showing approximate location (privacy-blurred)
- [ ] Seller card: avatar, name, year, "View Profile" button
- [ ] "Message Seller" button (sticky bottom, primary CTA)
- [ ] Share button (copy link to listing)

**Seller View:**
- [ ] All buyer view elements PLUS:
- [ ] "Edit Listing" button (top-right)
- [ ] "Mark as Sold" button (replaces "Message Seller")
- [ ] "Delete Listing" button (destructive, requires confirmation)
- [ ] View count (optional)
- [ ] Sold overlay/badge when marked as sold

**Technical Implementation:**
```javascript
// Component structure
<ListingDetail>
  <PhotoCarousel photos={listing.photos} />
  <ListingInfo listing={listing} />
  <SellerCard seller={seller} />
  {isOwner ? (
    <SellerActions onMarkSold={handleMarkSold} onDelete={handleDelete} />
  ) : (
    <MessageButton onClick={openChat} />
  )}
</ListingDetail>
```

---

#### 5. In-App Chat System

**User Stories:**
- As a buyer, I want to message sellers to arrange pickup details
- As a user, I want real-time messaging so conversations are efficient

**Acceptance Criteria:**

**Message List Screen:**
- [ ] List of all conversations (sorted by most recent)
- [ ] Each conversation shows: other user's avatar, name, last message preview, timestamp
- [ ] Unread indicator (blue dot + bold text)
- [ ] Empty state when no messages
- [ ] Pull-to-refresh

**Chat Interface:**
- [ ] Top bar: back arrow, other user's name/avatar, flag icon (report)
- [ ] Message bubbles:
  - Sender: right-aligned, UCLA Blue background, white text
  - Receiver: left-aligned, light gray background, dark text
- [ ] Timestamps (relative: "2m ago", "Yesterday", "Jan 15")
- [ ] Auto-scroll to bottom on new message
- [ ] Text input field + send button
- [ ] Send on Enter key (desktop)
- [ ] Safety banner at top: "Meet in public campus locations 🛡️" (dismissible)
- [ ] Real-time message updates (no refresh needed)
- [ ] "User is typing..." indicator (optional Week 2)

**Technical Implementation:**
```javascript
// Firestore conversations schema
conversations/{conversationId}:
{
  id: string,
  participants: string[], // [buyerId, sellerId]
  listingId: string,
  listingTitle: string,
  lastMessage: string,
  lastMessageTime: timestamp,
  unreadBy: string[] // userIds who haven't read latest message
}

conversations/{conversationId}/messages/{messageId}:
{
  id: string,
  senderId: string,
  text: string,
  timestamp: timestamp,
  read: boolean
}

// Real-time listener
const messagesRef = collection(db, `conversations/${convId}/messages`);
const q = query(messagesRef, orderBy('timestamp', 'asc'));
onSnapshot(q, (snapshot) => {
  // Update messages in real-time
});
```

---

#### 6. User Profile

**User Stories:**
- As a user, I want to view my profile and manage my listings
- As a buyer, I want to see a seller's profile to build trust

**Acceptance Criteria:**

**Own Profile View:**
- [ ] Display: avatar (initials if no photo), name, year, major
- [ ] "Edit Profile" button (top-right)
- [ ] Tabs: "My Listings" | "My Messages"
- [ ] My Listings: grid of user's listings (both active and sold)
- [ ] Sold listings have "SOLD" overlay
- [ ] Click listing → go to detail page
- [ ] Empty state if no listings
- [ ] Logout button at bottom

**Other User's Profile View:**
- [ ] Display: avatar, name, year (no edit button)
- [ ] Only "Listings" tab visible (no messages tab)
- [ ] Grid of user's active listings only (no sold items)
- [ ] "Message" button at top
- [ ] Cannot see other user's email for privacy

**Edit Profile:**
- [ ] Update: display name, year, major
- [ ] Avatar upload (optional)
- [ ] Save button updates Firestore
- [ ] Cannot change email (display only)

**Technical Implementation:**
```javascript
// Profile component logic
const isOwnProfile = currentUser.uid === profileUserId;

// Fetch user's listings
const listingsQuery = query(
  collection(db, 'listings'),
  where('userId', '==', profileUserId),
  where('sold', '==', isOwnProfile ? undefined : false), // Show sold items only on own profile
  orderBy('createdAt', 'desc')
);
```

---

#### 7. Bottom Navigation

**Acceptance Criteria:**
- [ ] Fixed bottom nav bar (56px height)
- [ ] 5 tabs: Home | Search | + (Create) | Messages | Profile
- [ ] Active tab highlighted (UCLA Blue)
- [ ] Inactive tabs gray
- [ ] Icons + labels
- [ ] "+" button opens create listing flow
- [ ] Messages tab shows unread count badge
- [ ] Smooth transitions between tabs

---

### Week 2-3 - Should Have (Pre-Launch Polish)

#### 8. ISO Posts (Wanted Ads)

**User Stories:**
- As a buyer, I want to post what I'm looking for so sellers can find me
- As a seller, I want to see what people need so I can sell faster

**Acceptance Criteria:**
- [ ] "Create ISO Post" option in create flow (toggle at top)
- [ ] Same 3-screen flow as listings
- [ ] ISO cards have different visual treatment (yellow border, "ISO" badge)
- [ ] Homepage filter toggle: "Show Listings | Show ISO | Show Both"
- [ ] Sellers can message ISO posters directly
- [ ] ISO posts marked "Found" instead of "Sold"

---

#### 9. Search Functionality

**User Stories:**
- As a user, I want to search by keyword to find specific items faster

**Acceptance Criteria:**
- [ ] Search bar at top of bulletin board
- [ ] Searches title + description fields
- [ ] Case-insensitive
- [ ] Real-time results (debounced, 300ms)
- [ ] Highlight search terms in results (optional)
- [ ] Recent searches (stored locally)
- [ ] Clear search button

---

#### 10. Photo Upload Enhancement

**Acceptance Criteria:**
- [ ] Image compression (max 1MB, 1080px width)
- [ ] Drag-to-reorder photos (visual feedback)
- [ ] Loading indicators during upload
- [ ] Error handling for upload failures
- [ ] Retry failed uploads

---

#### 11. Enhanced Chat Features

**Acceptance Criteria:**
- [ ] Read receipts (checkmark icon)
- [ ] "Mark as Spam" button → flags conversation
- [ ] Block user functionality
- [ ] Timestamp groups (Today, Yesterday, date)
- [ ] Link detection (clickable URLs)

---

#### 12. Onboarding Tutorial

**Acceptance Criteria:**
- [ ] 3-screen swipeable tutorial on first login
- [ ] Screen 1: "Buy & Sell with Fellow Bruins"
- [ ] Screen 2: "Safe & Local Meetups"
- [ ] Screen 3: "Post What You Need"
- [ ] Skip button (top-right) on all screens
- [ ] "Get Started" button on final screen
- [ ] Never show again after completion

---

### Week 4-5 - Could Have (If Time Allows)

#### 13. Saved Listings

**Acceptance Criteria:**
- [ ] Heart/bookmark icon on listing cards
- [ ] "Saved" tab in profile
- [ ] Remove from saved (toggle heart)
- [ ] Notification if saved item price drops (optional)

---

#### 14. Quick Filters

**Acceptance Criteria:**
- [ ] "Free Stuff" filter (price = 0)
- [ ] "Under $20" filter
- [ ] "Posted Today" filter
- [ ] Clear all filters button

---

#### 15. Map View

**Acceptance Criteria:**
- [ ] Toggle between grid/map view
- [ ] Show all listings as pins on map
- [ ] Click pin → listing preview card
- [ ] Cluster pins when zoomed out
- [ ] Geolocation centering

---

## User Flows

### Flow 1: First-Time User Onboarding
```
Landing Page
  ↓
Click "Sign Up with UCLA Email"
  ↓
Sign Up Form (email, password, name, year, major)
  ↓
Email domain validation (@ucla.edu or @g.ucla.edu)
  ↓
Success → "Check your email to verify account"
  ↓
User clicks verification link in email
  ↓
[Optional] Tutorial Slide 1: "Buy & Sell with Fellow Bruins" (Skip available)
  ↓
[Optional] Tutorial Slide 2: "Safe & Local Meetups" (Skip available)
  ↓
[Optional] Tutorial Slide 3: "Post What You Need" (Skip available)
  ↓
Bulletin Board Homepage
```

---

### Flow 2: Browse & Buy
```
Bulletin Board Homepage (scrolling grid)
  ↓
[Optional] Apply category/distance filters
  ↓
Click listing card ("IKEA Desk - $40 - 0.3mi")
  ↓
Listing Detail Page (photos, description, seller info)
  ↓
Click "Message Seller"
  ↓
Chat Interface (type message, send)
  ↓
Back-and-forth messaging (arrange meetup time/location)
  ↓
Meet IRL at agreed campus location
  ↓
[Seller marks listing as "Sold" from their view]
```

---

### Flow 3: Create Listing
```
Bulletin Board Homepage
  ↓
Click "+" button (bottom nav center)
  ↓
Create Listing - Screen 1: Upload Photos
  ↓
Select 1-5 photos, reorder if needed
  ↓
Click "Next"
  ↓
Create Listing - Screen 2: Fill Details
  ↓
Enter title, category, price, condition, description
  ↓
Click "Next"
  ↓
Create Listing - Screen 3: Set Location
  ↓
Auto-detect or manual entry, select meetup spots
  ↓
Click "Post Listing"
  ↓
Success Toast: "Listing posted! 🎉"
  ↓
Listing Detail Page (seller view with "Mark as Sold" button)
```

---

### Flow 4: Search for Item
```
Bulletin Board Homepage
  ↓
Click search bar at top
  ↓
Type keyword ("desk")
  ↓
[Optional] Apply filters (distance, price, condition)
  ↓
View filtered results grid
  ↓
Click listing card
  ↓
[Continue to Flow 2: Browse & Buy]
```

---

### Flow 5: Manage Listings
```
Bulletin Board Homepage
  ↓
Click "Profile" (bottom nav)
  ↓
User Profile → "My Listings" tab
  ↓
See grid of own listings (with "Sold" overlays)
  ↓
Click a listing card
  ↓
Listing Detail Page (seller view)
  ↓
[Option A] Click "Mark as Sold" → Confirm → Listing marked sold
  ↓
[Option B] Click "Edit Listing" → Update details → Save
  ↓
[Option C] Click "Delete Listing" → Confirm → Listing deleted
```

---

### Flow 6: Check Messages
```
Bulletin Board Homepage
  ↓
Click "Messages" (bottom nav, notification dot if unread)
  ↓
Messages List (conversations with preview)
  ↓
Click conversation
  ↓
Chat Interface
  ↓
Type reply, send
  ↓
[Transaction coordinated via messages]
```

---

## Design System

### Color Palette
```css
/* Primary Colors */
--ucla-blue: #2774AE;
--ucla-gold: #FFD100;

/* Neutrals */
--white: #FFFFFF;
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Accents */
--success-green: #10B981;
--error-red: #EF4444;
--warning-yellow: #F59E0B;
--info-blue: #3B82F6;
```

---

### Typography
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif;

/* Type Scale */
--text-xs: 12px;    /* Helper text */
--text-sm: 14px;    /* Secondary text */
--text-base: 16px;  /* Body text */
--text-lg: 18px;    /* Large body */
--text-xl: 20px;    /* Small headings */
--text-2xl: 24px;   /* Section headings */
--text-3xl: 30px;   /* Page headings */
--text-4xl: 36px;   /* Hero text */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

### Spacing Scale
```css
/* 8px base scale */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 40px;
--space-6: 48px;
--space-8: 64px;
--space-10: 80px;
```

---

### Component Specifications

#### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--ucla-blue);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  min-height: 48px;
  min-width: 44px; /* Accessibility: min tap target */
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--ucla-blue);
  border: 2px solid var(--ucla-blue);
  padding: 12px 24px;
  border-radius: 8px;
}

/* Destructive Button */
.btn-destructive {
  background: var(--error-red);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}
```

---

#### Cards
```css
/* Listing Card */
.listing-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.listing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* ISO Card (Wanted Ad) */
.iso-card {
  border: 2px solid var(--ucla-gold);
  position: relative;
}

.iso-badge {
  background: var(--ucla-gold);
  color: var(--gray-900);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
```

---

#### Navigation
```css
/* Bottom Navigation Bar */
.bottom-nav {
  height: 56px;
  background: white;
  border-top: 1px solid var(--gray-200);
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--gray-500);
}

.nav-item.active {
  color: var(--ucla-blue);
}
```

---

#### Forms
```css
/* Text Input */
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 16px;
  background: white;
}

.input:focus {
  outline: none;
  border-color: var(--ucla-blue);
  box-shadow: 0 0 0 3px rgba(39, 116, 174, 0.1);
}

/* Dropdown */
.select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: white;
  font-size: 16px;
}

/* Textarea */
.textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
}
```

---

### Bulletin Board Aesthetic
```css
/* Optional: Corkboard texture background */
.bulletin-board {
  background-color: #F5F1E8;
  background-image: url('/textures/corkboard-subtle.png');
  min-height: 100vh;
  padding: 16px;
}

/* Masonry Grid */
.listing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding-bottom: 72px; /* Space for bottom nav */
}

@media (min-width: 768px) {
  .listing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .listing-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

### Responsive Breakpoints
```css
/* Mobile First */
--mobile: 375px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

---

## Success Metrics

### Primary KPIs (North Star Metrics)

#### 1. Monthly Active Users (MAU)
- **Definition:** Unique users who log in per month
- **Why:** Measures platform adoption
- **Target:** Start tracking Week 3

#### 2. Listing-to-Sale Conversion Rate
- **Definition:** % of listings marked "Sold" within 30 days
- **Why:** Proves marketplace liquidity
- **Target:** >15% by Week 5 (industry standard: 10-20%)

#### 3. Time-to-First-Message (TTFM)
- **Definition:** Avg time from listing posted → first message received
- **Why:** Measures marketplace speed/engagement
- **Target:** <24 hours

#### 4. Chat-to-Meetup Rate
- **Definition:** % of conversations that lead to confirmed meetups
- **Why:** Measures trust + transaction completion
- **Target:** >30%

---

### Secondary KPIs (Health Metrics)

#### 5. Daily Active Users (DAU)
- Track engagement patterns (spikes during move-in/out?)

#### 6. Listings Created Per Day
- Supply-side health

#### 7. Average Messages Per Conversation
- 2-5 messages = efficient
- 10+ = friction/negotiation issues

#### 8. Retention Rate
- Week-over-week user return rate
- **Target:** >40% Week 2+

#### 9. Session Duration
- How long users browse
- **Target:** 3-8 minutes (enough to browse, not aimless)

---

### OKRs

**Objective 1: Achieve Product-Market Fit Signal**
- Week 3: 100 registered users
- Week 3: 50+ active listings
- Week 5: 10+ documented successful transactions
- Week 5: Net Promoter Score (NPS) >40

**Objective 2: Validate Core Value Prop (Safety + Convenience)**
- Week 4: 80%+ feel "safer than Facebook Marketplace"
- Week 5: Avg meetup distance <0.8 miles
- Week 5: 0 reported safety incidents
- Week 5: <5% spam/fake listing rate

**Objective 3: Build Sustainable Growth Engine**
- Week 3: 30%+ users acquired via referrals
- Week 5: 40%+ weekly retention
- Week 5: Avg 3+ listings per active seller

**Objective 4: Ship Quality MVP on Time**
- Week 1: Functional demo (Must Have features)
- Week 3: Public beta launch, 0 critical bugs
- Week 5: <2% crash rate, <3s page load
- Week 5: Mobile responsiveness score >90

---

## Timeline

### Week 1: MVP Demo (Must Have Features)
**Deliverable:** Functional demo for presentation

- [ ] Project setup (React + Vite + TailwindCSS + Firebase)
- [ ] Authentication flow (email validation)
- [ ] Bulletin board homepage (with filters)
- [ ] Create listing flow (3 screens)
- [ ] Listing detail page
- [ ] Basic chat system
- [ ] User profile (minimal)
- [ ] Bottom navigation

---

### Week 2-3: Pre-Launch Polish (Should Have Features)
**Deliverable:** Public beta launch

- [ ] ISO posts implementation
- [ ] Search functionality
- [ ] Photo upload enhancements
- [ ] Enhanced chat features
- [ ] Onboarding tutorial
- [ ] Bug fixes and testing
- [ ] Performance optimization

---

### Week 4-5: Iteration & Could Have Features
**Deliverable:** Final presentation

- [ ] User feedback collection
- [ ] Saved listings (if time)
- [ ] Quick filters (if time)
- [ ] Map view (if time)
- [ ] Analytics dashboard setup
- [ ] Final bug fixes
- [ ] Performance tuning
- [ ] Documentation

---

## Appendix

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is authenticated with UCLA email
    function isUCLAUser() {
      return request.auth != null && 
             (request.auth.token.email.matches('.*@ucla\\.edu$') || 
              request.auth.token.email.matches('.*@g\\.ucla\\.edu$'));
    }
    
    // Helper function: Check if user owns the resource
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isUCLAUser();
      allow write: if isUCLAUser() && isOwner(userId);
    }
    
    // Listings collection
    match /listings/{listingId} {
      allow read: if isUCLAUser();
      allow create: if isUCLAUser() && isOwner(request.resource.data.userId);
      allow update, delete: if isUCLAUser() && isOwner(resource.data.userId);
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if isUCLAUser() && 
                    request.auth.uid in resource.data.participants;
      allow create: if isUCLAUser() && 
                      request.auth.uid in request.resource.data.participants;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isUCLAUser() && 
                      request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow create: if isUCLAUser() && 
                        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants &&
                        isOwner(request.resource.data.senderId);
      }
    }
  }
}
```

---

### Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Listing photos
    match /listings/{userId}/{allPaths=**} {
      allow read: if request.auth != null &&
                    (request.auth.token.email.matches('.*@ucla\\.edu$') || 
                     request.auth.token.email.matches('.*@g\\.ucla\\.edu$'));
      allow write: if request.auth != null &&
                     request.auth.uid == userId &&
                     request.resource.size < 5 * 1024 * 1024 && // 5MB max
                     request.resource.contentType.matches('image/.*');
    }
    
    // Profile avatars
    match /avatars/{userId} {
      allow read: if request.auth != null &&
                    (request.auth.token.email.matches('.*@ucla\\.edu$') || 
                     request.auth.token.email.matches('.*@g\\.ucla\\.edu$'));
      allow write: if request.auth != null &&
                     request.auth.uid == userId &&
                     request.resource.size < 2 * 1024 * 1024 && // 2MB max
                     request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

### Analytics Events to Track
```javascript
// Firebase Analytics custom events

// User actions
logEvent('sign_up', { method: 'email' });
logEvent('email_verified', { user_id: uid });
logEvent('onboarding_completed', { skipped: boolean });

// Listing actions
logEvent('listing_created', { 
  category: string, 
  price: number, 
  has_photos: boolean 
});
logEvent('listing_viewed', { 
  listing_id: string, 
  category: string 
});
logEvent('listing_marked_sold', { 
  listing_id: string, 
  days_to_sell: number 
});
logEvent('listing_deleted', { listing_id: string });

// Search & filter
logEvent('search', { search_term: string });
logEvent('filter_applied', { 
  filter_type: string, 
  filter_value: string 
});

// Messaging
logEvent('message_sent', { 
  conversation_id: string, 
  is_first_message: boolean 
});
logEvent('conversation_started', { 
  listing_id: string 
});

// Engagement
logEvent('listing_saved', { listing_id: string });
logEvent('profile_viewed', { user_id: string });
```

---

## Glossary

- **ISO:** "In Search Of" - a wanted ad where buyers post what they're looking for
- **The Hill:** UCLA on-campus housing (dorms)
- **Westwood:** Neighborhood surrounding UCLA campus
- **Bruin:** UCLA student/alumni mascot reference
- **SSO:** Single Sign-On (note: we're using email domain validation instead)
- **PWA:** Progressive Web App
- **MAU/DAU:** Monthly/Daily Active Users
- **NPS:** Net Promoter Score
- **TTFM:** Time-to-First-Message
- **CTA:** Call-to-Action

---

*Last Updated: January 2026*