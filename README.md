# use-imperative-portal 🔮

[![version](https://img.shields.io/npm/v/use-imperative-portal.svg?style=flat-square)](https://npmjs.org/use-imperative-portal)
[![minzip size](https://img.shields.io/bundlephobia/minzip/use-imperative-portal?label=size)](https://bundlephobia.com/result?p=use-imperative-portal)
[![license](https://img.shields.io/npm/l/use-imperative-portal?color=%23007a1f&style=flat-square)](https://github.com/skt-t1-byungi/use-imperative-portal/blob/master/LICENSE)

Manage React portals imperatively with minimal overhead. A single function call lets you open, update, and close portals.

## Features ✨

-   🚀 Tiny (0.6kB gzipped) with no external dependencies
-   🧩 Imperative API for opening, updating, and closing
-   🔎 Lifecycle awareness through `isClosed` property
-   🌐 Supports React DOM and React Native
-   🔀 Multiple isolated contexts (useful for modals, toasts, etc.)
-   💻 Includes TypeScript definitions

## Installation

```bash
npm install use-imperative-portal
```

## Quick Start

```jsx
import { openPortal, PortalEndpoint } from 'use-imperative-portal'

// Render endpoint once at root level
ReactDOM.createRoot(document.getElementById('root')).render(
    <>
        <App />
        <PortalEndpoint /> {/* Portals render here */}
    </>
)

function PaymentButton() {
    const handlePay = async () => {
        // Open portal with initial content
        const portal = openPortal(<div>Processing payment...</div>)

        try {
            await processPayment()
            // Update portal content
            portal.update(<div>Payment complete!</div>)
        } catch (error) {
            // Update with error state
            portal.update(<div className="error">Payment failed!</div>)
        } finally {
            // Close after 2 seconds
            setTimeout(portal.close, 2000)
        }
    }

    return <button onClick={handlePay}>Pay Now</button>
}
```

## Advanced Recipes

### Global Error Handler (Non-component)

```jsx
// api.js
import { openPortal } from 'use-imperative-portal'

export const apiClient = {
    async get(url) {
        try {
            return await axios.get(url)
        } catch (error) {
            const portal = openPortal(<Toast message="API Error!" />)
            setTimeout(portal.close, 5000)
            throw error
        }
    },
}
```

### Dynamic Content Update

Pass a function to create updatable portals:

```jsx
function ProgressTracker() {
    const startUpload = () => {
        // Create portal with dynamic content function
        const portal = openPortal((percent = 0, status = 'Preparing') => (
            <div>
                <ProgressBar value={percent} />
                <span>{status}</span>
            </div>
        ))

        simulateUpload({
            onProgress: pct => {
                portal.update(pct, 'Uploading...')
            },
            onComplete: () => {
                portal.update(100, 'Processing')
                setTimeout(portal.close, 1000)
            },
        })
    }

    return <button onClick={startUpload}>Start Upload</button>
}
```

### Multi-context Isolation

Create separate portal environments for different use cases:

```jsx
const ModalContext = createPortalContext()
const NotificationContext = createPortalContext()

function Root() {
    return (
        <>
            <NotificationContext.Endpoint />
            <main>
                <App />
            </main>
            <ModalContext.Endpoint />
        </>
    )
}

function App() {
    const showModal = () => ModalContext.openPortal(<Dialog />)
    const notify = () => NotificationContext.openPortal(<Toast />)

    return (
        <>
            <button onClick={showModal}>Open Dialog</button>
            <button onClick={notify}>Show Toast</button>
        </>
    )
}
```

## API Reference ⭐

### `openPortal(node?)`

Opens a new portal and returns a controller object to manage it.

-   **Parameters**:

    -   `node`: A React node (like JSX elements, strings, numbers) **or** a function that returns a React node.
        -   When providing a function:
            -   Must accept zero arguments initially (parameters should be optional)
            -   Will be called immediately without arguments when opening the portal
            -   Parameters can be passed later via `portal.update()`

-   **Returns** an object with:
    -   **`update(...args)`**: Updates the portal's content.
        -   If `node` was a function, pass the same arguments expected by that function
        -   If `node` was a static React node, pass a single argument with the new React node
    -   **`close()`**: Closes the portal and removes it from the endpoint
    -   **`isClosed`**: A boolean (read-only) that becomes `true` once the portal is closed

### `PortalEndpoint`

A React component that renders all active portals. Include this component once in your app's root or wherever portals should appear.

```jsx
function App() {
    return (
        <div>
            <MainContent />
            <PortalEndpoint /> {/* Portals render here */}
        </div>
    )
}
```

### `createPortalContext()`

Creates an independent portal environment for isolated groups (e.g., separate modal and notification systems).

-   **Returns** an object containing:
    -   **`openPortal`**: Function identical to the default `openPortal`, but scoped to this context.
    -   **`Endpoint`**: Component where portals from this context will render.

```jsx
// Create separate contexts
const ModalContext = createPortalContext()
const ToastContext = createPortalContext()

function App() {
    return (
        <>
            <ModalContext.Endpoint /> {/* Modals render here */}
            <ToastContext.Endpoint /> {/* Toasts render here */}
            <MainApp />
        </>
    )
}

function openModal() {
    ModalContext.openPortal(<Dialog />) // Opens in ModalContext's endpoint
}
```

## Why This Library? 🏆

Traditional portal solutions often:

-   Require complex component hierarchies
-   Lack clear lifecycle management
-   Offer a single portal destination
-   Include heavier dependencies

use-imperative-portal tackles these by:

-   ✨ Allowing direct imperative control
-   🔎 Exposing lifecycle awareness via `isClosed`
-   🏝️ Supporting isolated contexts for different use cases
-   📦 Keeping footprint small and usage simple

---

## License

MIT © [skt-t1-byungi](https://github.com/skt-t1-byungi)
