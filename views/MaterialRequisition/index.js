function passSelection({ to, data }) {
  console.log(data)
    document.getElementById(to).contentWindow.postMessage({ method: 'alertData', args: data }, '*')
    if(vm.dialogs[0].title == '选择领料计划单号'){
      if(data.length == 1){
        vm.applyFormItems.form.find(p=>p.name == 'pFormno').value = data[0].formno
        vm.hasChooseFormno = data[0].formno
        // vm.coolFormData = Object.assign(vm.coolFormData,{orderNo:data[0].pFormno})
        console.log(vm.applyFormItems.form.find(p=>p.name == 'pFormno').value,)
        vm.orderNo = data[0].pFormno
        vm.inTableData = []
        vm.dialogs[0].visible = !vm.dialogs[0].visible
      }else{
        vm.$message('抱歉 只能选一条数据')
      }
    }else{
      if(data.hasOwnProperty('closeDialog') && to == 'dialog'){

       // let filterData = data.data.filter(a => !vm.inTableData.map(b => b.guid).includes(a.guid)).map(a => { return a })
       data.data.map(item=>{
        // axiosDict[apiName].get(vm.uniqueKey + '/NewDtl').then(res=>{
          // console.log(res)
          // if(res){
            let copyData = JSON.parse(JSON.stringify(vm.newDtlItem))  
            delete item.guid
            delete item.ts
            item.qty = item.leave
            item.formno = ''
            let newData = Object.assign(copyData,item)
            newData.parentSn = newData.sn
            newData.sn = null
            vm.inTableData.push(newData)
          // }
        // })
        })
       setTimeout(()=>{ vm.dialogs[0].visible = !vm.dialogs[0].visible },500)
      }
    }
  }

function getSelection({ from, to }) {
    document.getElementById(from).contentWindow.postMessage({ method: 'postSelection', args: { to } }, '*')
}

