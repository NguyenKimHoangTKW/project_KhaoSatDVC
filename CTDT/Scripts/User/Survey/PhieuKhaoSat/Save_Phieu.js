function goBack() {
    window.history.back();
}
function check_dieu_kien() {
    $('input[type=radio]').change(function () {
        update_visibility();
    });
    update_visibility();
}
function update_visibility() {
    let selectedValues = {};
    $('input[type=radio]:checked').each(function () {
        selectedValues[$(this).attr('name')] = $(this).val();
    });
    surveyData.pages.forEach(function (page) {
        page.elements.forEach(function (element) {
            if (element.visibleIf) {
                let shouldShow = element.visibleIf.some(function (condition) {
                    return Object.values(selectedValues).includes(condition);
                });
                $(`#group-${element.name}`).toggle(shouldShow);
            }
        });
    });
};
function save_phieu_khao_sat() {
    var formData = { pages: [] };
    var hasError = false;
    var validation = true;

    $('form').each(function () {
        var page = { elements: [] };

        $(this).find('input, textarea, select').each(function () {
            var input = $(this);
            if (!input.closest('.form-group').is(':visible')) return;

            var type = input.attr('type');
            var name = input.attr('name');
            if (!name || name.endsWith('_otherText')) return;

            var value = escapeHtml(input.val());
            var text = '';
            var questionType = (type === 'radio') ? 'radiogroup' :
                (type === 'checkbox') ? 'checkbox' :
                    (input.prop('nodeName').toLowerCase() === 'select') ? 'dropdown' :
                        (input.prop('nodeName').toLowerCase() === 'textarea') ? 'comment' :
                            type || input.prop('nodeName').toLowerCase();

            var elementData = {
                type: questionType,
                name: name,
                title: escapeHtml(input.closest('.form-group').find('label').text().trim()),
                response: {}
            };

            if (type === 'checkbox') {
                var existingElement = page.elements.find(e => e.name === name);
                if (!existingElement) {
                    elementData.response = { name: [], text: [] };
                    page.elements.push(elementData);
                    existingElement = elementData;
                }

                if (input.is(':checked')) {
                    if (value === 'other') {
                        const otherTextVal = escapeHtml($(`#${name}_otherText`).val()?.trim());
                        if (otherTextVal) {
                            existingElement.response.name.push("other");
                            existingElement.response.text.push(otherTextVal);
                        }
                    } else {
                        const label = escapeHtml(input.closest('.form-check').find('label, p').text().trim());
                        existingElement.response.name.push(value);
                        existingElement.response.text.push(label);
                    }
                }
            }
            else if (type === 'radio') {
                if (input.is(':checked')) {
                    let otherTextValue = "";
                    if (value === "other") {
                        otherTextValue = escapeHtml($(`#${name}_otherText`).val()?.trim() || '');
                    }
                    text = (value === 'other') ? otherTextValue : escapeHtml(input.closest('.form-check').find('.form-check-label').text().trim());

                    elementData.response = {
                        name: value,
                        text: text,
                        other: (value === 'other') ? otherTextValue : ""
                    };
                    page.elements.push(elementData);
                }

            } else if (questionType === 'dropdown') {
                text = escapeHtml(input.find('option:selected').text().trim());
                elementData.response = {
                    name: value,
                    text: text,
                    other: ""
                };
                page.elements.push(elementData);
            } else if (questionType === 'comment' || questionType === 'text') {
                elementData.response.text = value;
                page.elements.push(elementData);
            }
        });

        $('input[type=radio]').each(function () {
            if (!$(this).closest('.form-group').is(':visible')) return;
            var name = $(this).attr('name');
            if ($(`input[name="${name}"]:checked`).length === 0 &&
                surveyData.pages.some(page => page.elements.some(element => element.name === name && element.isRequired))) {
                $(`.error_${name}`).text('Vui lòng chọn đáp án.').show();
                hasError = true;
                validation = false;
            } else {
                $(`.error_${name}`).hide();
            }
        });

        $('input[type=checkbox]').each(function () {
            if (!$(this).closest('.form-group').is(':visible')) return;
            var name = $(this).attr('name');
            if ($(`input[name="${name}"]:checked`).length === 0 &&
                surveyData.pages.some(page => page.elements.some(element => element.name === name && element.isRequired))) {
                $(`.error_${name}`).text('Vui lòng chọn đáp án.').show();
                hasError = true;
                validation = false;
            } else {
                $(`.error_${name}`).hide();
            }
        });

        $('input[type=text], textarea').each(function () {
            if (!$(this).closest('.form-group').is(':visible')) return;
            var name = $(this).attr('name');
            var value = $(this).val().trim();
            if (value === '' &&
                surveyData.pages.some(page => page.elements.some(element => element.name === name && element.isRequired))) {
                $(`.error_${name}`).text('Vui lòng nhập thông tin.').show();
                hasError = true;
                validation = false;
            } else {
                $(`.error_${name}`).hide();
            }
        });

        $('select').each(function () {
            if (!$(this).closest('.form-group').is(':visible')) return;
            var name = $(this).attr('name');
            var value = $(this).val();
            if ((value === '' || value === null) &&
                surveyData.pages.some(page => page.elements.some(element => element.name === name && element.isRequired))) {
                $(`.error_${name}`).text('Vui lòng chọn một mục.').show();
                hasError = true;
                validation = false;
            } else {
                $(`.error_${name}`).hide();
            }
        });

        formData.pages.push(page);
    });

    return { valid: validation, data: formData };
}
function save_answer_form() {
    var id = $('#id').val();
    var form = save_phieu_khao_sat();
    if (form.valid) {
        $.ajax({
            url: `${BASE_URL}/save_answer_form`,
            type: 'POST',
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                id: id,
                json_answer: JSON.stringify(form.data)
            }),
            xhrFields: {
                withCredentials: true
            },
            success: function (res) {
                Swal.fire({
                    title: "Cập nhật dữ liệu thành công",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    goBack();
                });
            },
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Vui lòng điền đầy đủ thông tin bắt buộc"
        });
    }
}