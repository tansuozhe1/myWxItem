// components/selectType-items/selectType-items.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentData:{
      type:Object,
      value:{}
    },
    totalIncome:{
      type:Number,
      value:0
    },
    totalOutcome:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //百分比
    percent:0
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },
  observers: {
    'currentData,totalIncome,totalOutcome': function(currentData,totalIncome,totalOutcome) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      let money = currentData.money;
      let percent = 0;
      if(currentData.type=='收入'){
        percent = (money / totalIncome)*100;
        percent = percent.toFixed(2);
      }else{
        percent = (money / totalOutcome)*100;
        percent = percent.toFixed(2);
      }
      
      this.setData({
        percent
      })
    }
    
  }
})
