// miniprogram/pages/currentCount/currentCount.js
Page({
  data: {
    // 是否加载骨架屏
    loading:true,

    //当前年月
    currentYearMonth:'',

    //选择的年月
    selectYearMonth:{},

    //当前月份数据
    currentData:[],

    //当月总收入
    monthTotalIncome:{},

    //当月总支出
    monthTotalOutcome:{},
  },

  //生命周期函数--监听页面加载
  onLoad: function (options) {
    this.getCurrentTime();
  },

 
  
  //生命周期函数--监听页面显示
  onShow: function () {
    wx.showLoading({
      title: '加载中 . . .',
      mask:true
    })

    this.getCurrentMonthData();
  },

  //初始化当前时间得到年月
  getCurrentTime(){
    let nowTime = new Date();
    let year = nowTime.getFullYear().toString();
    let month = nowTime.getMonth()+1;
    month = month >= 10 ? month : '0'+month;
    let currentYearMonth = year + '-' + month;
    let selectYearMonth = {
      year,
      month
    }
    this.setData({
      currentYearMonth,
      selectYearMonth
    })
  },

  //点击时间选择器后得到年月
  selectDate(e){
    let currentYearMonth = e.detail.value;
    console.log(typeof currentYearMonth);
    let year = currentYearMonth.slice(0,4);
    let month = currentYearMonth.slice(-2);
    let selectYearMonth = {
      year,
      month
    }
    this.setData({
      selectYearMonth,
      currentYearMonth
    })

    this.getCurrentMonthData();
  },

  //获取选择的月份的数据
  getCurrentMonthData(){
    //请求数据
    wx.cloud.callFunction({
      name:"find-data",
      data:{
        listName:"userData",
        collectData:{
          selectYearMonth:this.data.currentYearMonth
        }
      }
    }).then(res=>{
      wx.hideLoading();
      
      //拿到数据，数组
      let data = res.result.data;
      // console.log(data);
      let everyMonthData = [];
      // console.log(data);


      //给每个数据添加_id，后面点击流水账某一项跳转编辑页面时需要用到
      data.forEach(v=>{
        v.collectData._id = v._id;
      })

      //计算当月总收支
      let monthTotalIncome = 0;
      let monthTotalOutcome = 0;
      
      data.forEach(v=>{
        if(v.collectData.selectBookkingType == "收入"){
          monthTotalIncome += Number(v.collectData.selectMoney);
        }else{
          monthTotalOutcome += Number(v.collectData.selectMoney);
        }
      })
     
      let incomeFirstNumber = monthTotalIncome.toFixed(2).split('.')[0];
      let incomeLastNumber = monthTotalIncome.toFixed(2).split('.')[1];
      let formatTotalIncome = {
        incomeFirstNumber,
        incomeLastNumber
      }

      let outcomeFirstNumber = monthTotalOutcome.toFixed(2).split('.')[0];
      let outcomeLastNumber = monthTotalOutcome.toFixed(2).split('.')[1];
      let formatTotalOutcome = {
        outcomeFirstNumber,
        outcomeLastNumber
      }

      //日期字符串集合
      let dateArr = [];
      data.forEach(v=>{
        if(dateArr.indexOf(Number(v.collectData.selectDate.slice(-2))) == -1){
          dateArr.push(Number(v.collectData.selectDate.slice(-2)));
        }
      })
      dateArr.sort(function(a,b){
        return b - a;
      })

      for(let i=0;i<dateArr.length;i++){
        let newArr = [];
        for(let j=0;j<data.length;j++){
          if(dateArr[i] == data[j].collectData.selectDate.slice(-2)){
            newArr.push(data[j].collectData);
          }
        }
        everyMonthData.push(newArr);
      }
      // console.log(everyMonthData);

      this.setData({
        loading:false,
        monthTotalIncome:formatTotalIncome,
        monthTotalOutcome:formatTotalOutcome,
        currentData:everyMonthData
      })
      // console.log(this.data.currentData)
    }).catch(err=>{
      console.log(err);
    })
  }

  
})