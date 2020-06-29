function postSelection(args, source) {
      let data = {
        data:vm.HASCHOOSEDATA,
        closeDialog:true
      }
      source.postMessage({ method: 'passSelection', args: { data: data, to: args.to } }, '*')
    }

function alertData(args) {
  // console.log(6,'alertData',args)
  // Vue.prototype.$alert(JSON.stringify(args))
}
var resourceName = 'Buyer'//资源名称 模板生成
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
     HASCHOOSEDATA:null,
     lookingURL:undefined,      
    // locationData:[]
  },
  mounted() {
    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
    if(window.location.hash.split('#')[3] !== ''){
      // this.lookingURL = apiDict.uniqueKeyURL +'Goods_Pur/GetList'
      // this.$refs.singleView.singleTableData.columns.find(p=>p.label == '物料编码').prop = 'id'
      // delete this.$refs.singleView.queryCondition.formno
      this.looking(window.location.hash.split('#')[3]) 
    } 
    // this.locationData = []
    // if(window.location.hash.indexOf('alreadyChooseData') !== -1){
    //   let alreadyChooseData = window.location.hash.slice(window.location.hash.indexOf('alreadyChooseData'))
        
    //     if(alreadyChooseData.indexOf('#') === -1) alreadyChooseData = alreadyChooseData.slice(alreadyChooseData.indexOf('=') + 1)
    //     else alreadyChooseData = alreadyChooseData.slice(alreadyChooseData.indexOf('=') + 1,alreadyChooseData.indexOf('#'))  
    //    this.locationData = JSON.parse(window.decodeURIComponent(alreadyChooseData)).map(p=> {
    //         return p.code
    //     // if(p.hasOwnProperty('id') && p.hasOwnProperty('parentSn')){
    //     //   if(p.parentSn == null && p.id !=null)return p.id
    //     //   else if(p.parentSn == null && p.id==null)return p.sn
    //     //   else return p.parentSn          
    //     // } 
    //     // if(p.hasOwnProperty('id')) return p.id
    //     // if(p.hasOwnProperty('parentSn')) return p.parentSn  
    //    })
    //    console.log(this.locationData)     
    // }   
    // else{
    //  this.lookingURL = apiDict.uniqueKeyURL +'BillApply/GetApplyDtl'
    //   this.$refs.singleView.singleTableData.columns.find(p=>p.label == '物料编码').prop = 'code' 
    //    this.$refs.singleView.singleTableData.columns.splice(1,0,{ prop: "formno",label: "采购申请单号" })
    //    this.$refs.singleView.singleTableData.columns.splice(6,0,{ prop: "qty",label: "申请数量" },{ prop: "leave",label: "剩余数量" })
    //    for(let i in this.$refs.singleView.queryCondition){
    //     if(i == 'id')this.$refs.singleView.queryCondition[i].fieldName = "code"
    //     this.$refs.singleView.queryCondition[i].tableName = "[BillApplyDtl]"
    //    } 
    // }  
  },
  methods: {
      looking(queryData){
        if(!this.$refs.singleView.condition.some(p=>p.FieldName == 'Leave'))this.$refs.singleView.condition.push({"FieldName":"Leave","TableName":"[Dtl]","Value":[{"value":"0"}],"TableRelationMode":"AND","Mode":"大于","DataType":"decimal"})
        let param ={
          condition:JSON.stringify(this.$refs.singleView.condition),
          formno:window.location.hash.split('#')[3]
        };
        axiosDict[apiName].get('ApplyPlan/GetDtlList',{
        params:param
        }).then(res=>{
          console.log(res)
          this.$refs.singleView.singleTableData.data = []
          if(res){
            res.map(item=>{
              this.$refs.singleView.singleTableData.data.push(item)
            })
          } 
        })
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

      },
      saveEvent(arg){

      }
  }
})