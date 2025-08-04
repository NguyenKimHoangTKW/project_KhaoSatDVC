using CTDT.Helper;
using CTDT.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace CTDT.Controllers
{
    public class AccountAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        [HttpPost]
        [Route("api/session_login")]
        public async Task<IHttpActionResult> Login_Google([FromBody] users us)
        {
            DateTime now = DateTime.UtcNow;
            int unixTimestamp = (int)(now.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            var user = await db.users.FirstOrDefaultAsync(x => x.email == us.email);
            var username = us.email.Split('@')[0];

            if (user == null)
            {
                user = new users
                {
                    email = us.email,
                    firstName = us.firstName,
                    lastName = us.lastName,
                    avatarUrl = us.avatarUrl,
                    ngaycapnhat = unixTimestamp,
                    ngaytao = unixTimestamp,
                    dang_nhap_lan_cuoi = unixTimestamp,
                    id_typeusers = 1
                };
                db.users.Add(user);
            }
            else
            {
                user.firstName = us.firstName;
                user.lastName = us.lastName;
                user.avatarUrl = us.avatarUrl;
                user.dang_nhap_lan_cuoi = unixTimestamp;
            }

            await db.SaveChangesAsync();

            var token = JwtManager.GenerateToken(us.email, user.id_typeusers.ToString());

            var cookie = new HttpCookie("access_token", token)
            {
                HttpOnly = true,
                Secure = true, 
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(60)
            };
            HttpContext.Current.Response.Cookies.Add(cookie);

            SessionHelper.SetUser(user);

            return Ok(new
            {
                islogin = true,
                message = "Đăng nhập thành công",
                success = true
            });
        }
        [HttpGet]
        [Route("api/check-session")]
        public IHttpActionResult CheckSession()
        {
            var user = SessionHelper.GetUser();
            if (user == null)
            {
                return Ok(new { alive = false });
            }
            return Ok(new { alive = true });
        }

        [HttpPost]
        [Route("api/clear_session")]
        public IHttpActionResult Logout()
        {
            SessionHelper.ClearUser();

            var expiredCookie = new HttpCookie("access_token", "")
            {
                Expires = DateTime.UtcNow.AddDays(-1),
                HttpOnly = true,
                Secure = true, 
                SameSite = SameSiteMode.Strict 
            };

            HttpContext.Current.Response.Cookies.Add(expiredCookie);

            return Ok(new { success = true, message = "Đăng xuất thành công" });
        }

    }
}
