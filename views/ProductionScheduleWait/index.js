function postSelection(args, source) {
      console.log(5,'postSelection',args)
      let data = {
        data:vm.HASCHOOSEDATA,
        closeDialog:true
      }
      source.postMessage({ method: 'passSelection', args: { data: data, to: args.to } }, '*')
    }
function alertData(args) {

}
var resourceName = 'ProductionSchedule'//资源名称 模板生成
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
     dialogTitle:"制定生产计划",
     showSaveButton:true,
     dialogWidth:"520px",
     formItems:{
      form:[{
        "type": "date",
        "value": "",
        "label": "计划开始时间",
        "name": "startDate",
        "inputStyle":{
          "width":"193px"
        },
        "style": {
          "width": "100%"
        }
      },
      {
        "type": "date",
        "value": "",
        "label": "计划完成时间",
        "name": "completeDate",
        "inputStyle":{
          "width":"193px"
        },
        "style": {
          "width": "100%"
        },
        disabled: true,
        pickerOptions: {
          disabledDate(time) {
            // 计划完成时间等于或在计划开始时间后
            return time.getTime() < dayjs(vm.formItems.form.find(p => p.label == '计划开始时间').value).valueOf() - 8.64e7
          }
        }
      },
      {
        "type": "input",
        "value": "",
        "label": "备注",
        "name": "description",
        "style": {
          "width": "100%"
        }
      }]
     },
     packLabelWidth:"185px",
     HASCHOOSEDATA:null,
     newItem:{},
     updateFormData:{}
  },
  watch: {
    formItems: {
      handler(val,oldVal){
        val.form.find(p=>p.label == '计划完成时间').disabled = val.form.find(p=>p.label == '计划开始时间').value.length == 0
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
    // get newItem
    // http://198.168.1.98:18896/api/
    // productionAxios.get(apiObject.uniqueKeyURL +'ProductionSchedule/NewItem').then(res=>{
    //   console.log(res)
    //   if(res)this.newItem = res

    // })
    // console.log(window.location.href)
    if(window.location.href.split('#')[4] == 'ProductionPlan'){
      this.$refs.singleView.query()
      this.$refs.singleView.buttons = this.$refs.singleView.buttons.slice(0,1)
    }
  },
  methods: {
      // check(){
      //   productionAxios.post(apiObject.orderURL+'/Order/dtlList',{}).then(res=>{
      //     console.log(res)
      //     if(res){
      //       this.$refs.singleView.singleTableData.data = []
      //       res.map(item=>{ this.$refs.singleView.singleTableData.data.push(item) })
      //     }
      //   })
      // },
      backEvent(){
        this.dialogVisible = false
        this.$refs.packCoolForm.clearForm()
        this.$refs.packCoolForm.resetForm()
      },
      makePlan(){
        this.dialogVisible = true
      },
      newConstruction(){

      },
      //cool-single-view
      tableRowClick(arg){

      },
      tableRowDblclick(arg){

      },
      tableSelectionChange(arg){
        this.HASCHOOSEDATA = arg
      },
      paginationSizeChange(arg){

      },
      paginationCurrentChange(arg){

      },
      getCondition(arg){

      },
      // cool-single-dialog
      updateForm(arg){
        this.updateFormData = arg
      },
      saveEvent(arg){
        let dtlsData = this.HASCHOOSEDATA.map(item=>{ return { sourceSn:item.id,qty:item.qty, formno:''} })
          let param = {
            dtls:dtlsData,
            hdr:this.updateFormData
          }
          axiosDict[apiName].post('ProductionPlan/SaveBill',param).then(res=>{
            console.log(res)
            if(res){
              this.$refs.singleView.query()
              this.backEvent()
            }
          })
      }
  }
})
