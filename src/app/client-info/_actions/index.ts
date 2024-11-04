'use server';

import { db } from '../../../../drizzle/client';
import { client } from '../../../../drizzle/schema';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

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
  const id = uuidv4();

  if (error)
    return {
      errors: error.flatten().fieldErrors,
    };

  try {
    await db.insert(client).values({
      ...employerPayload,
      pib: Number(employerPayload.pib),
      identityNumber: Number(employerPayload.identityNumber),
      id,
    });
  } catch (error) {
    console.error('Error occurred during employer registration:', error);
    throw new Error('Failed to register employer.');
  }

  revalidatePath('./dashboard/clients');
  redirect('./dashboard');
}

const formDataScheme = z.object({
  name: z.string().min(3).max(40),
  address: z.string().min(3).max(40),
  identityNumber: z.string().min(3).max(40),
  pib: z.string().min(3).max(40),
  responsiblePerson: z.string().min(3).max(40),
});
