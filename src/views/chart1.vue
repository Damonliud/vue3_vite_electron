<template>
  <el-form
    ref="formRef"
    :inline="true"
    :model="formInline"
    class="demo-form-inline"
  >
    <el-form-item
      label="Quarter Related"
      prop="quarterRelated1"
      :rules="[{ required: true, message: 'Please Select', trigger: 'blur' }]"
    >
      <el-select
        v-model="formInline.quarterRelated1"
        placeholder="Please Select"
        clearable
      >
        <el-option
          v-for="i in quarterRelatedList"
          :key="i.label"
          :label="i.label"
          :value="i.label"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="Quarter Related"
      prop="quarterRelated2"
      :rules="[{ required: true, message: 'Please Select', trigger: 'blur' }]"
    >
      <el-select
        v-model="formInline.quarterRelated2"
        placeholder="Please Select"
        clearable
      >
        <el-option
          v-for="i in quarterRelatedList"
          :key="i.label"
          :label="i.label"
          :value="i.label"
        />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="submitForm(formRef)"
      >Query</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="exportChart">Export Chart</el-button>
    </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="exportData">Export Excel</el-button>
    </el-form-item>
  </el-form>
  <div
    id="myEcharts"
    :style="{ width: '100%', height: '300px' }"
  ></div>
      <el-row :gutter="20">
      <el-col
        :lg="{ span: 12 }"
        :md="{ span: 12 }"
        :sm="{ span: 24 }"
        :xs="{ span: 24 }"
        v-for="(table, key) in relatedExcelData"
        :key="key"
      >
        <el-table
          :data="table"
          show-summary
          :summary-method="getSummaries"
          style="margin-top: 20px"
        >
          <el-table-column :label="key">
            <el-table-column
              show-overflow-tooltip
              prop="project"
              label="Projects"
            />
            <el-table-column
              show-overflow-tooltip
              prop="pointsPerPrd"
              label="Points per PRD"
            />
            <el-table-column prop="cycleTime" label="Cycle Time (Day)" />
            <el-table-column prop="weight" label="Weight">
              <template v-slot="scope">
                <span>{{ `${(scope.row.weight * 100).toFixed(2)}%` }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="velocity" label="Velocity" />
            <el-table-column prop="weightedVelocity" label="Weighted Velocity">
              <template v-slot="scope">
                <span>{{ `${scope.row.weightedVelocity.toFixed(2)}` }}</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
</template>

<script setup>
import {  ref, watch, onActivated, onDeactivated } from 'vue'
import * as echarts from "echarts";
import { useCounterStore } from "../stores/counter"
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus'
import * as XLSX from "xlsx";

let store = useCounterStore()
const formRef = ref()
const xAxiData = ref([])
const seriesData = ref([])
let { quarterExcelData ,relatedExcelData } = storeToRefs(store)
const quarterRelatedList = ref([])
const formInline = ref({
  quarterRelated1: '',
  quarterRelated2: '',
})
const sumArr = ref([]);
const sheetData = ref([]);
const submitForm = async (formEl) => {
  if (Object.keys(relatedExcelData.value).length == 0) {
    ElMessage.error('请先导入Excel')
    return
  }
  await formEl.validate((valid, fields) => {
    if (valid) {
      xAxiData.value = [formInline.value.quarterRelated1, formInline.value.quarterRelated2]
      let quarterRelated1 = quarterRelatedList.value.find(i => i.label == formInline.value.quarterRelated1).value
      let quarterRelated2 = quarterRelatedList.value.find(i => i.label == formInline.value.quarterRelated2).value
      seriesData.value = [Number(quarterRelated1), Number(quarterRelated2)]
      updateChart(xAxiData.value, seriesData.value);
    } else {
      console.log('error submit!', fields)
    }
  })
}

watch(relatedExcelData, () => {
  formInline.value.quarterRelated1 = ''
  formInline.value.quarterRelated2 = ''
}, {
  deep: true,
  immediate: true
})

let myChart = null;

onActivated(() => {
  initChartInstance();
  if (Object.keys(relatedExcelData.value).length == 0) return
  quarterRelatedList.value = []
  for (const key in relatedExcelData.value) {
    let val = relatedExcelData.value[key]
    let sum = val.reduce((sum, cur) => sum + cur.weightedVelocity, 0)
    quarterRelatedList.value.push({ value: sum.toFixed(2), label: key })
  }
  if (quarterRelatedList.value.length > 0 && !formInline.value.quarterRelated1) {
    formInline.value.quarterRelated1 = formInline.value.quarterRelated1 || quarterRelatedList.value[0].label;
  }
  if (quarterRelatedList.value.length > 1 && !formInline.value.quarterRelated2) {
    formInline.value.quarterRelated2 = formInline.value.quarterRelated2 || quarterRelatedList.value[1].label;
  }
  let obj = Object.assign({}, quarterExcelData.value, relatedExcelData.value);
  formatSheetData(obj)
  submitForm(formRef.value)
});

onDeactivated(() => {
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }

  window.removeEventListener('resize', resizeChart);
});

