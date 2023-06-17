"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var docx_1 = require("docx");
var _a = require("docx"), Paragraph = _a.Paragraph, TextRun = _a.TextRun;
var fs = require("fs");
var Intro = function () {
    sections: [{
            properties: {
                type: docx_1.SectionType.CONTINUOUS,
            },
            children: [
                new Paragraph({
                    children: [new TextRun("Hello World")],
                }),
            ],
        }];
};
