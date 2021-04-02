const tool = require('../../js/tool');

const app = getApp();

Page({
  data: {
    //收入或者支出按钮的下标
    currentIndex:0,

    //收入还是支出类型
    bookkingType:'支出',

    //收入还是支出
    isOutcome:true,
    // 选中的账户类型下标
    selectPayIndex:-1,

    //是否显示骨架屏
    loading:true,

    //小图标数据，二维数组
    getIconData:[],

    //点击哪一页的小图标
    pageIndex:-1,

    // 点击哪一个小图标
    inconIndex:-1,

    //用于限制日期选择器的日期
    pickerDate:'',

    //当前年份
    currentYear:'',
    
    //当前年月
    currentYearMonth:'',

    //当前日期
    currentDate: '',

    //金额
    money: '',

    //备注
    comment: '',

    // 是否授权
    isAuthorize:false,

    // 收支按钮
    btnType:[
      {
        name:"支出",
        type:"outcome"
      },
      {
        name:"收入",
        type:"income"
      }
    ],
    // 支付类型
    payType:[
      {
        name:"现金",
        type:"xj"
      },
      {
        name:"支付宝",
        type:"zfb"
      },
      {
        name:"微信",
        type:"wx"
      },
      {
        name:"信用卡",
        type:"xyk"
      },
      {
        name:"储蓄卡",
        type:"cxk"
      }
    ]
  },
  //点击收入支出按钮触发
  clickIncom(e){
    if(e.currentTarget.dataset.index == this.data.currentIndex){
      return;
    }
    let currentIndex = e.currentTarget.dataset.index;
    this.data.currentIndex = currentIndex;
    let bookkingType = '';
    if(currentIndex == 0){
      bookkingType = '支出'
    }else{
      bookkingType = '收入'
    }

    this.setData({
      currentIndex,
      bookkingType
    })

    wx.showLoading({
      title: '加载中 . . .',
      mask:true
    })
    this.getIconData(currentIndex);
  },

  onLoad(){
    //将全局对象中的isAuthorize的值存起来，以此来判断是否显示授权按钮
    //注意：由于这里的赋值比app.js文件中的wx.getSetting方法执行的早，会导致还未对全局对象的isAuthorize属性赋值就已经执行下面代码，从而导致下面isAuthorize的值为false,即使已经授权了，但是授权按钮还是显示，为了解决该bug，一定不能把记账页面设置为初始页面，要从其他页面进来，给点时间执行wx.getSetting方法。
    this.setData({
      isAuthorize:app.globalData.isAuthorize
    })

    //刚进来时显示骨架屏并提示
    wx.showLoading({
      title: '加载中 . . .',
      mask:true
    })
    let currentIndex = this.data.currentIndex;
    this.getIconData(currentIndex);
    this.defaultDate();
  },
  
  // 填写日期、金额、备注
  setValue(e){
    let key = e.currentTarget.dataset.key;
    let value = e.detail.value;

    let currentYear = '';
    let currentYearMonth = '';
    
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

    if(key === "currentDate"){
      currentYear = value.slice(0,4);
      currentYearMonth = value.slice(0,7);
      this.setData({
        [key]:e.detail.value,
        currentYear,
        currentYearMonth
      })
    }

    this.setData({
      [key]:e.detail.value
    })
  },
  
  // 进入页面时把日期选项设置为当日日期
  defaultDate(){
    let nowDate = new Date();
    let currentYear = nowDate.getFullYear();
    let month = String(nowDate.getMonth()+1) >= 10 ? String(nowDate.getMonth()+1) : '0'+String(nowDate.getMonth()+1);
    let currentYearMonth = currentYear + '-' + month;
    let formatDate = tool.formatDate(nowDate,"yyyy-MM-dd");
    this.setData({
      currentDate:formatDate,
      pickerDate:formatDate,
      currentYear,
      currentYearMonth
    });
  },
  //获取支出选项的小图标数据
  getIconData(inconTypeIndex){
    let btnType = "";
    if(inconTypeIndex == 0){
      btnType = 'outcome-icons';
    }else{
      btnType = 'income-icons';
    }
    wx.cloud.callFunction({
      name:"find-data",
      data:{
        listName:btnType
      }
    }).then(res=>{
      //取消加载提示
      wx.hideLoading();
      let resData = res.result.data;
      // console.log(resData);
      let iconData = [];
      let length = 10;
      for(let i=0;i<resData.length;i+=length){
        iconData.push(resData.slice(i,i+length));
      }
      this.setData({
        getIconData:iconData,
        loading:false
      })
    }) 
  },
  //点击小图标触发的事件
  clickIcon(e){
    let getIconData = this.data.getIconData;
    let iconType = e.currentTarget.dataset.icontype;
    let pageIndex = e.currentTarget.dataset.pageindex;
    let inconIndex = e.currentTarget.dataset.inconindex

    for(let i=0;i<getIconData.length;i++){
      for(let j=0;j<getIconData[i].length;j++){
        getIconData[i][j].isActive = false;
        if(getIconData[i][j].desc == iconType){
          getIconData[i][j].isActive = true;
        }
      }
    }
    this.setData({
      getIconData,
      pageIndex,
      inconIndex
    })
  },
  // 点击账户类型触发的事件
  selectType(e){
    let selectIndex = e.currentTarget.dataset.selectindex;
    this.setData({
      selectPayIndex:selectIndex
    })
  },
  //点击完成触发
  clickBtn(e){
    let getIconData = this.data.getIconData;
    let bookkingType = this.data.bookkingType;
    let pageIndex = this.data.pageIndex;
    let inconIndex = this.data.inconIndex;
    let selectPayIndex = this.data.selectPayIndex;
    let payType = this.data.payType;
    let currentDate = this.data.currentDate;
    let currentYear = this.data.currentYear;
    let currentYearMonth = this.data.currentYearMonth;
    let money = this.data.money;
    let comment = this.data.comment;

    //判断是否选择记账类型
    if(inconIndex == -1){
      wx.showToast({
        title: '请选择记账类型',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    //判断是否选择支付类型
    if(selectPayIndex == -1){
      wx.showToast({
        title: '请选择支付方式类型',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    //判断是否输入金额
    if(!money){
      wx.showToast({
        title: '请输入金额',
        icon: 'none',
        duration: 1500
      })
      return;
    }

    //收集数据
    let collectData = {};
    collectData.selectIcon = getIconData[pageIndex][inconIndex];
    collectData.selectBookkingType = bookkingType;
    collectData.selectPayType = payType[selectPayIndex];
    collectData.selectDate = currentDate;
    collectData.selectYearMonth = currentYearMonth;
    collectData.selectYear = currentYear.toString();
    collectData.selectMoney = money;
    collectData.selectComment = comment;


    wx.cloud.callFunction({
      name:"add-data",
      data:{
        listName:'userData',
        collectData
      }
    }).then(res=>{
      // wx.hideLoading();

      //上传数据成功后初始化页面
      getIconData[pageIndex][inconIndex].isActive = false;
      this.setData({
        selectPayIndex:-1,
        money: '',
        comment: '',
        getIconData
      })

      wx.showToast({
        title: '保存成功',
        icon: 'none',
        duration: 1000
      })
      console.log('上传数据成功');
    }).catch(err=>{
      console.log(err);
    })
  },
  
  //点击授权按钮触发
  bindgetuserinfo(res){
    console.log(res);
    if(Object.keys(res.detail).length > 1){
      this.setData({
        isAuthorize:true
      })

      app.globalData.userInfo = res.detail.userInfo;
    }else{
      this.setData({
        isAuthorize:false
      })
    }
  }
})