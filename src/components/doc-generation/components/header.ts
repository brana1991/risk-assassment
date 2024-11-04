import { Header, Paragraph } from 'docx';

export const header = {
  headers: {
    default: new Header({
      children: [new Paragraph('Header text')],
    }),
  },
  children: [new Paragraph('Hello World')],
};
