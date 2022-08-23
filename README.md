# use-imperative-portal

Imperative React hooks for Portals.

> 🚧 WIP

## Example

```jsx
import { PortalProvider, useImperativePortal } from 'use-imperative-portal'

function App() {
    return (
        <main>
            <PortalProvider>
                <DemoButton />
            </PortalProvider>
        </main>
    )
}

function DemoButton() {
    const openPortal = useImperativePortal()

    return (
        <button
            onClick={async () => {
                // 컴포넌트가 렌더링된다.
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
