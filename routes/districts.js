/**
 * Created by jyb on 17-1-18.
 */
var express = require('express');
var router = express.Router();

router.get('/edge',function(req, res){
    var queryObj = req.query;
    var level = queryObj.level;
    var adcode = queryObj.adcode;
    var model = req.models[level];

    model.get(adcode,function(err,region){

        if(err || !region.edge) return res.send("0");
        res.send(region.edge);
    })
});

router.get('/province',function(req, res){

    req.models.province.find({},function(err,provinces){

        if(err) return res.send("0");
        res.send(JSON.stringify(provinces.map(province=>({code:province.code,name:province.name}))));
    })
});

router.get('/city/:pcode',function(req, res){

    var pcode = req.params.pcode;
    req.models.city.find({pcode:pcode},function(err,cities){

        if(err) return res.send("0");
        res.send(JSON.stringify(cities.map(city=>({code:city.code,name:city.name}))));
    })
});

router.get('/district/:pcode',function(req, res){

    var pcode = req.params.pcode;
    req.models.district.find({pcode:pcode},function(err,districts){

        if(err) return res.send("0");
        res.send(JSON.stringify(districts.map(district=>({code:district.code,name:district.name}))));
    })
});

router.get('/adcode',function(req, res){
    var queryObj = req.query;
    var level = queryObj.level;
    var adcode = queryObj.adcode;
    var model = req.models[level];
    if(level == 'province') {
        req.models.province.find({},function(err,provinces){

            if(err) return res.send("0");
            res.send(JSON.stringify({level:level,data:provinces.map(province=>({code:province.code,name:province.name,level:level}))}));
        })
    }else{
        model.find({pcode:adcode},function(err,districts){

            if(err) return res.send("0");
            res.send(JSON.stringify({level:level,data:districts.map(district=>({code:district.code,name:district.name,level:level}))}));
        })
    }

});

module.exports = router;