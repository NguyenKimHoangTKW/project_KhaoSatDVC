$(".select2").select2();
let value_check = null;
$(document).ready(function () {
    load_data();
});
$(document).on("click", "#btnAdd", async function () {
    $("#modal-title-update").text("Thêm mới Navbar");
    const footer_modal = $("#modal-footer-update");
    footer_modal.empty();
    let html = ``;
    html =
        `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" id="btnSaveAdd">Lưu thay đổi</button>
        `;
    footer_modal.html(html);
    $("#Modal-update").modal("show");
});
$(document).on("click", "#btnSaveAdd", function () {
    add_new();
});

$(document).on("click", "#btnEdit", async function () {
    const value = $(this).data("id");
    $("#modal-title-update").text("Chỉnh sửa Navbar");

    const footer_modal = $("#modal-footer-update");
    footer_modal.empty();
    let html = `
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
        <button type="button" class="btn btn-primary" id="btnSaveEdit">Lưu thay đổi</button>
    `;
    footer_modal.html(html);
    await info_data(value);
    value_check = value;
    $("#Modal-update").modal("show");
});
$(document).on("click", "#btnSaveEdit", async function () {
    await edit_data(value_check);
});
$(document).on("click", "#btnDelete", function () {
    const value = $(this).data("id");
    Swal.fire({
        title: "Bạn đang thao tác xóa dữ liệu",
        text: "Bằng việc bấm vào đồng ý, bạn sẽ xóa dữ liệu của Navbar này, bạn muốn tiếp tục?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, tôi muốn xóa!"
    }).then((result) => {
        if (result.isConfirmed) {
            delete_data(value);
        }
    });
});
async function add_new() {
    const thu_tu = $("#thu-tu-val").val();
    const ten_nav = $("#ten-navbar-val").val();
    const link_nav = $("#link-dieu-huong-val").val();
    const trang_thai = $("#trang-thai-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/them-moi-navbar`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            thu_tu_hien_thi: thu_tu,
            name_navbar: ten_nav,
            link_navbar: link_nav,
            is_open: trang_thai
        })
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
        load_data();
    } else {
        Sweet_Alert("error", res.message);
    }
}
async function delete_data(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/delete-navbar`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_navbar: value
        })
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
        load_data();
    } else {
        Sweet_Alert("error", res.message);
    }
}
async function edit_data(value) {
    const thu_tu = $("#thu-tu-val").val();
    const ten_nav = $("#ten-navbar-val").val();
    const link_nav = $("#link-dieu-huong-val").val();
    const trang_thai = $("#trang-thai-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/update-navbar`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_navbar: value,
            thu_tu_hien_thi : thu_tu,
            name_navbar: ten_nav,
            link_navbar: link_nav,
            is_open: trang_thai
        })
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
        load_data();
    } else {
        Sweet_Alert("error", res.message);
    }
}
async function info_data(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/info-navbar`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id_navbar: value })
    });

    if (res.success) {
        const data = res.data[0];
        $("#thu-tu-val").val(data.thu_tu_hien_thi);
        $("#ten-navbar-val").val(data.name_navbar);
        $("#trang-thai-val").val(data.is_open).trigger("change");
        $("#link-dieu-huong-val").val(data.link_navbar);
    } else {
        Sweet_Alert("error", res.message);
    }
}
async function load_data() {
    const res = await $.ajax({
        url: `${BASE_URL}/danh-sach-navbar`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        }
    });

    const body = $("#data-table");
    body.empty();

    if (res.success) {
        if ($.fn.DataTable.isDataTable('#data-table')) {
            $('#data-table').DataTable().clear().destroy();
        }
        let html = `
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Thứ tự hiển thị Navbar</th>
                    <th>Tên Navbar</th>
                    <th>Link điều hướng</th>
                    <th>Trạng thái</th>              
                    <th>Chức năng</th>
                </tr>
            </thead>
            <tbody>
        `;

        res.data.forEach((items, index) => {
            const color_is_open = items.is_open == 1 ? "green" : "red";
            html += `
                <tr>
                    <td class="formatSo">${index + 1}</td>
                    <td class="formatSo">${items.thu_tu_hien_thi}</td>
                    <td>${items.name_navbar}</td>
                    <td>${items.link_navbar}</td>
                    <td style="color:${color_is_open}">${items.is_open == 1 ? "Đang mở" : "Đang đóng"}</td>
                    <td class="formatSo">
                        <button class="btn btn-icon btn-hover btn-sm btn-rounded pull-right" id="btnEdit" data-id="${items.id_navbar}">
                            <i class="anticon anticon-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-hover btn-sm btn-rounded pull-right" id="btnDelete" data-id="${items.id_navbar}">
                            <i class="anticon anticon-delete"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
            </tbody>
        `;

        body.html(html);
        $('#data-table').DataTable({
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
    } else {
        Sweet_Alert("error", res.message);
    }
}