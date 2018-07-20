/**
 * Created by jyb on 17-4-1.
 */
module.exports = function (db) {

    return db.define("vieworderform", {
        id:{type:"serial",key:true},// 主键
        orderNo:{type:"text"},
        generateTime:{type:"date"},
        ackTime:{type:"date"},
        name:{type:"text"},
        description:{type:"text"},
        state:{type:"integer"},
        uid:{type:"integer"},
        corporationName:{type:"text"},
        tel:{type:"text"},//联系电话
        postCode:{type:"text"},//邮编
        type:{type:"text"},//企业性质
        purpose:{type:"text"},//使用目的
        userName:{type:"text"},//申请人姓名
        department:{type:"text"},//个人部门
        position:{type:"text"},//个人职务
        personTel:{type:"text"},//个人电话
        email:{type:"text"},//个人邮箱,
        code:{type:"text"},
        address:{type:"text"},
        cache:{type:"text"}//删除还原状态判断
    });

};
