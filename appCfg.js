/**
 * Created by jyb on 16-12-17.
 */
var opt={
    host:'127.0.0.1',
    port: 3306,
    user: 'root',
    password: '******',
    database:'dssplatform',
    outDir:"/mnt/GFdata/imageryData/LEVEL1A/",
    pathoutDir:"/data/imageryData/LEVEL2A/",
    gfDir:"data/imageryData/LEVEL2A/",
    localIp:"120.55.62.229",
    localPort:"3000",
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
//geosever发布地址
opt.geoUrl = 'http://localhost:8080/geoserver/rest/workspaces/luo/coveragestores/';
//getcookie获取指向chrome路径
opt.chromepath = '/dssplatform/dssplform7777/node_modules/puppeteer/.local-chromium/win64-555668/chrome-win32/chrome.exe';
module.exports=opt;

