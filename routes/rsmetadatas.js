/**
 * Created by jyb on 16-12-17.
 */
var express = require('express');
var multiparty = require('multiparty');
var router = express.Router();
var fs=require("fs");
var tar = require('tar');
var zlib = require('zlib');
var path = require('path');
var util = require('util');
var parseString = require('xml2js').parseString;
var dateformat = require("dateformat")();
var orm = require("orm");

function clearFailFile(dir,format){

    fs.readdir(dir,function(err,fileList){

        if(err) return;
        fileList.forEach(function(file){

            if(file.indexOf(format) == -1){

                fs.unlink(path.join(dir,file),function(err){
                    if(err) console.log(err);
                })
            }
        })
     })
}

/**
 * productID
 * sceneID
 */
router.get('/',function(req,res){

    var queryObj = req.query;
    var pageInfo = global.splitPage(queryObj);
    var isSend = {status:false};
    var total = 0;
    var sort = [];
    if(queryObj.sort){
        sort.push(queryObj.sort,"Z");
        delete queryObj.sort;
    }
    // console.log(queryObj);
    //获取多个productID 用 ，（逗号）隔开
    if(queryObj.productID){
        var productID = [];
        var productArray = queryObj.productID.split(/[，, ]/);
        productArray.forEach(function(data){
            productID.push(data);
        });
        queryObj.productID = productID;
    }
    //获取多个productID 用 ，（逗号）隔开
    if(queryObj.sceneID){
        var sceneID = [];
        // console.log(queryObj.sceneID);
        var sceneArray = queryObj.sceneID.split(/[，, ]/);
        // console.log(sceneArray);
        sceneArray.forEach(function(data){
            sceneID.push(data);
        });
        queryObj.sceneID = sceneID;
    }

    req.models.viewrsmetadata.find(queryObj,sort).count(function(err,count){
        if(err) return global.dealError(err,res,isSend);
        total = count;
    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err, rsmetadatas){
        if(err) return global.dealError(err,res,isSend);
        res.send(JSON.stringify({total:total,data:rsmetadatas}));
    })
})
/**
 * 属性查询　
 */
router.post('/property', function(req, res) {

    var queryObj = req.body;
    var sort = [];
    var sql;
    if(queryObj.sort) {
        sort.push(queryObj.sort,"Z");
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
        var satellite = {}
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

                qReturn.limit(pageInfo.limit).offset(pageInfo.offset).all(function(err, rsmetadatas){
                     if(err) return res.send("0");
                     res.send(JSON.stringify({total:count,data:rsmetadatas},function (key,value) {
                         if(!value)
                             return undefined;
                         return value;
                     }));
                 })
        })
    }

    query();

});

/**
 * 产品列表　
 */
router.post("/productManage",function(req, res){

    var queryObj = req.body;
    var sort = [];
    if(queryObj.sort) {
        sort.push(queryObj.sort,"Z");
        delete  queryObj.sort;
    }
    if(queryObj.startReceiveTime){
        queryObj.receiveTime = orm.between(queryObj.startReceiveTime,queryObj.endReceiveTime);
        delete  queryObj.startReceiveTime;
        delete  queryObj.endReceiveTime
    }

    var pageInfo = global.splitPage(queryObj);

    var qReturn = req.models.viewrsmetadata.find(queryObj,sort).count(function(err,count){

        if(err) return res.send("0");

        else qReturn.limit(pageInfo.limit).offset(pageInfo.offset).all(function(err, rsmetadatas){
                if(err) return res.send("0");
                res.send(JSON.stringify({total:count,data:rsmetadatas}));
       })
    })

});

router.get('/productManage', function(req, res, next) {

    var queryObj = req.query;
    var pageInfo = global.splitPage(queryObj);
    var isSend = {status:false};
    var total = 0;
    var sort = [];

    if(queryObj.sort) {
        sort.push(queryObj.sort,"Z");
        delete  queryObj.sort;
    }
    if(queryObj.startReceiveTime){
        queryObj.receiveTime = orm.between(queryObj.startReceiveTime,queryObj.endReceiveTime);
        delete  queryObj.startReceiveTime;
        delete  queryObj.endReceiveTime
    }

    req.models.viewrsmetadata.find(queryObj,sort).count(function(err,count){
        if(err)  return global.dealError(err,res,isSend);
        total = count;
    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err, viewrsmetadatas){
        if(err)  return global.dealError(err,res,isSend);
        res.send(JSON.stringify({total:total,data:viewrsmetadatas}));
    })

});
/**
 * cache 为1代表在订单列表被删除
 * cache 为0代表在历史库被还原
 */
router.put('/:id/cache/:cache',function(req, res){

    var ofid = req.params.id;
    var cache = req.params.cache;
    req.models.rsmetadata.get(ofid,function(err,viewrsmetadata){
        if(err) return res.send("cacheerr");
        viewrsmetadata.save({cache:cache},function(err){
            if(err) return res.end("cacheFail");
            res.send("cacheSuccess");
        })
    })
});

/**
 * 主键删除
 */
router.delete('/:id',function(req, res){

    var ofid = req.params.id;

    req.models.viewrsmetadata.get(ofid,function(err,viewrsmetadata){

        if(err) return res.send("0");

        viewrsmetadata.remove(function(err){
            if(err) return res.send("0");
            res.send("主键删除");
        })
    })
});


router.get('/:id', function(req, res, next) {

    var id = req.params.id;

    req.models.rsmetadata.get(id,function(err,rsmetadata){

        if(err) return res.send("0");
        res.send(JSON.stringify(rsmetadata));
    })
});

