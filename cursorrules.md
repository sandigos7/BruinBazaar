# BruinBazaar Development Rules

## Project Context
This is a UCLA-only secondhand marketplace built in 5 weeks. Mobile-first, bulletin board aesthetic, safety-focused.

## Tech Stack Constraints
- **Frontend:** React 18+ with Vite (NOT Next.js, NOT CRA)
- **Styling:** TailwindCSS only (NO CSS-in-JS, NO styled-components)
- **Backend:** Firebase only (Auth, Firestore, Storage, Hosting)
- **State:** React Context + Hooks (NO Redux, NO Zustand)
- **Routing:** React Router v6

## Code Standards

### File Structure
```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Nav, Header, Footer
│   ├── listing/         # Listing card, detail, form
│   ├── chat/            # Message list, chat interface
│   └── profile/         # User profile components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── contexts/            # React Context providers
├── services/            # Firebase service functions
├── utils/               # Helper functions
├── constants/           # Enums, config
└── styles/              # Global CSS, Tailwind config
```

### Naming Conventions
- **Components:** PascalCase (e.g., `ListingCard.jsx`)
- **Hooks:** camelCase with "use" prefix (e.g., `useAuth.js`)
- **Utils:** camelCase (e.g., `formatPrice.js`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `CATEGORIES.js`)
- **Firebase collections:** lowercase (e.g., `listings`, `users`)

### Component Rules
1. **Always use functional components** - no class components
2. **One component per file** - except for small helper components
3. **PropTypes required** for all components accepting props
4. **Default exports for pages**, named exports for components
5. **Destructure props** in function signature
6. **Extract business logic** into custom hooks

### Example Component Template
```jsx
import PropTypes from 'prop-types';
import { useState } from 'react';

export const ListingCard = ({ listing, onMessage }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="listing-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Component content */}
    </div>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    photos: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onMessage: PropTypes.func.isRequired,
};
```

## Firebase Patterns

### Firestore Queries
- **Always use `where()` before `orderBy()`**
- **Limit queries** to 20 items by default
- **Use indexes** for compound queries (create when Firebase prompts)
- **Paginate** with `startAfter()` for infinite scroll

### Example Firestore Query
```javascript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const fetchListings = async (category, maxDistance) => {
  const listingsRef = collection(db, 'listings');
  const q = query(
    listingsRef,
    where('category', '==', category),
    where('sold', '==', false),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Firebase Storage
- **Compress images** before upload (max 1MB)
- **Use user-specific paths:** `listings/${userId}/${photoId}`
- **Generate unique filenames:** Use `Date.now()` or UUID
- **Clean up on delete:** Remove Storage files when listing deleted

### Real-time Listeners
- **Unsubscribe in cleanup:** Use `useEffect` return function
- **Limit listeners:** Only on active chat, not all conversations
```javascript
useEffect(() => {
  const messagesRef = collection(db, `conversations/${convId}/messages`);
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    setMessages(messages);
  });
  
  return () => unsubscribe(); // Cleanup
}, [convId]);
```

## Styling Guidelines

### TailwindCSS Usage
- **Use Tailwind utilities first** - custom CSS as last resort
- **Extract repeated classes** into components, NOT @apply
- **Mobile-first:** Write base styles for mobile, use `md:` and `lg:` for larger screens
- **Use design tokens:** Reference colors/spacing from `tailwind.config.js`

### Design System Variables (tailwind.config.js)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'ucla-blue': '#2774AE',
        'ucla-gold': '#FFD100',
      },
      spacing: {
        '18': '4.5rem', // Custom if needed
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
};
```

### Responsive Classes
```jsx
// Mobile-first approach
<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
  {/* Cards */}
</div>
```

## Error Handling

### Firebase Errors
```javascript
try {
  await createListing(listingData);
} catch (error) {
  if (error.code === 'permission-denied') {
    toast.error('You must be logged in to create a listing');
  } else if (error.code === 'storage/unauthorized') {
    toast.error('Photo upload failed. Please try again.');
  } else {
    toast.error('Something went wrong. Please try again.');
    console.error('Error creating listing:', error);
  }
}
```

### Form Validation
- **Validate on submit**, not on every keystroke (performance)
- **Show errors inline** below fields
- **Disable submit button** until form is valid
- **Clear errors** when user starts typing

## Performance Rules

### Image Optimization
1. **Compress before upload:** Use browser-image-compression library
2. **Lazy load images:** Use `loading="lazy"` attribute
3. **Responsive images:** Use appropriate sizes for mobile/desktop

