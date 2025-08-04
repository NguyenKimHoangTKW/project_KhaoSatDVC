using CTDT.Helper;
using CTDT.Models;
using GoogleApi.Entities.Maps.AerialView.Common;
using Microsoft.Ajax.Utilities;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.NetworkInformation;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.DynamicData;
using System.Web.Http;
using System.Web.Script.Serialization;
using System.Web.Services.Description;
using System.Xml;

namespace CTDT.Controllers
{
    [Authorize]
    [RoutePrefix("api/v1/user")]
    public class XacThucAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        public users user;
        public survey survey;

        public XacThucAPIController()
        {
            user = SessionHelper.GetUser();
        }
        [HttpPost]
        [Route("xac_thuc")]
        public async Task<IHttpActionResult> load_select_xac_thuc([FromBody] survey Sv)
        {
            var survey = await db.survey.FirstOrDefaultAsync(x => x.surveyID == Sv.surveyID);
            var select_list_data = new List<dynamic>();
            if (survey != null)
            {
                if (survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
                {
                    var get_ctdt = await db.ctdt
                        .Where(x => x.id_hdt == survey.id_hedaotao)
                        .Select(x => new
                        {
                            value = x.id_ctdt,
                            name = x.ten_ctdt,
                        }).ToListAsync();
                    var get_lop = await db.lop
                            .Select(x => new
                            {
                                value_ctdt = x.id_ctdt,
                                value = x.id_lop,
                                name = x.ma_lop,
                            })
                            .ToListAsync();
                    select_list_data.Add(new
                    {
                        ctdt = get_ctdt,
                        lop = get_lop,
                        is_nh = true
                    });
                }
                return Ok(new { data = JsonConvert.SerializeObject(select_list_data), success = true });
            }
            else
            {
                return Ok(new { message = "Không thể xác thực bộ phiếu", success = false });
            }
        }
        [HttpPost]
        [Route("check_xac_thuc")]
        public async Task<IHttpActionResult> check_xac_thuc([FromBody] survey Sv)
        {
            // Tách chuỗi email login
            var email_String = user.email.Split('@');
            var mssv_by_email = email_String[0];
            var check_mail_student = email_String[1];
            // Check
            var survey = await db.survey.FirstOrDefaultAsync(x => x.surveyID == Sv.surveyID);
            var answer_survey = await db.answer_response.FirstOrDefaultAsync(x => x.surveyID == Sv.surveyID && x.id_users == user.id_users);

            // Nếu đã có câu trả lời khảo sát
            if (answer_survey == null)
            {
                return await Is_Non_Answer_Survey(survey, mssv_by_email, check_mail_student);
            }
            bool check_answer_survey = db.answer_response.Any(x => x.surveyID == answer_survey.surveyID && x.id_users == user.id_users && x.json_answer != null);
            if (check_answer_survey)
            {
                return await Is_Answer_Survey(survey, answer_survey, mssv_by_email, check_mail_student);
            }
            return BadRequest("Không thể gửi yêu cầu");
        }
        private async Task<IHttpActionResult> Is_Answer_Survey(survey survey, answer_response answer_survey, string mssv_by_email, string check_mail_student)
        {
            var url = "";
            var check_group_loaikhaosat = await db.LoaiKhaoSat.FirstOrDefaultAsync(x => x.id_loaikhaosat == survey.id_loaikhaosat);
            // Check phiếu thuộc học viên
            if (check_group_loaikhaosat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học")
            {
                if (check_mail_student == "student.tdmu.edu.vn")
                {
                    url = $"/phieu-khao-sat/dap-an/{answer_survey.id}/{answer_survey.surveyID}";
                    return Ok(new { data = url, is_answer = true });
                }
                else
                {
                    return Ok(new { message = "Bạn đang đăng nhập Email cá nhân, vui lòng đăng nhập lại bằng Email người học để thực hiện khảo sát" });
                }
            }
            else if (check_group_loaikhaosat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
            {
                url = $"/xac_thuc/{survey.surveyID}";
                return Ok(new { data = url, non_survey = true });
            }
            return BadRequest("Không thể gửi yêu cầu");
        }
        private async Task<IHttpActionResult> Is_Non_Answer_Survey(survey survey, string mssv_by_email, string check_mail_student)
        {
            var list_info = new List<dynamic>();
            var url = "";
            var check_group_loaikhaosat = await db.LoaiKhaoSat.FirstOrDefaultAsync(x => x.id_loaikhaosat == survey.id_loaikhaosat);
            // Check phiếu thuộc học viên
            if (check_group_loaikhaosat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học")
            {
                if (check_mail_student == "student.tdmu.edu.vn")
                {
                    var check_phieu = await db.nguoi_hoc_khao_sat.FirstOrDefaultAsync(x => x.surveyID == survey.surveyID && x.sinhvien.ma_sv == mssv_by_email);
                    if (check_phieu != null)
                    {
                        list_info.Add(new
                        {
                            ma_nh = check_phieu.sinhvien.ma_sv,
                            ten_nh = check_phieu.sinhvien.hovaten,
                            thuoc_lop = check_phieu.sinhvien.lop.ma_lop,
                            thuoc_ctdt = check_phieu.sinhvien.lop.ctdt.ten_ctdt,
                            thuoc_don_vi = check_phieu.sinhvien.lop.ctdt.khoa_vien_truong.ten_khoa,
                            mo_ta = check_phieu.sinhvien.description
                        });
                        HttpContext.Current.Session["id_nghoc_ks"] = check_phieu.id_nguoi_hoc_khao_sat;
                        url = $"/phieu-khao-sat/{survey.surveyID}";
                        return Ok(new { data = url, info = list_info, is_nghoc = true, non_survey = true });
                    }
                    {
                        return Ok(new { message = "Bạn không có dữ liệu khảo sát phiếu này, vui lòng liên hệ với người phụ trách để biết thêm chi tiết" });
                    }
                }
                else
                {
                    return Ok(new { message = "Bạn đang đăng nhập Email cá nhân, vui lòng đăng nhập lại bằng Email người học để thực hiện khảo sát." });
                }
            }
            return BadRequest("Không thể gửi yêu cầu");
        }
        public class SaveXacThuc
        {
            public int surveyID { get; set; }
            public int id_ctdt { get; set; }
            public int check_hoc_phan { get; set; }
            public string ma_vien_chuc { get; set; }
            public string ten_vien_chuc { get; set; }
            public string ma_nh { get; set; }
            public string ten_nh { get; set; }
            public string ngay_sinh { get; set; }
            public int check_lop { get; set; }
            public string check_doi_tuong { get; set; }
        }
        [HttpPost]
        [Route("save_xac_thuc")]
        public async Task<IHttpActionResult> save_xac_thuc([FromBody] SaveXacThuc sv)
        {
            var check_survey = await db.survey.FirstOrDefaultAsync(x => x.surveyID == sv.surveyID);
            var list_info = new List<dynamic>();
            if (check_survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
            {
                if (sv.check_doi_tuong == null)
                {
                    return Ok(new { message = "Vui lòng chọn phương thức xác thực", success = false });
                }
                if (sv.check_doi_tuong == "true")
                {
                    if (string.IsNullOrEmpty(sv.ma_nh))
                    {
                        return Ok(new { message = "Không được bỏ trống trường mã người học", success = false });
                    }
                    var check_nh = await db.nguoi_hoc_khao_sat
                       .Where(x => x.surveyID == sv.surveyID && x.sinhvien.ma_sv == sv.ma_nh)
                       .FirstOrDefaultAsync();
                    if (check_nh != null)
                    {
                        var check_answer = await db.answer_response.FirstOrDefaultAsync(x => x.id_nguoi_hoc_khao_sat == check_nh.id_nguoi_hoc_khao_sat
                            && x.surveyID == sv.surveyID);
                        if (check_answer != null)
                        {
                            return Ok(new { message = "", url = $"/phieu-khao-sat/dap-an/{check_answer.id}/{check_answer.surveyID}", is_answer = true });
                        }
                        else
                        {
                            HttpContext.Current.Session["id_nghoc_ks"] = check_nh.id_nguoi_hoc_khao_sat;
                            list_info.Add(new
                            {
                                ma_nh = check_nh.sinhvien.ma_sv,
                                ten_nh = check_nh.sinhvien.hovaten,
                                thuoc_lop = check_nh.sinhvien.lop.ma_lop,
                                thuoc_ctdt = check_nh.sinhvien.lop.ctdt.ten_ctdt,
                                thuoc_don_vi = check_nh.sinhvien.lop.ctdt.khoa_vien_truong.ten_khoa,
                                mo_ta = check_nh.sinhvien.description
                            });
                            return Ok(new { url = $"/phieu-khao-sat/{sv.surveyID}", info = list_info, is_nghoc = true, success = true });
                        }
                    }
                    else
                    {
                        return Ok(new { message = "Không tìm thấy thông tin người học trong phiếu này", success = false });
                    }
                }
                else if (sv.check_doi_tuong == "false")
                {
                    if (string.IsNullOrEmpty(sv.ten_nh))
                    {
                        return Ok(new { message = "Không được bỏ trống trường họ và tên", success = false });
                    }

                    var check_nh = await db.nguoi_hoc_khao_sat
                        .Where(x => x.surveyID == sv.surveyID &&
                                    x.sinhvien.id_lop == sv.check_lop &&
                                    x.sinhvien.hovaten.ToLower().Trim() == sv.ten_nh.ToLower().Trim())
                        .FirstOrDefaultAsync();
                    if (check_nh != null)
                    {
                        var check_answer = await db.answer_response.FirstOrDefaultAsync(x => x.id_users == user.id_users
                            && x.id_nguoi_hoc_khao_sat == check_nh.id_nguoi_hoc_khao_sat
                            && x.surveyID == sv.surveyID);
                        if (check_answer != null)
                        {
                            return Ok(new { message = "", url = $"/phieu-khao-sat/dap-an/{check_answer.id}/{check_answer.surveyID}", is_answer = true });
                        }
                        else
                        {
                            list_info.Add(new
                            {
                                ma_nh = check_nh.sinhvien.ma_sv,
                                ten_nh = check_nh.sinhvien.hovaten,
                                thuoc_lop = check_nh.sinhvien.lop.ma_lop,
                                thuoc_ctdt = check_nh.sinhvien.lop.ctdt.ten_ctdt,
                                thuoc_don_vi = check_nh.sinhvien.lop.ctdt.khoa_vien_truong.ten_khoa,
                                mo_ta = check_nh.sinhvien.description
                            });
                            HttpContext.Current.Session["id_nghoc_ks"] = check_nh.id_nguoi_hoc_khao_sat;
                            return Ok(new { url = $"/phieu-khao-sat/{sv.surveyID}", info = list_info, is_nghoc = true, success = true });
                        }
                    }
                    else
                    {
                        return Ok(new { message = "Không tìm thấy thông tin người học trong phiếu này", success = false });
                    }
                }
            }
            return Ok(new { message = "Không tìm thấy thông tin biểu mẫu", success = false });
        }
    }
}
