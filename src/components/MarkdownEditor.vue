<script setup lang="ts">
import { useId } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import type { ChainedCommands } from '@tiptap/core'
import { markdownExtensions } from '@/markdown'
import ValidationError from '@/components/ValidationError.vue'

const props = withDefaults(
  defineProps<{
    label?: string
    validationError?: string
    initialValue?: string
  }>(),
  {
    label: '',
    validationError: '',
    initialValue: ''
  }
)

const emit = defineEmits<{ updateValue: [markdown: string] }>()

const labelId = useId()

const editor = useEditor({
  extensions: markdownExtensions(),
  content: props.initialValue,
  contentType: 'markdown',
  editorProps: {
    attributes: {
      class: 'md-content min-h-24 px-3 py-2 focus:outline-none',
      'aria-multiline': 'true',
      ...(props.label ? { 'aria-labelledby': labelId } : { 'aria-label': 'Text' })
    }
  },
  onUpdate: ({ editor }) =>
    emit('updateValue', editor.isEmpty ? '' : editor.getMarkdown().trimEnd())
})

type Tool = {
  label: string
  text: string
  class?: string
  run: (c: ChainedCommands) => ChainedCommands
  active: [string, Record<string, unknown>?]
}

const tools: Tool[] = [
  { label: 'Bold', text: 'B', class: 'font-bold', run: (c) => c.toggleBold(), active: ['bold'] },
  { label: 'Italic', text: 'I', class: 'italic', run: (c) => c.toggleItalic(), active: ['italic'] },
  {
    label: 'Strikethrough',
    text: 'S',
    class: 'line-through',
    run: (c) => c.toggleStrike(),
    active: ['strike']
  },
  {
    label: 'Heading',
    text: 'H',
    class: 'font-bold',
    run: (c) => c.toggleHeading({ level: 2 }),
    active: ['heading', { level: 2 }]
  },
  { label: 'Bullet list', text: '•', run: (c) => c.toggleBulletList(), active: ['bulletList'] },
  {
    label: 'Numbered list',
    text: '1.',
    run: (c) => c.toggleOrderedList(),
    active: ['orderedList']
  },
  {
    label: 'Checklist',
    text: '☐',
    class: 'text-lg leading-none',
    run: (c) => c.toggleTaskList(),
    active: ['taskList']
  },
  {
    label: 'Quote',
    text: '“',
    class: 'text-lg leading-none',
    run: (c) => c.toggleBlockquote(),
    active: ['blockquote']
  },
  {
    label: 'Code',
    text: '</>',
    class: 'font-mono text-xs',
    run: (c) => c.toggleCodeBlock(),
    active: ['codeBlock']
  }
]

function apply(tool: Tool) {
  if (editor.value) tool.run(editor.value.chain().focus()).run()
}

function setLink() {
  if (!editor.value) return
  const previous = editor.value.getAttributes('link').href as string | undefined
  const url = window.prompt('Link address', previous ?? 'https://')?.trim()
  if (url === undefined) return
  const chain = editor.value.chain().focus().extendMarkRange('link')
  if (url === '' || url === 'https://') {
    chain.unsetLink().run()
  } else if (editor.value.state.selection.empty && !previous) {
    chain
      .insertContent({ type: 'text', text: url, marks: [{ type: 'link', attrs: { href: url } }] })
      .run()
  } else {
    chain.setLink({ href: url }).run()
  }
}

function clearMarkdown() {
  editor.value?.commands.clearContent()
}
defineExpose({
  clearMarkdown
})
</script>

<template>
  <div>
    <div v-if="props.label" :id="labelId" class="text-sm font-medium mb-1.5">{{ props.label }}</div>
    <!-- To be accessible, the alert role element must be present in the DOM before an alert is triggered -->
    <!-- A browser is notified of an alert when its contents change (assistive technologies are subsequently informed of the alert) -->
    <ValidationError>{{ validationError }}</ValidationError>
    <div class="rounded-field border border-base-300 bg-base-100 focus-within:border-accent">
      <div
        v-if="editor"
        role="toolbar"
        aria-label="Formatting"
        class="flex flex-wrap gap-0.5 border-b border-base-300 p-1"
      >
        <button
          v-for="tool in tools"
          :key="tool.label"
          type="button"
          class="h-8 min-w-8 rounded px-1.5 text-sm hover:bg-base-200"
          :class="[tool.class, { 'bg-mint-soft text-accent': editor.isActive(...tool.active) }]"
          :title="tool.label"
          :aria-label="tool.label"
          :aria-pressed="editor.isActive(...tool.active)"
          @mousedown.prevent
          @click="apply(tool)"
        >
          {{ tool.text }}
        </button>
        <button
          type="button"
          class="h-8 min-w-8 rounded px-1.5 text-sm underline hover:bg-base-200"
          :class="{ 'bg-mint-soft text-accent': editor.isActive('link') }"
          title="Link"
          aria-label="Link"
          :aria-pressed="editor.isActive('link')"
          @mousedown.prevent
          @click="setLink"
        >
          Link
        </button>
      </div>
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>
