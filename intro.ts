"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const docx_1 = require("docx");
const _a = require("docx"),
  Paragraph = _a.Paragraph,
  TextRun = _a.TextRun;
const fs = require("fs");
const Intro = function () {
  [
    {
      properties: {
        type: docx_1.SectionType.CONTINUOUS,
      },
      children: [
        new Paragraph({
          children: [new TextRun("Hello World")],
        }),
      ],
    },
  ];
};
