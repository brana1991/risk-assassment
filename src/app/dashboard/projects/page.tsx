'use server';

import { v4 as uuidv4 } from 'uuid';

import { getCurrentUser } from '@/auth/user-actions';
import { db } from '@/root/drizzle/client';
import { projectTable, userTable } from '@/root/drizzle/schema';
import CreateProjectForm from './_components/form';
import { getAllEmployers } from '../clients/page';
import { eq } from 'drizzle-orm';
import { ProjectCards } from './_components/projects';

export default async function Projects() {
  const clients = await getAllEmployers();

  return (
    <>
      <div className="ml-auto">
        <CreateProjectForm clients={clients} />
      </div>
      <div className="mt-4">
        <ProjectCards />
      </div>
    </>
  );
}

type ProjectFormData = {
  name: string;
  clientName: string;
};

export async function getUserProjects() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error('User isnt logged in');

  try {
    const projects = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.ownerId, currentUser.id));

    return projects;
  } catch (error) {
    console.error('Error retrieving employers:', error);
    throw error;
  }
}

export async function insertProject(data: ProjectFormData) {
  const id = uuidv4();
  const user = await getCurrentUser();

  try {
    await db
      .insert(projectTable)
      .values({
        id,
        name: data.name,
        clientId: data.clientName,
        ownerId: user?.id,
      })
      .execute();
  } catch (error) {
    console.error('Error occurred during user registration:', error);
    throw new Error('Failed to register user.');
  }
}
