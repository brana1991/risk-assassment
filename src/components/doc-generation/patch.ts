'use server';

import { getClientById } from '@/app/dashboard/clients/page';
import { getProjectById } from '@/app/dashboard/projects/page';
import { getCurrentUser } from '@/auth/user-actions';
import { patchDocument, PatchType, TextRun } from 'docx';

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
    },
    keepOriginalStyles: true,
  }).then((doc) => {
    const exportFilePath = path.join(
      process.cwd(),
      'public',
      'project-files',
      id,
      `${project.name}.docx`,
    );
    console.log(doc);
    fs.writeFileSync(exportFilePath, doc);
  });
}
