import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { all, createLowlight } from 'lowlight';
import { Box, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { stripHtmlTags } from '../utils/html-utils';

const lowlight = createLowlight(all);

interface RichTextViewerProps {
  content: string;
  maxLength?: number;
  showReadMore?: boolean;
}

const truncateHtml = (html: string, maxLength: number): string => {
  const text = stripHtmlTags(html);
  if (text.length <= maxLength) return html;

  let truncated = '';
  let currentLength = 0;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const traverse = (node: Node): boolean => {
    if (currentLength >= maxLength) return false;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const remaining = maxLength - currentLength;

      if (text.length <= remaining) {
        truncated += text;
        currentLength += text.length;
      } else {
        truncated += text.substring(0, remaining) + '...';
        currentLength = maxLength;
        return false;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      truncated += `<${tagName}`;

      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        truncated += ` ${attr.name}="${attr.value}"`;
      }

      truncated += '>';

      for (let i = 0; i < node.childNodes.length; i++) {
        if (!traverse(node.childNodes[i])) {
          truncated += `</${tagName}>`;
          return false;
        }
      }

      truncated += `</${tagName}>`;
    }

    return true;
  };

  traverse(doc.body);
  return `<p>${truncated}</p>`;
};

export const RichTextViewer = ({
  content,
  maxLength,
  showReadMore = false,
}: RichTextViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayContent, setDisplayContent] = useState(content);

  useEffect(() => {
    if (maxLength && !isExpanded) {
      const text = stripHtmlTags(content);
      if (text.length > maxLength) {
        setDisplayContent(truncateHtml(content, maxLength));
      } else {
        setDisplayContent(content);
      }
    } else {
      setDisplayContent(content);
    }
  }, [content, maxLength, isExpanded]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          style: 'max-width: 100%; height: auto;',
        },
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TextStyle,
      Color,
    ],
    content: displayContent,
    editable: false,
  });

  useEffect(() => {
    if (editor && displayContent !== editor.getHTML()) {
      editor.commands.setContent(displayContent);
    }
  }, [editor, displayContent]);

  if (!editor) {
    return null;
  }

  const isTruncated = maxLength && stripHtmlTags(content).length > maxLength;

  return (
    <Box>
      <Box
        sx={{
          '& .tiptap': {
            outline: 'none',
            '& p': { margin: '0.5em 0' },
            '& h1': { fontSize: '2em', fontWeight: 'bold', margin: '0.5em 0' },
            '& h2': { fontSize: '1.5em', fontWeight: 'bold', margin: '0.5em 0' },
            '& h3': { fontSize: '1.17em', fontWeight: 'bold', margin: '0.5em 0' },
            '& ul, & ol': { paddingLeft: '2em', margin: '0.5em 0' },
            '& li': { marginBottom: '0.25em' },
            '& pre': {
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '1em',
              borderRadius: '4px',
              overflow: 'auto',
              margin: '0.5em 0',
            },
            '& code': {
              background: '#f5f5f5',
              padding: '0.2em 0.4em',
              borderRadius: '3px',
              fontSize: '0.9em',
              fontFamily: 'monospace',
            },
            '& pre code': {
              background: 'transparent',
              padding: 0,
              color: 'inherit',
            },
            '& blockquote': {
              borderLeft: '3px solid #ddd',
              paddingLeft: '1em',
              margin: '1em 0',
              fontStyle: 'italic',
              color: 'text.secondary',
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              margin: '1em 0',
            },
            '& th, & td': {
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'left',
            },
            '& th': {
              background: '#f5f5f5',
              fontWeight: 'bold',
            },
            '& a': {
              color: '#3B82F6',
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'none',
              },
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '4px',
              margin: '0.5em 0',
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {showReadMore && isTruncated && (
        <Button
          size="small"
          sx={{ mt: 1, textTransform: 'none' }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Voir moins' : 'Lire plus...'}
        </Button>
      )}
    </Box>
  );
};
