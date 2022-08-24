# use-imperative-portal

Imperative React hooks for Portals.

> 🚧 WIP

## Example

```jsx
import { PortalProvider, useImperativePortal } from 'use-imperative-portal'

function App() {
    return (
        <PortalProvider>
            <DemoButton />
        </PortalProvider>
    )
}

function DemoButton() {
    const openPortal = useImperativePortal()

    return (
        <button
            onClick={async () => {
                const portal = openPortal((text = 'loading...') => (
                    <Modal
                        onRequestClose={() => {
                            portal.close() // 👈 Modal is removed because the portal is closed.
                        }}
                    >
                        <p>{text}</p>
                    </Modal>
                ))

                await asyncJob()

                if (portal.isClosed) {
                    return
                }

                portal.update('updated!') // 👉 Modal changes from "loading ..." to "updated!"
            }}
        >
            DEMO
        </button>
    )
}
```

## LICENSE

MIT
