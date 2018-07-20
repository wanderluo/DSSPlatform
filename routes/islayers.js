/**
 * Created by Administrator on 2018/4/17.
 */
var express = require('express');
var router = express.Router();
var fs=require("fs");
var Promise = require("bluebird");
var tar = require('tar');
var zlib = require('zlib');
var path = require('path');
var util = require('util');
var parseString = require('xml2js').parseString;
var dateformat = require("dateformat")();
var orm = require("orm");
var exec = require('child_process').exec;   //shell 执行系统命令
var iconv = require('iconv-lite');
var encoding = 'cp936';
var binaryEncoding = 'binary';
var stdata = undefined;
//解压
var compressing = require('compressing');

var request = require('request');

var headers = {
    'Content-type': 'text/plain'
};

var dataString = 'file://E:\\data2\\imageryData\\publish\\GF1_PMS1_E85.5_N41.1_20140825_L1A0000316119-MSS1\\GF1_PMS1_E85.5_N41.1_20140825_L1A0000316119-MSS1.tiff';

var options = {
    url: 'http://localhost:8080/geoserver/rest/workspaces/wanderluo/coveragestores/test04201742/external.worldimage',
    method: 'PUT',
    headers: headers,
    body: dataString,
    auth: {
        'user': 'admin',
        'pass': 'geoserver'
    }
};
var uniqueArr = [];

router.get('/auto', function(req, res, next) {
    var queryObj = 'islayer';
    var sort = [];
    var sql = 'islayer is null';
    req.models.automatic_release.find(queryObj,sort).where(sql).all(function(err, rsmetadatas){
        if(err) return res.send("0");
        // Promise.each(rsmetadatas,function(rsmetadata){
        //    console.log(rsmetadata)
        //
        // })
        console.log(options);
        request(options, function callback(error, response, body) {
            if(error) return res.send("0");
            console.log(response.statusCode);
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
            res.send(body);
        });
        // res.send(JSON.stringify(rsmetadatas));
    })
});

router.get('/files', function(req, res, next) {
    var path = 'M:\\hubei2m2017\\wgs841_10w';
    var re = new RegExp(/.*\.tif/);
    var arr = [];
    fs.readdir(path ,'utf-8',function(err,data){
        if(err) {
            return console.log(err);
        }else{

            for (var i = 0; i < data.length; i++) {
                var is_alpha1 = data[i].match(re);
                if(is_alpha1){
                    arr.push(is_alpha1[0]);
                }
            }
            //去重
            Array.prototype.unique = function(){
                var res = [];
                var json = {};
                for(var i = 0; i < this.length; i++){
                    if(!json[this[i]]){
                        res.push(this[i]);
                        json[this[i]] = 1;
                    }
                }
                return res;
            };

            uniqueArr = arr.unique();
             //自动发布
            Promise.each(uniqueArr,function(rsmetadata){
                // console.log(rsmetadata);
                var dataString = 'file://M:\\hubei2m2017\\wgs841_10w\\'+rsmetadata;
                var options = {
                    url: 'http://localhost:8080/geoserver/rest/workspaces/layertest/coveragestores/'+rsmetadata.split(".")[0]+'/external.worldimage',
                    method: 'PUT',
                    headers: headers,
                    body: dataString,
                    auth: {
                        'user': 'admin',
                        'pass': 'geoserver'
                    }
                };
                console.log(dataString);
                console.log(options.url);
                request(options, function callback(error, response, body) {
                    if(error) return res.send("0");
                    res.write(body);
                });
            });
            res.write(JSON.stringify(arr.unique()));

        }
    });

});

router.get('/migrate', function(req, res, next) {
    var queryObj = 'islayer';
    var sort = [];
    var sql = 'islayer is null';
    req.models.rsmetadata.find(queryObj,sort).where(sql).all(function(err, rsmetadatas){
        if(err) return res.send("0");
        Promise.each(rsmetadatas,function(rsmetadata){
            var id = rsmetadata.id;
            var rspath = rsmetadata.rspath;
            // uncompress a file
            var tardir = '/data2/imageryData/products/'+rspath+'.tar.gz';
            var tarfile = '/data2/imageryData/migrate/rs/'+rspath;
            compressing.tgz.uncompress(tardir, tarfile)
                .then(uncompressDone(id,req,res))
                .catch(function(){
                    console.log('解压失败');
                });
            
        });
        console.log('解压文件自动化发布');

    })
});

router.get('/layer', function(req, res, next) {
    var queryObj = 'islayer';
    var sort = [];
    var sql = 'islayer = 1';

    req.models.rsmetadata.find(queryObj,sort).where(sql).all(function(err, rsmetadatas){
        if(err) return res.send("0");
        Promise.each(rsmetadatas,function(rsmetadata){
            var id = rsmetadata.id;
            var rspath = rsmetadata.rspath;

            autolayer(id,rspath,req,res);
        });

        // res.write(JSON.stringify(rsmetadatas));
    })
});

function uncompressDone(id,req,res){
    console.log('解压成功');
    var ofid = id;
    var islayer = 1;
    req.models.rsmetadata.get(ofid,function(err,orderform){
        if(err) return res.send("0");
        orderform.save({islayer:islayer},function(err){
            if(err) return res.end("00state");
            res.json(id+'---');
        })
    })
}

function autolayer(id,rspath,req,res){
    var islayer = 2;
    var ofid = id;
    var dataString = 'file://E:\\data2\\imageryData\\migrate\\rs\\'+rspath+'\\'+rspath+'.tiff';
    var options = {
        url: 'http://localhost:8080/geoserver/rest/workspaces/luo/coveragestores/'+rspath+'/external.worldimage',
        method: 'PUT',
        headers: headers,
        body: dataString,
        auth: {
            'user': 'admin',
            'pass': 'geoserver'
        }
    };

    request(options, function callback(error, response, body) {
        if(error) return res.send("0");
        console.log(response.statusCode);
        // if (!error && response.statusCode == 200) {
        //     console.log(body);
        // }
        req.models.rsmetadata.get(ofid,function(err,orderform){
            if(err) return res.send("0");
            orderform.save({islayer:islayer},function(err){
                if(err) return res.end("00state");
                // res.json(id+'---');
            })
        })
        res.write(body);
    });
}

module.exports = router;