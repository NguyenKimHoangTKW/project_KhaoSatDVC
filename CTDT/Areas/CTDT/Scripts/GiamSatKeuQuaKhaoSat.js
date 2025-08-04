// Khai báo toàn cục quản lý Chart instances
const chartInstances = {};
function destroyChartIfExists(id) {
    if (chartInstances[id]) {
        chartInstances[id].destroy();
        delete chartInstances[id];
    }
}

$(".select2").select2();
$(document).on("click", "#btnFilter", async function (event) {
    event.preventDefault();
    await LoadChartAnswerSurvey();
    await LoadChartSurvey();
});

async function LoadChartSurvey() {
    $(".loader").show();
    try {
        const year = $("#year").val();
        const res = await $.ajax({
            url: `${BASE_URL_CTDT}/giam-sat-ty-le-tham-gia-khao-sat-theo-nam-dashboard`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id_namhoc: year }),
            xhrFields: { withCredentials: true }
        });

        $('#survey-list').empty();
        if (res.success) {
            const surveys = JSON.parse(res.data);
            surveys.sort((a, b) => {
                const idA = a.ten_phieu.split(".")[0].replace(/\D/g, "");
                const idB = b.ten_phieu.split(".")[0].replace(/\D/g, "");
                return parseInt(idA) - parseInt(idB);
            });

            surveys.forEach((survey) => {
                const tenPhieuParts = survey.ten_phieu.split(".");
                const MaPhieu = tenPhieuParts[0].toUpperCase();
                const TieuDePhieu = tenPhieuParts[1]?.trim() || "Không có tiêu đề";

                const thongKeTyLe = {
                    tong_khao_sat: survey.tong_khao_sat,
                    tong_phieu_da_tra_loi: survey.tong_phieu_da_tra_loi,
                    tong_phieu_chua_tra_loi: survey.tong_phieu_chua_tra_loi,
                    ty_le_da_tham_gia: survey.ty_le_da_tra_loi,
                    ty_le_can_dat: survey.ty_le_can_dat
                };

                let card = ``;
                if (survey.is_dn) {
                    const get_color = survey.trang_thai === `Đạt` ? `color:green;font-weight: bold;` : `color:red;font-weight: bold;`;
                    card = `
                        <div class="card survey-card">
                            <div class="card-body">
                                <div style="align-items: center;">
                                    <p style="color:#5029ff;font-weight:bold; position: absolute; top: 0; left: 20px;">${MaPhieu}</p>
                                    <hr/>
                                    <p style="color:#5029ff;font-weight:bold; position: absolute; top: 39px; right: 20px;">${survey.he_dao_tao}</p>
                                    <hr/>
                                    <p style="color:black;font-weight:bold">${TieuDePhieu}</p>
                                    <hr/>
                                </div>
                                <canvas class="chart" id="donut-chart-${MaPhieu}"></canvas>
                                <p id="surveyedInfo-${MaPhieu}" style="margin: 0; color: red;"></p>
                                <hr/>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-weight:bold">
                                    <p style="margin: 0; color: black;">Số phiếu tối thiểu cần khảo sát: ${thongKeTyLe.tong_khao_sat || '0'}</p>
                                    <p style="margin: 0; color:#5029ff;">Đã khảo sát: ${thongKeTyLe.tong_phieu_da_tra_loi || '0'}</p>
                                    <p style="margin: 0; ${get_color}">${survey.trang_thai}</p>
                                </div>
                            </div>
                        </div>`;
                } else {
                    card = `
                        <div class="card survey-card">
                            <div class="card-body">
                                <div style="align-items: center;">
                                    <p style="color:#5029ff;font-weight:bold; position: absolute; top: 0; left: 20px;">${MaPhieu}</p>
                                    <hr/>
                                    <p style="color:#5029ff;font-weight:bold; position: absolute; top: 39px; right: 20px;">${survey.he_dao_tao}</p>
                                    <hr/>
                                    <p style="color:black;font-weight:bold">${TieuDePhieu}</p>
                                    <hr/>
                                </div>
                                <canvas class="chart" id="donut-chart-${MaPhieu}"></canvas>
                                <p id="surveyedInfo-${MaPhieu}" style="margin: 0; color: red;"></p>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-weight:bold">
                                    <p style="margin: 0; color: #ff0000;">Tỷ lệ cần đạt: ${thongKeTyLe.ty_le_can_dat || '0'}%</p>
                                    <p style="margin: 0; color:black;">Tỷ lệ đã khảo sát: <span style="${thongKeTyLe.ty_le_da_tham_gia > thongKeTyLe.ty_le_can_dat ? "color:green" : "color:red"}">${thongKeTyLe.ty_le_da_tham_gia || '0'}%</span></p>
                                </div>
                                <hr/>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-weight:bold">
                                    <p style="margin: 0; color: black;">Tổng phiếu: ${thongKeTyLe.tong_khao_sat || '0'}</p>
                                    <p style="margin: 0; color:#5029ff;">Đã khảo sát: ${thongKeTyLe.tong_phieu_da_tra_loi || '0'}</p>
                                    <p style="margin: 0; color:#ebb000;">Chưa khảo sát: ${thongKeTyLe.tong_phieu_chua_tra_loi || '0'}</p>
                                </div>
                            </div>
                        </div>`;
                }

                $('#survey-list').append(card);

                const donutId = `donut-chart-${MaPhieu}`;
                destroyChartIfExists(donutId);

                const donutCtx = document.getElementById(donutId).getContext('2d');
                let donutData = {};

                if (thongKeTyLe.tong_khao_sat > 0) {
                    donutData = {
                        labels: ['Số phiếu chưa trả lời', 'Số phiếu đã thu'],
                        datasets: [{
                            backgroundColor: ['#ffc107', '#007bff'],
                            data: [
                                thongKeTyLe.tong_phieu_chua_tra_loi,
                                thongKeTyLe.tong_phieu_da_tra_loi
                            ]
                        }]
                    };
                } else {
                    donutData = {
                        labels: ['Không có dữ liệu'],
                        datasets: [{
                            backgroundColor: ['#d3d3d3'],
                            data: [1]
                        }]
                    };
                    $(`#surveyedInfo-${MaPhieu}`).text('Không có dữ liệu');
                }

                chartInstances[donutId] = new Chart(donutCtx, {
                    type: 'doughnut',
                    data: donutData,
                    options: {
                        maintainAspectRatio: false,
                        cutout: '45%',
                        plugins: { tooltip: { enabled: true }, legend: { display: true } }
                    }
                });
            });
        } else {
            Swal.fire({
                icon: "error",
                title: res.message,
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        }
    } finally {
        $(".loader").hide();
    }
}

