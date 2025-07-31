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
    const { to, subject, body, template, variables, provider = 'resend' } = await req.json()

    if (!to || !subject || (!body && !template)) {
      throw new Error('To, subject, and either body or template are required')
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

    let emailResponse
    let emailBody = body

    // If template is provided, load it and replace variables
    if (template) {
      const { data: templateData } = await supabaseClient
        .from('email_templates')
        .select('content, subject as template_subject')
        .eq('name', template)
        .single()

      if (templateData) {
        emailBody = templateData.content
        if (variables) {
          // Replace template variables
          Object.keys(variables).forEach(key => {
            emailBody = emailBody.replace(new RegExp(`{{${key}}}`, 'g'), variables[key])
          })
        }
      }
    }

    // Send email based on provider
    switch (provider.toLowerCase()) {
      case 'resend':
        emailResponse = await sendWithResend(to, subject, emailBody)
        break
      case 'sendgrid':
        emailResponse = await sendWithSendGrid(to, subject, emailBody)
        break
      case 'nodemailer':
        emailResponse = await sendWithNodemailer(to, subject, emailBody)
        break
      default:
        throw new Error(`Unsupported email provider: ${provider}`)
    }

    // Log email for audit trail
    await supabaseClient.from('email_log').insert({
      user_id: user.id,
      recipient: to,
      subject,
      provider,
      status: 'sent',
      sent_at: new Date().toISOString()
    })

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.id,
      provider 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to send email' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function sendWithResend(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) throw new Error('Resend API key not configured')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('FROM_EMAIL') || 'noreply@jastipdigital.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }

  return await response.json()
}

async function sendWithSendGrid(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('SENDGRID_API_KEY')
  if (!apiKey) throw new Error('SendGrid API key not configured')

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
        subject,
      }],
      from: { 
        email: Deno.env.get('FROM_EMAIL') || 'noreply@jastipdigital.com',
        name: 'JastipDigital'
      },
      content: [{
        type: 'text/html',
        value: html,
      }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid API error: ${error}`)
  }

  return { id: response.headers.get('x-message-id') || 'unknown' }
}

async function sendWithNodemailer(to: string, subject: string, html: string) {
  // For basic SMTP support
  const smtpHost = Deno.env.get('SMTP_HOST')
  const smtpUser = Deno.env.get('SMTP_USER')
  const smtpPass = Deno.env.get('SMTP_PASS')
  
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP configuration not complete')
  }

  // This is a simplified implementation
  // In production, you'd want to use a proper SMTP library
  throw new Error('Nodemailer/SMTP support not implemented in this Edge Function')
}