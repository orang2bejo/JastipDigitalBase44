import { supabase } from '@/lib/supabase'

// User Management
export const User = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError && profileError.code !== 'PGRST116') throw profileError
      return { ...user, profile }
    }
    return null
  },

  async loginWithRedirect(redirectUrl) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })
    if (error) throw error
    return data
  },

  async login() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('User')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Order Management
export const Order = {
  async list(orderBy = '-created_date', limit = 10) {
    let query = supabase
      .from('Order')
      .select(`
        *,
        driver:driver_id(id, full_name, phone_number, vehicle_type),
        User:user_id(id, full_name, email)
      `)
    
    if (orderBy.startsWith('-')) {
      query = query.order(orderBy.substring(1), { ascending: false })
    } else {
      query = query.order(orderBy)
    }
    
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async get(id) {
    const { data, error } = await supabase
      .from('Order')
      .select(`
        *,
        driver:driver_id(id, full_name, phone_number, vehicle_type, current_location),
        User:user_id(id, full_name, email, phone_number),
        reviews:review!order_id(*),
        chats:chat!order_id(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(orderData) {
    const { data, error } = await supabase
      .from('Order')
      .insert(orderData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('Order')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserOrders(userId, status = null) {
    let query = supabase
      .from('Order')
      .select(`
        *,
        driver:driver_id(id, full_name, phone_number, vehicle_type)
      `)
      .eq('user_id', userId)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query.order('created_date', { ascending: false })
    if (error) throw error
    return data
  }
}

// Driver Management
export const Driver = {
  async list(limit = 50) {
    const { data, error } = await supabase
      .from('driver')
      .select('*')
      .limit(limit)
    
    if (error) throw error
    return data
  },

  async get(id) {
    const { data, error } = await supabase
      .from('driver')
      .select(`
        *,
        orders:Order!driver_id(*),
        reviews:review!driver_id(*),
        wallet:provider_wallet!provider_id(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(driverData) {
    const { data, error } = await supabase
      .from('driver')
      .insert(driverData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('driver')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getAvailable(location = null) {
    let query = supabase
      .from('driver')
      .select('*')
      .eq('availability_status', 'available')
      .eq('verification_status', 'verified')
    
    const { data, error } = await query
    if (error) throw error
    return data
  }
}

// Specialist Management
export const MitraSpecialist = {
  async list(serviceType = null) {
    let query = supabase
      .from('mitraspecialist')
      .select(`
        *,
        specializations:mitra_to_specialization!mitra_id(
          specialist_service_types!service_type_id(*)
        )
      `)
    
    if (serviceType) {
      query = query.eq('specializations.specialist_service_types.service_name', serviceType)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async get(id) {
    const { data, error } = await supabase
      .from('mitraspecialist')
      .select(`
        *,
        specializations:mitra_to_specialization!mitra_id(
          specialist_service_types!service_type_id(*)
        ),
        orders:specialistorder!mitra_id(*),
        reviews:mitrareview!mitra_id(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// Specialist Orders
export const SpecialistOrder = {
  async list(limit = 20) {
    const { data, error } = await supabase
      .from('specialistorder')
      .select(`
        *,
        mitra:mitra_id(id, business_name, rating),
        User:user_id(id, full_name, email),
        service_type:specialist_service_types!service_type_id(*)
      `)
      .limit(limit)
      .order('created_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(orderData) {
    const { data, error } = await supabase
      .from('specialistorder')
      .insert(orderData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Transaction Management
export const Transaction = {
  async list(userId = null, limit = 50) {
    let query = supabase
      .from('transaction')
      .select(`
        *,
        order:order_id(*),
        specialist_order:specialist_order_id(*)
      `)
    
    if (userId) {
      query = query.or(`payer_id.eq.${userId},recipient_id.eq.${userId}`)
    }
    
    const { data, error } = await query
      .limit(limit)
      .order('transaction_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(transactionData) {
    const { data, error } = await supabase
      .from('transaction')
      .insert(transactionData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Chat Management
export const Chat = {
  async getMessages(orderId) {
    const { data, error } = await supabase
      .from('chat')
      .select('*')
      .eq('order_id', orderId)
      .order('timestamp', { ascending: true })
    
    if (error) throw error
    return data
  },

  async sendMessage(messageData) {
    const { data, error } = await supabase
      .from('chat')
      .insert(messageData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Reviews
export const Review = {
  async create(reviewData) {
    const { data, error } = await supabase
      .from('review')
      .insert(reviewData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByOrder(orderId) {
    const { data, error } = await supabase
      .from('review')
      .select('*')
      .eq('order_id', orderId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Notifications
export const Notification = {
  async getUserNotifications(userId) {
    const { data, error } = await supabase
      .from('notification')
      .select('*')
      .eq('user_id', userId)
      .order('created_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async markAsRead(notificationId) {
    const { data, error } = await supabase
      .from('notification')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Geographic Data
export const IndonesiaRegion = {
  async getProvinces() {
    const { data, error } = await supabase
      .from('indonesia_region')
      .select('province')
      .not('province', 'is', null)
      .order('province')
    
    if (error) throw error
    return [...new Set(data.map(item => item.province))]
  },

  async getCities(province) {
    const { data, error } = await supabase
      .from('indonesia_region')
      .select('regency')
      .eq('province', province)
      .not('regency', 'is', null)
      .order('regency')
    
    if (error) throw error
    return [...new Set(data.map(item => item.regency))]
  }
}

// Donation Management
export const Donation = {
  async list(limit = 20) {
    const { data, error } = await supabase
      .from('donation')
      .select(`
        *,
        donor:User!donor_id(id, full_name),
        winner:User!winner_id(id, full_name)
      `)
      .limit(limit)
      .order('created_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(donationData) {
    const { data, error } = await supabase
      .from('donation')
      .insert(donationData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('donation')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Pricing Rules
export const PricingRule = {
  async list() {
    const { data, error } = await supabase
      .from('pricing_rule')
      .select('*')
      .order('priority', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getActiveRules() {
    const { data, error } = await supabase
      .from('pricing_rule')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true })
    
    if (error) throw error
    return data
  }
}

// Support Tickets
export const SupportTicket = {
  async list(limit = 50) {
    const { data, error } = await supabase
      .from('support_ticket')
      .select(`
        *,
        User:user_id(id, full_name, email)
      `)
      .limit(limit)
      .order('created_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(ticketData) {
    const { data, error } = await supabase
      .from('support_ticket')
      .insert(ticketData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('support_ticket')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Delivery Zones
export const DeliveryZone = {
  async list() {
    const { data, error } = await supabase
      .from('delivery_zone')
      .select('*')
      .order('zone_name')
    
    if (error) throw error
    return data
  },

  async create(zoneData) {
    const { data, error } = await supabase
      .from('delivery_zone')
      .insert(zoneData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async checkCoverage(latitude, longitude) {
    const { data, error } = await supabase.rpc('check_delivery_coverage', {
      lat: latitude,
      lng: longitude
    })
    
    if (error) throw error
    return data
  }
}

// Company Profile
export const CompanyProfile = {
  async list() {
    const { data, error } = await supabase
      .from('company_profile')
      .select('*')
    
    if (error) throw error
    return data
  },

  async get(id) {
    const { data, error } = await supabase
      .from('company_profile')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('company_profile')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Driver Wallet
export const DriverWallet = {
  async filter(filters) {
    let query = supabase
      .from('driver_wallet')
      .select('*')
    
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async get(id) {
    const { data, error } = await supabase
      .from('driver_wallet')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateBalance(id, amount, operation = 'add') {
    const { data, error } = await supabase.rpc('update_wallet_balance', {
      wallet_id: id,
      amount: amount,
      operation: operation
    })
    
    if (error) throw error
    return data
  }
}

// Withdrawal Requests
export const WithdrawalRequest = {
  async create(requestData) {
    const { data, error } = await supabase
      .from('withdrawal_request')
      .insert(requestData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async list(filters = {}) {
    let query = supabase
      .from('withdrawal_request')
      .select(`
        *,
        driver:driver_id(id, full_name, phone_number)
      `)
    
    if (filters.driver_id) {
      query = query.eq('driver_id', filters.driver_id)
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    const { data, error } = await query.order('created_date', { ascending: false })
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('withdrawal_request')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}