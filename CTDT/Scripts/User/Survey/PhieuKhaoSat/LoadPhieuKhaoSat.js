$('.select2').select2();
$(document).ready(function () {
    $('.select2').select2();
    load_phieu_khao_sat();

    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('#scrollToTopBtn').fadeIn();
        } else {
            $('#scrollToTopBtn').fadeOut();
        }
    });

    $('#scrollToTopBtn').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 800);
        return false;
    });
});
async function load_phieu_khao_sat() {
    const value = $("#id").val();
    const res = await $.ajax({
        url: `${BASE_URL}/load_form_phieu_khao_sat`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value,
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    if (res.success) {
        let html = '';
        let body = $('#load-title');
        body.empty();
        if (res.data) {
            let get_info = JSON.parse(res.info);
            surveyData = JSON.parse(res.data);
            TenPhieu = surveyData.title;
            if (res.is_cbvc) {
                get_tempData = TenPhieu + "_" + get_info.MaCBVC + "_" + get_info.TenCBVC;
            }
            else if (res.is_gv) {
                get_tempData = TenPhieu + "_" + get_info.MaCBVC + "_" + get_info.TenCBVC;
            }
            else if (res.is_nh) {
                get_tempData = TenPhieu + "_" + get_info.ma_nh + "_" + get_info.ten_nh;
            }
            else if (res.is_nh_co_hp) {
                get_tempData = TenPhieu + "_" + get_info.ma_nh + "_" + get_info.ten_nh + "_" + get_info.mon_hoc + "_" + get_info.giang_vien_giang_day;
            }
            else if (res.is_dn) {
                get_tempData = TenPhieu + "_" + get_info.email + "_" + get_info.khao_sat_cho;
            }
            let tempData = localStorage.getItem(get_tempData);
            tempData = tempData ? JSON.parse(tempData) : {};
            html += `
                <h2>${surveyData.title}</h2>
                <p>${surveyData.description}</p>
                <hr />
                <h4>THÔNG TIN CHUNG</h4>`;
            if (res.is_cbvc) {
                html += `<p><b>Mã viên chức</b> : ${get_info.MaCBVC}</p>`;
                html += `<p><b>Tên viên chức</b> : ${get_info.TenCBVC}</p>`;
                html += `<p><b>Trình độ</b> : ${get_info.ten_trinh_do}</p>`;
                html += `<p><b>Chức vụ</b> : ${get_info.name_chucvu}</p>`;
                html += `<p><b>Thuộc đơn vị</b> : ${get_info.ten_khoa}</p>`;
                html += `<p><b>Ngành đào tạo</b> : ${get_info.nganh_dao_tao}</p>`;
            }
            else if (res.is_gv) {
                html += `<p><b>Mã viên chức</b> : ${get_info.MaCBVC}</p>`;
                html += `<p><b>Tên viên chức</b> : ${get_info.TenCBVC}</p>`;
                html += `<p><b>Trình độ</b> : ${get_info.ten_trinh_do}</p>`;
                html += `<p><b>Chức vụ</b> : ${get_info.name_chucvu}</p>`;
                html += `<p><b>Thuộc đơn vị</b> : ${get_info.ten_khoa}</p>`;
                html += `<p><b>Ngành đào tạo</b> : ${get_info.nganh_dao_tao}</p>`;
                html += `<p><b>Khảo sát cho chương trình đào tạo</b> : ${get_info.khao_sat_cho}</p>`;
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
            }
            else if (res.is_nh_co_hp) {
                html += `<p><b>Mã người học</b> : ${get_info.ma_nh}</p>`;
                html += `<p><b>Tên người học</b> : ${get_info.ten_nh}</p>`;
                html += `<p><b>Học phần</b> : ${get_info.hoc_phan}</p>`;
                html += `<p><b>Mã môn học</b> : ${get_info.ma_mh}</p>`;
                html += `<p><b>Tên môn học</b> : ${get_info.mon_hoc}</p>`;
                html += `<p><b>Lớp</b> : ${get_info.lop}</p>`;
                html += `<p><b>Giảng viên giảng dạy</b> : ${get_info.giang_vien_giang_day}</p>`;
            }
            else if (res.is_dn) {
                html += `<p><b>Email khảo sát</b> : ${get_info.email}</p>`;
                html += `<p><b>Khảo sát cho chương trình đào tạo</b> : ${get_info.khao_sat_cho}</p>`;
            }
            html += `<hr />
                <form>
            `;

            surveyData.pages.forEach(function (page) {
                html += `<h4>${page.title}</h4>`;
                html += page.description === undefined ? `<p></p><hr />` : `<p>${page.description}</p> <hr />`;

                page.elements.forEach(function (element) {
                    let luutru = tempData[element.name];
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
                                    <input type="text" class="form-control input-bottom-border" id="${element.name}" name="${element.name}" autocomplete="off" placeholder="Vui lòng điền ${element.title} tại đây!" value="${luutru || ''}">
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
                            element.choices.forEach(function (choice) {
                                var choiceClass = isHorizontal ? 'form-check form-check-inline p-2' : 'form-check p-3';
                                let checked = (luutru === choice.name) ? 'checked' : '';
                                html += `
                                    <div class="${choiceClass}">
                                        <input class="form-check-input" type="radio" id="${choice.name}" name="${element.name}" value="${choice.name}" ${checked}>
                                        <p class="form-check-label" for="${choice.name}">${choice.text}</p>
                                    </div>
                                    `;
                            });

                            if (element.showOtherItem) {
                                let isOtherText = luutru && !element.choices.some(c => c.name === luutru);
                                let otherValue = isOtherText ? luutru : '';
                                let otherChecked = isOtherText ? 'checked' : '';

                                html += `
                                    <div class="${isHorizontal ? 'form-check-inline p-2' : 'form-check p-3'}">
                                        <input class="form-check-input" type="radio" id="${element.name}_other" name="${element.name}" value="other" ${otherChecked}>
                                        <label class="form-check-label" for="${element.name}_other">${element.otherText}</label>
                                    </div>
                                    <div id="${element.name}_other_container" style="display: ${isOtherText ? 'block' : 'none'};">
                                        <input type="text" class="form-control mt-2" id="${element.name}_otherText" placeholder="Vui lòng chỉ rõ" value="${luutru || ''}">
                                    </div>
                                `;
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
                            element.choices.forEach(function (choice) {
                                let checked = (Array.isArray(luutru) && luutru.includes(choice.name)) ? 'checked' : '';
                                html += `
                                    <div class="form-check p-3">
                                        <input class="form-check-input" type="checkbox" id="${choice.name}" name="${element.name}" value="${choice.name}" ${checked}>
                                        <p class="form-check-label" for="${choice.name}">${choice.text}</p>
                                    </div>
                                `;
                            });
                            if (element.showOtherItem) {
                                let isOtherText = luutru && !element.choices.some(c => c.name === luutru);
                                let otherValue = isOtherText ? luutru : '';
                                let otherChecked = isOtherText ? 'checked' : '';

                                html += `
                                    <div class="${isHorizontal ? 'form-check-inline p-2' : 'form-check p-3'}">
                                        <input class="form-check-input" type="checkbox" id="${element.name}_other" name="${element.name}" value="other" ${otherChecked}>
                                        <label class="form-check-label" for="${element.name}_other">${element.otherText}</label>
                                    </div>
                                    <div id="${element.name}_other_container" style="display: ${isOtherText ? 'block' : 'none'};">
                                        <input type="text" class="form-control mt-2" id="${element.name}_otherText" placeholder="Vui lòng chỉ rõ" value="${luutru || ''}">
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
                                    <label for="${element.name}">${element.title} <span style="color : ${css_required};">*</span> </label>
                                    <textarea class="form-control input-bottom-border" autocomplete="off" id="${element.name}" name="${element.name}" rows="4" placeholder="Điền ý kiến khác tại đây!">${luutru || ''}</textarea>
                                    <p style="color: red;font-style: italic;text-align: right;display :none" class="error_${element.name}"></p>
                                </div>
                            `;
                            break;
                        case 'select':
                            html += `
                                <div class="form-group" id="group-${element.name}" style="display: ${visible ? 'block' : 'none'};">
                                    <label for="${element.name}">${element.title} <span style="color : ${css_required};">*</span> </label>
                                    <select class="form-control input-bottom-border select2" id="industry" name="${element.name}">
                            `;
                            element.choices.forEach(function (choice) {
                                let selected = (luutru === choice.name) ? 'selected' : '';
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
               <p class="d-flex justify-content-end"><a href="javascript:void(0)" class="btn btn-primary" id="save">Lưu dữ liệu</a></p>
                <p style="text-align: right;font-style: italic;">Một lần nữa, xin chân thành cảm ơn những ý kiến đóng góp của Anh (Chị)!</p>
                </form>
            `;

            body.html(html);

            check_dieu_kien();
            $(document).on('change', 'input[type=radio], input[type=checkbox]', function () {
                const name = $(this).attr('name');
                const value = $(this).val();
                const isCheckbox = $(this).attr('type') === 'checkbox';
                const otherContainer = $(`#${name}_other_container`);
                const otherInput = $(`#${name}_otherText`);

                if (isCheckbox && value === 'other') {
                    if ($(this).is(':checked')) {
                        otherContainer.show();
                    } else {
                        otherContainer.hide();
                        otherInput.val('');
                    }
                }

                if (!isCheckbox && value === 'other') {
                    otherContainer.show();
                } else if (!isCheckbox) {
                    otherContainer.hide();
                    otherInput.val('');
                }
            });


            $(document).on('input change', 'input, select, textarea', function () {
                let formData = {};

                $('input, select, textarea').each(function () {
                    let name = $(this).attr('name');

                    if ($(this).is(':checkbox')) {
                        if (!formData[name]) {
                            formData[name] = [];
                        }

                        if ($(this).is(':checked')) {
                            if ($(this).val() === 'other') {
                                const otherText = escapeHtml($(`#${name}_otherText`).val()?.trim());
                                if (otherText) {
                                    formData[name].push(otherText);
                                }
                            } else {
                                formData[name].push(escapeHtml($(this).val()));
                            }
                        }
                    }

                    else if ($(this).is(':radio')) {
                        if ($(this).is(':checked')) {
                            if ($(this).val() === 'other') {
                                let otherTextVal = escapeHtml($(`#${name}_otherText`).val()?.trim() || '');
                                formData[name] = otherTextVal;
                            } else {
                                formData[name] = escapeHtml($(this).val());
                            }
                        }
                    }

                    else {
                        formData[name] = escapeHtml($(this).val());
                    }
                });

                localStorage.setItem(get_tempData, JSON.stringify(formData));
            });
            $('input[name$="_otherText"]').each(function () {
                const otherName = $(this).attr('name').replace('_otherText', '');
                const radioOtherChecked = escapeHtml($(`input[name="${otherName}"]:checked`).val() === 'other');
                if (radioOtherChecked) {
                    formData[otherName] = escapeHtml($(this).val());
                }
            });
            $(document).on('click', '#save', function () {
                save_form();
                localStorage.removeItem(get_tempData);
                localStorage.removeItem("xacthucstorage");
            });
        }
        else {
            surveyData = null;
        }
    }
}
async function save_form() {
    var id = $('#id').val();
    var form = save_phieu_khao_sat();
    if (form.valid) {
        const res = await $.ajax({
            url: `${BASE_URL}/save_form_khao_sat`,
            type: 'POST',
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                idsurvey: id,
                json_answer: JSON.stringify(form.data)
            }),
            xhrFields: {
                withCredentials: true
            }
        });
        if (res.success) {
            Swal.fire({
                title: res.message,
                icon: "success",
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                goBack();
            });
        }
        else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: res.message
            });
        }
    }
    else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Vui lòng điền đầy đủ thông tin bắt buộc"
        });
    }
}