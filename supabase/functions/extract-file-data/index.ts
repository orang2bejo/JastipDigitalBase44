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
    const { fileUrl, extractionType = 'text', options = {} } = await req.json()

    if (!fileUrl) {
      throw new Error('File URL is required')
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

    // Download file
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error('Failed to download file')
    }

    const contentType = fileResponse.headers.get('content-type') || ''
    const fileBuffer = await fileResponse.arrayBuffer()
    
    let extractedData

    // Extract data based on type and file format
    switch (extractionType.toLowerCase()) {
      case 'text':
        extractedData = await extractText(fileBuffer, contentType, options)
        break
      case 'ocr':
        extractedData = await extractTextWithOCR(fileBuffer, contentType, options)
        break
      case 'metadata':
        extractedData = await extractMetadata(fileBuffer, contentType, options)
        break
      case 'tables':
        extractedData = await extractTables(fileBuffer, contentType, options)
        break
      case 'image_analysis':
        extractedData = await analyzeImage(fileBuffer, contentType, options)
        break
      default:
        throw new Error(`Unsupported extraction type: ${extractionType}`)
    }

    // Log extraction for audit trail
    await supabaseClient.from('file_extraction_log').insert({
      user_id: user.id,
      file_url: fileUrl,
      extraction_type: extractionType,
      content_type: contentType,
      result_size: JSON.stringify(extractedData).length,
      extracted_at: new Date().toISOString()
    })

    return new Response(JSON.stringify({
      success: true,
      data: extractedData,
      extraction_type: extractionType,
      content_type: contentType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error extracting file data:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to extract file data' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function extractText(buffer: ArrayBuffer, contentType: string, options: any) {
  if (contentType.includes('text/')) {
    // Plain text file
    const decoder = new TextDecoder(options.encoding || 'utf-8')
    return {
      text: decoder.decode(buffer),
      format: 'plain_text'
    }
  } else if (contentType.includes('application/pdf')) {
    // For PDF extraction, you'd typically use a library like pdf-parse
    // This is a simplified placeholder
    throw new Error('PDF text extraction requires additional libraries')
  } else if (contentType.includes('application/json')) {
    const decoder = new TextDecoder()
    const text = decoder.decode(buffer)
    return {
      text,
      json: JSON.parse(text),
      format: 'json'
    }
  } else {
    throw new Error(`Unsupported content type for text extraction: ${contentType}`)
  }
}

async function extractTextWithOCR(buffer: ArrayBuffer, contentType: string, options: any) {
  if (!contentType.startsWith('image/')) {
    throw new Error('OCR is only supported for image files')
  }

  // Convert to base64 for API calls
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
  
  // Use Google Vision API for OCR
  const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
  if (!apiKey) {
    throw new Error('Google Vision API key not configured')
  }

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        image: {
          content: base64
        },
        features: [{
          type: 'TEXT_DETECTION',
          maxResults: 10
        }]
      }]
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google Vision API error: ${error}`)
  }

  const data = await response.json()
  const textAnnotations = data.responses[0]?.textAnnotations || []
  
  return {
    full_text: textAnnotations[0]?.description || '',
    text_blocks: textAnnotations.slice(1).map((annotation: any) => ({
      text: annotation.description,
      confidence: annotation.confidence,
      bounding_box: annotation.boundingPoly
    })),
    format: 'ocr_result'
  }
}

async function extractMetadata(buffer: ArrayBuffer, contentType: string, options: any) {
  // Basic metadata extraction
  const metadata = {
    content_type: contentType,
    size: buffer.byteLength,
    format: contentType.split('/')[1] || 'unknown'
  }

  if (contentType.startsWith('image/')) {
    // For images, you could extract EXIF data
    // This would require additional libraries like exif-js
    metadata.type = 'image'
  } else if (contentType.includes('pdf')) {
    metadata.type = 'document'
  } else if (contentType.startsWith('text/')) {
    metadata.type = 'text'
    const decoder = new TextDecoder()
    const text = decoder.decode(buffer)
    metadata.character_count = text.length
    metadata.line_count = text.split('\n').length
  }

  return metadata
}

async function extractTables(buffer: ArrayBuffer, contentType: string, options: any) {
  if (contentType.includes('text/csv')) {
    const decoder = new TextDecoder()
    const text = decoder.decode(buffer)
    const lines = text.split('\n')
    const headers = lines[0]?.split(',') || []
    const rows = lines.slice(1).map(line => {
      const values = line.split(',')
      return headers.reduce((obj: any, header, index) => {
        obj[header.trim()] = values[index]?.trim() || ''
        return obj
      }, {})
    })

    return {
      format: 'csv',
      headers,
      rows,
      row_count: rows.length
    }
  } else {
    throw new Error(`Table extraction not supported for content type: ${contentType}`)
  }
}

async function analyzeImage(buffer: ArrayBuffer, contentType: string, options: any) {
  if (!contentType.startsWith('image/')) {
    throw new Error('Image analysis is only supported for image files')
  }

  // Convert to base64 for API calls
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

  // Use OpenAI Vision API for image analysis
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: options.prompt || "Describe this image in detail. What objects, people, text, and activities can you see?"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${contentType};base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: options.max_tokens || 500
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI Vision API error: ${error}`)
  }

  const data = await response.json()
  
  return {
    description: data.choices[0]?.message?.content || '',
    format: 'image_analysis',
    model: 'gpt-4-vision-preview'
  }
}