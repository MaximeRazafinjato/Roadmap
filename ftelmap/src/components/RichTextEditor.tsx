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
import {
  Box,
  Divider,
  Tooltip,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  Image as ImageIcon,
  TableChart,
  Code,
  FormatQuote,
  Undo,
  Redo,
} from '@mui/icons-material';
import { useCallback, useEffect } from 'react';

const lowlight = createLowlight(all);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Commencez à écrire...',
  readOnly = false,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
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
        resizable: true,
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
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL du lien', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt("URL de l'image");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;

    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  if (readOnly) {
    return (
      <Box
        sx={{
          '& .tiptap': {
            outline: 'none',
            minHeight: 100,
            '& p': { margin: '0.5em 0' },
            '& h1': { fontSize: '2em', fontWeight: 'bold', margin: '0.5em 0' },
            '& h2': { fontSize: '1.5em', fontWeight: 'bold', margin: '0.5em 0' },
            '& h3': { fontSize: '1.17em', fontWeight: 'bold', margin: '0.5em 0' },
            '& ul, & ol': { paddingLeft: '2em', margin: '0.5em 0' },
            '& pre': {
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '1em',
              borderRadius: '4px',
              overflow: 'auto',
            },
            '& code': {
              background: '#f5f5f5',
              padding: '0.2em 0.4em',
              borderRadius: '3px',
              fontSize: '0.9em',
            },
            '& pre code': {
              background: 'transparent',
              padding: 0,
            },
            '& blockquote': {
              borderLeft: '3px solid #ddd',
              paddingLeft: '1em',
              margin: '1em 0',
              fontStyle: 'italic',
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
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 1 }}>
      <Stack>
        {/* Toolbar */}
        <Box
          sx={{
            p: 1,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          {/* Text formatting */}
          <ToggleButtonGroup size="small">
            <ToggleButton
              value="bold"
              selected={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Tooltip title="Gras (Ctrl+B)">
                <FormatBold fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value="italic"
              selected={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Tooltip title="Italique (Ctrl+I)">
                <FormatItalic fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value="underline"
              selected={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <Tooltip title="Souligné (Ctrl+U)">
                <FormatUnderlined fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Headings */}
          <ToggleButtonGroup size="small">
            {[1, 2, 3].map((level) => (
              <ToggleButton
                key={level}
                value={`h${level}`}
                selected={editor.isActive('heading', { level })}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({ level: level as 1 | 2 | 3 })
                    .run()
                }
              >
                <Tooltip title={`Titre ${level}`}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>H{level}</span>
                </Tooltip>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Lists */}
          <ToggleButtonGroup size="small">
            <ToggleButton
              value="bulletList"
              selected={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <Tooltip title="Liste à puces">
                <FormatListBulleted fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value="orderedList"
              selected={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <Tooltip title="Liste numérotée">
                <FormatListNumbered fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Additional formatting */}
          <ToggleButtonGroup size="small">
            <ToggleButton value="link" selected={editor.isActive('link')} onClick={setLink}>
              <Tooltip title="Ajouter un lien">
                <LinkIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="image" onClick={addImage}>
              <Tooltip title="Ajouter une image">
                <ImageIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="table" onClick={insertTable}>
              <Tooltip title="Insérer un tableau">
                <TableChart fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value="code"
              selected={editor.isActive('codeBlock')}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Tooltip title="Bloc de code">
                <Code fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value="blockquote"
              selected={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Tooltip title="Citation">
                <FormatQuote fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Undo/Redo */}
          <ToggleButtonGroup size="small">
            <ToggleButton
              value="undo"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Tooltip title="Annuler (Ctrl+Z)">
                <Undo fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value="redo"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Tooltip title="Rétablir (Ctrl+Y)">
                <Redo fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Editor content */}
        <Box
          sx={{
            p: 2,
            minHeight: 200,
            maxHeight: 500,
            overflow: 'auto',
            '& .tiptap': {
              outline: 'none',
              '& p.is-editor-empty:first-child::before': {
                content: `"${placeholder}"`,
                color: 'text.secondary',
                opacity: 0.5,
                pointerEvents: 'none',
                height: 0,
              },
              '& p': { margin: '0.5em 0' },
              '& h1': { fontSize: '2em', fontWeight: 'bold', margin: '0.5em 0' },
              '& h2': { fontSize: '1.5em', fontWeight: 'bold', margin: '0.5em 0' },
              '& h3': { fontSize: '1.17em', fontWeight: 'bold', margin: '0.5em 0' },
              '& ul, & ol': { paddingLeft: '2em', margin: '0.5em 0' },
              '& pre': {
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '1em',
                borderRadius: '4px',
                overflow: 'auto',
              },
              '& code': {
                background: '#f5f5f5',
                padding: '0.2em 0.4em',
                borderRadius: '3px',
                fontSize: '0.9em',
              },
              '& pre code': {
                background: 'transparent',
                padding: 0,
              },
              '& blockquote': {
                borderLeft: '3px solid #ddd',
                paddingLeft: '1em',
                margin: '1em 0',
                fontStyle: 'italic',
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
                cursor: 'pointer',
              },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Stack>
    </Paper>
  );
};
