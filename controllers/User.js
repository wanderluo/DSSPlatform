/**
 * Created by airoyu on 16-12-16.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    req.models.user.find(function(err, users){
        if(err){
            res.send(err);
            return;
        }
        if(!users || users.length==0){
            res.send("无数据");
            return;
        }
        // res.send(JSON.stringify(users));
    });

});




module.exports = router;
