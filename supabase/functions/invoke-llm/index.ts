import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { model, messages, temperature = 0.7, max_tokens = 1000, stream = false } = await req.json()

    if (!model || !messages) {
      throw new Error('Model and messages are required')
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
    let apiKey
    let endpoint

    // Route to appropriate AI service based on model
    switch (model.toLowerCase()) {
      case 'gpt-3.5-turbo':
      case 'gpt-4':
      case 'gpt-4-turbo':
        apiKey = Deno.env.get('OPENAI_API_KEY')
        endpoint = 'https://api.openai.com/v1/chat/completions'
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
            stream
          }),
        })
        break

      case 'claude-3-sonnet':
      case 'claude-3-haiku':
        apiKey = Deno.env.get('ANTHROPIC_API_KEY')
        endpoint = 'https://api.anthropic.com/v1/messages'
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model,
            max_tokens,
            messages: messages.map((msg: any) => ({
              role: msg.role === 'system' ? 'user' : msg.role,
              content: msg.content
            }))
          }),
        })
        break

      case 'gemini-pro':
        apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages.map((msg: any) => ({
              parts: [{ text: msg.content }],
              role: msg.role === 'assistant' ? 'model' : 'user'
            })),
            generationConfig: {
              temperature,
              maxOutputTokens: max_tokens
            }
          }),
        })
        break

      default:
        throw new Error(`Unsupported model: ${model}`)
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Log usage for analytics
    await supabaseClient.from('ai_usage_log').insert({
      user_id: user.id,
      model,
      tokens_used: data.usage?.total_tokens || 0,
      request_type: 'chat_completion',
      timestamp: new Date().toISOString()
    })

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in invoke-llm function:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while processing your request' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})