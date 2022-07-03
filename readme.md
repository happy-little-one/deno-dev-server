# Simple frontend dev server

- 40 lines only
- support hmr, typescript, react


# mechanism

- Deno.watchFs for detect the file changes
- SSE for communication between frontend to backend, no nessary to use websocket
- Deno.emmit for compile typescript 
