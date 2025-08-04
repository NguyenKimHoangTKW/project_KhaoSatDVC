$(".select2").select2();
let check_option = null;
let currentPage = 1;
let phieu_khao_sat = null;
let _value = null;
$(document).ready(function () {
    $("#hedaotao, #year").on("change", load_pks_by_nam);
    $("#year").trigger("change");
    load_option();
});
$(document).on("click", "#fildata", function (event) {
    event.preventDefault();
    LoadChartSurvey();
});
$(document).on("change", "#hedaotao, #year", function () {
    check_option = null;
    $("#Result").empty();
    load_option();
});
$(document).on("click", "#btnYes", function (event) {
    event.preventDefault();
    check_option = true;
    load_option();
});
$(document).on("click", "#btnNo", function (event) {
    event.preventDefault();
    check_option = false;
    load_option();
});
$(document).on("change", "#searchInput", function () {
    setTimeout(() => {
        load_info(_value, 1);
    }, 500);
});
$(document).on("click", "#maphieu", function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    phieu_khao_sat = $(this).data("tenphieu");
    const title = $(".modal-title");
    title.empty();
    _value = value;
    title.text(phieu_khao_sat);
    load_info(_value);
    $(".bd-example-modal-xl").modal("show");
});
$(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    const page = $(this).data("page");
    if (page) {
        currentPage = page;
        load_info(_value, currentPage);
    }
});
$(document).on("click", "#export", function (event) {
    event.preventDefault();
    ExportExcelInfo();
});
$(document).on("change", "#trang-thai", function () {
    load_info(_value, 1);
});
async function load_pks_by_nam() {
    const hedaotao = $("#hedaotao").val();
    const year = $("#year").val();
    const res = await $.ajax({
        url: '/api/load_phieu_by_nam',
        type: 'POST',
        data: {
            id_namhoc: year,
            id_hedaotao: hedaotao
        },
        xhrFields: {
            withCredentials: true
        }
    });
    let html = "";
    if (res.success) {
        html = `<option value="0">TẤT CẢ CÁC PHIẾU</option>`
        res.data.forEach(function (item) {
            html += `<option value="${item.id_phieu}">${item.ten_phieu}</option>`;
        });
        $("#surveyid").empty().html(html).trigger("change");
    } else {
        html += `<option value="">${res.message}</option>`;
        $("#surveyid").empty().html(html).trigger("change");
        $("#ctdt").empty().html(html).trigger("change");
    }
}
async function load_option() {
    const hedaotao = $("#hedaotao").val();
    const year = $("#year").val();
    const res = await $.ajax({
        url: `${BASE_URL}/load-bo-loc-giam-sat-ty-le-tham-gia-khao-sat`,
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify({
            id_namhoc: year,
            id_hedaotao: hedaotao,
            check_option: check_option,
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    let html = "";
    const body = $("#load-option");
    body.empty();
    if (res.success) {
        const data = JSON.parse(res.data);
        html += `
                    <div class="container mt-4">
                        <div class="row justify-content-center">
                            <div class="col-md-8 col-sm-10 col-12">
                                <div class="row g-2 justify-content-center">
                                    <div class="col-md-6 col-12 d-flex justify-content-center">
                                        <button class="btn btn-tone m-r-5 w-100 px-4" id="btnYes">
                                           Lọc theo đơn vị - khoa - bộ môn
                                        </button>
                                    </div>
                                    <div class="col-md-6 col-12 d-flex justify-content-center">
                                        <button class="btn btn-tone m-r-5 w-100 px-4" id="btnNo">
                                            Lọc theo chương trình học
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        body.html(html);
        if (data.length > 0) {
            updateUI(data);
        }
    }
    else {
        html += `
                    <div class="container mt-4">
                        <div class="row justify-content-center">
                            <div class="col-md-8 col-sm-10 col-12">
                                <div class="row g-2 justify-content-center">
                                    <div class="col-md-6 col-12 d-flex justify-content-center">
                                        <button class="btn btn-tone m-r-5 w-100 px-4" id="btnYes">
                                           Lọc theo đơn vị - khoa - bộ môn
                                        </button>
                                    </div>
                                    <div class="col-md-6 col-12 d-flex justify-content-center">
                                        <button class="btn btn-tone m-r-5 w-100 px-4" id="btnNo">
                                            Lọc theo chương trình học
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        body.html(html);
    }
}
function updateUI(data) {
    let resultContainer = $("#emailResult");
    resultContainer.html(check_option ? render_option_checked(data) : render_option_no_checked(data));
}
async function render_option_checked(data) {
    let html = `
        <div class="col-md-6">
            <label class="form-label"><b>Chọn đơn vị</b></label>
            <select class="form-control select2" id="don_vi">
                <option value="0">Toàn trường</option>
                ${data.map(donvi => `<option value="${donvi.don_vi.value}">${donvi.don_vi.name}</option>`).join("")}
            </select>
        </div>
        <div class="col-md-6">
            <label class="form-label"><b>Chọn khoa</b></label>
            <select class="form-control select2" id="khoa">
                <option value="0">Chọn khoa</option>
            </select>
        </div>
        <div class="col-md-6">
            <label class="form-label"><b>Chọn bộ môn</b></label>
            <select class="form-control select2" id="bo_mon">
                <option value="0">Chọn bộ môn</option>
            </select>
        </div>
    `;

    $("#Result").html(html);

    setTimeout(() => {
        $("#don_vi, #khoa, #bo_mon").select2();
    }, 300);

    $("#don_vi").change(function () {
        const selectedDonVi = $(this).val();
        const khoaDropdown = $("#khoa").empty().append(`<option value="0">Toàn trường</option>`);

        if (selectedDonVi) {
            const selectedData = data.find(d => d.don_vi.value == selectedDonVi);
            if (selectedData) {
                selectedData.khoa_data.forEach(khoa => {
                    khoaDropdown.append(`<option value="${khoa.khoa.value}">${khoa.khoa.name}</option>`);
                });
            }
        }
        khoaDropdown.trigger("change");
    });

    $("#khoa").change(function () {
        const selectedKhoa = $(this).val();
        const boMonDropdown = $("#bo_mon").empty().append(`<option value="0">Toàn trường</option>`);

        if (selectedKhoa) {
            const selectedDonVi = $("#don_vi").val();
            const selectedData = data.find(d => d.don_vi.value == selectedDonVi);
            if (selectedData) {
                const selectedKhoaData = selectedData.khoa_data.find(k => k.khoa.value == selectedKhoa);
                if (selectedKhoaData) {
                    selectedKhoaData.bo_mon.forEach(bm => {
                        boMonDropdown.append(`<option value="${bm.value}">${bm.name}</option>`);
                    });
                }
            }
        }
        boMonDropdown.trigger("change");
    });

    return html;
}
async function render_option_no_checked(data) {
    let html = ``;
    const itemsList = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : [];
    html += `
        <div class="col-md-6">
            <label class="form-label"><b>Chọn chương trình đào tạo</b></label>
            <select class="form-control select2" id="ctdt">
                <option value="0">Tất cả</option>`;

    itemsList.forEach(items => {
        html += `<option value="${items.value}">${items.text}</option>`;
    });

    html += `</select>
        </div>
    `;

    $("#Result").html(html);

    setTimeout(() => {
        $("#ctdt").select2();
    }, 300);

    return html;
}
async function LoadChartSurvey() {
    $(".loader").show();
    try {
        const survey = $("#surveyid").val();
        const hedaotao = $("#hedaotao").val();
        const year = $("#year").val();
        const donvi = $("#don_vi").val();
        const khoa = $("#khoa").val();
        const bomon = $("#bo_mon").val();
        const ctdt = $("#ctdt").val()
        let text_title = "";
        const text_nganh = `Ngành: ${$("#ctdt option:selected").text()}`;
        if (khoa > 0 && bomon == 0) {
            text_title = `Khoa: ${$("#khoa option:selected").text()}`;
        } else if (bomon > 0 && khoa > 0) {
            text_title = `Bộ môn: ${$("#bo_mon option:selected").text()}`;
        } else {
            text_title = `Đơn vị: ${$("#don_vi option:selected").text()}`;
        }
        const res = await $.ajax({
            url: `${BASE_URL}/giam-sat-ty-le-tham-gia-khao-sat`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                id_namhoc: year,
                id_ctdt: ctdt,
                surveyID: survey,
                id_hdt: hedaotao,
                id_don_vi: donvi,
                id_khoa: khoa,
                id_bo_mon: bomon,
                check_option: check_option
            }),
            xhrFields: {
                withCredentials: true
            }
        });
        $('#survey-list').empty();
        if (res.success) {
            const surveys = JSON.parse(res.data);
            surveys.sort((a, b) => {
                const idA = a.ten_phieu.split(".")[0].replace(/\D/g, "");
                const idB = b.ten_phieu.split(".")[0].replace(/\D/g, "");
                return parseInt(idA) - parseInt(idB);
            });
            surveys.forEach((survey) => {
                let card = ``;
                const tenPhieuParts = survey.ten_phieu.split(".");
                const MaPhieu = tenPhieuParts[0].toUpperCase();
                const TieuDePhieu = tenPhieuParts[1]?.trim() || "Không có tiêu đề";
                const thongKeTyLe = {
                    tong_khao_sat: survey.tong_khao_sat,
                    tong_phieu_da_tra_loi: survey.tong_phieu_da_tra_loi,
                    tong_phieu_chua_tra_loi: survey.tong_phieu_chua_tra_loi,
                    ty_le_da_tham_gia: survey.ty_le_da_tra_loi,
                    ty_le_can_dat: survey.ty_le_can_dat
                };
                if (survey.is_dn) {
                    const get_color = survey.trang_thai === `Đạt` ? `color:green;font-weight: bold;` : `color:red;font-weight: bold;`
                    card = `
                        <div class="card survey-card">
                            <div class="card-body">
                                <div style="align-items: center;">
                                    <p style="color:#5029ff;font-weight:bold; position: absolute; top: 0; left: 20px;">${MaPhieu}</p>
                                    <a href="#" style="color:#5029ff;font-weight:bold; position: absolute; top: 14px; right: 20px;" id="maphieu" data-id="${survey.id_phieu}" data-tenphieu="${survey.ten_phieu}">Xem chi tiết</a>
                                    <hr/>
                                    <p style="color:black;font-weight:bold">${TieuDePhieu}</p>
                                    <hr/>
                                </div>
                                <canvas class="chart" id="donut-chart-${MaPhieu}"></canvas>
                                <p id="surveyedInfo-${MaPhieu}" style="margin: 0; color: red;"></p>
                                <hr />
                                <div style="display: flex; justify-content: space-between; align-items: center; font-weight:bold">
                                    <p style="margin: 0; color: black;">Số phiếu tối thiểu cần khảo sát: ${thongKeTyLe.tong_khao_sat || '0'}</p>
                                    <p style="margin: 0; color:#5029ff;">Đã khảo sát: ${thongKeTyLe.tong_phieu_da_tra_loi || '0'}</p>
                                    <p style="margin: 0;${get_color}">${survey.trang_thai}</p>
                                </div>
                            </div>
                        </div>`;
                }
                else {
                    card = `
                        <div class="card survey-card">
                            <div class="card-body">
                                <div style="align-items: center;">
                                    <p style="color:#5029ff;font-weight:bold; position: absolute; top: 0; left: 20px;">${MaPhieu}</p>
                                    <a href="#" style="color:#5029ff;font-weight:bold; position: absolute; top: 14px; right: 20px;" id="maphieu" data-id="${survey.id_phieu}" data-tenphieu="${survey.ten_phieu}">Xem chi tiết</a>
                                    <hr/>
                                    <p style="color:black;font-weight:bold">${TieuDePhieu}</p>
                                    <hr/>
                                    <p style="color:#5029ff;font-weight:bold; top: 39px; right: 20px;">${ctdt ? text_nganh : text_title}</p>
                                    
                                </div>
                                <canvas class="chart" id="donut-chart-${MaPhieu}"></canvas>
                                <p id="surveyedInfo-${MaPhieu}" style="margin: 0; color: red;"></p>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-weight:bold">
                                    <p style="margin: 0; color: #ff0000;">Tỷ lệ cần đạt: ${thongKeTyLe.ty_le_can_dat || '0'}%</p>
                                    <p style="margin: 0; color:black;">Tỷ lệ đã khảo sát: <span style="${thongKeTyLe.ty_le_da_tham_gia > thongKeTyLe.ty_le_can_dat ? "color:green" : "color:red"}">${thongKeTyLe.ty_le_da_tham_gia || '0'}%</span></p>
                                </div>
                                <hr />
                                <div style="display: flex; justify-content: space-between; align-items: center; font-weight:bold">
                                    <p style="margin: 0; color: black;">Tổng phiếu: ${thongKeTyLe.tong_khao_sat || '0'}</p>
                                    <p style="margin: 0; color:#5029ff;">Đã khảo sát: ${thongKeTyLe.tong_phieu_da_tra_loi || '0'}</p>
                                    <p style="margin: 0; color:#ebb000;">Chưa khảo sát: ${thongKeTyLe.tong_phieu_chua_tra_loi || '0'}</p>
                                </div>
                            </div>
                        </div>`;
                }
                $('#survey-list').append(card);
                const donutCtx = document.getElementById(`donut-chart-${MaPhieu}`).getContext('2d');
                if (thongKeTyLe.tong_khao_sat > 0) {
                    const datas = [thongKeTyLe.tong_phieu_chua_tra_loi, thongKeTyLe.tong_phieu_da_tra_loi];
                    const colors = ['#ffc107', '#007bff'];
                    const donutData = {
                        labels: ['Số phiếu chưa khảo sát', 'Số phiếu đã khảo sát'],
                        datasets: [{
                            fill: true,
                            backgroundColor: colors,
                            pointBackgroundColor: colors,
                            data: datas
                        }]
                    };
                    new Chart(donutCtx, {
                        type: 'doughnut',
                        data: donutData,
                        options: {
                            maintainAspectRatio: false,
                            cutout: '45%',
                            plugins: {
                                tooltip: {
                                    enabled: true
                                },
                                legend: {
                                    display: true
                                }
                            }
                        }
                    });
                } else {
                    const donutData = {
                        labels: ['Không có dữ liệu'],
                        datasets: [{
                            fill: true,
                            backgroundColor: ['#d3d3d3'],
                            pointBackgroundColor: ['#d3d3d3'],
                            data: [1]
                        }]
                    };

                    new Chart(donutCtx, {
                        type: 'doughnut',
                        data: donutData,
                        options: {
                            maintainAspectRatio: false,
                            cutout: '45%',
                            plugins: {
                                tooltip: {
                                    enabled: true
                                },
                                legend: {
                                    display: true
                                }
                            }
                        }
                    });

                    $(`#surveyedInfo-${MaPhieu}`).text('Không có dữ liệu');
                }
            });
        } else {
            Sweet_Alert("error", res.message);
        }
    }
    finally {
        $(".loader").hide();
    }
}
function ExportExcelInfo() {
    $(".loader").show();
    const donvi = $("#don_vi").val();
    const khoa = $("#khoa").val();
    const bomon = $("#bo_mon").val();
    const ctdt = $("#ctdt").val();
    const trang_thai = $("#trang-thai").val();
    const maphieu = phieu_khao_sat.split('.')[0];
    const nam = $("#year option:selected").text();
    $.ajax({
        url: `${BASE_URL}/export-excel-info-giam-sat-ty-le-tham-gia-khao-sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: _value,
            id_ctdt: ctdt,
            id_don_vi: donvi,
            id_khoa: khoa,
            id_bo_mon: bomon,
            trang_thai_khao_sat: trang_thai
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
            a.download = `${maphieu}_${nam}_giam_sat_ty_le_tham_gia_khao_sat_phieu.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            $(".loader").hide();
        },
        error: function () {
            $(".loader").hide();
            alert("Xuất file thất bại!");
        }
    });
}
function convertToUnixTime(dateTimeStr, isEndOfDay = false) {
    if (!dateTimeStr) return null;
    let parts = dateTimeStr.split('/');
    if (parts.length !== 3) return null;
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    let date = isEndOfDay ? new Date(year, month, day, 23, 59, 59) : new Date(year, month, day, 0, 0, 0);
    return isNaN(date.getTime()) ? null : Math.floor(date.getTime() / 1000);
}
async function load_info(value, page = 1, pageSize = 10) {
    const searchTerm = $("#searchInput").val();
    const donvi = $("#don_vi").val();
    const khoa = $("#khoa").val();
    const bomon = $("#bo_mon").val();
    const ctdt = $("#ctdt").val();
    const trang_thai = $("#trang-thai").val();
    const res = await $.ajax({
        url: `${BASE_URL}/info-ty-le-tham-gia-khao-sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value,
            page: page,
            pageSize: pageSize,
            searchTerm: searchTerm,
            id_ctdt: ctdt,
            id_don_vi: donvi,
            id_khoa: khoa,
            id_bo_mon: bomon,
            trang_thai_khao_sat: trang_thai,
            searchTerm: searchTerm
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    const body = $("#datatable");
    body.empty();
    let html = ``;
    if (res.success) {
        const data = JSON.parse(res.data);
        if (res.responseType == "is_nguoi_hoc") {
            html += render_info_nh(data[0], page, pageSize);
        }
        body.html(html);
        renderPagination(res.totalPages, res.currentPage);
    }
}
function render_info_nh(data, page, pageSize) {
    let html = `
        <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã người học</th>
                <th scope="col">Tên người học</th>
                <th scope="col">Lớp</th>
                <th scope="col">Email khảo sát</th>
                <th scope="col">Số điện thoại</th>
                <th scope="col">Mô tả</th>
                <th scope="col">Trạng thái khảo sát</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.forEach((item, index) => {
        var color = item.trang_thai == "Đã khảo sát" ? "blue" : "red";
        html += `
            <tr>
                <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>
                <td class="formatSo">${item.ma_nh}</td>
                <td>${item.ten_nh}</td>
                <td class="formatSo">${item.lop}</td>
                <td>${item.email_khao_sat}</td>
                <td class="formatSo">${item.sdt}</td>
                <td>${item.mota}</td>
                <td style="color:${color};font-weight:bold;">${item.trang_thai}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    return html;
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