class EmployeePage {
    // Hàm khởi tạo
    constructor(gridId) {
        let me = this;
        me.grid = $(`#${gridId}`);

        // Lấy ra cấu hình các cột
        me.columnConfig = me.getColumnConfig();

        //khoi tạo sự kiện
        me.initEvents();

        // Lấy dữ liệu
        this.getData();

        // KHởi tạo form detail
        me.initFormDetail();
        me.initDataPositionDepartment();

    }
    initDataPositionDepartment(){
       let me=this;
        me.dataPos= new position("position");
        me.dataDep= new department("department");
    }

    /**
     * Lấy config các cột
     * @returns 
     */
    getColumnConfig() {
        let me = this,
            columnDefault = {
                FieldName: "",
                DataType: "String",
                EnumName: "",
                Text: ""
            },
            columns = [];

        // Duyệt từng cột để vẽ header
        me.grid.find(".col").each(function () {
            let column = { ...columnDefault },
                that = $(this);

            Object.keys(columnDefault).filter(function (proName) {
                let value = that.attr(proName);
                if (value)
                    column[proName] = value;

                column.Text = that.text();
            });
            columns.push(column);
        });

        return columns;
    }

    /**
     * Dùng để khởi tạo các sự kiện cho trang 
     */
    initEvents() {
        let me = this;
        //Khởi tạo sự kiện cho table
        me.initEventsTable();

        // Khởi tạo sự kiện cho toolbar
        me.initEventsToolbar();
    }

    /**
     * Khởi tạo sự kiện cho toolbar
     */
    initEventsToolbar() {
        let me = this,
            toolbarId = me.grid.attr("Toolbar");

        $(`#${toolbarId} [CommandType]`).off("click");
        $(`#${toolbarId} [CommandType]`).on("click", function () {
            let commandType = $(this).attr("CommandType");

            if (me[commandType] && typeof me[commandType] == "function") 
                me[commandType]();
        });
    }

    /**
     * THêm mới
     */
    Add() {

        let me = this,
            param = {
                parent: me,
                formMode: Enumeration.FormMode.Add
            };

        // Kiểm tra có form detail chưa
        if (me.formDetail && param) {
            me.formDetail.open(param);
        }
    }

    /**
     * Nhân bản
     */
    Duplicate() {
        let me = this,
            param = {
                parent: me,
                formMode: Enumeration.FormMode.Duplicate
            },
            data = me.grid.find("[id]").data("info");

        if (me.formDetail && data) {
            me.formDetail.open(param, data);
        } else
            alert("Cần chọn 1 nhân viên để nhân bản");
    }
    /**
     * làm mới 
     */
    Refrest() {
        location.reload();
    }

    /**
     * Xóa
     */
    Drop() {
        let me = this,

         idEmployee = me.grid.find("[id]").attr("id"),
        url = "http://localhost:5086/api/v1/Employees/" + idEmployee;
        if (idEmployee) {
            me.dropData(url);
            $(".pop-up").show();
            $(".Cannel").off();
            $(".Cannel").on("click", function () {
                $(".pop-up").hide();
            })
        }
        else
            alert("Cần chọn nhân viên trước khi xóa")
    }

    /**
     * xóa nhân viên
     * @param {*} url api delete
     * by DMQuang (14/07/2022)
     */
    dropData(url) {
        let me = this,
        method = Resource.Method.Delete;
        $("#DeleteData").off();
        $("#DeleteData").on("click", function () {
            $(".Cannel").off();
            $(".Cannel").on("click", function () {
                $(".pop-up").hide();
            })
            CommonFn.Ajax(url, method, {}, function (response) {
                if (response) {
                    $(".pop-up").hide();
                    $(".toast-messager-item").show();
                    setInterval(function(){
                        $(".toast-messager-item").hide();
                    },4000);
                }
                else
                    console.log("Có lỗi");
            });
        });
    }

    /**
     * Khởi tạo trang detail
     */
    initFormDetail() {
        let me = this;
        me.formDetail = new EmployeeDetail("form-info");
    }

