import { z } from 'zod';

const waRegex = /^(\+62|62|0)8[0-9]{8,12}$/;

export const creatorSchema = z.object({
  social_name: z.string().min(2, 'Nama sosial media wajib diisi'),
  social_link: z.string().url('Link harus URL valid (https://...)'),
  followers: z.coerce.number().min(1000, 'Followers minimal 1000'),
  reason: z.string().min(50, 'Alasan minimal 50 karakter'),
  whatsapp: z.string().regex(waRegex, 'Nomor WhatsApp gak valid (contoh: 08123456789)'),
  agreed_to_promote: z.literal(true, { errorMap: () => ({ message: 'Wajib centang persetujuan' }) }),
});

export const verifiedSchema = z.object({
  social_name: z.string().min(2, 'Nama sosial media wajib diisi'),
  social_link: z.string().url('Link harus URL valid (https://...)'),
  reason: z.string().min(30, 'Alasan minimal 30 karakter'),
  whatsapp: z.string().regex(waRegex, 'Nomor WhatsApp gak valid (contoh: 08123456789)'),
  agreed_to_promote: z.literal(true, { errorMap: () => ({ message: 'Wajib centang persetujuan' }) }),
});
