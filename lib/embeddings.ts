type PipelineFunction = (
  text: string,
  options: { pooling: string; normalize: boolean }
) => Promise<{ data: Float32Array }>

let extractor: PipelineFunction | null = null

async function getPipeline(): Promise<PipelineFunction> {
  if (!extractor) {
    const mod = await import('@xenova/transformers')
    const pipeline = await mod.pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    )
    extractor = pipeline as PipelineFunction
  }
  return extractor
}

export async function getEmbedding(text: string): Promise<number[]> {
  const fn = await getPipeline()
  const result = await fn(text, { pooling: 'mean', normalize: true })
  return Array.from(result.data) as number[]
}

export function embedTextForProduct(
  name: string,
  description: string | null,
  whyVictory: string | null,
  categoryName: string | null,
): string {
  return [name, description, whyVictory, categoryName].filter(Boolean).join('. ')
}
