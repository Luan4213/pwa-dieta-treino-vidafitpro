'use client'

import { useState, useEffect } from 'react'
import { Play, Target, Calendar, TrendingUp, Book, Settings, User, Home, Dumbbell, Apple, BarChart3, ChevronRight, Plus, Timer, Droplets, Flame, Activity, Award, Clock, CheckCircle2, Circle, Bell, X, CreditCard, Copy, Check, Lock, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

// Types
type UserData = {
  id: string
  name: string
  email: string
  goal?: string
  level?: string
  days_per_week?: number
  session_time?: number
  equipment?: string[]
  weight?: number
  target_weight?: number
  streak: number
}

type WorkoutData = {
  name: string
  exercises: ExerciseData[]
}

type ExerciseData = {
  id?: string
  name: string
  sets: number
  reps: string
  weight: number
  rest: number
  completed: boolean
  rpe: number
}

type MealData = {
  id?: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  completed: boolean
}

// Horários padrão para lembretes de água
const defaultWaterReminders = [
  { hour: 8, minute: 0, label: 'Manhã' },
  { hour: 10, minute: 0, label: 'Meio da Manhã' },
  { hour: 12, minute: 0, label: 'Almoço' },
  { hour: 14, minute: 0, label: 'Tarde' },
  { hour: 16, minute: 0, label: 'Lanche' },
  { hour: 18, minute: 0, label: 'Final da Tarde' },
  { hour: 20, minute: 0, label: 'Noite' },
  { hour: 22, minute: 0, label: 'Antes de Dormir' }
]

export default function FitApp() {
  const [currentScreen, setCurrentScreen] = useState('auth')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Workout state
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    name: 'Peito e Tríceps',
    exercises: []
  })
  
  // Meals state
  const [meals, setMeals] = useState<MealData[]>([])
  
  // Subscription states
  const [hasSubscription, setHasSubscription] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [showPixCode, setShowPixCode] = useState(false)
  
  // Water reminder states
  const [waterRemindersEnabled, setWaterRemindersEnabled] = useState(false)
  const [waterReminders, setWaterReminders] = useState(defaultWaterReminders)
  const [showWaterNotification, setShowWaterNotification] = useState(false)
  const [lastWaterReminder, setLastWaterReminder] = useState<string | null>(null)
  const [waterConsumed, setWaterConsumed] = useState(0)
  const [waterTarget, setWaterTarget] = useState(8)

  // Onboarding state
  const [onboardingData, setOnboardingData] = useState({
    goal: '',
    level: '',
    daysPerWeek: 0,
    sessionTime: 0,
    equipment: [] as string[],
    preferences: [] as string[]
  })

  // Calories and macros state
  const [caloriesConsumed, setCaloriesConsumed] = useState(0)
  const [caloriesTarget, setCaloriesTarget] = useState(2200)
  const [macros, setMacros] = useState({
    protein: { consumed: 0, target: 165 },
    carbs: { consumed: 0, target: 275 },
    fat: { consumed: 0, target: 85 }
  })

  // Check auth state on mount
  useEffect(() => {
    checkUser()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await loadUserData(session.user.id, session.user.email || '')
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserData(null)
        setCurrentScreen('auth')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        setCurrentScreen('auth')
        setLoading(false)
        return
      }
      
      setUser(user)
      await loadUserData(user.id, user.email || '')
      setLoading(false)
    } catch (error) {
      console.error('Error checking user:', error)
      setCurrentScreen('auth')
      setLoading(false)
    }
  }

  const loadUserData = async (userId: string, userEmail: string) => {
    try {
      // Load user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error loading profile:', profileError)
        // Se não conseguir carregar perfil, vai para onboarding
        setCurrentScreen('onboarding')
        setIsFirstTime(true)
        return
      }

      // Load additional user data from users table
      const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error loading user details:', userError)
      }

      // Merge profile and user data
      const mergedData = {
        id: userId,
        name: profile.name || '',
        email: userEmail,
        goal: userDetails?.goal,
        level: userDetails?.level,
        days_per_week: userDetails?.days_per_week,
        session_time: userDetails?.session_time,
        equipment: userDetails?.equipment,
        weight: userDetails?.weight,
        target_weight: userDetails?.target_weight,
        streak: userDetails?.streak || 0
      }

      setUserData(mergedData)

      // Check if user has completed onboarding
      if (!mergedData.goal || !mergedData.level) {
        setCurrentScreen('onboarding')
        setIsFirstTime(true)
        return
      }

      // Check subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (subError && subError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (não tem assinatura)
        console.error('Error checking subscription:', subError)
      }

      if (subscription) {
        setHasSubscription(true)
        setCurrentScreen('dashboard')
        await loadDashboardData(userId)
      } else {
        setCurrentScreen('subscription')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // Em caso de erro, vai para tela de assinatura
      setCurrentScreen('subscription')
    }
  }

  const loadDashboardData = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Load water intake
      const { data: waterData } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      if (waterData) {
        setWaterConsumed(waterData.glasses)
        setWaterTarget(waterData.target)
      }

      // Load meals
      const { data: mealsData } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .order('created_at', { ascending: true })

      if (mealsData) {
        setMeals(mealsData)
        
        // Calculate totals
        const totals = mealsData.reduce((acc, meal) => ({
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fat: acc.fat + meal.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

        setCaloriesConsumed(totals.calories)
        setMacros({
          protein: { consumed: totals.protein, target: 165 },
          carbs: { consumed: totals.carbs, target: 275 },
          fat: { consumed: totals.fat, target: 85 }
        })
      }

      // Load today's workout
      const { data: workoutData } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises (*)
        `)
        .eq('user_id', userId)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (workoutData && workoutData.exercises) {
        setWorkoutData({
          name: workoutData.name,
          exercises: workoutData.exercises.sort((a: any, b: any) => a.order_index - b.order_index)
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleAuthSuccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      await loadUserData(user.id, user.email || '')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentScreen('auth')
  }

  // Water reminder checker
  useEffect(() => {
    if (!waterRemindersEnabled || !user) return

    const checkWaterReminder = () => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTimeKey = `${currentHour}:${currentMinute}`

      const shouldRemind = waterReminders.some(reminder => 
        reminder.hour === currentHour && reminder.minute === currentMinute
      )

      if (shouldRemind && lastWaterReminder !== currentTimeKey) {
        setShowWaterNotification(true)
        setLastWaterReminder(currentTimeKey)
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('💧 Hora de Beber Água!', {
            body: `Você já bebeu ${waterConsumed} de ${waterTarget} copos hoje. Mantenha-se hidratado!`,
            icon: '/icon-192.png',
            badge: '/icon-192.png'
          })
        }
      }
    }

    const interval = setInterval(checkWaterReminder, 60000)
    checkWaterReminder()

    return () => clearInterval(interval)
  }, [waterRemindersEnabled, waterReminders, lastWaterReminder, waterConsumed, waterTarget, user])

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const toggleWaterReminders = () => {
    const newState = !waterRemindersEnabled
    setWaterRemindersEnabled(newState)
    localStorage.setItem('water-reminders-enabled', String(newState))
    
    if (newState) {
      requestNotificationPermission()
    }
  }

  const addWaterGlass = async () => {
    if (!user) return

    const newAmount = Math.min(waterConsumed + 1, waterTarget)
    setWaterConsumed(newAmount)

    const today = new Date().toISOString().split('T')[0]

    try {
      const { error } = await supabase
        .from('water_intake')
        .upsert({
          user_id: user.id,
          glasses: newAmount,
          target: waterTarget,
          date: today
        }, {
          onConflict: 'user_id,date'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating water intake:', error)
    }
  }

  const dismissWaterNotification = () => {
    setShowWaterNotification(false)
  }

  const drinkWaterFromNotification = () => {
    addWaterGlass()
    setShowWaterNotification(false)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => prev - 1)
      }, 1000)
    } else if (restTimer === 0) {
      setIsResting(false)
    }
    return () => clearInterval(interval)
  }, [isResting, restTimer])

  const completeOnboarding = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('users')
        .update({
          goal: onboardingData.goal,
          level: onboardingData.level,
          days_per_week: onboardingData.daysPerWeek,
          session_time: onboardingData.sessionTime,
          equipment: onboardingData.equipment
        })
        .eq('id', user.id)

      if (error) throw error

      setIsFirstTime(false)
      await loadUserData(user.id, user.email || '')
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  const activateSubscription = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          status: 'active',
          payment_method: paymentMethod,
          amount: 25.99
        })

      if (error) throw error

      setHasSubscription(true)
      setCurrentScreen('dashboard')
      await loadDashboardData(user.id)
    } catch (error) {
      console.error('Error activating subscription:', error)
    }
  }

  const copyPixCode = () => {
    const pixCode = '00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540525.995802BR5925VIDA FITPRO LTDA6009SAO PAULO62070503***63041D3A'
    navigator.clipboard.writeText(pixCode)
    setPixCopied(true)
    setTimeout(() => setPixCopied(false), 2000)
  }

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds)
    setIsResting(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const updateExercise = async (index: number, field: string, value: any) => {
    const updated = { ...workoutData }
    updated.exercises[index] = { ...updated.exercises[index], [field]: value }
    setWorkoutData(updated)

    // Update in database
    const exercise = updated.exercises[index]
    if (exercise.id) {
      try {
        await supabase
          .from('exercises')
          .update({ [field]: value })
          .eq('id', exercise.id)
      } catch (error) {
        console.error('Error updating exercise:', error)
      }
    }
  }

  // Auth Screen
  const AuthScreen = () => (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EBF2] flex flex-col justify-center">
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-3xl flex items-center justify-center">
          <Dumbbell className="w-10 h-10 text-white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-center mb-2">Vida FitPro</h1>
      <p className="text-[#9AA8B2] text-center mb-8">Seu personal trainer digital</p>

      {authMode === 'login' ? (
        <LoginForm 
          onSuccess={handleAuthSuccess}
          onSwitchToSignup={() => setAuthMode('signup')}
        />
      ) : (
        <SignupForm 
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      )}
    </div>
  )

  // Subscription Screen
  const SubscriptionScreen = () => (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EBF2] p-6 flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-3xl flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Vida FitPro</h1>
          <p className="text-[#9AA8B2]">Seu personal trainer digital</p>
        </div>

        <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E] mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold">Acesso Premium</h2>
          </div>
          
          <div className="space-y-3 mb-6">
            {[
              'Treinos personalizados ilimitados',
              'Planos de dieta customizados',
              'Acompanhamento de progresso',
              'Lembretes de água e refeições',
              'Biblioteca de exercícios',
              'Suporte prioritário'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#F97316]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[#F97316]" />
                </div>
                <span className="text-[#E6EBF2]">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-[#F97316]/10 to-[#EA580C]/5 p-4 rounded-xl border border-[#F97316]/20">
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-4xl font-bold text-[#F97316]">R$ 25,99</span>
              <span className="text-[#9AA8B2]">/mês</span>
            </div>
            <p className="text-center text-sm text-[#9AA8B2]">Cancele quando quiser</p>
          </div>
        </div>

        {!paymentMethod && (
          <div className="space-y-3 mb-6">
            <button
              onClick={() => {
                setPaymentMethod('pix')
                setShowPixCode(true)
              }}
              className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-4 px-6 rounded-2xl font-medium flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-[#F97316]/25"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              Pagar com PIX
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className="w-full bg-[#11161E] border-2 border-[#1A1F2E] text-[#E6EBF2] py-4 px-6 rounded-2xl font-medium flex items-center justify-center gap-3 transition-all duration-200 hover:border-[#F97316]/50"
            >
              <CreditCard className="w-5 h-5" />
              Pagar com Cartão
            </button>
          </div>
        )}

        {paymentMethod === 'pix' && showPixCode && (
          <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E] mb-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Pagamento via PIX</h3>
              <button
                onClick={() => {
                  setPaymentMethod(null)
                  setShowPixCode(false)
                }}
                className="w-8 h-8 bg-[#0B0F14] rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl mb-4">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-lg shadow-lg flex items-center justify-center mb-2">
                    <span className="text-xs text-gray-400">QR Code PIX</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-[#9AA8B2] mb-2">Código PIX Copia e Cola:</p>
                <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#1A1F2E] break-all text-xs text-[#9AA8B2] font-mono">
                  00020126580014br.gov.bcb.pix0136a1b2c3d4...
                </div>
              </div>

              <button
                onClick={copyPixCode}
                className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-[#F97316]/25"
              >
                {pixCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Código Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Código PIX
                  </>
                )}
              </button>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                <p className="text-sm text-blue-300 text-center">
                  Após realizar o pagamento, clique no botão abaixo para ativar sua assinatura
                </p>
              </div>

              <button
                onClick={activateSubscription}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:bg-green-600"
              >
                Já Paguei - Ativar Assinatura
              </button>
            </div>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E] mb-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Pagamento com Cartão</h3>
              <button
                onClick={() => setPaymentMethod(null)}
                className="w-8 h-8 bg-[#0B0F14] rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#9AA8B2] block mb-2">Número do Cartão</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-[#0B0F14] border border-[#1A1F2E] rounded-xl px-4 py-3 focus:border-[#F97316] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-[#9AA8B2] block mb-2">Nome no Cartão</label>
                <input
                  type="text"
                  placeholder="NOME COMPLETO"
                  className="w-full bg-[#0B0F14] border border-[#1A1F2E] rounded-xl px-4 py-3 focus:border-[#F97316] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#9AA8B2] block mb-2">Validade</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full bg-[#0B0F14] border border-[#1A1F2E] rounded-xl px-4 py-3 focus:border-[#F97316] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#9AA8B2] block mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="000"
                    className="w-full bg-[#0B0F14] border border-[#1A1F2E] rounded-xl px-4 py-3 focus:border-[#F97316] focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={activateSubscription}
                className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-4 rounded-2xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#F97316]/25"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-[#9AA8B2]">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </div>
    </div>
  )

  // Water Notification Component
  const WaterNotification = () => {
    if (!showWaterNotification) return null

    return (
      <div className="fixed top-6 left-6 right-6 z-50 animate-in slide-in-from-top duration-300">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Hora de Beber Água! 💧</h3>
                <p className="text-blue-100 text-sm">Mantenha-se hidratado</p>
              </div>
            </div>
            <button
              onClick={dismissWaterNotification}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-blue-50 text-sm mb-2">
              Você já bebeu <span className="font-bold text-white">{waterConsumed}</span> de <span className="font-bold text-white">{waterTarget}</span> copos hoje
            </p>
            <div className="flex gap-1">
              {Array.from({ length: waterTarget }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    i < waterConsumed ? 'bg-blue-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={dismissWaterNotification}
              className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Mais Tarde
            </button>
            <button
              onClick={drinkWaterFromNotification}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Droplets className="w-4 h-4" />
              Bebi Água!
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Onboarding Component
  const OnboardingScreen = () => {
    const steps = [
      {
        title: 'Qual seu objetivo?',
        options: ['Hipertrofia', 'Emagrecimento', 'Força', 'Resistência'],
        field: 'goal'
      },
      {
        title: 'Qual seu nível?',
        options: ['Iniciante', 'Intermediário', 'Avançado'],
        field: 'level'
      },
      {
        title: 'Quantos dias por semana?',
        options: ['3 dias', '4 dias', '5 dias', '6 dias'],
        field: 'daysPerWeek'
      },
      {
        title: 'Tempo por sessão?',
        options: ['30-45 min', '45-60 min', '60-90 min', '90+ min'],
        field: 'sessionTime'
      },
      {
        title: 'Equipamentos disponíveis?',
        options: ['Academia completa', 'Home gym', 'Peso corporal', 'Elásticos'],
        field: 'equipment',
        multiple: true
      }
    ]

    const currentStep = steps[onboardingStep]

    return (
      <div className="min-h-screen bg-[#0B0F14] text-[#E6EBF2] p-6 flex flex-col">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-2xl flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Vida FitPro</h1>
            <p className="text-[#9AA8B2] text-center">Seu personal trainer digital</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 mx-1 rounded-full transition-colors duration-300 ${
                    index <= onboardingStep ? 'bg-[#F97316]' : 'bg-[#11161E]'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-[#9AA8B2] text-center">
              Etapa {onboardingStep + 1} de {steps.length}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">{currentStep.title}</h2>
            <div className="space-y-3">
              {currentStep.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (currentStep.multiple) {
                      const current = onboardingData[currentStep.field as keyof typeof onboardingData] as string[]
                      const updated = current.includes(option)
                        ? current.filter(item => item !== option)
                        : [...current, option]
                      setOnboardingData(prev => ({ ...prev, [currentStep.field]: updated }))
                    } else {
                      setOnboardingData(prev => ({ ...prev, [currentStep.field]: option }))
                    }
                  }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ${
                    currentStep.multiple
                      ? (onboardingData[currentStep.field as keyof typeof onboardingData] as string[])?.includes(option)
                        ? 'border-[#F97316] bg-[#F97316]/10'
                        : 'border-[#11161E] bg-[#11161E]/50 hover:border-[#F97316]/50'
                      : onboardingData[currentStep.field as keyof typeof onboardingData] === option
                      ? 'border-[#F97316] bg-[#F97316]/10'
                      : 'border-[#11161E] bg-[#11161E]/50 hover:border-[#F97316]/50'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {onboardingStep > 0 && (
            <button
              onClick={() => setOnboardingStep(prev => prev - 1)}
              className="flex-1 py-4 px-6 rounded-2xl border border-[#11161E] text-[#9AA8B2] font-medium transition-colors duration-200 hover:border-[#F97316]/50"
            >
              Voltar
            </button>
          )}
          <button
            onClick={() => {
              if (onboardingStep < steps.length - 1) {
                setOnboardingStep(prev => prev + 1)
              } else {
                completeOnboarding()
              }
            }}
            disabled={!onboardingData[currentStep.field as keyof typeof onboardingData] || 
              (currentStep.multiple && (onboardingData[currentStep.field as keyof typeof onboardingData] as string[]).length === 0)}
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#F97316]/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {onboardingStep < steps.length - 1 ? 'Continuar' : 'Finalizar'}
          </button>
        </div>
      </div>
    )
  }

  // Dashboard Component
  const DashboardScreen = () => (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EBF2]">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Olá, {userData?.name}! 👋</h1>
            <p className="text-[#9AA8B2]">Vamos treinar hoje?</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#11161E] px-3 py-2 rounded-xl">
              <Flame className="w-4 h-4 text-[#F97316]" />
              <span className="text-sm font-medium">{userData?.streak || 0}</span>
            </div>
            <button
              onClick={() => setCurrentScreen('profile')}
              className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center"
            >
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#11161E] p-4 rounded-2xl border border-[#1A1F2E]">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-5 h-5 text-[#F97316]" />
              <span className="text-xs text-[#9AA8B2]">Calorias</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{caloriesConsumed}</span>
              <span className="text-sm text-[#9AA8B2]">/{caloriesTarget}</span>
            </div>
            <div className="w-full bg-[#0B0F14] rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-[#F97316] to-[#EA580C] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((caloriesConsumed / caloriesTarget) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-[#11161E] p-4 rounded-2xl border border-[#1A1F2E]">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-[#9AA8B2]">Água</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{waterConsumed}</span>
              <span className="text-sm text-[#9AA8B2]">/{waterTarget}</span>
            </div>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: waterTarget }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < waterConsumed ? 'bg-blue-400' : 'bg-[#0B0F14]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#F97316]/10 to-[#EA580C]/5 p-6 rounded-2xl border border-[#F97316]/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#F97316]">Treino de Hoje</h3>
              <p className="text-[#9AA8B2]">{workoutData.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#9AA8B2]">{workoutData.exercises.length} exercícios</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentScreen('workout')}
            className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-[#F97316]/25"
          >
            <Play className="w-5 h-5" />
            Iniciar Treino
          </button>
        </div>

        <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E] mb-6">
          <h3 className="text-lg font-bold mb-4">Macronutrientes</h3>
          <div className="space-y-4">
            {Object.entries(macros).map(([macro, data]) => (
              <div key={macro}>
                <div className="flex justify-between mb-2">
                  <span className="capitalize text-[#9AA8B2]">{macro === 'protein' ? 'Proteína' : macro === 'carbs' ? 'Carboidratos' : 'Gordura'}</span>
                  <span className="text-sm">{data.consumed.toFixed(1)}g / {data.target}g</span>
                </div>
                <div className="w-full bg-[#0B0F14] rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      macro === 'protein' ? 'bg-green-500' : 
                      macro === 'carbs' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min((data.consumed / data.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentScreen('diet')}
            className="bg-[#11161E] p-4 rounded-2xl border border-[#1A1F2E] flex flex-col items-center gap-2 transition-all duration-200 hover:border-[#F97316]/50"
          >
            <Apple className="w-6 h-6 text-[#F97316]" />
            <span className="text-sm font-medium">Dieta</span>
          </button>
          <button
            onClick={() => setCurrentScreen('progress')}
            className="bg-[#11161E] p-4 rounded-2xl border border-[#1A1F2E] flex flex-col items-center gap-2 transition-all duration-200 hover:border-[#F97316]/50"
          >
            <TrendingUp className="w-6 h-6 text-[#F97316]" />
            <span className="text-sm font-medium">Progresso</span>
          </button>
        </div>
      </div>
    </div>
  )

  // Workout Screen
  const WorkoutScreen = () => (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EBF2]">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-10 h-10 bg-[#11161E] rounded-xl flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold">{workoutData.name}</h1>
            <p className="text-[#9AA8B2] text-sm">{workoutData.exercises.length} exercícios</p>
          </div>
          <button className="w-10 h-10 bg-[#11161E] rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {isResting && (
          <div className="bg-gradient-to-br from-[#F97316]/10 to-[#EA580C]/5 p-6 rounded-2xl border border-[#F97316]/20 mb-6">
            <div className="text-center">
              <Timer className="w-8 h-8 text-[#F97316] mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-[#F97316]">{formatTime(restTimer)}</h3>
              <p className="text-[#9AA8B2]">Tempo de descanso</p>
              <button
                onClick={() => setIsResting(false)}
                className="mt-4 px-6 py-2 bg-[#F97316] text-white rounded-xl text-sm font-medium"
              >
                Pular Descanso
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {workoutData.exercises.length === 0 ? (
            <div className="bg-[#11161E] p-8 rounded-2xl border border-[#1A1F2E] text-center">
              <Dumbbell className="w-12 h-12 text-[#9AA8B2] mx-auto mb-4" />
              <p className="text-[#9AA8B2]">Nenhum treino disponível hoje</p>
              <p className="text-sm text-[#9AA8B2] mt-2">Configure seu plano de treino no perfil</p>
            </div>
          ) : (
            workoutData.exercises.map((exercise, index) => (
              <div key={index} className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{exercise.name}</h3>
                    <p className="text-[#9AA8B2] text-sm">{exercise.sets} séries • {exercise.reps} reps</p>
                  </div>
                  <button
                    onClick={() => updateExercise(index, 'completed', !exercise.completed)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      exercise.completed 
                        ? 'border-[#F97316] bg-[#F97316] text-white' 
                        : 'border-[#9AA8B2] hover:border-[#F97316]'
                    }`}
                  >
                    {exercise.completed && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-[#9AA8B2] block mb-1">Carga (kg)</label>
                    <input
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value))}
                      className="w-full bg-[#0B0F14] border border-[#1A1F2E] rounded-xl px-3 py-2 text-center font-medium focus:border-[#F97316] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9AA8B2] block mb-1">RPE</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={exercise.rpe || ''}
                      onChange={(e) => updateExercise(index, 'rpe', parseInt(e.target.value))}
                      className="w-full bg-[#0B0F14] border border-[#1A1F2E] rounded-xl px-3 py-2 text-center font-medium focus:border-[#F97316] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9AA8B2] block mb-1">Descanso</label>
                    <button
                      onClick={() => startRestTimer(exercise.rest)}
                      className="w-full bg-[#F97316] text-white rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-[#EA580C]"
                    >
                      {exercise.rest}s
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-[#0B0F14] border border-[#1A1F2E] text-[#9AA8B2] py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:border-[#F97316]/50">
                    Ver Vídeo
                  </button>
                  <button className="flex-1 bg-[#0B0F14] border border-[#1A1F2E] text-[#9AA8B2] py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:border-[#F97316]/50">
                    Histórico
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 pb-6">
          <button className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-4 rounded-2xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#F97316]/25">
            Finalizar Treino
          </button>
        </div>
      </div>
    </div>
  )

  // Diet Screen
  const DietScreen = () => (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EBF2]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-10 h-10 bg-[#11161E] rounded-xl flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-xl font-bold">Dieta do Dia</h1>
          <button className="w-10 h-10 bg-[#11161E] rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E] mb-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#F97316]">{caloriesConsumed}</p>
              <p className="text-xs text-[#9AA8B2]">Calorias</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{macros.protein.consumed.toFixed(0)}g</p>
              <p className="text-xs text-[#9AA8B2]">Proteína</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{macros.carbs.consumed.toFixed(0)}g</p>
              <p className="text-xs text-[#9AA8B2]">Carbos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{macros.fat.consumed.toFixed(0)}g</p>
              <p className="text-xs text-[#9AA8B2]">Gordura</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {meals.length === 0 ? (
            <div className="bg-[#11161E] p-8 rounded-2xl border border-[#1A1F2E] text-center">
              <Apple className="w-12 h-12 text-[#9AA8B2] mx-auto mb-4" />
              <p className="text-[#9AA8B2]">Nenhuma refeição registrada hoje</p>
              <p className="text-sm text-[#9AA8B2] mt-2">Adicione suas refeições para acompanhar sua dieta</p>
            </div>
          ) : (
            meals.map((meal, index) => (
              <div key={index} className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        meal.completed 
                          ? 'border-[#F97316] bg-[#F97316] text-white' 
                          : 'border-[#9AA8B2] hover:border-[#F97316]'
                      }`}
                    >
                      {meal.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <h3 className="font-bold">{meal.name}</h3>
                      <p className="text-[#9AA8B2] text-sm">{meal.calories} kcal</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#9AA8B2]" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-medium text-green-500">{meal.protein}g</p>
                    <p className="text-xs text-[#9AA8B2]">Proteína</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-500">{meal.carbs}g</p>
                    <p className="text-xs text-[#9AA8B2]">Carbos</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-500">{meal.fat}g</p>
                    <p className="text-xs text-[#9AA8B2]">Gordura</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E] mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold">Hidratação</h3>
            </div>
            <span className="text-sm text-[#9AA8B2]">{waterConsumed}/{waterTarget} copos</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: waterTarget }).map((_, i) => (
              <button
                key={i}
                onClick={() => i === waterConsumed && addWaterGlass()}
                className={`flex-1 h-12 rounded-xl transition-all duration-200 ${
                  i < waterConsumed 
                    ? 'bg-blue-400 text-white' 
                    : 'bg-[#0B0F14] border border-[#1A1F2E] hover:border-blue-400/50'
                }`}
              >
                <Droplets className="w-5 h-5 mx-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Progress Screen
  const ProgressScreen = () => (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EBF2]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-10 h-10 bg-[#11161E] rounded-xl flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-xl font-bold">Progresso</h1>
          <button className="w-10 h-10 bg-[#11161E] rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E] mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Peso Corporal</h3>
            <span className="text-[#F97316] font-bold">{userData?.weight || 0} kg</span>
          </div>
          <div className="h-32 bg-[#0B0F14] rounded-xl p-4 flex items-center justify-center">
            <p className="text-[#9AA8B2] text-sm">Adicione medições para ver seu progresso</p>
          </div>
        </div>

        <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E] mb-6">
          <h3 className="font-bold mb-4">Medidas Corporais</h3>
          <div className="space-y-3">
            {[
              { name: 'Peito', value: '-- cm' },
              { name: 'Braço', value: '-- cm' },
              { name: 'Cintura', value: '-- cm' },
              { name: 'Coxa', value: '-- cm' }
            ].map((measurement, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-[#9AA8B2]">{measurement.name}</span>
                <span className="font-medium">{measurement.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Linha do Tempo</h3>
            <button className="text-[#F97316] text-sm font-medium">Ver Todas</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="aspect-square bg-[#0B0F14] rounded-xl border border-[#1A1F2E] flex items-center justify-center">
                <User className="w-8 h-8 text-[#9AA8B2]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Profile Screen
  const ProfileScreen = () => (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EBF2]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-10 h-10 bg-[#11161E] rounded-xl flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-xl font-bold">Perfil</h1>
          <button className="w-10 h-10 bg-[#11161E] rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E] mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{userData?.name}</h2>
              <p className="text-[#9AA8B2]">{userData?.goal} • {userData?.level}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#F97316]">{userData?.streak || 0}</p>
              <p className="text-xs text-[#9AA8B2]">Dias seguidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{userData?.weight || 0}</p>
              <p className="text-xs text-[#9AA8B2]">Peso atual</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{userData?.target_weight || 0}</p>
              <p className="text-xs text-[#9AA8B2]">Meta</p>
            </div>
          </div>
        </div>

        {hasSubscription && (
          <div className="bg-gradient-to-br from-[#F97316]/10 to-[#EA580C]/5 p-6 rounded-2xl border border-[#F97316]/20 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#F97316]">Assinatura Ativa</h3>
                  <p className="text-sm text-[#9AA8B2]">R$ 25,99/mês</p>
                </div>
              </div>
              <button className="text-[#F97316] text-sm font-medium">Gerenciar</button>
            </div>
          </div>
        )}

        <div className="bg-[#11161E] p-6 rounded-2xl border border-[#1A1F2E] mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold">Lembretes de Água</h3>
                <p className="text-sm text-[#9AA8B2]">Notificações ao longo do dia</p>
              </div>
            </div>
            <button
              onClick={toggleWaterReminders}
              className={`w-14 h-8 rounded-full transition-all duration-200 relative ${
                waterRemindersEnabled ? 'bg-blue-500' : 'bg-[#1A1F2E]'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-200 ${
                  waterRemindersEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          
          {waterRemindersEnabled && (
            <div className="mt-4 pt-4 border-t border-[#1A1F2E]">
              <p className="text-sm text-[#9AA8B2] mb-3">Horários dos lembretes:</p>
              <div className="grid grid-cols-4 gap-2">
                {waterReminders.map((reminder, index) => (
                  <div
                    key={index}
                    className="bg-[#0B0F14] px-3 py-2 rounded-lg text-center"
                  >
                    <p className="text-xs font-medium text-blue-400">
                      {String(reminder.hour).padStart(2, '0')}:{String(reminder.minute).padStart(2, '0')}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#9AA8B2] mt-3">
                💡 Você receberá {waterReminders.length} lembretes por dia
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {[
            { icon: Target, label: 'Meus Objetivos', screen: 'goals' },
            { icon: Calendar, label: 'Plano de Treino', screen: 'plan' },
            { icon: Book, label: 'Biblioteca', screen: 'library' },
            { icon: Activity, label: 'Estatísticas', screen: 'stats' },
            { icon: Settings, label: 'Configurações', screen: 'settings' }
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => setCurrentScreen(item.screen)}
              className="w-full bg-[#11161E] p-4 rounded-2xl border border-[#1A1F2E] flex items-center justify-between transition-all duration-200 hover:border-[#F97316]/50"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-[#F97316]" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9AA8B2]" />
            </button>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-400 py-4 rounded-2xl font-medium transition-all duration-200 hover:bg-red-500/20 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  )

  // Bottom Navigation
  const BottomNav = () => {
    if (currentScreen === 'onboarding' || currentScreen === 'subscription' || currentScreen === 'auth') return null

    const navItems = [
      { icon: Home, label: 'Início', screen: 'dashboard' },
      { icon: Dumbbell, label: 'Treino', screen: 'workout' },
      { icon: Apple, label: 'Dieta', screen: 'diet' },
      { icon: BarChart3, label: 'Progresso', screen: 'progress' },
      { icon: User, label: 'Perfil', screen: 'profile' }
    ]

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-[#11161E] border-t border-[#1A1F2E] px-6 py-4">
        <div className="flex justify-between">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setCurrentScreen(item.screen)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                currentScreen === item.screen 
                  ? 'text-[#F97316]' 
                  : 'text-[#9AA8B2] hover:text-[#F97316]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Render current screen
  const renderScreen = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <p className="text-[#9AA8B2]">Carregando...</p>
          </div>
        </div>
      )
    }

    switch (currentScreen) {
      case 'auth':
        return <AuthScreen />
      case 'subscription':
        return <SubscriptionScreen />
      case 'onboarding':
        return <OnboardingScreen />
      case 'dashboard':
        return <DashboardScreen />
      case 'workout':
        return <WorkoutScreen />
      case 'diet':
        return <DietScreen />
      case 'progress':
        return <ProgressScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <DashboardScreen />
    }
  }

  return (
    <div className="font-inter">
      <WaterNotification />
      {renderScreen()}
      <BottomNav />
      {currentScreen !== 'onboarding' && currentScreen !== 'subscription' && currentScreen !== 'auth' && <div className="h-20" />}
    </div>
  )
}
