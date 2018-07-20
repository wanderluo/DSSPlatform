//输入框 获取焦点事件
function onInputFocus(obj) {
    if (obj.value == obj.defaultValue)
    { obj.value = '' }
}

//输入框 失去焦点事件
function onInputBlur(obj) {
    if (obj.value == '') {
        obj.value = obj.defaultValue;
    }
    else {
        var index = obj.value.indexOf(".");
        if (index == obj.value.length - 1) {
            obj.value = obj.value.replace(/\./g, "");
        }
    }
}

//清除非数字
function clearNoNum(obj) {
    //得到第一个字符是否为负号  
    var t = obj.value.charAt(0);
    //先把非数字的都替换掉，除了数字和.     
    obj.value = obj.value.replace(/[^\d.]/g, "");
    //必须保证第一个为数字而不是.     
    obj.value = obj.value.replace(/^\./g, "");
    //保证只有出现一个.而没有多个.     
    obj.value = obj.value.replace(/\.{2,}/g, ".");
    //保证.只出现一次，而不能出现两次以上     
    obj.value = obj.value.replace(".", "$#{1}").replace(/\./g, "").replace("$#{1}", ".");
    //如果第一位是负号，则允许添加  
    if (t == '-') {
        obj.value = '-' + obj.value;
    }
}

//表单验证
function verifyForm(formId){
    var verify=true;
    //必填验证
    var required = $("#"+formId+" .required");
    if(required && require.length>0){
        $.each(required,function(index,oReq){
            if($(oReq).val()==oReq.defaultValue || $(oReq).val()==undefined || $(oReq).val()==""){
                verify=false;
            }
        });
        if(!verify){
            return verify;
        }
    }
    return verify;
}

//获取url 中的参数
(function ($) {
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
})(jQuery);


//获取 from提交的数据，json格式
// 参数 form 为 dom form id
function getFormData(formId) {
    var formData=$("#"+formId).serializeArray();
    var dataJson={};
    var target;
    $.each(formData, function (index, data) {
        if(dataJson[data.name]){
            dataJson[data.name] +=","+ data.value;
        }
        else {
            target=$("#" + formId + " [name='" + data.name + "']")[0];
            if(target.type=="checkbox" || target.type=="radio"){
                // 单选框/复选框控件，直接赋值
                dataJson[data.name] = data.value;
            }
            else{
                dataJson[data.name] = data.value == $("#" + formId + " [name='" + data.name + "']")[0].defaultValue ? "" : data.value;
            }
        }
    });
    return dataJson;
}

function ArraytoJSON(formData) {
    var dataJson = {};
    $.each(formData, function (index, data) {
        if(dataJson[data.name]){
            dataJson[data.name] +=","+ data.value;
        }
        else{
            dataJson[data.name] = data.value;
        }
    });
    return dataJson;
};

function curDate(cDate) {
    var date = cDate || new Date();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d);
};

function curDateTime(cDate) {
    var date = cDate || new Date();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var mi = date.getMinutes();
    var s = date.getSeconds();
    return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d) + ' ' + h + ':' + mi + ':' + s;
}

//地图区域
function getData(data) {
    var subList = data.districtList;
    var level = data.level;

    //清空下一级别的下拉列表
    if (level === 'province') {
        nextLevel = 'city';
        citySelect.innerHTML = '';
        districtSelect.innerHTML = '';
    } else if (level === 'city') {
        nextLevel = 'district';
        districtSelect.innerHTML = '';
    }
    if (subList) {
        var contentSub;
        for (var i = 0, l = subList.length; i < l; i++) {
            var name = subList[i].name;
            var levelSub = subList[i].level;
            var cityCode = subList[i].citycode;
            contentSub = new Option(name);
            contentSub.setAttribute("value", levelSub);
            contentSub.center = subList[i].center;
            contentSub.adcode = subList[i].adcode;
            document.querySelector('#' + levelSub).add(contentSub);
        }
    }
}

function search(obj) {
    var option = obj[obj.options.selectedIndex];
    var keyword = option.text; //关键字
    var adcode = option.adcode;
    // district.setLevel(option.value); //行政区级别
    // district.setExtensions('all');
    // //行政区查询
    // //按照adcode进行查询可以保证数据返回的唯一性
    // district.search(adcode, function (status, result) {
    //     if (status === 'complete') {
    //         getData(result.districtList[0]);
    //     }
    // });
}

function setCenter(obj) {
    alert("hello");
}

//更新购物车数量
function updateCartNum(num){
    //记录购物车数量
    var cartNum=$.cookie("cartNum");
    if(cartNum==null || isNaN(cartNum)){
        cartNum=0;
    }

    //更新 购物车数量
    cartNum=parseInt(cartNum)+num;
    if(cartNum<0 || isNaN(cartNum)){
        cartNum=0;
    }
    $.cookie("cartNum",null);
    $.cookie("cartNum",cartNum,{path: '/'});
    $(".cartNum").html(cartNum);
}

//数据合法性验证
$.extend($.fn.validatebox.defaults.rules, {
    //相等验证
    equalToPwd: {
        validator: function (value, param) {
            return $(param[0]).val() == value;
        }, message: '两次输入的密码不一致'
    },
    //数字验证
    onlyNum:{
        validator : function(value) {
            return /^\d+(\.\d+)?$/i.test(value);
        },
        message:  '只能输入数字！'
    },
    //电话验证
    phone: {
        validator: function (value, param) {
            if(value) {
                if(value.length>15){
                    return false;
                }
                var reg = /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
                return reg.test(value);
            }
        },
        message: '电话号码格式不正确！'
    },
    //国内邮编验证
    ZipCode: {
        validator: function (value) {
            var reg = /^[0-9]\d{5}$/;
            return reg.test(value);
        },
        message: '邮编必须是6位数字.'
    },
    ////电子邮箱验证
    //email:{
    //    validator: function (value) {
    //        var reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/;
    //        return reg.test(value);
    //    },
    //    message: '电子邮箱格式不对.'
    // },
    //验证百分比 （0-100）
    percent:{
        validator: function (value) {
            var reg = /^(0|[1-9]\d?|100)$/;
            return reg.test(value);
        },
        message: '只能输入0-100间的整数.'

    },
    //经度验证 （-180 - 180）
    longitude:{
        validator: function (value) {
            var fValue=parseFloat(value);
            if(isNaN(fValue) || fValue<-180 || fValue>180){
                return false;
            }
            var reg = /^[-]?(\d|([1-9]\d)|(1[0-7]\d)|(180))(\.\d*)?$/;
            return reg.test(value);
        },
        message: '只能输入 -180到180 间的数字.'

    },
    //纬度验证 （-90 - 90）
    latitude:{
        validator: function (value) {
            var fValue=parseFloat(value);
            if(isNaN(fValue) || fValue<-90 || fValue>90){
                return false;
            }
            var reg = /^[-]?(\d|([1-8]\d)|(90))(\.\d*)?$/;
            return reg.test(value);
        },
        message: '只能输入 -90到90 间的数字.'

    }

});