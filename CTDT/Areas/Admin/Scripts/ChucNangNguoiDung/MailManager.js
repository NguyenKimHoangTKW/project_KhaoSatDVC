$(".select2").select2();
let currentPage = 1;
let _value = null;
let selectedFiles = [];

const btnSelectedSurvey = $("#btnSurvey");
const btnImportExcel = $("#importExcel");
const btnOpenMail = $("#openMail");
const btnViewLog = $("#btnViewLog");
const FormSendMail = $("#formSendMail");
const FormLogMailTable = $("#LogMailFormTable");
const BodyLogMailTable = $("#bodyTableShowLogMail");

$(document).ready(function () {
    $("#nam-val,#hedaotao-val").change(LoadPhieuKhaoSat);
});

$(document).on("click", "#openMail", async function (e) {
    e.preventDefault();
    btnSelectedSurvey.show();
    btnImportExcel.show();
    FormSendMail.show();
    FormLogMailTable.hide();
});
$(document).on("click", "#btnViewLog", async function (e) {
    e.preventDefault();
    btnSelectedSurvey.hide();
    btnImportExcel.hide();
    FormSendMail.hide();
    $(".loader").show();
    await DanhSachLogMail();
    FormLogMailTable.show();
    $("#formSendMail")[0].reset();
    $(".loader").hide();
});
$(document).on("change", "#fileInput", async function () {
    const files = Array.from(this.files);

    selectedFiles = selectedFiles.concat(files).filter((file, index, self) =>
        index === self.findIndex(f => f.name === file.name && f.size === file.size)
    );
    renderSelectedFiles();

    this.value = "";
});

$(document).on("click", "#btnSurvey", async function (e) {
    e.preventDefault();
    await LoadPhieuKhaoSat();
    $("#Modal-DapVienChuaKhaoSat").modal("show");
})
$(document).on("click", "#btnSendMail", async function (e) {
    e.preventDefault();
    $(".loader").show();
    await GuiMail();
    $(".loader").hide();
})
$(document).on("click", ".remove-file", function () {
    const index = $(this).data("index");
    selectedFiles.splice(index, 1);
    renderSelectedFiles();
});
$(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    const page = $(this).data("page");
    if (page) {
        currentPage = page;
        load_info(_value, currentPage);
    }
});

tinymce.init({
    selector: '#mytextarea',
    height: 600,
    plugins: [
        'advlist', 'anchor', 'autolink', 'autosave',
        'charmap', 'code', 'codesample', 'directionality', 'emoticons',
        'fullscreen', 'help', 'image', 'importcss',
        'insertdatetime', 'link', 'lists',
        'media', 'nonbreaking', 'pagebreak', 'preview',
        'quickbars', 'save', 'searchreplace', 'table',
        'visualblocks', 'visualchars', 'wordcount'
    ],
    toolbar: 'undo redo | ' +
        'blocks fontfamily fontsize | bold italic underline strikethrough | ' +
        'align numlist bullist | link image | table media | ' +
        'lineheight outdent indent | forecolor backcolor removeformat | ' +
        'charmap emoticons | code fullscreen preview | save print | ' +
        'pagebreak anchor codesample | ltr rtl',
    menubar: 'file edit view insert format tools table help'
});

