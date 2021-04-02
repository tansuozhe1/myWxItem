const tool = require('../../js/tool');

Page({
  data: {
    //所点击的那一项整理后的数据
    collectData:{},

    // 是否可编辑
    isDisable:true,

    //操作页面当天日期
    formatDate:'',

    //编辑前后显示的日期
    showDate:'',

    //金额
    money: '',

    //备注
    comment: '',

    //该记录的id
    itemId:''
  },

  onLoad: function (options) {
    // 弹出加载层
    wx.showLoading({
      title: '加载中 . . .',
      mask:true
    })

    //得到当前时间
    let nowTime = new Date();
    let formatDate = tool.formatDate(nowTime,'yyyy-MM-dd');
    const eventChannel = this.getOpenerEventChannel();
    
    // 这里要注意，要把this存起来，因为后面callFunction方法里的this和外面不一样，不能调用this.setData方法存储数据，
    let _this = this;

    eventChannel.on('deliverData', function(data) {
      let userData = {};
      let itemId = data.data;

      // 根据items的id查找数据拿到数据
      wx.cloud.callFunction({
        name:'find-docData',
        data:{
          listName:'userData',
          _id:itemId
        }
      }).then(res=>{
        wx.hideLoading();
        
        let data = res.result.data;
        // console.log(data);
        userData = data;

        let collectData = data.collectData;
        let money = collectData.selectMoney;
        let comment = collectData.selectComment;

        let dayArr = ['星期天','星期一','星期二','星期三','星期四','星期五','星期六'];

        let day = new Date(collectData.selectDate).getDay();
        let week = dayArr[day];
        
        let showDate = `${collectData.selectYear}年${collectData.selectDate.slice(5,7)}月${collectData.selectDate.slice(-2)}日 ${week}`;

        _this.setData({
          collectData,
          formatDate,
          money,
          showDate,
          comment,
          itemId
        })

        // console.log(_this.data.collectData);
      }).catch(err=>{
        console.log(err);
      })
    })
  },

  // 填写日期、金额、备注
  setValue(e){
    let key = e.currentTarget.dataset.key;
    let value = e.detail.value;

    let currentYear = '';
    let currentMonth = '';
    let currentDay = '';
    
    //强制限制输入金额小数位不能超过两位
    if(key == 'money' && /\.(\d){3,}/.test(value)){
      wx.showToast({
        title: '小数位不能超过两位',
        icon: 'none',
        duration: 2000
      })

      this.setData({
        [key]:''
      })
      return;
    }
    //备注不能带尖括号
    if(key === "comment" && /[<>]/.test(value)){
      wx.showToast({
        title: '备注不能包含<>符号',
        icon: 'none',
        duration: 3000
      })
      
      this.setData({
        [key]:''
      })
      return;
    }

    let dayArr = ['星期天','星期一','星期二','星期三','星期四','星期五','星期六'];
    
    if(key === "currentDate"){
      currentYear = value.slice(0,4);
      currentMonth = value.slice(5,7);
      currentDay = value.slice(-2);
      let day = new Date(value).getDay();
      let week = dayArr[day];

      let showDate = `${currentYear}年${currentMonth}月${currentDay}日 ${week}`;

      this.setData({
        showDate
      });

      return;
    }

    this.setData({
      [key]:value
    })
  },

  // 点击编辑按钮
  clickEdit(){
    this.setData({
      isDisable:false
    })
  },

  //点击保存按钮
  clickSaveBtn(){
    
    
    let money = this.data.money;
    let comment = this.data.comment;
    let showDate = this.data.showDate;
    let itemId = this.data.itemId;
    let selectDate = `${showDate.slice(0,4)}-${showDate.slice(5,7)}-${showDate.slice(8,10)}`;

    //判断是否输入金额
    if(!money){
      wx.showToast({
        title: '请输入金额',
        icon: 'none',
        duration: 1500
      })
      return;
    }

    wx.cloud.callFunction({
      name:'update-data',
      data:{
        listName:'userData',
        _id:itemId,
        collectData:{
          selectMoney:money,
          selectComment:comment,
          selectDate,
        }
      }
    }).then(res=>{
      wx.showToast({
        title: '保存成功',
        icon: 'none',
        duration: 1000
      })
    }).catch(err=>{
      console.log(err);
    })

    this.setData({
      isDisable:true
    })
  },

  // 点击删除按钮
  clickDeleteBtn(){
    let itemId = this.data.itemId;

    wx.showModal({
      title: '提示',
      content: '是否删除该记账记录',
      success (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name:'delete-data',
            data:{
              listName:'userData',
              _id:itemId
            }
          }).then(res=>{
            console.log(res);
            if(res.result == ''){
              wx.showToast({
                title: '删除成功',
                icon: 'none',
                duration: 1000
              })

              //返回上一层页面
              wx.navigateBack({
                delta: 1
              })
            }
          }).catch(err=>{
            console.log(err);
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }

})