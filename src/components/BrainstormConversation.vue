<script setup lang="ts">
import { ref, computed } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import { MessageType, type Brainstorm } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is a brainstorm
const brainstorm = koreroStore.currentConversation as Brainstorm

const newMessage = ref('')
const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)
async function postMessage() {
  if (!newMessage.value) {
    return
  }
  await koreroStore.createMessage({
    conversationId: brainstorm.id,
    type: MessageType.COMMENT,
    text: newMessage.value
  })
  newMessage.value = ''
  editor.value?.clearMarkdown()
}

const pastDue = computed(() => {
  if (new Date(brainstorm.due) < new Date()) {
    return true
  }
  return false
})

const canWrite = computed(() => {
  if (pastDue.value) {
    return true
  }
  for (const message of koreroStore.messages) {
    if (message.author === koreroStore.user.id) {
      return true
    }
  }
  return false
})
</script>

<template>
  <div class="border p-4">
    <ToastUiViewer :initialValue="brainstorm.message" />
  </div>

  <p v-if="pastDue">Was due on: {{ brainstorm.due }}</p>
  <p v-else>Due: {{ brainstorm.due }}</p>

  <!-- Start comment thread -->

  <div v-for="message in koreroStore.messages" :key="message.id" class="border p-4">
    <ToastUiViewer :initialValue="message.text" />
  </div>

  <div v-if="canWrite">
    <p v-if="pastDue">Add a comment</p>
    <p v-else>Add your brainstorm suggestion</p>
    <ToastUiEditor
      @updateValue="(t) => (newMessage = t)"
      height="auto"
      initialEditType="markdown"
      ref="editor"
    />
    <button
      @click="postMessage"
      class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
    >
      Post Message
    </button>
  </div>
</template>

<style></style>
