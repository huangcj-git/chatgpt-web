import { defineStore } from 'pinia'
import type { ChatSetting, SettingsState } from './helper'
import { defaultSetting, getLocalState, removeLocalState, setLocalState } from './helper'

export const useSettingStore = defineStore('setting-store', {
  state: (): SettingsState => getLocalState(),

  getters: {
    getChatSettingByUuid: (state: SettingsState) => (uuid: number) => {
      const defaultSetting = state.default
      const chatSetting = state.chatSettings.get(uuid)
      return { ...defaultSetting, ...chatSetting }
    },

    getDefaultChatSetting: (state: SettingsState) => () => {
      return state.default
    },
  },

  actions: {
    restoreDefaultChatSetting(uuid: number) {
      // 通过对象的扩展运算符 {...obj} 来实现深拷贝，防止修改默认设置时改变相关设置
      this.$state.chatSettings.set(uuid, { ...this.$state.default })
    },

    setCurrentChatSetting(uuid: number, settings: Partial<ChatSetting>) {
      const chatSet = { ...this.$state.chatSettings.get(uuid), ...settings }
      this.$state.chatSettings.set(<number> uuid, <ChatSetting> chatSet)
      this.recordState()
    },

    updateDefaultSetting(settings: Partial<ChatSetting>) {
      this.$state = { ...this.$state, ...settings }
      this.recordState()
    },

    resetSetting() {
      this.$state = defaultSetting()
      removeLocalState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
