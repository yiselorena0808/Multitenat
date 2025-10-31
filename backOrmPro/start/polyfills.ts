// start/polyfills.ts
import { TextEncoder, TextDecoder } from 'node:util'

// Forzar polyfill para libs que esperan util.TextEncoder/Decoder o globales
;(globalThis as any).TextEncoder = TextEncoder
;(globalThis as any).TextDecoder = TextDecoder as any
