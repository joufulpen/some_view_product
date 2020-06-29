function alertData(args) {
  console.log('Dialog1--alertData');
  console.log(args);
  if (vm.currentIframeClick == '关联订单') {
    vm.hdrSecondFormItems.form.find(p => p.label == '关联订单').value = args.formno
    vm.currentHdrForm.pFormno = args.formno
  } else {
    let filterData = []
    filterData = args.data.filter(a => !vm.data.map(b => b.code).includes(a.id)).map(a => {
      return a
    })

    let reshapeFilterData = filterData.map(p => ({
      code: p.id,
      codeName: p.name,
      length: p.length,
      width: p.width,
      height: p.height,
      unit: p.unit,
      specifications: vm.currentIframeClick == '部件' ? `${p.length} * ${p.width} * ${p.height}` : p.specifications,
      qty: vm.currentIframeClick == '部件' || vm.currentIframeClick == '铝材' || vm.currentIframeClick == '配件物料' ? p.quantity : '',
      leave: vm.currentIframeClick == '部件' || vm.currentIframeClick == '铝材' || vm.currentIframeClick == '配件物料' ? p.quantity : ''
    }))

    reshapeFilterData.forEach(p => {
      let item = JSON.parse(JSON.stringify(Object.assign(vm.dtlItemTemplate, p)))
      vm.data.push(item)
    })
    // reshapeFilterData.forEach(p => {
    //   return axiosDict[apiName].get('/ApplyPlan/NewDtl')
    //     .then(res => {
    //       let dtlItemTemplate = res
    //       let item = JSON.parse(JSON.stringify(Object.assign(dtlItemTemplate, p)))
    //       vm.data.push(item)
    //     })
    // })
  }
}
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    loading: false,
    status: '',
    hdrTitle: '',
    hdrFirstFormItems: {},
    hdrSecondFormItems: {},
    dltFormItems: {},
    data: [],
    columns: [],
    currentHdrFirstForm: {},
    currentHdrSecondForm: {},
    currentDltForm: {},
    currentSelected: [],
    // 模板
    hdrItemTemplate: {},
    dtlItemTemplate: {},
    cache: [],
    originData: [],
    partBtnDisabled: true,
    orderBtnDisabled: true,
    basicBtnDisabled: true,
    accessoryBtnDisabled: true,
    currentIframeClick: '',
    quickDialogVisible:false,
    dialogWidth:'400px',
    labelWidth:'100px',
    currentEditData:{},
    quickCoolFormItems:{
        form:[{
          "type": "input",
          "value": "",
          "label": "编号",
          "disabled":true,
          "readonly":true,
          "name": "code",
          "style": {
            "width": "100%"
          }
        },{
          "type": "input",
          "value": "",
          "label": "名称",
          "disabled":true,
          "readonly":true,
          "name": "codeName",
          "style": {
            "width": "100%"
          }
        },{
          "type": "input",
          "value": "",
          "label": "规格",
          "disabled":true,
          "readonly":true,
          "name": "specifications",
          "style": {
            "width": "100%"
          }
        },{
          "type": "inputNumber",
          "value": "",
          "label": "领取数量",
          "inputStyle":{"width":"193px"},
          "min":0,
          "disabled":false,
          "name": "qty",
          "style": {
            "width": "100%"
          }
        }
        ]
      },
  },
  computed: {
    currentHdrForm() {
      return Object.assign(this.currentHdrFirstForm,this.currentHdrSecondForm)
    },
    typeValue() {
      return this.hdrFirstFormItems.form.find(p => p.label == '类型').value
    },
    orderLength() {
      return this.hdrSecondFormItems.form.find(p => p.label == '关联订单').value.length
    }
  },
  watch: {
    // 'hdrSecondFormItems.form': {
    //   deep: true,
    //   handler(val, oldVal) {
    //     let typeValue = this.hdrFirstFormItems.form.find(p => p.label == '类型').value
    //     let orderLength = val.find(p => p.label == '关联订单').value.length
    //     this.partBtnDisabled = typeValue !== '部件' || orderLength == 0
    //     this.orderBtnDisabled = typeValue !== '物料' || orderLength == 0
    //     this.basicBtnDisabled = typeValue !== '物料'
    //     this.accessoryBtnDisabled = typeValue !== '物料' || orderLength == 0
    //   }
    // },
    data(val){
      window.parent.vm.dialogs[0].saveBtnDisabled = val.length == 0
    }
  },
  created() {
    this.status = window.location.hash.split('#')[3]
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
  },
  mounted() {
    // this.$nextTick(()=>{
    //   vm.$refs.hdrFirstFormItems.$el.style = 'padding: 2px !important'
    //   vm.$refs.hdrSecondFormItems.$el.style = 'padding: 2px !important'
    // })
    setInterval(() => {
      this.partBtnDisabled = this.typeValue !== '部件' || this.orderLength == 0
      this.orderBtnDisabled = this.typeValue !== '物料' || this.orderLength == 0
      this.basicBtnDisabled = this.typeValue !== '物料'
      this.accessoryBtnDisabled = this.typeValue !== '物料' || this.orderLength == 0

      this.hdrFirstFormItems.form.find(p => p.label == '类型').disabled = this.status == 'check' || this.data.length !== 0
      this.hdrSecondFormItems.form.find(p => p.label == '关联订单').disabled = this.status == 'check' || this.data.length !== 0
      this.hdrSecondFormItems.form.find(p => p.label == '关联订单').buttonDisabled = this.status == 'check' || this.data.length !== 0
      this.hdrFirstFormItems.form.find(p => p.label == '领料原因').disabled = this.status == 'check'
      this.hdrFirstFormItems.form.find(p => p.label == '领料人').readonly = this.status == 'check'
      this.hdrSecondFormItems.form.find(p => p.label == '备注').readonly = this.status == 'check'
    })

    axiosDict['basic'].get(`Employee/GetList?condition=[]`)
      .then(res=>{
        this.hdrFirstFormItems.form.find(p => p.label == '领料人').options = res.map(p => ({value:p.id,label:p.name}))

        if(this.status == 'new'){
          axiosDict['basic'].get('Employee/GetCurrent').then(data => {
              let value = this.hdrFirstFormItems.form.find(p => p.label == '领料人').options.find(o => o.label == data.employee) == undefined ? '' : this.hdrFirstFormItems.form.find(p => p.label == '领料人').options.find(o => o.label == data.employee).value
              this.hdrFirstFormItems.form.find(p => p.label == '领料人').value = value
          })
        }
      })
    // orderAxios.post(`order/queryDelivery`, {
    //     // 接口参数规则为排除所选状态 "statusList": ['拆单审核', '计划待排', '生产中', '进仓', '生产完成', '发货', '订单完成'],
    //     "statusList": ['订单创建', '图纸分配', '图纸处理', '图纸审核', '客户确认', '拆单分配', '拆单处理'],
    //     "current": 1,
    //     "offset": 100000,
    //     "projectName": "",
    //     "engCode": "",
    //     "customerOrderNo": "",
    //     "orderCode": "",
    //     "status": "",
    //     "customerName": "",
    //     "createDate": ["", ""],
    //     "deliveryDate": ["", ""]
    //   })
    //   .then(res => {
    //     console.log('获取符合条件（状态在拆单审核后）的订单', res);
    //     this.hdrFormItems.form.find(p => p.label == '关联订单').options = res.rows.map(p => ({
    //       value: p.orderCode
    //     }))
    //   })

    axiosDict['basic'].get(`BaseProperty/GetList?condition=[{"FieldName":"Type","TableName":"[BaseProperty]","Value":[{"value":"领料原因"}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
      .then(res => {
        console.log('获取领料原因', res);
        this.hdrFirstFormItems.form.find(p => p.label == '领料原因').options = res.map(p => ({
          value: p.name
        }))
      })

    this.getDtlNewItem()
    if (this.status == 'new') this.getHdrNewItem()

    if (this.status == 'edit' || this.status == 'check') {
      this.loading = true
      axiosDict[apiName].get(`/ApplyPlan/GetBill?formno=${id}`)
        .then(res => {
          console.log('获取页面数据', res);
          this.hdrItemTemplate = res.hdr
          this.hdrFirstFormItems.form.forEach(p => {
            p.value = res.hdr[p.name]
          })
          this.hdrSecondFormItems.form.forEach(p => {
            p.value = res.hdr[p.name]
          })
          for (item in this.currentHdrForm) {
            this.currentHdrForm[item] = res.hdr[item]
          }
          this.originData = JSON.parse(JSON.stringify(res.dtls))
          this.data = JSON.parse(JSON.stringify(res.dtls))
        })
        .finally(() => this.loading = false)
    }

  },
  methods: {
    getHdrNewItem() {
      axiosDict[apiName].get('ApplyPlan/NewHdr')
        .then(res => {
          if (res) this.hdrItemTemplate = res
        })
    },
    getDtlNewItem() {
      axiosDict[apiName].get('/ApplyPlan/NewDtl')
        .then(res => {
          delete res.guid
          this.dtlItemTemplate = res
        })
    },
    choosePartBtn() {
      this.currentIframeClick = '部件'
      window.parent.vm.dialogs[1].title = `选取部件`
      window.parent.vm.dialogs[1].src = `../Part/index.html#${token}#${this.hdrSecondFormItems.form.find(p => p.label == '关联订单').value}##apply`
      getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
    },
    chooseOrderMaterialBtn() {
      // Vue.prototype.$message({
      //   message: '开发中'
      // })
      this.currentIframeClick = '铝材'
      window.parent.vm.dialogs[1].title = `选取铝材`
      window.parent.vm.dialogs[1].src = `../Aluminum/index.html#${token}#${this.hdrSecondFormItems.form.find(p => p.label == '关联订单').value}##apply`
      getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
    },
    chooseMaterialBtn() {
      this.currentIframeClick = '基础物料'
      window.parent.vm.dialogs[1].title = `选取基础物料`
      window.parent.vm.dialogs[1].src = `${serveDict['purchaseURL']}MaterialInventory/index.html#${token}#ApplyMaterial`
      // window.parent.vm.dialogs[1].src = `../GoodsProduction/index.html#${token}`
      getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
    },
    chooseAccessoryBtn() {
      this.currentIframeClick = '配件物料'
      window.parent.vm.dialogs[1].title = `选取配件物料`
      window.parent.vm.dialogs[1].src = `../Accessory/index.html#${token}#${this.hdrSecondFormItems.form.find(p => p.label == '关联订单').value}##apply`
      getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
    },
    removeMaterialBtn() {
      this.currentSelected.forEach(p => {
        this.data.splice(this.data.indexOf(p), 1)
      })

      if (this.status == 'edit') {
        let availableCurrentSelected = []
        this.originData.forEach(a => {
          this.currentSelected.forEach(item => {
            if (JSON.stringify(item) == JSON.stringify(a)) return availableCurrentSelected.push(a)
          })
        })
        let cacheFilter = availableCurrentSelected.filter(a => !this.cache.map(b => b.code).includes(a.code))
        cacheFilter.forEach(p => {
          p.recStatus = '2'
          this.cache.push(p)
        })
      }

      this.$refs.coolTable.clearSelectionOuter()
    },
    editMaterialBtn(){
      this.quickEditEvent(this.currentSelected[0])
    },
    // confirmBtn() {
    //   console.log('confirmBtn');
    //   this.data.find(p => {
    //     if (p.code == this.currentDltForm.code) {
    //       for (item in this.currentDltForm) {
    //         p[item] = this.currentDltForm[item]
    //         if (this.status == 'edit' && p.recStatus == 0) p.recStatus = 1
    //       }
    //       p.leave = p.qty
    //     }
    //   })
    // },
    updateFullPage() {
      console.log('maintainClick', this.currentHdrForm);
      if (!this.$refs.hdrFirstFormItems.validateForm() || !this.$refs.hdrSecondFormItems.validateForm()) return
      if (this.data.some(p => isEmpty(p.qty) == true || p.qty == '0')) return Vue.prototype.$message.warning({
        message: '领取数量数据不规范，请检查',
      })
      let hdr = Object.assign(this.hdrItemTemplate, this.currentHdrForm)
      let dtls = this.status == 'edit' && this.cache.length !== 0 ? this.data.concat(this.cache) : this.data
      console.log('hdr', hdr);
      console.log('dtls', dtls);
      axiosDict[apiName].post(`/ApplyPlan/SaveBill`, {
          hdr: hdr,
          dtls: dtls
        })
        .then(res => {
          window.parent.vm.searchData()
          getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
        })
    },
    cancelBtn() {
      getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
    },

    // 响应事件
    materialSelectionChange(arg) {
      this.currentSelected = arg
    },
    rowClick(arg) {
      console.log('rowClick', arg);
      this.currentRowClick = arg
      // this.dltFormItems.form.find(p => p.label == '编号').value = arg.code
      // this.dltFormItems.form.find(p => p.label == '领取数量').value = arg.qty
    },
    rowDblclick(arg){
        console.log(arg)
        this.quickEditEvent(arg)
    },
    quickEditEvent(arg){
      this.currentEditData = arg
        this.quickDialogVisible = true
        this.quickCoolFormItems.form.forEach(item=>{
          for(let i in arg){
            if(i == item.name)item.value = arg[i]
          }
        })
        this.$refs.coolTable.clearCurrentRow()
    },
    updateHdrFirstForm(arg) {
      if (this.status == 'edit') arg.recStatus = 1
      this.currentHdrFirstForm = arg
    },
    updateHdrSecondForm(arg) {
      if (this.status == 'edit') arg.recStatus = 1
      this.currentHdrSecondForm = arg
    },
    // updateDltForm(arg) {
    //   console.log('updateDltForm', arg);
    //   this.currentDltForm = arg
    // },
    // 选择关联订单
    selectRelevantOrder(){
      this.currentIframeClick = '关联订单'
      window.parent.vm.dialogs[1].title = `选择关联订单`
      window.parent.vm.dialogs[1].src = `${serveDict['orderURL']}saleManage/order-manage/index.html#${token}#ApplyMaterial`
      getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
    },
  }
})
