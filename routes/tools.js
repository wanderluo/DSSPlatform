/**
 * Created by Administrator on 2018/4/16.
 */
var express = require('express');

var router = express.Router();
var fs=require("fs");
var tar = require('tar');
var zlib = require('zlib');
var path = require('path');
var util = require('util');

/**
 * 返回资源数据
 */
router.get('/source',function(req,res){
    var query = req.query;

    var name = query.name;
    var type = query.type;

    var directory = global.cfg.toolDir;
    var format = type == 1 ? ".zip" : (type == 2 ? ".jpg" : ".png");
    var file = path.join(directory,name+format);
    console.log(file);

    res.download(file,name+format,function(err){
        // console.log(err);
        if(err) return res.send("0");
    })
});

module.exports = router;