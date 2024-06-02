'use server';

import { db } from '../../../../drizzle/client';
import { client } from '../../../../drizzle/schema';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
export type FormState = {
  errors?: {
    name?: String[];
    address?: String[];
    identityNumber?: String[];
    pib?: String[];
    responsiblePerson?: String[];
  };
};

export async function createClient(_: FormState, formData: FormData) {
  const { data: employerPayload, error } = formDataScheme.safeParse({
    name: formData.get('company-name'),
    address: formData.get('company-address'),
    identityNumber: formData.get('identity-number'),
    pib: formData.get('pib-number'),
    responsiblePerson: formData.get('responsible-person'),
  });

  if (error)
    return {
      errors: error.flatten().fieldErrors,
    };

  try {
    await db.insert(client).values({
      ...employerPayload,
      pib: Number(employerPayload.pib),
      identityNumber: Number(employerPayload.identityNumber),
    });
  } catch (error) {
    console.error('Error occurred during employer registration:', error);
    throw new Error('Failed to register employer.');
  }

  revalidatePath('./dashboard/clients');
  redirect('./dashboard');
}

const formDataScheme = z.object({
  name: z.string().min(3).max(20),
  address: z.string().min(3).max(20),
  identityNumber: z.string().min(3).max(20),
  pib: z.string().min(3).max(20),
  responsiblePerson: z.string().min(3).max(20),
});
