import type { Schema, Plugin, PDFRenderProps, UIRenderProps } from '@pdfme/common';
import { rotatePoint, convertForPdfLayoutProps, hex2PrintingColor } from '../utils.js';
import { HEX_COLOR_PATTERN } from '../constants.js';

const DEFAULT_LINE_COLOR = '#000000';

interface LineSchema extends Schema {
  color: string;
}

const lineSchema: Plugin<LineSchema> = {
  pdf: (arg: PDFRenderProps<LineSchema>) => {
    const { page, schema, options } = arg;
    const { colorType } = options;
    const pageHeight = page.getHeight();
    const {
      width,
      height,
      rotate,
      position: { x, y },
      opacity,
    } = convertForPdfLayoutProps({ schema, pageHeight, applyRotateTranslate: false });
    const pivot = { x: x + width / 2, y: y + height / 2 };
    page.drawLine({
      start: rotatePoint({ x, y: y + height / 2 }, pivot, rotate.angle),
      end: rotatePoint({ x: x + width, y: y + height / 2 }, pivot, rotate.angle),
      thickness: height,
      color: hex2PrintingColor(schema.color ?? DEFAULT_LINE_COLOR, colorType),
      opacity: opacity,
    });
  },
  ui: (arg: UIRenderProps<LineSchema>) => {
    const { schema, rootElement } = arg;
    const div = document.createElement('div');
    div.style.backgroundColor = schema.color ?? DEFAULT_LINE_COLOR;
    div.style.width = '100%';
    div.style.height = '100%';
    rootElement.appendChild(div);
  },
  propPanel: {
    schema: ({ i18n }) => ({
      color: {
        title: i18n('schemas.color'),
        type: 'string',
        widget: 'color',
        required: true,
        rules: [
          {
            pattern: HEX_COLOR_PATTERN,
            message: i18n('hexColorPrompt'),
          },
        ],
      },
    }),
    defaultValue: '',
    defaultSchema: {
      type: 'line',
      position: { x: 0, y: 0 },
      width: 50,
      height: 1,
      rotate: 0,
      opacity: 1,
      readOnly: true,
      color: DEFAULT_LINE_COLOR,
    },
  },
};
export default lineSchema;
