/**
 * Created by jyb on 17-1-19.
 */
var express = require('express');
var fs=require("fs");
var path = require('path');
var orm = require("orm");
var router = express.Router();
var Promise = require("bluebird");
var multiparty = require('multiparty');

var attachFileFormat = ".jpg";
var request = require("request");
/**
 * state 为1代表生成订单
 * state 为2代表审核订单
 */
router.get('/', function(req, res, next) {
    var queryObj = req.query;
    var pageInfo = global.splitPage(queryObj);
    var isSend = {status:false};
    var total = 0;
    var sort = [];
    if(queryObj.sort) {
        sort.push(queryObj.sort,"Z");
        delete  queryObj.sort;
    }

    req.models.orderform.find(queryObj,sort).count(function(err,count){

        if(err)  return global.dealError(err,res,isSend);
        total = count;
    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err, orderforms){

        if(err)  return global.dealError(err,res,isSend);
        res.send(JSON.stringify({total:total,data:orderforms}));
    })
});

router.get('/users', function(req, res, next) {

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
        queryObj.generateTime = orm.between(queryObj.startReceiveTime,queryObj.endReceiveTime);
        delete  queryObj.startReceiveTime;
        delete  queryObj.endReceiveTime
    }

    req.models.vieworderform.find(queryObj,sort).count(function(err,count){
        if(err)  return global.dealError(err,res,isSend);
        total = count;
    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err, vieworderforms){
        if(err)  return global.dealError(err,res,isSend);
        res.send(JSON.stringify({total:total,data:vieworderforms}));
    })
    
});

router.get('/:id', function(req, res) {

    var id = req.params.id;

    req.models.orderform.get(id,function(err,orderform){

        if(err) return res.send("0");
        res.send(JSON.stringify(orderform));
    })
});

router.get('/:orderNo/attach', function(req, res, next) {

    var name = req.params.orderNo;
    var directory = global.cfg.attachDir;
    var file = path.join(directory,name + attachFileFormat);
    res.download(file,name + attachFileFormat,function(err){
        if(err) res.send("数据领用登记表未上传")
    })
});


router.get('/:id/rsmetadatas', function(req, res, next) {

    var id = req.params.id;
    var queryObj = req.query;
    var isSend = {status:false};
    var pageInfo = global.splitPage(queryObj);
    var total = 0;
    var key = queryObj.sort;

    req.models.orderform.get(id,function(err,orderform){

        if(err) return res.send("0");
        req.models.orderformdetail.find({ofid:orderform.id}).count(function(err,count){
            if(err) return global.dealError(err,res,isSend);
            total = count;
        }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err,orderformdetails){

            if(err || orderformdetails.length == 0) return global.dealError(err,res,isSend);
            Promise.each(orderformdetails.map(orderformdetail => req.models.rsmetadata.getAsync(orderformdetail.rsid)),function(rsmetadata,index){

            }).then(function(rsmetadatas){
                if(key){
                    rsmetadatas = rsmetadatas.sort(function(a,b){
                        if(a[key] > b[key]) return -1;
                        else if(a[key] < b[key]) return 1;
                        else return 0
                    })
                }
                res.send(JSON.stringify({total:total,data:rsmetadatas}));
            }).catch(err=>res.send("0"));
        })
    })
});

/**
 * 新增操作
 * @param{
 * generateTime
 * rsid数组类型,该订单包含的多个物品
 * orderNo订单号
 * }
 */
router.post('/', function (req, res) {

    var orderformRecord = {
        generateTime:req.body.generateTime,
        ackTime:new Date().format("yyyy-MM-dd hh:mm:ss"),
        description:req.body.description,
        state:1,
        uid:req.session.user.id,
        name:req.body.name,
        orderNo:req.body.orderNo,
        cache:0
    }

    var rsids = req.body["rsids[]"];
    var records = [];
    var isSend  = {status:false};
    var uid = req.session.user.id;
    req.models.orderform.create(orderformRecord,function(err,orderform){
        if(err) return global.dealError(err,res,isSend);
        if(Array.isArray(rsids)){
            rsids.forEach(function(rsid){
                records.push({
                    rsid:rsid,
                    ofid:orderform.id
                })
            });
        }
        else records = {rsid:rsids,ofid:orderform.id};
        req.models.orderformdetail.create(records,function(err){
            if(err) return global.dealError(err,res,isSend);
            if(Array.isArray(records)){
                if(records.length == 0) return res.send(JSON.stringify({id:orderform.id}));
                Promise.all(records.map(record => new Promise(function(resolve,reject){
                    req.models.shoppingcart.find({uid:uid,rsid:record.rsid}).remove(function(err){
                        if(err)reject(err);
                        else resolve();
                    })
                }))).then(()=>res.send(JSON.stringify({id:orderform.id}))).catch(err=>res.send("0"));
            }
            else req.models.shoppingcart.find({uid:uid,rsid:records.rsid}).remove(function(err){
                if(err) return res.send("0");
                res.send(JSON.stringify({id:orderform.id}));
            })
        });
    })
})

