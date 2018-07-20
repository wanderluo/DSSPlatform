/**
 * Created by Administrator on 2018/3/28.
 */
var express = require('express');
var orm = require("orm");
var router = express.Router();
var os  = require('os');
//过虑掉字符串首尾格式，替换字符串中的多个空格为一个空格
function trim(s){
    return s.replace(/(^\s*)|(\s*$)/g, '').replace(/\s+/g,' ');
}
router.get('/sys',function(req,res){
    //df --total |grep total
    // console.log(os);
    // console.log(os.release());
    // console.log(os.networkInterfaces());
    // console.log(os.homedir());              //以字符串的形式返回当前用户的home目录.
    // console.log(os.userInfo());
    // console.log(os.arch());
    // console.log(os.platform());
    // console.log(os.tmpdir());
    // console.log(os.tmpDir());

    var sysinfo = {'hostname'   : os.hostname(),
        'systemtype' : os.type(),
        'release'    : os.release(),
        'uptime'     : os.uptime(),
        'loadavg'    : os.loadavg(),        //返回一个数组,包含1, 5, 15分钟平均负载.
        'totalmem'   : os.totalmem(),
        'freemem'    : os.freemem(),        //以整数的形式回空闲系统内存 的字节数.
        'cpus'       : os.cpus(),
        'disk'       : '',
        'arch'       :os.arch(),            //返回操作系统 CPU 架构
        'networkInterfaces'       :os.networkInterfaces(), //获得网络接口列表。
        'platform'       :os.platform() //返回一个字符串, 指定Node.js编译时的操作系统平台
    };
    var exec = require('child_process').exec;
    exec('df --total |grep total',
        function (error, stdout, stderr) {
            if (error !== null) {
                // console.log('exec error: ' + error);
            }else{
                var tmp = trim(stdout).split(' ');
                sysinfo.disk = {total:tmp[1],used:tmp[2],free:tmp[3]};
            }
            res.send(JSON.stringify(sysinfo));
        });
});

module.exports = router;