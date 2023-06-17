import { SectionType } from "docx";

const {  Paragraph, TextRun} = require("docx");
const fs = require("fs");

const Intro = () => {
    sections: [{
        properties: {
            type: SectionType.CONTINUOUS,
        },
        children: [
            new Paragraph({
                children: [new TextRun("Hello World")],
            }),
        ],
    }]
}