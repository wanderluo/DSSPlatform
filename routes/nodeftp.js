/**
 * Created by Administrator on 2018/4/13.
 */

var express = require('express');
var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var async = require("async");
var Client = require('ftp');
var router = express.Router();
var request = require('request');
var cheerio = require("cheerio");
var orm = require("orm");
const puppeteer = require('puppeteer');
//解压
var compressing = require('compressing');

var gfcookie;
var productsGF1Id = [];
var productsGF2Id = [];
var productsGF3Id = [];
var productsGF4Id = [];
var productsGF1 = [];
var productsGF2 = [];
var productsGF3 = [];
var productsGF4 = [];

var client;
function callback(error, response, body) {
    // console.log(error);
    if (!error) {
        var $ = cheerio.load(body);
        console.log(body);
        var result = [];
        res.write(body)
    }
}
function gfdataflow(data,satellite){
    if(satellite == 'GF1'){
        for (var i=0;i<data.features.length;i++){
            productsGF1Id.push(data.features[i].attributes.PRODUCTID);
            productsGF1.push(data.features[i].attributes.METADATAID+'_ZywxImage1a');
        }
    }
    if(satellite == 'GF2'){
        for (var j=0;j<data.features.length;j++){
            productsGF2Id.push(data.features[j].attributes.PRODUCTID);
            productsGF2.push(data.features[j].attributes.METADATAID+'_ZywxImage1a');
        }
    }
    if(satellite == 'GF3'){
        for (var k=0;k<data.features.length;k++){
         
            productsGF3Id.push(data.features[k].attributes.PRODUCTID);
            productsGF3.push(data.features[k].attributes.METADATAID+'_ZywxImage1a');
        }
    }
    if(satellite == 'GF4'){
        for (var l=0;l<data.features.length;l++){
            productsGF4Id.push(data.features[l].attributes.PRODUCTID);
            productsGF4.push(data.features[l].attributes.METADATAID+'_ZywxImage1a');
        }
    }
}
function getcookie(){
    (async () => {
        const browser = await (puppeteer.launch({ executablePath: cfg.chromepath, headless: false ,timeout: 60000,}));
        const page = await browser.newPage();
// 进入页面
    await page.goto('http://218.247.138.119:7777/DSSPlatform/shirologin.html');

// 点击搜索框
    const username = 'username';
    const password = 'password';
    const lala = '';
    await page.type('#username', username, {delay: 0});
    await page.type('#password', password, {delay: 0});
    await page.type('#validatecode', lala, {delay: 0});

    await page.keyboard.press('Enter');

    const page1 = await browser.newPage();
// 进入验证码
    await page1.goto('http://218.247.138.119:7777/DSSPlatform/getvalidCode.html');

// 获取验证码
    await page1.waitFor(2000);

    const aHandle = await page1.evaluateHandle(() => document.querySelector("pre"));
    const resultHandle = await page1.evaluateHandle(body => body.innerHTML, aHandle);
    const num = await resultHandle.jsonValue();
    // console.log(num);
    let inputElement = await page.$('#validatecode');

    await page.type('#validatecode', num, {delay: 0});

    await page.keyboard.press('Enter');

    var cookies = await page.cookies('http://218.247.138.119:7777/DSSPlatform/orderinfo/orderform.html?method=query');
    var cookie = cookies[0].name+'='+cookies[0].value;
    console.log(cookie);
    browser.close();
    gfcookie = cookie;
})();
}

