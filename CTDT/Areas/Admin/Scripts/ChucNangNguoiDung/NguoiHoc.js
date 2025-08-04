﻿$(".select2").select2();
let value_check = "";
let currentPage = 1;
$(document).ready(function () {
    load_data();
    $("#ModalXoa").on("hidden.bs.modal", function () {
        $(this).find("input, textarea, select").val("");
        $(this).find("input[type=checkbox], input[type=radio]").prop("checked", false);
    });
    $("#importExcelModal").on("hidden.bs.modal", function () {
        $(this).find("input, textarea, select").val("");
        $(this).find("input[type=checkbox], input[type=radio]").prop("checked", false);
    });
});
$(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    const page = $(this).data("page");
    if (page) {
        currentPage = page;
        load_data(currentPage);
    }
});

$(document).on("change", "#pageSizeSelect", function () {
    const pageSize = $(this).val();
    load_data(currentPage, pageSize);
});

$(document).on("click", "#btnFilter", function (event) {
    event.preventDefault();
    load_data();
});

$(document).on("click", "#btnAdd", function (event) {
    event.preventDefault();
    $("#title-update").text("Thêm mới người học");
    const footer = $("#modalfooterupdate");
    footer.empty();
    let html =
        `
        <button type="button" class="btn btn-danger btn-tone m-r-5" data-dismiss="modal">Thoát</button>
        <button type="button" class="btn btn-success btn-tone m-r-5" id="btnSaveAdd">Lưu</button>
        `;
    footer.html(html);
    $("#bd-example-modal-lg").modal("show");
});
$(document).on("click", "#btnSaveAdd", function (event) {
    event.preventDefault();
    add_new();
});
$(document).on("click", "#btnEdit", function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    $("#title-update").text("Chỉnh sửa người học");
    const footer = $("#modalfooterupdate");
    footer.empty();
    let html =
        `
        <button type="button" class="btn btn-danger btn-tone m-r-5" data-dismiss="modal">Thoát</button>
        <button type="button" class="btn btn-success btn-tone m-r-5" id="btnSaveEdit">Lưu</button>
        `;
    footer.html(html);
    get_info(value);
    $("#bd-example-modal-lg").modal("show");
    value_check = value;

});
$(document).on("click", "#btnSaveEdit", function (event) {
    event.preventDefault();
    update(value_check);
});
$(document).on("click", "#btnDelete", function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    value_check = value;
    $("#ModalXoa").modal("show");
});
$(document).on("click", "#btnConfirmDelete", function (event) {
    event.preventDefault();
    const checked = $("#checkbox-confirm-del").prop("checked");
    if (checked) {
        delete_nh(value_check);
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
            title: "Bạn cần phải chấp nhận để tiếp tục"
        });
    }
});
$(document).on("submit", "#importExcelForm", async function (event) {
    event.preventDefault();
    $("#loadingSpinner").show();
    try {
        var formData = new FormData(this);
        const res = await $.ajax({
            url: `${BASE_URL}/upload-excel-nguoi-hoc`,
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
            load_data(currentPage);
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
    finally {
        $("#loadingSpinner").hide();
    }
   
});
$(document).on("click", "#export", async function (event) {
    event.preventDefault();
    await export_excel();
});
async function delete_nh(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/delete-nguoi-hoc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_sv: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });
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
    load_data(currentPage);
}
async function get_info(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/get-info-nguoi-hoc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_sv: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    const ngaysinh = res.ngaysinh ? res.ngaysinh.split("T")[0] : "";
    $("#manh-val").val(res.ma_sv);
    $("#tennh-val").val(res.hovaten);
    $("#lop-val").val(res.id_lop).trigger("change");
    $("#ngaysinh-val").val(ngaysinh).trigger("change");
    $("#sodienthoai-val").val(res.sodienthoai);
    $("#diachi-val").val(res.diachi);
    $("#gioitinh-val").val(res.phai).trigger("change");
    $("#ghichu-val").val(res.description);
}
async function update(value) {
    const manh = $("#manh-val").val();
    const tennh = $("#tennh-val").val();
    const lop = $("#lop-val").val();
    const ngaysinh = $("#ngaysinh-val").val();
    const sodienthoai = $("#sodienthoai-val").val();
    const diachi = $("#diachi-val").val();
    const gioitinh = $("#gioitinh-val").val();
    const ghichu = $("#ghichu-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/update-nguoi-hoc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_sv: value,
            ma_sv: manh,
            hovaten: tennh,
            id_lop: lop,
            ngaysinh: ngaysinh,
            sodienthoai: sodienthoai,
            diachi: diachi,
            phai: gioitinh,
            description: ghichu
        }),
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
        load_data(currentPage);
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
async function add_new() {
    const manh = $("#manh-val").val();
    const tennh = $("#tennh-val").val();
    const lop = $("#lop-val").val();
    const ngaysinh = $("#ngaysinh-val").val();
    const sodienthoai = $("#sodienthoai-val").val();
    const diachi = $("#diachi-val").val();
    const gioitinh = $("#gioitinh-val").val();
    const ghichu = $("#ghichu-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/them-moi-nguoi-hoc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ma_sv: manh,
            hovaten: tennh,
            id_lop: lop,
            ngaysinh: ngaysinh,
            sodienthoai: sodienthoai,
            diachi: diachi,
            phai: gioitinh,
            description: ghichu
        }),
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
        load_data(currentPage);
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
async function load_data(page = 1, pageSize = $("#pageSizeSelect").val()) {
    $("#loadingSpinner").show();
    try {
        const lop = $("#FilterLop").val();
        const searchTerm = $("#searchInput").val();
        const res = await $.ajax({
            url: `${BASE_URL}/danh-sach-nguoi-hoc`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                id_lop: lop,
                page: page,
                pageSize: pageSize,
                searchTerm: searchTerm
            }),
            xhrFields: {
                withCredentials: true
            }
        });

        const body = $("#nguoihocTable");
        let html = "";

        if (res.success) {
            let thead =
                `
            <tr>
                <th scope="col">STT</th>
                <th scope="col">ID Người học</th>
                <th scope="col">Mã số người học</th>
                <th scope="col">Tên người học</th>
                <th scope="col">Thuộc lớp</th>
                <th scope="col">Ngày sinh</th>
                <th scope="col">Số điện thoại</th>
                <th scope="col">Địa chỉ</th>
                <th scope="col">Giới tính</th>
                <th scope="col">Mô tả</th>
                <th scope="col">Ngày Tạo</th>
                <th scope="col">Cập nhật lần cuối</th>
                <th scope="col">Chức năng</th>
            </tr>
            `;
            body.find("thead").html(thead);
            res.data.forEach((item, index) => {
                html +=
                    `
                <tr>
                    <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>
                    <td class="formatSo">${item.id_sv}</td>
                    <td class="formatSo">${item.ma_sv}</td>
                    <td>${item.hovaten}</td>
                    <td class="formatSo">${item.ma_lop}</td>
                    <td class="formatSo">${item.ngaysinh}</td>
                    <td class="formatSo">${item.sodienthoai}</td>
                    <td>${item.diachi}</td>
                    <td>${item.phai}</td>
                    <td>${item.description}</td>
                    <td class="formatSo">${unixTimestampToDate(item.ngaytao)}</td>
                    <td class="formatSo">${unixTimestampToDate(item.ngaycapnhat)}</td>
                    <td>
                        <button class="btn btn-icon btn-hover btn-sm btn-rounded pull-right" id="btnEdit" data-id="${item.id_sv}">
                            <i class="anticon anticon-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-hover btn-sm btn-rounded pull-right" id="btnDelete" data-id="${item.id_sv}">
                            <i class="anticon anticon-delete"></i>
                        </button>
                    </td>
                </tr>
                `;
            });
            body.find("tbody").html(html);
            renderPagination(res.totalPages, res.currentPage);
        } else {
            html = `
            <tr>
                <td colspan="14" class="text-center text-danger">${res.message || 'Không có dữ liệu'}</td>
            </tr>
        `;
            body.html(html);
            $("#paginationControls").html("");
        }
    }
    finally{
        $("#loadingSpinner").hide();
    }
}
async function export_excel() {
    try {
        $(".loader").show();
        const lop = $("#FilterLop").val();

        const response = await fetch(`${BASE_URL}/export-excel-danh-sach-nguoi-hoc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ id_lop: lop })
        });

        if (!response.ok) {
            throw new Error("Xuất file thất bại!");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Danh_sach_nguoi_hoc.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert(error.message);
    } finally {
        $(".loader").hide();
    }
}
function renderPagination(totalPages, currentPage) {
    const paginationContainer = $("#paginationControls");
    let html = "";
    html += `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
    `;

    html += `
        <li class="page-item ${currentPage === 1 ? "active" : ""}">
            <a class="page-link" href="#" data-page="1">1</a>
        </li>
    `;

    if (currentPage > 4) {
        html += `
            <li class="page-item disabled">
                <a class="page-link">...</a>
            </li>
        `;
    }
    const maxPagesToShow = 3;
    const startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPagesToShow / 2));
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? "active" : ""}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    if (currentPage < totalPages - 3) {
        html += `
            <li class="page-item disabled">
                <a class="page-link">...</a>
            </li>
        `;
    }
    if (totalPages > 1) {
        html += `
            <li class="page-item ${currentPage === totalPages ? "active" : ""}">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
            </li>
        `;
    }
    html += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
    `;
    paginationContainer.html(html);
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
    var formattedDate = dayOfWeek + ', ' + day + "-" + month + "-" + year + " " + ', ' + hours + ":" + minutes + ":" + seconds;
    return formattedDate;
};