import { z } from 'zod'

export const PASSWORD_MIN = 10

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
})

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, 'La contraseña actual no es correcta').max(200),
    next: z.string().min(PASSWORD_MIN, 'Revisa los requisitos de la nueva contraseña').max(200),
    repeat: z.string().max(200),
  })
  .refine((v) => v.next === v.repeat, { message: 'Revisa los requisitos de la nueva contraseña' })
  .refine((v) => v.next !== v.current, { message: 'La nueva contraseña debe ser distinta de la actual' })
