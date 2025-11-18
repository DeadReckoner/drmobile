# Copilot Instructions - Dead Reckoner Mobile App

## Project Overview

**Dead Reckoner** is a React Native (0.79.5) + Expo SDK 53 mobile app for goal tracking and roadmap management with hierarchical structure (Roadmaps → Milestones → Tasks → Steps). Supports iOS, Android, and Web with Google/Apple authentication via Supabase.

**Stack**: TypeScript 5.8.3 (strict), Redux Toolkit + Persist, Expo Router, React Native UI Lib, Formik + Yup, i18n-js (en/es/fr)

## Critical Rules

**ALWAYS:**

- Use TypeScript strict mode - no `any` types
- Import with `@/*` path alias (never `../../`)
- Use `useAppSelector`/`useAppDispatch` (not `useSelector`/`useDispatch`)
- Use `TranslatedText` for user-facing strings
- Handle errors with `AppToast`
- Format with Prettier before committing
- Add static text to en.json, es.json, fr.json and use them via TranslatedText or useLocalization hook
- Use Loader instead of ActivityIndicator

**NEVER:**

- Change architecture without permission
- Modify auth flows or Supabase schema
- Expose API keys or credentials
- Use relative imports
- Hardcode user-facing strings
- Mutate state directly (prefer spread operators)

## Naming Conventions

- **Components**: `PascalCase` (e.g., `AppButton`, `RoadmapDetailsPage`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useAppTheme`, `useLocalization`)
- **Types/Interfaces**: `PascalCase` with `Type`/`Props` suffix (e.g., `UserType`, `ButtonProps`)
- **Utils**: `camelCase` with `.utils.ts` suffix (e.g., `date.utils.ts`)
- **Constants**: `SCREAMING_SNAKE_CASE` or `PascalCase` objects (e.g., `DELAY`, `Env`)

## File Structure

```
src/
├── app/                    # Expo Router routes
│   ├── (auth)/            # Public auth routes
│   └── (protected)/       # Protected routes
├── components/            # UI components
│   ├── App*.tsx          # Generic (AppButton, AppModal)
│   └── [domain]/         # Domain-specific (auth/, roadmap/)
├── store/                 # Redux
│   ├── slices/           # State slices
│   ├── apis/             # RTK Query
│   └── hooks/            # Typed hooks
├── hooks/                 # Custom hooks
├── utils/                 # Utility functions
├── lib/                   # External integrations
└── constants/            # App constants
```

## Code Patterns

### Components

```typescript
// Named export for reusable components
interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export const MyComponent = ({ title, onPress }: MyComponentProps) => (
  <View><Text>{title}</Text></View>
);

// Default export for pages/screens
const RoadmapDetailsPage = () => {
  return <View>...</View>;
};
export default RoadmapDetailsPage;
```

### Redux

```typescript
// Always use typed hooks
import { useAppSelector, useAppDispatch } from '@/store/hooks/store.hooks';

const user = useAppSelector((state) => state.auth.user);
const dispatch = useAppDispatch();

// Create selectors
export const selectUser = createAppSelector((state) => state.auth.user);
```

### Error Handling

```typescript
try {
  await createRoadmap(data);
  AppToast.show({ message: 'Success!' });
} catch (error) {
  AppToast.show({ message: 'Failed', type: 'error' });
}
```

## Key Patterns

- **Styling**: Use React Native UI Lib theming (colors, spacing, typography)
- **Forms**: Formik + Yup validation
- **i18n**: `TranslatedText` component or `useLocalization` hook
- **TypeScript**: Use `type` for unions, `interface` for objects
- **State**: Prefer immutable updates (`[...array, item]` over `array.push(item)`)

## Common Commands

```bash
npm start          # Dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm run format     # Prettier
```

## Effective Prompting

### ✅ Good Examples

- "Create `MilestoneCard` component displaying title, progress, due date using `AppCard` as base"
- "Add selector `selectFilteredRoadmaps` to filter by 'all', 'active', or 'completed' status"
- "Fix TypeScript error where `milestone` might be undefined in `RoadmapDetailsPage`"

### ❌ Avoid

- "Make it better" (too vague)
- "Add everything for user profiles" (too broad)
- "Change auth to Firebase" (architectural change)

## Project-Specific Details

### Data Model

```
Roadmap → Milestones[] → Tasks[] → Steps[]
```

Each level: `id`, `title`, `description`, `isCompleted`, `createdAt`, `updatedAt`

### Authentication

- Providers: Google Sign-In, Apple Auth
- Backend: Supabase
- State: `authSlice` (Redux + persisted)
- Protected routes in `src/app/(protected)/`

### Internationalization

- Languages: en, es, fr
- Use `TranslatedText` component or `useLocalization` hook
- Keys typed as `TranslationKeysType`

### Theming

- System: React Native UI Lib
- Hook: `useAppTheme()`
- Mode: light/dark (automatic)

## Common Mistakes to Avoid

```typescript
// ❌ Type safety
const user: any = useAppSelector(state => state.auth.user);
// ✅ Use selectors
const user = useAppSelector(selectUser);

// ❌ Hardcoded strings
<Text>Welcome to Dead Reckoner</Text>
// ✅ i18n
<TranslatedText text="welcome.title" />

// ❌ Relative imports
import { AppButton } from '../../components/AppButton';
// ✅ Alias imports
import { AppButton } from '@/components/AppButton';

// ❌ Direct mutation
state.roadmaps.push(newRoadmap);
// ✅ Immutable update
state.roadmaps = [...state.roadmaps, newRoadmap];
```

---

**Version**: 1.0.0 (Updated: Nov 10, 2025) | **Expo SDK**: 53.0.20 | **RN**: 0.79.5
