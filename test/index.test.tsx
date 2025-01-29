import { afterEach, describe, expect, expectTypeOf, it, test, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { openPortal, Portal, PortalEndpoint } from '../src/index'
import { StrictMode } from 'react'

afterEach(cleanup)

describe('open, close', () => {
    let portal: Portal
    it('open', async () => {
        const result = render(
            <StrictMode>
                <PortalEndpoint />
            </StrictMode>
        )
        expect(result.queryByText('test')).toBeNull()
        portal = await act(() => openPortal('test'))
        expect(result.queryByText('test')).not.toBeNull()
    })

    it('close', () => {
        expect(portal.isClosed).toBe(false)
        act(() => portal.close())
        expect(portal.isClosed).toBe(true)
    })
})

describe('update', async () => {
    it('function renderer', async () => {
        const result = render(
            <StrictMode>
                <PortalEndpoint />
            </StrictMode>
        )
        expect(result.queryByText('hello')).toBeNull()

        const portal = await act(() => openPortal((str = 'hello') => str))
        expect(result.queryByText(/^hello$/)).not.toBeNull()

        act(() => portal.update('world'))
        expect(result.queryByText(/^world$/)).not.toBeNull()

        // for cleanup
        portal.close()
    })

    it('react node renderer', async () => {
        const result = render(
            <StrictMode>
                <PortalEndpoint />
            </StrictMode>
        )
        expect(result.queryByText('hello')).toBeNull()

        const portal = await act(() => openPortal(<div>hello</div>))
        expect(result.queryByText(/^hello$/)).not.toBeNull()

        act(() => portal.update(<div>world</div>))
        expect(result.queryByText(/^world$/)).not.toBeNull()

        // for cleanup
        portal.close()
    })
})

test('multiple', async () => {
    const result = render(<PortalEndpoint />)
    const renderer1 = vi.fn().mockImplementation((str = 'hello') => str)
    const renderer2 = vi.fn().mockImplementation((str = 'world') => str)

    const portal1 = await act(() => openPortal(renderer1))
    const portal2 = await act(() => openPortal(renderer2))

    expect(renderer1).toHaveBeenCalledTimes(1)
    expect(renderer2).toHaveBeenCalledTimes(1)
    expect(result.queryByText(/^helloworld$/)).not.toBeNull()

    act(() => portal2.update('WORLD'))
    expect(renderer1).toHaveBeenCalledTimes(1)
    expect(renderer2).toHaveBeenCalledTimes(2)
    expect(result.queryByText(/^helloWORLD$/)).not.toBeNull()

    act(() => portal1.update('MY'))
    expect(renderer1).toHaveBeenCalledTimes(2)
    expect(renderer2).toHaveBeenCalledTimes(2)
    expect(result.queryByText(/^MYWORLD$/)).not.toBeNull()

    // for cleanup
    portal1.close()
    portal2.close()
})

test.skip('type check', () => {
    const p1 = openPortal((str = 'hello') => str)
    expectTypeOf(p1.update).toEqualTypeOf<(str?: string) => void>()
    const p2 = openPortal(({ title = 'hello' } = {}) => title)
    expectTypeOf(p2.update).toEqualTypeOf<(p?: { title?: string }) => void>()

    // parameter is not optional
    // @ts-expect-error
    openPortal((str: string) => str)
})

test('function renderer should be able to use portal object', () => {
    render(<PortalEndpoint />)
    expect(() => {
        const portal = openPortal(() => <div onClick={portal.close} />)
        // cleanup
        portal.close()
    }).not.toThrow()
})
