$(document).ready(function () {
    load_phieu_khao_sat();
});
async function load_phieu_khao_sat() {
    var id = $("#id").val();
    var surveyid = $("#surveyid").val();
    const res = await $.ajax({
        url: `${BASE_URL}/load_dap_an_pks`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_answer: id,
            id_survey: surveyid
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        var items = res.data;
        let html = '';
        let body = $('#load-title');
        body.empty();
        if (items) {
            let get_info = JSON.parse(res.info)[0];
            surveyData = JSON.parse(items.phieu_khao_sat);
            Dap_an = JSON.parse(items.dap_an);
            html += `
                <h2>${surveyData.title}</h2>
                <p>${surveyData.description}</p>
                <hr />`;
            if (res.is_cbvc) {
                html += `<p><b>Mã viên chức</b> : ${get_info.MaCBVC}</p>`;
                html += `<p><b>Tên viên chức</b> : ${get_info.TenCBVC}</p>`;
                html += `<p><b>Trình độ</b> : ${get_info.ten_trinh_do}</p>`;
                html += `<p><b>Chức vụ</b> : ${get_info.name_chucvu}</p>`;
                html += `<p><b>Thuộc đơn vị</b> : ${get_info.ten_khoa}</p>`;
                html += `<p><b>Ngành đào tạo</b> : ${get_info.nganh_dao_tao}</p>`;
                html += `<p><b>Khảo sát lần cuối</b> : ${unixTimestampToDate(get_info.khao_sat_lan_cuoi)}</p>`;
            }
            else if (res.is_gv) {
                html += `<p><b>Mã viên chức</b> : ${get_info.MaCBVC}</p>`;
                html += `<p><b>Tên viên chức</b> : ${get_info.TenCBVC}</p>`;
                html += `<p><b>Trình độ</b> : ${get_info.ten_trinh_do}</p>`;
                html += `<p><b>Chức vụ</b> : ${get_info.name_chucvu}</p>`;
                html += `<p><b>Thuộc đơn vị</b> : ${get_info.ten_khoa}</p>`;
                html += `<p><b>Ngành đào tạo</b> : ${get_info.nganh_dao_tao}</p>`;
                html += `<p><b>Khảo sát cho chương trình đào tạo</b> : ${get_info.khao_sat_cho}</p>`;
                html += `<p><b>Khảo sát lần cuối</b> : ${unixTimestampToDate(get_info.khao_sat_lan_cuoi)}</p>`;
            }
            else if (res.is_nh) {
                html += `<p><b>Mã người học</b> : ${get_info.ma_nh}</p>`;
                html += `<p><b>Tên người học</b> : ${get_info.ten_nh}</p>`;
                html += `<p><b>Thuộc lớp</b> : ${get_info.thuoc_lop}</p>`;
                html += `<p><b>Thuộc chương trình đào tạo</b> : ${get_info.thuoc_ctdt}</p>`;
                html += `<p><b>Thuộc đơn vị: </b> ${get_info.thuoc_don_vi}</p>`;
                if (get_info.mo_ta !== "") {
                    html += `<p><b>Người học năm: </b> ${get_info.mo_ta}</p>`;
                }
                html += `<p><b>Khảo sát lần cuối</b> : ${unixTimestampToDate(get_info.khao_sat_lan_cuoi)}</p>`;
            }
            else if (res.is_hoc_phan_nguoi_hoc) {
                html += `<p><b>Mã người học</b> : ${get_info.ma_nh}</p>`;
                html += `<p><b>Tên người học</b> : ${get_info.ten_nh}</p>`;
                html += `<p><b>Học phần</b> : ${get_info.hoc_phan}</p>`;
                html += `<p><b>Mã môn học</b> : ${get_info.ma_mh}</p>`;
                html += `<p><b>Tên môn học</b> : ${get_info.mon_hoc}</p>`;
                html += `<p><b>Lớp</b> : ${get_info.lop}</p>`;
                html += `<p><b>Giảng viên giảng dạy</b> : ${get_info.giang_vien_giang_day}</p>`;
                html += `<p><b>Khảo sát lần cuối</b> : ${unixTimestampToDate(get_info.khao_sat_lan_cuoi)}</p>`;
            }
            else if (res.is_dn) {
                html += `<p><b>Email khảo sát</b> : ${get_info.email}</p>`;
                html += `<p><b>Khảo sát cho chương trình đào tạo</b> : ${get_info.khao_sat_cho}</p>`;
            }
            html += `<form>
            `;

            surveyData.pages.forEach(function (page) {
                html += `<h4>${page.title}</h4>`;
                html += page.description === undefined ? `<p></p><hr />` : `<p>${page.description}</p> <hr />`;
                page.elements.forEach(function (element) {
                    let dapan = Dap_an.pages[0].elements.find(x => x.name === element.name);
                    let value = dapan ? dapan.response.text : '';
                    let visible = true;
                    if (element.visibleIf) {
                        visible = false;
                    }
                    let css_required = element.isRequired ? 'red' : 'black';
                    switch (element.type) {
                        case 'text':
                            html += `
                            <div class="form-group" id="group-${element.name}" style="display: ${visible ? 'block' : 'none'};">
                                <label for="${element.name}">${element.title} <span style="color : ${css_required};">*</span> </label>
                                <input type="text" class="form-control input-bottom-border" id="${element.name}" name="${element.name}" autocomplete="off" value="${escapeHtml(value)}" placeholder="Vui lòng điền ${element.title} tại đây!">
                                <p style="color: red;font-style: italic;text-align: right;display :none" class="error_${element.name}"></p>
                            </div>
                        `;
                            break;
                        case 'radiogroup':
                            var isHorizontal = element.choices.length >= 5;
                            var layoutClass = isHorizontal ? 'horizontal-group d-flex justify-content-between' : '';
                            html += `
                                <div class="form-group" id="group-${element.name}" style="display: ${visible ? 'block' : 'none'};">
                                    <label for="${element.name}">${element.title} <span style="color : ${css_required};">*</span></label>
                                    <div class="${layoutClass}">
                                `;

                            let isMatched = false;

                            element.choices.forEach(function (choice) {
                                var choiceClass = isHorizontal ? 'form-check form-check-inline p-2' : 'form-check p-3';
                                let checked = '';
                                if (dapan && dapan.response.name === choice.name) {
                                    checked = 'checked';
                                    isMatched = true;
                                }
                                html += `
                                    <div class="${choiceClass}">
                                        <input class="form-check-input" type="radio" id="${choice.name}" name="${element.name}" value="${escapeHtml(choice.name)}" ${checked}>
                                        <p class="form-check-label" for="${choice.name}">${choice.text}</p>
                                    </div>
                                    `;
                            });
                            if (element.showOtherItem) {
                                const checkedOther = !isMatched ? 'checked' : '';
                                const otherValue = dapan && !isMatched ? dapan.response.text : '';
                                html += `
                                <div class="${isHorizontal ? 'form-check form-check-inline p-2' : 'form-check p-3'}">
                                        <input class="form-check-input" type="radio" id="${element.name}_other" name="${element.name}" value="other" ${checkedOther}>
                                        <p class="form-check-label" for="${element.name}_other">Ý kiến khác</p>
                                    </div>
                                    <div id="${element.name}_other_container" style="display: ${checkedOther ? 'block' : 'none'};">
                                        <input type="text" class="form-control mt-2" id="${element.name}_otherText" name="${element.name}_otherText" placeholder="Vui lòng chỉ rõ" value="${escapeHtml(otherValue)}">
                                    </div>`;
                            }

                            html += `
                        </div>
                        <p style="color: red;font-style: italic;text-align: right;display :none" class="error_${element.name}"></p>
                    </div>
                         `;
                            break;

                        case 'checkbox':
                            html += `
                            <div class="form-group" id="group-${element.name}" style="display: ${visible ? 'block' : 'none'};">
                                <label for="checkboxes">${element.title} <span style="color : ${css_required};">*</span></label>
                        `;
                            let otherChecked = false;
                            let otherTextValue = '';

                            if (dapan && dapan.response.name.includes("other")) {
                                const otherIndex = dapan.response.name.indexOf("other");
                                otherTextValue = dapan.response.text[otherIndex] || '';
                                otherChecked = true;
                            }
                            element.choices.forEach(function (choice) {
                                let checked = dapan && dapan.response.name.includes(choice.name) ? 'checked' : '';
                                html += `
                                        <div class="checkbox-group">
                                            <input type="checkbox" id="${choice.name}" name="${element.name}" value="${choice.name}" ${checked}>
                                            <p>${choice.text}</p>
                                        </div>
                                        `;
                            });

                            if (element.showOtherItem) {
                                html += `
                                        <div class="checkbox-group">
                                            <input type="checkbox" id="${element.name}_other" name="${element.name}" value="other" ${otherChecked ? 'checked' : ''}>
                                            <p>Ý kiến khác</p>
                                        </div>
                                        <div id="${element.name}_other_container" style="display: ${otherChecked ? 'block' : 'none'};">
                                            <input type="text" class="form-control mt-2" id="${element.name}_otherText" name="${element.name}_otherText" placeholder="Vui lòng chỉ rõ" value="${escapeHtml(otherTextValue)}">
                                        </div>

                                        `;
                            }

                            html += `
                                <p style="color: red;font-style: italic;text-align: right;display :none" class="error_${element.name}"></p>
                            </div>
                        `;
                            break;
                        case 'comment':
                            html += `
                                <div class="form-group" id="group-${element.name}" style="display: ${visible ? 'block' : 'none'};">
                                    <label for="suggestions">${element.title}</label>
                                    <textarea class="form-control input-bottom-border" id="${element.name}" autocomplete="off" name="${element.name}" rows="4" placeholder="Vui lòng điền ${element.title} tại đây!">${escapeHtml(value)}</textarea>
                                    <p style="color: red;font-style: italic;text-align: right;display :none" class="error_${element.name}"></p>
                                </div>
                            `;
                            break;
                        case 'select':
                            html += `
                                <div class="form-group" id="group-${element.name}" style="display: ${visible ? 'block' : 'none'};">
                                    <label for="industry">${element.title}</label>
                                    <select class="form-control input-bottom-border select2" id="industry" name="${element.name}">
                            `;
                            element.choices.forEach(function (choice) {
                                let selected = dapan && dapan.response.text.includes(choice.text) ? 'selected' : '';
                                html += `
                                    <option value="${choice.name}" ${selected}>${choice.text}</option>
                                `;
                            });
                            html += `
                                    </select>
                                    <p style="color: red;font-style: italic;text-align: right;display :none" class="error_${element.name}"></p>
                                </div>
                            `;
                            break;
                        default:
                            break;
                    }
                });
            });
            html += `
            <hr />
               <p class="d-flex justify-content-end"><a href="javascript:void(0)" class="btn btn-primary" id="save">Cập nhật dữ liệu</a></p>
                <p style="text-align: right;font-style: italic;">Một lần nữa, xin chân thành cảm ơn những ý kiến đóng góp của Anh (Chị)!</p>
                </form>
            `;
            body.append(html);
            check_dieu_kien();
            $(document).on('change', 'input[type=radio], input[type=checkbox]', function () {
                const input = $(this);
                const name = input.attr('name');
                const value = input.val();
                const isCheckbox = input.attr('type') === 'checkbox';
                const otherContainer = $(`#${name}_other_container`);
                const otherInput = $(`#${name}_otherText`);

                if (isCheckbox) {
                    if (value === 'other') {
                        if (input.is(':checked')) {
                            otherContainer.show();
                        } else {
                            otherContainer.hide();
                        }
                    }
                } else {
                    if ($(`input[name="${name}"]:checked`).val() === 'other') {
                        otherContainer.show();
                    } else {
                        otherContainer.hide();
                    }
                }
            });

            $(document).on('click', '#save', function () {
                save_answer_form();
            });
        }
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