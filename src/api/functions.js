import { supabase } from '@/lib/supabase'

// Payment Functions
export const createPaymentDuitku = async (paymentData) => {
  const { data, error } = await supabase.functions.invoke('create-payment-duitku', {
    body: paymentData
  })
  
  if (error) throw error
  return data
}

export const duitkuCallback = async (callbackData) => {
  const { data, error } = await supabase.functions.invoke('duitku-callback', {
    body: callbackData
  })
  
  if (error) throw error
  return data
}

// Dynamic Pricing
export const calculateDynamicPrice = async (pricingParams) => {
  const { data, error } = await supabase.rpc('calculate_final_price', pricingParams)
  if (error) throw error
  return data
}

// Driver Matching
export const findNearestDrivers = async (location, serviceType = 'delivery') => {
  const { data, error } = await supabase.rpc('find_nearest_drivers', {
    user_lat: location.latitude,
    user_lng: location.longitude,
    service_type: serviceType,
    radius_km: 10
  })
  
  if (error) throw error
  return data
}

// Order Management Functions
export const acceptOrder = async (orderId, driverId) => {
  const { data, error } = await supabase.rpc('accept_order', {
    order_id: orderId,
    driver_id: driverId
  })
  
  if (error) throw error
  return data
}

export const updateOrderStatus = async (orderId, status, updates = {}) => {
  const { data, error } = await supabase
    .from('Order')
    .update({ 
      status, 
      ...updates,
      updated_date: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Wallet Functions
export const getDriverWallet = async (driverId) => {
  const { data, error } = await supabase
    .from('provider_wallet')
    .select('*')
    .eq('provider_id', driverId)
    .eq('provider_type', 'driver')
    .single()
  
  if (error) throw error
  return data
}

export const createWithdrawalRequest = async (withdrawalData) => {
  const { data, error } = await supabase
    .from('withdrawal_request')
    .insert(withdrawalData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Analytics Functions
export const getDriverStats = async (driverId) => {
  const { data, error } = await supabase.rpc('get_driver_stats', {
    driver_id: driverId
  })
  
  if (error) throw error
  return data
}

export const getOrderAnalytics = async (dateRange = {}) => {
  const { data, error } = await supabase.rpc('get_order_analytics', dateRange)
  
  if (error) throw error
  return data
}

// Specialist Functions
export const createSpecialistQuote = async (quoteData) => {
  const { data, error } = await supabase
    .from('specialistorder')
    .update({
      quote_amount: quoteData.amount,
      quote_description: quoteData.description,
      status: 'quoted'
    })
    .eq('id', quoteData.orderId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const processRefundDonation = async (donationId) => {
  const { data, error } = await supabase.functions.invoke('process-refund-donation', {
    body: { donation_id: donationId }
  })
  
  if (error) throw error
  return data
}

export const allocateDonationToWinner = async (donationId, winnerId) => {
  const { data, error } = await supabase.functions.invoke('allocate-donation-winner', {
    body: { 
      donation_id: donationId,
      winner_id: winnerId
    }
  })
  
  if (error) throw error
  return data
}

export const detectMilestoneAchievement = async (driverId) => {
  const { data, error } = await supabase.rpc('check_milestone_and_grant_award', {
    driver_id: driverId
  })
  
  if (error) throw error
  return data
}