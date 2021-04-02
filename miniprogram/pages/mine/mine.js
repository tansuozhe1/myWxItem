// miniprogram/pages/mine/mine.js
const app = getApp();
Page({
  data: {
    // 是否显示骨架屏
    loading:true,

    //总计账笔数
    totalBookkingNum:0,

    //总结余
    totalSurplus:0,

    //总计账天数
    totalBookkingDay:0,

    // 小图标路径
    iconPicture:[],

    //授权后，拿到用户信息
    userInfo:{}
  },

  onShow: function () {
    wx.showLoading({
      title: '加载中 . . . ',
      mask:true
    })

    let _this = this;
    wx.getUserInfo({
      success: function(res) {
        var userInfo = res.userInfo
        // console.log(userInfo);
        _this.setData({
          userInfo
        })
      }
    })
    // 获取记账数据
    wx.cloud.callFunction({
      name:'find-data',
      data:{
        listName:'userData',
      }
    }).then(res=>{
      let data = res.result.data;
      let totalBookkingNum = data.length;
      let totalIncome = 0;
      let totalOutcome = 0;
      let totalDayArr = [];

      data.forEach(v=>{
        // 得到总结余
        if(v.collectData.selectBookkingType == '收入'){
          totalIncome += Number(v.collectData.selectMoney);
        }else{
          totalOutcome += Number(v.collectData.selectMoney);
        }

        // 得到总计账天数
        if(totalDayArr.indexOf(v.collectData.selectDate) == -1){
          totalDayArr.push(v.collectData.selectDate);
        }
      })

      let totalSurplus = totalIncome - totalOutcome;

      let totalBookkingDay = totalDayArr.length;

      this.setData({
        totalBookkingNum,
        totalSurplus,
        totalBookkingDay
      })
    }).catch(err=>{
      console.log(err);
    })

    //获取小图标
    wx.cloud.callFunction({
      name:'find-data',
      data:{
        listName:'anotherIcons'
      }
    }).then(res=>{
      wx.hideLoading();

      let data = res.result.data
      let iconPicture = [];

      data.forEach(v=>{
        iconPicture.push(v.url);
      })

      this.setData({
        loading:false,
        iconPicture
      })
    }).catch(err=>{
      console.log(err);
    })
  },

  //分享功能
  onShareAppMessage: function(res){
    var that = this;
    console.log(res);

    return {
      title:'TT来记账',
      path:'/pages/mine/mine',
      imageUrl:'../../images/bookkeeping-active.png'
    }
  }

  
})