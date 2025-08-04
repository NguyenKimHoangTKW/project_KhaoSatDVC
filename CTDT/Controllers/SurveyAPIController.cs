using CTDT.Helper;
using CTDT.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Globalization;
using System.Linq;
using System.Management;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace CTDT.Controllers
{
    [Authorize]
    [RoutePrefix("api/v1/user")]
    public class SurveyAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        private users user;
        private int unixTimestamp;

        public SurveyAPIController()
        {
            user = SessionHelper.GetUser();
            DateTime now = DateTime.UtcNow;
            unixTimestamp = (int)(now.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
        }
        public class SaveXacThuc
        {
            public int surveyID { get; set; }
            public int id_ctdt { get; set; }
            public string ma_vien_chuc { get; set; }
            public string ten_vien_chuc { get; set; }
        }
        [HttpPost]
        [Route("load_form_phieu_khao_sat")]
        public async Task<IHttpActionResult> load_phieu_khao_sat([FromBody] SaveXacThuc sxt)
        {
            var user = SessionHelper.GetUser();
            var domainGmail = user.email.Split('@')[1];
            var ms_nguoi_hoc = user.email.Split('@')[0];
            var get_data = await db.survey.FirstOrDefaultAsync(x => x.surveyID == sxt.surveyID);
            var js_data = get_data.surveyData;
            if (get_data.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học" || get_data.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
            {
                var get_value = (int)HttpContext.Current.Session["id_nghoc_ks"];
                var nguoi_hoc_khao_sat = await db.nguoi_hoc_khao_sat
                    .Where(x => x.id_nguoi_hoc_khao_sat == get_value)
                    .Select(x => new
                    {
                        ma_nh = x.sinhvien.ma_sv,
                        ten_nh = x.sinhvien.hovaten,
                        thuoc_lop = x.sinhvien.lop.ma_lop,
                        thuoc_ctdt = x.sinhvien.lop.ctdt.ten_ctdt,
                        thuoc_don_vi = x.sinhvien.lop.ctdt.khoa_vien_truong.ten_khoa,
                        mo_ta = x.sinhvien.description
                    })
                    .FirstOrDefaultAsync();
                return Ok(new { data = js_data, info = JsonConvert.SerializeObject(nguoi_hoc_khao_sat), success = true, is_nh = true });
            }
            return Ok(new { message = "Vui lòng xác thực để thực hiện khảo sát" });
        }
        [HttpPost]
        [Route("save_form_khao_sat")]
        public async Task<IHttpActionResult> save_form([FromBody] SaveForm saveForm)
        {
            var user = SessionHelper.GetUser();
            var domainGmail = user.email.Split('@')[1];
            var ms_nguoi_hoc = user.email.Split('@')[0];
            DateTime now = DateTime.UtcNow;
            int unixTimestamp = (int)(now.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            var survey = await db.survey.FirstOrDefaultAsync(x => x.surveyID == saveForm.idsurvey);
            answer_response aw = null;
            if (survey == null)
            {
                return Ok(new { message = "Biểu mẫu không tồn tại", success = false });
            }

            if (ModelState.IsValid)
            {
                 if (survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học" || survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
                {
                    var get_value = (int)HttpContext.Current.Session["id_nghoc_ks"];
                    var nguoi_hoc = await db.nguoi_hoc_khao_sat
                        .FirstOrDefaultAsync(x => x.surveyID == saveForm.idsurvey && x.id_nguoi_hoc_khao_sat == get_value);
                    aw = new answer_response()
                    {
                        time = unixTimestamp,
                        id_users = user.id_users,
                        id_namhoc = survey.id_namhoc,
                        id_nguoi_hoc_khao_sat = nguoi_hoc.id_nguoi_hoc_khao_sat,
                        surveyID = survey.surveyID,
                        json_answer = saveForm.json_answer
                    };
                    nguoi_hoc.is_khao_sat = 1;
                }
                db.answer_response.Add(aw);
                await db.SaveChangesAsync();
                HttpContext.Current.Session.Remove("id_nghoc_ks");
                HttpContext.Current.Session.Remove("id_user");
                return Ok(new { success = true, message = "Khảo sát thành công" });
            }
            return Ok(new { message = "Đã quá thời gian thực hiện khảo sát, nghi vấn treo máy, vui lòng đăng nhập và thử lại", success = false });
        }
        [HttpPost]
        [Route("load_dap_an_pks")]
        public async Task<IHttpActionResult> load_answer_phieu_khao_sat([FromBody] LoadAnswerPKS loadAnswerPKS)
        {
            var answer_responses = await db.answer_response
                .FirstOrDefaultAsync(x => x.id == loadAnswerPKS.id_answer && x.surveyID == loadAnswerPKS.id_survey);
            var list_info = new List<dynamic>();
            if (answer_responses.survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học" || answer_responses.survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
            {
                var data_hoc_vien = new
                {
                    phieu_khao_sat = answer_responses.survey.surveyData,
                    dap_an = answer_responses.json_answer
                };
                list_info.Add(new
                {
                    ten_nh = answer_responses.nguoi_hoc_khao_sat.sinhvien.hovaten,
                    ma_nh = answer_responses.nguoi_hoc_khao_sat.sinhvien.ma_sv,
                    thuoc_lop = answer_responses.nguoi_hoc_khao_sat.sinhvien.lop.ma_lop,
                    thuoc_ctdt = answer_responses.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.ten_ctdt,
                    thuoc_don_vi = answer_responses.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.khoa_vien_truong.ten_khoa,
                    mo_ta = answer_responses.nguoi_hoc_khao_sat.sinhvien.description,
                    khao_sat_lan_cuoi = answer_responses.time
                });
                return Ok(new { data = data_hoc_vien, info = JsonConvert.SerializeObject(list_info), success = true, is_nh = true });
            }        
            return Ok(new { message = "Không thể xác thực, vui lòng thử lại sau", success = false });
        }
        [HttpPost]
        [Route("save_answer_form")]
        public async Task<IHttpActionResult> save_answer_form([FromBody] answer_response aw)
        {
            var user = SessionHelper.GetUser();
            var status = "";
            var answer = await db.answer_response.FindAsync(aw.id);
            var survey = await db.answer_response.FirstOrDefaultAsync(x => x.id == answer.id);
            DateTime now = DateTime.UtcNow;
            int unixTimestamp = (int)(now.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            if (answer != null)
            {
                answer.json_answer = aw.json_answer;
                answer.time = unixTimestamp;
                await db.SaveChangesAsync();
                status = "Cập nhật phiếu khảo sát thành công";
            }
            else
            {
                status = "Cập nhật phiếu khảo sát thất bại";
            }
            return Ok(new { message = status });
        }
        [HttpPost]
        [Route("load_bo_phieu_da_khao_sat")]
        public async Task<IHttpActionResult> load_bo_phieu_da_khao_sat([FromBody] FindPKSisSurvey findPKSisSurvey)
        {
            var user = SessionHelper.GetUser();
            var get_answer_survey = await db.answer_response
                .Where(x => x.id_users == user.id_users)
                .Select(x => x.surveyID)
                .Distinct()
                .ToListAsync();
            var get_survey = await db.survey
                .Where(x => get_answer_survey.Contains(x.surveyID)
                && x.id_hedaotao == findPKSisSurvey.hedaotao
                && x.id_namhoc == findPKSisSurvey.namhoc)
                .ToListAsync();
            var surveyList = new List<dynamic>();
            foreach (var item in get_survey)
            {
                var query = db.answer_response
                    .Where(x => x.id_users == user.id_users && x.surveyID == item.surveyID)
                    .AsQueryable();
                var bo_phieu = new List<dynamic>();
                var check_loai = new List<dynamic>();
                if (item.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học")
                {
                    bo_phieu.AddRange(query
                        .AsEnumerable()
                        .Select(x => new
                        {
                            email = user.email,
                            ma_nh = x.id_nguoi_hoc_khao_sat != null ? x.nguoi_hoc_khao_sat.sinhvien.ma_sv : "",
                            ten_nh = x.id_nguoi_hoc_khao_sat != null ? x.nguoi_hoc_khao_sat.sinhvien.hovaten : "",
                            thuoc_lop = x.id_nguoi_hoc_khao_sat != null ? x.nguoi_hoc_khao_sat.sinhvien.lop.ma_lop : "",
                            thuoc_ctdt = x.id_nguoi_hoc_khao_sat != null ? x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.ten_ctdt : "",
                            thoi_gian_khao_sat = x.time,
                            page = unixTimestamp > item.surveyTimeEnd ? "Ngoài thời gian thực hiện khảo sát" : "Chỉnh sửa lại câu trả lời",
                            value_page = unixTimestamp > item.surveyTimeEnd ? "javascript:void(0)" : $"/phieu-khao-sat/dap-an/{x.id}/{x.surveyID}"
                        }).ToList());

                    surveyList.Add(new
                    {
                        ten_phieu = item.surveyTitle,
                        bo_phieu = bo_phieu,
                        is_student = true
                    });
                }
            }
            return Ok(new { data = new { survey = JsonConvert.SerializeObject(surveyList) } });
        }

    }
}
