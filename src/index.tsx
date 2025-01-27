import { createRef, ReactElement, ReactNode, RefObject, useReducer, useSyncExternalStore } from 'react'

export interface Portal<UpdaterArgs extends any[] = []> {
    readonly isClosed: boolean
    update(...args: UpdaterArgs): void
    close(): void
}
type Renderer<Args extends any[] = []> = (...args: Args) => ReactNode
export type PortalOpener = <Node extends Renderer | ReactNode>(
    node: Node
) => Portal<Node extends Renderer<infer Args> ? Args : []>

export function createPortalContext() {
    let uid = 0
    const portalsMap = new Map<number, ReactElement>()
    const listeners = new Set<() => void>()

    let snapshot: ReactElement[] = []

    function dispatch() {
        snapshot = Array.from(portalsMap.values())
        for (const fn of listeners) fn()
    }

    const openPortal: PortalOpener = node => {
        const id = uid++
        // It is not strict but expected to be enough.
        if (!Number.isSafeInteger(uid)) {
            uid = Number.MIN_SAFE_INTEGER
        }

        const argsRef = createRef()
        const updaterRef = createRef<() => void>()

        portalsMap.set(id, <Portal key={id} node={node} argsRef={argsRef} updaterRef={updaterRef} />)
        dispatch()

        return {
            get isClosed() {
                return !portalsMap.has(id)
            },
            update(...args: any) {
                if (!portalsMap.has(id)) {
                    throw new Error('Portal is closed')
                }
                argsRef.current = args
                updaterRef.current?.()
            },
            close() {
                portalsMap.delete(id)
                dispatch()
                argsRef.current = updaterRef.current = null
            },
        }
    }

    function subscribe(fn: () => void) {
        listeners.add(fn)
        return () => void listeners.delete(fn)
    }

    function getSnapshot() {
        return snapshot
    }

    function Endpoint() {
        useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
        return <>{snapshot}</>
    }

    return { openPortal, Endpoint }
}

function Portal({
    node,
    argsRef,
    updaterRef,
}: {
    node: Renderer | ReactNode
    argsRef: RefObject<any>
    updaterRef: RefObject<any>
}) {
    updaterRef.current = useForceUpdate()
    return <>{typeof node === 'function' ? node(...((argsRef.current ?? []) as Parameters<Renderer>)) : node}</>
}

const defaultPortalContext = createPortalContext()
export const { Endpoint: PortalEndpoint, openPortal } = defaultPortalContext

function useForceUpdate() {
    return useReducer(() => ({}), {})[1]
}
