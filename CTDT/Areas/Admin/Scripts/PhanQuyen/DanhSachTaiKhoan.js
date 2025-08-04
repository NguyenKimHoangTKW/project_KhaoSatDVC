$(".select2").select2();
let currentPage = 1;
let value_check = null;
let value_check_user = null;
$(document).ready(function () {
    load_data();
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
    $(".loader").show();
    try {
        const pageSize = $(this).val();
        load_data(1, pageSize);
    }
    finally {
        $(".loader").hide();
    } 
});
$(document).on("click", "#btnChiTiet", function () {
    const value = $(this).data("id");
    const email = $(this).data("email");
    value_check = value;
    load_info_phan_quyen(value, email);
    $("#modal-chi-tiet").modal("show");
});
$(document).on("click", "#btnGoToPer", function () {
    window.location.href = `/admin/phan-quyen-users/${value_check}`;
})
$(document).on("click", "#btnChiTietQuyenNhomCauHoi", async function () {
    const value = $(this).data("id");
    value_check_user = value;
    await LoadNhomCauHoiMuc1DaChon();
    await LoadNhomCauHoiMuc1();
    $("#ShowNhomCauHoi").modal("show");
})
$(document).on("click", ".btn-add-answer", async function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    await ThemMoiCauHoiByGroup(value);
    await LoadNhomCauHoiMuc1DaChon();
    await LoadNhomCauHoiMuc1();
});
$(document).on("click", ".btn-delete-answer", async function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    await XoaCauHoiByGroup(value);
    await LoadNhomCauHoiMuc1DaChon();
    await LoadNhomCauHoiMuc1();
});
$(document).on("click", "#reset-permission", async function (event) {
    event.preventDefault();
    Swal.fire({
        title: "Bạn đang thao tác Reset quyền người dùng!",
        text: "Hành động này có thể reset toàn bộ quyền về quyền 'Người dùng' (Trừ quyền Admin), bạn muốn tiếp tục?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, tôi muốn tiếp tục"
    }).then((result) => {
        if (result.isConfirmed) {
            ResetPermisssion();
        }
    });
});
$(document).on('click', '#btnSave', function () {
    AddUser();
});
$(document).on('click', '#btnFilter', function () {
    load_data();
});
$(document).on('click', "#btnThietLapPhieu", function () {
    const value = $(this).data("id");
    window.location.href = `/admin/thiet-lap-thong-ke-phieu-user/${value}`;
});
$(document).on("click", "#btnDel", function () {
    var id = $(this).data('id');
    var name = $(this).closest("tr").find("td:eq(2)").text();
    Swal.fire({
        icon: 'warning',
        title: 'Bạn có chắc muốn xóa?',
        text: "Bạn đang cố gắng xóa tài khoản '" + name + "'",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            DelNguoiDung(id);
        }
    });
});
$(document).on('submit', '#importExcelForm', function () {
    e.preventDefault();
    var formData = new FormData(this);
    $.ajax({
        url: `${BASE_URL}/import_excel_users`,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            if (response.status.includes('Thành công')) {
                alert(response.status);
                $('#importExcelModal').modal('hide');
                LoadData(currentPage);
            } else {
                alert(response.status);
            }
        },
        error: function (xhr, status, error) {
            alert('Đã xảy ra lỗi: ' + error);
        }
    });
});
function Toast_alert(type, message) {
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });
    Toast.fire({
        icon: type,
        title: message
    });
}
async function load_data(page = 1, pageSize = $("#pageSizeSelect").val()) {
    var trangthai_select = $('#FilterTrangThai').val();
    const searchTerm = $("#searchInput").val();
    const res = await $.ajax({
        url: `${BASE_URL}/load_du_lieu_users`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_type_user: trangthai_select,
            page: page,
            pageSize: pageSize,
            searchTerm: searchTerm
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if (res && res.data.length > 0) {
        const data = JSON.parse(res.data);
        var body = $('#load_data_table');
        var html = "";
        body.empty();
        html += "<thead>";
        html += "<tr>";
        html += "<th>Số Thứ Tự</th>";
        html += "<th>ID người dùng</th>";
        html += "<th>Tên người dùng</th>";
        html += "<th>Email</th>";
        html += "<th>Quyền hạn</th>";
        html += "<th>Ngày tạo</th>";
        html += "<th>Ngày cập nhật</th>";
        html += "<th>Đăng nhập lần cuối</th>";
        html += "<th>Chức năng</th>";
        html += "</tr>";
        html += "</thead>";
        html += "<tbody>";
        data.forEach(function (items, index) {
            html += "<tr>";
            html += `<td class="formatSo">${(page - 1) * pageSize + index + 1}</td>`;
            html += `<td class="formatSo">${items.id_user}</td>`;
            html += `<td>${items.ten_user}</td>`;
            html += `<td>${items.email}</td>`;
            html += `<td class="formatSo">${items.quyen_han}</td>`;
            html += `<td class="formatSo">${unixTimestampToDate(items.ngay_tao)}</td>`;
            html += `<td class="formatSo">${unixTimestampToDate(items.ngay_cap_nhat)}</td>`;
            html += `<td class="formatSo">${items.dang_nhap_lan_cuoi != null ? unixTimestampToDate(items.dang_nhap_lan_cuoi) : ""}</td>`;
            html += `<td class="formatSo">`;
            html += `<button class="btn btn-hover btn-sm btn-rounded pull-right" id="btnChiTiet" data-id="${items.id_user}"  data-email="${items.email}">Xem chi tiết quyền</button>`;
            html += `<button class="btn btn-hover btn-sm btn-rounded pull-right" id="btnDel" data-id="${items.id_user}">Xóa</button>`;
            html += `</td>`;
            html += "</tr>";
        })
        html += "</tbody>";
        body.html(html);
        renderPagination(res.totalPages, res.currentPage);
    }
};
function AddUser() {
    var Email = $("#Email").val();
    $.ajax({
        url: `${BASE_URL}/add_users`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            email: Email
        }),
        xhrFields: {
            withCredentials: true
        },
        success: function (res) {
            if (res.success) {
                Toast_alert("success", res.status);
                load_data()
            }
            else {
                Toast_alert("error", res.status);
            }
        }
    });
}
function DelNguoiDung(id) {
    $.ajax({
        type: 'POST',
        url: `${BASE_URL}/del_users`,
        contentType: 'application/json',
        data: JSON.stringify({
            id_users: id
        }),
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: response.status,
                showConfirmButton: false,
                timer: 2000
            });
            load_data()
        }
    });
}
async function ThemMoiCauHoiByGroup(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/them-moi-nhom-cau-hoi-by-user`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_group_chinh_cau_hoi: value,
            id_phan_quyen_user: value_check_user
        }),
        xhrFields: { withCredentials: true }
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
    }
    else {
        Sweet_Alert("error", res.message);
    }
}
async function XoaCauHoiByGroup(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/xoa-nhom-cau-hoi-da-chon-by-user`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id_group_by_quyen_user: value }),
        xhrFields: { withCredentials: true }
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
    }
    else {
        Sweet_Alert("error", res.message);
    }
}
async function load_info_phan_quyen(value, email) {
    const res = await $.ajax({
        url: `${BASE_URL}/info-quyen-user`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_users: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });

    const title_type = $("#type_user");
    title_type.empty();
    const quyen_chuc_nang = $("#quyen_chuc_nang");
    quyen_chuc_nang.empty();
    let html_quyen_chuc_nang = ``;
    const table_data_info = $("#table-data-info");
    table_data_info.empty();
    let html_table = ``;
    const title_modal = $("#title-modal-chi-tiet");
    title_modal.empty();

    if (res.success) {
        title_modal.text(email)
        title_type.text(`Quyền được cấp: ${res.data}`)
        if (res.chuc_nang.length > 0) {
            html_quyen_chuc_nang =
                `<h2>Chức năng quyền ${res.data} được cấp</h2>
                 <div class="form-check mb-3">`;
            res.chuc_nang.forEach((items, index) => {
                html_quyen_chuc_nang +=
                    `
                    <div class="form-check mb-3">
                        <label class="form-check-label fw-semibold">
                            ${index + 1} - ${items.ten_chuc_nang}
                        </label>
                    </div>
                    `
            });
            quyen_chuc_nang.html(html_quyen_chuc_nang);
        }
        if (res.phan_quyen.length > 0) {
            if (res.is_role === "CTĐT") {
                html_table = `
                <h2>Chương trình đào tạo được cấp cho user</h2>
                <table id="cbvcTable" class="table table-bordered">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Chương trình đào tạo được phân quyền</th>
                    </tr>
                </thead>
                <tbody>
                `;
            } else if (res.is_role === "Đơn vị") {
                html_table = `
                <h2>Đơn vị được cấp cho user</h2>
                <table id="cbvcTable" class="table table-bordered">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Đơn vị được phân quyền</th>
                    </tr>
                </thead>
                <tbody>
                `;
            } else if (res.is_role === "Đơn vị chuyên môn") {
                html_table =
                    `<h2>Đơn vị chuyên môn được cấp cho user</h2>
                    <table id="cbvcTable" class="table table-bordered">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Đơn vị chuyên môn được phân quyền</th>
                            <th>*</th>
                        </tr>
                    </thead>
                    <tbody>
                    `;
            }
            res.phan_quyen.forEach((item, index) => {
                if (res.is_role === "Đơn vị chuyên môn") {
                    html_table +=
                        `
                        <tr>
                            <td class="formatSo">${index + 1}</td>
                            <td>${item.name}</td>
                            <td>
                                <button class="btn btn-hover btn-sm btn-rounded pull-right" 
                                    id="btnChiTietQuyenNhomCauHoi" 
                                    data-id="${item.value}">
                                    Cấp nhóm câu hỏi cho quyền
                                </button>
                            </td>
                        </tr>
                        `;
                } else {
                    html_table +=
                        `
                        <tr>
                            <td class="formatSo">${index + 1}</td>
                            <td>${item.name}</td>
                        </tr>
                        `;
                }
            });

            html_table +=
                `
                    </tbody>
                </table>`;
            table_data_info.html(html_table);
        }
    } else {
        Sweet_Alert("success", res.message);
    }
}

