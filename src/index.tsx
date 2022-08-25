import {
    createContext,
    createRef,
    MutableRefObject,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    useContext,
    useId,
    useLayoutEffect,
    useReducer,
    useRef,
} from 'react'

type Renderer = (...args: any) => ReactNode

export interface Portal<UpdaterArgs extends any[] = []> {
    readonly isClosed: boolean
    update(...args: UpdaterArgs): void
    close(): void
}

export type PortalOpener = <R extends Renderer | ReactNode>(
    render: R
) => Portal<R extends Renderer ? Parameters<R> : []>

function newInternalContextValue() {
    let uid = 0
    const portalsMap = new Map<number, ReactElement>()
    const listenersMap = new Map<string, () => void>()

    function dispatch() {
        for (const fn of listenersMap.values()) fn()
    }

    const openPortal: PortalOpener = node => {
        const id = uid++
        // It is not strict but expected to be enough.
        if (!Number.isSafeInteger(uid)) {
            uid = Number.MIN_SAFE_INTEGER
        }

        const argsRef: MutableRefObject<any> = createRef()
        const updaterRef: MutableRefObject<(() => void) | null> = createRef()

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

    return { portalsMap, listenersMap, openPortal }
}

function Portal({
    node,
    argsRef,
    updaterRef,
}: {
    node: Renderer | ReactNode
    argsRef: MutableRefObject<any>
    updaterRef: MutableRefObject<any>
}) {
    updaterRef.current = useForceUpdate()
    return <>{typeof node === 'function' ? node(...((argsRef.current ?? []) as Parameters<Renderer>)) : node}</>
}

type InternalContextValue = ReturnType<typeof newInternalContextValue>

const INTERNAL_CONTEXT_KEY = Symbol('context')

export function createPortalContext() {
    const ctx = createContext<InternalContextValue | null>(null)

    function Provider({ children, withEndpoint = true }: PropsWithChildren<{ withEndpoint?: boolean }>) {
        return (
            <ctx.Provider value={(useRef<InternalContextValue>().current ??= newInternalContextValue())}>
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

        const { listenersMap, portalsMap } = value
        const id = useId()
        const forceUpdate = useForceUpdate()

        // Defense in advance in case the portal opens during the render phase.
        if (!listenersMap.has(id)) {
            listenersMap.set(id, forceUpdate)
        }
        useLayoutEffect(() => {
            // This is the code for the Strict Mode.
            // In Strict Mode, if the listener is not registered again in the effect phase,
            // the listener is not finally registered.
            if (!listenersMap.has(id)) {
                listenersMap.set(id, forceUpdate)
            }
            return () => void listenersMap.delete(id)
        }, [])

        return <>{Array.from(portalsMap.values())}</>
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
