// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  let listName = event.listName;
  let _id = event._id;
  delete event.listName;
  delete event._id;

  try{
    if(Object.keys(event).length >= 2){
      return await db.collection(listName).doc(_id).update({
        data:{...event}
      })
    }else{
      return '未传id或需要更新的值';
    }
  }catch(err){
    console.log(err);
  }
}