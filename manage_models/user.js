/**
 * Created by jyb on 16-12-17.
 */
module.exports = function (db) {
    return db.define("user", {
        id:{type:"serial", key:true},
        code:{type:"text"},//用户名
        name:{type:"text"},//姓名
        pwd:{type:"text"},//密码
        registerDate:{type:"date"},//注册时间
        state:{type:"integer"},//状态
        rid:{type:"integer"},  //角色
        cache:{type:"text"},//删除还原状态判断
        ipurl:{type:"text"}//分中心的ip地址
    });

};
