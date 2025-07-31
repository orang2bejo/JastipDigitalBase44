import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtime(table, filter = null, callback = null) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const setupRealtime = async () => {
      try {
        // Initial data fetch
        let query = supabase.from(table).select('*')
        
        if (filter) {
          Object.keys(filter).forEach(key => {
            query = query.eq(key, filter[key])
          })
        }

        const { data: initialData, error: fetchError } = await query
        
        if (fetchError) throw fetchError
        
        if (isMounted) {
          setData(initialData || [])
          setLoading(false)
        }

        // Set up real-time subscription
        const channel = supabase
          .channel(`realtime:${table}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              filter: filter ? Object.keys(filter).map(key => `${key}=eq.${filter[key]}`).join(',') : undefined
            },
            (payload) => {
              if (!isMounted) return

              const { eventType, new: newRecord, old: oldRecord } = payload

              setData(currentData => {
                let updatedData = [...currentData]

                switch (eventType) {
                  case 'INSERT':
                    updatedData.push(newRecord)
                    break
                  case 'UPDATE':
                    updatedData = updatedData.map(item =>
                      item.id === newRecord.id ? newRecord : item
                    )
                    break
                  case 'DELETE':
                    updatedData = updatedData.filter(item => item.id !== oldRecord.id)
                    break
                }

                // Call callback if provided
                if (callback) {
                  callback(eventType, newRecord || oldRecord, updatedData)
                }

                return updatedData
              })
            }
          )
          .subscribe()

        channelRef.current = channel

      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    setupRealtime()

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [table, JSON.stringify(filter)])

  return { data, loading, error, setData }
}

export function useRealtimeOrder(orderId) {
  return useRealtime('Order', { id: orderId })
}

export function useRealtimeChat(orderId, onNewMessage = null) {
  return useRealtime(
    'chat',
    { order_id: orderId },
    (eventType, record, allMessages) => {
      if (eventType === 'INSERT' && onNewMessage) {
        onNewMessage(record, allMessages)
      }
    }
  )
}

export function useRealtimeDriverLocation(driverId) {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!driverId) return

    let isMounted = true

    const setupLocationTracking = async () => {
      try {
        // Get initial location
        const { data: driver, error } = await supabase
          .from('driver')
          .select('current_location')
          .eq('id', driverId)
          .single()

        if (error) throw error

        if (isMounted) {
          setLocation(driver?.current_location)
          setLoading(false)
        }

        // Set up real-time location updates
        const channel = supabase
          .channel(`driver-location:${driverId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'driver',
              filter: `id=eq.${driverId}`
            },
            (payload) => {
              if (!isMounted) return
              setLocation(payload.new.current_location)
            }
          )
          .subscribe()

        channelRef.current = channel

      } catch (err) {
        if (isMounted) {
          setLoading(false)
          console.error('Error setting up location tracking:', err)
        }
      }
    }

    setupLocationTracking()

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [driverId])

  return { location, loading }
}

export function useRealtimeNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!userId) return

    let isMounted = true

    const setupNotifications = async () => {
      try {
        // Get initial notifications
        const { data: initialNotifications, error } = await supabase
          .from('notification')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        if (isMounted) {
          setNotifications(initialNotifications || [])
          setUnreadCount((initialNotifications || []).filter(n => !n.is_read).length)
        }

        // Set up real-time subscription
        const channel = supabase
          .channel(`notifications:${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notification',
              filter: `user_id=eq.${userId}`
            },
            (payload) => {
              if (!isMounted) return

              const { eventType, new: newRecord, old: oldRecord } = payload

              setNotifications(current => {
                let updated = [...current]

                switch (eventType) {
                  case 'INSERT':
                    updated.unshift(newRecord)
                    // Keep only latest 50 notifications
                    updated = updated.slice(0, 50)
                    break
                  case 'UPDATE':
                    updated = updated.map(item =>
                      item.id === newRecord.id ? newRecord : item
                    )
                    break
                  case 'DELETE':
                    updated = updated.filter(item => item.id !== oldRecord.id)
                    break
                }

                return updated
              })

              // Update unread count
              if (eventType === 'INSERT' && !newRecord.is_read) {
                setUnreadCount(count => count + 1)
              } else if (eventType === 'UPDATE' && newRecord.is_read && !oldRecord.is_read) {
                setUnreadCount(count => Math.max(0, count - 1))
              }
            }
          )
          .subscribe()

        channelRef.current = channel

      } catch (err) {
        console.error('Error setting up notifications:', err)
      }
    }

    setupNotifications()

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [userId])

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notification')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notification')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  }
}

// Hook for presence (who's online)
export function useRealtimePresence(room, userInfo) {
  const [presenceState, setPresenceState] = useState({})
  const [onlineUsers, setOnlineUsers] = useState([])
  const channelRef = useRef(null)

  useEffect(() => {
    if (!room || !userInfo) return

    const channel = supabase.channel(room, {
      config: {
        presence: {
          key: userInfo.id,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        setPresenceState(newState)
        
        const users = Object.keys(newState).map(key => {
          const presences = newState[key]
          return presences[0] // Get first presence for each user
        })
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userInfo)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [room, userInfo?.id])

  return { onlineUsers, presenceState }
}