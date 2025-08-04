using CTDT.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace CTDT.Areas.Admin.Controllers
{
    [Authorize(Roles = "2")]
    [RoutePrefix("api/v1/admin")]
    public class HeDaoTaoAdminAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();

        [HttpGet]
        [Route("danh-sach-he-dao-tao")]
        public async Task<IHttpActionResult> load_data()
        {
            var get_list = await db.hedaotao
                .Select(x => new
                {
                    x.id_hedaotao,
                    x.ten_hedaotao,
                    x.describe,
                    x.image,
                    x.is_open,
                    x.is_statistical
                })
                .ToListAsync();
            if (get_list.Count > 0)
            {
                return Ok(new { data = get_list, success = true });
            }
            else
            {
                return Ok(new { message = "Không có thông tin danh sách hệ đào tạo", success = false });
            }
        }
        [HttpPost]
        [Route("them-moi-he-dao-tao")]
        public async Task<IHttpActionResult> them_moi_he_dao_tao(hedaotao hdt)
        {
            var check_he_dao_tao = await db.hedaotao.FirstOrDefaultAsync(x => x.ten_hedaotao.ToLower().Trim() == hdt.ten_hedaotao.ToLower().Trim());
            if (check_he_dao_tao != null)
            {
                return Ok(new { message = "Hệ đào tạo này đã tồn tại, vui lòng kiểm tra lại", success = false });
            }
            if (string.IsNullOrEmpty(hdt.ten_hedaotao))
            {
                return Ok(new { message = "Không được bỏ trống tên hệ đào tạo", success = false });
            }
            if (string.IsNullOrEmpty(hdt.describe))
            {
                return Ok(new { message = "Không được bỏ trống mô tả", success = false });
            }
            else
            {
                check_he_dao_tao = new hedaotao
                {
                    ten_hedaotao = hdt.ten_hedaotao,
                    describe = hdt.describe,
                    image = hdt.image,
                    is_open = hdt.is_open,
                    is_statistical = hdt.is_statistical
                };
                db.hedaotao.Add(check_he_dao_tao);
            }
            await db.SaveChangesAsync();
            return Ok(new { message = "Thêm mới hệ đào tạo thành công", success = true });
        }

        [HttpPost]
        [Route("info-he-dao-tao")]
        public async Task<IHttpActionResult> info_he_dao_tao(hedaotao hdt)
        {
            var check_he_dao_dao = await db.hedaotao
                .Where(x => x.id_hedaotao == hdt.id_hedaotao)
                .FirstOrDefaultAsync();
            var list_data = new List<dynamic>();
            if (check_he_dao_dao == null)
            {
                return Ok(new { message = "Không tìm thấy thông tin hệ đào tạo", success = false });
            }
            else
            {
                list_data.Add(new
                {
                    check_he_dao_dao.ten_hedaotao,
                    check_he_dao_dao.describe,
                    check_he_dao_dao.image,
                    check_he_dao_dao.is_open,
                    check_he_dao_dao.is_statistical
                });
                return Ok(new { data = list_data, success = true });
            }
        }
        [HttpPost]
        [Route("update-he-dao-tao")]
        public async Task<IHttpActionResult> update_he_dao_tao(hedaotao hdt)
        {
            var check_hdt = await db.hedaotao.FirstOrDefaultAsync(x => x.id_hedaotao == hdt.id_hedaotao);
            if (check_hdt == null)
            {
                return Ok(new { message = "Không tìm thấy thông tin hệ đào tạo", success = false });
            }

            check_hdt.ten_hedaotao = hdt.ten_hedaotao;
            check_hdt.describe = hdt.describe;
            check_hdt.image = hdt.image;
            check_hdt.is_open = hdt.is_open;
            check_hdt.is_statistical = hdt.is_statistical;
            await db.SaveChangesAsync();
            return Ok(new { message = "Update hệ đào tạo thành công", success = true });
        }
        [HttpPost]
        [Route("delete-he-dao-tao")]
        public async Task<IHttpActionResult> delete_he_dao_tao(hedaotao hdt)
        {
            if (hdt.id_hedaotao == null)
            {
                return Ok(new { message = "Không tìm thấy thông tin hệ đào tạo", success = false });
            }
            var check_hdt_by_survey = await db.survey
                .Where(x => x.id_hedaotao == hdt.id_hedaotao)
                .ToListAsync();
            if (check_hdt_by_survey.Any())
            {
                return Ok(new { message = "Đang tồn tại `Hệ đào tạo` trong `Phiếu khảo sát`, vui lòng kiểm tra lại", success = false });
            }
            var check_hdt = await db.hedaotao.FirstOrDefaultAsync(x => x.id_hedaotao == hdt.id_hedaotao);
            db.hedaotao.Remove(check_hdt);
            await db.SaveChangesAsync();
            return Ok(new { message = "Xóa hệ đào tạo thành công", success = true });
        }
    }
}