### Code Splitting
```javascript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const ChatInterface = lazy(() => import('./components/chat/ChatInterface'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ChatInterface />
</Suspense>
```

### Memoization
- **Use `useMemo`** for expensive calculations
- **Use `useCallback`** for functions passed as props
- **Don't over-optimize** - only memoize if re-renders are noticeable

## Security Rules

### Email Validation
```javascript
const UCLA_EMAIL_REGEX = /^[^\s@]+@(ucla\.edu|g\.ucla\.edu)$/;

const validateEmail = (email) => {
  return UCLA_EMAIL_REGEX.test(email);
};

// In signup form
if (!validateEmail(email)) {
  setError('Please use a valid UCLA email (@ucla.edu or @g.ucla.edu)');
  return;
}
```

### Input Sanitization
- **Never trust user input**
- **Sanitize before Firestore writes**
- **Escape HTML** in user-generated content
- **Use Firebase security rules** as second layer of defense

## Testing Guidelines (Week 4-5)

### Manual Testing Checklist
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test all user flows from PRD
- [ ] Test offline behavior (Firebase offline persistence)
- [ ] Test with slow network (Chrome DevTools throttling)
- [ ] Test image upload with large files
- [ ] Test chat with multiple conversations
- [ ] Test edge cases (empty states, no results, errors)

### Browser Testing
- Primary: Chrome, Safari iOS
- Secondary: Firefox, Edge
- Ignore: IE11 (not supported)

## Accessibility (A11y)

### Minimum Requirements
- **All interactive elements** must have min 44x44px tap targets
- **Images must have alt text**
- **Forms must have labels**
- **Color contrast** must meet WCAG AA (4.5:1 for text)
- **Focus indicators** visible on keyboard navigation

### Semantic HTML
```jsx
// Good
<button onClick={handleClick}>Message Seller</button>

// Bad
<div onClick={handleClick}>Message Seller</div>
```

## Git Workflow

### Branch Naming
- `main` - production-ready code
- `dev` - integration branch
- `feature/listing-creation` - feature branches
- `fix/chat-bug` - bug fixes

### Commit Messages
```
feat: add photo upload to listing creation
fix: resolve chat message ordering issue
style: update listing card hover state
refactor: extract auth logic into custom hook
```

### Before Committing
1. **Run linter:** `npm run lint`
2. **Check for console.logs** - remove debug logs
3. **Test locally** - verify feature works
4. **Update PRD** if requirements changed

## Common Pitfalls to Avoid

### Firebase
- ❌ Don't query entire collections without `where()` or `limit()`
- ❌ Don't store sensitive data in Firestore (emails are OK, passwords NO)
- ❌ Don't forget to unsubscribe from real-time listeners
- ❌ Don't upload images without compression

### React
- ❌ Don't mutate state directly - use setter functions
- ❌ Don't forget dependency arrays in `useEffect`
- ❌ Don't use indexes as keys in lists (use stable IDs)
- ❌ Don't put too much logic in components - extract to hooks

### TailwindCSS
- ❌ Don't use arbitrary values excessively - use design tokens
- ❌ Don't write custom CSS when Tailwind utility exists
- ❌ Don't forget responsive prefixes (`md:`, `lg:`)

## Development Priorities

### Week 1 (MVP Demo)
**Focus:** Core functionality over polish
- Get authentication working FIRST (blocker for everything)
- Use placeholder UI if needed (refine later)
- Hard-code meetup spots for now
- Simple error handling (toast notifications)
- No animations/transitions (add in Week 2)

### Week 2-3 (Pre-Launch)
**Focus:** User experience refinement
- Add loading states and skeletons
- Implement smooth transitions
- Add proper error handling
- Polish UI/UX details
- Add onboarding tutorial

### Week 4-5 (Polish)
**Focus:** Performance and edge cases
- Optimize images and queries
- Handle edge cases (no results, errors)
- Add analytics tracking
- User testing and bug fixes

## When in Doubt

1. **Check the PRD** - requirements are the source of truth
2. **Ask before building** - confirm approach if unclear
3. **Start simple** - MVP first, optimizations later
4. **Mobile-first** - always design for mobile, then scale up
5. **User safety** - when uncertain, err on side of privacy/security

## Quick Reference

### Essential Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
firebase deploy      # Deploy to Firebase Hosting
firebase emulators:start  # Run local Firebase emulators
```

### Useful Snippets
See `/docs/snippets.md` for copy-paste code templates

---

*Follow these rules strictly. They exist to keep the codebase consistent, maintainable, and aligned with project goals.*