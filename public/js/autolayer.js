/**
 * Created by Administrator on 2018/5/15.
 */
$(document).ready(function(){
    var button = $("#submit");//查询按钮
    var verpass = false;
    toastr.options = {
        closeButton: false,
        debug: false,
        progressBar: true,
        positionClass: "toast-bottom-center",
        onclick: null,
        showDuration: "300",
        hideDuration: "1000",
        timeOut: "5000",
        extendedTimeOut: "1000",
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut"
    };
    button.click(function(){
        //获取查询参数

        $('#modal-content').html("Hello <b>world</b>!");
        var params=getFormData("form");
        for(var key in params){
            if(!params[key]) delete params[key];
        }
        // console.log(params);
        //表单验证
        if(JSON.stringify(params) == "{}"){
            verpass = false;
            toastr.warning("别闹，填下表单!","验证提示");
        }
        else if(!params.stime||!params.etime){
            verpass = false;
            toastr.warning("..，采集时间未填!","验证提示");
        }
        // else if(!params.cookie){
        //     verpass = false;
        //     toastr.warning("..，cookie未填!","验证提示");
        // }
        // else if(!params.ordername){
        //     verpass = false;
        //     toastr.warning("..，订单名称未填!","验证提示");
        // }
        else verpass = true;
        
        if(verpass){
            $.ajax({
                url:"/nodeftp/olmysql",
                type: "post",
                async: false,
                data:params,
                success : function(data, status, xhr) {
                    if(data){
                       // console.log(typeof(data));
                        $('#myModal').on('show.bs.modal', function (e) {
                            $('.modal-body').html(data)
                        });
                        $('#myModal').modal('show');
                        data=JSON.parse(data);
                        // console.log(data);
                        toastr.success('Have fun!', '订单已成功生成');
                        $.each(data,function(index,val){
                            toastr.success(val, '啦啦啦')
                        });

                    }
                },
                error : function(xhr, error, exception) {
                    // $('#myModal').on('show.bs.modal', function (e) {
                    //     toastr.warning(error,"请求错误");
                    //     $('.modal-content').html(error)
                    // });
                    // $('#myModal').modal('show');
                    toastr.warning(error,"请求错误");
                }
            });
        }
        
    })
});