function gfmode(rspath){
    var gfname = rspath;
    var mode = gfname.split("_");
    if(mode[0]=='GF3'){
        if(mode[2]=='SL'||mode[2]=='UFS'){
            return gfname;
        }else if(mode[2]=='QPSI'||mode[2]=='QPSII'){
            return gfname.replace(mode[8], "AHV");
        }else if(mode[2]=='FSI'||mode[2]=='SS'||mode[2]=='WSC'||mode[2]=='GLO'||mode[2]=='NSC'||mode[2]=='EXT'){
            if(mode[8]=='HH'||mode[8]=='HV'){
                return gfname.replace(mode[8], "HHHV")
            }else{
                return gfname.replace(mode[8], "VHVV")
            }
        }else if(mode[2]=='FSII'){
            if(mode[8]=='HH'||mode[8]=='HV'){
                return gfname.replace(mode[8], "HHHV")
            }else{
                return gfname.replace(mode[8], "VHVV")
            }
        }else{
            return gfname;
        }
    }else{
        return gfname;
    }
}
// console.log(gfmode('GF3_KRN_QPSI_009649_E113.3_N30.6_20180610_L1A_HV_L10003251866'));
function endftp(into,client){
    if(into){
        client.end();
    }
    console.log(into+"-重新连接FTP");
    setTimeout(runftp,300000);

}
function runftp(){
    var options = {
        url: 'http://127.0.0.1:7777/nodeftp/ftp',
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
            'Connection': 'keep-alive'
        },
        gzip:true
    };
    request(options, function callback(err, response, body) {
        console.log('129_'+err);
        if(err) return endftp();
        if (!err){
            console.log(body);
        }
    });
}
  setTimeout(runftp,120000);

function runstate(){
    var options = {
        url: 'http://127.0.0.1:7777/nodeftp/state',
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
            'Connection': 'keep-alive'
        },
        gzip:true
    };
    request(options, function callback(err, response, body) {
        console.log('149_'+err);
        if(err) return runstate();
        if (!err){
            console.log(body);
        }
    });
}
  runstate();
function uncompressDone(id,req,res){
    console.log('解压成功');
    var ofid = id;
    var state = 2;
    req.models.rsdata.get(ofid,function(err,orderform){
        if(err) return res.send("0");
        orderform.save({state:state},function(err){
            if(err) return res.end("00state");
            // res.json(id+'---');
        })
    })
}
//确定时间差
function downloadovertime(startTime){
   
    var startTimestamp = new Date(startTime).getTime();
    var endTimestamp = new Date().getTime();
  
    if(startTimestamp > endTimestamp){
        // console.log("起始日期应在结束日期之前");
        return false;
    }
    if((endTimestamp-startTimestamp)>2*24*60*60*1000){
        console.log("时间段最长为一天");
        return true;
    }
    return false;
}

//获取采集时间
function formatDate(date){
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate()-1;
    d = d < 10 ? ('0' + d) : d;
    return y + '' + m + '' + d;
}
//定时执行 向中国资源卫星网提交订单
var timeTask=setInterval(function(){
    var date=new Date();
    var h=date.getHours();
    var m=date.getMinutes();
    var s=date.getSeconds();
    if(h==9&&m==30&&s==0){
        callFunction();
    }
},1000);
function callFunction(){
    var calltime = formatDate(new Date());
    var options = {
        url: 'http://127.0.0.1:7777/nodeftp/olmysql',
        // url: 'http://127.0.0.1:7777/nodeftp/olmysql?stime='+calltime+'&etime='+calltime+'&remark=dsspl'+calltime+'',
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
            'Connection': 'keep-alive'
        },
		form: {
            stime: calltime,
            etime: calltime,
            remark: 'dsspl'+calltime
        },
        gzip:true
    };
    request(options, function callback(err, response, body) {
        console.log('253_'+err);
        if(err) return console.log(err);
        // return res.send('中国资源卫星网提交订单');
    });
}
// callFunction();

