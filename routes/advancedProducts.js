/**
 * Created by admin on 17-10-17.
 */
var express = require('express');
var orm = require("orm");
var router = express.Router();
var fs = require('fs');

var tar = require('tar');
var zlib = require('zlib');
var path = require('path');
var util = require('util');
var parseString = require('xml2js').parseString;
var dateformat = require("dateformat")();
var orm = require("orm");



router.get('/produce',function(req,res){
    var queryObj = req.query;
    // var pageInfo = global.splitPage(queryObj);
    var isSend = {status:false};
    var total = 0;
    var sort = [];
    if(queryObj.sort){
        sort.push(queryObj.sort,"Z");
        delete queryObj.sort;
    }
    req.models.advancedProduct.find(queryObj,sort).count(function(err,count){
        if(err) return global.dealError(err,res,isSend);
        total = count;
    }).all(function(err, rsmetadatas){
      
        if(err) return global.dealError(err,res,isSend);
        res.send(JSON.stringify({total:total,data:rsmetadatas}));
    })
});

router.post('/ConvexHull', function(req, res) {

    var queryObj = req.body;
    var sort = [];

    var sql;
    if(queryObj.sort) {
        sort.push("uploadTime","A");
        delete  queryObj.sort;
    }

    if(queryObj.cloudPercent) queryObj.cloudPercent = orm.lte(parseInt(queryObj.cloudPercent));
    if(queryObj.imageGSD) queryObj.imageGSD = orm.lte(parseFloat(queryObj.imageGSD));

    if(queryObj.startReceiveTime){
        queryObj.receiveTime = orm.between(queryObj.startReceiveTime,queryObj.endReceiveTime);
        delete  queryObj.startReceiveTime;
        delete  queryObj.endReceiveTime
    }

    if(queryObj.sensor){
        var satellite = {};
        var sensorArray = queryObj.sensor.split(',');
        sensorArray.forEach(function(data){
            var keyValue = data.split('|');
            if(!satellite[keyValue[0]]) satellite[keyValue[0]] = [];
            satellite[keyValue[0]].push(keyValue[1]);
        })

        var satelliteSql = "";
        for(var key in satellite){

            if(satelliteSql) satelliteSql += " or ";
            satelliteSql += util.format("(satelliteID='%s'",key);
            var sensors = satellite[key];
            if(sensors.length == 1) satelliteSql += util.format(" and sensorID='%s')",sensors[0]);
            else {

                var scope = "(";
                sensors.forEach(function(sensor,index){

                    if(index == 0) scope += util.format("'%s'",sensor);

                    else scope += util.format(",'%s'",sensor);
                })
                scope += ")";
                satelliteSql += " and sensorID in "+ scope + ")"
            }
        }

        if(satelliteSql) sql = util.format("(%s)",satelliteSql);
        delete queryObj.sensor;
    }

    if(queryObj.wkt){
        // var spatialSql = util.format("ST_Intersects(ST_GeomFromText('%s'),envelope)=1",queryObj.wkt);    //mysql 5.6 sql语句
        var spatialSql = util.format("MBRIntersects(GeomFromText('%s'),envelope)=1",queryObj.wkt);    //mysql 5.5 sql语句
        sql ? sql += util.format(" and %s",spatialSql) : sql = spatialSql;
        delete queryObj.wkt;
    }
    else if(queryObj["wkt[]"]){

        queryObj["wkt[]"].forEach(function(wkt,index){
            // var spatialSql = util.format("ST_Intersects(ST_GeomFromText('%s'),envelope)=1",queryObj.wkt);    //mysql 5.6 sql语句
            var spatialSql = util.format("MBRIntersects(GeomFromText('%s'),envelope)=1",queryObj.wkt);    //mysql 5.5 sql语句
            if(index == 0) sql ? sql += util.format(" and %s",spatialSql) : sql = spatialSql;
            else sql += util.format(" or %s",spatialSql);
        })
        delete queryObj["wkt[]"];
    }
    var modelName="viewrsmetadata";

    if(queryObj.level && queryObj.zoneNo){
        switch(queryObj.level){
            case "province":
                modelName="viewprovincedata";
                break;
            case "city":
                modelName="viewcitydata";
                break;
            default:
                modelName="viewdistrictdata";
                break;
        }
        var spatialSql =" zcode='"+queryObj.zoneNo+"'";
        sql ? sql += util.format(" and %s",spatialSql) : sql = spatialSql;
        delete queryObj.level;
        delete queryObj.zoneNo;
    }

    function query(){
        var pageInfo = global.splitPage(queryObj);

        var qReturn =  req.models[modelName].find(queryObj,sort).where(sql).count(function(err,count){

            if(err) return res.send("0");
            qReturn.all(function(err, rsmetadatas){
                if(err) return res.send("0");
                //数据写入txt
                // txtIO(rsmetadatas);
                // readIO();
                res.send(JSON.stringify({total:count,data:coorArray(rsmetadatas)},function (key,value) {

                    if(!value)
                        return undefined;
                    return value;
                }));
            })
        })
    }

    function coorArray(rsmetadatas){
        var coordata = [];
        var coorstr ='';

        rsmetadatas.map(function(value,key,arr){
            if( key < 2000 ){
                coordata[key] = [[value.topLeftLongitude,value.topRightLatitude],
                    [value.bottomRightLongitude,value.topRightLatitude],
                    [value.bottomRightLongitude,value.bottomRightLatitude],
                    [value.topLeftLongitude,value.bottomRightLatitude],
                    [value.topLeftLongitude,value.topRightLatitude]
                ];
                // coordata.push([[value.topLeftLongitude,value.topRightLatitude],
                //     [value.bottomRightLongitude,value.topRightLatitude],
                //     [value.bottomRightLongitude,value.bottomRightLatitude],
                //     [value.topLeftLongitude,value.bottomRightLatitude],
                //     [value.topLeftLongitude,value.topRightLatitude]
                // ]);
                coorstr += [[value.topLeftLongitude,value.topRightLatitude],
                    [value.bottomRightLongitude,value.topRightLatitude],
                    [value.bottomRightLongitude,value.bottomRightLatitude],
                    [value.topLeftLongitude,value.bottomRightLatitude],
                    [value.topLeftLongitude,value.topRightLatitude]
                ];
            }
        });

        var strToarr=coorstr.split(",");
        return coordata;

    }
    function txtIO(rsmetadatas){
        // var strCoor = JSON.stringify(coorArray(rsmetadatas));
        var transformArr = '';
        for(var i=0;i<rsmetadatas.length;i++){
            // if(i==0){
            //     transformArr += '[\n['+[[rsmetadatas[i].topLeftLongitude,rsmetadatas[i].topRightLatitude],
            //         [rsmetadatas[i].bottomRightLongitude,rsmetadatas[i].topRightLatitude],
            //         [rsmetadatas[i].bottomRightLongitude,rsmetadatas[i].bottomRightLatitude],
            //         [rsmetadatas[i].topLeftLongitude,rsmetadatas[i].bottomRightLatitude]]
            //         +']';
            // }else{
            //     transformArr += '\n['+[[rsmetadatas[i].topLeftLongitude,rsmetadatas[i].topRightLatitude],
            //             [rsmetadatas[i].bottomRightLongitude,rsmetadatas[i].topRightLatitude],
            //             [rsmetadatas[i].bottomRightLongitude,rsmetadatas[i].bottomRightLatitude],
            //             [rsmetadatas[i].topLeftLongitude,rsmetadatas[i].bottomRightLatitude]]+']';
            // }

                transformArr += '[\n['+[[rsmetadatas[i].topLeftLongitude,rsmetadatas[i].topRightLatitude]]
                    +'],';
                transformArr +='\n['+[[rsmetadatas[i].bottomRightLongitude,rsmetadatas[i].topRightLatitude]]+'],';
                transformArr +='\n['+[[rsmetadatas[i].bottomRightLongitude,rsmetadatas[i].bottomRightLatitude]]+'],';
                transformArr +='\n['+[[rsmetadatas[i].topLeftLongitude,rsmetadatas[i].bottomRightLatitude]]+'],';
                transformArr +='\n['+[[rsmetadatas[i].topLeftLongitude,rsmetadatas[i].topRightLatitude]]+']';
                transformArr+='\n]\n'

        }
        transformArr +='\n]';
        var path = global.cfg.tempDir;
        fs.writeFile(path + "/coor.json",transformArr , function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
    function readIO(){
        var path = global.cfg.tempDir;
        fs.readFile(path + "/console.json",'utf-8' , function(err,data) {
            if(err) {
                return console.log(err);
            }
            else{
                console.log("The file was read!");
                var dataArr = data.split('\r\n');
                res.send(JSON.stringify(dataArr));
                 // return data;
            }
            // console.log("The file was saved!");
        });
    }
    query();

});

module.exports = router;
