/**
 * Created by winston on 16-12-16.
 */

var checkAuthority = require("checkauthority");
var loginPage="/login";
var  sub=require("./appCfg");
module.exports=function(){
    return function(req,res,next){
        if (!req.session.user) {
            if(checkAuthority(req)){
                //补充其他不需要登录页面
                next();//如果请求的地址是登录则通过，进行下一个请求
            }
            else
            {
                res.json({status:0,msg:"用户未登陆"});
                //res.redirect(loginPage);
            }
        } else if (req.session.user) {
            next();
        }
    };
};

module.exports.gateWay=function(app){
    //app.get(loginPage,function(req,res){
    //    res.render(loginPage);
    //});
    app.post(loginPage,function(req,res){
        var code = req.body.code;
        var pwd = req.body.pwd;
        if(code=="admin"){
            var rts={};
            rts.status=1;
            rts.status=0;
            rts.msg="用户名错误！";
            res.json(rts);
        }
        else{
            req.models.user.find({code:code},function(err,users){
                var rts={};
                rts.status=1;//1 成功，0 失败
                if(err || users.length == 0) {
                    rts.status=0;
                    rts.msg="用户名错误！";
                    res.json(rts);
                }
                else {
                    if(users[0].rid===3){
                        var subIp=sub.host+":"+sub.localPort;
                        if(users[0].ipurl ==subIp){
                            if(users[0].pwd === global.md5(pwd)) {
                                if(users[0].state == 1){
                                    rts.status=0;
                                    rts.msg="您的帐号管理员还未审批，请耐心等待！";
                                    res.json(rts);
                                    return;
                                }
                                else {
                                    var user = {'username':code,'name':users[0].name,'id':users[0].id,'rid':users[0].rid,'state':users[0].state,'ipurl':users[0].ipurl};
                                    req.session.user = user;
                                    //res.redirect('/admin/app/list');//登陆成功跳转页面
                                    rts.status=1;
                                    rts.data=user;
                                    res.json(rts);
                                }
                            }
                            else{
                                rts.status=0;
                                rts.msg="用户名或密码错误！";
                                res.json(rts);
                            };
                        }
                        else {
                            rts.status=0;
                            rts.msg="用户不在该分中心";
                            res.json(rts);
                            return;
                        }
                    }
                    else {
                        rts.status=0;
                        rts.msg="只允许企业用户登录";
                        res.json(rts);
                    }
                }
            })
        }
    });
    app.get('/logout',function(req,res){
        req.session.user = null;
        res.json({status:1});
    });
};