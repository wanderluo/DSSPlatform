/**
 * Created by Administrator on 2017/9/12.
 */
module.exports = function (db) {

    return db.define("resolution", {
        senId:{type:"integer"},
        type:{type:"text"},   //传感器
        dpi:{type:"text"}   //分辨率
        // description:{type:"text"}
    });
};
