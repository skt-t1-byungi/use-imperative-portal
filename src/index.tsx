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

type Renderer = (props: any) => ReactNode
export type PortalOpener = <R extends Renderer | ReactNode>(
    render: R
) => {
    update: (...args: R extends Renderer ? Parameters<R> : []) => void
    close: () => void
}

const CONTEXT_KEY = Symbol('context')

export function createPortalContext() {
    const context = createContext<PortalOpener | null>(null)

    return {
        [CONTEXT_KEY]: context,

        Provider({ children }: PropsWithChildren) {
            const portalsById: Map<number, ReactElement> = (useRef<any>().current ??= new Map())
            const forceUpdate = useReducer(() => ({}), {})[1]
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

            const open = (useRef<PortalOpener>().current ??= render => {
                const id = nextId()
                const propsRef: MutableRefObject<any> = createRef()
                const updateRef: MutableRefObject<(() => void) | null> = createRef()

                portalsById.set(id, <Portal key={id} render={render} propsRef={propsRef} updateRef={updateRef} />)
                forceUpdate()

                return {
                    update(props?: any) {
                        propsRef.current = props
                        updateRef.current?.()
                    },
                    close() {
                        portalsById.delete(id)
                        propsRef.current = updateRef.current = null
                        forceUpdate()
                    },
                }
            })

            return (
                <context.Provider value={open}>
                    {children}
                    {Array.from(portalsById.values())}
                </context.Provider>
            )
        },
    }
}

function Portal({
    render,
    propsRef,
    updateRef,
}: {
    render: Renderer | ReactNode
    propsRef: MutableRefObject<any>
    updateRef: MutableRefObject<any>
}) {
    const forceUpdate = useReducer(() => ({}), {})[1]
    updateRef.current ??= forceUpdate
    return <>{typeof render === 'function' ? render(propsRef.current ?? undefined) : render}</>
}

const defaultPortalContext = createPortalContext()

export const PortalProvider = defaultPortalContext.Provider

export function useImperativePortal(context = defaultPortalContext) {
    const open = useContext(context[CONTEXT_KEY])
    if (!open) {
        throw new Error('`useImperativePortal` must be used within PortalProvider')
    }
    return open
}