/**
 * 返回资源数据
 * @param id 主键
 * @param type 1代表原始压缩包,2代表原图,3代表缩略图
 */
router.get('/:id/resource/:type',function(req,res){

    var id = req.params.id;
    var type = req.params.type;

    req.models.rsmetadata.get(id,function(err,rsmetadata){
        if(err) return res.send("0");
        var downloadDate = new Date().format("yyyy-MM-dd hh:mm:ss");
        var name = rsmetadata.rspath;
        var directory = type == 1 ? global.cfg.productDir : global.cfg.thumbDir;
        var format = type == 1 ? ".tar.gz" : (type == 2 ? ".jpg" : "_thumb.jpg");
        var file = path.join(directory,name + format);
        var downloadLog = {
            rsid:id,
            type:type,
            rsname:name,
            file:file,
            downloadDate:downloadDate
        };
        res.download(file,name + format,function(err){
            if(err) {
                return res.send("0");
            }
            else {
                //当下载产品数据时，记录至数据库
                if(type == '1'){
                    console.log('下载中...');
                    req.models.downloadlog.create(downloadLog,function(err){
                        if(err) return res.send("0");
                    })
                }
                else{
                    // return res.send('id:'+id+' type:'+type+' name:'+name+' file:'+file);
                    // return res.send('2');
                }

            }
        })
    })
});

// 离线地图瓦片
router.get('/offline/:baselayer/:z/:x/:y',function(req,res){
    var baselayer = req.params.baselayer;
    var x = req.params.x;
    var y = req.params.y;
    var z = req.params.z;

    var name = y;

    var directory = global.cfg.offlineDir+baselayer+'/'+z+'/'+x;
    var file = path.join(directory,name);
    res.download(file,name,function(err){
        // console.log(err);
        if(err) res.send("0");
    })

});

// 离线地图注记瓦片
router.get('/offlineMark/:baselayer/:z/:x/:y',function(req,res){
    var baselayer = req.params.baselayer;
    var x = req.params.x;
    var y = req.params.y;
    var z = req.params.z;
    // console.log(x,y,z);
    var name = y;
    console.log(baselayer);

    var directory = global.cfg.offlineMarkDir+baselayer+'/'+z+'/'+x;
    // var format =  ".png";
    var file = path.join(directory,name);

    console.log(file,name);
    res.download(file,name,function(err){
        // console.log(err);
        if(err) res.send("0");
    })

});

router.get('/exist/:name',function(req,res){

    var name = req.params.name;
    if(!name) res.send("1");
    name = name.replace(".tar.gz","");
    req.models.rsmetadata.find({rspath:name},function(err,rsmetadatas){

        if(err) return res.send("1");

        if(rsmetadatas.length > 0) return res.send("1");

        res.send("0");
    })
});

/**
 * 原始压缩包上传
 */
router.post('/', function (req,res){

  var form = new multiparty.Form({uploadDir:global.cfg.productDir,
        allocate:1000 * 1024 * 1024});

   var extractor = tar.Extract({path:global.cfg.thumbDir
   });

   var uid = req.session.user.id;
   form.parse(req, function(err, fields, files) {
       console.log("111");
       if(err) return res.json({status:0});
       var file = files.fileUpload[0];
       var fileName = file.originalFilename.replace(".tar.gz","");
       var oldPath = file.path;
       var newPath = path.join(global.cfg.productDir,file.originalFilename);
       console.log(newPath);
       fs.rename(oldPath,newPath,function(err){
          // console.log(err);
           console.log("222");
           if(err) return res.json({status:0});
           console.log(err);
           fs.createReadStream(newPath).pipe(zlib.Gunzip()).pipe(extractor).on("close",function(){
               var filePath =  path.join(global.cfg.thumbDir,fileName);

               fs.readFile(filePath + ".xml",function(err,data){
                   if(err) {
                       console.log(err);
                       clearFailFile(cfg.thumbDir,"jpg")
                       return res.json({status:0});
                   }

                   parseString(data,{ explicitArray:false, ignoreAttrs:true }, function(err, result) {
                       console.log("555");
                       if(err) {
                           console.log("666");
                           clearFailFile(cfg.thumbDir,"jpg");
                           return res.json({status:0});
                       }

                       fs.unlink(filePath + ".xml",function(err){if(err) console.log(err);});
                       fs.unlink(filePath + ".tiff",function(err){if(err) console.log(err);});
                       fs.unlink(filePath + "_dem.tiff",function(err){if(err) console.log(err);});
                       fs.unlink(filePath + ".rpb",function(err){if(err) console.log(err);});

                       var record = {rspath:fileName,uploadTime:new Date().format("yyyy-MM-dd hh:mm:ss")};

                       for(var key in result.ProductMetaData){
                           console.log("777");
                           if(!result.ProductMetaData[key]) continue;
                           record[key[0].toLowerCase() + key.substring(1)] = result.ProductMetaData[key];
                       }
                       for(var key in result.ProductMetaData){
                           if(!result.ProductMetaData[key]) continue;
                           record[key[0].toLowerCase() + key.substring(1)] = result.ProductMetaData[key];
                       }

                       record.uid = uid;

                       req.models.rsmetadata.create(record,function(err){
                           console.log("888");
                           if(err) return res.json({status:0});
                           res.json({status:1});
                       })
                   })
               });
           }).on("error",function(err){ clearFailFile(cfg.thumbDir,"jpg"); res.json({status:0});})
       });
    });
});


module.exports = router;
