// Biến gán giá trị
$(".select2").select2();
let _value_title = "";
let _value_children_tittle = "";
let _value_check_dkk = null;
let json_value_check_dkk = "";
//
// Các sự kiện
$(document).ready(function () {
    $("#hedaotao, #year").on("change", load_pks_by_nam);
    $("#year").trigger("change");
    $('#optionsTextarea').val('1. ');
    function validateRomanInput() {
        const romanRegex = /^(?=[MDCLXVI])M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;
        const input = $("#edtThuTuHienThiTitle");
        const value = input.val();

        if (!romanRegex.test(value) && value !== "") {
            input.val(value.slice(0, -1));
            Swal.fire({
                icon: "warning",
                title: "Chỉ được nhập chữ số La Mã",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 2000
            });
        }
    }
    $("#edtThuTuHienThiTitle").on("input", validateRomanInput);
    $("#exampleModal").on("hidden.bs.modal", function () {
        $(this).find("input, textarea").val("");
        $(this).find("select").prop("selectedIndex", 0);
        $(this).find(".is-invalid, .is-valid").removeClass("is-invalid is-valid");
    });
});
$(document).on("change", "#hedaotao, #year, #surveyid", async function () {
    $('#tieu-de-pks').empty();
    $("#check-public").empty();
});
$(document).on("click", "#btnFilter", async function (event) {
    event.preventDefault();
    $(".loader").show();
    try {
        await load_tieu_de_pks();
    }
    finally {
        $(".loader").hide();
    }
});
$("#sortOption").on("change", function () {
    const selected = $(this).val();
    if (selected === "alpha") {
        $("#customOrderField").show();
    } else {
        $("#customOrderField").hide();
        $("#customOrder").val("");
    }
});
$(document).on('keypress', '#optionsTextarea', function (event) {
    if (event.which === 13) {
        event.preventDefault();
        const textarea = $(this);
        const text = textarea.val();
        const lines = text.split('\n');
        const lastLine = lines[lines.length - 1];
        const match = lastLine.match(/^(\d+)\./);
        const nextNumber = match ? parseInt(match[1], 10) + 1 : 1;
        textarea.val(text + `\n${nextNumber}. `);
    }
});
$(document).on('paste', '#optionsTextarea', function () {
    const textarea = $(this);
    setTimeout(function () {
        const text = textarea.val();
        const lines = text.split('\n');
        let newText = '';
        let lineNumber = 1;
        lines.forEach(function (line, index) {
            if (line.trim() !== '') {
                const currentLine = line.match(/^(\d+)\./);
                if (currentLine) {
                    newText += `${lineNumber}. ${line.substring(currentLine[0].length).trim()}\n`;
                } else {
                    newText += `${lineNumber}. ${line.trim()}\n`;
                }
                lineNumber++;
            }
        });

        textarea.val(newText.trim());
    }, 1);
});
$(document).on("click", "#btnSaveChangesAddTittle", function (event) {
    event.preventDefault()
    add_tittle();
});
$(document).on("click", "#btnAddTitle", function () {
    const footer = $("#showfootermodaltitlesurvey");
    const titleHeaderModal = $("#exampleModalLabelTitleSurvey")
    let footer_html = "";
    footer.empty();
    footer_html =
        `
        <button type="button" class="btn btn-default" data-dismiss="modal">Đóng</button>
        <button type="button" id="btnSaveChangesAddTittle" class="btn btn-primary">Lưu dữ liệu</button>
        `;
    titleHeaderModal.text("Thêm mới tiêu đề câu hỏi")
    footer.html(footer_html);
    $("#exampleModal").modal('show');
})
$(document).on("click", "#btnDeleteTitleSurvey", function () {
    const value = $(this).data("id");
    Swal.fire({
        title: "Bạn chắc chắn muốn xóa tiêu đề?",
        text: "Nếu xóa tiêu đề chính, tất cả các tiêu đề phụ sẽ bị xóa!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, xóa luôn"
    }).then((result) => {
        if (result.isConfirmed) {
            delete_tieu_de_pks(value);
        }
    });
})
$(document).on("click", "#btnEditTitleSurvey", function () {
    const value = $(this).data("id");
    _value_title = value;
    const footer = $("#showfootermodaltitlesurvey");
    const titleHeaderModal = $("#exampleModalLabelTitleSurvey")
    let footer_html = "";
    footer.empty();
    titleHeaderModal.empty();
    get_info_title_survey(value);
    footer_html =
        `
        <button type="button" class="btn btn-default" data-dismiss="modal">Đóng</button>
        <button type="button" id="btnSaveChangesEditTittle" class="btn btn-primary">Lưu dữ liệu</button>
        `;
    titleHeaderModal.text("Chỉnh sửa tiêu đề câu hỏi");
    footer.html(footer_html);
    $("#exampleModal").modal('show');
});
$(document).on("click", "#btnSaveChangesEditTittle", function (event) {
    event.preventDefault();
    update_tieu_de_pks(_value_title);
});
$(document).on("click", "#btnAddChilTitle", function (event) {
    event.preventDefault();
    const header = $("#exampleModalLabel");
    const body_footer = $("#modalfooterchildrentitle");
    header.empty();
    body_footer.empty();
    let html = ``;
    html += `
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" id="AddNewChildrenTitle" class="btn btn-primary">Lưu dữ liệu</button>
    `;
    header.text("Thêm mới chi tiết câu hỏi");
    body_footer.html(html);
    load_option_children_title();
});
$(document).on("click", "#AddNewChildrenTitle", function (event) {
    event.preventDefault();
    add_chilren_title();
})
$(document).on('input', '#edtThuTuChilTitle', function () {
    let value = $(this).val();
    value = value.replace(/\D/g, '');
    $(this).val(value);
});
$(document).on("click", "#btnEditChilTitle", function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    _value_children_tittle = value;
    const header = $("#exampleModalLabel");
    const body_footer = $("#modalfooterchildrentitle");
    header.empty();
    body_footer.empty();
    let html = ``;
    html += `
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" id="EditChildrenTitle" class="btn btn-primary">Lưu dữ liệu</button>
    `;
    header.text("Chỉnh sửa chi tiết câu hỏi");
    body_footer.html(html);
    load_option_info_children_title(value);
})
$(document).on("click", "#EditChildrenTitle", function (event) {
    event.preventDefault();
    edit_children_tiltle(_value_children_tittle);
})
$(document).on("click", "#btnDeleteChilTitle", function (event) {
    event.preventDefault();
    const value = $(this).data("id");
    Swal.fire({
        title: "Bạn muốn xóa tiêu đề con?",
        text: "Khi bạn xóa tiêu đề con, toàn bộ thông tin liên quan đến tiêu đề con này sẽ bị xóa!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, xóa luôn"
    }).then((result) => {
        if (result.isConfirmed) {
            delete_children_title(value);
        }
    });

})
$(document).on("click", "#btnXemTruocPhieuDaTao", function (event) {
    event.preventDefault();
    const value = $("#surveyid").val();
    if (value == "") {
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
            title: "Vui lòng chọn phiếu khảo sát để xem"
        });
    }
    else {
        window.open(`/xem-truoc-cau-hoi-da-tao/${value}`, '_blank');
    }
});
$(document).on("click", "#btnXuatBanPhieu", function (event) {
    event.preventDefault();
    const value = $("#surveyid").val();
    if (value == "") {
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
            title: "Vui lòng chọn phiếu khảo sát để xem"
        });
    }
    else {
        Swal.fire({
            title: "Bạn đang thao tác xuất bản phiếu?",
            text: "Bạn nên kiểm tra kỹ trước khi xuất bản phiếu vì nếu đã có dữ liệu khảo sát thì bạn không thể điều chỉnh câu hỏi, bạn chỉ được phép sửa lên tên tiêu đề nếu không sẽ xảy ra lỗi!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Tôi đồng ý xuất bản"
        }).then((result) => {
            if (result.isConfirmed) {
                save_final_survey()
            }
        });
    }
});
$(document).on("click", "#btnSortTitle", function (event) {
    event.preventDefault();
    sort();
});
// Xử  lý sự kiện thẻm mới điều kiện hiển thị
$(document).on("click", ".btn-dkk", async function () {
    const value_checkdkk = $(this).data("choice-id");
    _value_check_dkk = value_checkdkk;
    const json_dkk = $(this).data("json");
    json_value_check_dkk = json_dkk;
    await LoadDieuKienKhacDaChon();
    await LoadChiTietTieuDeBySurvey();
    $("#modalDieuKienKhac").modal("show");
});
$(document).on("click", ".btn-add-answer", async function () {
    const value_title_children = $(this).data("id");
    await ThemMoiDieuKienKhac(value_title_children);
    await LoadDieuKienKhacDaChon();
    await LoadChiTietTieuDeBySurvey();
    await load_tieu_de_pks();
});
$(document).on("click", ".btn-delete-answer", async function () {
    const value_chdk_check = $(this).data("id");
    const value_title_check = $(this).data("id-title-check");
    await XoaCauHoiDieuKienKhac(value_chdk_check, value_title_check);
    await LoadDieuKienKhacDaChon();
    await LoadChiTietTieuDeBySurvey();
    await load_tieu_de_pks();
});
//
// Hàm xử lý
async function delete_children_title(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/delete-children-title`,
        type: "POST",
        contentType: ' application/json',
        data: JSON.stringify({
            id_chi_tiet_cau_hoi_tieu_de: value
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
        load_tieu_de_pks();
    }
}
async function load_option_info_children_title(value) {
    const value_sv = $("#surveyid").val();
    const body = $("#loadoptionchiltitle");
    let html = ``;
    const res = await $.ajax({
        url: `${BASE_URL}/option-chi-tiet-cau-hoi`,
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value_sv
        }),
        xhrFields: {
            withCredentials: true
        }
    });

    if (res.success) {
        const response_data = await $.ajax({
            url: `${BASE_URL}/info-children-title`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                id_chi_tiet_cau_hoi_tieu_de: value
            }),
            xhrFields: {
                withCredentials: true
            }
        });

        if (response_data.success) {
            const item = response_data.data_chil;
            const get_rd = response_data.get_rd;

            html += `
                <div class="form-group">
                    <label class="form-label">Chọn tiêu đề câu hỏi chính</label>
                    <select class="form-control select2" id="edtSelectedTitle">`;
            res.tieu_de.forEach(title => {
                html += `<option value="${title.value_title}" ${title.value_title == item.id_tieu_de_phieu ? 'selected' : ''}>${title.name}</option>`;
            });

            html += `</select>
                </div>
                <div class="form-group">
                    <label for="formGroupExampleInput2">Tên chi tiết câu hỏi</label>
                    <input type="text" class="form-control" autocomplete="off" id="edtNameChilTitle" placeholder="Nhập tên chi tiết" value="${item.ten_cau_hoi}">
                </div>
                <div class="form-group">
                    <label class="form-label">Dạng câu hỏi</label>
                    <select class="form-control select2" id="edtSelectedDangCauHoi">`;
            res.dang_cau_hoi.forEach(dangcauhoi => {
                html += `<option value="${dangcauhoi.value_dch}" ${dangcauhoi.value_dch == item.id_dang_cau_hoi ? 'selected' : ''}>${dangcauhoi.name}</option>`;
            });

            html += `</select>
                </div>
                <div class="form-group">
                    <label for="formGroupExampleInput2">Các lựa chọn</label>
                    <div class="checkbox">
                        <input id="ckIsRequired" type="checkbox" ${item.bat_buoc ? 'checked' : ''}>
                        <label for="ckIsRequired">Là câu hỏi bắt buộc</label>
                    </div>
                    <div class="checkbox">
                        <input id="ckIsOrderItem" type="checkbox" ${item.is_ykienkhac ? 'checked' : ''}>
                        <label for="ckIsOrderItem">Có ý kiến khác</label>
                    </div>
                </div>
                <div id="conditionalBlock">`;

            if (item.id_dang_cau_hoi == 3 || item.id_dang_cau_hoi == 4 || item.id_dang_cau_hoi == 5) {
                html += `
                    <div class="form-group">
                        <label class="form-label">Nhập các tùy chọn (mỗi tùy chọn là 1 dòng)</label>
                        <textarea id="optionsTextarea" class="form-control" aria-label="With textarea" rows="10">`;
                get_rd.forEach(rd => {
                    html += `${rd.thu_tu}. ${rd.ten_rd_cau_hoi_khac}\n`;
                });
                html += `</textarea>
                    </div>`;
            }

            html += `</div>`;
            body.html(html);
            $("#chitietModal").modal("show");
            $(".select2").each(function () {
                if (!$(this).data('select2')) {
                    $(this).select2();
                }
            });
            $("#edtSelectedDangCauHoi").on("change", function () {
                const selectedValue = $(this).val();
                const conditionalBlock = $("#conditionalBlock");

                if (selectedValue == "3" || selectedValue == "4" || selectedValue == "5") {
                    let optionsHtml = `
                        <div class="form-group">
                            <label class="form-label">Nhập các tùy chọn (mỗi tùy chọn là 1 dòng)</label>
                            <textarea id="optionsTextarea" autocomplete="off" class="form-control" aria-label="With textarea" rows="10">`;
                    get_rd.forEach(rd => {
                        optionsHtml += `${rd.thu_tu}. ${rd.ten_rd_cau_hoi_khac}\n`;
                    });
                    optionsHtml += `</textarea>
                        </div>`;
                    conditionalBlock.html(optionsHtml);
                } else {
                    conditionalBlock.html("");
                }
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Không thể tải thông tin chi tiết câu hỏi!"
            });
        }
    } else {
        Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: res.message
        });
    }
}
async function update_tieu_de_pks(value) {
    const value_s = $("#surveyid").val();
    const tieude = $("#edttieudeTitle").val();
    const res = await $.ajax({
        url: `${BASE_URL}/update-title-survey`,
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify({
            id_tieu_de_phieu: value,
            surveyID: value_s,
            ten_tieu_de: tieude
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
        load_tieu_de_pks()
    }
}
async function delete_tieu_de_pks(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/delete-title-survey`,
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify({
            id_tieu_de_phieu: value
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
        load_tieu_de_pks()
    }
}
async function get_info_title_survey(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/get-info-title-survey`,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            id_tieu_de_phieu: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });

    $("#edttieudeTitle").val(res.ten_tieu_de);
    if (/^[A-Z]+$/i.test(res.thu_tu)) {
        $("#sortOption").val("alpha");
        $("#customOrderField").show();
        $("#customOrder").val(res.thu_tu);
    } else {
        $("#sortOption").val("roman");
        $("#customOrderField").hide();
        $("#customOrder").val("");
    }
}
async function load_option_children_title() {
    const value_sv = $("#surveyid").val();
    const body = $("#loadoptionchiltitle");
    let html = ``;
    const res = await $.ajax({
        url: `${BASE_URL}/option-chi-tiet-cau-hoi`,
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value_sv
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        html += `
            <div class="form-group">
                <label class="form-label">Chọn tiêu đề câu hỏi chính</label>
                <select class="form-control select2" id="edtSelectedTitle">`;
        res.tieu_de.forEach(title => {
            html += `<option value="${title.value_title}">${title.name}</option>`;
        });

        html += `</select>
            </div>
            <div class="form-group">
                <label for="formGroupExampleInput2">Tên chi tiết câu hỏi</label>
                <input type="text" autocomplete="off" class="form-control" id="edtNameChilTitle" placeholder="Nhập tên chi tiết">
            </div>
            <div class="form-group">
                <label class="form-label">Dạng câu hỏi</label>
                <select class="form-control select2" id="edtSelectedDangCauHoi">`;

        res.dang_cau_hoi.forEach(dangcauhoi => {
            html += `<option value="${dangcauhoi.value_dch}">${dangcauhoi.name}</option>`;
        });

        html += `</select>
            </div>
            <div class="form-group">
                <label for="formGroupExampleInput2">Các lựa chọn</label>
                <div class="checkbox">
                    <input id="ckIsRequired" type="checkbox">
                    <label for="ckIsRequired">Là câu hỏi bắt buộc</label>
                </div>
                <div class="checkbox">
                    <input id="ckIsOrderItem" type="checkbox">
                    <label for="ckIsOrderItem">Có ý kiến khác</label>
                </div>
            </div>
            <div id="conditionalBlock"></div>`;

        body.html(html);
        $("#chitietModal").modal("show");
        $(".select2").each(function () {
            if (!$(this).data('select2')) {
                $(this).select2();
            }
        });
        $("#edtSelectedDangCauHoi").on("change", function () {
            const selectedValue = $(this).val();
            const conditionalBlock = $("#conditionalBlock");

            if (selectedValue == "3" || selectedValue == "4" || selectedValue == "5") {
                conditionalBlock.html(`
                    <div class="form-group">
                        <label class="form-label">Nhập các tùy chọn (mỗi tùy chọn là 1 dòng)</label>
                        <textarea id="optionsTextarea" class="form-control" aria-label="With textarea" rows="10">1. </textarea>
                    </div>
                `);
            } else {
                conditionalBlock.html("");
            }
        });
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
            title: res.message
        });
    }
}
async function add_tittle() {
    const value = $("#surveyid").val();
    const tieude = $("#edttieudeTitle").val();
    const sortType = $("#sortOption").val();
    const thuTu = $("#customOrder").val();
    const res = await $.ajax({
        url: `${BASE_URL}/them-moi-tieu-de-pks`,
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value,
            ten_tieu_de: tieude,
            sortType: sortType,
            thu_tu: sortType === "alpha" ? thuTu : null
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
        load_tieu_de_pks()
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
async function load_tieu_de_pks() {
    const pks = $("#surveyid").val();
    const res = await $.ajax({
        url: `${BASE_URL}/load-bo-cau-hoi-phieu-khao-sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: pks
        }),
        xhrFields: {
            withCredentials: true
        }
    });

    let body = $('#tieu-de-pks');
    let html = '';

    if (res.success) {
        const title_is_public = $("#check-public");
        if (res.data.is_public === 1) {
            title_is_public.html('<i class="fas fa-check-circle"></i> Đã xuất bản');
            title_is_public.css("color", "green");
        } else {
            title_is_public.html('<i class="fas fa-times-circle"></i> Chưa xuất bản');
            title_is_public.css("color", "red");
        }
        
        res.data.pages.forEach(page => {
            html += `
                <div class="parent-title border mb-4 p-3 bg-white shadow-sm rounded">
                    <div class="d-flex justify-content-between align-items-center">
                        <h4 class="text-dark font-weight-bold mb-3">
                            <i class="bi bi-list-task"></i> ${page.title}
                        </h4>
                        <div class="parent-actions">
                            <button id="btnEditTitleSurvey" data-id="${page.value_title}" class="btn btn-sm btn-outline-primary me-2">
                                <i class="bi bi-pencil"></i> Sửa
                            </button>
                            <button  id="btnDeleteTitleSurvey" data-id="${page.value_title}" class="btn btn-sm btn-outline-danger">
                                <i class="bi bi-trash"></i> Xóa
                            </button>
                        </div>
                    </div>
                    <div class="child-titles mt-3">
            `;
            page.elements.forEach(element => {
                html += `
                    <div class="child-title mb-4">
                        <div class="element-header d-flex align-items-center justify-content-between p-2 bg-light border rounded">
                            <h5 class="element-title text-primary font-weight-bold mb-0">
                                <i class="bi bi-question-circle"></i> ${element.title}
                            </h5>
                            <div class="element-actions">
                                <button id="btnEditChilTitle" data-id="${element.value_chil}" class="btn btn-sm btn-outline-primary me-2">
                                    <i class="bi bi-pencil"></i> Chỉnh sửa
                                </button>
                                <button id="btnDeleteChilTitle" data-id="${element.value_chil}" class="btn btn-sm btn-outline-danger">
                                    <i class="bi bi-trash"></i> Xóa
                                </button>
                            </div>
                        </div>
                        <ul class="child-attributes list-unstyled mt-2 ps-3">
                            <li>
                                <strong>Dạng câu hỏi:</strong> ${element.type === "radiogroup" ? "Trắc nghiệm" :
                        element.type === "checkbox" ? "Hộp kiểm" :
                            element.type === "select" ? "Menu thả xuống" :
                                element.type === "text" ? "Đoạn trả lời ngắn" :
                                    "Đoạn trả lời dài"
                    }
                            </li>
                            <li>
                                <strong>Bắt buộc:</strong> ${element.isRequired ? "Có" : "Không"}
                            </li>
                        </ul>
                `;
                if (element.choices && element.choices.length > 0) {
                    html += `
                        <div class="choices mt-4">
                            <h6 class="text-primary mb-3">
                                <i class="bi bi-list-check me-2"></i>Danh sách lựa chọn
                            </h6>
                            <div class="list-group">`;
                    element.choices.forEach(choice => {
                        html += `
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span class="fw-semibold text-dark">
                                            <i class="bi bi-chevron-right text-success me-2"></i>${choice.text}
                                        </span>
                                    </div>
                                    <button class="btn btn-sm btn-outline-success btn-dkk"
                                            data-choice-id="${choice.value}"
                                            data-json="${choice.name}">
                                        <i class="bi bi-plus-circle me-1"></i>Thêm điều kiện
                                    </button>
                                </div>`;

                        if (choice.name_title && choice.name_title.length > 0) {
                            html += `
                                <div class="mt-2 ms-4">
                                    <small class="text-muted">Chuyển hướng đến:</small>
                                    <ul class="mb-0 ps-3 list-unstyled"">`;
                            choice.name_title.forEach(items => {
                                if (items.ten_cau_hoi.length > 0) {
                                    html += `<li class="text-secondary">${items.ten_cau_hoi}</li>`;
                                }
                            });
                            html += `
                                    </ul>
                                </div>`;
                        }
                        html += `</div>`;
                    });
                    html += `
                            </div>
                        </div>
                    `;
                }




                if (element.showOtherItem) {
                    html += `
                        <div class="other-option mt-2">
                            <strong>Ý kiến khác:</strong> Có
                        </div>
                    `;
                }

                html += `
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        body.html(html);
    } else {
        html = `
            <div class="alert alert-info text-center fw-bold">
                ${res.message}
            </div>`;
        body.html(html);
    }
}
async function save_final_survey() {
    const value = $("#surveyid").val();
    const res = await $.ajax({
        url: `${BASE_URL}/save-final-survey`,
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
async function add_chilren_title() {
    const value = $("#surveyid").val();
    const value_title = $("#edtSelectedTitle").val();
    const ten_cau_hoi = $("#edtNameChilTitle").val();
    const id_dang_cau_hoi = $("#edtSelectedDangCauHoi").val();
    const is_required = $("#ckIsRequired").prop('checked') ? 1 : 0;
    const is_orderitem = $("#ckIsOrderItem").prop('checked') ? 1 : 0;
    if (id_dang_cau_hoi == "3" || id_dang_cau_hoi == "4" || id_dang_cau_hoi == "5") {
        const inputText = $('#optionsTextarea').val();
        const options = inputText.split('\n')
            .map(option => option.trim())
            .filter(option => option !== '');

        const requestData = {
            surveyID: value,
            id_tieu_de_phieu: value_title,
            ten_cau_hoi: ten_cau_hoi,
            id_dang_cau_hoi: id_dang_cau_hoi,
            bat_buoc: is_required,
            is_ykienkhac: is_orderitem,
            ten_rd_cau_hoi_khac: options.join('\n')
        };
        const res = await $.ajax({
            url: `${BASE_URL}/save-children-title`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            xhrFields: {
                withCredentials: true
            }
        })
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
            load_tieu_de_pks()
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
    else {
        const requestData = {
            surveyID: value,
            id_tieu_de_phieu: value_title,
            ten_cau_hoi: ten_cau_hoi,
            id_dang_cau_hoi: id_dang_cau_hoi,
            bat_buoc: is_required,
            is_ykienkhac: is_orderitem,
            ten_rd_cau_hoi_khac: null
        };
        const res = await $.ajax({
            url: `${BASE_URL}/save-children-title`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
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
            load_tieu_de_pks()
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
}
async function edit_children_tiltle(value) {
    const value_title = $("#edtSelectedTitle").val();
    const ten_cau_hoi = $("#edtNameChilTitle").val();
    const id_dang_cau_hoi = $("#edtSelectedDangCauHoi").val();
    const is_required = $("#ckIsRequired").prop('checked') ? 1 : 0;
    const is_orderitem = $("#ckIsOrderItem").prop('checked') ? 1 : 0;
    if (id_dang_cau_hoi == "3" || id_dang_cau_hoi == "4" || id_dang_cau_hoi == "5") {
        const inputText = $('#optionsTextarea').val();
        const options = inputText.split('\n')
            .map(option => option.trim())
            .filter(option => option !== '');

        const requestData = {
            id_chi_tiet_cau_hoi_tieu_de: value,
            id_tieu_de_phieu: value_title,
            ten_cau_hoi: ten_cau_hoi,
            id_dang_cau_hoi: id_dang_cau_hoi,
            bat_buoc: is_required,
            is_ykienkhac: is_orderitem,
            ten_rd_cau_hoi_khac: options.join('\n')
        };
        const res = await $.ajax({
            url: `${BASE_URL}/edit-children-title`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
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
            load_tieu_de_pks()
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
    else {
        const requestData = {
            id_chi_tiet_cau_hoi_tieu_de: value,
            id_tieu_de_phieu: value_title,
            ten_cau_hoi: ten_cau_hoi,
            id_dang_cau_hoi: id_dang_cau_hoi,
            bat_buoc: is_required,
            is_ykienkhac: is_orderitem,
            ten_rd_cau_hoi_khac: null
        };
        const res = await $.ajax({
            url: `${BASE_URL}/edit-children-title`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
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
            load_tieu_de_pks()
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
}
async function sort() {
    const value = $("#surveyid").val();
    const res = await $.ajax({
        url: `${BASE_URL}/sort-title-survey`,
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
        load_tieu_de_pks();
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
// Hàm xử lý điều kiện khác của câu hỏi
async function LoadChiTietTieuDeBySurvey() {
    const survey = $("#surveyid").val();
    const res = await $.ajax({
        url: `${BASE_URL}/chi-tiet-tieu-de-cau-hoi-by-survey`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: survey,
            thu_tu_sap_xep: _value_check_dkk
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    const body = $("#data-table-answer");
    body.empty();
    let html = ``;
    html = `
        <h5 style="text-align:center;color:red;font-weight:bold;font-size:15px">Danh sách câu hỏi muốn chuyển hướng</h5>
        <table class="table table-bordered" id="table-answer-children">
            <thead>
                <tr>
                    <th>*</th>
                    <th>Câu hỏi số</th>
                    <th>Câu hỏi</th>
                    <th>Dạng câu hỏi</th>
                </tr>
            </thead>
            <tbody>
        `;

    res.forEach((items, index) => {
        html += `
                <tr>
                    <td>
                        <button class="btn btn-success btn-tone m-r-5 btn-add-answer" data-id="${items.id_chi_tiet_cau_hoi_tieu_de}">
                            Chọn
                        </button>
                    </td>
                    <td class="formatSo">${items.thu_tu}</td>
                    <td>${items.ten_cau_hoi}</td>
                    <td>${items.ten_dang_cau_hoi}</td>
                </tr>
            `;
    });

    html += `
            </tbody>
        </table>
        `;

    body.html(html);
    if ($.fn.DataTable.isDataTable('#table-answer-children')) {
        $('#table-answer-children').DataTable().clear().destroy();
    }
    $('#table-answer-children').DataTable({
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
async function ThemMoiDieuKienKhac(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/them-moi-dieu-kien-khac`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_chi_tiet_tieu_de_cau_hoi: value,
            id_rd_chk: _value_check_dkk,
            json_question: json_value_check_dkk
        })
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
    }
    else {
        Sweet_Alert("error", res.message);
    }
}
async function LoadDieuKienKhacDaChon() {
    const res = await $.ajax({
        url: `${BASE_URL}/danh-sach-cau-hoi-dieu-kien-khac-da-chon`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_rd_chk: _value_check_dkk
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    const body = $("#data-table-answer-selected");
    body.empty();
    let html = ``;
    html = `
        <h5 style="text-align:center;color:red;font-weight:bold;font-size:15px">Danh sách câu hỏi sẽ được chuyển hướng</h5>
        <table class="table table-bordered" id="table-answer-children-selected">
            <thead>
                <tr>
                    <th>*</th>
                    <th>STT</th>
                    <th>Câu hỏi</th>
                    <th>Dạng câu hỏi</th>
                </tr>
            </thead>
            <tbody>
        `;

    res.forEach((items, index) => {
        html += `
                <tr>
                    <td>
                        <button class="btn btn-danger btn-tone m-r-5 btn-delete-answer" data-id-title-check="${items.id_chi_tiet_tieu_de_cau_hoi}" data-id="${items.id_cau_hoi_dieu_kien_khac}">
                            Xóa
                        </button>
                    </td>
                    <td class="formatSo">${index + 1}</td>
                    <td>${items.ten_cau_hoi}</td>
                    <td>${items.ten_dang_cau_hoi}</td>
                </tr>
            `;
    });

    html += `
            </tbody>
        </table>
        `;

    body.html(html);
    if ($.fn.DataTable.isDataTable('#table-answer-children-selected')) {
        $('#table-answer-children-selected').DataTable().clear().destroy();
    }
    $('#table-answer-children-selected').DataTable({
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
async function XoaCauHoiDieuKienKhac(value, value_title) {
    const res = await $.ajax({
        url: `${BASE_URL}/xoa-cau-hoi-dieu-kien-khac`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_cau_hoi_dieu_kien_khac: value,
            id_chi_tiet_tieu_de_cau_hoi: value_title
        })
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
    }
    else {
        Sweet_Alert("error", res.message);
    }
}
//