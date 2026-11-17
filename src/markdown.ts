import { generateHTML, type Extensions } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Markdown, MarkdownManager } from '@tiptap/markdown'
import { TableKit } from '@tiptap/extension-table'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import Image from '@tiptap/extension-image'
import '@/assets/markdown.css'

// What Korero's text can hold. Tables, task lists and images keep what Toast UI wrote readable.
export function markdownExtensions(): Extensions {
  return [
    StarterKit.configure({ link: { openOnClick: false } }),
    Markdown,
    TableKit,
    TaskList,
    TaskItem.configure({ nested: true }),
    // Toast UI stored pasted images inline
    Image.configure({ allowBase64: true })
  ]
}

const extensions = markdownExtensions()
const manager = new MarkdownManager({ extensions })

// Only the schema's nodes and marks reach the HTML; links are checked by the Link extension
export function markdownToHTML(markdown: string): string {
  return generateHTML(manager.parse(markdown), extensions)
}
