var ma_user = $('#ma_user').text();
let selectedProgramId = null;
let selectedKhoaId = [];
let selectedDonViId = [];
let selectedDonViChuyenMonId = [];
let selectedCtdtIds = [];
let selectedPhanQuyenChucNang = [];
$(document).ready(function () {
    load_quyen_user().then(() => {
        load_phan_quyen();
    });
    $("#quyen-user").change(function () {
        selectedProgramId = parseInt($(this).val());
        load_phan_quyen();
    });
    $("#gobackhome").click(function () {
        window.location.href = "/admin/danh-sach-users";
    });
});
$(document).on("click", "#quyen-user", async function (event) {
    event.preventDefault();
    selectedPhanQuyenChucNang = [];
});
function Toast_alert(type, message) {
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });
    Toast.fire({
        icon: type,
        title: message
    });
}
function hideLoading() {
    Swal.close();
}
async function load_phan_quyen() {
    const res = await $.ajax({
        url: `${BASE_URL}/load_chuc_nang_phan_quyen`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        }
    });
    if ($.fn.DataTable.isDataTable('#cbvcTable')) {
        $('#cbvcTable').DataTable().clear().destroy();
    }
    let body_table = $("#cbvcTable");
    let selected_quyen = $("#quyen-user");
    let quyen_chuc_nang = $("#quyen_chuc_nang_selected");

    body_table.empty();
    selected_quyen.empty();
    quyen_chuc_nang.empty();
    let optionHtml = '';
    let selectedItem = null;
    res.data.forEach(function (items) {
        const isSelected = selectedProgramId === items.id_type ? 'selected' : '';
        optionHtml += `<option value="${items.id_type}" ${isSelected}>${items.ten_quyen}</option>`;

        if (selectedProgramId === items.id_type) {
            selectedItem = items;
        }
    });
    selected_quyen.html(optionHtml);
    if (selectedItem) {
        form_chuc_nang(selectedItem, quyen_chuc_nang, body_table);
    }
}
function form_chuc_nang(items, body, body_table) {
    let html = '';
    let html_table = '';
    if (items.is_admin || items.is_ctdt || items.is_don_vi) {
        if (items.chuc_nang) {
            html += render_chuc_nang_section(items.chuc_nang);
        }
    }
    if (items.is_ctdt) {
        html_table += render_ctdt_table(items.ctdt);
    }

    if (items.is_don_vi) {
        html_table += render_don_vi_table(items.don_vi);
    }
    if (items.is_don_vi_chuyen_mon) {
        html_table += render_don_vi_chuyen_mon_table(items.don_vi);
    }
    body_table.append(html_table);
    body.append(html);
}
function render_chuc_nang_section(chucNangList) {
    let html = '<h2 class="mb-3">Quyền chức năng users</h2>';
    chucNangList.forEach(function (chucnang) {
        const isChecked = selectedPhanQuyenChucNang.includes(chucnang.id_chuc_nang) ? 'checked' : '';
        const id = `phan_quyen_${chucnang.id_chuc_nang}`;

        html += `
            <div class="form-check mb-2">
                <input 
                    type="checkbox" 
                    class="form-check-input file_checkbox" 
                    id="${id}" 
                    onchange="handlePhanQuyenChucNangSelecttion(${chucnang.id_chuc_nang})" 
                    ${isChecked}>
                <label class="form-check-label" for="${id}">${chucnang.ten_chuc_nang}</label>
            </div>
        `;
    });
    return html;
}
function render_ctdt_table(ctdtList) {
    $("#titleTable").text("Danh sách phân quyền theo Ngành");
    let html = `
        <thead>
            <tr>
                <th>STT</th>
                <th>Tên CTĐT</th>
                <th>Chọn</th>
            </tr>
        </thead>
        <tbody>
    `;
    ctdtList.forEach(function (ctdt, index) {
        let isChecked = selectedCtdtIds.includes(ctdt.ma_ctdt) ? 'checked' : '';
        html += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${ctdt.ten_ctdt}</td>
                <td class="text-center">
                    <input type="checkbox" name="ctdtSelection" class="form-check-input ctdt_checkbox"
                           id="ctdt_${ctdt.ma_ctdt}" ${isChecked}
                           onchange="handleCtdtSelection('${ctdt.ma_ctdt}')">
                </td>
            </tr>
        `;
    });
    html += `</tbody>`;

    $('#cbvcTable').html(html);
    initializeDataTable('Danh sách CTĐT');

}
function render_don_vi_table(DonviList) {
    $("#titleTable").text("Danh sách phân quyền theo Đơn vị");
    let html = `
        <thead>
            <tr>
                <th>STT</th>
                <th>Tên Đơn vị</th>
                <th>Năm</th>
                <th>Chọn</th>
            </tr>
        </thead>
        <tbody>
    `;

    DonviList.forEach(function (donvi, index) {
        let isChecked = selectedDonViId.includes(donvi.ma_don_vi) ? 'checked' : '';
        html += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${donvi.ten_don_vi}</td>
                <td style="text-align:center">${donvi.nam}</td>
                <td class="text-center">
                    <input type="checkbox" name="ctdtSelection"
                           class="form-check-input ctdt_checkbox"
                           id="donvi_${donvi.ma_don_vi}" ${isChecked}
                           onchange="handleDonViSelection('${donvi.ma_don_vi}')">
                </td>
            </tr>
        `;
    });

    html += `</tbody>`;

    $('#cbvcTable').html(html);

    setTimeout(() => {
        initializeDataTable('Danh sách Đơn vị');
    }, 0);
}
function render_don_vi_chuyen_mon_table(DonviList) {
    $("#titleTable").text("Danh sách phân quyền theo Đơn vị chuyên môn");
    let html = `
        <thead>
            <tr>
                <th>STT</th>
                <th>Tên Đơn vị</th>
                <th>Năm</th>
                <th>Chọn</th>
            </tr>
        </thead>
        <tbody>
    `;

    DonviList.forEach(function (donvi, index) {
        let isChecked = selectedDonViChuyenMonId.includes(donvi.ma_don_vi) ? 'checked' : '';
        html += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${donvi.ten_don_vi}</td>
                <td style="text-align:center">${donvi.nam}</td>
                <td class="text-center">
                    <input type="checkbox" name="ctdtSelection"
                           class="form-check-input ctdt_checkbox"
                           id="donvichuyenmon_${donvi.ma_don_vi}" ${isChecked}
                           onchange="handleDonViChuyenMonSelection('${donvi.ma_don_vi}')">
                </td>
            </tr>
        `;
    });

    html += `</tbody>`;

    $('#cbvcTable').html(html);

    setTimeout(() => {
        initializeDataTable('Danh sách Đơn vị');
    }, 0);
}
function handleRadioSelection(programId) {
    selectedProgramId = programId;
}
function handleKhoaSelection(khoaId) {
    selectedKhoaId = khoaId;
}
function handleCtdtSelection(ctdtId) {
    let checkbox = $("#ctdt_" + ctdtId);
    let idValue = parseInt(ctdtId);

    if (checkbox.is(":checked")) {
        if (!selectedCtdtIds.includes(idValue)) {
            selectedCtdtIds.push(idValue);
        }
    } else {
        selectedCtdtIds = selectedCtdtIds.filter(item => item !== idValue);
    }
}
function handleDonViSelection(DonViID) {
    let checkbox = $("#donvi_" + DonViID);
    let idValue = parseInt(DonViID);

    if (checkbox.is(":checked")) {
        if (!selectedDonViId.includes(idValue)) {
            selectedDonViId.push(idValue);
        }
    } else {
        selectedDonViId = selectedDonViId.filter(item => item !== idValue);
    }
}
function handleDonViChuyenMonSelection(DonViID) {
    let checkbox = $("#donvichuyenmon_" + DonViID);
    let idValue = parseInt(DonViID);

    if (checkbox.is(":checked")) {
        if (!selectedDonViChuyenMonId.includes(idValue)) {
            selectedDonViChuyenMonId.push(idValue);
        }
    } else {
        selectedDonViChuyenMonId = selectedDonViChuyenMonId.filter(item => item !== idValue);
    }
}
function handlePhanQuyenChucNangSelecttion(phanquyenlist) {
    var checkbox = $("#phan_quyen_" + phanquyenlist);
    let idValue = parseInt(phanquyenlist);

    if (checkbox.is(":checked")) {
        if (!selectedPhanQuyenChucNang.includes(idValue)) {
            selectedPhanQuyenChucNang.push(idValue);
        }
    } else {
        selectedPhanQuyenChucNang = selectedPhanQuyenChucNang.filter(item => item !== idValue);
    }
}
async function load_quyen_user() {
    const res = await $.ajax({
        url: `${BASE_URL}/load_quyen_user`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ ma_user: ma_user }),
        xhrFields: {
            withCredentials: true
        }
    });

    if (res.data && res.data.length > 0) {
        const userData = res.data[0];
        selectedProgramId = userData.ma_quyen;
        if (selectedProgramId === 3) {
            selectedCtdtIds = userData.ma_ctdt.map(item => item.id_ctdt);
            selectedPhanQuyenChucNang = userData.ma_quyen_chuc_nang.map(item => item.id_chuc_nang);
        }
        if (selectedProgramId === 7 && userData.ma_don_vi.length > 0) {
            selectedDonViId = userData.ma_don_vi.map(item => item.id_don_vi);
            selectedPhanQuyenChucNang = userData.ma_quyen_chuc_nang.map(item => item.id_chuc_nang);
        }
        if (selectedProgramId == 2) {
            selectedPhanQuyenChucNang = userData.ma_quyen_chuc_nang.map(item => item.id_chuc_nang);
        }
        if (selectedProgramId === 8) {
            selectedDonViChuyenMonId = userData.ma_don_vi.map(item => item.id_don_vi);
            selectedPhanQuyenChucNang = userData.ma_quyen_chuc_nang.map(item => item.id_chuc_nang);
        }
    }
}
async function handleSave() {
    const res = await $.ajax({
        url: `${BASE_URL}/save_phan_quyen`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ma_user: ma_user,
            ma_quyen: selectedProgramId,
            ma_ctdt: selectedCtdtIds,
            ma_don_vi: selectedProgramId == 7 ? selectedDonViId : selectedDonViChuyenMonId,
            ma_chuc_nang: selectedPhanQuyenChucNang
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    Sweet_Alert("success", res.message);
}
function initializeDataTable(title) {
    $('#cbvcTable').DataTable({
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
                extend: 'csv',
                title: `${title} - CSV`
            },
            {
                extend: 'excel',
                title: `${title} - Excel`
            },
            {
                extend: 'pdf',
                title: `${title} - PDF`
            },
            {
                extend: 'print',
                title: `${title}`
            }
        ]
    });
}
