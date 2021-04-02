// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  let listName = event.listName;
  delete event.listName;
  try{
    if(Object.keys(event).length <= 1){
      return '未传查询条件';
    }else{
      return await db.collection(listName).doc(event._id).get();
    }
  }catch(err){
    console.log(err);
  }
}