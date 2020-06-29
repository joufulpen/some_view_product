//字段映射到列的关系表，格式为：字段名：列序号。如果改变列的位置，只需要修改这里的映射关系
var fieldMap = {
  name: "B",
  meterWeight: "C",
  length: "D",
  quantity: "G",
  colorNumber: "I",
  remark: "J"
};
//数据开始的行，第一行从1开始
var startRow = 5;

//导入的sheet的名称,也可以是个序号，第一个sheet从1开始
var sheetName = 0;

const RichText = XlsxPopulate.RichText

function readXLSx(file, callback) {
  let dtls = [];
  file.forEach(p => {
    var fileData = new Blob([p]);
    // A File object is a special kind of blob.
    XlsxPopulate.fromDataAsync(fileData)
      .then(function(workbook) {
        var sheet = workbook.sheet(sheetName);
        var row = startRow;

        while (true) {
          var item = {};
          for (var col in fieldMap) {
            var field = fieldMap[col] + row;

            var value = sheet.cell(field).value();
            item[col] = value instanceof RichText ? value.text() : value;
          }
          //结束标记，当产品编号的内容是空白的，就跳出读取程序
          if (item["name"] == "" || item["name"] == undefined || item["name"].replace(/\s*/g, "") == '合计')
            break;
          dtls.push(item);
          row++;
        }
        callback(dtls);
      });
  })

  // var fileData = new Blob([file]);
  // var dtls = [];
  // // A File object is a special kind of blob.
  // XlsxPopulate.fromDataAsync(fileData)
  //   .then(function(workbook) {
  //     var sheet = workbook.sheet(sheetName);
  //     var row = startRow;
  //
  //     while (true) {
  //       var item = {};
  //       for (var col in fieldMap) {
  //         var field = fieldMap[col] + row;
  //
  //         var value = sheet.cell(field).value();
  //         item[col] = value instanceof RichText ? value.text() : value;
  //       }
  //       //结束标记，当产品编号的内容是空白的，就跳出读取程序
  //       if (item["name"] == "" || item["name"] == undefined || item["name"].replace(/\s*/g, "") == '合计')
  //         break;
  //       dtls.push(item);
  //       row++;
  //     }
  //     callback(dtls);
  //   });
}

function postSelection(args, source) {
  // console.log(5,'postSelection',args,source)
  let data = {
    data: vm.selectionData,
    closeDialog: true,
  }
  source.postMessage({
    method: 'passSelection',
    args: {
      data: data,
      to: args.to
    }
  }, '*')
}

