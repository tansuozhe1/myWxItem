// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  let listName = event.listName;
  let _id = event._id;
  delete event.listName;

  try{
    if(Object.keys(event).length < 2){
      return '请传要删除的记录的id'
    }else{
      let res = '';
      db.collection(listName).doc(_id).remove({
        success: function(res) {
          res = res.data;
        }
      })
      return await res;
    }
  }catch(err){
    console.log(err);
  }
}