$(document).on("click", "#btnSaveChange", async function (event) {
    event.preventDefault();
});
$(document).on("click", "#btnShowInfo", async function (event) {
    event.preventDefault();
    const value = $("#survey-val").val();
    _value = value
    const text = $("#survey-val option:selected").text();
    $("#title-modal-info").text(`Danh sách đáp viên chưa khảo sát ${text}`);
    await load_info(_value)
    $("#modal-info").modal("show");
});
$(document).on("click", "#btnSaveChange", async function () {
    await LayDanhSachMailThuocPhieu();
});
$(document).on("submit", "#importExcelForm", async function (event) {
    event.preventDefault();
    const txtListMail = $("#txtListMail");
    $(".loader").show();
    try {
        var formData = new FormData(this);
        const res = await $.ajax({
            url: `${BASE_URL}/upload-excel-mail-manager`,
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
            txtListMail.empty();
            const emails = res.data.map(item => item.email_khao_sat);
            txtListMail.val(emails.join("\n"));
            $('#importExcelModal').modal('hide');
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
})
$(document).on("click", ".btn-view-mail", async function () {
    const value = $(this).data("id");
    LoadMailRecipients(value);
    $("#see-details").modal("show")
});
$(document).on("click", ".btn-view-content", async function () {
    const value = $(this).data("id");
    LoadInfoMail(value);
    $("#info-mails-log").modal("show")
});
$(document).on("click", ".btn-delete-logs-mail", async function () {
    const value = $(this).data("id");
    await DeleteLogMails(value);
});

async function DeleteLogMails(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/delete-logs-mails`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_mail_logs: value
        })
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
        DanhSachLogMail()
    }
}
async function DanhSachLogMail() {
    const res = await $.ajax({
        url: `${BASE_URL}/danh-sach-log-mail`,
        type: 'GET',
        contentType: 'application/json'
    });
    let html = ``;
    if (res.success) {
        if ($.fn.DataTable.isDataTable('#NhatKyEmail')) {
            $('#NhatKyEmail').DataTable().clear().destroy();
        }
        BodyLogMailTable.empty();
        res.data.forEach((items, index) => {
            html +=
                `
                <tr>
                    <td>${index + 1}</td>
                    <td>${items.userName}</td>
                    <td>${items.Subject}</td>
                    <td class="formatSo">${unixTimestampToDate(items.Create_Date)}</td>
                    <td>
                        <div class="d-grid gap-2">
                            <!-- Nút: Xem chi tiết nội dung -->
                            <div>
                                <button class="btn btn-outline-primary btn-sm w-100 btn-view-content" data-id="${items.id_mail_logs}">
                                    <i class="fas fa-file-lines"></i> Xem nội dung log
                                </button>
                            </div>

                            <!-- Nút: Xem chi tiết mail gửi -->
                            <div style="margin-top: 10px;">
                                <button class="btn btn-outline-success btn-sm w-100 btn-view-mail" data-id="${items.id_mail_logs}">
                                    <i class="fas fa-paper-plane"></i> Xem danh sách mail đã gửi
                                </button>
                            </div>

                            <!-- Nút: Xóa log mail -->
                            <div style="margin-top: 10px;">
                                <button class="btn btn-outline-danger btn-sm w-100 btn-delete-logs-mail" data-id="${items.id_mail_logs}">
                                    <i class="fas fa-trash-alt"></i> Xóa log mail
                                </button>
                            </div>
                        </div>
                    </td>

                </tr>`
        });
        BodyLogMailTable.html(html);
        $('#NhatKyEmail').DataTable({
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
            }
        });
    }
    else {
        Sweet_Alert("error", res.message);
    }
}
async function LoadInfoMail(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/info-mail-log`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id_mail_logs: value })
    });

    const mail = res[0].GetMailLog;
    const attachments = res[0].Recipients || [];

    const body = $("#body-info-log-mails");
    const title_info = $("#title-info-mails-log");
    body.empty();
    title_info.empty();
    title_info.html(mail.Subject);

    let html = `<div class="mail-body-content mb-3" style="color:black">${mail.Body}</div>`;

    if (attachments.length > 0) {
        html += `
      <div class="attachments">
      </hr>
        <h6><b>${attachments.length} tệp đính kèm</b></h6>
        <div class="row">
    `;

        attachments.forEach(file => {
            const isPDF = file.FileName.toLowerCase().endsWith('.pdf');
            const isWord = file.FileName.toLowerCase().endsWith('.doc') || file.FileName.toLowerCase().endsWith('.docx');
            const iconURL = isPDF
                ? 'https://img.icons8.com/color/96/pdf.png'
                : isWord
                    ? 'https://img.icons8.com/color/96/word.png'
                    : 'https://img.icons8.com/color/96/file.png';
            const labelColor = isPDF ? '#d93025' : isWord ? '#1a73e8' : '#5f6368';
            const fileExt = isPDF ? 'PDF' : isWord ? 'WORD' : 'FILE';

            const previewUrl = `${BASE_URL}/preview?filePath=${file.FilePath}`;

            html += `
        <div class="col-6 mb-3">
          <a href="${previewUrl}" target="_blank" style="text-decoration: none; color: inherit;">
            <div class="attachment-card text-center">
              <div class="thumbnail mb-2">
                <img src="${iconURL}" alt="preview" />
              </div>
              <div class="filename text-truncate">${file.FileName}</div>
              <div class="file-type-label" style="background-color: ${labelColor};">
                ${fileExt}
              </div>
            </div>
          </a>
        </div>
      `;
        });

        html += `</div></div>`;
    }

    body.html(html);
    $("#info-mails-log").modal("show");
}
async function LoadMailRecipients(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/info-mail-recipients`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_mail_log: value
        })
    });
    if ($.fn.DataTable.isDataTable('#tableRecipients')) {
        $('#tableRecipients').DataTable().clear().destroy();
    }
    $("#title_Mail_Recipients").text(`Tiêu đề: ${res[0].GetLogMail}`);
    const body = $("#BodyMailRecipients");
    body.empty();
    let html = ``;
    res[0].Recipients.forEach((items, index) => {
        html +=
            `
            <tr>
                <td>${index + 1}</td>
                <td>${items.MailSend}</td>
            </tr>
            `;
    })
    body.html(html);
    $('#tableRecipients').DataTable({
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
        }
    });
}
async function LayDanhSachMailThuocPhieu() {
    const survey = $("#survey-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/lay-email-thuoc-phieu-mail-manager`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: survey
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    const txtListMail = $("#txtListMail");
    if (res.success) {
        txtListMail.empty();
        const emails = res.data.map(item => item.email_khao_sat);
        txtListMail.val(emails.join("\n"));
        Sweet_Alert("success", res.message);
    }
    else {
        Sweet_Alert("error", res.message);
    }
}
function renderSelectedFiles() {
    const container = $("#selectedFilesPreview");
    container.empty();

    selectedFiles.forEach((file, index) => {
        let icon = "fa-file";
        if (file.type.includes("word")) icon = "fa-file-word";
        else if (file.type.includes("excel")) icon = "fa-file-excel";
        else if (file.type.includes("pdf")) icon = "fa-file-pdf";
        else if (file.type.includes("image")) icon = "fa-file-image";

        container.append(`
            <div class="d-flex align-items-center mb-1 p-1 border rounded">
                <i class="fas ${icon} fa-lg mr-2"></i>
                <span class="mr-2">${file.name}</span>
                <button type="button" class="btn btn-sm btn-danger remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);
    });

    $("#fileInput").val("");
}
async function GuiMail() {
    const emails = $("#txtListMail").val().trim();
    const subject = $("#subjectInput").val().trim();
    const content = tinymce.get("mytextarea").getContent().trim();

    if (!emails || !subject || !content) {
        Swal.fire("Thông báo", "Vui lòng nhập đầy đủ email, tiêu đề, nội dung!", "warning");
        return;
    }

    const formData = new FormData();
    formData.append("Emails", emails);
    formData.append("Subject", subject);
    formData.append("Content", content);

    selectedFiles.forEach(file => {
        formData.append("Attachments", file);
    });

    const res = await $.ajax({
        url: `${BASE_URL}/send-mail-manager`,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
    });

    if (res.success) {
        Sweet_Alert("success", res.message);
        selectedFiles = [];
        renderSelectedFiles();
    } else {
        Sweet_Alert("error", res.message);
    }
}
async function LoadPhieuKhaoSat() {
    const year = $("#nam-val").val();
    const hedaotao = $("#hedaotao-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/load-phieu-khao-sat-chuc-nang-mail-manager`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_hedaotao: hedaotao,
            id_namhoc: year
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    const body = $("#survey-val");
    body.empty();
    let html = ``;
    if (res.success) {
        res.data.forEach(items => {
            html += `<option value="${items.surveyID}">${items.surveyTitle}</option>`;
        });
    }
    else {
        html = `<option value="">${res.message}</option>`;
    }
    body.html(html).trigger("change");
}
async function load_info(value, page = 1, pageSize = 10) {
    const res = await $.ajax({
        url: `${BASE_URL}/info-dap-vien-chua-khao-sat-cua-phieu-thuoc-mail-manager`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value,
            page: page,
            pageSize: pageSize
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
        if (res.responseType == "is_gv") {
            html += render_info_gv(data[0], page, pageSize);
        }
        else if (res.responseType == "is_cbvc") {
            html += render_info_cbvc(data[0], page, pageSize);
        }
        else if (res.responseType == "is_nguoi_hoc_by_hp") {
            html += render_info_nh_hp(data[0], page, pageSize);
        }
        else if (res.responseType == "is_gv_ctdt") {
            html += render_info_gv_ctdt(data[0], page, pageSize);
        }
        else if (res.responseType == "is_doanh_nghiep") {
            html += render_info_dn(data[0], page, pageSize);
        }
        else if (res.responseType == "is_nguoi_hoc") {
            html += render_info_nh(data[0], page, pageSize);
        }
        body.html(html);
        renderPagination(res.totalPages, res.currentPage);
    }
}
function render_info_gv(data, page, pageSize) {
    let html = `
        <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã viên chức</th>
                <th scope="col">Tên viên chức</th>
                <th scope="col">Email khảo sát</th>
                <th scope="col">Chức vụ</th>
                <th scope="col">Trình độ</th>
                <th scope="col">Thuộc đơn vị</th>
                <th scope="col">Thuộc bộ môn</th>
                <th scope="col">Ngành đào tạo</th>
                <th scope="col">Khảo sát cho CTĐT</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.forEach((item, index) => {
        html += `
            <tr>
                <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>
                <td class="formatSo">${item.ma_gv}</td>
                <td>${item.ten_gv}</td>
                <td>${item.email_khao_sat}</td>
                <td>${item.chuc_vu}</td>
                <td>${item.trinh_do}</td>
                <td>${item.thuoc_don_vi}</td>
                <td>${item.thuoc_bo_mon ? item.thuoc_bo_mon : ''}</td>
                <td>${item.nganh_dao_tao}</td>
                <td>${item.khao_sat_cho_ctdt}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    return html;
}
function render_info_cbvc(data, page, pageSize) {
    let html = `
        <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã viên chức</th>
                <th scope="col">Tên viên chức</th>
                <th scope="col">Email khảo sát</th>
                <th scope="col">Chức vụ</th>
                <th scope="col">Trình độ</th>
                <th scope="col">Thuộc đơn vị</th>
                <th scope="col">Thuộc bộ môn</th>
                <th scope="col">Ngành đào tạo</th>
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
                <td class="formatSo">${item.ma_gv}</td>
                <td>${item.ten_gv}</td>
                <td>${item.email_khao_sat}</td>
                <td>${item.chuc_vu}</td>
                <td>${item.trinh_do}</td>
                <td>${item.thuoc_don_vi}</td>
                <td>${item.thuoc_bo_mon ? item.thuoc_bo_mon : ''}</td>
                <td>${item.nganh_dao_tao}</td>
                <td style="color:${color};font-weight:bold;">${item.trang_thai}</td>
            </tr>   
        `;
    });

    html += `</tbody></table>`;
    return html;
}
function render_info_nh_hp(data, page, pageSize) {
    let html = `
        <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã môn hoc</th>
                <th scope="col">Tên môn hoc</th>
                <th scope="col">Lớp</th>
                <th scope="col">Giảng viên giảng dạy</th>
                <th scope="col">Học phần</th>
                <th scope="col">Mã người học</th>
                <th scope="col">Tên người học</th>
                <th scope="col">Số điện thoạic</th>
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
                <td class="formatSo">${item.ma_mh}</td>
                <td>${item.mon_hoc}</td>
                <td class="formatSo">${item.lop}</td>
                <td>${item.giang_vien_giang_day}</td>
                <td>${item.hoc_phan}</td>
                <td>${item.ma_nh}</td>
                <td>${item.ten_nh}</td>
                <td class="formatSo">${item.sdt}</td>
                <td style="color:${color};font-weight:bold;">${item.trang_thai}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    return html;
}
function render_info_gv_ctdt(data, page, pageSize) {
    let html = `
        <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Mã viên chức</th>
                <th scope="col">Tên viên chức</th>
                <th scope="col">Email khảo sát</th>
                <th scope="col">Chức vụ</th>
                <th scope="col">Trình độ</th>
                <th scope="col">Thuộc đơn vị</th>
                <th scope="col">Thuộc bộ môn</th>
                <th scope="col">Ngành đào tạo</th>
                <th scope="col">Khảo sát cho CTĐT</th>
                <th scope="col">Trạng thái</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.forEach((item, index) => {
        var color = item.trang_thai == "Đã khảo sát" ? "blue" : "red";
        html += `
            <tr>
                <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>
                <td class="formatSo">${item.ma_gv}</td>
                <td>${item.ten_gv}</td>
                <td>${item.email_khao_sat}</td>
                <td>${item.chuc_vu}</td>
                <td>${item.trinh_do}</td>
                <td>${item.thuoc_don_vi}</td>
                <td>${item.thuoc_bo_mon ? item.thuoc_bo_mon : ''}</td>
                <td>${item.nganh_dao_tao}</td>
                <td>${item.khao_sat_cho_ctdt}</td>
                <td style="color:${color};font-weight:bold;">${item.trang_thai}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    return html;
}
function render_info_dn(data, page, pageSize) {
    let html = `
        <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th scope="col">STT</th>
                <th scope="col">Tên User khảo sát</th>
                <th scope="col">Email khảo sát</th>
                <th scope="col">Khảo sát cho CTĐT</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.forEach((item, index) => {
        html += `
            <tr>
                <td class="formatSo">${(page - 1) * pageSize + index + 1}</td>
                <td>${item.ten_user}</td>
                <td>${item.email_khao_sat}</td>
                <td>${item.khao_sat_cho_ctdt}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    return html;
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