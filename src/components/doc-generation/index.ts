'use server';
import { header } from './components/header';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import fs from 'fs';

export const generateDocument = async () => {
  const doc = new Document({
    sections: [
      // header,
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun('Hello World'),
              new TextRun({
                text: 'Foo Bar',
                bold: true,
              }),
              new TextRun({
                text: 'Github is the best',
                bold: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync('My Document.docx', buffer);
  });
};
