/**
 * Created by jyb on 16-12-17.
 */

module.exports = function (db) {

    return db.define("orderform", {
        id:{type:"serial", key:true},
        generateTime:{type:"date"},
        ackTime:{type:"date"},
        name:{type:"text"},
        description:{type:"text"},
        state:{type:"integer"},
        uid:{type:"integer"},
        orderNo:{type:"text"},
        cache:{type:"text"}//删除还原状态判断
    });

};