/**
 * Created by jyb on 17-2-8.
 */
module.exports = function (db) {

    return db.define("sensor", {
        id:{type:"integer",key:true},
        code:{type:"text"},   //卫星名
        satCode:{type:"text"}   //传感器
         // description:{type:"text"}
    });
};
