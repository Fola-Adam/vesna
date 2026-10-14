/** Next's hosting adapter may expose an internal HTTP request URL behind HTTPS. */
export function memberRequestOrigin(request: Request): string | null {
  const value=request.headers.get('origin')
  if(!value) return null
  try {
    const origin=new URL(value)
    if(origin.origin!==value) return null
    if(origin.protocol==='https:' && /^(?:ves-na|deploy-preview-\d+--ves-na|[a-f0-9]{24}--ves-na)\.netlify\.app$/.test(origin.hostname) && !origin.port) return value
    if(process.env.NODE_ENV==='development' && origin.protocol==='http:' && ['localhost','127.0.0.1'].includes(origin.hostname) && origin.origin===new URL(request.url).origin) return value
  } catch {}
  return null
}
