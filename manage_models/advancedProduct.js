/**
 * Created by jyb on 16-12-17.
 */
module.exports = function (db) {

    return db.define("advancedProduct", {
        // id:{type:"serial",key:true},// 主键
        mapName:{type:"text",key:true},  //产品名字
        productLevel:{type:"text"},  //产品级别
        productFormat:{type:"text"}, //产品格式
        startTime:{type:"date"},      //产品起始行时间
        endTime:{type:"date"},        //产品结束行时间
        imageGSD:{type:"integer"},    // 产品分辨率
        // rspath:{type:"text"},           //
        mapProjection:{type:"text"},      //地图投影
        earthEllipsoid:{type:"text"},     //椭球模型
        topLeftLatitude:{type:"number"},   //左上角纬度
        topLeftLongitude:{type:"number"},  //左上角经度
        topRightLatitude:{type:"number"},  //右上角纬度
        topRightLongitude:{type:"number"}, //右上角经度
        bottomRightLatitude:{type:"number"},//右下角纬度
        bottomRightLongitude:{type:"number"},//右下角经度
        bottomLeftLatitude:{type:"number"},  //左下角纬度
        bottomLeftLongitude:{type:"number"}, //左下角经度
        stat:{type:"number"},           //数据大小（字节）
        Geourl:{type:"text"},   //  geoserver发布地址
        LAYERS:{type:"text"},   //  工作区：发布图层
        VERSION:{type:"text"},   //  wms服务版本号
        zoom:{type:"integer"},   //  地图默认级数
        imgUrl:{type:"text"}   //  拇指图地址
    });

};
