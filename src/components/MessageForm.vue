<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { MessageType } from '@/types'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'Write a comment'
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
    text: message.value
  })
  message.value = ''
  editor.value?.clearMarkdown()
}
</script>

<template>
  <div class="pt-8">
    <ToastUiEditor
      @updateValue="(t) => (message = t)"
      :label="props.label"
      height="auto"
      initialEditType="markdown"
      ref="editor"
      :validationError="validationError"
    />
    <button @click="postMessage" class="btn mt-4">Comment</button>
  </div>
</template>

<style scoped></style>
