$(".select2").select2();
let currentPage = 1;
let phieu_khao_sat = null;
let _value = null;
$(document).ready(function () {
    $("#hedaotao, #year").on("change", load_pks_by_nam);
    $("#year").trigger("change")
});
$(document).on("click", "#fildata", function (event) {
    event.preventDefault();
    LoadChartSurvey();
});
$(document).on("change", "#hedaotao, #year", function () {
    $("#Result").empty();
    load_pks_by_nam();
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
        url: `${BASE_URL_CTDT}/load-option-thong-ke-ket-qua-khao-sat`,
        type: 'POST',
        data: {
            id_namhoc: year,
            id_hedaotao: hedaotao
        },
        xhrFields: {
            withCredentials: true
        }
    });
    let htmlSurvey = "";
    let htmlCTDT = "";
    if (res.success) {
        const survey = JSON.parse(res.survey);
        const ctdt = JSON.parse(res.ctdt);
        if (survey.length > 0) {
            htmlSurvey = `<option value="0">TẤT CẢ CÁC PHIẾU</option>`
            survey.forEach(function (item) {
                htmlSurvey += `<option value="${item.id_phieu}">${item.ten_phieu}</option>`;
            });
        }
        else {
            htmlSurvey += `<option value="">Không tồn tại phiếu khảo sát trong năm học này</option>`;
        }
        $("#surveyid").empty().html(htmlSurvey).trigger("change");

        htmlCTDT = `<option value="0">TẤT CẢ CHƯƠNG TRÌNH ĐƯỢC PHÂN CÔNG</option>`
        ctdt.forEach(function (item) {
            htmlCTDT += `<option value="${item.value}">${item.text}</option>`;
        });
        $("#ctdt-check").empty().html(htmlCTDT).trigger("change");
    }
}
async function LoadChartSurvey() {
    $(".loader").show();
    try {
        const survey = $("#surveyid").val();
        const hedaotao = $("#hedaotao").val();
        const year = $("#year").val();
        const ctdt = $("#ctdt-check").val();
        const res = await $.ajax({
            url: `${BASE_URL_CTDT}/giam-sat-ty-le-tham-gia-khao-sat`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                id_namhoc: year,
                surveyID: survey,
                id_ctdt: ctdt,
                id_hdt: hedaotao
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
    const ctdt = $("#ctdt-check").val();
    const trang_thai = $("#trang-thai").val();
    const maphieu = phieu_khao_sat.split('.')[0];
    const nam = $("#year option:selected").text();
    $.ajax({
        url: `${BASE_URL_CTDT}/export-excel-info-giam-sat-ty-le-tham-gia-khao-sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: _value,
            id_ctdt: ctdt,
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
    const ctdt = $("#ctdt-check").val();
    const trang_thai = $("#trang-thai").val();
    const res = await $.ajax({
        url: `${BASE_URL_CTDT}/info-ty-le-tham-gia-khao-sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value,
            page: page,
            pageSize: pageSize,
            searchTerm: searchTerm,
            id_ctdt: ctdt,
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
                <th scope="col">Số điện thoại</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Email khảo sát</th>
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
                <td class="formatSo">${item.sdt}</td>
                <td>${item.mota}</td>
                <td>${item.email_khao_sat}</td>
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