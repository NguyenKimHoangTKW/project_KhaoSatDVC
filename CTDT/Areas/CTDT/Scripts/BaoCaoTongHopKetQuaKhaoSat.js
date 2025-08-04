$(".select2").select2();
let initializedTables = {};
$(document).ready(function () {
    $("#hedaotao, #year").on("change", load_option);
    $("#fildata").click(function () {
        load_bao_cao();
    })
    $('#exportExcel').click(function () {
        ExportExcelBaoCaoTongHop();
    })
});
async function load_option() {
    const namhoc = $("#year").val();
    const hedaotao = $("#hedaotao").val();

    const res = await $.ajax({
        url: `${BASE_URL_CTDT}/load_option_bao_cao_tong_hop`,
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify({
            namhoc: namhoc,
            hedaotao: hedaotao
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    let html = ``;
    const surveyDropdown = $("#survey");
    surveyDropdown.empty();
    if (res.success) {
        const data = JSON.parse(res.survey);
        data.forEach(item => {
            html += `<option value="${item.id_phieu}">${item.ten_phieu}</option>`;
        });
        surveyDropdown.html(html);
    } else {
        surveyDropdown.html(`<option value="0">Không có dữ liệu</option>`);
    }

    setTimeout(() => {
        surveyDropdown.select2();
    }, 100);
}
async function load_bao_cao() {
    $(".loader").show();
    try {
        const namhoc = $('#year').val();
        const hedaotao = $('#hedaotao').val();
        const survey = $('#survey').val();
        const text_namhoc = $("#year option:selected").text();
        const res = await $.ajax({
            url: `${BASE_URL_CTDT}/bao-cao-tong-hop-ket-qua-khao-sat`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                id_namhoc: namhoc,
                id_hdt: hedaotao,
                surveyList: survey
            }),
            xhrFields: {
                withCredentials: true
            }
        });

        let body = $('#accordion-default');
        body.empty();

        if (res.success) {
            const data = JSON.parse(res.results);
            let html = `
                <p id="show-time" style="color:red;text-align:right;font-size: 20px; font-weight:bold;"></p>
                <div class="d-flex">
                    <ul class="nav nav-tabs flex-column" id="myTabVertical" role="tablist">
            `;

            data.forEach((items, index) => {
                const code_survey = items.survey.split('.');
                const activeClass = index === 0 ? 'active' : '';

                html += `
                    <li class="nav-item">
                        <a class="nav-link ${activeClass}" id="tab-${index}" data-toggle="tab" href="#content-${index}" 
                            role="tab" aria-controls="content-${index}" aria-selected="true" title="${items.survey}">
                            ${code_survey[0]} - ${text_namhoc}
                        </a>
                    </li>
                `;
            });

            html += `</ul><div class="tab-content m-l-15" id="myTabContentVertical">`;

            data.forEach((items, index) => {
                const activeClass = index === 0 ? 'show active' : '';
                html += `<div class="tab-pane fade ${activeClass}" id="content-${index}" role="tabpanel" aria-labelledby="tab-${index}">`;

                if (items.role == "is_gv") {
                    html += render_gv(items, index);
                } else if (items.role == "is_nghoc_by_hp" || items.role == "is_nghoc") {
                    html += render_nguoi_hoc(items, index);
                } else if (items.role == "is_gv_ctdt") {
                    html += render_gv_ctdt(items, index);
                }
                else if (items.role == "is_dn") {
                    html += render_dn(items, index);
                }

                html += `</div>`;
            });
            html += `</div></div>`;
            body.html(html);

            if (ngayBatDauInput && ngayKetThucInput) {
                $("#show-time").text(`Khoảng thời gian thống kê: ${unixTimestampToDate(unixNgayBatDau)} - ${unixTimestampToDate(unixNgayKetThuc)}`)
            }
            data.forEach((items, index) => {
                if (index === 0) {
                    $(`#dataTable-${index}`).DataTable({
                        paging: false,
                        ordering: true,
                        searching: true,
                        autoWidth: false,
                        responsive: true,
                        scrollY: "1000px",
                        scrollX: true,
                        scrollCollapse: true,
                        fixedHeader: true
                    });
                    initializedTables[`#dataTable-${index}`] = true;
                }
            });

            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                const targetId = $(e.target).attr('href');
                const tableSelector = `${targetId} table`;
                if ($.fn.DataTable.isDataTable(tableSelector)) {
                    $(tableSelector).DataTable().columns.adjust().draw();
                } else {
                    $(tableSelector).DataTable({
                        paging: false,
                        ordering: true,
                        searching: true,
                        autoWidth: false,
                        responsive: true,
                        scrollY: "1000px",
                        scrollX: true,
                        scrollCollapse: true,
                        fixedHeader: true
                    });
                }
            });

            Sweet_Alert("success", "Loading dữ liệu thành công");
        } else {
            Sweet_Alert("error", "Lỗi");
        }
    } finally {
        $(".loader").hide();
    }
}
function render_nguoi_hoc(data, index) {
    let html = `
        <div class="card-body">
            <table class="table table-bordered" id="dataTable-${index}">
                <thead class="text-center font-weight-bold" style="color:black;">
                    <tr>
                        <th>STT</th>
                        <th>Chương trình đào tạo</th>
                        <th>Số lượt khảo sát</th>
                        <th>Số lượt phản hồi</th>
                        <th>Số lượt chưa phản hồi</th>
                        <th>Tỷ lệ phản hồi</th>
                        <th>Tỷ lệ chưa phản hồi</th>
                        <th>Tỷ lệ phản hồi tích cực</th>
                        <th>Điểm trung bình</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.data.forEach((items, index) => {
        html += `
            <tr>
                <td class="formatSo">${index + 1}</td>
                <td>${items.ctdt}</td>
                <td class="formatSo">${items.tong_khao_sat}</td>
                <td class="formatSo">${items.tong_phieu_da_tra_loi}</td>
                <td class="formatSo">${items.tong_phieu_chua_tra_loi}</td>
                <td class="formatSo">${items.ty_le_da_tra_loi}%</td>
                <td class="formatSo">${items.ty_le_chua_tra_loi}%</td>
        `;

        if (items.muc_do_hai_long.length > 0) {
            const mucDo = items.muc_do_hai_long[0];
            html += `
                <td class="formatSo">${mucDo.avg_ty_le_hai_long}%</td>
                <td class="formatSo">${mucDo.avg_score}</td>
            `;
        } else {
            html += `<td class="formatSo">-</td><td class="formatSo">-</td>`;
        }
        html += `</tr>`;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;
    return html;
}
function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}
function LayThoiGian() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
async function ExportExcelBaoCaoTongHop() {
    $(".loader").show();
    try {
        const namhoc = $('#year').val();
        const hedaotao = $('#hedaotao').val();
        const survey = $('#survey').val();
        const text_namhoc = $("#year option:selected").text();
        const timeExport = LayThoiGian();
        const res = await $.ajax({
            url: `${BASE_URL_CTDT}/bao-cao-tong-hop-ket-qua-khao-sat`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                id_namhoc: namhoc,
                id_hdt: hedaotao,
                surveyList: survey
            }),
            xhrFields: {
                withCredentials: true
            }
        });

        if (!res.success || !res.results || res.results.length === 0) {
            Sweet_Alert("error", "Không có dữ liệu để xuất báo cáo");
            return;
        }
        const data = JSON.parse(res.results);
        let wb = XLSX.utils.book_new();

        data.forEach((items, index) => {
            const code_survey = items.survey.split('.');
            let ws_data = [];
            const title = `Báo cáo khảo sát: ${items.survey}`;
            const sheetName = `${code_survey[0]}-${text_namhoc}`;
            ws_data.push([title]);
            ws_data.push([`Thời gian xuất: ${timeExport}`]);
            ws_data.push([`Khoảng thời gian thống kê: ${unixTimestampToDate(items.from_date)} - ${unixTimestampToDate(items.to_date)}`]);
            ws_data.push([]);

            if (items.role == "is_gv") {
                ws_data.push(["STT", "Chương trình đào tạo", "Tổng số lượt khảo sát", "Tỷ lệ phản hồi tích cực", "Điểm trung bình"]);
            } else if (items.role == "is_cbvc") {
                ws_data.push(["STT", "Đơn vị", "Số lượt khảo sát", "Số lượt phản hồi", "Số lượt chưa phản hồi", "Tỷ lệ phản hồi", "Tỷ lệ chưa phản hồi", "Tỷ lệ phản hồi tích cực", "Điểm trung bình"]);
            }
            else if (items.role == "is_nghoc" || items.role == "is_nghoc_by_hp") {
                ws_data.push(["STT", "Chương trình đào tạo", "Số lượt khảo sát", "Số lượt phản hồi", "Số lượt chưa phản hồi", "Tỷ lệ phản hồi", "Tỷ lệ chưa phản hồi", "Tỷ lệ phản hồi tích cực", "Điểm trung bình"]);
            }
            else if (items.role == "is_gv_ctdt") {
                ws_data.push(["STT", "Chương trình đào tạo", "Số lượt khảo sát", "Số lượt phản hồi", "Số lượt chưa phản hồi", "Tỷ lệ phản hồi", "Tỷ lệ chưa phản hồi", "Tỷ lệ phản hồi tích cực", "Điểm trung bình"]);
            }
            else if (items.role == "is_dn") {
                ws_data.push(["STT", "Chương trình đào tạo", "Số lượt khảo sát", "Số lượt phản hồi", "Số lượt chưa phản hồi", "Tỷ lệ phản hồi", "Tỷ lệ chưa phản hồi", "Tỷ lệ phản hồi tích cực", "Điểm trung bình"]);
            }
            items.data.forEach((row, i) => {
                let rowData = [i + 1];

                if (items.role == "is_gv") {
                    rowData.push(row.ctdt, row.count_dap_vien);
                    if (row.muc_do_hai_long.length > 0) {
                        rowData.push(row.muc_do_hai_long[0].avg_ty_le_hai_long + "%", row.muc_do_hai_long[0].avg_score);
                    } else {
                        rowData.push("-", "-");
                    }
                } else if (items.role == "is_cbvc") {
                    rowData.push(row.don_vi, row.tong_khao_sat, row.tong_phieu_da_tra_loi, row.tong_phieu_chua_tra_loi, row.ty_le_da_tra_loi + "%", row.ty_le_chua_tra_loi + "%");
                    if (row.muc_do_hai_long.length > 0) {
                        rowData.push(row.muc_do_hai_long[0].avg_ty_le_hai_long + "%", row.muc_do_hai_long[0].avg_score);
                    } else {
                        rowData.push("-", "-");
                    }
                } else if (items.role == "is_nghoc" || items.role == "is_nghoc_by_hp") {
                    rowData.push(row.ctdt, row.tong_khao_sat, row.tong_phieu_da_tra_loi, row.tong_phieu_chua_tra_loi, row.ty_le_da_tra_loi + "%", row.ty_le_chua_tra_loi + "%");
                    if (row.muc_do_hai_long.length > 0) {
                        rowData.push(row.muc_do_hai_long[0].avg_ty_le_hai_long + "%", row.muc_do_hai_long[0].avg_score);
                    } else {
                        rowData.push("-", "-");
                    }
                } else if (items.role == "is_gv_ctdt") {
                    rowData.push(row.ctdt, row.tong_khao_sat, row.tong_phieu_da_tra_loi, row.tong_phieu_chua_tra_loi, row.ty_le_da_tra_loi + "%", row.ty_le_chua_tra_loi + "%");
                    if (row.muc_do_hai_long.length > 0) {
                        rowData.push(row.muc_do_hai_long[0].avg_ty_le_hai_long + "%", row.muc_do_hai_long[0].avg_score);
                    } else {
                        rowData.push("-", "-");
                    }
                }
                else if (items.role == "is_dn") {
                    rowData.push(row.ctdt, row.tong_khao_sat, row.tong_phieu_da_tra_loi, row.tong_phieu_chua_tra_loi, row.ty_le_da_tra_loi + "%", row.ty_le_chua_tra_loi + "%");
                    if (row.muc_do_hai_long.length > 0) {
                        rowData.push(row.muc_do_hai_long[0].avg_ty_le_hai_long + "%", row.muc_do_hai_long[0].avg_score);
                    } else {
                        rowData.push("-", "-");
                    }
                }

                ws_data.push(rowData);
            });

            let ws = XLSX.utils.aoa_to_sheet(ws_data);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });
        XLSX.writeFile(wb, `BCTH_${text_namhoc}_${timeExport.replace(/[: ]/g, '_')}.xlsx`);
    }
    finally {
        $(".loader").hide();
    }

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
function unixTimestampToDate(unixTimestamp) {
    var date = new Date(unixTimestamp * 1000);

    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var year = date.getFullYear();
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);
    var seconds = ("0" + date.getSeconds()).slice(-2);
    var formattedDate = day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
    return formattedDate;
}
