/**
 * Created by jyb on 16-12-17.
 */
module.exports = function (db) {

    return db.define("rsdata", {
        id:{type:"serial",key:true},// 主键
        satelliteID:{type:"text"},  //卫星id
        sensorID:{type:"text"},     //传感器
        sceneID:{type:"text"},      //景序列号
        productID:{type:"text"},     //产品序号
        productLevel:{type:"text"},  //产品级别
        produceTime:{type:"date"},   //生产日期
        rspath:{type:"text"},           //产品名称
        gfpath:{type:"text"},           //tiff地址
        orderid:{type:"text"},           //订单id
        state:{type:"integer"},     //原始数据处理状态
        rstate:{type:"integer"},    //原始数据入库状态
        pathin:{type:"text"}, //数据输入的路径
        pathout:{type:"text"}, //数据输出的路径
        gfname:{type:"text"},    //数据名称
        filestate:{type:"integer"}    //FSII Error: File not found 次数
    });

};
