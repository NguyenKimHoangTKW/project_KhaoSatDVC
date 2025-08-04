$(document).ready( function () {
     load_he_dao_tao();
});

async function load_he_dao_tao() {
    const res = await $.ajax({
        url: `${BASE_URL}/he_dao_tao`,
        type: 'POST',
    })
    let body = $('#showdata');
    let html = '';
    body.empty();
    const data = JSON.parse(res.data);
    if (res.islogin) {
        html =
            `
        <div class="row justify-content-center mb-5 pb-3">
            <div class="col-md-10 heading-section text-center">
                <h2 class="mb-4" style="font-weight:bold;">DANH SÁCH CHỨC NĂNG KHẢO SÁT DỊCH VỤ CÔNG</h2>
            </div>
        </div>
        <div class="row">`;
        data.forEach(function (chil) {
            html +=
                `
            <div class="col-md-6 d-flex">
                <div class="course align-self-stretch">
                    <a href="javascript:void(0)" onclick='window.location.href="bo-phieu-khao-sat/${chil.TenHDT}"' class="img" style="background-image: url(/Style/assets/logo_interface/${chil.img})"></a>
                    <div class="text p-4">
                        <p class="category"><span>KHẢO SÁT DỊCH VỤ CÔNG</span></p>
                        <h3 class="mb-3" style="font-weight:bold;"><a href="javascript:void(0)" onclick='window.location.href="/bo-phieu-khao-sat/${chil.TenHDT}"'>DÀNH CHO ${chil.TenHDT}</a></h3>
                        <p style="color:red">${chil.mo_ta}</p>
                        <p class="d-flex justify-content-end"><a href="javascript:void(0)" onclick='window.location.href="/bo-phieu-khao-sat/${chil.TenHDT}"' class="btn btn-primary">Vào bộ phiếu</a></p>
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';

        if (res.ctdt) {
            html += form_ctdt();
        } else if (res.admin) {
            html += form_qtv();
        } 
        body.html(html);
    }
    else {
        form_no_login(data);
    }

}
function form_no_login(check) {
    let body = $('#showdata');
    let html = '';
    html =
        `
                    <div class="row justify-content-center mb-5 pb-3">
                        <div class="col-md-7 heading-section text-center">
                            <h2 class="mb-4" style="font-weight:bold;">DANH SÁCH CHỨC NĂNG</h2>
                        </div>
                    </div>
                    <div class="alert alert-info" style="text-align: center;">
                        <span style="color:red">Lưu ý :</span> Vui lòng đăng nhập tiếp tục các chức năng
                    </div>
                    <div class="row">`;
    check.forEach(function (chil) {
        html +=
            `
                        <div class="col-md-6 d-flex">
                            <div class="course align-self-stretch">
                                <a href="javascript:void(0)" class="img" style="background-image: url(/Style/assets/logo_interface/${chil.img})"></a>
                                <div class="text p-4">
                                   <p class="category"><span>KHẢO SÁT DỊCH VỤ CÔNG</span></p>
                                    <h3 class="mb-3 highlight-animate"><a href="javascript:void(0)">DÀNH CHO ${chil.TenHDT}</a></h3>
                                    <p style="color:red" >${chil.mo_ta}</p>
                                </div>
                            </div>
                        </div>`;
    });

    html += '</div>';

    body.html(html);
}
function form_ctdt() {
    return `
        <div class="row">
            <div class="col-md-12">
                <div class="course align-self-stretch">
                    <a href="javascript:void(0)" onclick="window.location.href='/ctdt/trang-chu'" class="img" style="background-image: url(/Style/assets/logo_interface/wallpaperadmin.jpg)"></a>
                    <div class="text p-4">
                        <p class="category"><span>KHẢO SÁT DỊCH VỤ CÔNG</span></p>
                        <h3 class="mb-3"><a href="javascript:void(0)" onclick="window.location.href='/ctdt/trang-chu'">DÀNH CHO PHÂN QUYỀN CẤP CHƯƠNG TRÌNH ĐÀO TẠO</a></h3>
                        <p>Thống kê kết quả khảo sát ý kiến, đánh giá, góp ý của người học về dịch vụ công theo Chương trình đào tạo ...</p>
                        <p class="d-flex justify-content-end"><a href="javascript:void(0)" onclick="window.location.href='/ctdt/trang-chu'" class="btn btn-primary">Truy cập vào thống kê</a></p>
                    </div>
                </div>
            </div>
        </div>`;
}
function form_qtv() {
    return `
        <div class="row">
            <div class="col-md-12">
                <div class="course align-self-stretch">
                    <a href="javascript:void(0)" onclick='window.location.href="/admin/trang-chu"' class="img" style="background-image: url(/Style/assets/logo_interface/wallpaperadmin.jpg)"></a>
                    <div class="text p-4">
                       <p class="category"><span>KHẢO SÁT DỊCH VỤ CÔNG</span></p>
                        <h3 class="mb-3"><a href="javascript:void(0)" onclick='window.location.href="/admin/trang-chu"'>DÀNH CHO PHÂN QUYỀN CẤP QUẢN TRỊ VIÊN</a></h3>
                        <p>Quản lý hệ thống, thống kê kết quả khảo sát ý kiến, giám sát, đánh giá, góp ý của người học về dịch vụ công toàn trường ...</p>
                        <p class="d-flex justify-content-end"><a href="javascript:void(0)" onclick='window.location.href="/admin/trang-chu"' class="btn btn-primary">Truy cập vào quản trị</a></p>
                    </div>
                </div>
            </div>
        </div>`;
}