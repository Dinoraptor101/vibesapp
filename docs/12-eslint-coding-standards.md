# ESLint & Code Quality Standards

## Quick Reference

✅ **Status**: All ESLint errors fixed! Only warnings remain.
📊 **Current**: 0 errors, ~85 warnings  
🎯 **Goal**: Maintain 0 errors, gradually reduce warnings

## Summary of Changes Made

### Fixed Issues:

1. **Missing global types** - Added `WindowEventMap`, `NodeJS.Timeout`, `RequestInit` to `global.d.ts`
2. **Regex escape characters** - Fixed unnecessary escapes in validation patterns
3. **API type definitions** - Simplified `RequestConfig` interface, fixed `ApiError` class
4. **React imports** - Added missing React import in message types

### ESLint Configuration Updates:

- **Unused parameters**: Now allow `_` prefix pattern (`_event`, `_data`, etc.)
- **Any types**: Warn instead of error to allow gradual migration
- **Flexible rules**: More lenient for type definition files

---

# ESLint & Code Quality Standards

This document outlines coding standards and best practices to maintain code quality and prevent common linting issues in the VibesApp project.

## ESLint Configuration

Our ESLint configuration is designed to:

- Maintain code consistency
- Catch potential bugs early
- Allow flexibility during development
- Support TypeScript best practices

### Key Rules Overview

#### 1. Unused Variables & Parameters

**Rule**: `@typescript-eslint/no-unused-vars`

**Standard**: Prefix unused parameters with underscore (`_`) to indicate intentional non-use.

```typescript
// ✅ Good - Underscore prefix for unused parameters
export const useEventListener = <T extends string>(
  eventName: T,
  handler: (_event: Event) => void, // Intentionally unused in type definition
  element?: EventTarget,
) => {
  // Implementation
};

// ❌ Bad - Unused parameter without underscore
export const badFunction = (event: Event) => {
  // event is not used but not prefixed with _
};
```

**Common Scenarios:**

- **Interface definitions**: Parameters in interface methods that define the contract
- **Generic type constraints**: Type parameters that define function signatures
- **Event handlers**: Event parameters that may not always be used
- **Callback functions**: Parameters required by the API but not used in specific implementations

#### 2. Any Types

**Rule**: `@typescript-eslint/no-explicit-any`

**Standard**: Avoid `any` types where possible, use specific types or `unknown` instead.

```typescript
// ✅ Good - Specific types
interface MessageHandler {
  onMessage: (message: IMessage) => void;
  onError: (error: Error) => void;
  metadata: Record<string, string | number>;
}

// ✅ Acceptable - During migration or for truly dynamic content
interface LegacyApiResponse {
  data: any; // TODO: Replace with specific type when API is updated
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any; // External library type, will be replaced in v2
}

// ❌ Bad - Unnecessary any usage
interface BadInterface {
  value: any; // Should be string | number | boolean
  callback: any; // Should be () => void
}
```

**Migration Strategy:**

1. Document why `any` is needed with a comment
2. Add TODO comments for future improvements
3. Use `unknown` for truly unknown data that will be type-guarded
4. Create specific union types when possible

#### 3. React Hooks Dependencies

**Rule**: `react-hooks/exhaustive-deps`

**Standard**: Always include dependencies or explicitly disable with explanation.

```typescript
// ✅ Good - All dependencies included
useEffect(() => {
  fetchData(userId, filter);
}, [userId, filter]);

// ✅ Good - Explicit disable with reason
useEffect(() => {
  // Only run once on mount for initialization
  initializeApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// ✅ Good - Using callback ref for stable function
const stableCallback = useCallback(
  (data) => {
    processData(data, config);
  },
  [config],
);

useEffect(() => {
  stableCallback(initialData);
}, [stableCallback]);

// ❌ Bad - Missing dependencies
useEffect(() => {
  fetchData(userId, filter); // userId and filter should be in deps
}, []);
```

#### 4. Function Parameter Types

**Standard**: Use descriptive parameter names even in type definitions.

```typescript
// ✅ Good - Descriptive parameter names
type EventHandler<T> = (event: T, context: EventContext) => void;
type Validator<T> = (value: T, field: string) => ValidationResult;

// ✅ Good - For unused parameters in interfaces
interface ComponentProps {
  onUpdate?: (_value: string, _index: number) => void; // Interface contract
}

// ❌ Bad - Generic parameter names
type BadHandler = (data: any) => any;
```

