'use server';

import { Header, Paragraph, patchDocument, PatchType, TextRun } from 'docx';

import fs from 'fs';
import path from 'path';

export const generateDocument = async () => {
  const filePath = path.join(
    process.cwd(),
    'public',
    'project-files',
    'catostrofy-risk-initial.docx',
  );
  const docData = fs.readFileSync(filePath);

  console.log('ovdee');

  patchDocument(docData, {
    patches: {
      companyName: {
        type: PatchType.PARAGRAPH,
        children: [new TextRun(`Општа болница „Др Радивој Симоновић“ Сомбор`)],
      },
    },
    keepOriginalStyles: true,
  }).then((doc) => {
    console.log(doc);
    fs.writeFileSync('My Document.docx', doc);
  });
};
