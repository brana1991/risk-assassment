'use server';
import { v4 as uuidv4 } from 'uuid';
import { insertUser } from '@/auth/user-actions';
import argon2 from 'argon2';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

export type Argon2 = typeof argon2;

export type FormState = {
  errors: {
    userName?: string[];
    password?: string[];
    email?: string[];
    workingGroupDocuments?: string[];
  };
};

export async function signUp(_: FormState, formData: FormData) {
  const { data: userPayload, error } = formDataScheme.safeParse({
    userName: formData.get('userName'),
    password: formData.get('password'),
    email: formData.get('email'),
    workingGroupDocuments: formData.getAll('workingGroupDocuments') as File[],
    neutralPersonDocuments: formData.getAll('neutralPersonDocuments') as File[],
  });

  if (error) {
    return {
      errors: error.flatten().fieldErrors,
    };
  }

  try {
    const id = uuidv4();

    const workingGroupDocumentsUrls = await saveWorkingGroupDocuments(
      userPayload.workingGroupDocuments,
      id,
    );
    const neutralPersonDocumentsUrls = await saveNeutralPersonDocuments(
      userPayload.neutralPersonDocuments,
      id,
    );
    await insertUser(
      {
        ...userPayload,
        id,
        workingGroupDocuments: workingGroupDocumentsUrls,
        neutralPersonDocuments: neutralPersonDocumentsUrls,
      },
      argon2.hash,
    );
  } catch (error) {
    console.error(error);
    throw error;
  }

  redirect('./sign-in');
}

const formDataScheme = z.object({
  userName: z.string().min(6).max(20),
  password: z.string().min(6).max(20),
  email: z.string().email(),
  workingGroupDocuments: z
    .array(z.instanceof(File))
    .nonempty('At least one document is required')
    .refine((files) => files.every((file) => file.type.startsWith('image/')), {
      message: 'All documents must be image files',
    }),
  neutralPersonDocuments: z
    .array(z.instanceof(File))
    .nonempty('At least one document is required')
    .refine((files) => files.every((file) => file.type.startsWith('image/')), {
      message: 'All documents must be image files',
    }),
});

async function saveWorkingGroupDocuments(workingGroupDocuments: File[], userId: string) {
  const uploadDirectory = path.join(
    process.cwd(),
    'public',
    'user-uploads',
    'working-group-documents',
    userId,
  );

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  const urls: string[] = [];

  for (const file of workingGroupDocuments) {
    const fileName = `${uuidv4()}_${file.name}`;
    const filePath = path.join(uploadDirectory, fileName);

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    try {
      await fs.promises.writeFile(filePath, uint8Array);
      urls.push(filePath);
    } catch (error) {
      console.error(`Failed to save certificate: ${file.name}`, error);
      throw new Error(`Error saving file: ${file.name}`);
    }
  }

  return urls;
}

async function saveNeutralPersonDocuments(neutralPersonDocuments: File[], userId: string) {
  const uploadDirectory = path.join(
    process.cwd(),
    'public',
    'user-uploads',
    'neutral-person-documents',
    userId,
  );

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  const urls: string[] = [];

  for (const file of neutralPersonDocuments) {
    const fileName = `${uuidv4()}_${file.name}`;
    const filePath = path.join(uploadDirectory, fileName);

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    try {
      await fs.promises.writeFile(filePath, uint8Array);
      urls.push(filePath);
    } catch (error) {
      console.error(`Failed to save certificate: ${file.name}`, error);
      throw new Error(`Error saving file: ${file.name}`);
    }
  }

  return urls;
}
