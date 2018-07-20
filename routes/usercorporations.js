/**
 * Created by jyb on 16-12-18.
 */
var express = require('express');
var router = express.Router();
/**
 * 获取多个
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
    req.models.usercorporation.find(queryObj,sort).count(function(err,count){
        // if(err) return global.dealError(err,res,isSend);
        total = count;

    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err,usercorporations){
        // if(err)  return global.dealError(err,res,isSend);
        res.send(JSON.stringify({total:total,data:usercorporations}));
    })
});
/**
 * 通过单个
 */
router.get('/:uid', function(req, res, next) {

    var uid = req.params.uid;

    req.models.usercorporation.get(uid,function(err,usercorporation){
        if(err) return res.send("0");
        res.send(JSON.stringify(usercorporation));
    })
});

module.exports = router;