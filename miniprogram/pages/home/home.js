// miniprogram/pages/home/home.js
Page({
  //页面的初始数据
  
  data: {
    //当前年份
    currentYear:'',

    //选择的年份的数据
    yearData:[],

    //获取年度收支数据
    yearBudget:{},

    //是否加载骨架屏
    loading:true
  },

  
  //生命周期函数--监听页面加载
  onShow: function (options) {
    //刚进来时显示骨架屏并提示
    wx.showLoading({
      title: '加载中 . . .',
      mask:true
    })

    
    this.getCurrentDate();
    // wx.showLoading({
    //   title: '加载中 . . .',
    //   mask:true
    // })

    //调取获取数据的方法
    this.getData();

    // //调用年度收支总数据
    // this.getYearAccount();
  },
  
  //进入页面时获取当前时间
  getCurrentDate(){
    let nowTime = new Date();
    let year = nowTime.getFullYear().toString();
    this.setData({
      currentYear:year
    })
  },

  //修改年份
  chageYear(e){
    console.log(e.detail.value);
    this.setData({
      currentYear:e.detail.value
    })
    this.getData();
  },

  //获取选择的年份的数据
  getData(){
    wx.cloud.callFunction({
      name:"find-data",
      data:{
        listName:"userData",
        collectData:{
          selectYear:this.data.currentYear
        }
      }
    }).then(res=>{
      wx.hideLoading();
      this.setData({
        loading:false
      })
      let data = res.result.data;
      let arr = ['01','02','03','04','05','06','07','08','09','10','11','12'];
      let yearData = [];
      for(let i = 0;i<arr.length;i++){
        let income = 0;
        let outcome = 0;
        var monthData = {};
        monthData.month = arr[i] + "月";

        for(let j = 0;j<data.length;j++){
          if(arr[i] == data[j].collectData.selectDate.slice(5,7)){
            if(data[j].collectData.selectBookkingType == "收入"){
              income+=Number(data[j].collectData.selectMoney);
            }
            //计算当月总支出
            if(data[j].collectData.selectBookkingType == "支出"){
              outcome+=Number(data[j].collectData.selectMoney);
            }

          }
        }
        monthData.income = income;
        monthData.outcome = outcome;
        let moneySurplus = income - outcome;
        if(moneySurplus.toString().indexOf('.') > -1){
          monthData.surplus = Number(moneySurplus.toFixed(2));
        }else{
          monthData.surplus = moneySurplus;
        }
        yearData.push(monthData);
       
      }

      let nowTime = new Date();
      let year = nowTime.getFullYear().toString();
      let currentMonth = nowTime.getMonth() + 1;

      if(this.data.currentYear == year){
        yearData = yearData.slice(0,currentMonth);
      }

      //整理出年度收支结余
      let yearBudget = {};
      let totalIncome = 0;
      let totalOutcome = 0;
      let totalSurplus = 0;
      yearData.forEach(v=>{
        totalIncome += v.income;
        totalOutcome += v.outcome;
        totalSurplus += v.surplus;
      })
     
      totalIncome = totalIncome.toFixed(2);
      totalOutcome = totalOutcome.toFixed(2);
      totalSurplus = totalSurplus.toFixed(2);

      yearBudget.totalIncome = {first:totalIncome.split('.')[0],last:'.'+totalIncome.split('.')[1]};
      yearBudget.totalOutcome = {first:totalOutcome.split('.')[0],last:'.'+totalOutcome.split('.')[1]};
      yearBudget.totalSurplus = {first:totalSurplus.split('.')[0],last:'.'+totalSurplus.split('.')[1]};

      this.setData({
        yearData,
        yearBudget
      })
    }).catch(err=>{
      console.log(err);
    })
    
  },

  // //获取当年总收入、支出、结余
  // getYearAccount(){
  //   let yearData = this.data.yearData;
  //   let totalIncome = 0;
  //   let totalOutcome = 0;
  //   console.log(yearData);
  //   yearData.forEach((v)=>{
  //     console.log(v);
  //   })
    
  // }

  
})