/**
 * Created by jyb on 17-1-11.
 */

module.exports = function (db) {

    return db.define("dssplat", {
        id:{type:"serial",key:true},// 主键
        formid:{type:"number"},// 端口号
        stime:{type:"text"},    //起始时间
        etime:{type:"text"},    //结束时间
        cookie:{type:"text"},   //获取cookie值
        // productsId:{type:"text"},   //产品ID合集
        // products:{type:"text"},     //产品名称合集
        // ordersid:{type:"text"},     //订单ID合集
        ordername:{type:"text"},    //订单名称
        ordernum:{type:"text"},
        uploadtime:{type:"date"},       //订单时间
        fields:{type:"text"}        //产品详细字段
    });

};