router.get('/ftp',function(req, res){
    
    var connectionProperties = {
        host: "218.247.138.123",
        user: "root",
        password: "******"
    };
    var db = req.app.locals.db;
    db.driver.execQuery("SELECT * FROM rsdata WHERE state is null;",function(err,results){
        console.log("183-"+err);
        if (err || results.length == 0) {
            console.log("队列为空");	res.end('暂无数据下载');
            return endftp();
        }
		// 判断是否生成订单号
        if (!results[0].orderid) {
            console.log("未生成订单号");	res.end('该数据无法下载');
            req.models.rsdata.get(results[0].id,function(err,orderform){
                if(err) return endftp();
                orderform.save({state:102},function(err){
                    if(err) return endftp();
                    console.log('产品无法下载,state = 102');
                    return endftp();
                })
            })
        }
        //判断是否超时，数据不存在或无法下载
        var downloadover = downloadovertime(results[0].produceTime);
        if (downloadover) {
            console.log("找不到下载地址");	res.end('该数据无法下载');
            req.models.rsdata.get(results[0].id,function(err,orderform){
                if(err) return endftp();
                orderform.save({state:101},function(err){
                    if(err) return endftp();
                    console.log('产品无法下载,state = 101');
                    return endftp();
                })
            })
        }
		
		res.end('数据下载中：'+results[0].pathin+results[0].gfname+'.tar.gz');
        var result = results[0];
        var dir = result.rspath+result.gfname+'.tar.gz';
        // console.log(dir);
        var total;
        client = new Client();
        client.on('ready', function() {
            //  download
            client.size(dir, function(err,numBytes) {
                total = numBytes;
                console.log('文件大小_198_'+numBytes);
            })
            client.get(dir, function(err,stream) {
                var fileSize = 0;
                console.log("202-"+err);
                if (err) return endftp(170,client);
                // 创建一个可以写入的流，写入到文件中
                var filedir = result.pathin;
                // console.log(filedir);
                if (!fs.existsSync(filedir)) {
                    fs.mkdirSync(filedir);
                }
                var writerStream = fs.createWriteStream(result.pathin+result.gfname+'.tar.gz');

                stream.on('data', function(chunk) {
                    fileSize += chunk.length;
                    // console.log(fileSize);
                    // console.log(result.pathin+result.gfname+'.tar.gz :'+(fileSize/total*100).toFixed(2)+'% ');

                });
                stream.on('finish', function() {
                    console.log('download_finish');
                    req.models.rsdata.get(result.id,function(err,orderform){
                        console.log("221-"+err);
                        if(err) return endftp(222,client);
                        // state = 1
                        if((orderform.satelliteID == 'GF1' && (orderform.sensorID == 'PMS1' || orderform.sensorID == 'PMS2'))|| orderform.satelliteID == 'GF2'){
                            orderform.save({rstate:1,state:1},function(err){
                                console.log("226-"+err);
                                if(err) return endftp(227,client);
                                runstate();
                                console.log('产品已下载,state = 1,rstate = 1');
                                return endftp(1,client);
                            })
                        }else{
                            orderform.save({rstate:1,state:5},function(err){
                                console.log("234-"+err);
                                if(err) return endftp(235,client);
                                console.log('产品已下载,state = 5,rstate = 1');
                                return endftp(237,client);
                            })
                        }

                    })
                });

                stream.on('error', function(err){
                    console.log('download_error');
                    return endftp(246,client);
                });
                // stream.once('finish', function() {
                //     console.log('client_once_finish');
                //     client.end();
                // });
                stream.pipe(writerStream);

            });
        });
        client.connect(connectionProperties);

    })

});

