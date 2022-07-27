class EmployeeDetail {

    constructor(formId) {
        let me = this;
        me.form = $(`#${formId}`);
        me.initEvents();
    }

    /**
     * Khởi tạo sự kiện cho form
     */
    initEvents() {
        let me = this;

        // Khởi tạo sự kiện button trên toolbar dưới form
        me.form.find(".pop-up--button [CommandType]").off("click");
        me.form.find(".pop-up--button [CommandType]").on("click", function () {
            let commandType = $(this).attr("CommandType");

            if (me[commandType] && typeof me[commandType] == "function") {
                me[commandType]();
            }
        });

        me.form.find(".closeX").off("click");
        me.form.find(".closeX").on("click", function () {
            me.Close();
        });
    }

    /**
     * Đóng form
     */
    Close() {
        let me = this;
        me.form.hide();
    }

    /**
     * Lưu dữ liệu
     */
    Save() {

        let me = this,
            isValid = me.validateForm();

        if (isValid) {
            let data = me.getFormData();
            me.saveData(data);
            me.form.hide();
        }
    }

    /**
     * Xử lý validate form
     */
    validateForm() {
        let me = this,
            isValid = me.validateRequire();

        if (isValid) {
            isValid = me.validateEmail();
        }
        if (isValid) {
            isValid = me.validateTime()
        }
        return isValid;
    }

    /**
     * kiểm tra định dạng email
     * @returns 
     * by DMQuang (15/7/2022)
     */
    validateEmail() {
        let value = $("#Email").val();
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
            return (true);
        }

        alert("Hãy nhập đúng định dạng email")
        $(this).addClass("boder-red");
        return (false);
    }
    
    /**
     * kiểm tra ngày tháng có vượt quá hiện tại 
     * @returns 
     */
    validateTime() {
        let me = this;

        me.form.find('[dataType]').each(function () {
            let dataType = $(this).attr("dataType");
            // if(dataType=="Date"){
            //     let value = CommonFn.formatDateInvalid($(this).val());
            //     let dateForm=new Date(value),
            //     dateNow=new Date().toLocaleDateString();
            //     console.log(dateForm+dateNow)
            //     if(dateForm>dateNow){
            //         return false;
            //     }
            // }
        })
        return true;
    }

    /**
     * Validate các trường băt buộc
     */
    validateRequire() {
        let me = this,
            isValid = true;

        me.form.find('[Required]').each(function () {
            let value = $(this).val();
            if (!value) {
                isValid = false;
                $(this).addClass("boder-red");
            }
        });

        if (isValid)
            return true;
        alert("Trường dữ liệu (*) không được bỏ trống");
        return false;
    }

    /**
     * Lấy dữ liệu form
     */
    getFormData() {
        let me = this,
            data = {};

        me.form.find(".content-info .content-info-right .info-commom .list-infor-input .input-item [SetField]").each(function () {
            let dataType = $(this).attr("dataType") || "String",
                field = $(this).attr("SetField"),
                value = null;

            switch (dataType) {
                case Resource.DataTypeColumn.String:
                    value = $(this).val();
                    break;
                case Resource.DataTypeColumn.Number:
                    if ($(this).val())
                        value = Number($(this).val());
                    break;
                case Resource.DataTypeColumn.Date:
                    if ($(this).val())
                        value = CommonFn.formatDateForm($(this).val());
                    else value=null;
                    break;
                case Resource.DataTypeColumn.Money:
                    if ($(this).val())
                        value = $(this).val();
                    break;
                case "pos":
                case "dep":
                    value=$(this).val();
                    $(this).find("option").each(function(){
                        if($(this).val()==value){
                            value= $(this).attr("id")
                        }
                    })
                       
                    console.log(value);
               
            }
            data[field] = value;
        });

        return data;
    }

    /**
     * Lưu dữ liệu
     */
    saveData(data) {
        let me = this,
            method = Resource.Method.Post,
            url = me.parent.grid.attr("Url");

        if (me.formMode == Enumeration.FormMode.Edit) {
            method = Resource.Method.Put;
            let EmployeeID = me.parent.grid.find("[id]").attr("id");
            url += "/" + EmployeeID;
            //data=JSON.stringify(data);
        }

        CommonFn.Ajax(url, method, data, function (response) {
            if (response) {
                alert("Dữ liệu đã được lưu lại ")
                me.parent.grid.find(".yellow-tr").removeClass("yellow-tr");

            } else {
                console.log("Có lỗi");
            }
        });
    }

    /**
     * Hàm mở form
     */
    open(param, data) {
        let me = this;

        Object.assign(me, param);


        me.form.show();
        $("#count").focus();

        // thêm mới 
        if (param && param.formMode == Enumeration.FormMode.Add) {
            me.resetForm();
        }
        //nhân bản và chỉnh sửa
        if (param && (param.formMode == Enumeration.FormMode.Duplicate
            || param.formMode == Enumeration.FormMode.Edit)) {
            me.DuplicateForm(data, param);
        }
    }

    /**
     * Đổ dữ liệu dòng cần thao tác vào form 
     * @param {*} data dữ liệu nhân viên đang tác động
     * @param {*} param type API
     * By DMQuang (15/7/2022)
     */
    DuplicateForm(data, param) {
        let me = this;
        me.form.find("[SetField]").each(function () {
            let SetField = $(this).attr("SetField");

            if ($(this).attr("type") == "date")
                data[SetField] = CommonFn.formatDateFormSub(data[SetField]);

            if (SetField)
                $(this).val(data[SetField]);

            if (param && param.formMode == Enumeration.FormMode.Duplicate)
                if ($(this).attr("SetField") == "employeeCode")
                    me.getNewEmployeeCode();

            if(SetField=="positionID" || SetField=="departmentID"){
                let sub=SetField.slice(0,SetField.length-2)+"Name"
                $(this).val(data[sub]);
            }
        })
    }

    /**
     * Reset nội dung form
     */
    resetForm() {
        let me = this;
        me.form.find("[SetField]").each(function () {
            let dataType = $(this).attr("DataType") || "String";

            switch (dataType) {
                case Resource.DataTypeColumn.Enum:
                case Resource.DataTypeColumn.Date:
                case Resource.DataTypeColumn.String:
                case Resource.DataTypeColumn.Number:
                    $(this).val("");
                    break;
            }

            if ($(this).attr("SetField") == "employeeCode")
                me.getNewEmployeeCode();
        });
    }

    /**
     * lấy giá mã nhân viên khi thêm nhân viên
     * by DMQuang (15/7/2022)
     */
    getNewEmployeeCode() {
        let me = this,
            url = "http://localhost:5086/api/v1/Employees/new-code",
            method = Resource.Method.Get;

        CommonFn.Ajax(url, method, {}, function (response) {
            if (response)
                $("#count").val(Object.values(response)[0]);
            else
                console.log("Có lỗi");
        });
    }

}
