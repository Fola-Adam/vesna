import 'server-only'
export async function sendMemberLink(email:string,url:string) {
  const key=process.env.BREVO_API_KEY;if(!key) throw new Error('Member email delivery is unavailable')
  const headers={'api-key':key,'Content-Type':'application/json'}
  let senderId=Number(process.env.BREVO_SENDER_ID)
  if(!Number.isSafeInteger(senderId) || senderId<=0) {
    const response=await fetch('https://api.brevo.com/v3/senders',{headers,signal:AbortSignal.timeout(8000)})
    if(!response.ok) throw new Error('Member sender is unavailable')
    const data=await response.json() as {senders?:{id:number;active:boolean}[]};const active=data.senders?.filter(sender=>sender.active) ?? []
    if(active.length!==1) throw new Error('A verified member email sender must be configured')
    senderId=active[0].id
  }
  const safeUrl=url.replaceAll('&','&amp;').replaceAll('"','&quot;')
  const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers,signal:AbortSignal.timeout(8000),body:JSON.stringify({sender:{id:senderId},to:[{email}],subject:'Your sign-in link to Vesna',tags:['vesna-member-signin'],textContent:`Your place in Vesna.\n\nContinue to join or sign in as a Vesnaian:\n${url}\n\nThis link can be used once. If it expires, request a fresh one. If you did not request this email, ignore it.`,htmlContent:`<html><body style="background:#f1eee5;color:#292820;font-family:Arial,sans-serif"><div style="max-width:520px;margin:40px auto;padding:36px;background:#faf8f1"><p style="color:#153e32;letter-spacing:5px">VESNA</p><h1 style="font-family:Georgia,serif;font-weight:400">Your place in Vesna.</h1><p style="line-height:1.8">Continue to join or sign in as a Vesnaian. Keep your considered picks in a private shortlist, wherever you return.</p><p><a href="${safeUrl}" style="display:inline-block;background:#153e32;color:#faf8f1;padding:16px 24px;text-decoration:none">Continue to Vesna</a></p><p style="font-size:12px;line-height:1.7">This link works once. If it expires, request another. If you did not request this email, ignore it. Joining does not subscribe you to the Dispatch.</p></div></body></html>`})})
  if(!response.ok) throw new Error('Member email delivery failed')
}
