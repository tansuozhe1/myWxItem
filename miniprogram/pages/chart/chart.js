const tool = require('../../js/tool');
// echart
import * as echarts from '../../components/ec-canvas/echarts';

//保存绘制canvas图形对象
let chartCanvas = null;

// function initChart(canvas, width, height, dpr) {
//   const chart = echarts.init(canvas, null, {
//     width: width,
//     height: height,
//     devicePixelRatio: dpr // new
//   });
//   canvas.setChart(chart);

//   var option = {
//     backgroundColor: "#ffffff",
//     color: ["#37A2DA", "#32C5E9", "#67E0E3", "#91F2DE", "#FFDB5C", "#FF9F7F"],
//     legend: {
//       top: 'bottom',
//       left: 'center',
//     },
//     series: [{
//       label: {
//         normal: {
//           fontSize: 14
//         }
//       },
//       type: 'pie',
//       center: ['50%', '50%'],
//       radius: ['0%', '60%'],
//       data: [{
//         value: 55,
//         name: '北京'
//       }, {
//         value: 20,
//         name: '武汉'
//       }, {
//         value: 10,
//         name: '杭州'
//       }, {
//         value: 20,
//         name: '广州'
//       }, {
//         value: 38,
//         name: '上海'
//       }]
//     }]
//   };

//   chart.setOption(option);
//   return chart;
// }

