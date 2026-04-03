'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote', 'code-block'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list',
  'link', 'blockquote', 'code-block',
];

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const memoModules = useMemo(() => modules, []);

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={memoModules}
        formats={formats}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .rich-text-editor-wrapper .ql-container {
          min-height: 120px;
          font-family: var(--font-body);
          font-size: 0.875rem;
          border-color: var(--border);
          border-width: 2px;
          border-bottom-left-radius: var(--r-md, 8px);
          border-bottom-right-radius: var(--r-md, 8px);
          background: var(--input);
        }
        .rich-text-editor-wrapper .ql-toolbar {
          border-color: var(--border);
          border-width: 2px;
          border-top-left-radius: var(--r-md, 8px);
          border-top-right-radius: var(--r-md, 8px);
          background: var(--muted);
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: 100px;
          color: var(--foreground);
        }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: var(--muted-foreground);
          font-style: normal;
        }
        .rich-text-editor-wrapper .ql-stroke {
          stroke: var(--foreground) !important;
        }
        .rich-text-editor-wrapper .ql-fill {
          fill: var(--foreground) !important;
        }
        .rich-text-editor-wrapper .ql-picker-label {
          color: var(--foreground) !important;
        }
        .rich-text-editor-wrapper .ql-picker-options {
          background: var(--card) !important;
          border-color: var(--border) !important;
        }
        .rich-text-editor-wrapper .ql-picker-item {
          color: var(--foreground) !important;
        }
      `}</style>
    </div>
  );
}
