$(document).ready(function () {
    LoadData();
});

async function LoadData() {
    var namehdt = $('#namehdt').val();
    const res = await $.ajax({
        url: `${BASE_URL}/bo_phieu_khao_sat`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ ten_hedaotao: namehdt })
    })
    let body = $('#showdata');
    let html = "";
    if (res.success) {
        let items = JSON.parse(res.data);
        items.sort((a, b) => {
            var MaPhieuA = a.TenPKS.split('.')[0];
            var MaPhieuB = b.TenPKS.split('.')[0];
            return MaPhieuA.localeCompare(MaPhieuB, undefined, { numeric: true, sensitivity: 'base' });
        });

        items.forEach(item => {
            var maxChars = 150;
            var truncatedText = item.MoTaPhieu.length > maxChars ? item.MoTaPhieu.substring(0, maxChars) + '...' : item.MoTaPhieu;
            var MaPhieu = item.TenPKS.split('.')[0];
            var TenPhieu = item.TenPKS.split('.')[1];

            html += `
                        <div class="col-md-4 d-flex">
                            <div class="blog-entry align-self-stretch">
                                <a href="javascript:void(0)" class="block-20 btnCheck" data-id="${item.MaPhieu}" style="background-image: url(/Style/assets/logo_interface/test3.png);"></a>
                                <div class="text p-4 d-block">
                                    <div class="meta mb-3">
                                        <div><a href="javascript:void(0)" class="btnCheck" data-id="${item.MaPhieu}">${MaPhieu}</a></div>
                                    </div>
                                    <h3 class="heading mt-3"><a href="javascript:void(0)" class="btnCheck" data-id="${item.MaPhieu}">${TenPhieu}</a></h3>
                                    <p>${truncatedText}</p>
                                    <p class="d-flex justify-content-end">
                                        <a href="javascript:void(0)" class="btn btn-primary btnCheck" data-id="${item.MaPhieu}">Khảo sát</a>
                                    </p>
                                </div>
                            </div>
                        </div>`;
        });
    }
    else {
        html = `
                    <div class="container" id="showdata">
                        <div class="alert alert-info" style="text-align: center;">
                            ${res.message}
                        </div>
                    </div>`;
    }
    body.html(html);
}
function showLoading() {
    Swal.fire({
        title: 'Loading...',
        text: 'Đang kiểm tra và tải biểu mẫu, vui lòng chờ trong giây lát!',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}
function hideLoading() {
    Swal.close();
}
$(document).on('click', '.btnCheck', async function () {
    var id = $(this).data("id");
    showLoading()
    try {
        check_xac_thuc(id);
    }
    finally {
        hideLoading();
    }

});
async function check_xac_thuc(id) {
    const res = await $.ajax({
        url: `${BASE_URL}/check_xac_thuc`,
        type: 'POST',
        data: { surveyID: id },
    });
    let url = res.data;
    let htmlContent = ``;

    if (res.is_answer) {
        Swal.fire({
            title: "Bạn đã khảo sát phiếu khảo sát này!",
            text: "Bạn có muốn xem lại đáp án?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xem lại"
        }).then((result) => {
            if (result.isConfirmed) {
                location.href = url;
            }
        });
    } else if (res.non_survey) {
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
        else {
            location.href = url;
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
                location.href = url
            }
        });

    } else {
        Swal.fire({
            title: "Thông báo",
            text: res.message,
            icon: "warning"
        });
    }
}
