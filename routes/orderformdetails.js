/**
 * Created by jyb on 16-12-17.
 */
var express = require('express');
var router = express.Router();

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

    req.models.orderformdetail.find(queryObj,sort).count(function(err,count){

        if(err) return global.dealError(err,res,isSend);
        total = count;
    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err, orderformdetail){

        if(err) return global.dealError(err,res,isSend);
        res.send(JSON.stringify({total:total,data:orderformdetail}));
    })
});


module.exports = router;