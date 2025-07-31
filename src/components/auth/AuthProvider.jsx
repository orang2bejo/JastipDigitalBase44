import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/api/entities'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUser) => {
    try {
      setUser(authUser)
      
      // Load or create user profile
      const { data: existingProfile, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
          profile_image_url: authUser.user_metadata?.avatar_url || null,
          role: 'customer'
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('User')
          .insert(newProfile)
          .select()
          .single()

        if (createError) throw createError
        setProfile(createdProfile)
      } else if (error) {
        throw error
      } else {
        setProfile(existingProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async (redirectUrl = null) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl || `${window.location.origin}/dashboard`
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in with email:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in')

    try {
      const { data, error } = await supabase
        .from('User')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      
      setProfile(data)
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating password:', error)
      throw error
    }
  }

  // Role-based access helpers
  const hasRole = (requiredRole) => {
    if (!profile) return false
    
    const roleHierarchy = {
      'customer': 0,
      'driver': 1,
      'mitra': 1,
      'admin': 2
    }
    
    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole]
  }

  const isDriver = () => profile?.role === 'driver'
  const isMitra = () => profile?.role === 'mitra'
  const isAdmin = () => profile?.role === 'admin'
  const isCustomer = () => profile?.role === 'customer'

  const value = {
    user,
    profile,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    hasRole,
    isDriver,
    isMitra,
    isAdmin,
    isCustomer
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protecting routes
export function withAuth(Component, requiredRole = null) {
  return function AuthenticatedComponent(props) {
    const { user, profile, loading, hasRole } = useAuth()

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center mb-4">Authentication Required</h2>
            <p className="text-gray-600 text-center mb-6">
              Please sign in to access this page.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center mb-4">Access Denied</h2>
            <p className="text-gray-600 text-center mb-6">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}