async function LoadNhomCauHoiMuc1DaChon() {
    const res = await $.ajax({
        url: `${BASE_URL}/danh-sach-nhom-cau-hoi-da-chon-by-user`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id_phan_quyen_user: value_check_user }),
        xhrFields: { withCredentials: true }
    });
    const body = $("#data-table-answer-selected");
    body.empty();
    let html = `
        <table class="table table-bordered" id="table-answer-by-group-selected">
            <thead>
                <tr>
                    <th>*</th>
                    <th>STT</th>
                    <th>Tên nhóm câu hỏi mức 1</th>
                    <th>Mô tả</th>          
                </tr>
            </thead>
            <tbody>`;

    res.data.forEach((items, index) => {
        html += `
                <tr>
                    <td class="formatSo">
                        <button class="btn btn-danger btn-tone m-r-5 btn-delete-answer" data-id="${items.id_group_by_quyen_user}">
                            Xóa
                        </button>
                    </td>
                    <td class="formatSo">${index + 1}</td>
                    <td>${items.ten_group}</td>
                    <td>${items.mo_ta ?? ""}</td>
                </tr>`;
    });

    html += `</tbody></table>`;
    body.html(html);

    if ($.fn.DataTable.isDataTable('#table-answer-by-group-selected')) {
        $('#table-answer-by-group-selected').DataTable().clear().destroy();
    }
    $('#table-answer-by-group-selected').DataTable({
        lengthMenu: [5, 10, 25, 50, 100],
        ordering: true,
        searching: true,
        autoWidth: false,
        responsive: true,
        language: {
            paginate: { next: "Next", previous: "Previous" },
            search: "Search",
            lengthMenu: "Show _MENU_ entries"
        }
    });
}
async function LoadNhomCauHoiMuc1() {
    const year = $("#year-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/danh-sach-nhom-cau-hoi-muc-1-by-user`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_nam_hoc: year,
            id_group_chinh_cau_hoi: value_check_user
        }),
        xhrFields: { withCredentials: true }
    });

    const body = $("#data-table-answer");
    body.empty();
    let html = `
        <table class="table table-bordered" id="table-answer-by-group">
            <thead>
                <tr>
                    <th>*</th>
                    <th>STT</th>
                    <th>Tên nhóm câu hỏi mức 1</th>
                    <th>Mô tả</th>          
                </tr>
            </thead>
            <tbody>`;

    res.data.forEach((items, index) => {
        html += `
                <tr>
                    <td class="formatSo">
                        <button class="btn btn-success btn-tone m-r-5 btn-add-answer" data-id="${items.id_group_chinh_cau_hoi}">
                            Chọn
                        </button>
                    </td>
                    <td class="formatSo">${index + 1}</td>
                    <td>${items.ten_group}</td>
                    <td>${items.mo_ta ?? ""}</td>
                </tr>`;
    });

    html += `</tbody></table>`;
    body.html(html);

    if ($.fn.DataTable.isDataTable('#table-answer-by-group')) {
        $('#table-answer-by-group').DataTable().clear().destroy();
    }
    $('#table-answer-by-group').DataTable({
        lengthMenu: [5, 10, 25, 50, 100],
        ordering: true,
        searching: true,
        autoWidth: false,
        responsive: true,
        language: {
            paginate: { next: "Next", previous: "Previous" },
            search: "Search",
            lengthMenu: "Show _MENU_ entries"
        }
    });
}
async function ResetPermisssion() {
    $(".loader").show();
    try {
        const res = await $.ajax({
            url: `${BASE_URL}/reset-permission`,
            type: 'POST',
            contentType: 'application/json',
            xhrFields: { withCredentials: true }
        });
        if (res.success) {
            Sweet_Alert("success", res.message);
            load_data();
        }
    }
    finally {
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
    var formattedDate = dayOfWeek + ', ' + day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
    return formattedDate;
}
