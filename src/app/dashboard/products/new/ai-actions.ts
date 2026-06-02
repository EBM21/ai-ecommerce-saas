'use server'

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

export async function generateProductCopy(context: string, imageUrl?: string | null) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return { success: false, error: 'GOOGLE_GENERATIVE_AI_API_KEY is not configured.' }
  }

  try {
    let userPrompt: any = [
      { type: 'text', text: `Context about the product: ${context || 'No specific context provided.'}` }
    ]

    if (imageUrl) {
      userPrompt.push({
        type: 'text',
        text: 'Please also analyze the attached image of the product to extract visual details (colors, textures, style) and incorporate them into the description.'
      })
      userPrompt.push({
        type: 'image',
        image: new URL(imageUrl)
      })
    }

    const result = await generateObject({
      // ✅ Yahan purane 1.5 ko hata kar latest 2.5 Flash laga diya hai
      model: google('gemini-2.5-flash'),

      system: `You are a world-class e-commerce copywriter. Your goal is to write high-converting, SEO-optimized product titles and descriptions. 
        Tone: High-end, premium, and compelling.
        The description should be 2-3 short paragraphs highlighting the benefits, materials, and why the customer needs it.`,

      schema: z.object({
        title: z.string().describe('A catchy, SEO-friendly product title (max 60 chars)'),
        description: z.string().describe('A compelling product description formatted in clean text with paragraphs')
      }),

      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    return {
      success: true,
      data: result.object
    }

  } catch (error: any) {
    console.error('Failed to generate product copy:', error)
    return { success: false, error: error.message || 'Failed to generate copy.' }
  }
}