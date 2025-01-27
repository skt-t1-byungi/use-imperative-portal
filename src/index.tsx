import {
    createContext,
    createRef,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    RefObject,
    useContext,
    useReducer,
    useState,
    useSyncExternalStore,
} from 'react'

type Renderer = (...args: any) => ReactNode

export interface Portal<UpdaterArgs extends any[] = []> {
    readonly isClosed: boolean
    update(...args: UpdaterArgs): void
    close(): void
}

export type PortalOpener = <Node extends Renderer | ReactNode>(
    node: Node
) => Portal<Node extends Renderer ? Parameters<Node> : []>

function newInternalContextValue() {
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
                argsRef.current = updaterRef.current = null
                dispatch()
            },
        }
    }

    return {
        openPortal,
        subscribe(fn: () => void) {
            listeners.add(fn)
            return () => void listeners.delete(fn)
        },
        getSnapshot() {
            return snapshot
        },
    }
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

type InternalContextValue = ReturnType<typeof newInternalContextValue>

const INTERNAL_CONTEXT_KEY = Symbol('context')

export function createPortalContext() {
    const ctx = createContext<InternalContextValue | null>(null)

    function Provider({ children, withEndpoint = true }: PropsWithChildren<{ withEndpoint?: boolean }>) {
        const [ctxValue] = useState(() => newInternalContextValue())
        return (
            <ctx.Provider value={ctxValue}>
                {children}
                {withEndpoint && <Endpoint />}
            </ctx.Provider>
        )
    }

    function Endpoint() {
        const value = useContext(ctx)
        if (!value) {
            throw new Error('`Endpoint` must be used within PortalProvider')
        }
        const { subscribe, getSnapshot } = value
        const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
        return <>{snapshot}</>
    }

    return { [INTERNAL_CONTEXT_KEY]: ctx, Provider, Endpoint }
}

const defaultPortalContext = createPortalContext()
export const { Provider: PortalProvider, Endpoint: PortalEndpoint } = defaultPortalContext

export function useImperativePortal(context = defaultPortalContext) {
    const value = useContext(context[INTERNAL_CONTEXT_KEY])
    if (!value) {
        throw new Error('`useImperativePortal` must be used within PortalProvider')
    }
    return value.openPortal
}

function useForceUpdate() {
    return useReducer(() => ({}), {})[1]
}
