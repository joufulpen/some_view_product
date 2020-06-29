function passSelection({ to, data }) {
    console.log(1,'passSelection')
    document.getElementById(to).contentWindow.postMessage({ method: 'alertData', args: data }, '*')
    console.log(to,data)
      if(data.hasOwnProperty('closeDialog') && to == 'dialog'){
        let filterData = data.data.filter(a => !vm.inTableData.map(b => b.id).includes(a.id)).map(a => { return a })
        filterData.map(item=>{
          item.ts = null
          item.sourceSn = item.id
          vm.inTableData.push(item)
        })
        vm.dialogs[0].visible = !vm.dialogs[0].visible        
      }   
    }

   function getSelection({ from, to }) {
    console.log(2,'getSelection')
    document.getElementById(from).contentWindow.postMessage({ method: 'postSelection', args: { to } }, '*')
    }

var resourceName = 'ProductionPlan'//资源名称 模板生成
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
      isTableRowClick:true
     },
     showModeList:true,
      // 弹出框 固定格式 里面的值可按以下定义 需模板生成
     dialogs: [
      {
          top: '5vh',
          name: 'dialog',
          visible: false,
          collapse: false,
          width: '90%',
          title: '',
          src: '',
          saveBtnText:"确 认",
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
     dialogTitle:"编辑生产计划",
     showSaveButton:true,
     dialogWidth:"1050px",
     buttons:[{
        "text": "新增",
        "size": "mini",
        "type":"primary",
        "icon": "#iconxinzeng",
        "disabled": false
      },{
        "text": "删除",
        "size": "mini",
        "type":"danger",
        "icon": "#iconERP_shanchu",
        "disabled": true
      }],
     keyword:'',
     coolFormItems:{
      form:[{
        "type": "input",
        "value": "",
        "label": "数量",
        "disabled":false,
        "name": "qty",
        "style": {
          "width": "33.3%",
          "margin-bottom":"15px"
        }
      },{
        "type": "input",
        "value": "",
        "label": "备注",
        "disabled":false,
        "name": "description",
        "style": {
          "width": "33.3%",
          "margin-bottom":"15px"
        }
      },       
      ],
      additionButtons:
        {
        "type": "button",
        "style": {
          "width": "20%",
          "margin-left":"80px",
          "margin-bottom":"15px"
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
     coolLabelWidth:"100px",
     columns:[],
     inTableData:[],
     tableHeight:'500px',
     stripe:true,
     rowDblclickData:{},
     addTableData:{},
     selectionData:[],
     alreadyDelData:[],
     hdrSelectionData:[]

  },
  watch:{
    rowDblclickData(arg){
      this.coolFormItems.additionButtons.buttons[0].disabled = arg == null
    }
  },
  computed:{

  },
  mounted() {
    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
    this.columns = this.$refs.masterView.dtlTableData[0].columns

  },
  methods: {
      comfirm(){
        this.hdrSelectionData[0].recStatus = 1
        axiosDict[apiName].post('ProductionPlan/ConfirmPlan',this.hdrSelectionData[0]).then(res=>{
          console.log(res)
          if(res)this.$refs.masterView.query()
        })
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
      newEdit(){
        this.dialogVisible = true
        axiosDict[apiName].get(`ProductionPlan/GetPlanDetail?formno=${this.hdrSelectionData[0].formno}&condition=[]`).then(res=>{
          console.log(res)
          if(res){
            this.inTableData = []
            res.map(p=>this.inTableData.push(p))
          }
        })
      },
      rowDblclick(arg){
        this.rowDblclickData = arg
        this.coolFormItems.form.map(item=>{
          for(let i in arg){
            if(item.name == i)item.value = arg[i]
          }
        })
      },
      outSelection(arg){
        console.log(arg)
       this.buttons.find(p=> p.text == '删除').disabled = arg.length === 0
        if(arg.length != 0){
          this.selectionData = []
          arg.map(item=>{
            this.selectionData.push(item)
          })
        } 
      },
      outRowClick(){

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
      keyupEnter(){
        // this.inTableData[this.inTableData.indexOf(this.rowDblclickData)] = Object.assign( this.inTableData[this.inTableData.indexOf(this.rowDblclickData)],this.addTableData)
        // this.rowDblclickData  = Object.assign(this.rowDblclickData,this.addTableData)
        for(let i in this.addTableData){
         this.rowDblclickData[i] = this.addTableData[i]
      }
        this.$refs.coolFormView.clearForm()
        this.$refs.coolFormView.validateForm()
        this.$refs.coolFormView.resetForm()
        this.rowDblclickData = null
      },
      buttonClick(args){
         switch (args.currentTarget.textContent.trim()){
          case '新增':
              { 
                this.dialogs[0].title = '待排产产品表'              
                this.dialogs[0].src = `../ProductionScheduleWait/index.html#${token}#id#${this.dialogs[0].name}#ProductionPlan`
                setTimeout(() => {
                  getDialog(this.dialogs,'dialog').visible = true
                }, 100)
                break;
              }
          case '删除':
              {
                console.log(this.selectionData)
                this.selectionData.forEach(p => {
                    if(p.ts !== null){
                      p.recStatus = 2
                      p.deleted = true
                      this.alreadyDelData.push(p)
                    }   
                    this.inTableData.splice(this.inTableData.indexOf(p), 1)
                  })
                break;  
              }    
          default:
            break;
         }
      },
      backEvent(){
        this.alreadyDelData = []
        this.inTableData = []
        this.rowDblclickData = null
        this.dialogVisible = false
        this.$refs.coolFormView.resetForm()
        this.$refs.coolFormView.clearForm()
      },
      //cool-single-view 
      tableRowClick(arg){
      axiosDict[apiName].get(`ProductionPlan/GetPlanDetail?formno=${arg.formno}&condition=[]`).then(res=>{
          console.log(res)
          if(res){
            this.$refs.masterView.dtlTableData[0].data = []
            res.map(p=>this.$refs.masterView.dtlTableData[0].data.push(p))
          }
        })
      },
      tableRowDblclick(arg){
      
      },
      tableSelectionChange(arg){
        if(arg.length != 0){
          this.hdrSelectionData = arg
         if(arg.length == 1){
          this.$refs.masterView.buttons.find(p=>p.text == '确认').disabled = arg[0].checkState == '已确认'
          this.$refs.masterView.buttons.find(p=>p.text == '编辑').disabled = arg[0].checkState == '已确认'
          this.$refs.masterView.buttons.find(p=>p.text == '删除').disabled = arg[0].checkState == '已确认'
         } 
        }
          console.log(this.hdrSelectionData)
      },  
      paginationSizeChange(arg){

      },
      paginationCurrentChange(arg){

      },
      getCondition(arg){

      },
      // cool-single-dialog
      updateForm(arg){
        for(let i in arg){
        if(i === 'undefined' || i == 'id')delete arg[i]
      }
       console.log(arg)   
       this.addTableData = arg
      },
      saveEvent(arg){
          if(this.inTableData.length){
            let allData = this.inTableData.concat(this.alreadyDelData)
            param = { hdr:this.hdrSelectionData[0],dtls:allData }
            param.hdr.recStatus = 1   
            param.dtls.map(p=>{
              if(p.ts !== null && p.recStatus != 2)p.recStatus = 1
            })    
            console.log(param,this.uniqueKey)    
            axiosDict[apiName].post(this.uniqueKey + '/SaveBill',param).then(res=>{
              if(res){
                this.hdrSelectionData[0] = Object.assign(this.hdrSelectionData[0],res)
                this.dialogVisible = false
              }
            })
          }else{
            this.$message({
                          type: 'warning',
                          message: '必须输入单据明细',
                          duration: 1500
                      });
          } 

      }
  }
})