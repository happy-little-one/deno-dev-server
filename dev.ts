import { serve } from 'https://deno.land/std@0.132.0/http/server.ts'

const entry = './src/main.ts'
const compilerOptions = {}

async function handler(req: Request) {
  if (req.url.endsWith('/hmr'))
    return new Response(await genStream(), { headers: { 'Content-Type': 'text/event-stream' } })

  if (req.url.includes('.ts'))
    return new Response(await transpile(), { headers: { 'Content-Type': 'text/javascript' } })

  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        <div id="app"></div>
        <script>
          import('${entry}')
          const source = new EventSource('/hmr')
          source.onmessage = () => import('${entry}?t=' + new Date().getSeconds())
        </script>
      </body>
    </html>
  `,
    { headers: { 'Content-Type': 'text/html' } },
  )
}

serve(handler, { port: 8000 })

async function transpile() {
  const { files } = await Deno.emit(entry, { bundle: 'classic', compilerOptions })
  return files['deno:///bundle.js']
}

async function genStream() {
  const watcher = Deno.watchFs('./src')
  const msg = new TextEncoder().encode('data: \n\n')
  return new ReadableStream({
    async start(controller) {
      for await (const { kind } of watcher) {
        if (kind === 'modify') controller.enqueue(msg)
      }
    },
  })
}
