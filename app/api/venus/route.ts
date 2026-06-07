import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { message, history = [] } = await request.json()

  if (!message) {
    return NextResponse.json(
      { error: 'Message is required' },
      { status: 400 }
    )
  }

  // Lazy-load Groq so build doesn't fail without env vars
  const { Groq } = await import('groq-sdk')
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
  })

  const systemPrompt = `You are Venus, the AI assistant for Vesna - a curated lifestyle platform by Ebenezer Victory. 

Your personality:
- Warm, knowledgeable, and slightly poetic
- You appreciate craftsmanship, design, and thoughtful curation
- You speak with the voice of someone who understands quality

About Vesna:
- Vesna curates exceptional products across tech, audio, lifestyle, workspace, and travel
- Each item is personally vetted by Ebenezer Victory
- The platform emphasizes objects with purpose and stories worth telling
- Current sections: Curated (Victory picks), Shop (full catalog), Archive (rare finds)

Guidelines:
- Keep responses concise (2-3 sentences for simple questions)
- Be helpful about products, navigation, and the curation philosophy
- Don't make up specific product details - direct users to browse
- If asked about purchasing, explain that Vesna uses affiliate links
- For "Why Vesna?" questions, emphasize personal curation and quality over algorithms

Current date: ${new Date().toISOString().split('T')[0]}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history ?? []).map((h: { role: string; content: string }) => ({
      role: h.role as string,
      content: h.content,
    })),
    { role: 'user', content: message },
  ]

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'AI service is not configured' },
      { status: 503 }
    )
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 500,
      messages,
    })

    const content = completion.choices[0]?.message?.content
    if (content) {
      return NextResponse.json({
        response: content,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: 'Unexpected response format' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Venus AI Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}