router.get('/DSSPlatform',function(req,res){

    var options = {
        // url: 'http://218.247.138.119:7777/KQGis/rest/services/GF1/MapServer/Query',
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',

        },
        gzip:true,
        form: {
            page:0,
            pageSize:5000,
            // where: "cloudpercent <= 100 and SCENEDATE > =20180508 and SCENEDATE <=20180508 and sensorid in('PMS','PMS1','PMS2','WFV1','WFV2','WFV3','WFV4') and ISRELEASE = 'TRUE'",
            // layers:'ZYWX.META_GF1_1',
            geometry:global.query.geometry,
            fields:global.query.fields
        }
    };

    function asyncfun(callback,index){
        options.url =  'http://218.247.138.119:7777/KQGis/rest/services/GF'+(index+1)+'/MapServer/Query';
        options.form.layers = global.query.layers[index];
        options.form.where = "cloudpercent <= 100 and SCENEDATE > ="+global.query.stime+" and SCENEDATE <="+global.query.etime+" and sensorid in"+global.query.sensor[index]+" and ISRELEASE = 'TRUE'";
        request(options, function(err, response, body) {
            var data = JSON.parse(body);
            callback(err,data);
        });
    }

    async.series([
        function(callback){
            asyncfun(callback,0)
        },
        function(callback){
            asyncfun(callback,1)
        },
        function(callback){
            asyncfun(callback,2)
        },
        function(callback){
            asyncfun(callback,3)
        },
        ], function(err, results){
        if(err) return res.send("0");

            for (var i=0;i<results.length;i++){
                if(results[i].features){
                    for (var j=0;j<results[i].features.length;j++){
                        allCount.push(results[i].features[j].attributes);
                        productsId.push(results[i].features[j].attributes.PRODUCTID)
                    }
                }
            }
            console.log(productsId);
        return res.send(allCount)
        });

});

router.get('/shopcar',function(req,res){
    var options = {
        url: 'http://218.247.138.119:7777/DSSPlatform/shopcar/shopcar.html?method=productsave',
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
            'Cookie': global.query.Cookie,
            'Connection': 'keep-alive'
        },
        gzip:true,
        form: {
            isProduceOrder:'NO',
            products:global.query.products
        }
    };

    request(options, function callback(err, response, body) {
        if(err) return res.send(err);
        if (!err){
            console.log(body);
        }
        res.send(body);
    });
});

router.get('/orders',function(req,res){
    var link = [];
    var options = {
        url: 'http://218.247.138.119:7777/DSSPlatform/orderinfo/orderform.html?method=query',
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
            'Cookie': 'JSESSIONID=73BD1AA19057ECBDC45B86F9F4A8F833',
            'Connection': 'keep-alive'
        },
        gzip:true,
    };

    request(options, function(err, response, body) {
        if(err) return res.send(err);
        if (!err){
            var $ = cheerio.load(body);
            var img = $('')
        }
        // console.log(link);
        res.send(body);
    });
});

router.get('/addordes',function(req,res){

    async.series([
        function(callback){
            var options = {
                url: 'http://218.247.138.119:7777/DSSPlatform/shopcar/shopcar.html?method=commitQuery',
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
                    'Cookie': global.query.Cookie,
                    'Connection': 'keep-alive'
                },
                gzip:true,
                form: {
                    orderIds:'12705244,12705245',
                    // ordername:'12705244',
                    currPage:'1',
                    pageSize:'100'
                }
            };

            request(options, function(err, response, body) {
                if(err) return res.send(err);
                if (!err){
                    // console.log(body);
                    console.log('填写核对订单信息 OK');
                }
                callback(err,'填写核对订单信息 OK');
            });
        },
        function(callback){
            var options = {
                url: 'http://218.247.138.119:7777/DSSPlatform/shopcar/shopcar.html?method=commit',
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
                    'Cookie': global.query.Cookie,
                    'Connection': 'keep-alive'
                },
                gzip:true,
                form: {
                    currPage:'1',
                    pageSize:'100',
                    ordername:'cs0516002',
                    remark:'自动化测试'
                }
            };

            request(options, function(err, response, body) {
                if(err) return res.send(err);
                if (!err){
                    console.log('成功提交订单 OK');
                }
                callback(err,'成功提交订单 OK');
            });
        }
    ],function(err, results) {
        if(err) return res.send(err);
        console.log(results);
        res.send(results);
    });
});