id = decodeURIComponent(id)
var resourceName = 'Aluminium' //资源名称 模板生成
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    searchPanelWidth: 'auto',
    searchConditions: {
      name: {
        text: '名称',
        value: []
      },
      // buildingName: { text: '建筑名称', value: [] },
      // level: { text: '楼层', value: [] },
      // apartmentNumber: { text: '房间号', value: [] },
      // windowCode: { text: '窗号', value: [] },
      // fissionsCode: { text: '窗型号', value: [] },
      colorNumber: {
        text: '色号',
        value: []
      },
      // type: { text: '零部件类型', value: [] },
      // techSheetNumber: { text: '工艺单号', value: [] },
    },
    // uniqueDeployKeyURL为前端已定义的变量 面的EmployeeInfo为后端模板生成的文件变量名 后面的为固定格式 需模板生成
    uniqueDeployKey: {
      api: apiDict[apiName] + resourceName,
    },
    // axiosSetting 固定格式 需模板生成生成
    axiosSetting: {
      baseURL: apiDict[apiName],
    },
    // cool-single-dialog组件的json文件名以及它的api名称 uniqueKeyURL为前端已定义的变量 后面的EmployeeInfo为后端模板生成的文件变量名
    isMethods: {
      isGetCondition: false,
      isTableSelectionChange: false,
      isPaginationSizeChange: true,
      isPaginationCurrentChange: true
    },
    showModeList: true,
    // 弹出框 固定格式 里面的值可按以下定义 需模板生成
    dialogs: [{
      top: '5vh',
      name: 'dialog',
      visible: false,
      collapse: false,
      width: '90%',
      title: '',
      src: '',
    }, ],
    action: apiDict[apiName] + 'Part/Analyze',
    saveURL: apiDict[apiName] + 'Part/Import',
    visible: false,
    visible2: false,
    //cool-single-dialog
    uniqueKey: apiDict[apiName] + resourceName,
    // 是否显示cool-single-dialog组件 默认值固定为false 需模板生成
    dialogVisible: false,
    isDialogMethods: {
      isUpdateForm: false,
      isSaveEvent: true,
    },
    currentPage: 1,
    pageSize: 10,
    allData: [],
    fileList: [],
    headers: {
      'cool-token': window.token,
    },
    selectionData: null,
    dataTemplate: {}
  },
  computed: {
    options() {
      return Object.keys(this.searchConditions)
        .map(key => ({
          key,
          value: this.allData.map(part => part[key]).filter((v, i, a) => a.indexOf(v) === i)
        }))
        .reduce((acc, cur) => {
          acc[cur.key] = cur.value
          return acc
        }, {})
    },
    filteredParts() {
      return this.allData.filter(part =>
        Object.keys(this.searchConditions).every(key => this.searchConditions[key].value.length == 0 || this.searchConditions[key].value.includes(part[key]))
      )
    },
    pagedParts() {
      return this.filteredParts.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage)
    },
  },
  mounted() {
    this.$refs.singleView.singleTableData.columns.find(p => p.label == '重量').formatter = row => {
      return (row.length * row.meterWeight * row.quantity).toFixed(2)
    }
    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
    // 进来查询数据
    this.search()
    if (window.location.hash.split('#')[4] == 'apply') {
      this.$refs.singleView.buttons = [{
        text: '查询',
        size: 'mini',
        icon: '#iconchaxun',
        disabled: false,
        controlDisable: '',
        key: 'looking',
      }, ]
    // } else this.$refs.singleView.queryCondition = {}
    }
    this.$refs.singleView.queryCondition = {}
    this.getNewItem()
  },
  watch: {
    allData(arg) {
      let disabled = location.hash.split('#').find(p=>decodeURIComponent(p) == '拆单处理') ? false : true
      if (this.$refs.singleView.buttons.find(item => item.text == '保存'))
        this.$refs.singleView.buttons.find(item => item.text == '保存').disabled = arg.length == 0 || disabled
    },
    filteredParts(arg) {
      this.$refs.singleView.singleTableData.total = arg.length
    },
    pagedParts(arg) {
      this.$refs.singleView.singleTableData.data = arg
    },
  },
  methods: {
    // 多加显示一个总重量，等于长度*米重
    getNewItem() {
      axiosDict[apiName].get(`Aluminium/NewItem`)
        .then(res => {
          let template = JSON.parse(JSON.stringify(res))
          delete template.guid
          template['parentID'] = id
          this.dataTemplate = template
        })
    },
    customSave() {
      axiosDict[apiName].post(`Aluminium/Import`, {parentID: id, items: this.allData})
        .then(res => {
          console.log(res)
          if (res) {
            Vue.prototype.$notify.success({
              title: '保存成功',
              message: '保存成功',
              duration: 3000,
            })
            this.search()
          }
        })
      // axiosDict[apiName].post(this.saveURL, this.allData).then(res => {
      //   console.log(res)
      //   if (res) {
      //     Vue.prototype.$notify.success({
      //       title: '保存成功',
      //       message: '保存成功',
      //       duration: 3000,
      //     })
      //   }
      // })
    },
    customImport() {
      this.visible = true
    },
    customImport2() {
      this.visible2 = true
    },
    uploadChanged(_, fileList) {
      this.parts = []
      fileList.forEach(file => this.processFile(file, fileList))
    },
    processFile(file, fileList) {
      this.$loading().visible = true
      window.XlsxPopulate.fromDataAsync(file.raw)
        .catch(error => {
          Vue.prototype.$alert(`读取文件 ${file.name} 失败，请确认是xlsx格式`, error)
          fileList.splice(fileList.indexOf(file), 1)
        })
        .then(workbook => {
          if (workbook === undefined || workbook === null) return
          let parts = []
          workbook
            .sheets()
            .filter(
              sheet =>
              sheet
              .cell('H3')
              .value()
              .toString() === id
            )
            .forEach(sheet => {
              // 读取建筑、楼层、房间
            })
          if (parts.length === 0) {
            this.$message.error('读取失败，没有找到对应的数据')
            fileList.splice(fileList.indexOf(file), 1)
          } else this.parts = this.parts.concat(parts)
        })
        .catch(error => {
          Vue.prototype.$alert(`读取文件 ${file.name} 失败，请确认单元格内容`, error)
          fileList.splice(fileList.indexOf(file), 1)
        })
        .finally(() => (this.$loading().visible = false))
    },
    onChange(file, fileList) {
      console.log(file, fileList)
      // if (fileList.length > 1) fileList.splice(0, 1)
      this.fileList = fileList
    },
    templateDownload() {
      saveAs('./static/铝材物料导入模板.xlsx','铝材物料导入模板')
    },
    btnImportClick() {
      console.log(this.fileList);
      let fileList = this.fileList.map(p=> p.raw)
      readXLSx(fileList, function(rows) {
        //这里是结果，另外程序处理
        console.debug(rows);
        vm.handleImport(rows)
      });
    },
    handleImport(importData) {
      // setTimeout(() => {
        let allData = importData.map(p => {
          return p = Object.assign(JSON.parse(JSON.stringify(this.dataTemplate)), JSON.parse(JSON.stringify(p)))
        })
        this.allData = allData
        // let filterData = []
        // filterData = this.allData.filter(p => (p.id.length == 0))
        // let newImportData = importData.map(p => {
        //   return p = Object.assign(JSON.parse(JSON.stringify(this.dataTemplate)), JSON.parse(JSON.stringify(p)))
        // })
        // filterData = filterData.concat(newImportData)
        //
        // let combineData = []
        // for(let i = 0;i<filterData.length;i++) {
        //   if(!combineData.find(p=> (JSON.stringify(p) == JSON.stringify(filterData[i])))) {
        //     combineData.push(filterData[i])
        //   }
        // }
        // this.allData = combineData

        this.currentPage = 1
        this.paginationCurrentChange(this.currentPage)
        this.fileList = []
        this.close()
      // }, 500)
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    close() {
      this.visible = false
    },
    search() {
      //
      let param
      // if (window.location.hash.split('#')[4] == 'apply') {
      //   let condition = [{
      //       FieldName: 'ParentID',
      //       TableName: '[Part]',
      //       Value: [{
      //         value: id
      //       }],
      //       TableRelationMode: 'AND',
      //       Mode: '等于',
      //       DataType: 'string'
      //     },
      //     {
      //       FieldName: 'type',
      //       TableName: '[Part]',
      //       Value: [{
      //         value: '玻璃'
      //       }, {
      //         value: '铝板'
      //       }, {
      //         value: '折弯铝板'
      //       }],
      //       TableRelationMode: 'AND',
      //       Mode: '包括',
      //       DataType: 'string',
      //     },
      //   ]
      //   let allCondition = condition.concat(this.$refs.singleView.condition)
      //   console.log(allCondition)
      //   param = {
      //     condition: JSON.stringify(allCondition),
      //   }
      // } else {
        param = {
          condition: JSON.stringify([{
            FieldName: 'ParentID',
            TableName: '[InfoTable]',
            Value: [{
              value: id
            }],
            TableRelationMode: 'AND',
            Mode: '等于',
            DataType: 'string'
          }, ]),
        }
      // }
      axiosDict[apiName]
        .get(this.uniqueDeployKey.api + '/GetList', {
          params: param,
        })
        .then(res => {
          console.log(res)
          if (res) {
            this.allData = res
          }
        })
    },
    customDelete() {
      this.selectionData.forEach(p => {
        this.allData.splice(this.allData.indexOf(p), 1)
      })
      //this.showData(this.allData, this.pageSize, this.currentPage)
      this.$message.success('删除成功')
    },
    customEdit() {
      //将选中编辑数据映射到表单
      this.$refs.singleDialog.formItems.form.forEach(item => {
        for (let i in this.selectionData[0]) {
          if (i == item.name) {
            item.value = this.selectionData[0][i]
          }
        }
      })
      this.$refs.singleDialog.closeClicked()
    },
    //cool-single-view
    tableRowClick(arg) {},
    tableRowDblclick(arg) {},
    tableSelectionChange(arg) {
      this.selectionData = []
      if (arg.length != 0)
        arg.map(item => {
          this.selectionData.push(item)
        })
    },
    paginationSizeChange(arg) {
      console.log(arg)
      this.currentPage = 1
      this.pageSize = arg
      //this.showData(this.allData, this.pageSize, this.currentPage)
    },
    paginationCurrentChange(arg) {
      this.currentPage = arg
      console.log(this.currentPage, this.pageSize)
      //this.showData(this.allData, this.pageSize, this.currentPage)
    },
    getCondition(arg) {},
    // cool-single-dialog
    updateForm(arg) {},
    saveEvent(arg) {
      console.log(this.$refs.singleDialog.formItemsData, this.selectionData[0])
      this.selectionData[0] = Object.assign(this.selectionData[0], this.$refs.singleDialog.formItemsData)
      // Object.assign( this.allData[currentDataIndex],this.$refs.singleDialog.formItemsData)
      // console.log(currentDataIndex)
      // this.allData[currentDataIndex] = Object.assign( this.allData[currentDataIndex],this.$refs.singleDialog.formItemsData)
      this.$refs.singleDialog.backEvent()
      this.$refs.singleView.hdrClearSelectionOuter()
    },
  },
})
