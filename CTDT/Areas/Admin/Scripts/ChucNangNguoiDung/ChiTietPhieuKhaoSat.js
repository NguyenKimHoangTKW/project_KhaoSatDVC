const value = $("#value").text();
let currentPage = 1;
$(document).ready(function () {
    const title = $("#title");
    $("#btnXemBaoCao").click(function () {
        var update = $("#load-title");
        update.hide();
        title.text("Danh sách người đã khảo sát phiếu")
        $("#page-selected").show();
        $("#nav-navigation-page").show();
        load_chi_tiet_cau_tra_loi();
    })
    $("#btnXoaPhieu").click(function (event) {
        event.preventDefault();
        Swal.fire({
            title: "Bạn đang thao tác xóa phiếu khảo sát?",
            text: "Nếu bạn xóa phiếu khảo sát, toàn bộ dữ liệu liên quan đến phiếu khảo sát này sẽ bị xóa khỏi hệ thống, bạn muốn tiếp tục xóa?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Có, tôi đồng ý xóa"
        }).then((result) => {
            if (result.isConfirmed) {
                delete_phieu_khao_sat();
            }
        });
    })
    $("#btnChinhSuaPhieu").click(function (event) {
        event.preventDefault();
        title.text("Chỉnh sửa phiếu khảo sát")
        const body = $("#bodycontent");
        $("#page-selected").hide();
        $("#nav-navigation-page").hide();
       
        body.hide();
        var update = $("#load-title");
        update.show();

        load_chi_tiet_update();
    });
    $("#btnSave").click(function (event) {
        event.preventDefault();
        update_survey();
    });
})
$(document).on("change", "#searchInput", function () {
    setTimeout(() => {
        load_chi_tiet_cau_tra_loi(currentPage);
    }, 500);
});
$(document).on('click', '.btnChiTiet', function () {
    const value = $(this).data('id');
    load_chi_tiet_cau_hoi(value)
    $('.bd-example-modal-xl').modal('show');
});
$(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    const page = $(this).data("page");
    if (page) {
        currentPage = page;
        load_chi_tiet_cau_tra_loi(currentPage);
    }
});
$(document).on("change", "#pageSizeSelect", function () {
    const pageSize = $(this).val();
    load_chi_tiet_cau_tra_loi(currentPage, pageSize);
});
$(document).on("click", "#exportExcel", function () {
    export_excel_danh_sach_cau_tra_loi();
});
$(document).on("click", ".btnDelAW", function () {
    const value = $(this).data("id");
    Swal.fire({
        title: "Bạn thao tác xóa?",
        text: "Bằng việc click vào đồng ý, bạn sẽ xóa dữ liệu của đáp án này, bạn muốn tiếp tục?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, tôi muốn xóa!"
    }).then((result) => {
        if (result.isConfirmed) {
            delete_aw(value);
        }
    });

});
$(document).on("click", "#btnLogTimeSurvey", async function (event) {
    event.preventDefault();
    const title = $("#title");
    title.text("Log thời gian Đóng/Mở phiếu khảo sát")
    const body = $("#bodycontent");
    $("#page-selected").hide();
    $("#nav-navigation-page").hide();
    if ($.fn.DataTable.isDataTable('#bodycontent')) {
        $('#bodycontent').DataTable().clear().destroy();
    }
    body.show();
    var update = $("#load-title");
    update.hide();
    await LogTimeExtension();
});
function export_excel_danh_sach_cau_tra_loi() {
    $.ajax({
        url: `${BASE_URL}/export-excel-danh-sach-cau-tra-loi`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value,
        }),
        xhrFields: {
            responseType: 'blob',
            withCredentials: true
        },
        beforeSend: function () {
            $(".loader").show();
        },
        success: function (data, status, xhr) {
            const blob = new Blob([data], { type: xhr.getResponseHeader('Content-Type') });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ket_qua_phieu.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        },
        error: function () {
            alert("Xuất file thất bại!");
        },
        complete: function () {
            $(".loader").hide();
        }
    });
}
async function load_chi_tiet_update() {
    const value = $("#value").text();
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
        $("#TieuDe").val(item.surveyTitle);
        $("#MoTa").text(item.surveyDescription);
        $(`#DanhChoHe_${item.id_hedaotao}`).prop("checked", true);
        $("#MaDoiTuong").val(item.id_loaikhaosat);
        $("#MaNamHoc").val(item.id_namhoc);
        $("#TrangThai").val(item.surveyStatus);
        $("#DotKhaoSat").val(item.id_dot_khao_sat);
        $("#EnableThongKe").val(item.mo_thong_ke);
        $("#ty-le-dat-val").val(item.ty_le_phan_tram_dat);
        function convertUnixToLocalDateTime(unixTimestamp) {
            let date = new Date(unixTimestamp * 1000);
            date.setHours(date.getHours() + 7);
            return date.toISOString().slice(0, 16);
        }

        $("#NgayBatDau").val(convertUnixToLocalDateTime(item.surveyTimeStart));
        $("#NgayKetThuc").val(convertUnixToLocalDateTime(item.surveyTimeEnd));
    }
}
async function update_survey() {
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
    const TyLe = $("#ty-le-dat-val").val();
    function convertToUnixTime(dateTimeStr) {
        let date = new Date(dateTimeStr);
        return Math.floor(date.getTime() / 1000);
    }
    const unixNgayBatDau = convertToUnixTime(ngayBatDauInput);
    const unixNgayKetThuc = convertToUnixTime(ngayKetThucInput);
    const res = await $.ajax({
        url: `${BASE_URL}/update-phieu-khao-sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value,
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
            ty_le_phan_tram_dat: TyLe
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        Swal.fire({
            icon: "success",
            title: res.message,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000
        });
    } else {
        Swal.fire({
            icon: "error",
            title: res.message,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000
        });
    }
}
async function delete_phieu_khao_sat() {
    const res = await $.ajax({
        url: `${BASE_URL}/xoa-du-lieu-phieu-khao-sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        Swal.fire({
            title: res.message,
            icon: "success",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/admin/danh-sach-phieu-khao-sat";
            }
        });
    } else {
        Swal.fire({
            title: "Xóa không thành công",
            text: res.message || "Đã xảy ra lỗi.",
            icon: "error",
            draggable: true
        });
    }
}
async function delete_aw(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/xoa-cau-tra-loi-phieu`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
        load_chi_tiet_cau_tra_loi(currentPage);
    } else {
        Sweet_Alert("error", res.message);
    }
}
async function load_chi_tiet_cau_tra_loi(page = 1, pageSize = $("#pageSizeSelect").val()) {
    $(".loader").show();
    try {
        const searchTerm = $("#searchInput").val();
        const res = await $.ajax({
            url: `${BASE_URL}/danh-sach-cau-tra-loi-phieu`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                surveyID: value,
                page: page,
                pageSize: pageSize,
                searchTerm: searchTerm
            }),
            xhrFields: {
                withCredentials: true
            }
        });
        const body = $("#bodycontent");
        body.empty();
        let html = ``;
        if ($.fn.DataTable.isDataTable('#bodycontent')) {
            $('#bodycontent').DataTable().clear().destroy();
        }
        if (res.success) {
            res.data.forEach(function (items) {
                if (res.doi_tuong == "is_subject") {
                    html += form_load_chi_tiet_subject(items, page, pageSize);
                }
                else if (res.doi_tuong == "is_student") {
                    html += form_load_chi_tiet_student(items, page, pageSize);
                }
                else if (res.doi_tuong == "is_program") {
                    html += form_load_chi_tiet_program(items, page, pageSize);
                }
                else if (res.doi_tuong == "is_cbvc") {
                    html += form_load_chi_tiet_cbvc(items, page, pageSize);
                }
                else if (res.doi_tuong == "is_gv") {
                    html += form_load_chi_tiet_giang_vien(items, page, pageSize);
                }
            })
            body.show();
            body.html(html);
            renderPagination(res.totalPages, res.currentPage);
        } else {
            html = `<tr><td colspan="10" class="text-center">Không có dữ liệu để hiển thị</td></tr>`;
            body.html(html);
        }
    } finally {
        $(".loader").hide();
    }
}
function form_load_chi_tiet_subject(data, page, pageSize) {
    let html = `
        <thead>
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã KQ</th>
                <th scope="col">Email khảo sát</th>
                <th scope="col">Học phần</th>
                <th scope="col">Mã môn học</th>
                <th scope="col">Tên môn học</th>
                <th scope="col">Lớp</th>
                <th scope="col">Giảng viên giảng dạy</th>
                <th scope="col">Mã người học</th>
                <th scope="col">Tên người học</th>
                <th scope="col">Thời gian thực hiện khảo sát</th>
                <th scope="col">Chi tiết câu trả lời</th>
            </tr>
        </thead>
        <tbody>
    `;
    data.forEach(function (item, index) {
        html += `
            <tr>
                <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>
                <td class="formatSo">${item.ma_kq}</td>
                <td>${item.email}</td>
                <td>${item.hoc_phan}</td>
                <td class="formatSo">${item.ma_mh}</td>
                <td>${item.mon_hoc}</td>
                <td class="formatSo">${item.lop}</td>
                <td>${item.giang_vien_giang_day}</td>
                <td class="formatSo">${item.ma_nh}</td>
                <td>${item.ten_nh}</td>
                <td class="formatSo">${unixTimestampToDate(item.thoi_gian_thuc_hien)}</td>
                <td>
                    <button class="btn btn-info btnChiTiet" data-id="${item.ma_kq}">Chi tiết</button>
                    <button class="btn btn-danger btnDelAW" data-id="${item.ma_kq}" style="margin-top: 10px;">Xóa đáp án</button>
                </td>
            </tr>
        `;
    });

    html += `
        </tbody>
    `;
    return html;
}
function form_load_chi_tiet_student(data, page, pageSize) {
    let html = `
        <thead>
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã KQ</th>
                <th scope="col">Email khảo sát</th>
                <th scope="col">Mã người học</th>
                <th scope="col">Tên người học</th>
                <th scope="col">Thuộc Lớp</th>
                <th scope="col">Thuộc chương trình đào tạo</th>
                <th scope="col">Thời gian thực hiện khảo sát</th>
                <th scope="col">Chi tiết câu trả lời</th>
            </tr>
        </thead>
        <tbody>
    `;
    data.forEach(function (item, index) {
        html += `
            <tr>
                <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>
                <td class="formatSo">${item.ma_kq}</td>
                <td>${item.email}</td>
                <td class="formatSo">${item.ma_nh}</td>
                <td>${item.ten_nh}</td>
                <td>${item.thuoc_lop}</td>
                <td>${item.thuoc_ctdt}</td>
                <td class="formatSo">${unixTimestampToDate(item.thoi_gian_thuc_hien)}</td>
                <td>
                    <div class="d-grid gap-2">
                        <button class="btn btn-info btnChiTiet" data-id="${item.ma_kq}">Chi tiết</button>
                        <button class="btn btn-danger btnDelAW" data-id="${item.ma_kq}" style="margin-top: 10px;">Xóa đáp án</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
        </tbody>
    `;
    return html;
}
function form_load_chi_tiet_program(data, page, pageSize) {
    let html = `
        <thead>
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã KQ</th>
                <th scope="col">Email khảo sát</th>
                <th scope="col">Thuộc CTĐT</th>
                <th scope="col">Thời gian thực hiện khảo sát</th>
                <th scope="col">Chi tiết câu trả lời</th>
            </tr>
        </thead>
        <tbody>
    `;
    data.forEach(function (item, index) {
        html += `
            <tr>
                <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>
                <td class="formatSo">${item.ma_kq}</td>
                <td>${item.email}</td>
                <td>${item.ten_ctdt}</td>
                <td class="formatSo">${unixTimestampToDate(item.thoi_gian_thuc_hien)}</td>
                <td>
                    <div class="d-grid gap-2">
                        <button class="btn btn-info btnChiTiet" data-id="${item.ma_kq}">Chi tiết</button>
                        <button class="btn btn-danger btnDelAW" data-id="${item.ma_kq}" style="margin-top: 10px;">Xóa đáp án</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
        </tbody>
    `;
    return html;
}
function form_load_chi_tiet_giang_vien(data, page, pageSize) {
    let html = `
        <thead>
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã KQ</th>
                <th scope="col">Email khảo sát</th>
                <th scope="col">Mã cán bộ viên chức</th>
                <th scope="col">Tên cán bộ viên chức</th>
                <th scope="col">Chức vụ</th>
                <th scope="col">Trình độ</th>
                <th scope="col">Thuộc khoa</th>
                <th scope="col">Thuộc bộ môn</th>
                <th scope="col">Khảo sát cho chương trình đào tạo</th>
                <th scope="col">Ngành đào tạo</th>
                <th scope="col">Thời gian thực hiện khảo sát</th>
                <th scope="col">Chi tiết câu trả lời</th>
            </tr>
        </thead>
        <tbody>
    `;
    data.forEach(function (item, index) {
        html += `
            <tr>
                <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>
                <td class="formatSo">${item.ma_kq}</td>
                <td>${item.email}</td>
                <td class="formatSo">${item.MaCBVC}</td>
                <td>${item.TenCBVC}</td>
                <td>${item.name_chucvu}</td>
                <td>${item.ten_trinh_do}</td>
                <td>${item.ten_khoa}</td>
                <td>${item.bo_mo}</td>
                <td>${item.khao_sat_cho}</td>
                <td>${item.nganh_dao_tao}</td>
                <td class="formatSo">${unixTimestampToDate(item.thoi_gian_thuc_hien)}</td>
                <td>
                    <div class="d-grid gap-2">
                        <button class="btn btn-info btnChiTiet" data-id="${item.ma_kq}">Chi tiết</button>
                        <button class="btn btn-danger btnDelAW" data-id="${item.ma_kq}" style="margin-top: 10px;">Xóa đáp án</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
        </tbody>
    `;
    return html;
}
function form_load_chi_tiet_cbvc(data, page, pageSize) {
    let html = `
        <thead>
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã KQ</th>
                <th scope="col">Email khảo sát</th>
                <th scope="col">Mã cán bộ viên chức</th>
                <th scope="col">Tên cán bộ viên chức</th>
                <th scope="col">Chức vụ</th>
                <th scope="col">Trình độ</th>
                <th scope="col">Thuộc khoa</th>
                <th scope="col">Thuộc bộ môn</th>
                <th scope="col">Ngành đào tạo</th>
                <th scope="col">Thời gian thực hiện khảo sát</th>
                <th scope="col">Chi tiết câu trả lời</th>
            </tr>
        </thead>
        <tbody>
    `;
    data.forEach(function (item, index) {
        html += `
            <tr>
                <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>
                <td class="formatSo">${item.ma_kq}</td>
                <td>${item.email}</td>
                <td class="formatSo">${item.MaCBVC}</td>
                <td>${item.TenCBVC}</td>
                <td>${item.name_chucvu}</td>
                <td>${item.ten_trinh_do}</td>
                <td>${item.ten_khoa}</td>
                <td>${item.bo_mo}</td>
                <td>${item.nganh_dao_tao}</td>
                <td class="formatSo">${unixTimestampToDate(item.thoi_gian_thuc_hien)}</td>
                <td>
                    <div class="d-grid gap-2">
                        <button class="btn btn-info btnChiTiet" data-id="${item.ma_kq}">Chi tiết</button>
                        <button class="btn btn-danger btnDelAW" data-id="${item.ma_kq}" style="margin-top: 10px;">Xóa đáp án</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
        </tbody>
    `;
    return html;
}
async function load_chi_tiet_cau_hoi(id) {
    const res = await $.ajax({
        url: `${BASE_URL}/chi-tiet-cau-tra-loi`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id: id
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    const body = $("#datatable");
    body.empty();
    if ($.fn.DataTable.isDataTable('#datatable')) {
        $('#datatable').DataTable().clear().destroy();
    }
    let html = "";
    if (res.success) {
        const data = res.data;
        html += `
            <thead>
                <tr>
                    <th scope="col">STT</th>
                    <th scope="col">Câu hỏi</th>
                    <th scope="col">Câu trả lời</th>
                </tr>
            </thead>
            <tbody>
        `;

        let questionIndex = 1;
        const survey = JSON.parse(data.surveyData);
        const answer = JSON.parse(data.json_answer);

        survey.pages.forEach((page) => {
            page.elements.forEach((element) => {
                let value = "";
                let _answer = answer.pages[0]?.elements.find(x => x.name === element.name);

                if ((element.type === "radiogroup" || element.type === "checkbox") && element.choices && Array.isArray(element.choices)) {
                    if (_answer && _answer.response) {
                        let responseName = _answer.response.name;
                        let dapan = element.choices.find(choice => choice.name === responseName);
                        if (dapan) {
                            value = dapan.text;
                        }
                    }
                } else if (element.type === "comment" || element.type === "text") {
                    if (_answer && _answer.response && _answer.response.text) {
                        value = _answer.response.text;
                    }
                }

                html += `
                    <tr>
                        <td>${questionIndex}</td>
                        <td>${element.title}</td>
                        <td>${value}</td>
                    </tr>
                `;
                questionIndex++;
            });
        });

        html += `</tbody>`;
        body.html(html);
        $("#datatable").DataTable({
            pageLength: 100,
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
                    title: 'Danh sách chi tiết thống kê - Excel'
                },
                {
                    extend: 'print',
                    title: 'Danh sách chi tiết thống kê'
                }
            ]
        });
    } else {
        body.html('<tr><td colspan="3">Không có dữ liệu.</td></tr>');
    }
}

async function LogTimeExtension() {
    const res = await $.ajax({
        url: `${BASE_URL}/log-time-extension`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });

    if (res.success) {
        if ($.fn.DataTable.isDataTable('#bodycontent')) {
            $('#bodycontent').DataTable().clear().destroy();
        }
        let body = $("#bodycontent");
        body.empty();
        let html = ``;
        html =
            `
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                </tr>
            </thead>
            <tbody>
            `;
        res.data.forEach((items, index) => {
            html +=
                `
                <tr>
                    <td class="formatSo">Đợt: ${index + 1}</td>
                    <td class="formatSo">${unixTimestampToDate(items.time_log_start)}</td>
                    <td class="formatSo">${unixTimestampToDate(items.time_log_end)}</td>
                </tr>
                `
        })
        html += `</tbody>`
        body.html(html);
        $("#bodycontent").DataTable({
            pageLength: 10,
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
                    title: 'Log thời gian Đóng/Mở phiếu khảo sát - Excel'
                },
                {
                    extend: 'print',
                    title: 'Log thời gian Đóng/Mở phiếu khảo sát'
                }
            ]
        });
    }
    else {
        Sweet_Alert("error", res.message);
    }
}
function initializeDataTable() {
    const table = $("#bodycontent");
    table.DataTable({
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
                title: 'Danh sách chi tiết thống kê - Excel'
            },
            {
                extend: 'print',
                title: 'Danh sách chi tiết thống kê'
            }
        ]
    });
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
