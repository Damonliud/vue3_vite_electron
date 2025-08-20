<template>
  <div>
    <el-upload
      class="upload-demo"
      :on-change="handleUpload"
      accept="xls,xlsx"
      :auto-upload="false"
      :show-file-list="false"
      :multiple="true"  drag
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将文件拖到此处或 <em>点击上传</em></div>
    </el-upload>
    <el-button v-if="isShow" type="primary" @click="exportData" style="margin-top: 20px;">
      Export Excel
    </el-button>
    <el-row :gutter="20">
      <el-col
        :lg="{ span: 12 }"
        :md="{ span: 12 }"
        :sm="{ span: 24 }"
        :xs="{ span: 24 }"
        v-for="(table, key) in quarterTableData"
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
    <el-divider style="margin:20px 0 0 0;"></el-divider>
    <el-row :gutter="20">
      <el-col
        :lg="{ span: 12 }"
        :md="{ span: 12 }"
        :sm="{ span: 24 }"
        :xs="{ span: 24 }"
        v-for="(table, key) in tableData"
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
  </div>
</template>
<script setup>
  import { onMounted, ref, computed } from "vue";
  import * as XLSX from "xlsx";
  import { UploadFilled } from "@element-plus/icons-vue";
  import { useCounterStore } from "../stores/counter";
  import { storeToRefs } from "pinia";
  import { ElMessage } from "element-plus";
  const sheetData = ref([]);

  let isShow = computed(() => Object.keys(excelData.value).length != 0)

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
      let header = ["Projects", "Cycle Time (Day)", "Weight", "Velocity", "Weighted Velocity"]
      let data = formateTable
      let keys = ["project", "cycleTime", "weight", "velocity", "weightedVelocity"]
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

  let store = useCounterStore();
  let { excelData } = storeToRefs(store);
  let { setExcelData, setQuarterExcelData } = store;
  const tableData = ref([]);
  const quarterTableData = ref([]);
  const sumArr = ref([]);

  onMounted(() => {
    if (Object.keys(excelData.value).length == 0) return;
    tableData.value = excelData.value;
  });

  //读取excel文件
  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file.raw);
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = (e) => {
        reject(e);
      };
    });
  };

  const handleUpload = async (file) => {
    const data = await getXlsxData(file);
    let arr = translateField(data);
    tableData.value = groupAndCalculateMetrics(arr);
    setExcelData(tableData.value);

    quarterTableData.value = quarterGroupAndCalculateMetrics(arr);
    setQuarterExcelData(quarterTableData.value);

    let obj = Object.assign({}, quarterTableData.value, tableData.value);
    formatSheetData(obj)
  };

  const quarterGroupAndCalculateMetrics = (arr) => {
  	console.log('arr11:', arr)
    const groupedMap = new Map();
    arr.forEach((item) => {
      if (item.Quarter !== undefined) {
        const key = `Quarter_${item.Quarter}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, []);
        }
        groupedMap.get(key).push(item);
      } else {
        console.warn(
          "数据项缺少 'Quarter'字段，已跳过分组:",
          item
        );
      }
    });
    console.log('groupedMap:', groupedMap)
    const resultObject = {};
    for (const [key, subArray] of groupedMap.entries()) {
      const totalCycleTimeInSubArray = subArray.reduce((sum, item) => {
        const ct = Number(item.cycleTime);
        return sum + (isNaN(ct) ? 0 : ct);
      }, 0);
      console.log('totalCycleTimeInSubArray:', totalCycleTimeInSubArray)
      const processedSubArray = subArray.map((item) => {
        const newObject = { ...item };
        const currentCycleTime = Number(newObject.cycleTime);
        const currentVelocity = Number(newObject.velocity);
        if (totalCycleTimeInSubArray !== 0 && !isNaN(currentCycleTime)) {
          newObject.weight = currentCycleTime / totalCycleTimeInSubArray;
        } else {
          newObject.weight = 0;
        }
        if (!isNaN(newObject.weight) && !isNaN(currentVelocity)) {
          newObject.weightedVelocity = newObject.weight * currentVelocity;
        } else {
          newObject.weightedVelocity = 0;
        }
        return newObject;
      });
      resultObject[key] = processedSubArray;
    }
    console.log('resultObject:', resultObject)
    return resultObject;
  }

  //读取表格数据
  const getXlsxData = async (file) => {
    const dataBinary = await readFile(file);
    const workBook = XLSX.read(dataBinary);
    const workSheet = workBook.Sheets[workBook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(workSheet);
    return data;
  };

  //映射字段
  const translateField = (data) => {
    const arr = [];
    const cnToEn = {
      Projects: "project",
      "Cycle Time (Day)": "cycleTime",
      Velocity: "velocity",
      Quarter: "Quarter",
      "Related with": "Related",
    };
    data.forEach((item) => {
      const arrItem = {};
      Object.keys(item).forEach((key) => {
        arrItem[cnToEn[key]] = item[key];
      });
      arr.push(arrItem);
    });
    return arr;
  };

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

  function groupAndCalculateMetrics(flatArray) {
    const groupedMap = new Map();
    flatArray.forEach((item) => {
      if (item.Quarter !== undefined && item.Related !== undefined) {
        const key = `Quarter_${item.Quarter} Related_${item.Related}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, []);
        }
        groupedMap.get(key).push(item);
      } else {
        console.warn(
          "数据项缺少 'Quarter' 或 'Related' 字段，已跳过分组:",
          item
        );
      }
    });
    const resultObject = {};
    for (const [key, subArray] of groupedMap.entries()) {
      const totalCycleTimeInSubArray = subArray.reduce((sum, item) => {
        const ct = Number(item.cycleTime);
        return sum + (isNaN(ct) ? 0 : ct);
      }, 0);
      const processedSubArray = subArray.map((item) => {
        const newObject = { ...item };
        const currentCycleTime = Number(newObject.cycleTime);
        const currentVelocity = Number(newObject.velocity);
        if (totalCycleTimeInSubArray !== 0 && !isNaN(currentCycleTime)) {
          newObject.weight = currentCycleTime / totalCycleTimeInSubArray;
        } else {
          newObject.weight = 0;
        }
        if (!isNaN(newObject.weight) && !isNaN(currentVelocity)) {
          newObject.weightedVelocity = newObject.weight * currentVelocity;
        } else {
          newObject.weightedVelocity = 0;
        }
        return newObject;
      });
      resultObject[key] = processedSubArray;
    }
    return resultObject;
  }
</script>
