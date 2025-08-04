$(".select2").select2();
let value_check = "";
let currentPage = 1;
$(document).ready(function () {
    load_data();
    $("#Modal-update").on("hidden.bs.modal", function () {
        $(this).find("input, textarea, select").val("");
        $(this).find("input[type=checkbox], input[type=radio]").prop("checked", false);
    });
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
    load_data(currentPage);
});
$(document).on("click", "#btnAdd", function (event) {
    event.preventDefault();
    $("#modal-title-update").text("Thêm mới cán bộ viên chức/giảng viên");
    const footer = $("#modal-footer-update");
    footer.empty();
    let html =
        `
        <button type="button" class="btn btn-danger btn-tone m-r-5" data-dismiss="modal">Thoát</button>
        <button type="button" class="btn btn-success btn-tone m-r-5" id="btnSaveAdd">Lưu dữ liệu</button>
        `;
    footer.html(html);
    $("#Modal-update").modal("show");
});
$(document).on("click", "#btnSaveAdd", function (event) {
    event.preventDefault();
    add_new();
});
$(document).on("submit", "#importExcelForm", async function (event) {
    event.preventDefault();
    $(".loader").show();
    try {
        var formData = new FormData(this);
        const res = await $.ajax({
            url: `${BASE_URL}/upload-excel-cbvc`,
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
        $(".loader").hide();
    }
});
$(document).on("click", "#btnEdit", function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    $("#modal-title-update").text("Cập nhật cán bộ viên chức/giảng viên");
    const footer = $("#modal-footer-update");
    footer.empty();
    let html =
        `
        <button type="button" class="btn btn-danger btn-tone m-r-5" data-dismiss="modal">Thoát</button>
        <button type="button" class="btn btn-success btn-tone m-r-5" id="btnSaveEdit">Lưu dữ liệu</button>
        `;
    footer.html(html);
    value_check = value;
    get_info(value)
    $("#Modal-update").modal("show");
});
$(document).on("click", "#btnSaveEdit", function (event) {
    event.preventDefault();
    update_cbvc(value_check);
});
$(document).on("click", "#btnDelete", function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    Swal.fire({
        title: "Bạn đang thao tác xóa!",
        text: "Bạn có chắc muốn xóa dữ liệu này!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, xóa luôn!"
    }).then((result) => {
        if (result.isConfirmed) {
            delete_cbvc(value);
        }
    });
});
$(document).on("click", "#export", function (event) {
    event.preventDefault();
    export_excel();
});
async function delete_cbvc(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/delete-cbvc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_cbvc: value
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
async function update_cbvc(value) {
    const macbvc = $("#macbvc-val").val();
    const tencbvc = $("#tencbvc-val").val();
    const email = $("#email-val").val();
    const ngaysinh = $("#ngaysinh-val").val();
    const donvi = $("#donvi-val").val();
    const chucvu = $("#chucvu-val").val();
    const trinhdo = $("#trinhdo-val").val();
    const bomon = $("#bomon-val").val();
    const ctdt = $("#ctdt-val").val();
    const nam = $("#nam-val").val();
    const ghichu = $("#ghichu-val").val();
    const nganhdaotao = $("#nganhdaotao-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/update-cbvc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_CBVC: value,
            MaCBVC: macbvc,
            TenCBVC: tencbvc,
            Email: email,
            NgaySinh: ngaysinh,
            id_don_vi: donvi,
            id_chucvu: chucvu,
            id_bo_mon: bomon,
            id_ctdt: ctdt,
            id_trinh_do: trinhdo,
            id_namhoc: nam,
            description: ghichu,
            nganh_dao_tao: nganhdaotao
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
async function get_info(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/get-info-cbvc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_CBVC: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    const info = JSON.parse(res.data);
    const ctdt = JSON.parse(res.ctdt);
    const ngaysinh = info.NgaySinh ? info.NgaySinh.split("T")[0] : "";
    $("#macbvc-val").val(info.MaCBVC);
    $("#tencbvc-val").val(info.TenCBVC);
    $("#email-val").val(info.Email);
    $("#ngaysinh-val").val(ngaysinh);
    $("#donvi-val").val(info.id_don_vi).trigger("change");
    $("#bomon-val").val(info.id_bo_mon).trigger("change");
    $("#chucvu-val").val(info.id_chucvu).trigger("change");
    $("#trinhdo-val").val(info.id_trinh_do).trigger("change");
    $("#nam-val").val(info.id_namhoc).trigger("change");
    $("#ghichu-val").val(info.description);
    const selectedValues = ctdt.map(item => item);
    $("#ctdt-val").val(selectedValues).trigger("change");
    $("#nganhdaotao-val").val(info.nganh_dao_tao);
};
async function add_new() {
    const macbvc = $("#macbvc-val").val();
    const tencbvc = $("#tencbvc-val").val();
    const email = $("#email-val").val();
    const ngaysinh = $("#ngaysinh-val").val();
    const donvi = $("#donvi-val").val();
    const chucvu = $("#chucvu-val").val();
    const trinhdo = $("#trinhdo-val").val();
    const bomon = $("#bomon-val").val();
    const ctdt = $("#ctdt-val").val();
    const nam = $("#nam-val").val();
    const ghichu = $("#ghichu-val").val();
    const nganhdaotao = $("#nganhdaotao-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/them-moi-cbvc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            MaCBVC: macbvc,
            TenCBVC: tencbvc,
            Email: email,
            NgaySinh: ngaysinh,
            id_don_vi: donvi,
            id_chucvu: chucvu,
            id_bo_mon: bomon,
            id_ctdt: ctdt,
            id_trinh_do: trinhdo,
            id_namhoc: nam,
            description: ghichu,
            nganh_dao_tao: nganhdaotao
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
    $(".loader").show();
    try {
        const donvi = $("#FiterDonvi").val();
        const bomon = $("#FilterBoMon").val();
        const nam = $("#FilterNam").val();
        const searchTerm = $("#searchInput").val();
        const res = await $.ajax({
            url: `${BASE_URL}/danh-sach-cbvc`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                id_namhoc: nam,
                id_donvi: donvi,
                id_bo_mon: bomon,
                page: page,
                pageSize: pageSize,
                searchTerm: searchTerm
            }),
            xhrFields: {
                withCredentials: true
            }
        });
        const body = $("#cbvcTable");
        let html = "";
        if (res.success) {
            const data = JSON.parse(res.data);
            let thead =
                `
            <tr>
                <th scope="col">STT</th>
                <th scope="col">ID CBVC</th>
                <th scope="col">Mã CBVC</th>
                <th scope="col">Tên CBVC</th>
                <th scope="col">Ngày sinh</th>
                <th scope="col">Email</th>             
                <th scope="col">Chức vụ</th>
                <th scope="col">Trình độ</th>
                <th scope="col">Thuộc đơn vị</th>
                <th scope="col">Thuộc bộ môn</th>
                <th scope="col">Thuộc chương trình đào tạo</th>
                <th scope="col">Ngành đào tạo</th>
                <th scope="col">Năm hoạt động</th>
                <th scope="col">Ngày tạo</th>
                <th scope="col">Cập nhật lần cuối</th>
                <th scope="col">Mô tả</th>
                <th scope="col">Chức năng</th>
            </tr>
            `;
            body.find("thead").html(thead);
            data.forEach((item, index) => {
                const selectedValues = item.thuoc_ctdt.map(item => item.ten_ctdt).join(' ; ');
                html +=
                    `
                <tr>
                    <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>  
                    <td class="formatSo">${item.id_CBVC}</td>
                    <td class="formatSo">${item.MaCBVC}</td>
                    <td>${item.TenCBVC}</td>
                    <td class="formatSo">${item.NgaySinh}</td>
                    <td>${item.Email}</td>
                    <td>${item.chucvu}</td>
                    <td>${item.trinh_do}</td>
                    <td>${item.donvi}</td>
                    <td>${item.bo_mon}</td>
                    <td>${selectedValues}</td>
                    <td>${item.nganh_dao_tao}</td>
                    <td class="formatSo">${item.NamHoc}</td>
                    <td class="formatSo">${unixTimestampToDate(item.ngaytao)}</td>
                    <td class="formatSo">${unixTimestampToDate(item.ngaycapnhat)}</td>
                    <td>${item.descripton}</td>
                    <td>
                        <button class="btn btn-icon btn-hover btn-sm btn-rounded pull-right" id="btnEdit" data-id="${item.id_CBVC}">
                            <i class="anticon anticon-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-hover btn-sm btn-rounded pull-right" id="btnDelete" data-id="${item.id_CBVC}">
                            <i class="anticon anticon-delete"></i>
                        </button>
                    </td>
                </tr>
                `;
            });
            body.find("tbody").html(html);
            renderPagination(res.totalPages, res.currentPage);
        } else {
            html =
                `
            <tr>
                <td colspan="14" class="text-center text-danger">${res.message || 'Không có dữ liệu'}</td>
            </tr>
            `;
            body.find("tbody").html(html);
        }
    }
    finally {
        $(".loader").hide();
    }
};
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
    var formattedDate = dayOfWeek + ', ' + day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
    return formattedDate;
}
function export_excel() {
    $(".loader").show();
    const donvi = $("#FiterDonvi").val();
    const bomon = $("#FilterBoMon").val();
    const nam = $("#FilterNam").val();
    $.ajax({
        url: `${BASE_URL}/export-excel-danh-sach-can-bo-vien-chuc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_namhoc: nam,
            id_donvi: donvi,
            id_bo_mon: bomon,
        }),
        xhrFields: {
            responseType: 'blob',
            withCredentials: true
        },
        success: function (data, status, xhr) {
            let blob = new Blob([data], { type: xhr.getResponseHeader('Content-Type') });
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = `Danh sách cán bộ viên chức.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            $(".loader").hide();
        },
        error: function () {
            alert("Xuất file thất bại!");
            $(".loader").hide();
        }
    });
}
