/**
 * Created by jyb on 17-2-8.
 */
module.exports = function (db) {

    return db.define("viewsensor", {
        id:{type:"integer",key:true},
        code:{type:"text"},
        satCode:{type:"text"},
        type:{type:"text",key:true},
        dpi:{type:"number"}
});
};