async function LoadChartAnswerSurvey() {
    $(".loader").show();
    try {
        const year = $("#year").val();
        const response = await $.ajax({
            url: `${BASE_URL_CTDT}/giam-sat-ket-qua-khao-sat-theo-nam-dashboard`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id_namhoc: year }),
            xhrFields: { withCredentials: true }
        });

        const res = JSON.parse(response);
        const body = $("#showchart");
        body.empty();
        let chartIndex = 0;

        res.forEach(items => {
            const { ten_hedaotao, survey } = items;
            if (!survey || survey.length === 0) return;

            body.append(`
                <div class="row">
                    <div class="col text-center">
                        <h3 class="mt-4"><span>${ten_hedaotao}</span></h3>
                        <hr />
                    </div>
                </div>
            `);

            const canvasId = `chart-${chartIndex++}`;
            destroyChartIfExists(canvasId);

            body.append(`
                <div class="row mb-5">
                    <div class="col-md-12">
                        <canvas id="${canvasId}" height="300"></canvas>
                    </div>
                </div>
            `);

            const labels = [];
            const satisfactionRates = [];
            const avgScores = [];

            survey.sort((a, b) => {
                const idA = a.ten_phieu.match(/\d+/) ? parseInt(a.ten_phieu.match(/\d+/)[0]) : 0;
                const idB = b.ten_phieu.match(/\d+/) ? parseInt(b.ten_phieu.match(/\d+/)[0]) : 0;
                return idA - idB;
            });

            survey.forEach(s => {
                labels.push(s.ten_phieu.split('.')[0]);
                const mucDoHaiLong = s.muc_do_hai_long?.[0] || {};
                satisfactionRates.push(mucDoHaiLong.avg_ty_le_hai_long || 0);
                avgScores.push(mucDoHaiLong.avg_score || 0);
            });

            const ctx = document.getElementById(canvasId).getContext('2d');
            chartInstances[canvasId] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Tỷ lệ hài lòng (%)",
                            backgroundColor: "rgba(0,123,255,0.5)",
                            borderColor: "rgba(0,123,255,1)",
                            borderWidth: 1,
                            data: satisfactionRates,
                            yAxisID: 'y-left'
                        },
                        {
                            label: "Điểm trung bình",
                            backgroundColor: "rgba(255,193,7,0.5)",
                            borderColor: "rgba(255,193,7,1)",
                            borderWidth: 1,
                            data: avgScores,
                            yAxisID: 'y-right'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    tooltips: { mode: 'index', intersect: false },
                    scales: {
                        yAxes: [
                            {
                                id: 'y-left',
                                position: 'left',
                                ticks: { max: 100, stepSize: 20, beginAtZero: true },
                                scaleLabel: { display: true, labelString: 'Tỷ lệ hài lòng (%)' }
                            },
                            {
                                id: 'y-right',
                                position: 'right',
                                ticks: { max: 5, min: 0, stepSize: 1 },
                                scaleLabel: { display: true, labelString: 'Điểm trung bình' }
                            }
                        ],
                        xAxes: [{ ticks: { autoSkip: false, fontSize: 12 } }]
                    }
                }
            });
        });

        body.append(`
            <div class="mt-3">
                <a href="/admin/thong-ke-ket-qua-khao-sat" class="btn btn-outline-primary d-inline-flex align-items-center gap-2">
                    <i class="fas fa-eye"></i> Xem chi tiết tần suất
                </a>
            </div>
        `);
        $('#showchart').show();
    } finally {
        $(".loader").hide();
    }
}
