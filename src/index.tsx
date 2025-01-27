import { createRef, ReactElement, ReactNode, RefObject, useReducer, useSyncExternalStore } from 'react'

export interface Portal<UpdaterArgs extends any[] = [ReactNode]> {
    readonly isClosed: boolean
    update(...args: UpdaterArgs): void
    close(): void
}

type Renderer<Args extends any[] = []> = (...args: Args) => ReactNode

export type PortalOpener = <Node extends Renderer | ReactNode>(
    node: Node
) => Portal<Node extends Renderer<infer Args> ? Args : [ReactNode]>

export function createPortalContext() {
    let uid = 0
    const portalsMap = new Map<number, ReactElement>()
    const listeners = new Set<() => void>()

    let snapshot: ReactElement[] = []

    function dispatch() {
        snapshot = [...portalsMap.values()]
        for (const fn of listeners) fn()
    }

    const openPortal: PortalOpener = node => {
        const id = uid++

        const argsRef = createRef()
        const updaterRef = createRef<() => void>()

        let renderer: Renderer<any>
        if (typeof node === 'function') {
            renderer = node
            argsRef.current = []
        } else {
            renderer = (n: ReactNode) => n
            argsRef.current = [node]
        }

        portalsMap.set(id, <Portal key={id} renderer={renderer} argsRef={argsRef} updaterRef={updaterRef} />)
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

function Portal<Args extends any[]>({
    renderer,
    argsRef,
    updaterRef,
}: {
    renderer: Renderer<Args>
    argsRef: RefObject<Args>
    updaterRef: RefObject<any>
}) {
    updaterRef.current = useReducer(() => ({}), {})[1]
    return <>{renderer(...argsRef.current)}</>
}

export const { Endpoint: PortalEndpoint, openPortal } = createPortalContext()