router.post('/olmysql',function(req,res){
    getcookie();
    // console.log(gfcookie);
	
	productsGF1Id = [];
    productsGF2Id = [];
    productsGF3Id = [];
    productsGF4Id = [];
    productsGF1 = [];
    productsGF2 = [];
    productsGF3 = [];
    productsGF4 = [];
	
    var rsdatas = {};
    var allCount = [];
    var productsId = [];
    var orders = [];
    var ordersId = [];
    var orderproductid = [];
    var rsids = [];

    // var queryObj = req.query;
    var queryObj = req.body;
    var params = req.params;
    var formid = 7777;
    var curDate=new Date();
    var ordernum=curDate.getTime();
    // console.log(queryObj);

    async.series([
        function(call){
            var orderformRecord = {
                formid:formid,
                stime:queryObj.stime,
                etime:queryObj.etime,
                cookie:gfcookie,
                ordername:ordernum,
                ordernum:ordernum,
                uploadtime:new Date().format("yyyy-MM-dd hh:mm:ss"),
                fields:global.query.fields
            };

            req.models.dssplat.create(orderformRecord,function(err,user){
                if(err) return res.send("0");
                call(err,"数据导入数据库 OK");
            })
        },
        function(call){
            var options = {
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
                },
                gzip:true,
                form: {
                    page:0,
                    pageSize:5000,
                    base64:1,
                    unionGeometry:1,
                    // where: "cloudpercent <= 100 and SCENEDATE > =20180508 and SCENEDATE <=20180508 and sensorid in('PMS','PMS1','PMS2','WFV1','WFV2','WFV3','WFV4') and ISRELEASE = 'TRUE'",
                    // layers:'ZYWX.META_GF1_1',
                    geometry:global.query.geometry,
                    fields:new Buffer(global.query.fields).toString('base64')
                    // fields:global.query.fields
                }
            };

            function asyncfun(callback,index){
                options.url =  'http://218.247.138.119:7777/KQGis/rest/services/GF'+(index+1)+'/MapServer/Query';
                options.form.layers = new Buffer(global.query.layers[index]).toString('base64');
                options.form.where = new Buffer(" cloudpercent <= 100 and SCENEDATE > ="+queryObj.stime+" and SCENEDATE <="+queryObj.etime+" and sensorid in"+global.query.sensor[index]+" and ISRELEASE = 'TRUE'").toString('base64');
                // options.form.layers = global.query.layers[index];
                // options.form.where = " cloudpercent <= 100 and SCENEDATE > ="+queryObj.stime+" and SCENEDATE <="+queryObj.etime+" and sensorid in"+global.query.sensor[index]+" and ISRELEASE = 'TRUE'";

                // console.log(options.form.where);
                request(options, function(err, response, body) {
                    console.log('538-'+err);
                    if(err) return res.send(err);
                    // console.log(body);
                    if(typeof(body) == 'string'){
                        var data = JSON.parse(body);
                        // if(data.message == 'No any links have been found'){}
                        if(data.features){
                            gfdataflow(data,data.features[0].attributes.SATELLITEID);
                        }
                    }

                    callback(err,data);
                });
            }

            async.series([
                function(callback){
                    asyncfun(callback,0)
                },
                function(callback){
                    asyncfun(callback,1)
                },
                function(callback){
                    asyncfun(callback,2)
                },
                function(callback){
                    asyncfun(callback,3)
                },
            ], function(err, results){
                if(err) return res.send("0");
                // console.log(results);
                for (var i=0;i<results.length;i++){
                    if(results[i].features){
                        for (var j=0;j<results[i].features.length;j++){
                            allCount.push(results[i].features[j].attributes);
                            productsId.push(results[i].features[j].attributes.PRODUCTID);
                            var strrdate = new Date().format("yyyy-MM-dd");
                            var strr = results[i].features[j].attributes.BROWSEFILELOCATION;
                            var arry = strr.split("/");
                            var rspath = arry[arry.length-1].split(".jpg")[0];
                            var gfname = gfmode(rspath);
                            var rsurl = '/'+arry[arry.length-2]+'/'+arry[arry.length-1].split(".jpg")[0];
                            rsdatas = {
                                satelliteID:results[i].features[j].attributes.SATELLITEID,
                                sensorID:results[i].features[j].attributes.SENSORID,
                                sceneID:results[i].features[j].attributes.SCENEID,
                                productID:results[i].features[j].attributes.PRODUCTID,
                                productLevel:results[i].features[j].attributes.PRODUCTLEVEL,
                                gfname:gfname,
                                rspath:'/'+strrdate+'/'+ordernum+'/',
                                pathin:global.cfg.orgDir+strrdate+'/',
                                pathout:global.cfg.outDir+strrdate+'/',
                                gfpath:global.cfg.gfDir+strrdate+'/',
                                produceTime:new Date().format("yyyy-MM-dd hh:mm:ss"),
                            };
                            req.models.rsdata.create(rsdatas,function(err,rsdata){
                                console.log('583-'+err);
                                if(err) return res.send("0");
                                rsids.push(rsdata.id);
                                // console.log("插入新的行rsdata OK");
                            })

                        }
                    }
                }
                // console.log(allCount);
                call(err,"查询数据 OK")
            });
        },
        function(call){
            function asyncfun(callback,index){
                if(index){
                    // console.log(index);
                    var options = {
                        url: 'http://218.247.138.119:7777/DSSPlatform/shopcar/shopcar.html?method=productsave',
                        method: 'POST',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
                            'Cookie': gfcookie,
                            'Connection': 'keep-alive'
                        },
                        gzip:true,
                        form: {
                            isProduceOrder:'NO',
                            products:index.join(",")
                        }
                    };
                    request(options, function(err, response, body) {
                        console.log('625-'+err);
                        if(err) return res.send(err);
                        if (!err){
                            callback(err,body);
                        }
                    });
                }
            }
            async.series([
                function(callback){
                    asyncfun(callback,productsGF1)
                },
                function(callback){
                    asyncfun(callback,productsGF2)
                },
                function(callback){
                    asyncfun(callback,productsGF3)
                },
                function(callback){
                    asyncfun(callback,productsGF4)
                },
            ], function(err, results){
                if(err) return res.send("0");
                // console.log(results);
                call(err,"添加购物车 OK")
            });

        },
        function(call){
            var options = {
                url: 'http://218.247.138.119:7777/DSSPlatform/shopcar/shopcar.html?method=query&ajax=true',
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
                    'Cookie': gfcookie,
                    'Connection': 'keep-alive'
                },
                gzip:true,
                form: {
                    currPage:'1',
                    pageSize:'100'
                }
            };
            request(options, function(err, response, body) {
                if(err) return res.send(err);
                if (!err){
                    var $ = cheerio.load(body);
                    var shopcardata = $('#data_list .gwc4 .checkbox-group-content .ul3 li');
                    shopcardata.each(function(index,element){
                        var orderid = shopcardata.eq(index).find('input[type="checkbox"]').attr('id');
                        var productstr = shopcardata.eq(index).find($('.w3 p:nth-of-type(2)')).text();
                        var productid= productstr.replace(/[^0-9]/ig,"");
                        orders.push({orderid:orderid,productid:productid});

                    });
                }
                // console.log('orders'+orders);
                for (var i=0;i<productsId.length;i++){
                    if(orders[i].orderid){
                        ordersId.push(orders[i].orderid);
                        var db = req.app.locals.db;

                        db.driver.execQuery("UPDATE rsdata SET orderid = '"+orders[i].orderid+"' WHERE productID = '"+orders[i].productid+"' ",function(err,results){

                            if(err) return res.send("0");
                            // console.log(results);
                        })
                    }else{
                        ordersId.push('');
                    }
                    // orderproductid.push(orders[i].productid)
                }
                var order = {
                    acktime:new Date().format("yyyy-MM-dd hh:mm:ss"),
                    ordername:ordernum,
                    remark:queryObj.remark,
                    state:'1',  //新开订单号
                    ordernum:ordernum,

                };
                var records = [];
                var isSend  = {status:false};
                req.models.orderform.create(order,function(err,orderform){
                    if(err) return res.send("0");
                    console.log("订单号oederform OK");
                    if(Array.isArray(ordersId)){
                        // console.log(ordersId);
                        ordersId.forEach(function(rsid,index){
                            records.push({
                                rsid:rsids[index],
                                // orderid:rsid,
                                ofid:orderform.id
                                
                            })
                        });
                    }
                    else records = {rsid:ordersId,ofid:orderform.id};
                    // console.log(records);
                    req.models.orderformdetail.create(records,function(err){
                        console.log('724-'+err);
                        if(err) return res.send(err);
                    });
                })
                call(err,"获取订单号 OK")
            });
        },
        function(call){
            async.series([
                function(callback){
                    var options = {
                        url: 'http://218.247.138.119:7777/DSSPlatform/shopcar/shopcar.html?method=commitQuery',
                        method: 'POST',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
                            'Cookie': gfcookie,
                            'Connection': 'keep-alive'
                        },
                        gzip:true,
                        form: {
                            orderIds:ordersId.join(','),
                            currPage:'1',
                            pageSize:'100'
                        }
                    };
                    request(options, function(err, response, body) {
                        console.log('750-'+err);
                        if(err) return res.send(err);
                        if (!err){
                            console.log('填写核对订单信息 OK');
                        }
                        callback(err,'填写核对订单信息 OK');
                    });
                },
                function(callback){
                    var options = {
                        url: 'http://218.247.138.119:7777/DSSPlatform/shopcar/shopcar.html?method=commit',
                        method: 'POST',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
                            'Cookie': gfcookie,
                            'Connection': 'keep-alive'
                        },
                        gzip:true,
                        form: {
                            currPage:'1',
                            pageSize:'100',
                            ordername:ordernum,
                            remark:queryObj.remark
                        }
                    };
                    request(options, function(err, response, body) {
                        console.log('776-'+err);
                        if(err) return res.send(err);
                        if (!err){
                            console.log('成功提交订单 OK');
                        }
                        callback(err,'成功提交订单 OK');
                    });
                }
            ],function(err, results) {
                console.log('785'+err);
                if(err) return res.send(err);
                // console.log(results);
                call(err,"成功提交订单 OK");
            });
        }
    ],function(err, results) {
        if(err) return res.send(err);
        console.log(results);
        return res.send(JSON.stringify(results));
    });


});

router.get('/state', function(req, res, next) {
    var queryObj = 'state';
    var sort = [];
    var sql = "state = '1'";
    req.models.rsdata.find(queryObj,sort).where(sql).all(function(err, rsmetadatas){
        if(err) return res.send("0");
        Promise.each(rsmetadatas,function(rsmetadata){
            var id = rsmetadata.id;
            var rspath = rsmetadata.pathin+rsmetadata.gfname;
            var pathoutpath = cfg.pathoutDir+rsmetadata.pathin.split('/')[4];
            var gfpath = pathoutpath+'/'+rsmetadata.gfname;
            console.log(gfpath);
            // uncompress a file
            var tardir = rspath+'.tar.gz';

            if (!fs.existsSync(pathoutpath)) {
                fs.mkdirSync(pathoutpath);
                if (!fs.existsSync(gfpath)) {
                    fs.mkdirSync(gfpath);
                }
            }
            compressing.tgz.uncompress(tardir, gfpath)
                .then(uncompressDone(id,req,res))
                .catch(function(){
                    console.log('解压失败');
                });
        });
        // console.log('解压文件自动化发布');
        res.end('Unzip the file')
    })
});


module.exports = router;
