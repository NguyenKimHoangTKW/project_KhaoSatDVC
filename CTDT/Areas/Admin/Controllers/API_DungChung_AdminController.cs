using CTDT.Models;
using GoogleApi.Entities.Maps.AddressValidation.Request;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace CTDT.Areas.Admin.Controllers
{
    [Authorize(Roles = "2")]
    [RoutePrefix("api/v1/admin")]
    public class API_DungChung_AdminController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
       
        #region Danh sách hình ảnh
        [HttpGet]
        [Route("danh-sach-hinh-anh")]
        public IHttpActionResult load_hinh_anh()
        {
            string imageFolder = HttpContext.Current.Server.MapPath("~/Style/assets/logo_interface/");
            var imageFiles = Directory.GetFiles(imageFolder)
                                      .Select(Path.GetFileName)
                                      .ToList();
            if (imageFiles.Count > 0)
            {
                return Ok(new { data = imageFiles, success = true });
            }
            else
            {
                return Ok(new { message = "Không có dữ liệu hình ảnh", success = false });
            }
        }
        [HttpPost]
        [Route("upload-hinh-anh")]
        public IHttpActionResult UploadHinhAnh()
        {
            var httpRequest = HttpContext.Current.Request;
            if (httpRequest.Files.Count == 0)
                return Ok(new { message = "Không có file nào được gửi lên.", success = false });

            var postedFile = httpRequest.Files[0];
            string originalFileName = Path.GetFileName(postedFile.FileName);
            string fileExtension = Path.GetExtension(originalFileName)?.ToLower();

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            if (!allowedExtensions.Contains(fileExtension))
            {
                return Ok(new { message = "Định dạng không hợp lệ. Chỉ cho phép: .jpg, .jpeg, .png, .gif", success = false });
            }

            string folderPath = HttpContext.Current.Server.MapPath("~/Style/assets/logo_interface/");
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
            string timeStamp = DateTime.Now.ToString("yyyyMMdd_HHmmssfff");
            string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
            string newFileName = $"{fileNameWithoutExtension}_{timeStamp}{fileExtension}";
            string fullPath = Path.Combine(folderPath, newFileName);
            postedFile.SaveAs(fullPath);
            return Ok(new { success = true, fileName = newFileName });
        }

        [HttpDelete]
        [Route("xoa-hinh-anh")]
        public IHttpActionResult XoaHinhAnh(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return Ok(new { message = "Tên file không hợp lệ.", success = false });

            var folderPath = HttpContext.Current.Server.MapPath("~/Style/assets/logo_interface/");
            var fullPath = Path.Combine(folderPath, fileName);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return Ok(new { message = "Xóa hình ảnh thành công", success = true });
            }
            else
            {
                return NotFound();
            }
        }
        #endregion
        #region Banner
        [HttpGet]
        [Route("danh-sach-banner")]
        public async Task<IHttpActionResult> danh_sach_banner()
        {
            var ListData = await db.Banner
                .Select(x => new
                {
                    x.id_banner,
                    x.img_banner,
                    x.is_open
                })
                .ToListAsync();
            if (ListData.Count > 0)
            {
                return Ok(new { data = ListData, success = true });
            }
            else
            {
                return Ok(new { message = "Không tìm thấy dữ liệu hình ảnh Banner", success = false });
            }
        }
        [HttpPost]
        [Route("them-moi-banner")]
        public async Task<IHttpActionResult> them_moi_banner(Banner banner)
        {
            if (string.IsNullOrEmpty(banner.img_banner))
            {
                return Ok(new { message = "Không được bỏ trống hình ảnh Banner", success = false });
            }
            db.Banner.Add(banner);
            await db.SaveChangesAsync();
            return Ok(new { message = "Thêm mới Banner thành công", success = true });
        }
        [HttpPost]
        [Route("info-banner")]
        public async Task<IHttpActionResult> get_info(Banner banner)
        {
            var check_banner = await db.Banner.FirstOrDefaultAsync(x => x.id_banner == banner.id_banner);
            var ListData = new List<object>();
            if (check_banner == null)
            {
                return Ok(new { message = "Không tìm thấy thông tin Banner", success = false });
            }

            ListData.Add(new
            {
                check_banner.id_banner,
                check_banner.img_banner,
                check_banner.is_open
            });
            return Ok(new { data = ListData, success = true });
        }
        [HttpPost]
        [Route("update-banner")]
        public async Task<IHttpActionResult> update_banner(Banner banner)
        {
            var check_banner = await db.Banner.FirstOrDefaultAsync(x => x.id_banner == banner.id_banner);
            if (check_banner == null)
            {
                return Ok(new { message = "Không tìm thấy thông tin Banner", success = false });
            }
            else
            {
                check_banner.img_banner = banner.img_banner;
                check_banner.is_open = banner.is_open;
            }
            await db.SaveChangesAsync();
            return Ok(new { message = "Cập nhật Banner thành công", success = true });
        }
        [HttpPost]
        [Route("delete-banner")]
        public async Task<IHttpActionResult> delete_banner(Banner banner)
        {
            var check_banner = await db.Banner.FirstOrDefaultAsync(x => x.id_banner == banner.id_banner);
            if (check_banner == null)
            {
                return Ok(new { message = "Không tìm thấy thông tin Banner", success = false });
            }
            else
            {
                db.Banner.Remove(check_banner);
            }
            await db.SaveChangesAsync();
            return Ok(new { message = "Xóa Banner thành công", success = true });
        }
        #endregion

        [HttpGet]
        [Route("danh-sach-navbar")]
        public async Task<IHttpActionResult> danh_sach_navbar()
        {
            var list_nav = await db.NavBar
                .OrderBy(x => x.thu_tu_hien_thi)
                .Select(x => new
                {
                    x.id_navbar,
                    x.thu_tu_hien_thi,
                    x.name_navbar,
                    x.link_navbar,
                    x.is_open
                })
                .ToListAsync();
            if (list_nav.Count > 0)
            {
                return Ok(new { data = list_nav, success = true });

            }
            else
            {
                return Ok(new { message = "Không có dữ liệu Navbar", success = false });
            }
        }
        [HttpPost]
        [Route("them-moi-navbar")]
        public async Task<IHttpActionResult> them_moi_navbar(NavBar nav)
        {
            if (string.IsNullOrEmpty(nav.name_navbar))
            {
                return Ok(new { message = "Không được bỏ trống tên Navbar", success = false });
            }
            if (string.IsNullOrEmpty(nav.link_navbar))
            {
                return Ok(new { message = "Không được bỏ trống tên link điều hướng Navbar", success = false });
            }
            db.NavBar.Add(nav);
            await db.SaveChangesAsync();
            return Ok(new { message = "Thêm mới Navbar thành công", success = true });
        }

        [HttpPost]
        [Route("info-navbar")]
        public async Task<IHttpActionResult> info_navbar(NavBar nav)
        {
            var check_navbar = await db.NavBar.FirstOrDefaultAsync(x => x.id_navbar == nav.id_navbar);
            var list_data = new List<object>();
            if (check_navbar == null)
            {
                return Ok(new { message = "Không tìm thấy thông tin Navbar", success = false });
            }
            else
            {
                list_data.Add(new
                {
                    check_navbar.name_navbar,
                    check_navbar.thu_tu_hien_thi,
                    check_navbar.link_navbar,
                    check_navbar.is_open
                });
                return Ok(new { data = list_data, success = true });
            }
        }
        [HttpPost]
        [Route("update-navbar")]
        public async Task<IHttpActionResult> update_navbar(NavBar nav)
        {
            if (string.IsNullOrEmpty(nav.name_navbar))
            {
                return Ok(new { message = "Không được bỏ trống tên Navbar", success = false });
            }
            if (string.IsNullOrEmpty(nav.link_navbar))
            {
                return Ok(new { message = "Không được bỏ trống tên link điều hướng Navbar", success = false });
            }
            var check_navbar = await db.NavBar.FirstOrDefaultAsync(x => x.id_navbar == nav.id_navbar);
            if (check_navbar == null)
            {
                return Ok(new { message = "Không tìm thấy thông tin Navbar", success = false });
            }
            else
            {
                check_navbar.name_navbar = nav.name_navbar;
                check_navbar.thu_tu_hien_thi = nav.thu_tu_hien_thi;
                check_navbar.link_navbar = nav.link_navbar;
                check_navbar.is_open = nav.is_open;
            }
            await db.SaveChangesAsync();
            return Ok(new { message = "Cập nhật Navbar thành công", success = true });
        }
        [HttpPost]
        [Route("delete-navbar")]
        public async Task<IHttpActionResult> delete_navbar(NavBar nav)
        {
            var check_navbar = await db.NavBar.FirstOrDefaultAsync(x => x.id_navbar == nav.id_navbar);
            if (check_navbar == null)
            {
                return Ok(new { message = "Không tìm thấy thông tin Navbar", success = false });
            }
            else
            {
                db.NavBar.Remove(check_navbar);
            }
            await db.SaveChangesAsync();
            return Ok(new { message = "Xóa Navbar thành công", success = true });
        }

    }
}
