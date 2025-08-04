$(document).ready(function () {
    load_mon_hoc();
});

async function load_mon_hoc() {
    const value = $("#hiddenId").val();
    const res = await $.ajax({
        url: `${BASE_URL}/load_danh_sach_mon_hoc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: value
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    const body = $('#show-data');
    let html = "";
    if (res.success) {
        const data = JSON.parse(res.data);
        html += `<table class="table table-bordered table-hover table-striped">
                    <thead class="text-center">
                        <tr>
                            <th scope="col">STT</th>
                            <th scope="col">Giảng viên</th>
                            <th scope="col">Môn học</th>
                            <th scope="col">Tình trạng khảo sát</th>                            
                        </tr>
                    </thead>
                    <tbody id="showdata">`;
        data.forEach(function (items, index) {
            const style_check = items.tinh_trang_khao_sat == "Chưa khảo sát" ? "color:red" : "color:green";
            html += ` 
                    <tr data-items='${items.id_mon_hoc}' style="cursor: pointer;">
                        <td class="text-center">${index + 1}</td>
                        <td class="text-center">${items.ten_giang_vien}</td>
                        <td class="text-center">${items.mon_hoc}</td>
                        <td class="text-center" style="${style_check};font-weight:bold">${items.tinh_trang_khao_sat}</td>
                    </tr>`;
        });


        html += ` </tbody>
                </table>`;
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
$('#show-data').on('click', 'tr', async function () {
    const items = $(this).data('items');
    const survey = $("#hiddenId").val();
    const res = await $.ajax({
        url: `${BASE_URL}/load_danh_sach_mon_hoc`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            surveyID: survey,
            check_hoc_phan: items
        }),
        xhrFields: {
            withCredentials: true
        }
    });
    let htmlContent = ``;
    if (res.success) {
        if (res.is_nghoc_by_hp) {
            htmlContent =
                `
                <div style="text-align: left;">
                  <p><strong>Mã người học: </strong>${res.info[0].ma_nh}</p>
                  <p><strong>Tên người học: </strong>${res.info[0].ten_nh}</p>
                  <p><strong>Học phần: </strong>${res.info[0].hoc_phan}</p>
                  <p><strong>Mã MH: </strong>${res.info[0].ma_mh}</p>
                  <p><strong>Tên MH: </strong>${res.info[0].mon_hoc}</p>
                  <p><strong>Lớp: </strong>${res.info[0].lop}</p>
                  <p><strong>Giảng viên giảng dạy: </strong>${res.info[0].giang_vien_giang_day}</p>
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
            title: "Bạn đã thực hiện khảo sát cho môn học này!",
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
});