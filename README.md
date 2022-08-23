# use-imperative-portal

Imperative React hooks for Portals.

## Example

```jsx
import { useImperativePortal } from 'use-imperative-portal'

function DemoButton() {
    const openPortal = useImperativePortal()

    return (
        <button
            onClick={async () => {
                const portal = openPortal((text = 'loading...') => (
                    <Modal onClose={() => portal.close()}>
                        <p>{text}</p>
                    </Modal>
                ))

                await delay(1000)
                if (portal.isClosed) return

                portal.update('updated.') // => Modal changes from "loading ..." to "updated."

                await delay(1000)
                if (!portal.isClosed) portal.close()
            }}
        >
            DEMO
        </button>
    )
}
```

## LICENSE

MIT
