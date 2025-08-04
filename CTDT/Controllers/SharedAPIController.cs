using CTDT.Helper;
using CTDT.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace CTDT.Controllers
{
    public class SharedAPIController : ApiController
    {
        private users user;
        public SharedAPIController()
        {
            user = SessionHelper.GetUser();
        }
        dbSurveyEntities db = new dbSurveyEntities();
        
        [HttpPost]
        [Route("api/load_phieu_by_nam")]
        public async Task<IHttpActionResult> load_pks_by_year([FromBody] survey survey)
        {
            var pks = await db.survey
                .Where(x => x.id_namhoc == survey.id_namhoc && x.id_hedaotao == survey.id_hedaotao)
                .Select(x => new
                {
                    id_phieu = x.surveyID,
                    ten_phieu = x.dot_khao_sat.ten_dot_khao_sat != null ? x.surveyTitle + " - " + x.dot_khao_sat.ten_dot_khao_sat : x.surveyTitle,
                })
                .ToListAsync();
            var ctdt = await db.ctdt
                .Where(x => x.id_hdt == survey.id_hedaotao)
                .Select(x => new
                {
                    id_ctdt = x.id_ctdt,
                    ten_ctdt = x.ten_ctdt
                })
                .ToListAsync();
            var sortedPks = pks.OrderBy(p =>
            {
                var match = System.Text.RegularExpressions.Regex.Match(p.ten_phieu, @"Phiếu (\d+)");
                return match.Success ? int.Parse(match.Groups[1].Value) : int.MaxValue;
            }).ToList();

            if (sortedPks.Count > 0)
            {
                return Ok(new { data = sortedPks, ctdt = ctdt, success = true });
            }
            else
            {
                return Ok(new { message = "Không có dữ liệu phiếu khảo sát", success = false });
            }
        }
        [HttpPost]
        [Route("api/v1/phanquyen/load_permission_user")]
        public async Task<IHttpActionResult> load_permission_user()
        {
            var userId = user.id_users;
            var permissionList = await db.phan_quyen_chuc_nang_users
                .Where(x => x.id_users == userId)
                .Select(x => x.chuc_nang_users.ma_chuc_nang)
                .ToListAsync();
            if (permissionList.Any())
            {
                return Ok(new { data = permissionList, success = true });
            }
            else
            {
                return Ok(new { message = "Bạn không có quyền hạn để truy cập vào các chức năng, vui lòng liên hệ với người phụ trách để biết thêm thông tin chi tiết", success = false });
            }
        }
        [HttpGet]
        [Route("api/banner")]
        public async Task<IHttpActionResult> danh_sach_banner()
        {
            var get_data = await db.Banner
                .Where(x => x.is_open == 1)
                .Select(x => new
                {
                    x.img_banner
                })
                .ToListAsync();
            var get_navbar = await db.NavBar
                  .OrderBy(x => x.thu_tu_hien_thi)
                  .Where(x => x.is_open == 1)
                  .Select(x => new
                  {
                      x.name_navbar,
                      x.link_navbar
                  })
                  .ToListAsync();
            if (get_data.Count > 0)
            {
                return Ok(new { data = JsonConvert.SerializeObject(get_data), success = true });
            }
            else
            {
                return Ok(new { data = (object)null, success = false });
            }
        }
    }
}
