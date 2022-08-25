# use-imperative-portal

[![npm](https://badgen.net/npm/v/use-imperative-portal)](https://npm.im/use-imperative-portal)

Imperative React hooks for Portals

## Example

```jsx
import { useImperativePortal } from 'use-imperative-portal'

function Demo() {
    const openPortal = useImperativePortal()

    async function onClick() {
        const portal = openPortal((text = 'loading...') => (
            <Modal
                onRequestClose={() => {
                    portal.close() // 👈 Modal will be closed.
                }}
            >
                {text}
            </Modal>
        ))

        await asyncJob()

        if (portal.isClosed) {
            return
        }

        portal.update('updated!') // 👉 Modal changes from "loading ..." to "updated!"
    }

    return <button onClick={onClick}>Open!</button>
}
```

See a [Demo](https://codesandbox.io/s/use-imperative-portal-example-35g5mc).

## Getting Started

Install the package in your project.

```sh
npm install use-imperative-portal
```

Wrap the root component with `PortalProvider`.

```jsx
import { PortalProvider } from 'use-imperative-portal'

ReactDOM.createRoot(document.getElementById('root')).render(
    <PortalProvider>
        <App />
    </PortalProvider>
)
```

The `ReactNode` passed through the portal is added behind the `children` of `PortalProvider`.

```jsx
function App() {
    const openPortal = useImperativePortal()

    useEffect(() => {
        const portal1 = openPortal(<p>bbb</p>)
        const portal2 = openPortal(<p>ccc</p>)

        // ...
    }, [])

    return <div>aaa</div>
}
```

Output

```html
<div>aaa</div>
<div>bbb</div>
<div>ccc</div>
```

## API

### useImperativePortal()

This is a React hooks that returns the `openPortal()` function.

```js
import { useImperativePortal } from 'use-imperative-portal'

function App() {
    const openPortal = useImperativePortal()

    // ...
}
```

### openPortal(node)

This function render the `ReactNode` argument to the endpoint of the portal. And returns the imperative `portal` object.

```jsx
function onPopupOpenerClick() {
    const portal = openPortal(<Popup onClose={() => portal.close()} />)

    // ...
}
```

#### portal.update(...args)

When you open the portal, you can use a function instead of `ReactNode` and can be updated later.

```jsx
const portal = openPortal(({ title = 'Hi!', description = 'I luv you' } = {}) => (
    <section>
        <h3>{title}</h3>
        <p>{description}</p>
    </section>
))

// ...

portal.update({
    title: 'Hello!',
    description: 'I like u',
})
```

If it is a render using a function, the default value of the argument for the initial rendering is required.

#### portal.close()

Close the portal and remove the rendered nodes.

#### portal.isClosed

This value is whether the portal is closed.

```js
console.log(portal.isClosed) // => false

portal.close()

console.log(portal.isClosed) // => true
```

### \<PortalProvider withEndpoint={true} />

This is a Provider component that shares the portal context.

```jsx
import { PortalProvider } from 'use-imperative-portal'

// ...

root.render(
    <PortalProvider>
        <App />
    </PortalProvider>
)
```

#### providerProps.withEndpoint

If `withEndpoint` is `false`, the endpoint automatically specified in the provider will be disabled. The default is `true`.

```jsx
<PortalProvider withEndpoint={false} />
```

This is useful when setting the endpoint directly.

### PortalEndpoint

`ReactNode`, which is passed to the portal, is rendered to the place where this component is located.
This is useful when you want to change the endpoint position.

```jsx
import { PortalEndpoint, PortalProvider } from 'use-imperative-portal'

//...

root.render(
    <PortalProvider withEndpoint={false}>
        <div>
            <PortalEndpoint />
        </div>
        <App />
    </PortalProvider>
)
```

### createPortalContext()

Create a new portal context. Instead of using the Default context, it is useful for developing apps by mixing multiple portals.

```jsx
import { createPortalContext, useImperativePortal } from 'use-imperative-portal'

const modal = createPortalContext()
const toast = createPortalContext()

//...

root.render(
    <modal.Provider withEndpoint={false}>
        <toast.Provider>
            <div>
                <modal.Endpoint />
            </div>
            <App />
        </toast.Provider>
    </modal.Provider>
)

function App() {
    const openModalPortal = useImperativePortal(modal)
    const openToastPortal = useImperativePortal(toast)

    //...
}
```

## License

MIT © [skt-t1-byungi](https://github.com/skt-t1-byungi)
