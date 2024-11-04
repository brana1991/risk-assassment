'use server';

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

import { getCurrentUser } from '@/auth/user-actions';
import { db } from '@/root/drizzle/client';
import { projectTable } from '@/root/drizzle/schema';
import CreateProjectForm from './_components/form';
import { getAllEmployers } from '../clients/page';
import { eq } from 'drizzle-orm';
import { ProjectCards } from './_components/projects';
import path from 'path';

export default async function Projects() {
  const clients = await getAllEmployers();
  const projects = await getUserProjects();

  return (
    <>
      <div className="ml-auto">
        <CreateProjectForm clients={clients} />
      </div>
      <div className="mt-4">
        <ProjectCards projects={projects} />
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

export async function getProjectById(id: string) {
  try {
    const project = await db.select().from(projectTable).where(eq(projectTable.id, id));

    return project[0];
  } catch (error) {
    console.error('Error retrieving employers:', error);
    throw error;
  }
}

export async function insertProject(data: ProjectFormData) {
  const id = uuidv4();
  const user = await getCurrentUser();

  try {
    const folderPath = path.join(process.cwd(), 'public', 'project-files', id);

    await db
      .insert(projectTable)
      .values({
        id,
        name: data.name,
        clientId: data.clientName,
        ownerId: user?.id,
      })
      .execute();

    if (!fs.existsSync(folderPath)) {
      fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
          console.error(`Error creating folder: ${err}`);
        } else {
          console.log(`Folder created at ${folderPath}`);
        }
      });
    } else {
      console.log('Folder already exists');
    }
  } catch (error) {
    console.error('Error occurred during user registration:', error);
    throw new Error('Failed to register user.');
  }
}
