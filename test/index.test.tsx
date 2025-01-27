import { describe, expect, it, test } from 'vitest'
import { act, render } from '@testing-library/react'
import { Portal, PortalOpener, PortalProvider, useImperativePortal } from '../src/index'
import { Fragment, StrictMode } from 'react'

describe('open, close', () => {
    const t = renderTester()
    let portal: Portal

    it('open', () => {
        expect(t.queryByText('test')).toBeNull()
        act(() => {
            portal = t.hook.result('test')
        })
        expect(t.queryByText('test')).not.toBeNull()
    })

    it('close', () => {
        expect(portal.isClosed).toBe(false)
        act(() => {
            portal.close()
        })
        expect(portal.isClosed).toBe(true)
    })
})

test('update', () => {
    const t = renderTester()
    let portal: Portal<[string]>
    act(() => {
        portal = t.hook.result((str = 'hello') => str)
    })
    expect(t.queryByText(/^hello$/)).not.toBeNull()
    act(() => {
        portal.update('world')
    })
    expect(t.queryByText(/^world$/)).not.toBeNull()
})

test('multiple', () => {
    const t = renderTester({ strict: false })
    let p1: Portal<[string]>
    let p2: Portal<[string]>
    let p1Calls = 0 // for performance

    act(() => {
        p1 = t.hook.result((str = 'hello') => (++p1Calls, str))
        p2 = t.hook.result((str = 'world') => str)
    })
    expect(p1Calls).toBe(1)
    expect(t.queryByText(/^helloworld$/)).not.toBeNull()

    act(() => {
        p2.update('WORLD')
    })
    expect(p1Calls).toBe(1)
    expect(t.queryByText(/^helloWORLD$/)).not.toBeNull()

    act(() => {
        p1.update('My')
    })
    expect(p1Calls).toBe(2)
    expect(t.queryByText(/^MyWORLD$/)).not.toBeNull()
})

function renderTester({ strict = true }: { strict?: boolean } = {}) {
    let result: PortalOpener
    function Tester() {
        result = useImperativePortal()
        return null
    }
    const Wrapper = strict ? StrictMode : Fragment
    return Object.assign(
        render(
            <Wrapper>
                <PortalProvider>
                    <Tester />
                </PortalProvider>
            </Wrapper>
        ),
        {
            hook: {
                get result() {
                    return result
                },
            },
        }
    )
}
