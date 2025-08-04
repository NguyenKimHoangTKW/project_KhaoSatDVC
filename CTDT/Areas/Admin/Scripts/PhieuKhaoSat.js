$(".select2").select2();
let currentPage = 1;
let value_check = null;
$(document).ready(function () {
    load_data();
    $("#cancelmodalAdd").click(function () {
        $('#TieuDe').val('');
        $('#MoTa').val('');
        $('input[name="DanhChoHe"]').prop('checked', false);
        $('#MaDoiTuong').val('');
        $('#NgayBatDau').val('');
        $('#NgayKetThuc').val('');
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
    load_data(1, pageSize);
});

$(document).on("click", ".btnChiTiet", function () {
    const id = $(this).data("id");
    window.location.href = `/admin/chi-tiet-phieu-khao-sat/${id}`;
});
$(document).on("click", ".btnEditTimeSurvey", function () {
    const value = $(this).data("id");
    value_check = value;
    load_chi_tiet_update(value);
    $("#exampleModal").modal("show");
});
$(document).on("click", "#btnSaveTime", function (event) {
    event.preventDefault();
    save_time(value_check);
});
$(document).on("click", "#btnFilter", function () {
    load_data();
})
$(document).on("click", "#btnSave", function (event) {
    event.preventDefault();
    add_new_survey();
})
async function load_data(page = 1, pageSize = $("#pageSizeSelect").val()) {
    const hdtid = $("#hdtid").val();
    const loaikhaosatid = $("#loaikhaosatid").val();
    const namid = $("#namid").val();
    const StatusSurvey = $("#StatusSurvey").val();
    const searchTerm = $("#searchInput").val();
    if ($.fn.DataTable.isDataTable('#datatable')) {
        $('#datatable').DataTable().clear().destroy();
    }
    const res = await $.ajax({
        url: `${BASE_URL}/danh-sach-phieu-khao-sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_hedaotao: hdtid,
            id_loaikhaosat: loaikhaosatid,
            id_namhoc: namid,
            surveyStatus: StatusSurvey,
            page: page,
            pageSize: pageSize,
            searchTerm: searchTerm
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    let html = ``;
    const body = $("#show-data-list");
    body.empty();
    if (res.success) {
        var items = res.data;
        items.sort(function (a, b) {
            var maPhieuA = a.ten_phieu.split(".")[0];
            var maPhieuB = b.ten_phieu.split(".")[0];
            return maPhieuA.localeCompare(maPhieuB, undefined, { numeric: true, sensitivity: 'base' });
        });
        items.forEach(function (survey, index) {
            var MaPhieu = survey.ten_phieu.split(".")[0];
            var formattedNgayTao = unixTimestampToDate(survey.ngay_tao);
            var formattedNgayChinhSua = unixTimestampToDate(survey.ngay_cap_nhat);
            var formattedNgayBatDau = unixTimestampToDate(survey.ngay_bat_dau);
            var formattedNgayKetThuc = unixTimestampToDate(survey.ngay_ket_thuc);
            var trangThaiText = survey.trang_thai == 0 ? 'ĐANG ĐÓNG' : 'ĐANG MỞ';
            var styleTrangThaiText = survey.trang_thai == 0 ? "/Areas/assets/images/logo-close.png" : "/Areas/assets/images/logo-open.png";
            html += `
                <div class="card position-relative">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h4 class="m-b-10">${survey.ten_phieu}</h4>
                            <div class="text-end fs-4 fw-bold text-primary" style="font-size: 30px">${survey.nam}</div>
                        </div>
                        <div class="row">
                            <div class="col-md-4">
                                <img class="img-fluid" src="${styleTrangThaiText}" alt="">
                            </div>
                            <div class="col-md-8">
                                <div class="row m-t-5 m-b-15">
                                    <!-- Cột bên trái -->
                                    <div class="col-md-6">
                                        <div class="mb-2">
                                            <span class="text-black font-weight-semibold">Người tạo: </span>
                                            <span class="text-black" style="color:blue">${survey.nguoi_tao}</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="text-black font-weight-semibold">Hệ đào tạo: </span>
                                            <span class="text-black" style="color:blue">${survey.ten_hdt}</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="text-black font-weight-semibold">Loại khảo sát: </span>
                                            <span class="text-black" style="color:blue">${survey.loai_khao_sat}</span>
                                        </div>
                                    </div>

                                    <!-- Cột bên phải -->
                                    <div class="col-md-6">
                                        <div class="mb-2">
                                            <span class="text-black font-weight-semibold">Ngày bắt đầu: </span>
                                            <span class="text-black" style="color:#28a745">${formattedNgayBatDau}</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="text-black font-weight-semibold">Ngày kết thúc: </span>
                                            <span class="text-black" style="color:#28a745">${formattedNgayKetThuc}</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="text-black font-weight-semibold">Ngày tạo: </span>
                                            <span class="text-black" style="color:#fd7e14">${formattedNgayTao}</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="text-black font-weight-semibold">Ngày chỉnh sửa: </span>
                                            <span class="text-black" style="color:#fd7e14">${formattedNgayChinhSua}</span>
                                        </div>
                                    </div>
                                </div>
                                <p class="m-b-20" style="color:#050516">${survey.mo_ta}</p>
                                <div class="row">
                                    <div class="col-md-6 text-left">
                                        <a class="btn btn-hover font-weight-semibold btnEditTimeSurvey" data-id="${survey.ma_phieu}" href="javascript:void(0)">
                                            <span>Chỉnh sửa thời gian đóng/mở phiếu</span>
                                        </a>
                                    </div>
                                    <div class="col-md-6 text-right">
                                        <a class="btn btn-hover font-weight-semibold btnChiTiet" data-id="${survey.ma_phieu}" href="javascript:void(0)">
                                            <span>Xem chi tiết</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        body.html(html);
        renderPagination(res.totalPages, res.currentPage);
    } else {
        $('#card-view').html(`<tr><td colspan='13' class='text-center'>${res.message}</td></tr>`);
    }
}
async function add_new_survey() {
    const tieuDe = $('#TieuDe').val();
    const moTa = $('#MoTa').val();
    const danhChoHe = $('input[name="DanhChoHe"]:checked').val();
    const maDoiTuong = $('#MaDoiTuong').val();
    const ngayBatDauInput = $('#NgayBatDau').val();
    const ngayKetThucInput = $('#NgayKetThuc').val();
    const trangThai = $('#TrangThai').val();
    const dotkhaosat = $("#DotKhaoSat").val();
    const mothongke = $("#EnableThongKe").val();
    const maNamHoc = $("#MaNamHoc").val();
    const ty_Le = $("#ty-le-val").val();
    const ngayBatDau = new Date(ngayBatDauInput + 'Z');
    const ngayKetThuc = new Date(ngayKetThucInput + 'Z')
    const unixNgayBatDau = Math.floor(ngayBatDau.getTime() / 1000);
    const unixNgayKetThuc = Math.floor(ngayKetThuc.getTime() / 1000);
    const res = await $.ajax({
        url: `${BASE_URL}/them-moi-phieu-khao-sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyTitle: tieuDe,
            surveyDescription: moTa,
            id_hedaotao: danhChoHe,
            id_loaikhaosat: maDoiTuong,
            id_namhoc: maNamHoc,
            surveyTimeStart: unixNgayBatDau,
            surveyTimeEnd: unixNgayKetThuc,
            surveyStatus: trangThai,
            id_dot_khao_sat: dotkhaosat,
            mo_thong_ke: mothongke,
            ty_le_phan_tram_dat: ty_Le
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
        load_data();
    }
    else {
        Sweet_Alert("error", res.message);
    }
}
async function load_chi_tiet_update(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/get-info-survey`,
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        const item = res.data;
        function convertUnixToLocalDateTime(unixTimestamp) {
            let date = new Date(unixTimestamp * 1000);
            date.setHours(date.getHours() + 7);
            return date.toISOString().slice(0, 16);
        }
        $("#NgayBatDau-update").val(convertUnixToLocalDateTime(item.surveyTimeStart));
        $("#NgayKetThuc-update").val(convertUnixToLocalDateTime(item.surveyTimeEnd));
    }
}
async function save_time(value) {
    const ngayBatDauInput = $('#NgayBatDau-update').val();
    const ngayKetThucInput = $('#NgayKetThuc-update').val();
    function convertToUnixTime(dateTimeStr) {
        let date = new Date(dateTimeStr);
        return Math.floor(date.getTime() / 1000);
    }
    const unixNgayBatDau = convertToUnixTime(ngayBatDauInput);
    const unixNgayKetThuc = convertToUnixTime(ngayKetThucInput);
    const res = await $.ajax({
        url: `${BASE_URL}/update-time-phieu-khao-sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value,
            surveyTimeStart: unixNgayBatDau,
            surveyTimeEnd: unixNgayKetThuc
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
        load_data();
    }
    else {
        Sweet_Alert("error", res.message);
    }
};
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
function formatDateTimeLocal(unixTimestamp) {
    var date = new Date(unixTimestamp * 1000);
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
