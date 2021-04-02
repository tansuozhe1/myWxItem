// components/account-items/account-items.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentData:{
      type:Array,
      value:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //经过处理的数据
    currentYearData:[],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickItems(e){
      let selectId = e.currentTarget.dataset.selectid;
      //跳转进点击那一项的详情页面
      wx.navigateTo({
        url: '../../pages/edit/edit',
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          bb: function(data) {
            console.log(data)
          }
        },
        success: function(res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('deliverData', { data:selectId});
        }
      })
    }
  },
  observers:{
    "currentData":function (currentData){
      // let data = this.data.currentData;
      let data = currentData;
      // console.log(data);
      let selectDate = data[0].selectDate;
      let monthDay = selectDate.slice(-5,-3)+'月'+selectDate.slice(-2)+'日';
      let nowTime = new Date(data[0].selectDate);
      let dayArr = ['星期天','星期一','星期二','星期三','星期四','星期五','星期六'];
      let day = nowTime.getDay();

      //强制限制传过来的金额小数位不超过两位
      data.forEach(v=>{
        if(v.selectMoney.indexOf('.') > -1){
          v.selectMoney = Number(v.selectMoney).toFixed(2);
        }
      })

      let totalIncome = 0;
      let totalOutcome = 0;
      day = dayArr[day];
      data.forEach(v=>{
        if(v.selectBookkingType == '支出'){
          totalOutcome+=Number(v.selectMoney);
          let moneyColor = 'fontRed';
          v.moneyColor = moneyColor;
        }else if(v.selectBookkingType == '收入'){
          totalIncome+=Number(v.selectMoney);
          let moneyColor = 'fontGreen';
          v.moneyColor = moneyColor;
        }
      })

      

      //给数组中的第一个对象添加需要的数据
      data[0].monthDay = monthDay;
      data[0].day = day;
      data[0].totalIncome = totalIncome;
      data[0].totalOutcome = totalOutcome;


      this.setData({
        currentYearData:data
      })
      // console.log(this.data.currentYearData);
    }
  }
  
})
