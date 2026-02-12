# Electrofishing Copilot Instructions

## Project Overview

React application for recording electrofishing surveys for Utah DWR. Uses Firebase (Auth, Firestore, Hosting, Functions) with ArcGIS Server backend for geospatial data.

## Architecture

### Data Flow
1. **Frontend** → Firebase Cloud Functions (`functions/index.js`) → ArcGIS Server Feature/GP Services
2. The proxy in `functions/index.js` uses `@ugrc/firebase-auth-arcgis-server-proxy` to authenticate and route requests
3. All ArcGIS endpoints are defined in `src/config.js` under `urls`

### State Management
- **App-level state**: `AppContext` in `src/App.jsx` using `useImmerReducer` - handles settings, map, loading state
- **Event data**: `SamplingEventContext` in `src/hooks/samplingEventContext.jsx` - manages all sampling event data (location, equipment, fish, habitat, etc.)
- Both contexts use Immer for immutable state updates

### Key Configuration
- `src/config.js`: Central config with field names, table names, URLs, and constants
- Field names map to ArcGIS feature service fields (e.g., `config.fieldNames.fish.SPECIES_CODE`)
- Table names match ArcGIS tables: `SamplingEvents`, `Fish`, `Equipment`, `Habitat`, etc.

## Development Commands

```bash
pnpm start           # Start app + Firebase emulators (auth, firestore, functions)
pnpm run e2e         # Run Playwright tests
pnpm run start:e2e   # Run Playwright tests in UI mode
pnpm run storybook   # Component development (requires pnpm start first)
pnpm test            # Lint + Vitest unit tests
```

## Code Patterns

### Component Structure
- Components in `src/components/` organized by domain: `location/`, `catch/`, `habitat/`, `method/`
- Storybook stories alongside components: `Component.stories.jsx`
- SCSS modules alongside components: `Component.scss`

### Domain-Driven Dropdowns
Use `DomainDrivenDropdown` for fields backed by ArcGIS coded value domains - it fetches options from the feature service:
```jsx
<DomainDrivenDropdown
  featureServiceUrl={config.urls.fishFeatureService}
  fieldName={config.fieldNames.fish.SPECIES_CODE}
  onChange={onChange}
  value={value}
/>
```

### Context Usage
```jsx
// App-level state
const { appState, appDispatch } = useAppContext();
appDispatch({ type: actionTypes.SETTINGS, payload: { zoom: 12 } });

// Sampling event data
const { eventState, eventDispatch } = useSamplingEventContext();
eventDispatch({ type: actionTypes.ADD_FISH, payload: { passNum: 1 } });
```

### Data Persistence
- In-progress data cached to `localforage` automatically
- Submitted reports archived separately in `submitted_reports` store

## Testing

### E2E Tests (Playwright)
- Located in `e2e/` directory
- Use custom `test` from `e2e/baseTest.js` which sets `window.IS_PLAYWRIGHT`
- Mock ArcGIS responses using fixtures in `e2e/fixtures/`
- `loadAndSignIn()` and `mockRequests()` utilities in `e2e/utilities.js`
- Run with `pnpm run e2e`

### Unit Tests (Vitest)
- Co-located with source files: `Component.test.js`
- Run with `pnpm test`

## Firebase Emulators

The app uses Firebase emulators for local development:
- Auth emulator with test accounts in `emulator_data/auth_export/`
- Firestore emulator with seed data
- Functions emulator proxying to ArcGIS Server

## Key Files Reference
- [src/config.js](src/config.js) - All configuration, field names, URLs
- [src/hooks/samplingEventContext.jsx](src/hooks/samplingEventContext.jsx) - Event state management and action types
- [functions/index.js](functions/index.js) - ArcGIS proxy configuration
- [e2e/utilities.js](e2e/utilities.js) - E2E test helpers
