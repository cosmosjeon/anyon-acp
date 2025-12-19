# ANYON Development Guide

> AI-Powered Development Platform

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18+ | Frontend runtime, auth server |
| **npm/bun** | Latest | Package management |
| **Rust** | 1.70+ | Tauri backend |
| **Cargo** | Latest | Rust package manager |

### Optional Software

| Software | Purpose |
|----------|---------|
| **Bun** | Faster alternative to npm |
| **Docker** | Container builds |

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/SL-IT-AMAZING/anyon-claude.git
cd anyon-claude
```

### 2. Install Dependencies

```bash
# Frontend dependencies
npm install

# Or with Bun (faster)
bun install

# Auth server dependencies
cd server
npm install
cd ..
```

### 3. Environment Variables

Create `.env` file in project root:

```env
# Google OAuth (required for production auth)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
OAUTH_REDIRECT_URI=http://localhost:4000/auth/google/callback

# JWT Secret (change in production!)
JWT_SECRET=your-jwt-secret

# Analytics (optional)
VITE_PUBLIC_POSTHOG_KEY=your-posthog-key
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Server
PORT=4000
NODE_ENV=development
```

### 4. Rust Setup (for Tauri)

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add wasm target (optional)
rustup target add wasm32-unknown-unknown

# Install Tauri CLI
cargo install tauri-cli
```

---

## Running Development

### Full Stack Development

```bash
# Start all services (frontend + backend + Tauri)
npm run dev
```

This runs:
- **Frontend**: Vite dev server on `http://localhost:1420`
- **Backend**: Auth server on `http://localhost:4000`

### With Bun (Faster)

```bash
bun run dev:bun
```

### Individual Services

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
# or
cd server && npm start

# Tauri dev mode
npm run tauri:dev
```

---

## Build Commands

### Frontend Build

```bash
# Production build
npm run build

# Type checking
npm run check
```

Output: `dist/` directory

### Desktop App Build

```bash
# All platforms
npm run tauri build

# macOS DMG only
npm run build:dmg

# Build with Bun
bun run build:bun
```

Output:
- macOS: `src-tauri/target/release/bundle/dmg/`
- Windows: `src-tauri/target/release/bundle/msi/`
- Linux: `src-tauri/target/release/bundle/deb/`

### Executables Build

```bash
# All platforms
npm run build:executables

# Specific platform
npm run build:executables:macos
npm run build:executables:windows
npm run build:executables:linux
```

---

## Testing

### Type Checking

```bash
# Full type check (TypeScript + Rust)
npm run check
```

### Frontend Tests

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch
```

### Rust Tests

```bash
cd src-tauri
cargo test
```

---

## Key Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Full stack development |
| `npm run dev:frontend` | Vite dev server only |
| `npm run dev:backend` | Auth server only |
| `npm run dev:bun` | Development with Bun |
| `npm run build` | Production frontend build |
| `npm run tauri` | Tauri CLI commands |
| `npm run check` | TypeScript + Rust type check |
| `npm run clean:cache` | Clear build caches |
| `npm run kill:servers` | Kill all dev servers |

---

## Code Style

### TypeScript/React

- **ESLint**: Configured in project
- **Prettier**: Code formatting
- **Strict Mode**: Enabled in tsconfig.json

```typescript
// Component pattern
const MyComponent: React.FC<Props> = ({ prop }) => {
  return <div>{prop}</div>;
};

// Hook pattern
const useCustomHook = () => {
  const [state, setState] = useState();
  return { state };
};
```

### Rust

- **rustfmt**: Automatic formatting
- **Clippy**: Linting

```rust
// Command pattern
#[tauri::command]
async fn my_command(state: State<'_, MyState>) -> Result<Data, String> {
    // implementation
}
```

---

## Common Development Tasks

### Adding a New Component

1. Create file in `src/components/`
2. Export from component
3. Import where needed
4. Add types if complex

### Adding a New Zustand Store

1. Create `src/stores/myStore.ts`
2. Define state interface
3. Create store with `create<State>()`
4. Export hook

```typescript
// src/stores/myStore.ts
import { create } from 'zustand';

interface MyState {
  value: string;
  setValue: (v: string) => void;
}

export const useMyStore = create<MyState>((set) => ({
  value: '',
  setValue: (v) => set({ value: v }),
}));
```

### Adding a New Tauri Command

1. Add function in `src-tauri/src/commands/`
2. Mark with `#[tauri::command]`
3. Register in `main.rs` `invoke_handler`
4. Call from frontend with `invoke()`

```rust
// src-tauri/src/commands/my_feature.rs
#[tauri::command]
pub async fn my_command(param: String) -> Result<String, String> {
    Ok(format!("Result: {}", param))
}
```

```typescript
// Frontend
import { invoke } from '@tauri-apps/api/tauri';
const result = await invoke<string>('my_command', { param: 'value' });
```

### Adding a New API Endpoint (Server)

1. Add route in `server/index.js`
2. Use `authenticate` middleware if auth required
3. Call from frontend

```javascript
// server/index.js
app.get('/api/my-endpoint', authenticate, (req, res) => {
  res.json({ data: 'value' });
});
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill all dev servers
npm run kill:servers

# Or manually
lsof -ti:1420 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### Tauri Build Fails

```bash
# Clean Rust build
cd src-tauri
cargo clean
cd ..

# Rebuild
npm run tauri build
```

### Node Modules Issues

```bash
# Clean and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
npm run clean:cache
```

### Rust Compilation Errors

```bash
# Update Rust
rustup update

# Check dependencies
cd src-tauri
cargo update
```

---

## IDE Setup

### VSCode Extensions

- **Rust Analyzer**: Rust language support
- **Tauri**: Tauri development
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Tailwind autocomplete

### Recommended Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  },
  "rust-analyzer.cargo.features": "all"
}
```

---

## Architecture Notes

### Data Flow

```
User Action
    ↓
React Component
    ↓
Zustand Store / Hook
    ↓
API Call (invoke or fetch)
    ↓
Tauri Command or HTTP Server
    ↓
Business Logic (Rust/Node.js)
    ↓
Response
    ↓
State Update
    ↓
UI Re-render
```

### State Management Strategy

| Layer | Technology | Use Case |
|-------|------------|----------|
| **Local** | useState | Component-only state |
| **Global** | Zustand | Shared state across components |
| **Context** | React Context | Theme, tabs, providers |
| **Persistent** | localStorage | Session restoration |
| **Backend** | SQLite | Agents, settings, checkpoints |

### IPC Pattern

```typescript
// Frontend → Backend
invoke<ReturnType>('command_name', { param1, param2 })

// Backend → Frontend (events)
app.emit('event_name', payload)

// Frontend listens
listen('event_name', (event) => { ... })
```
