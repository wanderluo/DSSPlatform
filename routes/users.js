/**
 * Created by jyb on 17-1-18.
 */
var express = require('express');
var router = express.Router();
var fs=require("fs");
var path = require('path');
var orm = require("orm");
var util = require('util');
var Promise = require("bluebird");      //promise异步处理
var multiparty = require('multiparty');     //实现文件上传
var nodemailer = require('nodemailer');     //邮件发送模块
var sub=require("./../appCfg");
var request = require("request");

var attachFileFormat = ".jpg";
var smtpConfig = {
    host: global.cfg.email.host,
    port: global.cfg.email.port,
    secure: false,
    auth: {
        user: global.cfg.email.user,
        pass: global.cfg.email.pwd
    }
};
var transporter = nodemailer.createTransport(smtpConfig);

function sendEmail(to,subject,content){

    var mailOptions = {
        from: global.cfg.email.user,
        to: to,
        subject: subject,
        text: content
        //  html: '<b>Hello world </b>'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error) return console.log(error);
        console.log('Message sent: ' + info.response);
    });
}

/**
 * 获取多条user记录
 * state 1为注册
 * state 2为待提交详细资料
 * state 3为完全审核通过
 * ＠param{
 * id
 * code
 * pwd
 * userName
 * }
 */
router.get('/', function(req, res, next) {

    var queryObj = req.query;
    var pageInfo = global.splitPage(queryObj);
    var isSend = {status:false};
    var total = 0;
    var sort = [];
    if(queryObj.sort){
        sort.push(queryObj.sort,"Z");
        delete queryObj.sort;
    }

    req.models.user.find(queryObj,sort).count(function(err,count){

        if(err) return global.dealError(err,res,isSend);
        total = count;
    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err, users){

        if(err) return global.dealError(err,res,isSend);
        res.send(JSON.stringify({total:total,data:users}));
    })
});

router.get('/corporation', function(req, res, next) {

    var queryObj = req.query;
    var pageInfo = global.splitPage(queryObj);
    var isSend = {status:false};
    var total = 0;
    var sort = [];
    if(queryObj.sort){
        sort.push(queryObj.sort);
        delete queryObj.sort;
    }

    req.models.viewuser.find(queryObj,sort).count(function(err,count){

        if(err) return global.dealError(err,res,isSend);
        total = count;
    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err, viewuser){

        if(err) return global.dealError(err,res,isSend);
        //viewuser = viewuser.filter(user => user.code != "admin");
        res.send(JSON.stringify({total:total,data:viewuser}));
    })
});

router.get('/corporations', function(req, res){

    var queryObj = req.query;
    var pageInfo = global.splitPage(queryObj);
    var total = 0;
    var isSend = {status:false};
    var sort = [];
    if(queryObj.sort) {
        sort.push(queryObj.sort,"Z");
        delete queryObj.sort;
    }

    req.models.user.find(queryObj,sort).count(function(err,count){
        if(err) return global.dealError(err,res,isSend);
        total = count;
    }).limit(pageInfo.limit).offset(pageInfo.offset).all(function(err,users){


        if(err || users.length == 0) return global.dealError(err,res,isSend);
        res.send(JSON.stringify({total:total,data:users}));
        users = users.filter(user => user.code != "admin");
        Promise.each(usersNotSuperRole.map(user => req.models.usercorporation.getAsync(user.id)),function(usercorporation,index){
            for(var key in usercorporation){
                if(!key) usersNotSuperRole[index][key] = usercorporation[key];
                else usersNotSuperRole[index]["corporation".concat(key[0].toUpperCase() + key.substring(1))] = usercorporation[key];
            }
        }).then(()=>res.send(JSON.stringify({total:total,data:users}))).catch(err=>res.send("11111"))

    })
});


/**
 * 获取多条user记录
 * state 1为注册
 * state 2为待提交详细资料
 * state 3为完全审核通过
 */
router.get('/:id', function(req, res, next) {

    var id =  req.params.id;

    req.models.user.get(id,function(err, user){

        if(err) return res.send("0");
        res.send(JSON.stringify(user));
    });
});




router.get('/:code/attach', function(req, res, next) {

    var name = req.params.code;
    var directory = global.cfg.attachDir;
    var file = path.join(directory,name + attachFileFormat);
    res.download(file,name + attachFileFormat,function(err){
        if(err) res.send("附件未上传")
    })
});


router.get('/verifysession/:code', function(req, res)　{
    if(req.session && req.session.user && req.session.user.username == req.params.code)
       res.send("1")
    else res.send("0");
});

/**
 * 重复返回1
 * 不重复返回0
 */
router.post('/exist',function(req,res){
    req.models.user.exists({code:req.body.code},function(err,exists){
        if(err || exists) return res.send(false);
        res.send(true);
    })

});
/**
 *注册user记录
 *＠param{
 * code
 * pwd
 * userName
 * corporationName
 * legalPerson
 * tel
 * email
 * }
 */
