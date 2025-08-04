$(".select2").select2();
let value_check = null;
$(document).ready(function () {
    load_data();
});
$(document).on('click', '.thumbnail-img', function () {
    const imgSrc = $(this).data('full');
    $('#modalImage').attr('src', imgSrc);
    $('#imageModal').fadeIn();
});

$(document).on('click', '#imageModal .close, #imageModal', function (e) {
    if (e.target.id === 'imageModal' || $(e.target).hasClass('close')) {
        $('#imageModal').fadeOut();
    }
});

$(document).on("click", ".image-item", function () {
    $(".image-item").removeClass("selected");
    $(this).addClass("selected");
    const selectedImage = $(this).data("name");
    $("#anh-nen-val").val(selectedImage);
    const imagePath = `/Style/assets/logo_interface/${selectedImage}`;
    $("#previewImage").attr("src", imagePath).removeClass("d-none");
});
$(document).on("click", "#btnAdd", async function () {
    await load_option_hinh_anh();
    $("#modal-title-update").text("Thêm mới hệ đào tạo");
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
    $("#modal-title-update").text("Chỉnh sửa hệ đào tạo");

    const footer_modal = $("#modal-footer-update");
    footer_modal.empty();
    let html = `
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
        <button type="button" class="btn btn-primary" id="btnSaveEdit">Lưu thay đổi</button>
    `;
    footer_modal.html(html);

    await load_option_hinh_anh();

    await info_data(value);
    value_check = value;
    $("#Modal-update").modal("show");
});
$(document).on("click", "#btnSaveEdit", async function () {
    await edit_data(value_check);
});
$(document).on("click", "#btnDelete",  function () {
    const value = $(this).data("id");
    Swal.fire({
        title: "Bạn đang thao tác xóa dữ liệu",
        text: "Bằng việc bấm vào đồng ý, bạn sẽ xóa dữ liệu của hệ đào tạo này, bạn muốn tiếp tục?",
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
async function delete_data(value) {
    const res = await $.ajax({
        url: `${BASE_URL}/delete-he-dao-tao`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_hedaotao: value
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
        url: `${BASE_URL}/info-he-dao-tao`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id_hedaotao: value })
    });

    if (res.success) {
        const data = res.data[0];
        $("#ten-he-dao-tao-val").val(data.ten_hedaotao);
        $("#mo-ta-val").val(data.describe);
        $("#trang-thai-val").val(data.is_open).trigger("change");
        $("#anh-nen-val").val(data.image);
        $("#trang-thai-thong-ke-val").val(data.is_statistical).trigger("change");

        const imageItem = $(`.image-item[data-name="${data.image}"]`);
        if (imageItem.length > 0) {
            imageItem.click();
        }
    } else {
        Sweet_Alert("error", res.message);
    }
}
async function add_new() {
    const ten_he = $("#ten-he-dao-tao-val").val();
    const mo_ta = $("#mo-ta-val").val();
    const trang_thai = $("#trang-thai-val").val();
    const trang_thai_thong_ke = $("#trang-thai-thong-ke-val").val();
    const anh_nen = $("#anh-nen-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/them-moi-he-dao-tao`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ten_hedaotao: ten_he,
            describe: mo_ta,
            is_open: trang_thai,
            image: anh_nen,
            is_statistical: trang_thai_thong_ke
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
    const ten_he = $("#ten-he-dao-tao-val").val();
    const mo_ta = $("#mo-ta-val").val();
    const trang_thai = $("#trang-thai-val").val();
    const trang_thai_thong_ke = $("#trang-thai-thong-ke-val").val();
    const anh_nen = $("#anh-nen-val").val();
    const res = await $.ajax({
        url: `${BASE_URL}/update-he-dao-tao`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_hedaotao: value,
            ten_hedaotao: ten_he,
            describe: mo_ta,
            is_open: trang_thai,
            image: anh_nen,
            is_statistical: trang_thai_thong_ke
        })
    });
    if (res.success) {
        Sweet_Alert("success", res.message);
        load_data();
    } else {
        Sweet_Alert("error", res.message);
    }
}
async function load_option_hinh_anh() {
    const res = await $.ajax({
        url: `${BASE_URL}/danh-sach-hinh-anh`,
        type: 'GET',
        contentType: 'application/json'
    });
    const grid = $("#image-grid");
    grid.empty();
    if (res.success) {
        res.data.forEach((imageName, index) => {
            const imagePath = `/Style/assets/logo_interface/${imageName}`;
            const imgHtml = `
                <div class="col-2">
                    <div class="image-item" data-name="${imageName}">
                        <img src="${imagePath}" alt="Ảnh ${index}" />
                    </div>
                </div>`;
            grid.append(imgHtml);
        });
    } else {
        Sweet_Alert("error", res.message);
    }
}
async function load_data() {
    const res = await $.ajax({
        url: `${BASE_URL}/danh-sach-he-dao-tao`,
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
                    <th>ID hệ đào tạo</th>
                    <th>Tên hệ đào tạo</th>
                    <th>Mô tả</th>
                    <th>Trạng thái hiển thị</th>
                    <th>Trạng thái thống kê</th>
                    <th>Ảnh nền</th>
                    <th>Chức năng</th>
                </tr>
            </thead>
            <tbody>
        `;
        res.data.forEach((items, index) => {
            const color_is_open = items.is_open == 1 ? "green" : "red";
            const color_is_statistical = items.is_statistical == 1 ? "green" : "red";
            html += `
                <tr>
                    <td class="formatSo">${index + 1}</td>
                    <td class="formatSo">${items.id_hedaotao}</td>
                    <td>${items.ten_hedaotao}</td>
                    <td>${items.describe}</td>
                    <td style="color:${color_is_open}">${items.is_open == 1 ? "Đang mở" : "Đang đóng"}</td>
                    <td style="color:${color_is_statistical}">${items.is_statistical == 1 ? "Đang mở" : "Đang đóng"}</td>
                    <td>
                        <img src="/Style/assets/logo_interface/${items.image}" 
                             alt="Logo" 
                             class="thumbnail-img" 
                             data-full="/Style/assets/logo_interface/${items.image}" />
                    </td>
                    <td class="formatSo">
                        <button class="btn btn-icon btn-hover btn-sm btn-rounded pull-right" id="btnEdit" data-id="${items.id_hedaotao}">
                            <i class="anticon anticon-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-hover btn-sm btn-rounded pull-right" id="btnDelete" data-id="${items.id_hedaotao}">
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
