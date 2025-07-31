import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      prompt, 
      size = "1024x1024", 
      quality = "standard", 
      style = "natural",
      provider = "openai",
      n = 1 
    } = await req.json()

    if (!prompt) {
      throw new Error('Prompt is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    let response
    let imageData

    // Generate image based on provider
    switch (provider.toLowerCase()) {
      case 'openai':
        imageData = await generateWithOpenAI(prompt, size, quality, style, n)
        break
      case 'stabilityai':
        imageData = await generateWithStabilityAI(prompt, size)
        break
      case 'midjourney':
        imageData = await generateWithMidjourney(prompt, size)
        break
      default:
        throw new Error(`Unsupported image generation provider: ${provider}`)
    }

    // Upload generated images to Supabase Storage
    const uploadedImages = []
    for (const image of imageData.images) {
      if (image.url) {
        // Download image from URL
        const imageResponse = await fetch(image.url)
        const imageBlob = await imageResponse.blob()
        
        // Generate filename
        const filename = `generated/${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.png`
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('images')
          .upload(filename, imageBlob, {
            contentType: 'image/png',
            cacheControl: '3600'
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
          .from('images')
          .getPublicUrl(filename)

        uploadedImages.push({
          filename,
          url: publicUrl,
          original_url: image.url
        })

        // Log to file_upload table
        await supabaseClient.from('file_upload').insert({
          user_id: user.id,
          file_name: filename,
          file_url: publicUrl,
          file_type: 'image/png',
          bucket_name: 'images'
        })
      }
    }

    // Log image generation for analytics
    await supabaseClient.from('ai_usage_log').insert({
      user_id: user.id,
      model: provider,
      request_type: 'image_generation',
      prompt,
      result_count: uploadedImages.length,
      timestamp: new Date().toISOString()
    })

    return new Response(JSON.stringify({
      success: true,
      images: uploadedImages,
      provider,
      prompt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error generating image:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate image' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function generateWithOpenAI(prompt: string, size: string, quality: string, style: string, n: number) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) throw new Error('OpenAI API key not configured')

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      size,
      quality,
      style,
      n: Math.min(n, 1) // DALL-E 3 only supports n=1
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return {
    images: data.data.map((img: any) => ({ url: img.url, revised_prompt: img.revised_prompt }))
  }
}

async function generateWithStabilityAI(prompt: string, size: string) {
  const apiKey = Deno.env.get('STABILITY_API_KEY')
  if (!apiKey) throw new Error('Stability AI API key not configured')

  // Convert size format for Stability AI
  const [width, height] = size.split('x').map(Number)

  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      width,
      height,
      steps: 20,
      samples: 1
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Stability AI API error: ${error}`)
  }

  const data = await response.json()
  return {
    images: data.artifacts.map((artifact: any) => ({
      url: `data:image/png;base64,${artifact.base64}`
    }))
  }
}

async function generateWithMidjourney(prompt: string, size: string) {
  // Note: Midjourney doesn't have an official API
  // This is a placeholder for when/if they release one
  // You might use a third-party service or bot integration
  throw new Error('Midjourney API integration not implemented - no official API available')
}