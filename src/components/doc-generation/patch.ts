'use server';

import { getClientById } from '@/app/dashboard/clients/page';
import { getProjectById } from '@/app/dashboard/projects/page';
import { ProjectType, ProjectTypeMap } from '@/app/dashboard/projects/types';
import { getCurrentUser } from '@/auth/user-actions';
import { patchDocument, PatchType, TextRun, Paragraph, ImageRun } from 'docx';

import fs from 'fs';
import path from 'path';

export async function generateDocument(id: string) {
  const user = await getCurrentUser();
  const project = await getProjectById(id);
  const client = await getClientById(project.clientId || '');

  if (!user || !project || !client) return new Error('Error generating doc');

  const initialfilePath = path.join(
    process.cwd(),
    'public',
    'project-files',
    'catostrofy-risk-initial.docx',
  );
  const docData = fs.readFileSync(initialfilePath);

  const working_group_documents = JSON.parse(user.workingGroupDocuments)
    .map((documentUrl: string, index: number, array: Array<string>) => [
      new Paragraph({
        children: [
          new ImageRun({
            data: fs.readFileSync(documentUrl),
            transformation: {
              width: 600,
              height: 800,
            },
          }),
          index < array.length - 1 ? new TextRun({ break: 9 }) : new TextRun(''),
        ],
      }),
    ])
    .flat();

  const neutral_person_documents = JSON.parse(user.neutralPersonDocuments)
    .map((documentUrl: string, index: number, array: Array<string>) => [
      new Paragraph({
        children: [
          new ImageRun({
            data: fs.readFileSync(documentUrl),
            transformation: {
              width: 600,
              height: 800,
            },
          }),
          index < array.length - 1 ? new TextRun({ break: 9 }) : new TextRun(''),
        ],
      }),
    ])
    .flat();

  patchDocument(docData, {
    patches: {
      client_name: {
        type: PatchType.PARAGRAPH,
        children: [new TextRun(client.name)],
      },
      project_owner: {
        type: PatchType.PARAGRAPH,
        children: [new TextRun(`${user.firstName} ${user.lastName}`)],
      },
      client_owner: {
        type: PatchType.PARAGRAPH,
        children: [new TextRun(client.responsiblePerson)],
      },
      client_address: {
        type: PatchType.PARAGRAPH,
        children: [new TextRun(client.address)],
      },
      project_type: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun(
            ProjectTypeMap.get(project.projectType || ProjectType.CATASTROPHE_RISK)
              ?.label as string,
          ),
        ],
      },
      project_type_capitalize: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun(
            ProjectTypeMap.get(
              project.projectType || ProjectType.CATASTROPHE_RISK,
            )?.label.toUpperCase() as string,
          ),
        ],
      },
      working_group_documents: {
        type: PatchType.DOCUMENT,
        children: working_group_documents,
      },
      neutral_person_documents: {
        type: PatchType.DOCUMENT,
        children: neutral_person_documents,
      },
    },
    keepOriginalStyles: true,
  }).then((doc) => {
    const exportFilePath = path.join(
      process.cwd(),
      'public',
      'project-files',
      id,
      `${project.projectName}.docx`,
    );
    console.log(doc);
    fs.writeFileSync(exportFilePath, doc);
  });
}
