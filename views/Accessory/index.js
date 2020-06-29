//字段映射到列的关系表，格式为：字段名：列序号。如果改变列的位置，只需要修改这里的映射关系
var fieldMap = {
  name: "B",
  category: "C",
  unit: "D",
  quantity: "E",
  remark: "H"
}
//数据开始的行，第一行从1开始
var startRow = 4;

//导入的sheet的名称,也可以是个序号，第一个sheet从1开始
var sheetName = 0;

const RichText = XlsxPopulate.RichText

function readXLSx(file) {
  var fileData = new Blob([file]);
  var dtls = []
  // var workShopDtls = []
  // var constructionSiteDtls = []
  // A File object is a special kind of blob.
  return XlsxPopulate.fromDataAsync(fileData)
    .then(function(workbook) {

      workbook.sheets().filter(sheet => sheet.cell('H2').value().toString() === '使用地：车间' || sheet.cell('H2').value().toString() === '使用地：工地').forEach(sheet => {
        console.log('uuuuu', sheet);
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
          if (sheet.cell('H2').value().toString() === '使用地：车间') {
            item.place = '车间'
            // workShopDtls.push(item);
            dtls.push(item)
          }
          if (sheet.cell('H2').value().toString() === '使用地：工地') {
            item.place = '工地'
            // constructionSiteDtls.push(item);
            dtls.push(item)
          }
          row++;
        }
      })
      return dtls
    });
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
var resourceName = 'Accessory' //资源名称 模板生成
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
      place: {
        text: '使用地',
        value: []
      }
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
    visible: false,
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
    importDialogLoading: false,
    dataTemplate: {},
    basicMaterialList: []
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
    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
    // 进来查询数据
    this.search()
    if (window.location.hash.split('#')[4] == 'apply') {
      this.$refs.singleView.buttons = []
      // } else this.$refs.singleView.queryCondition = {}
    }
    axiosDict['basic'].get(`Material/GetList?condition=[]`)
      .then(res => {
        console.log('获取物料基础资料', res);
        this.basicMaterialList = res
      })
    this.$refs.singleView.queryCondition = {}
    this.getNewItem()
  },
  watch: {
    allData(arg) {
      let disabled = location.hash.split('#').find(p => decodeURIComponent(p) == '拆单处理') ? false : true
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
    getNewItem() {
      axiosDict[apiName].get(`Accessory/NewItem`)
        .then(res => {
          let template = JSON.parse(JSON.stringify(res))
          delete template.guid
          template['parentID'] = id
          this.dataTemplate = template
        })
    },
    customSave() {
      axiosDict[apiName].post(`Accessory/Import`, {
          parentID: id,
          items: this.allData
        })
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
    },
    customImport() {
      this.visible = true
    },
    onChange(file, fileList) {
      console.log(file, fileList)
      if (fileList.length > 1) fileList.splice(0, 1)
      this.fileList = fileList
    },
    templateDownload() {
      saveAs('./static/配件物料导入模板.xlsx', '配件物料导入模板')
    },
    btnImportClick() {
      this.importDialogLoading = true
      var file = this.fileList[0].raw
      readXLSx(file).then(rows => {
        //这里是结果，另外程序处理
        console.debug(rows);
        vm.handleImport(rows)
      })
    },
    handleImport(importData) {
      setTimeout(() => {
        let allData = importData.map(p => {
          p.id = this.basicMaterialList.find(basic=>basic.name == p.name) ? this.basicMaterialList.find(basic=>basic.name == p.name).id : ""
          return p = Object.assign(JSON.parse(JSON.stringify(this.dataTemplate)), JSON.parse(JSON.stringify(p)))
        })
        this.allData = allData

        this.currentPage = 1
        this.paginationCurrentChange(this.currentPage)
        this.importDialogLoading = false
        this.close()
      }, 500)
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
      let param
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
    },
    paginationCurrentChange(arg) {
      this.currentPage = arg
      console.log(this.currentPage, this.pageSize)
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
