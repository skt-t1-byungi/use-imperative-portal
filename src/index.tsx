import {
    createContext,
    createRef,
    MutableRefObject,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    useContext,
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

const CONTEXT_KEY = Symbol('context')

export function createPortalContext() {
    const context = createContext<PortalOpener | null>(null)

    return {
        [CONTEXT_KEY]: context,

        Provider({ children }: PropsWithChildren) {
            const portalsById: Map<number, ReactElement> = (useRef<any>().current ??= new Map())
            const forceUpdate = useForceUpdate()
            const uidRef = useRef(0)

            function nextId() {
                try {
                    return uidRef.current
                } finally {
                    if (!Number.isSafeInteger(++uidRef.current)) {
                        uidRef.current = Number.MIN_SAFE_INTEGER
                    }
                }
            }

            const openPortal = (useRef<PortalOpener>().current ??= render => {
                const id = nextId()
                const argsRef: MutableRefObject<any> = createRef()
                const updateRef: MutableRefObject<(() => void) | null> = createRef()

                portalsById.set(id, <Portal key={id} render={render} argsRef={argsRef} updateRef={updateRef} />)
                forceUpdate()

                const api = {
                    get isClosed() {
                        return !portalsById.has(id)
                    },
                    update(...args: any) {
                        if (api.isClosed) {
                            throw new Error('Portal is closed')
                        }
                        argsRef.current = args
                        updateRef.current?.()
                    },
                    close() {
                        portalsById.delete(id)
                        argsRef.current = updateRef.current = null
                        forceUpdate()
                    },
                }

                return api
            })

            return (
                <context.Provider value={openPortal}>
                    {children}
                    {Array.from(portalsById.values())}
                </context.Provider>
            )
        },
    }
}

function Portal({
    render,
    argsRef,
    updateRef,
}: {
    render: Renderer | ReactNode
    argsRef: MutableRefObject<any>
    updateRef: MutableRefObject<any>
}) {
    updateRef.current = useForceUpdate()
    return <>{typeof render === 'function' ? render(...((argsRef.current ?? []) as Parameters<Renderer>)) : render}</>
}

const defaultPortalContext = createPortalContext()

export const PortalProvider = defaultPortalContext.Provider

export function useImperativePortal(context = defaultPortalContext) {
    const openPortal = useContext(context[CONTEXT_KEY])
    if (!openPortal) {
        throw new Error('`useImperativePortal` must be used within PortalProvider')
    }
    return openPortal
}

function useForceUpdate() {
    return useReducer(() => ({}), {})[1]
}
