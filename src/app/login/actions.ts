'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export async function login(data: { email: string; password: string }) {
  const validated = authSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error, data: authData } = await supabase.auth.signInWithPassword(validated.data)

  if (error) {
    return { success: false, error: error.message }
  }

  // Session successfully established by supabase SSR middleware cookies
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signup(data: { email: string; password: string }) {
  const validated = authSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  // Supabase often requires email confirmation by default depending on project settings.
  const { error, data: authData } = await supabase.auth.signUp(validated.data)

  if (error) {
    return { success: false, error: error.message }
  }

  // Ensure the user is saved in the public Prisma database immediately!
  if (authData.user) {
    try {
      // Use raw SQL or Prisma. We'll use Prisma directly since it's imported in the project
      // but wait, Prisma is not imported here. Let's import it.
      const prisma = (await import('@/lib/prisma')).default;
      await prisma.user.upsert({
        where: { id: authData.user.id },
        update: { email: authData.user.email! },
        create: {
          id: authData.user.id,
          email: authData.user.email!,
        }
      });
    } catch (dbError) {
       console.error("Failed to insert user into public schema:", dbError);
       // We won't block the auth flow if this fails, onboarding will catch it.
    }
  }

  revalidatePath('/', 'layout')
  
  // If the user identity doesn't immediately have a session, it likely means email confirmation is required.
  if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
     return { success: false, error: 'This email is already registered. Please sign in.' }
  }

  if (authData.session === null) {
      return { success: true, message: 'Check your email to confirm your account.' }
  }

  return { success: true, message: 'Account created successfully.' }
}
