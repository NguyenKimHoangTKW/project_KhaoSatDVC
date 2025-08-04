$(document).ready(function () {
    load_hinh_anh();
});
$(document).on('click', '.thumbnail-img', function () {
    const imgSrc = $(this).data('full');
    $('#modalImage').attr('src', imgSrc);
    $('#imageModal').fadeIn();
});
$(document).on("click", "#btnAdd", function () {
    $(".bd-example-modal-lg").modal("show");
});
$(document).on('click', '#imageModal .close, #imageModal', function (e) {
    if (e.target.id === 'imageModal' || $(e.target).hasClass('close')) {
        $('#imageModal').fadeOut();
    }
});
$(document).on("click", "#btnUploadImage", function () {
    upload_hinh_anh();
});
$(document).on("change", "#imageUploadInput", function (e) {
    const file = e.target.files[0];

    if (file) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            Sweet_Alert("error", "Chỉ cho phép định dạng hình ảnh: .jpg, .jpeg, .png, .gif");
            $(this).val("");
            $("#previewImage").attr("src", "#").addClass("d-none");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            $("#previewImage").attr("src", e.target.result).removeClass("d-none");
        };
        reader.readAsDataURL(file);
    } else {
        $("#previewImage").attr("src", "#").addClass("d-none");
    }
});
$(document).on("click", ".btn-delete-image", function () {
    const fileName = $(this).data("filename");
    Swal.fire({
        title: "Bạn đang thao tác xóa hình ảnh!",
        text: "Bằng việc đồng ý, bạn sẽ xóa hình ảnh này, bạn chắc chắn muốn xóa không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, tôi muốn xóa!"
    }).then((result) => {
        if (result.isConfirmed) {
            delete_hinh_anh(fileName);
        }
    });
});
async function delete_hinh_anh(fileName) {
    const res = await $.ajax({
        url: `${BASE_URL}/xoa-hinh-anh?fileName=${fileName}`,
        type: 'DELETE'
    });

    if (res.success) {
        Sweet_Alert("success", res.message);
        load_hinh_anh();
    } else {
        Sweet_Alert("error", res.message);
    }
}
async function upload_hinh_anh() {
    const fileInput = $("#imageUploadInput")[0];

    if (!fileInput || fileInput.files.length === 0) {
        Sweet_Alert("error", "Vui lòng chọn hình ảnh.");
        return;
    }

    const file = fileInput.files[0];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
        Sweet_Alert("error", "Chỉ cho phép định dạng hình ảnh: .jpg, .jpeg, .png, .gif");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await $.ajax({
        url: `${BASE_URL}/upload-hinh-anh`,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false
    });

    if (res.success) {
        Sweet_Alert("success", "Tải lên thành công!");
        load_hinh_anh();
    } else {
        Sweet_Alert("error", "Tải lên thất bại!");
    }
}

async function load_hinh_anh() {
    const res = await $.ajax({
        url: `${BASE_URL}/danh-sach-hinh-anh`,
        type: 'GET',
        contentType: 'application/json'
    });
    const body = $("#data-table");
    body.empty();
    let html = ``;
    if (res.success) {
        if ($.fn.DataTable.isDataTable('#data-table')) {
            $('#data-table').DataTable().clear().destroy();
        }
        let html = `
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Link ảnh</th>
                    <th>Định dạng</th>
                    <th>Ảnh nền</th>
                    <th>Chức năng</th>
                </tr>
            </thead>
            <tbody>
        `;

        res.data.forEach((items, index) => {
            html += `
                <tr>
                    <td class="formatSo">${index + 1}</td>
                    <td>~/Style/assets/logo_interface/${items}</td>
                    <td class="formatSo">${items.split(".")[1]}</td>
                    <td class="formatSo">
                        <img src="/Style/assets/logo_interface/${items}" 
                             alt="Logo" 
                             class="thumbnail-img" 
                             data-full="/Style/assets/logo_interface/${items}" />
                    </td>
                    <td class="formatSo">
                        <button class="btn btn-icon btn-hover btn-sm btn-rounded btn-delete-image"
                                data-filename="${items}">
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