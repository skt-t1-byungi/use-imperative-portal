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

ReactDOM.createRoot(document.getElementById('root')).render(
    <>
        <App />
        <PortalEndpoint /> {/* The portal destination */}
    </>
)

function PaymentButton() {
    const handlePay = async () => {
        const portal = openPortal(<ProcessingSpinner />)

        try {
            await processPayment()
            portal.close()
        } catch (error) {
            portal.update(<ErrorPaymentMessage onClose={portal.close} />)
        }
    }

    return <button onClick={handlePay}>Pay Now</button>
}
```

To close a portal from inside a component, pass a function so you can call `portal.close()` later:

```jsx
function CancelableModal({ onClose }) {
    return (
        <div>
            <p>Some content here...</p>
            <button onClick={onClose}>Cancel</button>
        </div>
    )
}

function Example() {
    const handleOpen = () => {
        const portal = openPortal(() => <CancelableModal onClose={() => portal.close()} />)
    }

    return <button onClick={handleOpen}>Open Cancelable Modal</button>
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

```jsx
function ProgressTracker() {
    const startProcess = () => {
        // If openPortal is given a function, portal.update will pass that function new arguments
        const portal = openPortal((percent = 0) => <ProgressBar value={percent} />)

        let progress = 0
        const interval = setInterval(() => {
            portal.update(progress++)
        }, 1000)

        setTimeout(() => {
            portal.close()
            clearInterval(interval)
        }, 100_000)
    }

    return <button onClick={startProcess}>Start</button>
}
```

### Multi-context Isolation

```jsx
const ModalContext = createPortalContext()
const NotificationContext = createPortalContext()

function Root() {
    return (
        <>
            <aside>
                <NotificationContext.Endpoint />
            </aside>
            <App />
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

### openPortal(node)

```ts
function openPortal<Node extends ReactNode | ((...args: any[]) => ReactNode)>(
    node: Node
): Portal<Node extends (...args: any[]) => ReactNode ? Parameters<Node> : [ReactNode]>
```

• `node`: A `ReactNode` or a function that returns a `ReactNode`.
• Returns a `Portal` object:

-   `portal.update(...args)`: Updates content with new arguments
-   `portal.close()`: Closes the portal
-   `portal.isClosed`: Indicates whether the portal has been closed

### createPortalContext()

```ts
function createPortalContext(): {
    openPortal: typeof openPortal
    Endpoint: ComponentType
}
```

Creates an isolated portal environment with its own `openPortal` and `Endpoint`.

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
