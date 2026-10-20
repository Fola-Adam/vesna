import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const testEnv = { ...process.env }
for (const name of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'GROQ_API_KEY', 'BREVO_API_KEY']) delete testEnv[name]
const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', '--port', '3102', '--hostname', '127.0.0.1'], { stdio: 'inherit', env: testEnv })
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.kill(signal))
server.on('exit', (code) => process.exit(code ?? 1))
