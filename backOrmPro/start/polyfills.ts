// --- POLYFILL ROBUSTO PARA NODE 22 ---
// Debe ser la PRIMERA importación del proceso (ver server.ts)

import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'node:util'

// Crea "constructores" compatibles (siempre new-ables) que envuelven los de node:util
class TECompat {
  private _te = new NodeTextEncoder()
  encode(input?: string) { return this._te.encode(input ?? '') }
}
class TDCompat {
  private _td = new NodeTextDecoder()
  decode(input?: any, opts?: any) { return this._td.decode(input, opts) }
}

// Expón globales tipo Web (por si alguna lib usa globalThis.TextEncoder)
;(globalThis as any).TextEncoder ||= TECompat
;(globalThis as any).TextDecoder ||= TDCompat as any

// Crea objeto util global como esperan algunas libs que hacen this.util.TextEncoder
;(globalThis as any).util ||= {}
;(globalThis as any).util.TextEncoder = (globalThis as any).TextEncoder
;(globalThis as any).util.TextDecoder = (globalThis as any).TextDecoder

console.log('[polyfills] TextEncoder/Decoder polyfilled (constructor-like)')
