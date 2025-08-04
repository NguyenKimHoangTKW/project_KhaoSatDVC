﻿$(".select2").select2();
let value_check = "";
$(document).ready(async function () {
    await load_data();
    $("#bd-example-modal-lg").on("hidden.bs.modal", function () {
        $(this).find("input, textarea, select").val("");
        $(this).find("input[type=checkbox], input[type=radio]").prop("checked", false);
    });
    $('#importExcelModal').on('hidden.bs.modal', function () {
        $(this).find('form')[0].reset();
    });
});

$(document).on("click", "#btnAdd", function (event) {
    event.preventDefault();
    $(".modal-title").text("Thêm mới Khoa/Viện");
    const body = $(".modal-footer");
    body.empty();
    let html = ``;
    html +=
        `
           <button type="button" class="btn btn-danger btn-tone m-r-5" data-dismiss="modal">Thoát</button>
           <button type="button" class="btn btn-success btn-tone m-r-5" id="btnSaveAdd">Lưu</button>
        `;
    body.html(html);
    $("#bd-example-modal-lg").modal("show");
});
$(document).on("click", "#btnSaveAdd", async function (event) {
    event.preventDefault();
    await add_khoa();
});
$(document).on("click", "#btnEdit", async function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    $(".modal-title").text("Cập nhật Khoa/Viện");
    await get_info(value);
    const body = $(".modal-footer");
    body.empty();
    let html = ``;
    html +=
        `
           <button type="button" class="btn btn-danger btn-tone m-r-5" data-dismiss="modal">Thoát</button>
           <button type="button" class="btn btn-success btn-tone m-r-5" id="btnSaveEdit">Lưu</button>
        `;
    body.html(html);
    value_check = value;
});
$(document).on("click", "#btnSaveEdit", async function () {
    await edit_khoa(value_check);
    await load_data();
});
$(document).on("click", "#btnDelete", function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    Swal.fire({
        title: "Bạn đang thao tác xóa?",
        text: "Bạn muốn xóa Khoa?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, xóa luôn!"
    }).then((result) => {
        if (result.isConfirmed) {
            delete_khoa(value);
        }
    });
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
$(document).on("submit", "#importExcelForm", async function (event) {
    event.preventDefault();
    var formData = new FormData(this);
    const res = await $.ajax({
        url: `${BASE_URL}/upload-excel-khoa-vien-truong`,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "success",
            title: res.message
        });
        $('#importExcelModal').modal('hide');
        load_data();
    }
    else {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "error",
            title: res.message
        });
    }
});
async function delete_khoa(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/delete-khoa-vien-truong`,
        type: 'POST',
        data: {
            id_khoa: value
        },
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "success",
            title: res.message
        });
        load_data();
    }
    else {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "error",
            title: res.message
        });
    }
}
async function edit_khoa(value) {
    const ma_khoa = $("#ma_khoa").val();
    const ten_khoa = $("#ten_khoa").val();
    const nam_hoc = $("#nam-hoc-val").val();
    const chuyen_mon = $("#chuyen-mon-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/update-khoa-vien-truong`,
        type: 'POST',
        data: {
            id_khoa: value,
            ma_khoa: ma_khoa,
            ten_khoa: ten_khoa,
            id_namhoc: nam_hoc,
            is_chuyen_mon: chuyen_mon
        },
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "success",
            title: res.message
        });
    }
    else {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "error",
            title: res.message
        });
    }
};
async function get_info(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/get-info-khoa-vien-truong`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_khoa: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    const data = JSON.parse(res)
    $("#ma_khoa").val(data.ma_khoa);
    $("#ten_khoa").val(data.ten_khoa);
    $("#nam-hoc-val").val(data.id_namhoc).trigger("change");
    $("#chuyen-mon-val").val(data.is_chuyen_mon);
    $("#bd-example-modal-lg").modal('show');
}
async function add_khoa() {
    $("#nam-hoc-val").trigger("change");
    const ma_khoa = $("#ma_khoa").val();
    const ten_khoa = $("#ten_khoa").val();
    const nam_hoc = $("#nam-hoc-val").val();
    const chuyen_mon = $("#chuyen-mon-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/them-moi-khoa-vien-truong`,
        type: 'POST',
        data: {
            ma_khoa: ma_khoa,
            ten_khoa: ten_khoa,
            id_namhoc: nam_hoc,
            is_chuyen_mon: chuyen_mon
        },
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "success",
            title: res.message
        });
        load_data();
    }
    else {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "error",
            title: res.message
        });
    }
}
async function load_data() {
    const table = $("#khoaTable");
    const year = $("#nam-hoc").val();
    const chuyen_mon = $("#chuyen-mon").val();
    const res = await $.ajax({
        url: `${BASE_URL}/load-danh-sach-khoa-vien-truong`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_namhoc: year,
            is_chuyen_mon: chuyen_mon
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if ($.fn.DataTable.isDataTable('#khoaTable')) {
        $('#khoaTable').DataTable().clear().destroy();
    }
    if (res.success) {
        let theadHtml = `
        <tr>
            <th scope="col">Số Thứ Tự</th>
            <th scope="col">ID Đơn vị</th>
            <th scope="col">Mã Đơn vị</th>
            <th scope="col">Tên Đơn vị</th>     
            <th scope="col">Năm hoạt động</th>
            <th scope="col">Mô tả</th>
            <th scope="col">Ngày tạo</th>
            <th scope="col">Ngày cập nhật</th>
            <th scope="col">Chức năng</th>
        </tr>
    `;
        let tbodyHtml = ``;

        table.find("thead").html(theadHtml);
        const data = JSON.parse(res.data);
        data.forEach((item, index) => {
            tbodyHtml += `
                    <tr>
                        <td class="formatSo">${index + 1}</td>
                        <td class="formatSo">${item.id_khoa}</td>
                        <td>${item.ma_khoa != null ? item.ma_khoa : ""}</td>
                        <td>${item.ten_khoa}</td>
                        <td class="formatSo">${item.ten_namhoc}</td>
                        <td>${item.is_chuyen_mon}</td>
                        <td class="formatSo">${unixTimestampToDate(item.ngaytao)}</td>
                        <td class="formatSo">${unixTimestampToDate(item.ngaycapnhat)}</td>
                        <td>
                            <button class="btn btn-icon btn-hover btn-sm btn-rounded pull-right" id="btnEdit" data-id="${item.id_khoa}">
                                <i class="anticon anticon-edit"></i>
                            </button>
                            <button class="btn btn-icon btn-hover btn-sm btn-rounded pull-right" id="btnDelete" data-id="${item.id_khoa}">
                                <i class="anticon anticon-delete"></i>
                            </button>
                        </td>
                    </tr>
                `;
        });
        table.find("tbody").html(tbodyHtml);
        $('#khoaTable').DataTable({
            pageLength: 7,
            lengthMenu: [5, 10, 25, 50, 100],
            ordering: true,
            searching: true,
            autoWidth: false,
            responsive: true,
            language: {
                paginate: {
                    next: "Next",
                    previous: "Previous"
                },
                search: "Search",
                lengthMenu: "Show _MENU_ entries"
            },
            dom: "Bfrtip",
            buttons: [
                {
                    extend: 'excel',
                    title: 'Danh sách khoa/viện/trường'
                },
                {
                    extend: 'print',
                    title: 'Danh sách khoa/viện/trường'
                }
            ]
        });
    } else {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "error",
            title: res.message
        });
    }
}
function unixTimestampToDate(unixTimestamp) {
    var date = new Date(unixTimestamp * 1000);
    var weekdays = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    var dayOfWeek = weekdays[date.getDay()];
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var year = date.getFullYear();
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);
    var seconds = ("0" + date.getSeconds()).slice(-2);
    var formattedDate = dayOfWeek + ', ' + day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
    return formattedDate;
}
