/**
 * Created by jyb on 16-12-17.
 */
module.exports = function (db) {

    return db.define("role", {
        id:{type:"serial", key:true},
        name:{type:"text"},
        description:{type:"text"}
    });
};