Page({
  data: {
    //echart
    ec: {
      onInit: null
    },

    //选择收入还是支出
    budgetType:0,

    //查询类型：日、月、还是年
    count:1,

    //当前日期
    currentDate:'',

    //picker标签中的end属性值,能够选择的最新的日期
    endTime:'',

    //日、月、年总收入
    totalIncome:0,

    //日、月、年总支出
    totalOutcome:0,

    //传给selectType-items组件的数据
    formatData:[],

    //正常没有带逗号的总收入
    normalTotalIncome:0,

    //正常没有带逗号的总支出
    normalTotalOutcome:0,
  },

  onShow: function () {
    wx.showLoading({
      title:'加载中 . . . ',
      mask:true
    })
    
    let nowTime = new Date();
    let formatTime = tool.formatDate(nowTime,'yyyy-MM-dd');

    this.getCurrentTime(nowTime,'yyyy-MM-dd');
    this.setData({
      endTime:formatTime,
      count:1,
      ec: {
        onInit: this.initChart
      }
    })

    this.getData();
  },

  //初始化canvas - 饼图
  initChart(canvas, width, height, dpr) {
    let chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr
    });
    canvas.setChart(chart);
    //绘制canvas
    // chart.setOption({});

    chartCanvas = chart;

    return chart;
  },

  //进入页面初始化当前日期
  getCurrentTime(nowTime,format){
    let formatTime = tool.formatDate(nowTime,format);
    this.setData({
      currentDate:formatTime
    })
  },

  //点击查询按钮切换类型
  clickSearchBtn(){
    //点击查询按钮切换类型弹出加载层
    wx.showLoading({
      title: '加载中 . . .',
      mask:true
    })

    let count = this.data.count;
    count++;
    if(count > 3){
      count = 1;
    }

    let nowTime = new Date();
    let year = nowTime.getFullYear().toString();
    let month = String(nowTime.getMonth() + 1);
    let date = String(nowTime.getDate());
    if(count == 1){
      this.getCurrentTime(`${year}-${month}-${date}`,'yyyy-MM-dd');
    }else if(count == 2){
      this.getCurrentTime(`${year}-${month}`,'yyyy-MM');
    }else if(count == 3){
      this.getCurrentTime(`${year}`,'yyyy');
    }

    this.setData({
      count
    })

    //点击查询切换按钮后获取数据
    this.getData();
  },

  //点击输入框选择日期
  bindDateChange(e){
    //选择日期弹出加载层
    wx.showLoading({
      title: '加载中 . . .',
      mask:true
    })

    let selectDate = e.detail.value;
    this.setData({
      currentDate:selectDate
    })

    //点击查询切换按钮后获取数据
    this.getData();
  },

  // 点击收入支出按钮
  clickBudgetBtn(e){
    this.setData({
      budgetType:e.currentTarget.dataset.selectindex
    })
    //切换收入支出类型，调用获取配置数组，改变饼状图
    this.getOptionData();
  },

  //获取数据
  getData(){
    let keyNameArr = ['selectDate','selectYearMonth','selectYear'];
    let count = this.data.count;
    let key = keyNameArr[count-1];
    let currentDate = this.data.currentDate;

    // 获取数据
    wx.cloud.callFunction({
      name:'find-data',
      data:{
        listName:"userData",
        collectData:{
          [key]:currentDate
        }
      }
    }).then(res=>{
      // 关闭加载层
      wx.hideLoading();

      let data = res.result.data;
      // console.log(data);

      //计算总收支
      let totalIncome = 0;
      let totalOutcome = 0;
      //处理数据，先划分收入和支出
      let incomeData = [];
      let outcomeData = [];

      data.forEach(v=>{
        if(v.collectData.selectBookkingType == '收入'){
          totalIncome += Number(v.collectData.selectMoney);
          incomeData.push(v);
        }else{
          totalOutcome += Number(v.collectData.selectMoney);
          outcomeData.push(v);
        }
      })
      let normalTotalIncome = totalIncome;
      let normalTotalOutcome = totalOutcome;
      totalIncome = this.formatMoney(totalIncome);
      totalOutcome = this.formatMoney(totalOutcome);
      // console.log(incomeData);

      // 合并数组中同类型的对象数据，比如合并两个学习类的数据
      //收支数据一起的数组
      let formatData = [];
      let incomeFormatData = this.formatArrData(incomeData);
      let outcomeFormatData = this.formatArrData(outcomeData);
      formatData.push(incomeFormatData);
      formatData.push(outcomeFormatData);
      // console.log(incomeFormatData,outcomeFormatData);

      
      this.setData({
        totalIncome,
        totalOutcome,
        normalTotalIncome,
        normalTotalOutcome,
        formatData
      })
      // console.log(this.data.formatData)
      this.getOptionData();
    }).catch(err=>{
      console.log(err);
    })
  },

  //格式化金额，补充小数点，隔三位添加逗号
  formatMoney(money){
    let moneyArr = String(money).split('');
    if(moneyArr.indexOf('.') == -1){
      for(let i=3;i<moneyArr.length;i+=3){
        moneyArr.splice(-i,0,',');
        i++;
      }
      moneyArr = moneyArr.join('')+'.00';
    }else{
      for(let i=6;i<moneyArr.length;i+=3){
        moneyArr.splice(-i,0,',');
        i++;
      }
      moneyArr = moneyArr.join('');
    }
    return moneyArr;
  },

  //获取随机颜色
  getColor(){
    let red = parseInt(Math.random()*256);
    let green = parseInt(Math.random()*256);
    let blue = parseInt(Math.random()*256);
    return `rgb(${red},${green},${blue})`;
  },

  //合并数组中同类型对象的数据，比如合并两个学习对象数据
  formatArrData(arr){
    // 储存数据的数组
    let nameArr = [];
    // 辅助数组，用来存储查找条件，
    let assistArr = [];

    arr.forEach(v=>{
      // 辅助数组中没有该值，往存储数据数组新添加该条件对应的数据并且往辅助数组中存该查找条件
      if(!assistArr.includes(v.collectData.selectIcon.name)){
        nameArr.push({
          name:v.collectData.selectIcon.name,
          activeUrl:v.collectData.selectIcon.activeUrl,
          money:Number(v.collectData.selectMoney),
          count:1,
          color:this.getColor(),
          type:v.collectData.selectBookkingType == '收入' ? '收入' : '支出'
        })
        assistArr.push(v.collectData.selectIcon.name);
      }else{
        // 同类数据，合并更新
        for(let j=0;j<nameArr.length;j++){
          if(nameArr[j].name == v.collectData.selectIcon.name){
            nameArr[j].money += Number(v.collectData.selectMoney);
            nameArr[j].count++;
          }
        }
      }
    })
    // console.log(nameArr,assistArr);
    return nameArr;
  },

  //获取echart配置option
  getOptionData(){
    let budgetType = this.data.budgetType;
    let formatData = this.data.formatData;
    let needDataArr = formatData[budgetType];
    let optionDataArr = [];
    let colorOptionArr = [];
    needDataArr.forEach(v=>{
      optionDataArr.push({
        value:Number(v.money),
        name:v.name
      });
      colorOptionArr.push(v.color)

    })

    // console.log(optionDataArr,colorOptionArr);
    this.drawPie(colorOptionArr,optionDataArr);
  },

  //绘制饼图
  drawPie(colors, tyData) {
    let option = {
      backgroundColor: "#ffffff",
  
      legend: {
        top: 'bottom',
        left: 'center'
      },
      series: [{
        label: {
          normal: {
            fontSize: 14
          }
        },
        type: 'pie',
        center: ['50%', '43%'],
        radius: [0, '60%'],
  
        //颜色需要动态设置
        color: colors,

        //饼图数据需要动态设置
        data: tyData
      }]
    };

    chartCanvas.setOption(option);
  }
})