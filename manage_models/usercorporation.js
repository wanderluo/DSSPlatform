/**
 * Created by jyb on 16-12-17.
 */
module.exports = function (db) {

    return db.define("usercorporation", {
       uid:{type:"number",key:true},
       name:{type:"text"},//单位名称
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
