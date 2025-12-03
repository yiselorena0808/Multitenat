/*
|--------------------------------------------------------------------------
| HTTP server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes
|
*/

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'
import { createServer } from 'node:http'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding characters
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER })

ignitor
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
      const mod = await import('#start/face_models_boot')
      await mod.default
    })

    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .httpServer()
  .start((handler) => {
    // Crear servidor HTTP
    const server = createServer(handler)
    
    // Inicializar WebSocket
    import('#start/routes/Socket').then(({ initializeWebsocket }) => {
      initializeWebsocket(server)
    }).catch(console.error)
    
    return server
  })
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })