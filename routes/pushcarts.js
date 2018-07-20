/**
 * Created by jyb on 17-1-19.
 */
var express = require('express');
var router = express.Router();
var Promise = require("bluebird");
/**
 * 属性查询
 *@param{
 * rsid
 * orderDate
 * }
 */
router.get('/', function(req, res) {

    var queryObj = req.query;
    queryObj.uid = req.session.user.id;
    var isSend = {status:false};
    var pageInfo = global.splitPage(queryObj);
    var total = 0;
    var sort = [];
    if(queryObj.sort) {
        sort.push(queryObj.sort,"Z");
        delete  queryObj.sort;
    }

    req.models.pushcart.find(queryObj,sort).count(function(err,count){

        if(err) return global.dealError(err,res,isSend);
        total = count;
    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err, pushcarts){

        if(err)  return global.dealError(err,res,isSend);
        res.send(JSON.stringify({total:total,data:pushcarts}));
    })
});

router.get('/rsmetadatas', function(req, res, next) {

    var queryObj = req.query;
    var pageInfo = global.splitPage(queryObj);
    var isSend = {status:false};
    var total = 0;
    var key = queryObj.sort;

    req.models.pushcart.find({uid:req.session.user.id}).count(function(err,count){//
        if(err) return global.dealError(err,res,isSend);
        total = count;
    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err,pushcarts){

        if(err || pushcarts.length == 0) return global.dealError(err,res,isSend);
        Promise.each(pushcarts.map(pushcart => req.models.rsmetadata.getAsync(pushcart.rsid)),function(rsmetadata,index){

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
});


/**
 * 返回对象{total}
 */
router.get('/total', function(req, res, next) {

    req.models.pushcart.count({uid:req.session.user.id},function(err,count){
        if(err) return res.send("0");
        res.send(JSON.stringify({total:count}));
    })

});


router.post('/', function (req, res) {

    var uid = req.session.user.id;
    var orderDate = req.body.orderDate;
    var rsids = req.body["rsids[]"];

    if(Array.isArray(rsids)){
        if(rsids.length == 0) return res.send("1");

        Promise.all(rsids.map(rsid => req.models.pushcart.existsAsync({uid:uid,rsid:rsid}))).then(function(exists){
            var records = [];
            exists.forEach(function(exist,index){
                if(!exist) records.push({uid:uid,rsid:rsids[index],orderDate:orderDate})
            })
            req.models.pushcart.create(records,function(err){
                if(err) return res.send("0");
                res.send("1");
            })
        }).catch(err => res.send("0"));
    }
    else req.models.pushcart.exists({uid:uid,rsid:rsids},function(err,exist){
            if(err || exist) return res.send("0");
            req.models.pushcart.create({uid:uid,rsid:rsids,orderDate:orderDate},function(err){
                if(err) return res.send("0");
                res.send("1");
          })
    })

});


/**
 *单条记录删除
 *@param
 *｛
 * rsid
 * ｝
 */
router.delete('/:rsid',function(req, res){

    var queryObject = {uid:req.session.user.id,
                       rsid:req.params.rsid};
    req.models.pushcart.find(queryObject).remove(function(err){
        if(err) return res.send("0");
        res.send("1");
    })
})

/**
 *批量删除
 *@param{
 * 数组对象
 * rsids[]
 * }
 */
router.delete('/',function(req, res){

    var rsids = req.body["rsids[]"];
    var uid = req.session.user.id;

    if(Array.isArray(rsids)){
        if(rsids.length == 0) res.send("1");
        Promise.all(rsids.map(rsid => new Promise(function(resolve,reject){
            req.models.pushcart.find({uid:uid,rsid:rsid}).remove(function(err){
                if(err)reject(err);
                else resolve();
            })
        }))).then(()=>res.send("1")).catch(err=>res.send("0"));
    }
    else req.models.pushcart.find({uid:uid,rsid:rsids}).remove(function(err){
        if(err) return res.send("0");
        res.send("1");
    })
})

module.exports = router;