## File-Specific Standards

### 1. Type Definition Files (`/types/**`, `*.d.ts`)

**Relaxed Rules**: Type definition files have more lenient rules for:

- `any` types (often necessary for external APIs)
- Unused parameters (interface contracts)

```typescript
// types/api.ts - More permissive
export interface ExternalApiResponse {
  data: any; // External API, type unknown
  meta: {
    [key: string]: any; // Dynamic metadata
  };
}

export interface EventCallback {
  (event: Event, data: any): void; // Interface definition
}
```

### 2. Hook Files (`/hooks/**`)

**Standards for custom hooks:**

```typescript
// ✅ Good hook structure
export const useCustomHook = <T>(
  initialValue: T,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validator?: (value: T) => boolean, // Optional validator interface
): [T, (newValue: T) => void] => {
  const [value, setValue] = useState(initialValue);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
  }, []);

  return [value, updateValue];
};
```

### 3. Component Files

**Standards for React components:**

```typescript
// ✅ Good component structure
interface ComponentProps {
  data: IData;
  onUpdate?: (data: IData) => void;
  className?: string;
}

export const Component: React.FC<ComponentProps> = ({
  data,
  onUpdate,
  className
}) => {
  // Use all props or prefix with _ if intentionally unused
  const handleClick = useCallback(() => {
    onUpdate?.(data);
  }, [data, onUpdate]);

  return (
    <div className={className} onClick={handleClick}>
      {data.name}
    </div>
  );
};
```

## Development Workflow

### 1. Pre-commit Checks

```bash
# Run linting before commit
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Type check
npm run build
```

### 2. Handling Warnings vs Errors

**Errors (Must Fix):**

- Syntax errors
- Type errors
- Undefined variables
- Import/export issues

**Warnings (Should Fix):**

- Unused variables
- `any` types
- Missing dependencies
- Console.log statements

### 3. ESLint Disable Guidelines

**When to disable:**

```typescript
// ✅ Good - Specific rule with explanation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyData: any = externalLibrary.getData(); // External lib returns any

// ✅ Good - React hooks with explanation
useEffect(() => {
  // Only run on mount for initialization
  setupGlobalListeners();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// ❌ Bad - Disabling without explanation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = someFunction();
```

**Never disable:**

- `react-hooks/rules-of-hooks` (breaks React)
- `no-unused-vars` for the entire file
- Multiple rules at once without specific reason

## IDE Configuration

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "eslint.enable": true,
  "eslint.format.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

### VS Code Extensions

Recommended extensions:

- ESLint
- TypeScript Importer
- Auto Rename Tag
- Prettier - Code formatter

## Migration Strategy

### Existing Codebase

1. **Phase 1**: Fix all errors (blocking issues)
2. **Phase 2**: Address `any` types in new code
3. **Phase 3**: Gradually replace `any` types in existing code
4. **Phase 4**: Tighten rules as codebase improves

### New Code

All new code should:

- Use specific types instead of `any`
- Include proper React hook dependencies
- Follow naming conventions
- Include appropriate comments for disabled rules

## Common Patterns

### 1. Event Handlers

```typescript
// ✅ Component event handlers
const handleSubmit = useCallback(
  (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  },
  [formData, onSubmit],
);

// ✅ Custom event handlers
const handleCustomEvent = useCallback((_event: CustomEvent) => {
  // Event object not needed, but part of interface
  performAction();
}, []);
```

### 2. Generic Functions

```typescript
// ✅ Generic utility functions
export const createValidator = <T>(
  schema: ValidationSchema<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
): ((value: T) => ValidationResult) => {
  return (value: T) => validateAgainstSchema(value, schema);
};
```

### 3. Interface Definitions

```typescript
// ✅ Callback interfaces
export interface ApiCallbacks {
  onSuccess?: (data: ApiResponse) => void;
  onError?: (error: ApiError) => void;
  onProgress?: (_progress: number) => void; // Progress value unused in interface
}
```

This configuration balances code quality with development flexibility, allowing the team to maintain standards while accommodating the realities of a large codebase migration.
