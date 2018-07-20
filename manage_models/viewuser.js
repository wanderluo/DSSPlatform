/**
 * Created by Administrator on 2017/8/18.
 */

module.exports = function (db) {

    return db.define("viewuser", {
        id:{type:"serial", key:true},
        code:{type:"text"},//用户名
        userName:{type:"text"},//姓名
        pwd:{type:"text"},//密码
        registerDate:{type:"date"},//注册时间
        state:{type:"integer"},//状态
        rid:{type:"integer"},  //角色
        cache:{type:"text"},//删除还原状态判断
        corporationName:{type:"text"},//单位名称
        address:{type:"text"},//单位地址
        tel:{type:"text"},//联系电话
        postCode:{type:"text"},//邮编
        type:{type:"text"},//企业性质
        purpose:{type:"text"},//使用目的
        department:{type:"text"},//个人部门
        position:{type:"text"},//个人职务
        personTel:{type:"text"},//个人电话
        email:{type:"text"}//个人邮箱
    });
};
