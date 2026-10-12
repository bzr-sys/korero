/// <reference types="vite/client" />

// @toast-ui/editor is unmaintained and its package.json "exports" field
// doesn't include type declarations. These ambient declarations work around that.
declare module '@toast-ui/editor' {
  import Editor from '@toast-ui/editor/types/editor'
  export type EditorType = 'markdown' | 'wysiwyg'
  export default Editor
}

declare module '@toast-ui/editor/dist/toastui-editor-viewer' {
  import Viewer from '@toast-ui/editor/types/toastui-editor-viewer'
  export default Viewer
}
