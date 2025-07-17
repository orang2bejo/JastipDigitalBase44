/**
 * Duitku Payment Gateway Service
 * Handles all interactions with Duitku API
 */

// MD5 Hash function - using Web Crypto API (fallback implementation)
async function md5(text) {
  try {
    // Try using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    // Fallback: Simple MD5 implementation for environments that don't support crypto.subtle.digest('MD5')
    console.warn('MD5 via crypto.subtle not available, using fallback');
    
    // Import crypto module for Deno
    const crypto = await import('node:crypto');
    return crypto.createHash('md5').update(text).digest('hex');
  }
}

/**
 * Create payment request to Duitku
 */
export async function createPaymentRequest(orderId, amount, productDetails) {
  const merchantCode = Deno.env.get('DUITKU_MERCHANT_CODE');
  const apiKey = Deno.env.get('DUITKU_API_KEY');
  const callbackUrl = Deno.env.get('DUITKU_CALLBACK_URL');
  const apiEndpoint = Deno.env.get('DUITKU_API_ENDPOINT');

  if (!merchantCode || !apiKey || !callbackUrl || !apiEndpoint) {
    throw new Error('Duitku configuration incomplete. Please check environment variables.');
  }

  // Create signature: MD5(merchantCode + orderId + amount + apiKey)
  const signatureString = `${merchantCode}${orderId}${amount}${apiKey}`;
  const signature = await md5(signatureString);

  console.log('🔐 Duitku signature created for order:', orderId);
  console.log('🔐 Signature string:', signatureString);

  const requestBody = {
    merchantCode: merchantCode,
    paymentAmount: amount,
    merchantOrderId: orderId,
    productDetails: productDetails,
    callbackUrl: callbackUrl,
    returnUrl: '', // Optional
    signature: signature,
    expiryPeriod: 60 // 60 minutes expiry
  };

  console.log('📤 Sending request to Duitku:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('📥 Duitku raw response:', responseText);

    if (!response.ok) {
      throw new Error(`Duitku API error: ${response.status} - ${responseText}`);
    }

    const duitkuResponse = JSON.parse(responseText);
    console.log('✅ Duitku response parsed:', JSON.stringify(duitkuResponse, null, 2));

    if (duitkuResponse.statusCode !== '00') {
      throw new Error(`Duitku error: ${duitkuResponse.statusMessage}`);
    }

    return {
      success: true,
      paymentUrl: duitkuResponse.paymentUrl,
      reference: duitkuResponse.reference,
      merchantOrderId: orderId,
      amount: amount
    };

  } catch (error) {
    console.error('❌ Duitku API error:', error.message);
    throw error;
  }
}

/**
 * Validate callback signature from Duitku
 */
export async function validateCallbackSignature(merchantCode, amount, merchantOrderId, receivedSignature) {
  const apiKey = Deno.env.get('DUITKU_API_KEY');
  
  if (!apiKey) {
    throw new Error('DUITKU_API_KEY not configured');
  }

  // Create expected signature: MD5(merchantCode + amount + merchantOrderId + apiKey)
  const signatureString = `${merchantCode}${amount}${merchantOrderId}${apiKey}`;
  const expectedSignature = await md5(signatureString);

  console.log('🔐 Callback signature validation:');
  console.log('🔐 Signature string:', signatureString);
  console.log('🔐 Expected:', expectedSignature);
  console.log('🔐 Received:', receivedSignature);

  return expectedSignature === receivedSignature;
}