    /**
     * Khởi tạo sự kiện cho table,lấy dữ liệu trên dòng
     */
    initEventsTable() {
        let me = this, data;

        me.grid.off("click", "tr");
        me.grid.on("click", "tr", function () {
            me.grid.find(".yellow-tr").removeClass("yellow-tr");
            me.grid.find("[id]").removeAttr("id");
            $(this).addClass("yellow-tr");
            data = $(this).data("info").employeeID;
            $(this).attr("id", data);
        });

        me.grid.on("dblclick", "tr", function () {
            me.grid.find("[id]").removeAttr("id");

            data = $(this).data("info");
            let dataID = data.employeeID;
            $(this).attr("id", dataID);
            me.Edit(data);
        });

    }

    /**
     * Chỉnh sửa dữ liệu
     * @param {*} data dữ liệu 1 dòng
     * 
     */
    Edit(data) {
        let me = this,
            param = {
                parent: me,
                formMode: Enumeration.FormMode.Edit
            };

        // Kiểm tra có form detail chưa
        if (me.formDetail) {
            me.formDetail.open(param, data);
        }
    }

    /**
     * lấy dữ liệu từ be
     */
    getData() {
        let me = this,
            url = me.grid.attr("Url");

        CommonFn.Ajax(url, Resource.Method.Get, {}, function (response) {
            if (response) {
                me.loadData(response);

            } else {
                console.log("Có lỗi khi lấy dữ liệu từ server");
            }
        });
    }


    loadData(data) {
        let me = this;
        if (data) {
            me.renderGrid(data);
        }
    }

    /**
     * render dữ liệu vào bảng 
     * @param {*} data khối giữ liệu
     */
    renderGrid(data) {
        let me = this,
            table = $("<table></table>"),
            thead = me.renderThead(),
            tbody = me.renderTbody(data);

        table.append(thead);
        table.append(tbody);

        me.grid.find(".col").remove();
        me.grid.append(table);
    }

    /**
     * Reder header
     */
    renderThead() {
        let me = this,
            thead = $("<thead></thead>"),
            tr = $("<tr></tr>");

        me.columnConfig.filter(function (column) {
            let text = column.Text,
                th = $("<th></th>");
            th.text(text);
            tr.append(th);
        })
        thead.append(tr);

        return thead;
    }

    /**
     * Renderbody
     */
    renderTbody(data) {
        let me = this,
            tbody = $("<tbody></tbody>");

        if (data) {
            data.filter(function (item) {
                let tr = $("<tr></tr>");

                // Duyệt từng cột để vẽ header
                me.grid.find(".col").each(function () {
                    let fieldName = $(this).attr("FieldName"),
                        dataType = $(this).attr("DataType"),
                        td = $("<td></td>"),
                        value = me.getValueCell(item, fieldName, dataType),
                        className = me.getClassFormat(dataType);

                    td.text(value);
                    td.addClass(className);
                    tr.append(td);
                });

                tr.data("info", item);
                tbody.append(tr);
            });
        }

        return tbody;
    }

    /**
    * Lấy giá trị ô
    * @param {} item 
    * @param {*} fieldName 
    * @param {*} dataType 
    */
    getValueCell(item, fieldName, dataType) {
        let me = this,
            value = item[fieldName];
        
        switch (dataType) {
            case Resource.DataTypeColumn.Number:
                value = CommonFn.formatMoney(parseInt(value));
                break;
            case Resource.DataTypeColumn.Date:
                value = CommonFn.formatDate(value);
                break;
            case "gender":
                value = CommonFn.formatGender(value);
                break;
            case "work":
                value = CommonFn.formatWorkStatus(value);
                break;
        }
        if(!value)
            return "";
        return value;
    }

    /**
    * Hàm dùng để lấy class format cho từng kiểu dữ liệu
    * CreatedBy: NTXUAN 06.05.2021
    */
    getClassFormat(dataType) {
        let className = "";

        switch (dataType) {
            case Resource.DataTypeColumn.Number:
                className = "align-right";
                break;
            case Resource.DataTypeColumn.Date:
                className = "align-center";
                break;
        }

        return className;
    }
}


// Khởi tạo một biến cho trang nhân viên
var employeePage = new EmployeePage("gridEmployee");





