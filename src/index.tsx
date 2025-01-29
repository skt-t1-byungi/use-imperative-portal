import { ReactNode, useSyncExternalStore } from 'react'

function createStore<State>(init: () => State) {
    let state: State
    const listeners = new Set<() => void>()
    return {
        subscribe(fn: () => void) {
            listeners.add(fn)
            return () => listeners.delete(fn)
        },
        update(next: State) {
            state = next
            for (const fn of listeners) fn()
        },
        getState() {
            return (state ??= init())
        },
    }
}

type Store<State> = ReturnType<typeof createStore<State>>

type EnforcedOptionalParamsFunction<F extends (...args: any[]) => any> = F extends () => any ? F : never

export interface Portal<UpdaterArgs extends any[] = [ReactNode]> {
    readonly isClosed: boolean
    update(...args: UpdaterArgs): void
    close(): void
}

type Renderer<Args extends any[] = []> = EnforcedOptionalParamsFunction<(...args: Args) => ReactNode>

export function createPortalContext() {
    let uid = 0
    const portalsMap = new Map<number, ReactNode>()
    const ctxStore = createStore<ReactNode[]>(() => [])

    return {
        openPortal<Node extends Renderer | ReactNode>(node: Node) {
            type UpdateArgs = Node extends Renderer<infer A> ? A : [ReactNode?]

            const id = uid++
            const renderer = typeof node === 'function' ? (node as Renderer<[]>) : (n = node as ReactNode) => n
            const portalStore = createStore<ReactNode>(renderer)

            portalsMap.set(id, <Portal key={id} store={portalStore} />)
            ctxStore.update([...portalsMap.values()])

            return {
                get isClosed() {
                    return !portalsMap.has(id)
                },
                update(...args: UpdateArgs) {
                    if (!portalsMap.has(id)) {
                        throw new Error('Portal is closed')
                    }
                    portalStore.update(renderer(...args))
                },
                close() {
                    if (portalsMap.has(id)) {
                        portalsMap.delete(id)
                        ctxStore.update([...portalsMap.values()])
                    }
                },
            }
        },
        Endpoint() {
            return useSyncExternalStore(ctxStore.subscribe, ctxStore.getState, ctxStore.getState)
        },
    }
}

function Portal({ store }: { store: Store<ReactNode> }) {
    return useSyncExternalStore(store.subscribe, store.getState, store.getState)
}

export const { openPortal, Endpoint: PortalEndpoint } = createPortalContext()
