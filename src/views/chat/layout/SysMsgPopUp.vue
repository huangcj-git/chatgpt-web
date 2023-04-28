<script setup lang='ts'>
import { NAutoComplete, NButton, NInput, NModal, NSpace, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { usePromptStore, useSettingStore } from '@/store'

interface Props {
  visible: boolean
  uuid: string
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const promptStore = usePromptStore()
const settingStore = useSettingStore()
const ms = useMessage()
const currentChatSetting = ref(settingStore.getChatSettingByUuid(+props.uuid))
const defaultChatSetting = settingStore.getDefaultChatSetting()
const minMessageLength = 15
const loading = ref(false)
const disabled = computed (() => loading.value)
const show = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

function setSystemMessage() {
  const message = currentChatSetting.value.systemMessage.trim()
  try {
    loading.value = true
    if (message.length > 1) {
      if (message.length > minMessageLength) {
        settingStore.setCurrentChatSetting(+props.uuid, { systemMessage: message, temperature: 0.7, top_p: 0.9 })
        ms.success(`New system message has been set to: ${message}`)
        show.value = false
      }
      else {
        ms.error(`The system message should be at least ${minMessageLength} characters.`)
      }
    }
    else {
      settingStore.restoreDefaultChatSetting(+props.uuid)
      currentChatSetting.value = defaultChatSetting
      ms.success('Reset system message to default.')
      show.value = false
    }
  }
  catch (error) {
    ms.error(`Eror occurred when setting system message: ${JSON.stringify(error)}`)
  }
  finally {
    loading.value = false
  }
}

function handlePress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    setSystemMessage()
  }
}

const searchOptions = computed(() => {
  if (currentChatSetting.value.systemMessage.startsWith('/')) {
    const { promptList: promptTemplate } = promptStore.getPromptList()
    return promptTemplate.filter((item: { key: string }) => item.key.toLowerCase().includes(currentChatSetting.value.substring(1).toLowerCase())).map((obj: { value: any }) => {
      return {
        label: obj.value,
        value: obj.value,
      }
    })
  }
  else {
    return []
  }
})

// value反渲染key
const renderOption = (option: { label: string }) => {
  const { promptList: promptTemplate } = promptStore.getPromptList()
  for (const i of promptTemplate) {
    if (i.value === option.label)
      return [i.key]
  }
  return []
}
</script>

<template>
  <NModal v-model:show="show" style="width: 90%; max-width: 600px;" preset="card">
    <div class="w-full max-w-screen-xl m-auto">
      <NSpace vertical>
        <span class="font-bold text-lg">Current System Message</span>
        <NAutoComplete v-model:value="currentChatSetting.systemMessage" :options="searchOptions" :render-label="renderOption">
          <template #default="{ handleInput, handleBlur, handleFocus }">
            <NInput
              v-model:value="currentChatSetting.systemMessage"
              type="textarea"
              :rows="6"
              placeholder="Leave empty to use default system message."
              @input="handleInput"
              @focus="handleFocus"
              @blur="handleBlur"
              @keypress="handlePress"
            />
          </template>
        </NAutoComplete>
      </NSpace>
      <div class="my-4" />
      <NSpace vertical>
        <span class="font-bold text-lg">Default System Message</span>
        <NInput
          v-model:value="defaultChatSetting.systemMessage"
          type="textarea"
          :rows="6"
          :disabled="true"
        />
      </NSpace>
      <NButton
        block
        type="primary"
        :disabled="disabled"
        :loading="loading"
        @click="setSystemMessage"
      >
        Confirm
      </NButton>
    </div>
  </NModal>
</template>
