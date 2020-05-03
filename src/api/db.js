const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ pets: [], users: [], bids: [] }).write();

db._.mixin({
  updateOrAdd: function(arr, obj, arg) {
    let item;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arg.length; j++) {
        if(obj[arg[j]] !== arr[i][arg[j]]){
          item = undefined;
          break;
        } else {
          item = i;
        }
      }
    }

    if(arr[item] === undefined){
      arr.push(obj);
    } else {
      for (let key in arr[item]) {
        if(!obj[key]){
          delete arr[item][key];
        }
      }

      Object.assign(arr[item], obj);
    }
    return arr;
  }
})


module.exports = db;
