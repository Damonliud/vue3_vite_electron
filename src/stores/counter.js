import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const excelData = ref({})

  function setExcelData(data) {
    excelData.value = { ...data }
  }

  const quarterExcelData = ref({})

  function setQuarterExcelData(data) {
    quarterExcelData.value = { ...data }
  }

  return { excelData, setExcelData, quarterExcelData, setQuarterExcelData }
})
