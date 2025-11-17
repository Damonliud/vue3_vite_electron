import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const relatedExcelData = ref({})

  function setRelatedExcelData(data) {
    relatedExcelData.value = { ...data }
  }

  const quarterExcelData = ref({})

  function setQuarterExcelData(data) {
    quarterExcelData.value = { ...data }
  }

  return {
    relatedExcelData,
    setRelatedExcelData,
    quarterExcelData,
    setQuarterExcelData,
  }
})
