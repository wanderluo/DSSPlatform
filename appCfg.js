/**
 * Created by jyb on 16-12-17.
 */
var opt={
    host:'192.168.0.3',
    port: 3306,
    user: 'hbgf',
    password: '2008gf',
    database:'dssplatform',
    productDir:"/data2/imageryData/products",
    thumbDir:"/data2/imageryData/thumb",
    attachDir:"/data2/imageryData/attach",
    tempDir:"/data2/imageryData/temp",
    toolDir:"/data2/imageryData/tools",
    geoDir:"/data2/imageryData/geo",
    orgDir:"/data/imageryData/LEVEL1A/",
    outDir:"/mnt/GFdata/imageryData/LEVEL1A/",
    pathoutDir:"/data/imageryData/LEVEL2A/",
    gfDir:"data/imageryData/LEVEL2A/",
    localIp:"120.55.62.229",
    localPort:"3000",
    email:{user:"hbgf@whu.edu.cn",pwd:"060210heng",host:"smtp.whu.edu.cn",port:25}
};
opt.dbUrl={
    host:opt.host,
    port: opt.port,
    user: opt.user,
    password: opt.password,
    database:opt.database,
    protocol: 'mysql',
    query: {pool: true, debug: true},
    dateStrings:true,
    charset:"utf8_general_ci"
};
//上传图片路径
opt.attachUrl="http://59.172.104.114:3000/synchrodatas/attach";
//geosever发布地址
opt.geoUrl = 'http://localhost:8080/geoserver/rest/workspaces/luo/coveragestores/';
//getcookie获取指向chrome路径
opt.chromepath = '/dssplatform/dssplform7777/node_modules/puppeteer/.local-chromium/win64-555668/chrome-win32/chrome.exe';
module.exports=opt;

