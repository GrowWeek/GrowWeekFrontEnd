# Project Context
This is a "Task Management & Retrospective" web application named **GrowWeek**.
The goal is to help developers and office workers manage daily tasks and perform weekly retrospectives with AI assistance.

# Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **State Management**: React Query (Server), Context API / Local State (Client)
- **HTTP Client**: Axios

# UI/UX Design Guidelines (macOS Style)
1.  **Overall Aesthetic**:
    - Follow **macOS Desktop App** design language.
    - Use clean borders, subtle shadows, and rounded corners (`rounded-xl` or `rounded-2xl`).
    - Use **Glassmorphism** (backdrop-blur) for overlays or accent elements where appropriate.
    - Font: System font stack (San Francisco feel).

2.  **Layout Structure**:
    - **Full Screen**: The app should occupy the full height/width of the browser viewport (minus header).
    - Avoid centered "container" layouts for the main app view; maximize space usage.
    - **Header**: Full width, sticky top, minimal height (h-14), Logo on left.
    - **Main Container**: Use `MacOSWindow` component as the primary wrapper for content.
    - **Navigation**: Use `WindowTabs` for top-level navigation within the window context.

3.  **Component Patterns**:
    - **Atoms**: Located in `src/components/ui/` (Button, Input, Card, Badge, Dialog).
    - **Features**: Business logic components go into `src/features/<feature-name>/components/`.
    - **Class Names**: ALWAYS use `cn(...)` utility from `@/lib/utils` for class merging.
    - **Dialogs**: Use portals (already implemented in `Dialog` component) for modals.

# Folder Structure Convention
- `src/app/`: Next.js App Router pages.
- `src/features/`: Feature-based modules.
    - `todo/`: Todo management (Kanban board, etc.).
    - `retrospective/`: Weekly retrospective flow.
- `src/components/layout/`: Global layout components (Header, MacOSWindow, WindowTabs).
- `src/components/ui/`: Reusable primitive components.

# Coding Rules
1.  **Functional Components**: Use `function ComponentName() {}` syntax.
2.  **Strict Types**: Avoid `any`. Define interfaces for props.
3.  **Server vs Client**:
    - Default to Server Components.
    - Add `'use client'` only when interactivity (hooks, event listeners) is needed.
4.  **Imports**: Use absolute imports `@/...`.