var resourceName = 'ApplyMaterial'//资源名称 模板生成
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    // uniqueDeployKeyURL为前端已定义的变量 面的EmployeeInfo为后端模板生成的文件变量名 后面的为固定格式 需模板生成
     uniqueDeployKey:{
      api: apiDict[apiName] + resourceName
     },
     // axiosSetting 固定格式 需模板生成生成
     axiosSetting:{
        baseURL:apiDict[apiName],
      },
      // cool-single-dialog组件的json文件名以及它的api名称 uniqueKeyURL为前端已定义的变量 后面的EmployeeInfo为后端模板生成的文件变量名
     isMethods:{
      isGetCondition:false,
      isTableSelectionChange:false,
     },
     showModeList:true,
      // 弹出框 固定格式 里面的值可按以下定义 需模板生成
     dialogs: [{
          top: '5vh',
          name: 'dialog',
          visible: false,
          collapse: false,
          width: '90%',
          title: '',
          src: '',
          showSaveButton:true
        }
      ],
     //cool-single-dialog
     uniqueKey: apiDict[apiName] + resourceName,
     // 是否显示cool-single-dialog组件 默认值固定为false 需模板生成
     dialogVisible:false,
     isDialogMethods:{
      isUpdateForm:false,
      isSaveEvent:false,
     },
     dialogTitle:'新增领料单',
     showSaveButton:true,
     dialogWidth:"1050px",
     labelWidth:'115px',
     applyFormItems:{
      form:[{
        "type": "input",
        "value": "",
        "label": "领料单号",
        "name": "formno",
        "readonly":true,
        "disabled":false,
        "style": {
          "width": "50%"
        }
      }, {
        "type": "select",
        "options":[],
        "value": "",
        "label": "出仓仓库",
        "name": "storeId",
        "readonly":false,
        "disabled":false,
        "style": {
          "width": "50%"
        },
          "rules": {
            "required": true,
            "message": "出仓仓库不能为空",
            "trigger": "change"
          }
      }, {
        "type": "mixInput",
        "value": "",
        "label": "领料计划单号",
        "name": "pFormno",
        "readonly":true,
        "disabled":false,
        "inputStyle":{
          "width":"193px"
        },
        "style": {
          "width": "50%"
        },
          "rules": {
            "required": true,
            "message": "领料计划单号不能为空",
            "trigger": "change"
          }
      }, {
        "type": "input",
        "value": "",
        "label": "备注",
        "name": "description",
        "readonly":false,
        "disabled":false,
        "style": {
          "width": "50%"
        }
      }]
     },
     coolFormData:{},
     orderNo:'',
     buttons:[{
        text: "选择明细",
        size: "mini",
        icon: "#iconxunze",
        disabled: false,
        type:"success"
      },{
        text: "移除",
        size: "mini",
        icon: "#iconERP_shanchu",
        disabled: true,
        type:"danger"
      }],
      selectionData:[],
      alreadyDelData:[],
      inTableData:[],
      coolFormItems:{
      form:[{
        "type": "input",
        "inputStyle":{"width":"158px"},
        "value": "",
        "label": "编码",
        "disabled":false,
        "readonly":true,
        "name": "code",
        "style": {
          "width": "28%"
        }
      },{
        "type": "inputNumber",
        "inputStyle":{"width":"100px"},
        "value": "",
        "label": "本次领取数量",
        "min":0,
        "disabled":false,
        "name": "qty",
        "style": {
          "width": "28%"
        }
      },
      {
        "type": "input",
        "value": "",
        "label": "备注",
        "inputStyle":{"width":"100px"},
        "disabled":false,
        "name": "description",
        "style": {
          "width": "28%"
        }
      }
      ],
      additionButtons:{
        "style": {
          "width": "10%",
          "margin-bottom":"0px"
        },
        "buttons": [
          {
            "text": "确定",
            "size": "mini",
            "type":"success",
            "disabled": true,
            "key": "submit"
          }
        ]
      }
    },
    coolLabelWidth:'100px',
    addTableData:{},
    columns:[{
          "type": "selection",
          "width": '55px'
        },
        {
          "prop": "code",
          "label": "编号"
        }
        ,
        {
          "prop": "codeName",
          "label": "名称"
        }
        ,
         {
          "prop":"specifications",
          "label":"规格"
        },
        {
          "prop": "leave",
          "label": "待领取数量"
        },
        {
          "prop": "qty",
          "label": "本次领取数量"
        },
        {
          "prop": "description",
          "label": "备注"
        }
        ],
    rowDblclickData:{},
    tableHeight:'300px',
    stripe:true,
    selectData:[],
    isEdit:false,
    hdrNewItem:{},
    allData:[],
    isCheck:false,
    hasChooseFormno:'',
    newDtlItemd:{}
  },
  watch:{
    isCheck(arg){
      this.applyFormItems.form.map(item=>item.disabled = arg)
      this.coolFormItems.form.map(item=>item.disabled = arg)
      this.buttons.find(p=>p.text == '选择明细').disabled = arg
    },
    rowDblclickData(arg){
      this.coolFormItems.additionButtons.buttons[0].disabled = arg == null
    }
  },
  mounted() {
    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
    axiosDict[apiName].get(this.uniqueKey + '/NewDtl').then(res=>{
        this.newDtlItem =  res
        delete this.newDtlItem.guid
    })
  },
  methods: {
    chooseFormno(){
      this.dialogs[0].title = '选择领料计划单号'
      this.dialogs[0].src = `../ApplyMaterial/index.html#${token}#id#chooseFormno`
        setTimeout(() => {
          getDialog(this.dialogs,'dialog').visible = true
        }, 100)
    },
     dialogSaveEvent(){
        var to = 'dialog'
        let secondDialog = document.getElementById('dialog')
        console.log(secondDialog)
        secondDialog.contentWindow.postMessage({ method: 'postSelection', args: { to } }, '*')
      },
      dialogBackEvent(){
         getDialog(this.dialogs,'dialog').visible = false
      },
    rowDblclick(arg){

    },
    outSelection(arg){
        this.buttons.find(p=>p.text == '移除').disabled = arg.length === 0
        if(arg.length != 0){
          this.selectionData = []
          arg.map(item=>{
            this.selectionData.push(item)
          })
        }
      },
    outRowClick(arg){
        console.log(arg)
        this.rowClickData = arg
        if(arg){
        let i
        this.rowDblclickData = arg
        this.coolFormItems.form.map(item=>{
              for( i in arg){
                if(item.name == i){
                  item.value = arg[i]
                }
              }
            })
        for(let i in this.addTableData){
          this.addTableData[i] = arg[i]
        }
      }
      },
    submit(args){
        switch (args.currentTarget.textContent.trim()){
          case '确定':
          {
                this.keyupEnter()
                break
          }
        }
      },
      keyupEnter(arg){
              for(let i in this.addTableData){
                 this.rowDblclickData[i] = this.addTableData[i]
              }
              this.$refs.coolFormView.clearForm()
              this.$refs.coolFormView.validateForm()
              this.$refs.coolFormView.resetForm()
              this.rowDblclickData = null
      },
    assistantUpdateForm(arg){
        for(let i in arg){
          if(i === 'undefined' || i === 'id')delete arg[i]
        }
         console.log(arg)
         this.addTableData = arg
      },
    buttonClick(args){
        switch (args.currentTarget.textContent.trim()) {
          case '选择明细':
              {
                if(this.applyFormItems.form.find(p=>p.name == 'pFormno').value !== ''){
                  this.dialogs[0].title = '选择明细'
                  this.dialogs[0].src = `../chooseMaterial/index.html#${token}#id#${this.applyFormItems.form.find(p=>p.name == 'pFormno').value}#apply#alreadyChooseData=${window.encodeURIComponent(JSON.stringify(this.inTableData))}`
                    setTimeout(() => {
                      getDialog(this.dialogs,'dialog').visible = true
                    }, 100)
                  }else{
                    this.$message.warning('请先选择领料计划单号 谢谢')
                  }
                break
              }
          case '移除':
              {
                  this.selectionData.forEach(p => {
                    if(p.ts !== null){
                      p.recStatus = 2
                      p.deleted = true
                      this.alreadyDelData.push(p)
                    }
                    this.inTableData.splice(this.inTableData.indexOf(p), 1)
                  })
                 console.log(this.alreadyDelData)
                break;
              }
          default:
            break;
        }
      },
      masterUpdateForm(arg){
          this.coolFormData = arg
          console.log(this.coolFormData)
      },
      newCustom(){
        this.dialogVisible = true
        this.isEdit = false
        let newAxios = axios.create()
        newAxios.post(`${apiDict['warehouse']}store/hdr/queryList`,{condition:{hdr:[]}}).then(res=>{
          console.log(res)
          if(res.data.data.records)this.applyFormItems.form.find(p=>p.label == '出仓仓库').options = res.data.data.records.map(item=> { return {label:item.name,value:item.id}})
        })
        axiosDict[apiName].get(`ApplyMaterial/NewHdr`).then(res=>{
          console.log(res)
          this.hdrNewItem = res
        })
      },
      looking(){

      },
      //cool-single-view
      tableRowClick(arg){

      },
      tableRowDblclick(arg){

      },
      tableSelectionChange(arg){

      },
      paginationSizeChange(arg){

      },
      paginationCurrentChange(arg){

      },
      getCondition(arg){

      },
      // cool-single-dialog
      updateForm(arg){

      },
      saveEvent(arg){
         if(this.$refs.coolForm.validateForm()){
            if(this.inTableData.length){
              let allFormData = {}
              // 判断编辑还是新建
              this.coolFormData.orderNo = this.orderNo
              this.coolFormData.pFormno = this.hasChooseFormno
              allFormData = Object.assign(this.hdrNewItem,this.coolFormData)
              console.log(allFormData)
              let param
              this.inTableData.map(item=>{item.storeId = this.applyFormItems.form.find(p=>p.name=='storeId').value })
               param = { "hdr":allFormData,"dtls":this.inTableData}
              console.log(param)
               axiosDict[apiName].post(this.uniqueKey + '/SaveBill', param).then(res=>{
                console.log(res)
              if(res){
                // 新建 直接push进去表格数据中 感觉新建完的数据应该在第一条
                Vue.prototype.$notify.success({
                                title: '新增数据成功',
                                message: '新增数据成功',
                                duration: 2000,
                              })
                  this.$refs.masterView.hdrTableData.data.unshift(res)
                  allFormData = null
                  this.backEvent()
               }
              })
              }
            else{
              this.$message({
                          type: 'warning',
                          message: '必须输入单据明细',
                          duration: 1500
                      });
            }
          }
      },
      backEvent(){
          this.$refs.coolFormView.clearForm()
          this.$refs.coolFormView.resetForm()
          this.$refs.coolForm.clearForm()
          this.$refs.coolForm.resetForm()
          this.inTableData = []
          this.alreadyDelData = []
          this.rowClickData = null
          this.dialogVisible = false
          this.isCheck = false
      },
  }
})