let formatSheetData = (tableData) => {
  sheetData.value=[]
  for (const key in tableData) {
    let cycleTimeTotal = tableData[key].reduce((i, c) => i + c.cycleTime, 0)
    let weightedVelocityTotal = tableData[key].reduce((i, c) => i + c.weightedVelocity, 0)
    let formateTable = tableData[key].map(i => ({
      ...i,
        weight: `${(i.weight*100).toFixed(2)}%`,
        velocity: i.velocity.toFixed(2),
        weightedVelocity: i.weightedVelocity.toFixed(2)
      }))
    formateTable.push({
      project: 'Total',
      cycleTime: cycleTimeTotal,
      velocity: 'Final Velocity',
      weightedVelocity: weightedVelocityTotal.toFixed(2),
    })
    let sheetName = key
    let header = ["Projects","Points per PRD", "Cycle Time (Day)", "Weight", "Velocity", "Weighted Velocity"]
    let data = formateTable
    let keys = ["project", "pointsPerPrd", "cycleTime", "weight", "velocity", "weightedVelocity"]
    let sheetObj = {sheetName, header, data, keys}
    sheetData.value.push(sheetObj)
  }
};

const exportMultiSheetExcel = (sheetsData, fileName) => {
  const workbook = XLSX.utils.book_new();
  sheetsData.forEach((sheetConfig) => {
    const { sheetName, header, data, keys } = sheetConfig;
    const sheetDataFormatted = data.map((row) => {
      if (keys && keys.length > 0) {
        return keys.map((key) => row[key]);
      }
      return Object.values(row);
    });
    const finalSheetData = [header, ...sheetDataFormatted];
    const worksheet = XLSX.utils.aoa_to_sheet(finalSheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  try {
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    ElMessage.success("Excel 文件导出成功！");
  } catch (error) {
    console.error("Excel 文件导出失败:", error);
    ElMessage.error("Excel 文件导出失败，请重试！");
  }
};


const exportData = () => {
  exportMultiSheetExcel(sheetData.value, "Quarter Related Table");
};

function initChartInstance () {
  const chartDom = document.getElementById("myEcharts");
  if (chartDom) {
    myChart = echarts.init(chartDom);
    window.addEventListener('resize', resizeChart);
    updateChart(xAxiData.value, seriesData.value);
  } else {
    console.error("ECharts 容器 DOM 元素未找到！请检查HTML结构和ID。");
  }
}

function resizeChart () {
  if (myChart) {
    myChart.resize();
  }
}

function updateChart (xAxiData = [], seriesData = []) {
  if (!myChart) {
    console.error("ECharts 实例未初始化或已销毁！无法更新图表。");
    return;
  }
  let growthPercentageText = '';
  if (seriesData.length >= 2) {
    const firstValue = seriesData[0];
    const lastValue = seriesData[seriesData.length - 1];

    if (firstValue !== 0) { // 避免除以零
      const percentage = ((lastValue - firstValue) / firstValue) * 100;
      growthPercentageText = `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
      if (percentage === 0) {
        growthPercentageText = '持平 (0.00%)';
      }
    } else {
      growthPercentageText = lastValue > 0 ? '无限增长' : '0%';
    }
  }
  myChart.setOption({
    title: {
      subtext: `从 ${xAxiData[0]} 到 ${xAxiData[xAxiData.length - 1]} 的变化：${growthPercentageText}`, // 在副标题中显示
      left: 'center'
    },
    xAxis: {
      type: "category",
      data: xAxiData
    },
    tooltip: {
      trigger: "axis"
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        data: seriesData,
        type: "line",
        itemStyle : { normal: {label : {show: true}}}
      }
    ]
  });
}
  const getSummaries = (param) => {
    const { columns, data } = param;
    const sums = [];
    columns.forEach((column, index) => {
      if (index === 0) {
        sums[index] = "Total";
        return;
      }
      if (index === columns.length - 2) {
        sums[index] = "Final Velocity";
        return;
      }
      const prop = column.property;
      if (prop === "cycleTime" || prop === "weightedVelocity") {
        const values = data.map((item) => Number(item[column.property]));
        if (!values.every((value) => Number.isNaN(value))) {
          sums[index] = `${values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!Number.isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0)}`;
          if (prop === "cycleTime") {
            sumArr.value.push(sums[index]);
          }
          if (prop === "weightedVelocity") {
            sums[index] = Number(sums[index]).toFixed(2);
          }
        } else {
          sums[index] = "N/A";
        }
      }
    });
    return sums;
  };
const exportChart = () => {
  exportChartAsImage('png', 1, 'Quarter Related Chart');
}

const exportChartAsImage = (type = 'png', pixelRatio = 1, fileName = 'chart') => {
  if (!myChart) {
    ElMessage.error('图表未初始化，无法导出！');
    return;
  }

  try {
    const dataURL = myChart.getDataURL({
      type: type,
      pixelRatio: pixelRatio,
      backgroundColor: '#fff' // 设置背景色，避免透明背景问题
    });

    // 创建一个临时的 <a> 标签来触发下载
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `${fileName}.${type}`; // 设置下载文件名
    document.body.appendChild(a); // 必须添加到 DOM 中才能触发点击
    a.click(); // 模拟点击下载
    document.body.removeChild(a); // 下载后移除临时标签

    ElMessage.success(`图表导出为 ${type.toUpperCase()} 成功！`);
  } catch (error) {
    console.error('导出图表失败:', error);
    ElMessage.error(`导出图表为 ${type.toUpperCase()} 失败，请检查控制台。`);
  }
}
</script>

<style lang="scss" scoped>
.demo-form-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  .el-input {
    --el-input-width: 220px;
  }

  .el-select {
    --el-select-width: 220px;
  }
}
</style>
