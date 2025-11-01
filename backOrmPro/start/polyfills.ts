
import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'node:util'

const WebTE = (globalThis as any).TextEncoder as any
const WebTD = (globalThis as any).TextDecoder as any

const FinalTE: any = WebTE ?? NodeTextEncoder
const FinalTD: any = WebTD ?? (NodeTextDecoder as any)

const isClass = (fn: any) =>
  typeof fn === 'function' && /^\s*class\s+/.test(Function.prototype.toString.call(fn))

class TECompat {
  private _te = new FinalTE()
  encode(input?: string) { return this._te.encode(input ?? '') }
}
class TDCompat {
  private _td = new FinalTD()
  decode(input?: any, opts?: any) { return this._td.decode(input, opts) }
}

// Exponer constructores globales
;(globalThis as any).TextEncoder = isClass(FinalTE) ? FinalTE : (TECompat as any)
;(globalThis as any).TextDecoder = isClass(FinalTD) ? FinalTD : (TDCompat as any)

// Crear objeto `util` global como esperan algunas libs
;(globalThis as any).util = (globalThis as any).util || {}
;(globalThis as any).util.TextEncoder = (globalThis as any).TextEncoder
;(globalThis as any).util.TextDecoder = (globalThis as any).TextDecoder
