/**
 * Created by jyb on 17-2-9.
 */
var express = require('express');
var fs = require("fs");
var router = express.Router();
var path = require('path');
var multiparty = require('multiparty');
function receiveAttach(road,res,req){
    var form = new multiparty.Form({uploadDir:road,
        allocate:10 * 1024 * 1024});
    form.parse(req, function(err, fields, files){
        if(err) return res.status(500).send("server error");
        var file = files.fileUpload[0];
        var oldPath = file.path;
        var newPath = path.join(road,file.originalFilename);
        fs.rename(oldPath,newPath,function(err){
            if(err) return res.status(500).send("server error");
			res.status(100)
        })
    })
}


router.post('/thumb',function(req,res){
    receiveAttach(global.cfg.thumbDir,res,req);
})

router.post('/products',function(req,res){
    receiveAttach(global.cfg.productDir,res,req);
})
/**
 * 改变审核状态
 */
router.post('/userstate',function(req, res){
    var id = req.body.id;
    var state = req.body.state;
    req.models.user.get(id,function(err,user){
        if(err) return res.status(500).send("server error");
        user.save({state:state},function(err){
            if(err) return res.status(500).send("server error");
            res.send("update success");
        })
    })
})

/**
 * state 为1代表待上传附件
 * state 为2代表待附件已上传,待审核
 * state 为3代表已审核,待刻盘
 * state 为4代表已刻盘,待领用
 * state 为5代表已领用
 */
router.post('/orderstate',function(req, res){
    var ofid = req.body.id;
    var state = req.body.state;

    req.models.orderform.get(ofid,function(err,orderform){
        if(err) return res.status(500).send("server error");
        orderform.save({state:state},function(err){
            if(err) return res.status(500).send("server error");
            res.send("update success");
        })
    })
})

router.post('/rsmetadata', function (req,res){
    var rsmetadataRecord = req.body;
    var record = {};
    for(var key in rsmetadataRecord){
        if(!rsmetadataRecord[key]) continue;
        if(key.match(/^[A-Z]/)) record[key[0].toLowerCase() + key.substring(1)] = rsmetadataRecord[key];
        else record[key] = rsmetadataRecord[key];
    };
	record.path=global.cfg.productDir;
    req.models.rsmetadata.find({rspath:record.rspath},function(err,data){
		console.log(err);
        if(data.length=="1"){
            res.send("1");
        }
        else{
            req.models.rsmetadata.create(record,function(err){
                console.log(err);
                if(err) return res.status(500).send("server error");
                res.send("1");
            })
        }
    })


});
module.exports = router;