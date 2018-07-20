/**
 * Created by jyb on 17-2-8.
 */

var express = require('express');
var orm = require("orm");
var router = express.Router();

router.get('/',function(req,res){

    var queryObj = req.query;
    var sort = ["code","A"];
    if(queryObj.dpi) queryObj.dpi = orm.lte(parseFloat(queryObj.dpi));

    req.models.viewsensor.find(queryObj,sort,function(err,sensors){
        console.log(err);
        if(err) return res.send("0");
        var ids = [];
        var resultSensors = [];
        sensors.forEach(function(sensor){

            if(ids.indexOf(sensor.id) == -1){
                ids.push(sensor.id);
                resultSensors.push(sensor);
            }
        });
        res.send(JSON.stringify(resultSensors));
    })
}), 
    
router.post('/', function (req, res) {
        var dpi = parseInt(req.body.addResolution);  //分辨率
        var orderformRecord = {
            code:req.body.satelliteName,     //卫星名
            satCode:req.body.addSensor    //传感器
        };
        var Record = {
            type:req.body.addSensor,
            dpi:dpi
        }
      //  var rsids = req.body["rsids[]"];  //

        var records = [];
        var isSend  = {status:false};
        req.models.sensor.create(orderformRecord,function(err,orderform){
            Record.senId = orderform.id;
            if(err) return global.dealError(err,res,isSend);
            records = { code:req.body.satelliteName,description:req.body.sateIntro};
            req.models.satellite.create(records,function(err){
                if(err) return global.dealError(err,res,isSend);
                res.send("1");
            });
            req.models.resolution.create(Record,function(err){
                if(err) return res.send("0");

            })

        });
    })


module.exports = router;