using Antlr.Runtime.Tree;
using CTDT.Helper;
using CTDT.Models;
using CTDT.Models.Khoa;
using Newtonsoft.Json;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;

namespace CTDT.Areas.Admin.Controllers
{
    [Authorize(Roles = "2")]
    [RoutePrefix("api/v1/admin")]
    public class GiamSatTyLeThamGiaKhaoSatAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        public users user;
        public GiamSatTyLeThamGiaKhaoSatAPIController()
        {
            user = SessionHelper.GetUser();
        }
        public class option_giam_sat_ty_le_tham_gia_khao_sat
        {
            public int id_hedaotao { get; set; }
            public int id_namhoc { get; set; }
            public string check_option { get; set; }
            public int survey { get; set; }
        }
        [HttpPost]
        [Route("load-bo-loc-giam-sat-ty-le-tham-gia-khao-sat")]
        public async Task<IHttpActionResult> load_pks_by_year([FromBody] option_giam_sat_ty_le_tham_gia_khao_sat survey)
        {
            var pks = await db.survey
                .Where(x => x.id_namhoc == survey.id_namhoc && x.id_hedaotao == survey.id_hedaotao)
                .Select(x => new
                {
                    id_phieu = x.surveyID,
                    ten_phieu = x.dot_khao_sat.ten_dot_khao_sat != null ? x.surveyTitle + " - " + x.dot_khao_sat.ten_dot_khao_sat : x.surveyTitle,
                })
                .ToListAsync();

            var list_data = new List<dynamic>();
            if (survey.check_option == "true")
            {
                if (survey.id_hedaotao == 3)
                {
                    var get_don_vi = await db.khoa_vien_truong
                   .Where(x => x.id_namhoc == survey.id_namhoc)
                   .Select(x => new
                   {
                       value = x.id_khoa,
                       name = x.ten_khoa
                   })
                   .ToListAsync();

                    foreach (var donvi in get_don_vi)
                    {
                        var get_khoa = await db.khoa_children
                            .Where(x => x.id_khoa_vien_truong == donvi.value)
                            .Select(x => new
                            {
                                value_dv = x.id_khoa_vien_truong,
                                value = x.id_khoa_children,
                                name = x.ten_khoa_children
                            })
                            .ToListAsync();

                        var khoa_data = new List<dynamic>();

                        foreach (var khoa in get_khoa)
                        {
                            var bo_mon = await db.bo_mon
                                .Where(x => x.id_khoa_children == khoa.value)
                                .Select(x => new
                                {
                                    value_k = x.id_khoa_children,
                                    value = x.id_bo_mon,
                                    name = x.ten_bo_mon
                                })
                                .ToListAsync();

                            khoa_data.Add(new
                            {
                                khoa = khoa,
                                bo_mon = bo_mon
                            });
                        }

                        list_data.Add(new
                        {
                            don_vi = donvi,
                            khoa_data = khoa_data
                        });
                    }
                }
                else
                {
                    var latestNamHoc = await db.NamHoc
                        .OrderByDescending(x => x.id_namhoc)
                        .Select(x => x.id_namhoc)
                        .FirstOrDefaultAsync();

                    var get_don_vi = await db.khoa_vien_truong
                        .Where(x => x.id_namhoc == latestNamHoc)
                        .Select(x => new
                        {
                            value = x.id_khoa,
                            name = x.ten_khoa
                        })
                        .ToListAsync();

                    foreach (var donvi in get_don_vi)
                    {
                        var get_khoa = await db.khoa_children
                            .Where(x => x.id_khoa_vien_truong == donvi.value)
                            .Select(x => new
                            {
                                value_dv = x.id_khoa_vien_truong,
                                value = x.id_khoa_children,
                                name = x.ten_khoa_children
                            })
                            .ToListAsync();

                        var khoa_data = new List<dynamic>();

                        foreach (var khoa in get_khoa)
                        {
                            var bo_mon = await db.bo_mon
                                .Where(x => x.id_khoa_children == khoa.value)
                                .Select(x => new
                                {
                                    value_k = x.id_khoa_children,
                                    value = x.id_bo_mon,
                                    name = x.ten_bo_mon
                                })
                                .ToListAsync();

                            khoa_data.Add(new
                            {
                                khoa = khoa,
                                bo_mon = bo_mon
                            });
                        }

                        list_data.Add(new
                        {
                            don_vi = donvi,
                            khoa_data = khoa_data
                        });
                    }
                }
                return Ok(new { data = JsonConvert.SerializeObject(list_data), success = true });

            }
            else if (survey.check_option == "false")
            {
                if (survey.id_hedaotao == 1 || survey.id_hedaotao == 2)
                {
                    var get_ctdt = await db.ctdt
                        .Where(x => x.id_hdt == survey.id_hedaotao)
                    .Select(x => new
                    {
                        value = x.id_ctdt,
                        text = x.ten_ctdt
                    }).ToListAsync();
                    list_data.Add(get_ctdt);
                }
                else
                {
                    var get_ctdt = await db.ctdt
                    .Select(x => new
                    {
                        value = x.id_ctdt,
                        text = x.ten_ctdt
                    }).ToListAsync();
                    list_data.Add(get_ctdt);
                }

            }
            if (list_data.Any())
            {
                return Ok(new { data = JsonConvert.SerializeObject(list_data), success = true });
            }
            else
            {
                return Ok(new { message = "Không có dữ liệu bộ lọc", success = false });
            }
        }
        [HttpPost]
        [Route("giam-sat-ty-le-tham-gia-khao-sat")]
        public async Task<IHttpActionResult> load_charts_nguoi_hoc([FromBody] GiamSatThongKeKetQua find)
        {
            if (find.check_option == null)
            {
                return Ok(new { message = "Vui lòng chọn chức năng để thống kê", success = false });
            }
            var List_data = new List<dynamic>();

            List_data = await load_thong_ke_khong_dau_thoi_gian(find);
            if (List_data.Count > 0)
            {
                return Ok(new { data = JsonConvert.SerializeObject(List_data), success = true });
            }
            else
            {
                return Ok(new { message = "Chưa có dữ liệu khảo sát trong năm học để thống kê", success = false });
            }
        }
        public async Task<List<dynamic>> load_thong_ke_khong_dau_thoi_gian([FromBody] GiamSatThongKeKetQua find)
        {
            var survey = await db.survey
                .Where(x => x.id_namhoc == find.id_namhoc && x.id_hedaotao == find.id_hdt)
                .ToListAsync();
            if (find.id_namhoc != null)
            {
                survey = survey.Where(x => x.id_namhoc == find.id_namhoc).ToList();
            }
            if (find.surveyID != 0)
            {
                survey = survey.Where(x => x.surveyID == find.surveyID).ToList();
            }
            var List_data = new List<dynamic>();
            foreach (var items in survey)
            {
                if (items.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học" || items.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
                {
                    var query = await db.nguoi_hoc_khao_sat
                        .Where(x => x.surveyID == items.surveyID)
                        .ToListAsync();
                    if (find.id_don_vi != 0)
                    {
                        query = query.Where(x => x.sinhvien.lop.ctdt.id_khoa_vien_truong == find.id_don_vi).ToList();
                    }
                    if (find.id_khoa != 0)
                    {
                        query = query.Where(x => x.sinhvien.lop.ctdt.id_khoa_children == find.id_khoa).ToList();
                    }
                    if (find.id_bo_mon != 0)
                    {
                        query = query.Where(x => x.sinhvien.lop.ctdt.id_bo_mon == find.id_bo_mon).ToList();
                    }
                    if (find.id_ctdt != null)
                    {
                        query = query.Where(x => (find.id_ctdt == 0 || x.sinhvien.lop.id_ctdt == find.id_ctdt)).ToList();
                    }
                    var TotalAll = query.Count;
                    var idphieu = db.survey.Where(x => x.surveyID == items.surveyID).FirstOrDefault();
                    var TotalDaKhaoSat = query.Where(x => x.is_khao_sat == 1).ToList();
                    double percentage = TotalAll > 0 ? Math.Round(((double)TotalDaKhaoSat.Count / TotalAll) * 100, 2) : 0;
                    double unpercentage = TotalAll > 0 ? Math.Round(((double)100 - percentage), 2) : 0;
                    var DataCBVC = new
                    {
                        id_phieu = items.surveyID,
                        ten_phieu = items.surveyTitle,
                        tong_khao_sat = TotalAll,
                        tong_phieu_da_tra_loi = TotalDaKhaoSat.Count,
                        tong_phieu_chua_tra_loi = (TotalAll - TotalDaKhaoSat.Count),
                        ty_le_da_tra_loi = percentage,
                        ty_le_chua_tra_loi = unpercentage,
                        ty_le_can_dat = items.ty_le_phan_tram_dat
                    };
                    List_data.Add(DataCBVC);
                }
            }
            return List_data;
        }

        [HttpPost]
        [Route("info-ty-le-tham-gia-khao-sat")]
        public async Task<IHttpActionResult> load_info_dap_vien_khao_sat([FromBody] GiamSatThongKeKetQua find)
        {
            var check_survey = await db.survey
                .FirstOrDefaultAsync(x => x.surveyID == find.surveyID);
            var list_data = new List<dynamic>();
            int totalRecords = 0;
            string responseType = "";
            var surveyGroup = check_survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat;
            var surveyType = check_survey.id_loaikhaosat;
            if (surveyGroup == "Phiếu người học" || surveyGroup == "Phiếu cựu người học")
            {
                var query = db.nguoi_hoc_khao_sat.Where(x => x.surveyID == find.surveyID).AsQueryable();
                if (find.id_don_vi != 0)
                {
                    query = query.Where(x => x.sinhvien.lop.ctdt.id_khoa_vien_truong == find.id_don_vi);
                }
                if (find.id_khoa != 0)
                {
                    query = query.Where(x => x.sinhvien.lop.ctdt.id_khoa_children == find.id_khoa);
                }
                if (find.id_bo_mon != 0)
                {
                    query = query.Where(x => x.sinhvien.lop.ctdt.id_bo_mon == find.id_bo_mon);
                }
                if (find.id_ctdt != null)
                {
                    query = query.Where(x => (find.id_ctdt == 0 || x.sinhvien.lop.id_ctdt == find.id_ctdt));
                }
                if (find.trang_thai_khao_sat != -1)
                {
                    query = query.Where(x => x.is_khao_sat == find.trang_thai_khao_sat);
                }
                if (!string.IsNullOrEmpty(find.searchTerm))
                {
                    string keyword = find.searchTerm.ToLower();
                    query = query.Where(x =>
                    x.sinhvien.ma_sv.ToLower().Contains(keyword) ||
                    x.sinhvien.hovaten.ToLower().Contains(keyword) ||
                    x.sinhvien.lop.ma_lop.ToLower().Contains(keyword));
                }
                totalRecords = await query.CountAsync();
                var _list_data = await query
                    .OrderBy(x => x.id_nguoi_hoc_khao_sat)
                    .Skip((find.page - 1) * find.pageSize)
                    .Take(find.pageSize)
                    .Select(x => new
                    {
                        ma_nh = x.sinhvien.ma_sv,
                        ten_nh = x.sinhvien.hovaten,
                        lop = x.sinhvien.lop.ma_lop,
                        sdt = x.sinhvien.sodienthoai,
                        mota = x.sinhvien.description,
                        email_khao_sat = x.sinhvien.ma_sv + "@student.tdmu.edu.vn",
                        trang_thai = x.is_khao_sat == 1 ? "Đã khảo sát" : "Chưa khảo sát"
                    })
                    .ToListAsync();
                list_data.Add(_list_data);
                responseType = "is_nguoi_hoc";
            }
            if (list_data.Any())
            {
                return Ok(new
                {
                    data = JsonConvert.SerializeObject(list_data),
                    responseType,
                    totalRecords,
                    totalPages = (int)Math.Ceiling((double)totalRecords / find.pageSize),
                    currentPage = find.page,
                    success = true
                });
            }
            return Ok(new { message = "Không có dữ liệu", success = false });
        }
        [HttpPost]
        [Route("export-excel-info-giam-sat-ty-le-tham-gia-khao-sat")]
        public async Task<HttpResponseMessage> export_excel_info([FromBody] GiamSatThongKeKetQua find)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (ExcelPackage package = new ExcelPackage())
            {
                ExcelWorksheet worksheet = package.Workbook.Worksheets.Add("Survey Data");
                var check_survey = await db.survey.FirstOrDefaultAsync(x => x.surveyID == find.surveyID);
                var maphieu = check_survey.surveyTitle.Split('.');
                var check_nam = check_survey.NamHoc.ten_namhoc;
                if (check_survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học" || check_survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
                {
                    var query = db.nguoi_hoc_khao_sat.Where(x => x.surveyID == find.surveyID).AsQueryable();
                    if (find.id_don_vi != 0)
                    {
                        query = query.Where(x => x.sinhvien.lop.ctdt.id_khoa_vien_truong == find.id_don_vi);
                    }
                    if (find.id_khoa != 0)
                    {
                        query = query.Where(x => x.sinhvien.lop.ctdt.id_khoa_children == find.id_khoa);
                    }
                    if (find.id_bo_mon != 0)
                    {
                        query = query.Where(x => x.sinhvien.lop.ctdt.id_bo_mon == find.id_bo_mon);
                    }
                    if (find.id_ctdt != null)
                    {
                        query = query.Where(x => (find.id_ctdt == 0 || x.sinhvien.lop.id_ctdt == find.id_ctdt));
                    }
                    if (find.trang_thai_khao_sat != -1)
                    {
                        query = query.Where(x => x.is_khao_sat == find.trang_thai_khao_sat);
                    }
                    var data = await query
                        .Select(x => new
                        {
                            ma_nh = x.sinhvien.ma_sv,
                            ten_nh = x.sinhvien.hovaten,
                            lop = x.sinhvien.lop.ma_lop,
                            email_khao_sat = x.sinhvien.ma_sv + "@student.tdmu.edu.vn",
                            trang_thai = x.is_khao_sat == 1 ? "Đã khảo sát" : "Chưa khảo sát"
                        })
                        .ToListAsync();
                    string[] columnNames = { "STT", "Mã người học", "Tên người học", "Lớp", "Email khảo sát", "Trạng thái khảo sát" };
                    for (int i = 0; i < columnNames.Length; i++)
                    {
                        worksheet.Cells[1, i + 1].Value = columnNames[i];
                    }
                    using (var range = worksheet.Cells[1, 1, 1, columnNames.Length])
                    {
                        range.Style.Font.Bold = true;
                        range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                        range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    }
                    int row = 2;
                    foreach (var item in data)
                    {
                        worksheet.Cells[row, 1].Value = row - 1;
                        worksheet.Cells[row, 2].Value = item.ma_nh;
                        worksheet.Cells[row, 3].Value = item.ten_nh;
                        worksheet.Cells[row, 4].Value = item.lop;
                        worksheet.Cells[row, 5].Value = item.email_khao_sat;
                        worksheet.Cells[row, 6].Value = item.trang_thai;
                        row++;
                    }
                    worksheet.Cells.AutoFitColumns();
                }
                var stream = new MemoryStream();
                package.SaveAs(stream);
                stream.Position = 0;
                HttpResponseMessage response = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
                {
                    Content = new ByteArrayContent(stream.ToArray())
                };
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                {
                    FileName = $"{maphieu}_{check_nam}_ty_le_giam_sat_ket_qua_phieu.xlsx"
                };
                return response;
            }
        }
    }
}
