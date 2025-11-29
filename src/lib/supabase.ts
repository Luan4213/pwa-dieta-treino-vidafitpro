import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type User = {
  id: string
  email: string
  name: string
  goal?: string
  level?: string
  days_per_week?: number
  session_time?: number
  equipment?: string[]
  weight?: number
  target_weight?: number
  streak?: number
  created_at?: string
  updated_at?: string
}

export type Workout = {
  id: string
  user_id: string
  name: string
  duration?: number
  completed: boolean
  completed_at?: string
  created_at?: string
}

export type Exercise = {
  id: string
  workout_id: string
  name: string
  sets: number
  reps: string
  weight?: number
  rest?: number
  completed: boolean
  rpe?: number
  notes?: string
  order_index: number
  created_at?: string
}

export type Meal = {
  id: string
  user_id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meal_time: string
  completed: boolean
  date: string
  created_at?: string
}

export type WaterIntake = {
  id: string
  user_id: string
  glasses: number
  target: number
  date: string
  created_at?: string
}

export type BodyProgress = {
  id: string
  user_id: string
  weight?: number
  chest?: number
  arm?: number
  waist?: number
  thigh?: number
  date: string
  created_at?: string
}

export type Subscription = {
  id: string
  user_id: string
  status: string
  payment_method?: string
  amount: number
  started_at?: string
  expires_at?: string
  created_at?: string
}
