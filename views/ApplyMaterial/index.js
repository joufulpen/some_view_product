// {
//   "text": "编辑",
//   "size": "mini",
//   "icon": "el-icon-edit",
//   "disabled": true,
//   "controlDisable": "single",
//   "key": "edit-btn"
// },

function passSelection({
  to,
  data
}) {
  // console.log('parent--passSelection', to);
  document.getElementById(to).contentWindow.postMessage({
    method: 'alertData',
    args: data
  }, '*')
  vm.dialogs[1].visible = !vm.dialogs[1].visible
}

function postSelection(args, source) {
  // console.log(5,'postSelection',args,source)
  let data = vm.currentSelected
  source.postMessage({
    method: 'passSelection',
    args: {
      data: data,
      to: args.to
    }
  }, '*')
}

var resourceName = 'ApplyPlan' //资源名称 模板生成
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    // uniqueDeployKeyURL为前端已定义的变量 面的EmployeeInfo为后端模板生成的文件变量名 后面的为固定格式 需模板生成
    uniqueDeployKey: {
      api: apiDict[apiName] + resourceName
    },
    // axiosSetting 固定格式 需模板生成生成
    axiosSetting: {
      baseURL: apiDict[apiName],
    },
    // cool-single-dialog组件的json文件名以及它的api名称 uniqueKeyURL为前端已定义的变量 后面的EmployeeInfo为后端模板生成的文件变量名
    isMethods: {
      isGetCondition: false,
      isTableSelectionChange: true,
      isPaginationCurrentChange: true,
      isPaginationSizeChange: true

    },
    // 弹出框 固定格式 里面的值可按以下定义 需模板生成
    dialogs: [{
      top: '3vh',
      name: 'dialog1',
      visible: false,
      collapse: false,
      fullscreen: false,
      width: '90%',
      title: '',
      src: '',
      showSaveButton: true,
      saveBtnDisabled: true
    }, {
      top: '3vh',
      name: 'dialog2',
      visible: false,
      collapse: false,
      fullscreen: false,
      showSaveButton: true,
      width: '90%',
      title: '',
      src: '',
      showSaveButton: true,
    }],

    //cool-single-dialog
    uniqueKey: apiDict[apiName] + resourceName,
    // 是否显示cool-single-dialog组件 默认值固定为false 需模板生成
    dialogVisible: false,
    isDialogMethods: {
      isUpdateForm: false,
      isSaveEvent: false,
    },
    currentSelected: [],
    condition: [],
    page: 1,
    size: 10
  },
  mounted() {
    axiosDict['basic'].get(`Employee/GetList?condition=[]`)
      .then(res => {
        this.$refs.masterView.queryCondition.ReceivingPerson.options = res.map(p => ({
          value: p.id,
          label: p.name
        }))
      })

    axiosDict['basic'].get(`BaseProperty/GetList?condition=[{"FieldName":"Type","TableName":"[BaseProperty]","Value":[{"value":"领料原因"}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
      .then(res => {
        console.log('获取领料原因', res);
        this.$refs.masterView.queryCondition.ReceivingReason.options = res.map(p => ({
          value: p.name
        }))
      })
    if (window.location.hash.split('#').find(p => p == 'beingSelectedPage')) this.$refs.masterView.buttons = this.$refs.masterView.buttons.splice(0, 2)
    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
    // if(window.location.hash.split('#')[2] == 'OutStore'){
    //   this.$refs.masterView.queryCondition.status.value = "待领料"
    //    this.$refs.masterView.queryCondition.status.mode = "等于"
    //    this.$refs.masterView.queryCondition.status.disabled = true
    //    this.condition.push({"FieldName":"status","TableName":"[ApplyMaterialHdr]","Value":[{"value":"待领料"}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"})
    //    this.$refs.masterView.query()
    // }
    if (window.location.hash.split('#')[3] == 'chooseFormno') {
      this.searchData()
      this.$refs.masterView.buttons = this.$refs.masterView.buttons.splice(0, 1)
    }
  },
  methods: {
    comfirm() {
      // delete this.currentSelected[0].status
      // this.currentSelected[0].active = true
      // this.currentSelected[0].recStatus = 1
      // axiosDict[apiName].get(`ApplyPlan/GetBill?formno=` + this.currentSelected[0].formno).then(res => {
      //   console.log(res)
      //   if (res) {
      //     res.hdr.active = true
      //     res.hdr.recStatus = 1
      //     axiosDict[apiName].post(`ApplyPlan/SaveBill`, res).then(data => {
      //       if (res) this.searchData()
      //     })
      //   }
      // })
      this.$confirm('此操作将对所选数据进行确认操作, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axiosDict[apiName].post(`ApplyPlan/CheckBill`, this.currentSelected[0])
          .then(res => {
            console.log('领料计划确认', res)
            this.searchData()
          })
      }).catch(()=>{})
    },
    //cool-single-view
    tableRowClick(arg) {
      console.log(arg)
      axiosDict[apiName].get('ApplyPlan/GetBill?formno=' + arg.formno).then(res => {
        console.log(res)
        this.$refs.masterView.dtlTableData[0].data = []
        res.dtls.forEach(p => {
          this.$refs.masterView.dtlTableData[0].data.push(p)
        })
      })
      // this.$refs.masterView.$refs.table.$refs.table.$refs.table.toggleRowSelection(arg)
    },
    tableRowDblclick(arg) {

    },
    tableSelectionChange(arg) {
      console.log(arg)
      this.currentSelected = arg
      if (arg.length == 1) {
        let btnList = ['编辑', '删除', '确认']
        for (let i in btnList) {
          if (this.$refs.masterView.buttons.find(p => p.text == btnList[i])) this.$refs.masterView.buttons.find(p => p.text == btnList[i]).disabled = arg[0].status !== '待确认'
        }
      }
    },
    paginationSizeChange(arg) {
      this.page = 1
      this.size = arg
      this.searchData()
    },
    paginationCurrentChange(arg) {
      this.page = arg
      this.searchData()
    },
    getCondition(arg) {
      console.log('getCondition', arg);
      // arg.push({"FieldName":"Tag","TableName":"[Dtl]","Value":[{"value":false}],"TableRelationMode":"AND","Mode":"为空","DataType":"boolean"})
      this.condition = arg
      this.page = 1
    },
    // cool-single-dialog
    updateForm(arg) {

    },
    saveEvent(arg) {

    },

    dialogSaveEvent() {
      console.log('Dialog1--dialogSaveEvent');
      let to = 'dialog1'
      let secondDialog = document.getElementById('dialog2')
      secondDialog.contentWindow.postMessage({
        method: 'postSelection',
        args: {
          to
        }
      }, '*')
    },
    dialogBackEvent() {
      console.log('Dialog1--dialogBackEvent');
      getDialog(this.dialogs,'dialog2').visible = false
    },
    searchData() {
      let theRestParams = [
        {"FieldName":"Tag","TableName":"[Dtl]","Value":[{"value":false}],"TableRelationMode":"AND","Mode":"为空","DataType":"boolean"}
        ]
      axiosDict[apiName].get(`ApplyPlan/GetHdrPageList?condition=${JSON.stringify(theRestParams.concat(this.condition))}&size=${JSON.stringify(this.size)}&page=${JSON.stringify(this.page)}`)
        .then(res => {
          this.$refs.masterView.hdrTableData.total = res.total
          this.$refs.masterView.hdrTableData.data = res.rows
          if (window.location.hash.split('#')[3] == 'chooseFormno') {
            // this.$refs.masterView.hdrTableData.data.map(item=>{
            //   if(item.status.trim() == '待确认' || item.status.trim() == '已完成') this.$refs.masterView.hdrTableData.data.splice(this.$refs.masterView.hdrTableData.data.indexOf(item), 1)
            // })
            // let copyData = JSON.parse(JSON.stringify(this.$refs.masterView.hdrTableData.data))
            // this.$refs.masterView.hdrTableData.data.map((item,index)=>{
            //     if(item.status && item.status == '待确认' || item.status == '已完成'){
            //       console.log(index,item.status)
            //      // this.$refs.masterView.hdrTableData.data.splice(index, 1)
            //      // delete this.$refs.masterView.hdrTableData.data[index]
            //      console.log(this.$refs.masterView.hdrTableData.data)
            //     }
            // })
            this.$refs.masterView.hdrTableData.data = this.$refs.masterView.hdrTableData.data.filter(item => item.status != '待确认' && item.status != '已完成')
            // arr = [{status:"待确认"},{status:"待确认"},{status:"待领取"},{status:"已完成"},{status:"待确认"},{status:"待确认"},{status:"待领取"}]
            // arr.forEach( function(item, index,arr2) {
            //   if(item.status == '待确认' || item.status == '已完成'){
            //     console.log(index,item.status)
            //     arr2.splice(index,1)
            //     console.log(arr2)
            //   }
            // });
            // this.$refs.masterView.hdrTableData.data
            console.log(this.$refs.masterView.hdrTableData.data)
            // this.$refs.masterView.hdrTableData.total = this.$refs.masterView.hdrTableData.data.length
          }
        })
    },
    newData() {
      this.dialogs[0].title = `领料计划`
      this.dialogs[0].src = `../ApplyMaterial-maintenance/index.html#${token}##new`
      getDialog(this.dialogs,'dialog1').visible = true
    },
    editData() {
      this.dialogs[0].title = `领料计划`
      this.dialogs[0].src = `../ApplyMaterial-maintenance/index.html#${token}#${this.currentSelected[0].formno}#edit`
      getDialog(this.dialogs,'dialog1').visible = true
    },
    checkData() {
      this.dialogs[0].title = `领料计划`
      this.dialogs[0].src = `../ApplyMaterial-maintenance/index.html#${token}#${this.currentSelected[0].formno}#check`
      getDialog(this.dialogs,'dialog1').visible = true
    },
    deleteData() {
      this.$confirm('此操作将删除所选数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // axios({
        //   method: "delete",
        //   url: this.uniqueDeployKey.api,
        //   data: this.isCurrentData
        // })
        this.currentSelected[0].recStatus = '2'
        axiosDict[apiName].delete(`ApplyPlan`, {
            data: this.currentSelected[0]
          })
          .then(res => {
            console.log(res)
            if (res) this.searchData()
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          duration: 1000
        });
      });
    },
    dialogSaveEvent() {
      if (this.dialogs.find(p => p.name == 'dialog1').visible == true) {
        if (this.dialogs.find(p => p.name == 'dialog2').visible == true) {
          // console.log(document.getElementById('dialog2').contentWindow);
          let to = 'dialog1'
          let secondDialog = document.getElementById('dialog2')
          secondDialog.contentWindow.postMessage({
            method: 'postSelection',
            args: {
              to
            }
          }, '*')
        } else {
          document.getElementById('dialog1').contentWindow.vm.updateFullPage()
        }
      }
    },
    dialogBackEvent() {
      if (this.dialogs.find(p => p.name == 'dialog1').visible == true) {
        return this.dialogs.find(p => p.name == 'dialog2').visible == true ? getDialog(this.dialogs,'dialog2').visible = !getDialog(this.dialogs,'dialog2').visible : getDialog(this.dialogs,'dialog1').visible = !getDialog(this.dialogs,'dialog1').visible
      }
    },
  }
})
