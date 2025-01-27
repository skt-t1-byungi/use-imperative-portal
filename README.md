# use-imperative-portal 🔮

[![version](https://img.shields.io/npm/v/use-imperative-portal.svg?style=flat-square)](https://npmjs.org/use-imperative-portal)
[![minzip size](https://img.shields.io/bundlephobia/minzip/use-imperative-portal?label=size)](https://bundlephobia.com/result?p=use-imperative-portal)
[![license](https://img.shields.io/npm/l/use-imperative-portal?color=%23007a1f&style=flat-square)](https://github.com/skt-t1-byungi/use-imperative-portal/blob/master/LICENSE)

Imperative portal management with surgical precision. Control React portals like never before - **under 1kB gzipped!**

## Features ✨

-   💎 **Tiny footprint** - 0.8kB gzipped, zero dependencies
-   🎮 **Imperative API** - Open/update/close portals with function calls
-   🧠 **Lifecycle aware** - Always know portal state with `isClosed` checks
-   🌐 **Universal** - Works in React DOM _and_ React Native
-   🔀 **Multi-context** - Isolate portals for modals, toasts, etc
-   🛡 **Type-safe** - Full TypeScript support

## Installation 📦

```bash
npm install use-imperative-portal
```

## Quick Start ⚡

```jsx
import { openPortal, PortalEndpoint } from 'use-imperative-portal'

// Add to root layout
ReactDOM.createRoot(document.getElementById('root')).render(
    <>
        <App />
        <PortalEndpoint /> {/* 👈 Portal destination */}
    </>
)

// Use anywhere
function PaymentButton() {
    const handlePay = async () => {
        const portal = openPortal(<ProcessingSpinner />)

        try {
            await processPayment()
        } finally {
            portal.close()
        }
    }

    return <button onClick={handlePay}>Pay Now</button>
}
```

## Advanced Recipes 🧪

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
        const portal = openPortal((percent = 0) => <ProgressBar value={percent} />)

        let n = 0
        const interval = setInterval(() => {
            portal.update(n++)
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

// Layout
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

// Usage
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

## API Reference 📚

### `openPortal(node)`

```ts
function openPortal(node: ReactNode | ((...args) => ReactNode)): Portal
```

-   `node`: Static content or parameterized render function
-   Returns `Portal` object with:
    -   `update(...args)`: Update portal content
    -   `close()`: Remove portal
    -   `isClosed`: Boolean state

### `createPortalContext()`

```ts
function createPortalContext(): {
    openPortal: typeof openPortal
    Endpoint: ComponentType
}
```

Creates isolated portal environment with own endpoint

## Why This Library? 🏆

Traditional portal solutions often:

-   Require complex component hierarchies
-   Lack proper lifecycle management
-   Force single portal destination
-   Come with heavy dependencies

**use-imperative-portal** solves these with:

-   🚀 Direct imperative control
-   🧭 Lifecycle awareness via `isClosed` checks
-   🏝️ Context isolation
-   📦 Minimal footprint (0.8kB!)

## License 📄

MIT © [skt-t1-byungi](https://github.com/skt-t1-byungi)
