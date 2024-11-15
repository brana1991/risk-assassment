'use server';

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

import { getCurrentUser } from '@/auth/user-actions';
import { db } from '@/root/drizzle/client';
import {
  catastropheSections,
  projectSectionTypeTable,
  projectTable,
  projectTypeTable,
} from '@/root/drizzle/schema';
import CreateProjectForm, { FormData } from './_components/form';
import { getAllEmployers } from '../clients/page';
import { and, eq } from 'drizzle-orm';
import { ProjectCards } from './_components/projects';
import path from 'path';
import { ProjectType } from './types';

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
    const result = await db
      .select({
        projectId: projectTable.id,
        projectName: projectTable.name,
        ownerId: projectTable.ownerId,
        clientId: projectTable.clientId,
        projectTypeId: projectTable.projectTypeId,
        projectSectionTypeId: projectTable.projectSectionTypeId,
        projectType: projectTypeTable.type,
        sectionId: catastropheSections.sectionId,
        sections: {
          participantsSection: catastropheSections.participantsSection,
        },
      })
      .from(projectTable)
      .leftJoin(projectTypeTable, eq(projectTable.projectTypeId, projectTypeTable.id))
      .leftJoin(
        catastropheSections,
        eq(catastropheSections.sectionId, projectTable.projectSectionTypeId),
      )
      .where(eq(projectTable.id, id));

    const project = result?.[0];

    if (project) {
      return project;
    } else {
      throw new Error('project dont exist');
    }
  } catch (error) {
    console.error('Error retrieving employers:', error);
    throw error;
  }
}

export async function insertProjectType(type: ProjectType) {
  const id = uuidv4();

  try {
    await db.insert(projectTypeTable).values({ id, type }).execute();

    return id;
  } catch (error) {
    console.error('Error inserting project type:', error);
    throw error;
  }
}

export async function insertSectionType(type: ProjectType) {
  const sectionId = uuidv4();

  try {
    if (type === ProjectType.CATASTROPHE_RISK) {
      await db.insert(projectSectionTypeTable).values({ id: sectionId }).execute();
      await db.insert(catastropheSections).values({ sectionId: sectionId, id: uuidv4() }).execute();

      return sectionId;
    }
  } catch (error) {
    console.error('Error inserting project type:', error);
    throw error;
  }
}

export async function insertProject(data: FormData) {
  const id = uuidv4();
  const user = await getCurrentUser();

  try {
    const folderPath = path.join(process.cwd(), 'public', 'project-files', id);

    const projectTypeId = await insertProjectType(data.projectType);
    const sectionId = await insertSectionType(data.projectType);

    await db
      .insert(projectTable)
      .values({
        id,
        name: data.name,
        clientId: data.clientName,
        ownerId: user?.id,
        projectTypeId,
        projectSectionTypeId: sectionId,
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
