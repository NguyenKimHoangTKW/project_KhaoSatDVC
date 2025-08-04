using CTDT.Models;
using Microsoft.AspNet.SignalR.Hubs;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
namespace CTDT.Areas.Admin.Controllers
{
    [Authorize(Roles = "2")]
    [RoutePrefix("api/v1/admin")]
    public class NguoiHocAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        private int unixTimestamp;
        public NguoiHocAPIController()
        {
            DateTime now = DateTime.UtcNow;
            unixTimestamp = (int)(now.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
        }
        [HttpPost]
        [Route("danh-sach-nguoi-hoc")]
        public async Task<IHttpActionResult> LoadDanhSachNguoiHoc([FromBody] Data_SV sv)
        {
            var query = db.sinhvien.AsNoTracking().AsQueryable();

            if (sv.id_lop != 0)
            {
                query = query.Where(x => x.id_lop == sv.id_lop);
            }

            if (!string.IsNullOrEmpty(sv.searchTerm))
            {
                string keyword = sv.searchTerm.ToLower();
                query = query.Where(x =>
                    x.hovaten.ToLower().Contains(keyword) ||
                    x.ma_sv.ToLower().Contains(keyword) ||
                    x.lop.ma_lop.ToLower().Contains(keyword) ||
                    x.diachi.ToLower().Contains(keyword) ||
                    x.phai.ToLower().Contains(keyword) ||
                    x.sodienthoai.Contains(keyword));
            }

            int totalRecords = await query.CountAsync();

            var pagedData = await query
                .OrderBy(x => x.id_sv)
                .Skip((sv.page - 1) * sv.pageSize)
                .Take(sv.pageSize)
                .Select(x => new
                {
                    x.id_sv,
                    ma_lop = x.lop.ma_lop,
                    x.ma_sv,
                    x.hovaten,
                    x.ngaysinh,
                    x.sodienthoai,
                    x.diachi,
                    x.phai,
                    x.ngaycapnhat,
                    x.ngaytao,
                    x.description
                })
                .ToListAsync();

            var getData = pagedData.Select(x => new
            {
                x.id_sv,
                x.ma_lop,
                x.ma_sv,
                x.hovaten,
                ngaysinh = x.ngaysinh?.ToString("dd-MM-yyyy") ?? " ",
                sodienthoai = x.sodienthoai ?? " ",
                diachi = x.diachi ?? " ",
                phai = x.phai ?? " ",
                x.ngaycapnhat,
                x.ngaytao,
                description = x.description ?? " "
            }).ToList();

            return Ok(new
            {
                data = getData,
                success = true,
                totalRecords = totalRecords,
                totalPages = (int)Math.Ceiling((double)totalRecords / sv.pageSize),
                currentPage = sv.page
            });

        }
        public class Data_SV
        {
            public int id_lop { get; set; }
            public int page { get; set; }
            public int pageSize { get; set; }
            public string searchTerm { get; set; }
        }

        [HttpPost]
        [Route("them-moi-nguoi-hoc")]
        public IHttpActionResult add_new([FromBody] sinhvien sv)
        {
            if (string.IsNullOrEmpty(sv.ma_sv))
            {
                return Ok(new { message = "Không được bỏ trống mã người học", success = false });
            }
            if (string.IsNullOrEmpty(sv.hovaten))
            {
                return Ok(new { message = "Không được bỏ trống tên người học", success = false });
            }
            if (db.sinhvien.FirstOrDefault(x => x.id_sv == sv.id_sv) != null)
            {
                return Ok(new { message = "Mã người học này đã tồn tại", success = false });
            }
            var add_new = new sinhvien
            {
                ma_sv = sv.ma_sv,
                hovaten = sv.hovaten,
                id_lop = sv.id_lop,
                ngaysinh = sv.ngaysinh,
                sodienthoai = sv.sodienthoai,
                diachi = sv.diachi,
                phai = sv.phai,
                description = sv.description,
                ngaytao = unixTimestamp,
                ngaycapnhat = unixTimestamp
            };
            db.sinhvien.Add(add_new);
            db.SaveChanges();
            return Ok(new { message = "Cập nhật dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("get-info-nguoi-hoc")]
        public async Task<IHttpActionResult> get_info([FromBody] sinhvien sv)
        {
            var get_info = await db.sinhvien
                .Where(x => x.id_sv == sv.id_sv)
                .Select(x => new
                {
                    x.id_lop,
                    x.ma_sv,
                    x.hovaten,
                    x.ngaysinh,
                    x.sodienthoai,
                    x.diachi,
                    x.phai,
                    x.description,
                }).SingleOrDefaultAsync();
            return Ok(get_info);
        }
        [HttpPost]
        [Route("update-nguoi-hoc")]
        public IHttpActionResult update_nguoi_hoc([FromBody] sinhvien sv)
        {
            var get_data = db.sinhvien.SingleOrDefault(x => x.id_sv == sv.id_sv);
            if (string.IsNullOrEmpty(sv.ma_sv))
            {
                return Ok(new { message = "Không được bỏ trống mã người học", success = false });
            }
            if (string.IsNullOrEmpty(sv.hovaten))
            {
                return Ok(new { message = "Không được bỏ trống tên người học", success = false });
            }
            get_data.id_lop = sv.id_lop;
            get_data.ma_sv = sv.ma_sv;
            get_data.hovaten = sv.hovaten;
            get_data.ngaysinh = sv.ngaysinh;
            get_data.sodienthoai = sv.sodienthoai;
            get_data.diachi = sv.diachi;
            get_data.phai = sv.phai;
            get_data.description = sv.description;
            get_data.ngaycapnhat = unixTimestamp;
            db.SaveChanges();
            return Ok(new { message = "Cập nhật dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("delete-nguoi-hoc")]
        public IHttpActionResult delete_nguoi_hoc([FromBody] sinhvien sv)
        {
            var check_danh_sach_khao_sat = db.nguoi_hoc_khao_sat.Where(x => x.id_sv == sv.id_sv).ToList();
            if (check_danh_sach_khao_sat.Any())
            {
                db.nguoi_hoc_khao_sat.RemoveRange(check_danh_sach_khao_sat);
                db.SaveChanges();
            }

            var check_nguoi_hoc = db.sinhvien.SingleOrDefault(x => x.id_sv == sv.id_sv);
            if (check_nguoi_hoc != null)
            {
                db.sinhvien.Remove(check_nguoi_hoc);
                db.SaveChanges();
            }
            return Ok(new { message = "Xóa dữ liệu thành công" });
        }
        [HttpPost]
        [Route("upload-excel-nguoi-hoc")]
        public async Task<IHttpActionResult> UploadExcelNguoiHoc()
        {
            var provider = new MultipartMemoryStreamProvider();
            await Request.Content.ReadAsMultipartAsync(provider);
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            foreach (var file in provider.Contents)
            {
                var fileName = file.Headers.ContentDisposition.FileName.Trim('\"');
                var fileStream = await file.ReadAsStreamAsync();

                if (!fileName.EndsWith(".xlsx") && !fileName.EndsWith(".xls"))
                    return Ok(new { message = "Chỉ hỗ trợ upload file Excel.", success = false });

                using (var package = new ExcelPackage(fileStream))
                {
                    var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null)
                        return Ok(new { status = "Không tìm thấy worksheet trong file Excel", success = false });

                    // Load dữ liệu lớp và sinh viên vào bộ nhớ
                    var allLops = await db.lop.ToListAsync();
                    var allSinhViens = await db.sinhvien.ToListAsync();

                    var newSinhViens = new List<sinhvien>();

                    for (int row = 2; row <= worksheet.Dimension.End.Row; row++)
                    {
                        var masv = worksheet.Cells[row, 2].Text?.Trim();
                        var hoten = worksheet.Cells[row, 3].Text?.Trim();
                        var tenlop = worksheet.Cells[row, 4].Text?.Trim();
                        var ngaysinhText = worksheet.Cells[row, 5].Text?.Trim();
                        var sodienthoai = worksheet.Cells[row, 6].Text?.Trim();
                        var diachi = worksheet.Cells[row, 7].Text?.Trim();
                        var gioitinh = worksheet.Cells[row, 8].Text?.Trim();
                        var mota = worksheet.Cells[row, 9].Text?.Trim();

                        DateTime? ngaysinh = null;
                        if (!string.IsNullOrWhiteSpace(ngaysinhText))
                        {
                            if (!DateTime.TryParseExact(ngaysinhText, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
                            {
                                return Ok(new { message = $"Ngày sinh không đúng định dạng ở dòng {row}. Vui lòng kiểm tra.", success = false });
                            }
                            ngaysinh = parsedDate;
                        }

                        var checkLop = allLops.FirstOrDefault(x => x.ma_lop.Equals(tenlop, StringComparison.OrdinalIgnoreCase));
                        if (checkLop == null)
                        {
                            return Ok(new { message = $"Lớp '{tenlop}' không tồn tại ở dòng {row}.", success = false });
                        }

                        var existingSV = allSinhViens.FirstOrDefault(x => x.ma_sv == masv);
                        if (existingSV != null)
                        {
                            existingSV.hovaten = hoten;
                            existingSV.ngaysinh = ngaysinh;
                            existingSV.sodienthoai = sodienthoai ?? "";
                            existingSV.diachi = diachi ?? "";
                            existingSV.phai = gioitinh ?? "";
                            existingSV.description = mota ?? "";
                            existingSV.ngaycapnhat = unixTimestamp;
                        }
                        else
                        {
                            var newSV = new sinhvien
                            {
                                id_lop = checkLop.id_lop,
                                ma_sv = masv,
                                hovaten = hoten,
                                ngaysinh = ngaysinh,
                                sodienthoai = sodienthoai ?? "",
                                diachi = diachi ?? "",
                                phai = gioitinh ?? "",
                                description = mota ?? "",
                                ngaytao = unixTimestamp,
                                ngaycapnhat = unixTimestamp
                            };
                            newSinhViens.Add(newSV);
                        }
                    }

                    if (newSinhViens.Any())
                        db.sinhvien.AddRange(newSinhViens);
                    await db.SaveChangesAsync();
                    return Ok(new { message = "Import dữ liệu thành công", success = true });
                }
            }

            return Ok(new { message = "Vui lòng chọn file Excel.", success = false });
        }
        [HttpPost]
        [Route("export-excel-danh-sach-nguoi-hoc")]
        public async Task<HttpResponseMessage> export_excel_info([FromBody] Data_SV sv)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (ExcelPackage package = new ExcelPackage())
            {
                ExcelWorksheet worksheet = package.Workbook.Worksheets.Add("Survey Data");


                var get_data = await db.sinhvien
                    .Where(x => sv.id_lop == 0 || x.id_lop == sv.id_lop)
                    .Select(x => new
                    {
                        x.id_sv,
                        ma_lop = x.lop.ma_lop,
                        x.ma_sv,
                        x.hovaten,
                        x.ngaysinh,
                        x.sodienthoai,
                        x.diachi,
                        x.phai,
                        x.description
                    })
                    .ToListAsync();

                string[] columnNames = {
                            "STT", "ID Người học","Mã người học", "Tên người học","Mã lớp" ,"Ngày sinh",
                            "Số điện thoại", "Địa chỉ", "Giới tính", "Mô tả"
                        };

                for (int i = 0; i < columnNames.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = columnNames[i];
                }
                using (var range = worksheet.Cells[1, 1, 1, columnNames.Length])
                {
                    range.Style.Font.Name = "Times New Roman"; // Thêm font chữ Times New Roman
                    range.Style.Font.Size = 13; // Cài đặt cỡ chữ là 13
                    range.Style.Font.Bold = true; // Đặt chữ in đậm
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid; // Kiểu nền ô
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.White); // Màu nền ô
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center; // Căn giữa văn bản
                    range.Style.VerticalAlignment = ExcelVerticalAlignment.Center; // Căn giữa theo chiều dọc

                    // Kẻ viền toàn bộ ô trong phạm vi range
                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin; // Viền trên
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin; // Viền trái
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin; // Viền phải
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin; // Viền dưới

                    // Kẻ viền cho tất cả các ô trong phạm vi
                    range.Style.Border.Top.Color.SetColor(System.Drawing.Color.Black); // Màu viền trên
                    range.Style.Border.Left.Color.SetColor(System.Drawing.Color.Black); // Màu viền trái
                    range.Style.Border.Right.Color.SetColor(System.Drawing.Color.Black); // Màu viền phải
                    range.Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Black); // Màu viền dưới

                }
                int totalRows = get_data.Count;
                object[,] dataArray = new object[totalRows, 10];

                for (int i = 0; i < totalRows; i++)
                {
                    var item = get_data[i];
                    dataArray[i, 0] = i + 1;
                    dataArray[i, 1] = item.id_sv;
                    dataArray[i, 2] = item.ma_sv;
                    dataArray[i, 3] = item.hovaten;
                    dataArray[i, 4] = item.ma_lop;
                    dataArray[i, 5] = item.ngaysinh?.ToString("dd/MM/yyyy");
                    dataArray[i, 6] = item.sodienthoai;
                    dataArray[i, 7] = item.diachi;
                    dataArray[i, 8] = item.phai;
                    dataArray[i, 9] = item.description;
                }

                // Ghi toàn bộ mảng vào Excel
                worksheet.Cells[2, 1].LoadFromArrays(ToJaggedArray(dataArray));
                worksheet.Cells.AutoFitColumns();
                var stream = new MemoryStream();
                package.SaveAs(stream);
                stream.Position = 0;

                var result = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new ByteArrayContent(stream.ToArray())
                };
                result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                {
                    FileName = "Danh_sach_nguoi_hoc.xlsx"
                };
                return result;
            }
        }
        private static object[][] ToJaggedArray(object[,] twoDimensionalArray)
        {
            int rows = twoDimensionalArray.GetLength(0);
            int cols = twoDimensionalArray.GetLength(1);
            object[][] jagged = new object[rows][];
            for (int i = 0; i < rows; i++)
            {
                jagged[i] = new object[cols];
                for (int j = 0; j < cols; j++)
                {
                    jagged[i][j] = twoDimensionalArray[i, j];
                }
            }
            return jagged;
        }

    }
}
