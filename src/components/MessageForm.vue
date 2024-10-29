<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { MessageType } from '@/types'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    buttonText?: string
  }>(),
  {
    label: 'Write a comment',
    buttonText: 'Comment'
  }
)

const koreroStore = useKoreroStore()

const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)
const message = ref('')
const validationError = ref('')

async function postMessage() {
  validationError.value = ''
  if (!message.value) {
    validationError.value = 'A message is required'
    return
  }
  if (!koreroStore.currentConversation) {
    console.log('No current conversation')
    return
  }
  await koreroStore.createMessage({
    conversationId: koreroStore.currentConversation.id,
    type: MessageType.COMMENT,
    text: message.value,
    editHistory: []
  })
  message.value = ''
  editor.value?.clearMarkdown()
}
</script>

<template>
  <ToastUiEditor
    @updateValue="(t) => (message = t)"
    :label="props.label"
    height="auto"
    initialEditType="markdown"
    ref="editor"
    :validationError="validationError"
  />
  <button @click="postMessage" class="btn justify-self-start">{{ buttonText }}</button>
</template>

<style scoped></style>