router.post('/', function (req, res){

    var register_info = req.body;
    var  subIp=sub.host+":"+sub.localPort;
    req.models.user.exists({code:register_info.code},function(err,exists){

        if(err || exists) res.send("0");

        else {

            var userRecord = {
                code:register_info.code,
                name:register_info.userName,
                pwd:global.md5(register_info.pwd),
                registerDate:register_info.registerDate,
                rid:3,
                cache:0,     //170913??
                state:2,
                ipurl:subIp
            }
            var corporationRecord = {
                name:register_info.corporationName,
                address:register_info.address,
                tel:register_info.tel,
                postCode:register_info.postCode,
                type:register_info.type,
                purpose:register_info.purpose,
                department:register_info.department,
                position:register_info.position,
                personTel:register_info.personTel,
                email:register_info.email
            }

            req.models.user.create(userRecord,function(err,user){
                if(err) return res.send("0");
                corporationRecord.uid = user.id;
                req.models.usercorporation.create(corporationRecord,function(err){
                    if(err) return res.send("0");
                    //var pageUrl = util.format("http://%s:%s/",global.cfg.localIp,global.cfg.localPort)
                    //sendEmail(corporationRecord.email,"审核通过",util.format("请进一步完善信息\n%s",pageUrl));
                    res.send("1");
                })
            })
        }
    })
});

router.post('/password/:id',function(req, res){

    var id = req.params.id;
    var pwd = req.body.pwd;
    var npwd = req.body.npwd;

    req.models.user.get(id,function(err,user){
          if(err) return res.send("0");
          if(user.pwd === global.md5(pwd)){
              user.save({pwd:global.md5(npwd)},function(err){
                if(err) return res.send("0");
                res.send("1");
              })
          }
          else res.send("0");
    });
})

/**
 *管理员新增user记录
 *＠param{
 * code
 * pwd
 * userName
 * rid
 * }
 */
router.post('/interior', function (req, res){
    var register_info = req.body;
    req.models.user.find({code:register_info.code},function(err,users){

        if(err) res.send("0");

        else if(users.length > 0) res.send("0");

        else {
            var userRecord = {
                code:register_info.code,
                name:register_info.userName,
                pwd:global.md5("111111"),
                rid:register_info.rid,
                state:3,
                registerDate:new Date().format("yyyy-MM-dd hh:mm:ss")
            }
            req.models.user.create(userRecord,function(err){
                if(err) return res.send("5555");
                res.send("1");
            })
        }
    })
});

/**
 * 上传附件
 */
/**
 * 单个文件上传,同时删除成功上传的文件
 * @param file
 */
function uploadFilePromise(file){
    file = path.join(global.cfg.attachDir,file);
    return new Promise(function(resolve,reject){
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

router.post('/attach',function(req,res){
    var form = new multiparty.Form({uploadDir:global.cfg.tempDir,
        allocate:10 * 1024 * 1024});
    form.parse(req, function(err, fields, files){
        if(err) return res.json({status:0});
        var file = files.fileUpload[0];
        var oldPath = file.path;
        var newPath = path.join(global.cfg.attachDir, req.session.user.username + attachFileFormat);
        var fileName=req.session.user.username + attachFileFormat
        fs.rename(oldPath,newPath,function(err){
            if(err){
                return res.json({status:0});
            }else{
                attachStart(fileName);
                res.json({status:1});
            }
        })
    })
});

/**
 * 改变审核状态
 */
router.put('/:id/:state',function(req, res){

    var id = req.params.id;
    var state = req.params.state;
    req.models.user.get(id,function(err,user){
        if(err) return res.send("0");
        user.state = state;
        user.save(function(err){
            if(err) return res.send("0");
            req.models.usercorporation.get(user.id,function(err,usercorporation){
                if(err) return res.send("0");
                //var pageUrl = util.format("http://%s:%s/",global.cfg.localIp,global.cfg.localPort)
                //if(state == 3) sendEmail(usercorporation.email,"注册完成",util.format("恭喜您,请登录\n%s",pageUrl));
                res.send("1");
            })
        })
    })
})

router.put('/:id',function(req, res){

    var id = req.params.id;
    var updateObj = req.body;

    req.models.user.get(id,function(err,user){

        if(err) return res.send("0");
        for(var key in updateObj) {
            var value = updateObj[key];
            if(key == "pwd") value = global.md5(value);
            user[key] = value;
        }
        user.save(function(err){
            if(err) return res.send("0");
            res.send("1");
        })
    })
})

/**
 * cache 为1代表在订单列表被删除
 * cache 为0代表在历史库被还原
 */
router.put('/:id/cache/:cache',function(req, res){

    var ofid = req.params.id;
    var cache = req.params.cache;

    req.models.user.get(ofid,function(err,user){

        if(err) return res.send("cacheerr");
        user.save({cache:cache},function(err){
            if(err) return res.end("cacheFail");
            res.send("cacheSuccess");
        })
    })
});

/**
 * 单条记录删除
 */
router.delete('/:id',function(req, res){

    var id = req.params.id;
    req.models.user.get(id,function(err,user){
        if(err) return res.send("0");
        user.remove(function(err){
            if(err) return res.send("0");
            res.send("1");
        });
    })
})


module.exports = router;