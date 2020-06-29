var resourceName = 'ProductionTask'//资源名称 模板生成
function onSaveReport(e) {
  //此方法会被新窗口以.call(window, e)的方式调用，所以this是新窗口window对象
  this.console.debug(e)
  this.alert('自定义的保存表单——开发中')
}
window.formatterMethods = {
  showStatus:function(arg){
    if (arg.status == 0) {
        return arg.status.value = '未生产'
    }
    if (arg.status == 1) {
      return arg.status.value = '已生产'
    }
  }
}
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
      isTableRowClick:true,
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
     currentData:null,      
     
  },
  mounted() {
    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
  },
  methods: {
    print(){
      this.$message('不知道这里要干嘛')
    },
    packageLabel(){
      // http://198.168.1.98:8896/api/ProductionTask/GetTaskDetail?formno=SJ20191121002_003
      axiosDict[apiName].get(this.uniqueKey+ '/GetTaskDetail?formno='+ this.currentData[0].formno).then(res=>{
        console.log(res)
        // if(res){
          return res
        // }
      }).then(res=>{  
        let allData = { hdr:this.currentData[0],dtls:res }
        console.log(res,allData)
          if(this.$refs.masterView.hdrTableData.data.length != 0){
          coolSti.view({
                token: token, //实际使用时请从window取值
                url: apiDict['system']+'coolSti',
                report: '生产任务',
                template: '默认',
                data: allData,
                variables: { Today: new Date() },
                pageTitle: this.currentData[0].formno+'生产任务单',
                isDirectEdit: false,
                onPrintReportName: 'onPrintReport',
                id: this.currentData[0].formno,
            })  
          }else this.$message('无有效数据')
      })
    },

      //cool-single-view 
      tableRowClick(arg){
        console.log(arg)
        let param = {
            formno: arg.formno,
            condition: JSON.stringify(this.$refs.masterView.condition)
          }
          axiosDict[apiName]
            .get(this.uniqueDeployKey.api + '/GetTaskDetail', {
              params: param,
            })
            .then(res => {
              console.log(res)
              if (res) {
                this.$refs.masterView.dtlTableData[0].data = []
                res.forEach(item => {
                  this.$refs.masterView.dtlTableData[0].data.push(item)
                })
              }
            })
      },
      tableRowDblclick(arg){
    
      },
      tableSelectionChange(arg){
          if(arg.length != 0)this.currentData = arg
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

      }
  }
})