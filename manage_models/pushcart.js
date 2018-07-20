/**
 * Created by jyb on 16-12-17.
 */
module.exports = function (db) {
    return db.define("pushcart", {
        uid:{type:"number",key:true},
        rsid:{type:"number",key:true},
        orderDate:{type:"date"}
    });
};