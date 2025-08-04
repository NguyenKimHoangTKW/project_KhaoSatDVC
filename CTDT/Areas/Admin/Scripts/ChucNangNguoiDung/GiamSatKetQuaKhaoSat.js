﻿$(".select2").select2();
var check = false;
var check_tan_xuat = false;
let check_option = null;
$(document).ready(function () {
    load_option();
    $("#hedaotao, #year").on("change", load_pks_by_nam);
    $("#year").trigger("change");
    $("#exportExcel").click(function () {
        let timerInterval;
        Swal.fire({
            title: "Loading ...",
            html: "Đang kiểm tra và xuất kết quả, vui lòng chờ <b></b> giây.",
            timer: 4000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                const timer = Swal.getPopup().querySelector("b");
                timerInterval = setInterval(() => {
                    timer.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                ExportExcelKetQuaKhaoSat();
                var type = "success"
                var message = "Xuất dữ liệu thành công"
                Sweet_Alert(type, message);
            }
        });
    });
    $("#exportExcelTho").click(function () {
        XuatExcel();
    })
});
$(document).on("click", "#fildata", async function () {
    var body = $('#tan_xuat_table');
    await test();
    if (check_tan_xuat) {
        body.show();
    } else {
        body.hide();
    }
    check_tan_xuat = !check_tan_xuat;
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
        url: `${BASE_URL}/load-bo-loc-thong-ke-ket-qua-khao-sat`,
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
async function test() {
    $(".loader").show();
    try {
        const hdtid = $("#hedaotao").val();
        const surveyid = $("#surveyid").val();
        const donvi = $("#don_vi").val();
        const khoa = $("#khoa").val();
        const bomon = $("#bo_mon").val();
        const ctdt = $("#ctdt").val();
        const res = await $.ajax({
            url: `${BASE_URL}/giam-sat-ket-qua-khao-sat`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                id_hdt: hdtid,
                surveyID: surveyid,
                id_ctdt: ctdt,
                id_don_vi: donvi,
                id_khoa: khoa,
                id_bo_mon: bomon,
                check_option: check_option
            }),
            xhrFields: {
                withCredentials: true
            }
        })
        if (res.success) {
            let index = 1;
            check_tan_xuat = true;
            await form_ty_le(JSON.parse(res.rate));
            index = await form_cau_hoi_1_lua_chon(JSON.parse(res.single_levels), index);
            index = await form_cau_hoi_nhieu_lua_chon(JSON.parse(res.many_leves), index);
            await form_cau_hoi_5_muc(JSON.parse(res.five_levels));
            await form_y_kien_khac(JSON.parse(res.other_levels));
            Sweet_Alert("success", "Load dữ liệu thành công");
        }
        else {
            check_tan_xuat = false
            Sweet_Alert("error", res.message);
        }
    }
    catch (error) {
        console.error("Lỗi khi tải báo cáo:", error);
        Swal.fire({
            icon: "error",
            title: "Lỗi!",
            text: "Đã xảy ra lỗi khi tải báo cáo.",
            timer: 3000,
            showConfirmButton: false
        });
    } finally {
        $(".loader").hide();
    }

}
function form_ty_le(ty_le) {
    const val_khoa = $("#khoa option:selected").val();
    const val_bo_mon = $("#bo_mon option:selected").val();
    const val_nganh = $("#ctdt option:selected").val();
    const text_nganh = `Ngành: ${$("#ctdt option:selected").text()}`;
    let text_title = "";

    if (val_khoa > 0 && val_bo_mon == 0) {
        text_title = `Khoa: ${$("#khoa option:selected").text()}`;
    } else if (val_bo_mon > 0 && val_khoa > 0) {
        text_title = `Bộ môn: ${$("#bo_mon option:selected").text()}`;
    } else {
        text_title = `Đơn vị: ${$("#don_vi option:selected").text()}`;
    }


    if (ty_le) {
        let container = $("#ThongKeTyLeSurvey");
        let html = "";
        container.empty();
        if (ty_le[0].is_doanh_nghiep) {
            html = `
                <p style="font-weight:bold;font-size:15px;text-align:center;color:black">THỐNG KÊ SỐ LƯỢNG THAM GIA KHẢO SÁT</p>
                <div class="question-block">
                    <p style="font-size: 20px; font-weight: bold; color: black;"></p>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead style="color:black; text-align:center; font-weight:bold;font-size:15px">
                                <tr>
                                    <th scope="col">Thuộc</th>
                                    <th scope="col">Số lượt tối thiểu cần khảo sát</th>
                                    <th scope="col">Số lượt phản hồi</th>
                                    <th scope="col">Số lượt chưa phản hồi</th>
                                    <th scope="col">Tỷ lệ phản hồi</th>
                                    <th scope="col">Tỷ lệ chưa phản hồi</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
        }
        else {
            html = `
                <p style="font-weight:bold;font-size:15px;text-align:center;color:black">THỐNG KÊ SỐ LƯỢNG THAM GIA KHẢO SÁT</p>
                <div class="question-block">
                    <p style="font-size: 20px; font-weight: bold; color: black;"></p>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead style="color:black; text-align:center; font-weight:bold;font-size:15px">
                                <tr>
                                    <th scope="col">Thuộc</th>
                                    <th scope="col">Số lượt khảo sát</th>
                                    <th scope="col">Số lượt phản hồi</th>
                                    <th scope="col">Số lượt chưa phản hồi</th>
                                    <th scope="col">Tỷ lệ phản hồi</th>
                                    <th scope="col">Tỷ lệ chưa phản hồi</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
        }
        ty_le.forEach(ctdtItem => {
            html += `
                        <tr>
                            <td>${val_nganh ? text_nganh : text_title}</td>
                            <td class="formatSo">${ctdtItem.tong_khao_sat}</td>
                            <td class="formatSo">${ctdtItem.tong_phieu_da_tra_loi}</td>
                            <td class="formatSo">${ctdtItem.tong_phieu_chua_tra_loi}</td>
                            <td class="formatSo">${ctdtItem.ty_le_da_tra_loi}%</td>
                            <td class="formatSo">${ctdtItem.ty_le_chua_tra_loi}%</td>
                        </tr>
                    `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        </div>`;
        container.append(html);
        $("#accordion-default").show();
    } else {
        container.empty();
    }
}
function form_cau_hoi_1_lua_chon(ty_le, index) {
    if (ty_le) {
        let container = $("#surveyContainerSingle");
        container.empty();
        ty_le.forEach(function (item, questionIndex) {
            let questionTitle = item.QuestionTitle.split(".");
            let text_question = questionTitle[1];
            let questionHtml = `
                    <div class="question-block">
                        <p style="font-size: 20px; font-weight: bold; color: black;">${index}. ${text_question}</p>
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead style="color:black; text-align:center; font-weight:bold;font-size:15px">
                                    <tr>
                                        <th scope="col">STT</th>
                                        <th scope="col">Đáp án</th>
                                        <th scope="col">Tần số</th>
                                        <th scope="col">Tỷ lệ (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${item.Choices.map((choice, index) => `
                                        <tr>
                                            <td class="formatSo">${index + 1}</td>
                                            <td>${choice.ChoiceText}</td>
                                            <td class="formatSo">${choice.Count}</td>
                                            <td class="formatSo">${choice.Percentage.toFixed(2)}%</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot style="color:black;font-weight:bold;font-size:15px">
                                    <tr>
                                        <td colspan="2">Tổng</td>
                                        <td class="formatSo">${item.TotalResponses}</td>
                                        <td class="formatSo">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    <hr />
                `;
            container.append(questionHtml);
            index++;
        });
    }
    else {
        container.empty();
    }
    return index;
}
function form_cau_hoi_nhieu_lua_chon(ty_le, index) {
    if (ty_le) {
        let container = $("#surveyContainer");
        container.empty();
        ty_le.forEach(function (item, questionIndex) {
            let questionTitle = item.QuestionTitle.split(".");
            let text_question = questionTitle[1];
            let questionHtml = `
                        <div class="question-block">
                            <p style="font-size: 20px; font-weight: bold; color: black;" data-question-title="${questionTitle}">${index}. ${text_question}</p>
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead style="color:black; text-align:center; font-weight:bold;font-size:15px">
                                        <tr>
                                            <th scope="col">STT</th>
                                            <th scope="col">Đáp án</th>
                                            <th scope="col">Tần số</th>
                                            <th scope="col">Tỷ lệ (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${item.Choices.map((choice, index) => `
                                            <tr>
                                                <td class="formatSo" >${index + 1}</td>
                                                <td>${choice.ChoiceText}</td>
                                                <td class="formatSo">${choice.Count}</td>
                                                <td class="formatSo">${choice.Percentage.toFixed(2)}%</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot style="color:black;font-weight:bold;font-size:15px">
                                        <tr>
                                            <td colspan="2">Tổng</td>
                                            <td class="formatSo">${item.TotalResponses}</td>
                                            <td class="formatSo">100%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <hr />
                    `;
            container.append(questionHtml);
            index++;
        });
    }
    else {
        container.empty();
    }
    return index;
}
function form_cau_hoi_5_muc(ty_le) {
    if (ty_le) {
        const tbody = $('#showdata');
        tbody.empty();
        const thead = $("#showhead");
        let html = "";
        let totalResponses = 0;
        let totalStronglyDisagree = 0;
        let totalDisagree = 0;
        let totalNeutral = 0;
        let totalAgree = 0;
        let totalStronglyAgree = 0;
        let totalScore = 0;
        html = `
                <tr>
                    <th rowspan="2">STT</th>
                    <th rowspan="2">Nội dung</th>
                    <th rowspan="2">Tổng số phiếu</th>
                    <th colspan="5">Tần số</th>
                    <th colspan="5">Tỷ lệ phần trăm</th>
                    <th rowspan="2">Điểm trung bình</th>
                </tr>
                <tr>
                    <th>Hoàn toàn không đồng ý</th>
                    <th>Không đồng ý</th>
                    <th>Bình thường</th>
                    <th>Đồng ý</th>
                    <th>Hoàn toàn đồng ý</th>
                    <th>Hoàn toàn không đồng ý</th>
                    <th>Không đồng ý</th>
                    <th>Bình thường</th>
                    <th>Đồng ý</th>
                    <th>Hoàn toàn đồng ý</th>
                </tr>
            `;
        thead.html(html);

        html = `
                <tr style="color:red;font-weight:bold">
                    <td colspan="2">Tổng</td>
                    <td class="formatSo" id="totalResponses"></td>
                    <td class="formatSo" id="totalStronglyDisagree"></td>
                    <td class="formatSo" id="totalDisagree"></td>
                    <td class="formatSo" id="totalNeutral"></td>
                    <td class="formatSo" id="totalAgree"></td>
                    <td class="formatSo" id="totalStronglyAgree"></td>
                    <td class="formatSo" id="percentageStronglyDisagree"></td>
                    <td class="formatSo" id="percentageDisagree"></td>
                    <td class="formatSo" id="percentageNeutral"></td>
                    <td class="formatSo" id="percentageAgree"></td>
                    <td class="formatSo" id="percentageStronglyAgree"></td>
                    <td class="formatSo" id="averageScore"></td>
                </tr>
            `;
        $("#showfoot").html(html);

        ty_le.forEach(function (item, index) {
            const question_split = item.Question.split(".");
            const text_question = question_split[1];
            const row = $('<tr>');
            row.append($('<td class="formatSo">').text(index + 1));
            row.append($('<td>').text(text_question));
            row.append($('<td class="formatSo">').text(item.TotalResponses));

            totalResponses += item.TotalResponses;

            const frequencies = item.Frequencies;
            const percentages = item.Percentages;

            const stronglyDisagree = frequencies["Hoàn toàn không đồng ý"] || 0;
            const disagree = frequencies["Không đồng ý"] || 0;
            const neutral = frequencies["Bình thường"] || 0;
            const agree = frequencies["Đồng ý"] || 0;
            const stronglyAgree = frequencies["Hoàn toàn đồng ý"] || 0;

            totalStronglyDisagree += stronglyDisagree;
            totalDisagree += disagree;
            totalNeutral += neutral;
            totalAgree += agree;
            totalStronglyAgree += stronglyAgree;

            row.append($('<td class="formatSo">').text(stronglyDisagree));
            row.append($('<td class="formatSo">').text(disagree));
            row.append($('<td class="formatSo">').text(neutral));
            row.append($('<td class="formatSo">').text(agree));
            row.append($('<td class="formatSo">').text(stronglyAgree));

            const stronglyDisagreePercentage = percentages["Hoàn toàn không đồng ý"] ? percentages["Hoàn toàn không đồng ý"].toFixed(2) + "%" : "0%";
            const disagreePercentage = percentages["Không đồng ý"] ? percentages["Không đồng ý"].toFixed(2) + "%" : "0%";
            const neutralPercentage = percentages["Bình thường"] ? percentages["Bình thường"].toFixed(2) + "%" : "0%";
            const agreePercentage = percentages["Đồng ý"] ? percentages["Đồng ý"].toFixed(2) + "%" : "0%";
            const stronglyAgreePercentage = percentages["Hoàn toàn đồng ý"] ? percentages["Hoàn toàn đồng ý"].toFixed(2) + "%" : "0%";

            row.append($('<td class="formatSo">').text(stronglyDisagreePercentage));
            row.append($('<td class="formatSo">').text(disagreePercentage));
            row.append($('<td class="formatSo">').text(neutralPercentage));
            row.append($('<td class="formatSo">').text(agreePercentage));
            row.append($('<td class="formatSo">').text(stronglyAgreePercentage));

            const averageScore = item.AverageScore;
            totalScore += averageScore * item.TotalResponses;

            row.append($('<td class="formatSo">').text(averageScore.toFixed(2)));
            tbody.append(row);
        });

        const averageScore = totalScore / totalResponses;

        $('#totalResponses').text(totalResponses);
        $('#totalStronglyDisagree').text(totalStronglyDisagree);
        $('#totalDisagree').text(totalDisagree);
        $('#totalNeutral').text(totalNeutral);
        $('#totalAgree').text(totalAgree);
        $('#totalStronglyAgree').text(totalStronglyAgree);

        $('#percentageStronglyDisagree').text(((totalStronglyDisagree / totalResponses) * 100).toFixed(2) + "%");
        $('#percentageDisagree').text(((totalDisagree / totalResponses) * 100).toFixed(2) + "%");
        $('#percentageNeutral').text(((totalNeutral / totalResponses) * 100).toFixed(2) + "%");
        $('#percentageAgree').text(((totalAgree / totalResponses) * 100).toFixed(2) + "%");
        $('#percentageStronglyAgree').text(((totalStronglyAgree / totalResponses) * 100).toFixed(2) + "%");
        $('#averageScore').text(averageScore.toFixed(2));
        $("#showhead").show();
        $("#showalldata").show();
        $("#showfoot").show();
        $("#TitleSurvey").show();
    }
    else {
        tbody.empty();
    }
}
function form_y_kien_khac(ty_le) {
    if (ty_le) {
        let Ykienkhac = $("#YkienkhacSurvey");
        let html = "";
        Ykienkhac.empty();

        html += `
            <p style="font-size: 20px; font-weight: bold; color: black;">Ý kiến khác</p>
            <div class="question-block">
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead style="color:black; text-align:center; font-weight:bold;font-size:15px">
                            <tr>
                                ${ty_le.map((item, index) => {
            const titleWithoutNumber = item.QuestionTitle.replace(/^\d+\.\s*/, '');
            return `<th scope="col" style="text-align: left;">${titleWithoutNumber}</th>`;
        }).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                ${ty_le.map(item => `
                                    <td style="vertical-align: top;">
                                        ${item.Responses.map(response => `
                                            <div style="font-size: 15px; color: black; border-bottom: 1px solid #ccc; padding: 5px 0;">
                                                ${response.trim() || ""}
                                            </div>
                                        `).join('')}
                                    </td>
                                `).join('')}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <hr />
        `;

        Ykienkhac.append(html);
    } else {
        $("#YkienkhacSurvey").empty();
    }
}
function getFormattedDateTime() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${month}-${day}_${hours}-${minutes}-${seconds}`;
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
function ExportExcelKetQuaKhaoSat() {
    const text_survey = $("#surveyid option:selected").text();
    const text_nam = $("#year option:selected").text();
    const code_survey = text_survey.split('.');
    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Thống kê kết quả');
    let worksheetYkienKhac = workbook.addWorksheet('Ý kiến khác');
    let headerStyle = {
        font: { name: 'Times New Roman', family: 4, bold: true, size: 12 },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        },
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '83b4ff' }
        }
    };

    let cellStyle = {
        font: { name: 'Times New Roman', family: 4, size: 12 },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        },
        alignment: { vertical: 'middle', wrapText: true }
    };
    let cellNumberStyle = {
        font: { name: 'Times New Roman', family: 4, size: 12 },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };

    let FooterStyle = {
        font: { name: 'Times New Roman', family: 4, size: 13, bold: true, color: { argb: 'FFFF0000' } },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };

    let SurveyTitle = $("#surveyid option:selected").text().toUpperCase();
    worksheet.addRow([SurveyTitle]);
    let lastRowNumber = worksheet.lastRow.number;
    worksheet.mergeCells(`A${lastRowNumber}:F${lastRowNumber}`);
    let mergedCell = worksheet.getCell(`A${lastRowNumber}`);
    mergedCell.font = { bold: true, size: 14 };
    mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };


    let SurveyYear = "NĂM HỌC: " + $("#year option:selected").text().toUpperCase();
    worksheet.addRow([SurveyYear]);
    let lastRowYear = worksheet.lastRow.number;
    worksheet.mergeCells(`A${lastRowYear}:F${lastRowYear}`);
    let mergedCellYear = worksheet.getCell(`A${lastRowYear}`);
    mergedCellYear.font = { bold: true, size: 14 };
    mergedCellYear.alignment = { horizontal: 'center', vertical: 'middle' };

    let TimeExport = "Thời gian xuất dữ liệu : " + LayThoiGian();
    worksheet.addRow([TimeExport]);
    let lastRowTime = worksheet.lastRow.number;
    worksheet.mergeCells(`A${lastRowTime}:B${lastRowTime}`);
    let mergedCellTime = worksheet.getCell(`A${lastRowTime}`);
    mergedCellTime.font = { bold: true, size: 14 };
    mergedCellTime.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.addRow([]);;


    $('#ThongKeTyLeSurvey').each(function () {
        let questionTitle = $(this).find('p').text().toUpperCase();
        let table = $(this).find('table');
        let thead = table.find('thead');
        let tbody = table.find('tbody');

        worksheet.addRow([questionTitle]);
        worksheet.mergeCells(`A${worksheet.lastRow.number}:F${worksheet.lastRow.number}`);
        worksheet.getCell(`A${worksheet.lastRow.number}`).font = { name: 'Times New Roman', size: 12, bold: true };
        worksheet.getCell(`A${worksheet.lastRow.number}`).alignment = { horizontal: 'center', vertical: 'middle' };

        let headers = [];
        $(thead).find('th').each(function () {
            headers.push($(this).text());
        });
        let headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });

        $(tbody).find('tr').each(function () {
            let rowData = [];
            $(this).find('td').each(function () {
                rowData.push($(this).text());
            });
            let dataRow = worksheet.addRow(rowData);
            dataRow.eachCell((cell, colNumber) => {
                if (rowData[colNumber - 1].includes('%')) {
                    cell.style = cellNumberStyle;
                } else if (!isNaN(rowData[colNumber - 1]) && rowData[colNumber - 1] !== '') {
                    cell.style = cellNumberStyle;
                } else {
                    cell.style = cellStyle;
                }
            });
        });

        worksheet.columns.forEach(column => {
            column.width = 20;
        });

        worksheet.addRow([]);
    });
    $('#surveyContainerSingle .question-block').each(function () {
        let questionTitle = $(this).find('p').text().toUpperCase();
        let table = $(this).find('table');
        let thead = table.find('thead');
        let tbody = table.find('tbody');
        let tfoot = table.find('tfoot');

        worksheet.addRow([questionTitle]);
        worksheet.mergeCells(`A${worksheet.lastRow.number}:D${worksheet.lastRow.number}`);
        worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true, size: 14 };
        worksheet.getCell(`A${worksheet.lastRow.number}`).alignment = { horizontal: 'center', vertical: 'middle' };

        let headers = [];
        $(thead[0]).find('th').each(function () {
            headers.push($(this).text());
        });
        let headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });
        let tbodyRows = tbody.find('tr');
        $(tbodyRows).each(function (index) {
            if (index >= 0) {
                let cells = [];
                $(this).find('td').each(function () {
                    cells.push($(this).text());
                });
                let dataRow = worksheet.addRow(cells);

                dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    if (cells[colNumber - 1].includes('%')) {
                        cell.style = cellNumberStyle;
                    } else if (!isNaN(cells[colNumber - 1]) && cells[colNumber - 1] !== '') {
                        cell.style = cellNumberStyle;
                    } else {
                        cell.style = cellStyle;
                    }
                });
            }
        });


        let footers = [];
        $(tfoot[0]).find('td').each(function () {
            footers.push($(this).text());
        });
        let footerRow = worksheet.addRow([footers[0], '', footers[1], footers[2]]);
        worksheet.mergeCells(`A${footerRow.number}:B${footerRow.number}`);
        footerRow.getCell(1).style = FooterStyle;
        footerRow.getCell(2).style = FooterStyle;
        footerRow.getCell(3).style = FooterStyle;
        footerRow.getCell(4).style = FooterStyle;

        worksheet.columns.forEach(column => {
            column.width = 40;
        });

        worksheet.addRow([]);
    });

    $('#surveyContainer .question-block').each(function () {
        let questionTitle = $(this).find('p').text().toUpperCase();
        let table = $(this).find('table');
        let thead = table.find('thead');
        let tbody = table.find('tbody');
        let tfoot = table.find('tfoot');

        worksheet.addRow([questionTitle]);
        worksheet.mergeCells(`A${worksheet.lastRow.number}:D${worksheet.lastRow.number}`);
        worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true, size: 14 };
        worksheet.getCell(`A${worksheet.lastRow.number}`).alignment = { horizontal: 'center', vertical: 'middle' };

        let headers = [];
        $(thead[0]).find('th').each(function () {
            headers.push($(this).text());
        });
        let headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });
        let tbodyRows = tbody.find('tr');
        $(tbodyRows).each(function (index) {
            if (index >= 0) {
                let cells = [];
                $(this).find('td').each(function () {
                    cells.push($(this).text());
                });
                let dataRow = worksheet.addRow(cells);

                dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    if (cells[colNumber - 1].includes('%')) {
                        cell.style = cellNumberStyle;
                    } else if (!isNaN(cells[colNumber - 1]) && cells[colNumber - 1] !== '') {
                        cell.style = cellNumberStyle;
                    } else {
                        cell.style = cellStyle;
                    }
                });
            }
        });


        let footers = [];
        $(tfoot[0]).find('td').each(function () {
            footers.push($(this).text());
        });
        let footerRow = worksheet.addRow([footers[0], '', footers[1], footers[2]]);
        worksheet.mergeCells(`A${footerRow.number}:B${footerRow.number}`);
        footerRow.getCell(1).style = FooterStyle;
        footerRow.getCell(2).style = FooterStyle;
        footerRow.getCell(3).style = FooterStyle;
        footerRow.getCell(4).style = FooterStyle;


        worksheet.columns.forEach(column => {
            column.width = 40;
        });

        worksheet.addRow([]);
    });

    $('#Cauhoi5MucContainer').each(function () {
        let questionTitle = $(this).find('p').text().toUpperCase();
        let table = $(this).find('table');
        let thead = table.find('thead');
        let tbody = table.find('tbody');
        let tfoot = table.find('tfoot');
        let rows = table.find('tr');

        worksheet.addRow([questionTitle]);
        worksheet.mergeCells(`A${worksheet.lastRow.number}:D${worksheet.lastRow.number}`);
        worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true, size: 14 };
        worksheet.getCell(`A${worksheet.lastRow.number}`).alignment = { horizontal: 'center', vertical: 'middle' };

        let headers1 = [];
        $(thead[0]).find('tr:first th').each(function () {
            headers1.push($(this).text());
        });

        let adjustedHeaders = [...headers1.slice(0, 3), 'Tần số', '', '', '', '', 'Tỷ lệ phần trăm', '', '', '', '', ...headers1.slice(5)];
        let headerRow = worksheet.addRow(adjustedHeaders);
        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });
        worksheet.mergeCells(`D${headerRow.number}:H${headerRow.number}`);
        worksheet.getCell(`D${headerRow.number}`).alignment = { horizontal: 'center' };

        worksheet.mergeCells(`I${headerRow.number}:M${headerRow.number}`);
        worksheet.getCell(`I${headerRow.number}`).alignment = { horizontal: 'center' };
        //////////////////////////////////////////////////////////////////////////////////
        let headers2 = [];
        $(thead[0]).find('tr').eq(1).find('th').each(function () {
            headers2.push($(this).text());
        });

        let adjustedHeaders2 = ['', '', '', ...headers2, ''];

        let headerRow2 = worksheet.addRow(adjustedHeaders2);
        headerRow2.eachCell((cell) => {
            cell.style = headerStyle;
        });



        let tbodyRows = tbody.find('tr');
        $(tbodyRows).each(function (index) {
            if (index >= 0) {
                let cells = [];
                $(this).find('td').each(function () {
                    cells.push($(this).text());
                });
                let dataRow = worksheet.addRow(cells);

                dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    if (cells[colNumber - 1].includes('%')) {
                        cell.style = cellNumberStyle;
                    } else if (!isNaN(cells[colNumber - 1]) && cells[colNumber - 1] !== '') {
                        cell.style = cellNumberStyle;
                    } else {
                        cell.style = cellStyle;
                    }
                });
            }
        });

        let footers = [];
        $(tfoot[0]).find('td').each(function () {
            footers.push($(this).text());
        });

        let footerRow = worksheet.addRow([footers[0], '', ...footers.slice(1)]);

        worksheet.mergeCells(`A${footerRow.number}:B${footerRow.number}`);

        footerRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.style = FooterStyle;
        });



        worksheet.columns.forEach(column => {
            column.width = 40;
        });
        worksheet.addRow([]);
    });
    $('#YkienkhacSurvey').each(function () {
        let questionTitle = $(this).find('p').eq(0).text().toUpperCase();
        let table = $(this).find('table');
        let thead = table.find('thead');
        let tbody = table.find('tbody');

        worksheetYkienKhac.addRow([questionTitle]);
        worksheetYkienKhac.mergeCells(`A${worksheetYkienKhac.lastRow.number}:D${worksheetYkienKhac.lastRow.number}`);
        worksheetYkienKhac.getCell(`A${worksheetYkienKhac.lastRow.number}`).font = { bold: true, size: 14 };
        worksheetYkienKhac.getCell(`A${worksheetYkienKhac.lastRow.number}`).alignment = { horizontal: 'center', vertical: 'middle' };

        // Headers
        let headers = [];
        $(thead).find('th').each(function () {
            headers.push($(this).text().trim());
        });
        let headerRow = worksheetYkienKhac.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });

        // Responses
        let responsesByColumn = [];

        $(tbody).find('tr').eq(0).find('td').each(function () {
            let responses = [];
            $(this).find('div').each(function () {
                let text = $(this).text().trim();
                if (text) {
                    responses.push(text);
                }
            });
            responsesByColumn.push(responses);
        });

        let maxResponses = Math.max(...responsesByColumn.map(r => r.length));

        for (let i = 0; i < maxResponses; i++) {
            let row = responsesByColumn.map(responses => responses[i] || ""); // lấy từng dòng
            let BodyRow = worksheetYkienKhac.addRow(row);
            BodyRow.eachCell((cell) => {
                cell.style = cellNumberStyle;
            });
        }

        worksheetYkienKhac.columns.forEach(column => {
            column.width = 50; // 50 là vừa, 150 thì to quá
        });
    });

    workbook.xlsx.writeBuffer().then(function (buffer) {
        const dateTime = getFormattedDateTime();
        const filename = `TLKQKS_${code_survey[0]}_${text_nam}_${dateTime}.xlsx`;
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), filename);
    });
}
async function XuatExcel() {
    $(".loader").show();
    try {
        const surveyid = $("#surveyid").val();
        const res = await $.ajax({
            url: `${BASE_URL}/export-du-lieu-tho`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                surveyID: surveyid
            }),
            xhrFields: {
                withCredentials: true
            }
        });
        if (res.success) {
            exportToExcel(res, res.data);
        } else {
            Sweet_Alert("error", "Không có dữ liệu khảo sát");
        }
    }
    finally {
        $(".loader").hide();
    }
};
function exportToExcel(check, data) {
    var surveytitle = $("#surveyid option:selected").text();
    var code_survey = surveytitle.split('.');
    const text_nam = $("#year option:selected").text();
    const val_khoa = $("#khoa option:selected").val();
    const val_bo_mon = $("#bo_mon option:selected").val();
    const val_nganh = $("#ctdt option:selected").val();
    const text_nganh = $("#ctdt option:selected").text();
    let text_title = "";

    if (val_khoa > 0 && val_bo_mon == 0) {
        text_title = $("#khoa option:selected").text();
    } else if (val_bo_mon > 0 && val_khoa > 0) {
        text_title = $("#bo_mon option:selected").text();
    } else {
        text_title = $("#don_vi option:selected").text();
    }

    var workbook = XLSX.utils.book_new();
    var worksheet = XLSX.utils.aoa_to_sheet([]);
    var excelData = [];
    var titleRow = [surveytitle];
    var headerRow;
    if (check.is_student) {
        headerRow = ["Dấu thời gian", "Email", "Thuộc Đơn vị", "Thuộc CTĐT", "Thuộc Lớp", "Mã người học", "Tên người học", "Ngày sinh", "Giới tính", "Mô tả"];
    }

    if (data.length > 0 && data[0].pages && data[0].pages.length > 0) {
        data[0].pages.forEach(function (page) {
            page.elements.forEach(function (element) {
                headerRow.push(element.title);
            });
        });
    }
    excelData.push(titleRow);
    excelData.push(headerRow);

    data.forEach(function (survey) {
        var rowData = [];
        if (check.is_student) {
            rowData = [
                unixTimestampToDate(survey.DauThoiGian) || "",
                survey.Email || "",
                survey.ThuocDonVi || "",
                survey.ThuocCTDT || "",
                survey.ThuocLop || "",
                survey.MaNH || "",
                survey.TenNH || "",
                survey.NgaySinh || "",
                survey.GioiTinh || "",
                survey.MoTa || ""
            ];
        }
        survey.pages.forEach(function (page) {
            page.elements.forEach(function (element) {
                if (element.type === "text" || element.type === "comment") {
                    rowData.push(element.response ? element.response.text || "" : "");
                } else if (element.type === "radiogroup") {
                    rowData.push(element.response ? element.response.text || "" : "");
                } else if (element.type === "checkbox") {
                    let checkboxResponses = Array.isArray(element.response.text) ? element.response.text.join(", ") : "";
                    rowData.push(checkboxResponses);
                } else if (element.type === "dropdown") {
                    rowData.push(element.response ? element.response.text || "" : "");
                } else {
                    rowData.push("");
                }
            });
        });
        excelData.push(rowData);
    });
    excelData.forEach(function (row) {
        XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: -1 });
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'SurveyData');

    var now = new Date();
    var timestamp = now.getFullYear().toString() +
        ('0' + (now.getMonth() + 1)).slice(-2) +
        ('0' + now.getDate()).slice(-2) +
        ('0' + now.getHours()).slice(-2) +
        ('0' + now.getMinutes()).slice(-2) +
        ('0' + now.getSeconds()).slice(-2);
    var fileName = `${code_survey[0]}_${val_nganh ? text_nganh : text_title}_${text_nam}_DLT_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    var excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    var blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    var formData = new FormData();
    formData.append('file', blob, `${code_survey[0]}_${text_nam}_DLT.xlsx`);
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
