using CTDT.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace CTDT.Areas.Admin.Controllers
{
    [RoutePrefix("api/v1/admin")]
    public class NamHocApiAdminController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        [HttpGet]
        [Route("danh-sach-nam")]
        public async Task<IHttpActionResult> LoadYear()
        {
            var LoadYear = await db.NamHoc
                .OrderByDescending(x => x.id_namhoc)
                .Select(x => new
                {
                    x.id_namhoc,
                    x.ten_namhoc
                })
                .ToListAsync();
            return Ok(LoadYear);
        }
    }
}
