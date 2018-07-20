$.extend($.fn.validatebox.defaults.rules, {
    /*必须和某个字段相等*/
    equalTo: { validator: function (value, param) { return $(param[0]).val() == value; }, message: '字段不匹配' }
});

define(function (require, exports, module) {
    //判断浏览器
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") == -1){
        $.messager.alert("","请您使用chrome浏览器访问本系统，以免兼容性问题影响您的使用,谢谢");
    }

    ////判断是否登录
    var user=$.cookie("user");
    if (user) {
        user=JSON.parse(user);
        // 判断session 是否失效
        $.ajaxSetup({async: false});
        $.ajax({
            url:"/users/verifysession/"+user.username,
            type: "get",
            success : function(data, status, xhr) {
                if(data=="0"){//用户未登录
                    user.state=1;
                }
            },
            error : function(xhr, error, exception) {
                user.state=1;
            }
        });
        $.ajaxSetup({async: true});

        // 判断 账户是否激活
        if(user.state !="3"){
            // $.cookie("user",null);
        }
        else{
            //显示登录信息
            $(".acc").hide();
            $(".accb").show();
            $(".user").html(user.name);
            $(".user").click(function(){
                $("#chPsrMsg").window("open");
            });
            $("#cfm").click(function(){
                var isValid = $("#chFrm").form('validate');
                if (isValid){
                    $.post("/users/password/"+user.id,{pwd:$("#pwd").val(),npwd:$("#npwd").val()},function(result){
                        if(result=="0"){
                            $.messager.alert("提示",'原始密码错误！');
                        }else{
                            $.messager.alert("提示",'修改成功.');
                            $('#chPsrMsg').window('close')
                        }
                    });
                }else
                    $.messager.alert("提示",'验证失败.');
            });
            //生成用户导航
            if(user.rid==1){
                $(".nav_order").removeClass("nodend");
                $(".nav_produce").removeClass("nodend");
                $(".nav_user").removeClass("nodend");
                $(".nav_stat").removeClass("nodend");
                $(".nav_statistics").removeClass("nodend");
            }
            else if(user.rid==2){
                $(".nav_order").removeClass("nodend");
                $(".nav_produce").removeClass("nodend");
                $(".nav_stat").removeClass("nodend");
                $(".nav_statistics").removeClass("nodend");
            }
            else{
                $(".nav_order").removeClass("nodend");
                $(".nav_checkout").removeClass("nodend");
            }
        }
    }

    $(".megamenu").megamenu();


    //点击 跳转
    $("#top_menu").off("click","a[data-url]:not(.nodend),.menu a:not(.nodend)");
    $("#top_menu").on("click","a[data-url]:not(.nodend),.menu a:not(.nodend)",function () {
        var url = $(this).data("url");
        var pageName=$(this).attr("pageName");
        if(pageName=="购物车"){
            updateCartNum(0);
            window.location=url;
            //window.open(url);
        }
        else{
            $("#main_master").panel("refresh", url);

            //菜单加载样式
            $("li.active").removeClass("active");
            $(this).parent("li").addClass("active");
        }

    });

    //点击 无权限导航
    $(document).off("click",".nodend");
    $(document).on("click",".nodend",function () {
        if($(this).hasClass("nav_checkout")){
            $.messager.alert("","请您以企业用户身份登录！");
        }
        else if($(this).hasClass("nav_produce") || $(this).hasClass("nav_user")){
            $.messager.alert("","请您以VIP身份登录！");
        }
        else{
            $.messager.alert("","请您先登录！");
        }
    });
    
    // 退出
    $(".logout").click(function () {
        $.getJSON("/logout", function (data) {
            if(data){
                if(data.status==1){
                    //清空用户信息
                    $.cookie("user",null);
                    //清空购物车 数量
                    // $.cookie("cartNum",null);
                    //跳转到首页
                    window.location.href="/app/login.html";
                }
                else{
                    $.messager.alert("",data.msg);
                }
            }
        });
    });


    //默认加载 首页
    $("#main_master").panel("refresh", "app/produce2.html");
    // window.location.href="/app/login.html";
});