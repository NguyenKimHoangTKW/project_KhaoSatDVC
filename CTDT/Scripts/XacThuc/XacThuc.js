let check_mail = null;
$(document).ready(function () {
    load_select_xac_thuc();
});
async function load_select_xac_thuc() {
    const value = $('#hiddenId').val();
    const res = await $.ajax({
        url: `${BASE_URL}/xac_thuc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });

    let body = $('#showdata');
    body.empty();
    if (res.success) {
        const _data = JSON.parse(res.data);
        const data = _data[0];
        if (data.is_giang_vien) {
            let html = `
                <div class="container mt-4">
                     <div class="row justify-content-center">
                        <div class="col-md-6 col-12">
                            <button class="btn btn-info btn-block custom-btn mb-3" id="btnYesEmail">
                                📧 Xác thực bằng <strong>Mail trường</strong>
                            </button>
                            
                        </div>
                    </div>

                    <div id="emailResult"></div>
                </div>

            `;
            body.html(html);

            $(document).off("click", "#btnYesEmail").on("click", "#btnYesEmail", function (event) {
                event.preventDefault();
                check_mail = true;
                updateUIGV(data);
            });

            $(document).off("click", "#btnNoEmail").on("click", "#btnNoEmail", function (event) {
                event.preventDefault();
                check_mail = false;
                updateUIGV(data);
            });
        }
        else if (data.is_nh) {

            let html = `

            <div class="container mt-4">
                     <div class="row justify-content-center">
                        <div class="col-md-6 col-12">
                            <button class="btn btn-info btn-block custom-btn mb-3" id="btnYesID">
                                📧 Xác thực bằng <strong>Mã người học</strong>
                            </button>
                            <button class="btn btn-outline-info btn-block custom-btn" id="btnNoIDl">
                                💻  Xác thực trường hợp quên <strong>Mã người học</strong>
                            </button>
                        </div>
                    </div>

                    <div id="emailResult"></div>
                </div>
                
            `;
            body.html(html);

            $(document).off("click", "#btnYesID").on("click", "#btnYesID", function (event) {
                event.preventDefault();
                check_mail = true;
                updateUINH(data);
            });

            $(document).off("click", "#btnNoIDl").on("click", "#btnNoIDl", function (event) {
                event.preventDefault();
                check_mail = false;
                updateUINH(data);
            });
        }
        else if (data.is_dn) {
            let html = `

            <div class="container mt-4">
                    <div id="emailResult"></div>
                </div>
                
            `;
            body.html(html);
            updateUIDN(data);
        }
    }
    
}
function updateUIDN(data) {
    let resultContainer = $("#emailResult");
    resultContainer.html(doanh_nghiep(data));
    $(".select2").select2();
}
function updateUIGV(data) {
    let resultContainer = $("#emailResult");
    resultContainer.html(check_mail ? gv_success_email(data) : gv_failed_email(data));
    $(".select2").select2();
}
function updateUINH(data) {
    let resultContainer = $("#emailResult");
    resultContainer.html(check_mail ? nh_success_id(data) : nh_failed_id(data));
    $(".select2").select2();
}
function gv_success_email(data) {
    let html = ``;
    html = `
                <ul class="nav nav-tabs" id="myTab" role="tablist" style="padding-top: 20px;">
                    <li class="nav-item">
                        <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Xác thực Giảng viên</a>
                    </li>
                </ul>
                <div class="tab-content mt-4" id="myTabContent">
                    <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                        <div class="card">
                            <div class="card-body">                                       
                                <div class="form-group">
                                    <label for="selectElement" class="form-label" style="font-weight:bold;">Chọn chương trình đào tạo muốn khảo sát (click vào từng chương trình để xác thực)</label>
                                    <h5>Nếu <span style="color:green;font-weight:bold">Đã khảo sát</span> mà vẫn hiển thị <span style="color:red;font-weight:bold">Chưa khảo sát</span>, vui lòng <b>F5</b> lại để load dữ liệu mới nhất</h5>

                                    <table class="table table-bordered table-hover table-striped">
                                <thead class="text-center">
                                    <tr>
                                        <th scope="col">STT</th>
                                        <th scope="col">Chương trình đào tạo cần khảo sát</th>
                                        <th scope="col">Tình trạng khảo sát</th>
                                    </tr>
                                </thead>
                                <tbody id="showdata">
            `;
    data.ctdt.forEach(function (ctdt, index) {
        const style_check = ctdt.is_answer == 0 ? "color:red" : "color:green";
        html += ` <tr data-items='${ctdt.value}' style="cursor: pointer;">
                        <td class="text-center">${index + 1}</td>
                        <td>${ctdt.name}</td>
                        <td style="${style_check};font-weight:bold">${ctdt.is_answer == 0 ? "Chưa khảo sát" : "Đã khảo sát"}</td>
                    </tr>`;
    });

    html += `
                                     </tbody>
                            </table>
                                </div>
                                <hr />
                                <div class="d-flex justify-content-center mt-4" style="gap: 20px;">
                                    <button class="btn btn-outline-danger" onclick="goBack()">
                                        <i class="bi bi-arrow-left-circle"></i>
                                        Quay trở lại
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    return html;
}
function gv_failed_email(data) {
    let html = ``;
    html = `
                <ul class="nav nav-tabs" id="myTab" role="tablist" style="padding-top: 20px;">
                    <li class="nav-item">
                        <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Xác thực Giảng viên</a>
                    </li>
                </ul>
                <div class="tab-content mt-4" id="myTabContent">
                    <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                        <div class="card">
                            <div class="card-body">
                            <div class="form-group">
                                    <label for="selectElement" class="form-label" style="font-weight:bold;">Nhập mã viên chức</label>
                                    <input type="text" class="form-control" id="ma-vien-chuc" autocomplete="off" placeholder="Nhập mã viên chức tại đây" />                                  
                            </div>
                            <div class="form-group">
                                    <label for="selectElement" class="form-label" style="font-weight:bold;">Nhập tên viên chức</label>
                                    <input type="text" class="form-control" id="ten-vien-chuc" autocomplete="off" placeholder="Nhập tên viên chức tại đây" />
                            </div>
                                <div class="form-group">
                                    <label for="selectElement" class="form-label" style="font-weight:bold;">Chọn chương trình đào tạo muốn khảo sát</label>
                                    <select class="form-control select2" id="select_ctdt" name="state">
            `;
                data.ctdt.forEach(function (ctdt) {
                    html += `<option value="${ctdt.value}">${ctdt.name}</option>`;
                });

    html += `
                                    </select>
                                </div>
                                <hr />
                                <div class="d-flex justify-content-center mt-4" style="gap: 20px;">
                                    <button class="btn btn-primary" id="btnSave">
                                        <i class="bi bi-check-lg"></i>
                                        Xác thực
                                    </button>
                                    <button class="btn btn-outline-danger" onclick="goBack()">
                                        <i class="bi bi-arrow-left-circle"></i>
                                        Quay trở lại
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
  
    return html;
}
function nh_failed_id(data) {
    let html = `
        <ul class="nav nav-tabs" id="myTab" role="tablist" style="padding-top: 20px;">
            <li class="nav-item">
                <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Xác thực Người học</a>
            </li>
        </ul>
        <div class="tab-content mt-4" id="myTabContent">
            <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                <div class="card">
                    <div class="card-body">                                       
                        <div class="form-group">
                            <label for="select_ctdt" class="form-label" style="font-weight:bold;">Chọn chương trình đào tạo muốn khảo sát</label>
                            <select class="form-control select2" id="select_ctdt" name="state">
    `;

    data.ctdt.forEach(function (ctdt) {
        html += `<option value="${ctdt.value}">${ctdt.name}</option>`;
    });

    html += `
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="select_lop" class="form-label" style="font-weight:bold;">Chọn lớp muốn khảo sát</label>
                            <select class="form-control select2" id="select_lop" name="state">
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="selectElement" class="form-label" style="font-weight:bold;">Nhập tên người học</label>
                            <input type="text" class="form-control" id="ten-nguoi-hoc" autocomplete="off" placeholder="Nhập tên người học tại đây" />
                        </div>
                        <hr />
                        <div class="d-flex justify-content-center mt-4" style="gap: 20px;">
                            <button class="btn btn-primary" id="btnSave">
                                <i class="bi bi-check-lg"></i>
                                Xác thực
                            </button>
                            <button class="btn btn-outline-danger" onclick="goBack()">
                                <i class="bi bi-arrow-left-circle"></i>
                                Quay trở lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        $("#select_ctdt").change(function () {
            let selectedCtdt = $(this).val();
            let lopOptions = "";

            data.lop.forEach(function (lop) {
                if (lop.value_ctdt == selectedCtdt) {
                    lopOptions += `<option value="${lop.value}">${lop.name}</option>`;
                }
            });

            $("#select_lop").html(lopOptions);
        });
        $("#select_ctdt").trigger("change");

    }, 100);
    return html;
}
function nh_success_id(data) {
    let html = `
        <ul class="nav nav-tabs" id="myTab" role="tablist" style="padding-top: 20px;">
            <li class="nav-item">
                <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Xác thực Người học</a>
            </li>
        </ul>
        <div class="tab-content mt-4" id="myTabContent">
            <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                <div class="card">
                    <div class="card-body">                                       
                       <div class="form-group">
                            <label for="selectElement" class="form-label" style="font-weight:bold;">Nhập mã người học</label>
                            <input type="text" class="form-control" id="ma-nguoi-hoc" autocomplete="off" placeholder="Nhập mã người học tại đây" />
                        </div>
                        <hr />
                        <div class="d-flex justify-content-center mt-4" style="gap: 20px;">
                            <button class="btn btn-primary" id="btnSave">
                                <i class="bi bi-check-lg"></i>
                                Xác thực
                            </button>
                            <button class="btn btn-outline-danger" onclick="goBack()">
                                <i class="bi bi-arrow-left-circle"></i>
                                Quay trở lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return html;
}
function doanh_nghiep(data) {
    let html = ``;
    html = `
                <ul class="nav nav-tabs" id="myTab" role="tablist" style="padding-top: 20px;">
                    <li class="nav-item">
                        <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Xác thực chương trình đào tạo</a>
                    </li>
                </ul>
                <div class="tab-content mt-4" id="myTabContent">
                    <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                        <div class="card">
                            <div class="card-body">                                       
                                <div class="form-group">
                                    <label for="selectElement" class="form-label" style="font-weight:bold;">Chọn chương trình đào tạo muốn khảo sát</label>
                                    <select class="form-control select2" id="select_ctdt" name="state">
            `;
    data.ctdt.forEach(function (ctdt) {
        html += `<option value="${ctdt.value}">${ctdt.name}</option>`;
    });

    html += `
                                    </select>
                                </div>
                                <hr />
                                <div class="d-flex justify-content-center mt-4" style="gap: 20px;">
                                    <button class="btn btn-primary" id="btnSave">
                                        <i class="bi bi-check-lg"></i>
                                        Xác thực
                                    </button>
                                    <button class="btn btn-outline-danger" onclick="goBack()">
                                        <i class="bi bi-arrow-left-circle"></i>
                                        Quay trở lại
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    return html;
}

$('#showdata').on('click', 'tr', async function () {
    const items = $(this).data('items');
    const survey = $("#hiddenId").val();
    const res = await $.ajax({
        url: `${BASE_URL}/save_xac_thuc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id_ctdt: items,
            surveyID: survey,
            check_doi_tuong: check_mail
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    let htmlContent = ``;
    if (res.success) {
         if (res.is_gv) {
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
});
