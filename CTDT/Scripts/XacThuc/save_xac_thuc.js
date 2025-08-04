$(document).on("click", "#btnSave", function (event) {
    event.preventDefault();
    save_xac_thuc();
});
$(document).on("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        save_xac_thuc(); 
    }
});
async function save_xac_thuc() {
    const ma_vien_chuc = escapeHtml($("#ma-vien-chuc").val());
    const ten_vien_chuc = escapeHtml($("#ten-vien-chuc").val());
    const ctdt = escapeHtml($("#select_ctdt").val());
    const survey = escapeHtml($("#hiddenId").val());
    const ma_nh = escapeHtml($("#ma-nguoi-hoc").val());
    const ten_nh = escapeHtml($("#ten-nguoi-hoc").val());
    const lop = escapeHtml($("#select_lop").val());
    const res = await $.ajax({
        url: `${BASE_URL}/save_xac_thuc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ma_vien_chuc: ma_vien_chuc,
            ten_vien_chuc: ten_vien_chuc,
            id_ctdt: ctdt,
            surveyID: survey,
            ma_nh: ma_nh,
            ten_nh: ten_nh,
            check_lop: lop,
            check_doi_tuong: check_mail
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    let htmlContent = ``;
    if (res.success) {
        if (res.is_cbvc) {
            htmlContent =
                `
                <div style="text-align: left;">
                  <p><strong>Mã cán bộ viên chức: </strong>${res.info[0].MaCBVC}</p>
                  <p><strong>Tên cán bộ viên chức: </strong>${res.info[0].TenCBVC}</p>
                  <p><strong>Trình độ: </strong>${res.info[0].ten_trinh_do}</p>
                  <p><strong>Chức vụ: </strong>${res.info[0].name_chucvu}</p>
                  <p><strong>Thuộc đơn vị: </strong>${res.info[0].ten_khoa}</p>
                  <p><strong>Ngành đào tạo: </strong>${res.info[0].nganh_dao_tao}</p>
                  <p style="color:red;font-style:italic;font-weight:400">Nếu sai thông tin, vui lòng thông báo về mail: khaosat@tdmu.edu.vn để được hỗ trợ</p>
                </div>
                `;
        }
        else if (res.is_nghoc) {
            htmlContent =
                `
                <div style="text-align: left;">
                  <p><strong>Mã người học: </strong>${res.info[0].ma_nh}</p>
                  <p><strong>Tên người học: </strong>${res.info[0].ten_nh}</p>
                  <p><strong>Lớp: </strong>${res.info[0].thuoc_lop}</p>
                  <p><strong>Thuộc chương trình đào tạo: </strong>${res.info[0].thuoc_ctdt}</p>
                  <p><strong>Thuộc đơn vị: </strong>${res.info[0].thuoc_don_vi}</p>
                  ${res.info[0].mo_ta !== "" ? `<p><strong>Người học năm: </strong>${res.info[0].mo_ta}</p>` : "" }
                  <p style="color:red;font-style:italic;font-weight:400">Nếu sai thông tin, vui lòng thông báo về mail: khaosat@tdmu.edu.vn để được hỗ trợ</p>
                </div>
                `;
        }
        else if (res.is_gv) {
            htmlContent =
                `
                <div style="text-align: left;">
                  <p><strong>Mã cán bộ viên chức: </strong>${res.info[0].MaCBVC}</p>
                  <p><strong>Tên cán bộ viên chức: </strong>${res.info[0].TenCBVC}</p>
                  <p><strong>Trình độ: </strong>${res.info[0].ten_trinh_do}</p>
                  <p><strong>Chức vụ: </strong>${res.info[0].name_chucvu}</p>
                  <p><strong>Thuộc đơn vị: </strong>${res.info[0].ten_khoa}</p>
                  <p><strong>Ngành đào tạo: </strong>${res.info[0].nganh_dao_tao}</p>
                  <p><strong>Khảo sát cho CTĐT: </strong>${res.info[0].khao_sat_cho}</p>
                  <p style="color:red;font-style:italic;font-weight:400">Nếu sai thông tin, vui lòng thông báo về mail: khaosat@tdmu.edu.vn để được hỗ trợ</p>
                </div>
                `;
        }
        else {
            window.location.href = res.url
            return;
        }
        Swal.fire({
            title: 'Kiểm tra thông tin',
            html: htmlContent,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Vào khảo sát',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = res.url
            }
        });
    }
    else if (res.is_answer) {
        Swal.fire({
            title: "Bạn đã khảo sát cho chương trình đào tạo này!",
            text: "Bạn có muốn xem lại đáp án?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xem lại"
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = res.url;
            }
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