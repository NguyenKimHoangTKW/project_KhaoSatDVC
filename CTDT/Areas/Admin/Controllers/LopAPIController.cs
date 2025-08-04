using CTDT.Models;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace CTDT.Areas.Admin.Controllers
{
    [Authorize(Roles = "2")]
    [RoutePrefix("api/v1/admin")]
    public class LopAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        private int unixTimestamp;
        public LopAPIController()
        {
            DateTime now = DateTime.UtcNow;
            unixTimestamp = (int)(now.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
        }
        [HttpPost]
        [Route("danh-sach-lop")]
        public async Task<IHttpActionResult> danh_sach_lop([FromBody] lop lop)
        {
            var query = db.lop.AsQueryable();
            if (lop.id_ctdt != 0)
            {
                query = query.Where(x => x.id_ctdt == lop.id_ctdt);
            }
            var get_data = await query
                .Select(x => new
                {
                    x.id_lop,
                    x.ma_lop,
                    x.ctdt.ten_ctdt,
                    x.ngaytao,
                    x.ngaycapnhat,
                    x.status
                }).ToListAsync();
            if (get_data.Any())
            {
                return Ok(new { data = get_data, success = true });
            }
            else
            {
                return Ok(new { message = "Chưa có dữ liệu tồn tại", success = false });
            }
        }
        [HttpPost]
        [Route("them-moi-lop")]
        public IHttpActionResult them_moi_lop([FromBody] lop lop)
        {
            if (string.IsNullOrEmpty(lop.ma_lop))
            {
                return Ok(new { message = "Không được bỏ trống tên lớp", success = false });
            }
            var add_new = new lop
            {
                ma_lop = lop.ma_lop,
                id_ctdt = lop.id_ctdt,
                ngaytao = unixTimestamp,
                ngaycapnhat = unixTimestamp,
                status = true
            };
            db.lop.Add(add_new);
            db.SaveChanges();
            return Ok(new { message = "Cập nhật dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("get-info-lop")]
        public async Task<IHttpActionResult> get_info_lop([FromBody] lop lop)
        {
            var get_info = await db.lop
                .Where(x => x.id_lop == lop.id_lop)
                .Select(x => new
                {
                    x.ma_lop,
                    x.id_ctdt,
                }).FirstOrDefaultAsync();
            return Ok(get_info);
        }
        [HttpPost]
        [Route("update-lop")]
        public IHttpActionResult update_lop([FromBody] lop lop)
        {
            var check_lop = db.lop.FirstOrDefault(x => x.id_lop == lop.id_lop);
            if (string.IsNullOrEmpty(lop.ma_lop))
            {
                return Ok(new { message = "Không được bỏ trống tên lớp", success = false });
            }
            check_lop.ma_lop = lop.ma_lop;
            check_lop.id_ctdt = lop.id_ctdt;
            check_lop.ngaycapnhat = unixTimestamp;
            db.SaveChanges();
            return Ok(new { message = "Cập nhật dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("delete-lop")]
        public IHttpActionResult delete_lop([FromBody] lop lop)
        {
            var check_sinh_vien = db.sinhvien.Where(x => x.id_lop == lop.id_lop).ToList();
            if (check_sinh_vien.Any())
            {
                return Ok(new { message = "Lớp này đang tồn tại người học, vui lòng kiểm tra hoặc xóa người học trong lớp này để xóa lớp", success = false });
            }
            var check_lop = db.lop.FirstOrDefault(x => x.id_lop == lop.id_lop);
            db.lop.Remove(check_lop);
            db.SaveChanges();
            return Ok(new { message = "Xóa dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("upload-excel-lop")]
        public async Task<IHttpActionResult> UploadExcelLop()
        {

            var provider = new MultipartMemoryStreamProvider();
            await Request.Content.ReadAsMultipartAsync(provider);

            foreach (var file in provider.Contents)
            {
                var fileName = file.Headers.ContentDisposition.FileName.Trim('\"');
                var fileStream = await file.ReadAsStreamAsync();

                if (fileName.EndsWith(".xlsx") || fileName.EndsWith(".xls"))
                {
                    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                    using (var package = new ExcelPackage(fileStream))
                    {
                        var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                        if (worksheet == null)
                        {
                            return Ok(new { status = "Không tìm thấy worksheet trong file Excel", success = false });
                        }
                        var allCTDT = await db.ctdt.ToListAsync();
                        var newLop = new List<lop>();

                        for (int row = 2; row <= worksheet.Dimension.End.Row; row++)
                        {
                            DateTime? ngaysinh = null;

                            var MaLop = worksheet.Cells[row, 2].Text;
                            var CTDT = worksheet.Cells[row, 3].Text;
                            var checkCTDT =allCTDT.FirstOrDefault(x => x.ten_ctdt.ToLower().Trim() == CTDT.ToLower().Trim());
                            if (checkCTDT == null)
                            {
                                return Ok(new { message = $"CTĐT {CTDT} không tồn tại hoặc sai định dạng, vui lòng kiểm tra lại!", success = false });
                            }

                            var CheckLop = await db.lop.FirstOrDefaultAsync(x => x.ma_lop.ToLower().Trim() == MaLop.ToLower().Trim());
                            if (CheckLop == null)
                            {
                                var new_lop = new lop
                                {
                                    id_ctdt = checkCTDT.id_ctdt,
                                    ma_lop = MaLop.ToUpper(),
                                    ngaycapnhat = unixTimestamp,
                                    ngaytao = unixTimestamp,
                                    status = true
                                };
                                newLop.Add(new_lop);
                            }
                            else
                            {
                                CheckLop.id_ctdt = checkCTDT.id_ctdt;
                                CheckLop.ngaycapnhat = unixTimestamp;
                            }
                        }
                        if (newLop.Any())
                        {
                            db.lop.AddRange(newLop);
                        }
                        await db.SaveChangesAsync();
                        return Ok(new { message = "Import dữ liệu thành công", success = true });
                    }
                }
                else
                {
                    return Ok(new { message = "Chỉ hỗ trợ upload file Excel.", success = false });
                }
            }
            return Ok(new { message = "Vui lòng chọn file Excel.", success = false });
        }
    }
}
