import clsx from 'clsx';
import { useState, useId } from 'react';
import ReactQuill from 'react-quill';
import Quill from 'quill';
import 'react-quill/dist/quill.snow.css';

// Register custom font sizes with Quill
const Size = Quill.import('attributors/style/size');
Size.whitelist = ['14px', '16px', '18px', '20px', '24px', '30px', '36px'];
Quill.register(Size, true);

interface EditorProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  toolbarId?: string; // optional prop for a custom toolbar id
}

const Editor = ({ value, onChange, className, toolbarId: providedToolbarId }: EditorProps) => {
  const [content, setContent] = useState(value);
  const generatedId = useId();
  // Sanitize the generated id to remove colons
  const sanitizedId = generatedId.replace(/:/g, '-');
  const toolbarId = providedToolbarId || `toolbar-${sanitizedId}`;

  const modules = {
    toolbar: {
      container: `#${toolbarId}`
    }
  };

  const formats = [
    'header',
    'size',
    'bold',
    'italic',
    'underline',
    'link',
    'align',
    'indent',
    'list',
    'color',
    'background'
  ];

  return (
    <div className="custom-editor">
      {/* Custom Toolbar Container with Unique ID */}
      <div id={toolbarId} className="rounded-md input mb-2 ">
        {/* Header Dropdown */}
        <select className="ql-header" defaultValue="">
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
          <option value="5">H5</option>
          <option value="6">H6</option>
          <option value="">Normal</option>
        </select>
        {/* Font Size Dropdown */}
        <select className="ql-size" defaultValue="None">
          <option value="">None</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="30px">30px</option>
          <option value="36px">36px</option>
        </select>
        {/* Bold, Italic, Underline */}
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />

        {/* Indentation */}
        <button className="ql-indent" value="-1">
          Outdent
        </button>
        <button className="ql-indent" value="+1">
          Indent
        </button>
        {/* Link */}
        <button className="ql-link mx-2" />
        {/* Alignment */}
        <button className="ql-align" value="">
          Left
        </button>
        <button className="ql-align" value="center">
          Center
        </button>
        <button className="ql-align" value="right">
          Right
        </button>
        <button className="ql-align" value="justify">
          Justify
        </button>

        {/* Lists */}
        <button className="ql-list" value="ordered">
          Ordered List
        </button>
        <button className="ql-list" value="bullet">
          Unordered List
        </button>
        {/* Color and Background Dropdowns */}
        <select className="ql-color" />
        <select className="ql-background" />
        {/* Clean Formatting */}
        <button className="ql-clean">clear-styles</button>
      </div>

      <ReactQuill
        style={{
          borderRadius: '6px'
        }}
        value={content}
        onChange={(newContent) => {
          setContent(newContent);
          onChange(newContent);
        }}
        modules={modules}
        formats={formats}
        className={clsx('w-full', className)}
      />
    </div>
  );
};

export { Editor };
