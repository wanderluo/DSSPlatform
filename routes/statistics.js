/**
 * Created by jyb on 17-1-12.
 */
var express = require('express');
var router = express.Router();
var util = require("util");

var satellite = {
    "GF1":{sensorType:{"2":"PAN","8":"MSS","16":"MSS"},revisitPeriod:{"2":"4天","8":"4天","16":"2天"}},
    "GF2":{sensorType:{"1":"PAN","4":"MSS"},revisitPeriod:{"1":"5天","4":"5天"}},
    "GF4":{sensorType:{"50":"MSS"},revisitPeriod:{"50":"20s"}}
}

function supplemantAndArrangeData(dataCollection,type){
    type = type || "year";

    var arrangeResultData = {};
    var satelliteId,imageGSD;

    dataCollection.forEach(function(data){

        satelliteId = data["SatelliteID"];
        imageGSD = data["ImageGSD"];
        if(!arrangeResultData[satelliteId+"|"+imageGSD]) {
            arrangeResultData[satelliteId+"|"+imageGSD]={};
            arrangeResultData[satelliteId+"|"+imageGSD].satelliteId =satelliteId;
            arrangeResultData[satelliteId+"|"+imageGSD].resolution =imageGSD;
            arrangeResultData[satelliteId+"|"+imageGSD].totalStat =(data.totalStat/(1024*1024*1024)).toFixed(2);
            arrangeResultData[satelliteId+"|"+imageGSD].totalSceneCount =data.totalSceneCount;
            arrangeResultData[satelliteId+"|"+imageGSD].month =data.month;
            arrangeResultData[satelliteId+"|"+imageGSD].sensorType=satellite[satelliteId]?satellite[satelliteId].sensorType[imageGSD]:"";
            arrangeResultData[satelliteId+"|"+imageGSD].revisitPeriod=satellite[satelliteId]?satellite[satelliteId].revisitPeriod[imageGSD]:"";
        }

        if(type == "month"){
            delete arrangeResultData[satelliteId+"|"+imageGSD].month;
            delete arrangeResultData[satelliteId+"|"+imageGSD].totalStat;
            delete arrangeResultData[satelliteId+"|"+imageGSD].totalSceneCount;

            if(data.month) arrangeResultData[satelliteId+"|"+imageGSD]["month"+data.month] = (data.totalStat/(1024*1024*1024)).toFixed(2)+"/"+data.totalSceneCount;
        }

    });

    return arrangeResultData;
}

router.get('/year/:startyear/:endyear', function(req, res) {

    var startyear = req.params.startyear;
    var endyear = req.params.endyear;

    if(!startyear || !endyear) return res.send("0");

    var db = req.app.locals.db;
    db.driver.execQuery("select SatelliteID,ImageGSD,sum(stat)totalStat,sum(SceneCount)totalSceneCount from rsmetadata " +
        "where Year(rsmetadata.ReceiveTime) BETWEEN ? and ? GROUP BY SatelliteID,ImageGSD",[startyear,endyear],function(err,results){
        if(err) return res.send("0");
        res.send(JSON.stringify(supplemantAndArrangeData(results)));
    })
});


router.get('/month/:year', function(req, res){

    var year = req.params.year;

    if(!year) return res.send("0");
    var db = req.app.locals.db;
    db.driver.execQuery("select SatelliteID,ImageGSD,Month(rsmetadata.ReceiveTime)month,sum(stat)totalStat,sum(SceneCount)totalSceneCount" +
        " from rsmetadata where Year(rsmetadata.ReceiveTime)=? GROUP BY SatelliteID,ImageGSD,month",[year],function(err,results){
        if(err) return res.send("0");
        res.send(JSON.stringify(supplemantAndArrangeData(results,"month")));
    });
});


router.get('/regions/year', function(req, res) {

    var queryObj = req.query;
    var level = queryObj.level;
    var pcode = queryObj.adcode;
    var year = queryObj.year;

    if(!year || !level || !pcode) return res.send("0");

    var modelName;

    switch(level){
        case "province":
        modelName="viewcitydata";
        break;
        case "city":
        modelName="viewcitydata";
        break;
        default:return res.send("0")
    }

    var db = req.app.locals.db;
    db.driver.execQuery(util.format("select zcode As adcode,name,SatelliteID,SensorID,sum(stat)totalStat,Count(id)total from %s " +
            "where Year(receiveTime)='%s' and pcode='%s' GROUP BY SatelliteID,SensorID,zcode",modelName,year,pcode),
             function(err,results){
               if(err) return res.send("0");
               res.send(JSON.stringify(results));
    });
})

router.get('/region/year', function(req, res) {

    var queryObj = req.query;
    var level = queryObj.level;
    var adcode = queryObj.adcode;
    var year = queryObj.year;

    if(!year || !level || !adcode) return res.send("0");

    var db = req.app.locals.db;
    var modelName = util.format("view%sdata",level);
    db.driver.execQuery(util.format("select Count(id)total,sum(stat)totalStat from %s where zcode='%s' and Year(receiveTime)='%s'",modelName,adcode,year),function(err,results){
        if(err) return res.send("0");
        res.send(JSON.stringify(results));
    });
})

router.get('/region/month', function(req, res) {

    var queryObj = req.query;
    var level = queryObj.level;
    var adcode = queryObj.adcode;
    var year = queryObj.year;

    if(!year || !level || !adcode) return res.send("0");

    var db = req.app.locals.db;
    var modelName = util.format("view%sdata",level);
    db.driver.execQuery(util.format("select SatelliteID,SensorID,Month(receiveTime)month,Count(id)total,sum(stat)totalStat from %s where zcode='%s'" +
        " and Year(receiveTime)='%s' GROUP BY SatelliteID,SensorID,month",modelName,adcode,year),function(err,results){
        if(err) return res.send("0");
        res.send(JSON.stringify(results));
    });
})



module.exports = router;