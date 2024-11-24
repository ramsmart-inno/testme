import React, { useEffect, useContext, ReactNode, useRef } from 'react';
import { Dict, ZOOM, UIRenderProps, SchemaForUI, Schema } from '@pdfme/common';
import { theme as antdTheme } from 'antd';
import { SELECTABLE_CLASSNAME } from '../constants';
import { PluginsRegistry, OptionsContext, I18nContext } from '../contexts';
import * as pdfJs from 'pdfjs-dist/legacy/build/pdf.js';

type RendererProps = Omit<
  UIRenderProps<Schema>,
  'value' | 'schema' | 'onChange' | 'rootElement' | 'options' | 'theme' | 'i18n' | 'pdfJs' | '_cache'
> & {
  schema: SchemaForUI;
  onChange: (value: string) => void;
  outline: string;
  onChangeHoveringSchemaId?: (id: string | null) => void;
  scale: number;
};

const Wrapper = ({
  children,
  outline,
  onChangeHoveringSchemaId,
  schema,
}: RendererProps & { children: ReactNode }) => (
  <div
    title={schema.key}
    onMouseEnter={() => onChangeHoveringSchemaId && onChangeHoveringSchemaId(schema.id)}
    onMouseLeave={() => onChangeHoveringSchemaId && onChangeHoveringSchemaId(null)}
    className={SELECTABLE_CLASSNAME}
    id={schema.id}
    style={{
      position: 'absolute',
      cursor: schema.readOnly ? 'initial' : 'pointer',
      height: schema.height * ZOOM,
      width: schema.width * ZOOM,
      top: schema.position.y * ZOOM,
      left: schema.position.x * ZOOM,
      transform: `rotate(${schema.rotate ?? 0}deg)`,
      opacity: schema.opacity ?? 1,
      outline,
    }}
  >
    {children}
  </div>
);

const Renderer = (props: RendererProps) => {
  const pluginsRegistry = useContext(PluginsRegistry);
  const options = useContext(OptionsContext);
  const i18n = useContext(I18nContext) as (key: keyof Dict | string) => string;
  const { token: theme } = antdTheme.useToken();

  const { schema, mode, onChange, stopEditing, tabIndex, placeholder, scale } = props;

  const ref = useRef<HTMLDivElement>(null);
  const _cache = useRef<Map<any, any>>(new Map());

  useEffect(() => {
    if (ref.current && schema.type) {
      const render = Object.values(pluginsRegistry).find(
        (plugin) => plugin?.propPanel.defaultSchema.type === schema.type
      )?.ui;

      if (!render) {
        console.error(`[@pdfme/ui] Renderer for type ${schema.type} not found.
Check this document: https://pdfme.com/docs/custom-schemas`);
        return;
      }

      ref.current.innerHTML = '';

      const editable = mode === 'form' || mode === 'designer';

      render({
        key: schema.key,
        value: schema.readOnly ? schema.readOnlyValue || '' : schema.data,
        schema,
        rootElement: ref.current,
        mode,
        onChange: editable ? onChange : undefined,
        stopEditing: editable ? stopEditing : undefined,
        tabIndex,
        placeholder,
        options,
        theme,
        i18n,
        pdfJs,
        _cache: _cache.current,
      });
    }
    return () => {
      if (ref.current) {
        ref.current.innerHTML = '';
      }
    };
  }, [JSON.stringify(schema), JSON.stringify(options), mode, scale]);

  return (
    <Wrapper {...props}>
      <div style={{ height: '100%', width: '100%' }} ref={ref} />
    </Wrapper>
  );
};
export default Renderer;