/**
 * 上传附件
 * @param{
 * orderNo
 * }
 */
function uploadFilePromise(file){
    file = path.join(global.cfg.attachDir,file);
    return new Promise(function(resolve,reject){
        console.log(global.cfg.attachUrl);
        request.post({url:global.cfg.attachUrl, formData: {fileUpload: fs.createReadStream(file)}}, function optionalCallback(err, httpResponse, body) {
            if (err) reject(err);
            else resolve();
        });
    })
}
function attachStart(myFiles){
    var files=[];
    files.push(myFiles)
    console.log(files)
    Promise.all(files.map(uploadFilePromise)).then(function(){
    }).catch(function(err){
        console.log('error: ' + err);
    });
}
router.post('/attach/:ofid/:orderNo',function(req,res){

    var form = new multiparty.Form({uploadDir:global.cfg.tempDir,
        allocate:10 * 1024 * 1024});

    var orderNo = req.params.orderNo;
    var ofid = req.params.ofid;
    form.parse(req, function(err, fields, files){
        console.log(err);
        if(err) return res.json({status:0});
        var file = files.fileUpload[0];
        var oldPath = file.path;
        var newPath = path.join(global.cfg.attachDir,
            orderNo + attachFileFormat);//
        var fileName=orderNo + attachFileFormat;
        fs.rename(oldPath,newPath,function(err){
            //console.log(err);
            if(err) return res.json({status:0});
            req.models.orderform.get(ofid,function(err,orderform){
                if(err) return res.json({status:0});
                orderform.save({state:2},function(err){
                    if(err) return res.json({status:0});
                    attachStart(fileName);
                    res.json({status:1});
                })
            })
         })
     })
    
})

/**
 * 修改
 */
router.put('/:id',function(req, res){

    var ofid = req.params.id;
    var updateObj = req.body;

    req.models.orderform.get(ofid,function(err,orderform){

        if(err) return res.send("000");
        for(var key in updateObj) orderform[key] = updateObj[key];
        orderform.save(function(err){
            if(err) return res.send("000");
            res.send("111");
        })
    })
});

/**
 * state 为1代表待上传附件
 * state 为2代表待附件已上传,待审核
 * state 为3代表已审核,待刻盘
 * state 为4代表已刻盘,待领用
 * state 为5代表已领用
 */
router.put('/:id/:state',function(req, res){
    var ofid = req.params.id;
    var state = req.params.state;

    req.models.orderform.get(ofid,function(err,orderform){

        if(err) return res.send("00");
        orderform.save({state:state},function(err){
            if(err) return res.end("00state");
            res.send("11state");
        })
    })
});
/**
 * cache 为1代表在订单列表被删除
 * cache 为0代表在历史库被还原
 */
router.put('/:id/cache/:cache',function(req, res){

    var ofid = req.params.id;
    var cache = req.params.cache;

    req.models.orderform.get(ofid,function(err,orderform){

        if(err) return res.send("cache0808err");
        orderform.save({cache:cache},function(err){
            if(err) return res.end("cache0808Fail");
            res.send("cache0808Success");
        })
    })
});

/**
 * 主键删除
 */
router.delete('/:id',function(req, res){

    var ofid = req.params.id;

    req.models.orderform.get(ofid,function(err,orderform){

        if(err) return res.send("0");

        orderform.remove(function(err){
            if(err) return res.send("0");
            res.send("主键删除");
        })
    })
});


module.exports = router;