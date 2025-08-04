using CTDT.Helper;
using CTDT.Models;
using Newtonsoft.Json;
using OfficeOpenXml.Style;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Management;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.UI.WebControls.WebParts;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Ajax.Utilities;

namespace CTDT.Areas.Admin.Controllers
{
    [Authorize(Roles = "2")]
    [RoutePrefix("api/v1/admin")]
    public class PhieuKhaoSatAdminAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        private users user;
        private PhieuKhaoSatAdminAPIController()
        {
            user = SessionHelper.GetUser();
        }
        #region Phiếu khảo sát và chi tiết

        [HttpPost]
        [Route("danh-sach-phieu-khao-sat")]
        public async Task<IHttpActionResult> danh_sach_phieu_khao_sat([FromBody] survey survey)
        {
            var query = db.survey.AsQueryable();
            if (survey.id_hedaotao != 0)
            {
                query = query.Where(x => x.id_hedaotao == survey.id_hedaotao);
            }

            if (survey.id_loaikhaosat != 0)
            {
                query = query.Where(x => x.id_loaikhaosat == survey.id_loaikhaosat);
            }

            if (survey.id_namhoc != 0)
            {
                query = query.Where(x => x.id_namhoc == survey.id_namhoc);
            }

            if (survey.surveyStatus == 1 || survey.surveyStatus == 2)
            {
                query = query.Where(x => x.surveyStatus == survey.surveyStatus);
            }
            if (!string.IsNullOrEmpty(survey.searchTerm))
            {
                string keyword = survey.searchTerm.ToLower();
                query = query.Where(x =>
                x.surveyTitle.ToLower().Contains(keyword) ||
                x.surveyDescription.ToLower().Contains(keyword));
            }
            int totalRecords = await query.CountAsync();
            var ListPhieu = await query
                .OrderByDescending(x => x.id_namhoc)
                .ThenByDescending(x => x.surveyID)
                .Skip((survey.page - 1) * survey.pageSize)
                .Take(survey.pageSize)
                .Select(p => new
                {
                    ma_phieu = p.surveyID,
                    ten_hdt = p.hedaotao.ten_hedaotao,
                    ma_hdt = p.id_hedaotao,
                    ten_phieu = p.surveyTitle,
                    mo_ta = p.surveyDescription,
                    ngay_tao = p.surveyTimeMake,
                    ngay_cap_nhat = p.surveyTimeUpdate,
                    ngay_bat_dau = p.surveyTimeStart,
                    ngay_ket_thuc = p.surveyTimeEnd,
                    loai_khao_sat = p.LoaiKhaoSat.name_loaikhaosat,
                    ma_loai_khao_sat = p.id_loaikhaosat,
                    nguoi_tao = p.users.firstName + " " + p.users.lastName,
                    trang_thai = p.surveyStatus,
                    nam = p.NamHoc.ten_namhoc,
                }).ToListAsync();

            if (ListPhieu.Any())
            {
                return Ok(new
                {
                    data = ListPhieu,
                    totalRecords = totalRecords,
                    totalPages = (int)Math.Ceiling((double)totalRecords / survey.pageSize),
                    currentPage = survey.page,
                    success = true
                });
            }
            else
            {
                return Ok(new { message = "Không tồn tại dữ liệu", success = false });
            }
        }
        [HttpPost]
        [Route("danh-sach-cau-tra-loi-phieu")]
        public async Task<IHttpActionResult> danh_sach_cac_cau_tra_loi_phieu([FromBody] answer_response aw)
        {
            var get_data = await db.survey.Where(x => x.surveyID == aw.surveyID).FirstOrDefaultAsync();
            var list_data = new List<dynamic>();
            var doi_tuong = "";
            var query = db.answer_response.Where(x => x.surveyID == aw.surveyID);
            var totalRecords = 0;
            if (get_data.LoaiKhaoSat.group_loaikhaosat.id_gr_loaikhaosat == 1 || get_data.LoaiKhaoSat.group_loaikhaosat.id_gr_loaikhaosat == 5)
            {
                if (!string.IsNullOrEmpty(aw.searchTerm))
                {
                    string keyword = aw.searchTerm.ToLower();
                    query = query.Where(x =>
                    x.id.ToString().Contains(keyword) ||
                    x.users.email.ToLower().Contains(keyword) ||
                    x.nguoi_hoc_khao_sat.sinhvien.hovaten.ToLower().Contains(keyword) ||
                    x.nguoi_hoc_khao_sat.sinhvien.ma_sv.ToLower().Contains(keyword) ||
                    x.nguoi_hoc_khao_sat.sinhvien.lop.ma_lop.ToLower().Contains(keyword) ||
                    x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.ten_ctdt.ToLower().Contains(keyword));
                }
                totalRecords = await query.CountAsync();
                var get_answer = await query
                    .OrderBy(x => x.id)
                    .Skip((aw.page - 1) * aw.pageSize)
                    .Take(aw.pageSize)
                    .Select(x => new
                    {
                        ma_kq = x.id,
                        email = x.users.email,
                        ten_nh = x.nguoi_hoc_khao_sat.sinhvien.hovaten,
                        ma_nh = x.nguoi_hoc_khao_sat.sinhvien.ma_sv,
                        thuoc_lop = x.nguoi_hoc_khao_sat.sinhvien.lop.ma_lop,
                        thuoc_ctdt = x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.ten_ctdt,
                        thoi_gian_thuc_hien = x.time
                    }).ToListAsync();
                doi_tuong = "is_student";
                list_data.Add(get_answer);
            }
            if (list_data.Count > 0)
            {
                return Ok(new
                {
                    data = list_data,
                    totalPages = (int)Math.Ceiling((double)totalRecords / aw.pageSize),
                    currentPage = aw.page,
                    success = true,
                    doi_tuong = doi_tuong
                });
            }
            return Ok(new { message = "Không có dữ liệu", success = false });
        }
        [HttpPost]
        [Route("chi-tiet-cau-tra-loi")]
        public async Task<IHttpActionResult> answer_survey([FromBody] answer_response aw)
        {
            var get_answer = await db.answer_response
                .Where(x => x.id == aw.id)
                .Select(x => new
                {
                    x.json_answer,
                    x.survey.surveyData
                })
                .FirstOrDefaultAsync();
            if (get_answer != null)
            {
                return Ok(new { data = get_answer, success = true });
            }
            else
            {
                return Ok(new { message = "Không tìm thấy dữ liệu", success = false });
            }

        }
        [HttpPost]
        [Route("xoa-cau-tra-loi-phieu")]
        public async Task<IHttpActionResult> xoa_cau_tra_loi_phieu([FromBody] answer_response aw)
        {
            var check_phieu = await db.answer_response.FirstOrDefaultAsync(x => x.id == aw.id);
            if (check_phieu == null)
            {
                return Ok(new { message = "Không tìm thấy thông tin câu trả lời", success = false });
            }
            else
            {
                db.answer_response.Remove(check_phieu);
                await db.SaveChangesAsync();
                return Ok(new { message = "Xóa dữ liệu khảo sát thành công", success = true });
            }
        }
        [HttpPost]
        [Route("api/admin/chi-tiet-cau-hoi-khao-sat")]
        public async Task<IHttpActionResult> chi_tiet_cau_hoi_khao_sat([FromBody] survey sv)
        {
            var get_data = await db.survey.FirstOrDefaultAsync(x => x.surveyID == sv.surveyID);
            if (get_data.surveyData != null)
            {
                return Ok(new { data = get_data.surveyData, success = true });
            }
            else
            {
                return Ok(new { message = "Chưa có biểu mẫu khảo sát", success = false });
            }
        }
        [HttpPost]
        [Route("them-moi-phieu-khao-sat")]
        public IHttpActionResult them_moi_phieu_khao_sat([FromBody] survey sv)
        {
            DateTime now = DateTime.UtcNow;
            int unixTimestamp = (int)(now.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            if (db.survey.FirstOrDefault(x => x.surveyTitle == sv.surveyTitle && x.id_hedaotao == sv.id_hedaotao && x.id_namhoc == sv.id_namhoc) != null)
            {
                return Ok(new { message = "Phiếu khảo sát này đã tồn tại, vui lòng kiểm tra lại", success = false });
            }
            if (string.IsNullOrEmpty(sv.surveyTitle))
            {
                return Ok(new { message = "Không được bỏ trống tên phiếu khảo sát", success = false });
            }
            var data = new survey
            {
                id_hedaotao = sv.id_hedaotao,
                surveyData = null,
                surveyTitle = sv.surveyTitle,
                surveyDescription = sv.surveyDescription,
                surveyTimeStart = sv.surveyTimeStart,
                surveyTimeEnd = sv.surveyTimeEnd,
                surveyStatus = sv.surveyStatus,
                id_loaikhaosat = sv.id_loaikhaosat,
                id_namhoc = sv.id_namhoc,
                id_dot_khao_sat = sv.id_dot_khao_sat,
                mo_thong_ke = sv.mo_thong_ke,
                creator = user.id_users,
                surveyTimeMake = unixTimestamp,
                surveyTimeUpdate = unixTimestamp,
                ty_le_phan_tram_dat = sv.ty_le_phan_tram_dat
            };
            db.survey.Add(data);
            db.SaveChanges();

            var NewRecordTimeExtension = new log_time_extension_survey
            {
                surveyid = data.surveyID,
                time_log_start = data.surveyTimeStart,
                time_log_end = data.surveyTimeEnd
            };
            db.log_time_extension_survey.Add(NewRecordTimeExtension);
            db.SaveChanges();
            return Ok(new { message = "Thêm mới dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("get-info-survey")]
        public async Task<IHttpActionResult> get_info_survey([FromBody] survey sv)
        {
            var get_info = await db.survey
                .Where(x => x.surveyID == sv.surveyID)
                .Select(x => new
                {
                    x.id_hedaotao,
                    x.surveyTitle,
                    x.surveyDescription,
                    x.surveyTimeStart,
                    x.surveyTimeEnd,
                    x.surveyStatus,
                    x.id_loaikhaosat,
                    x.id_namhoc,
                    x.id_dot_khao_sat,
                    x.mo_thong_ke,
                    x.ty_le_phan_tram_dat
                }).FirstOrDefaultAsync();
            return Ok(new { data = get_info, success = true });
        }
        [HttpPost]
        [Route("update-phieu-khao-sat")]
        public IHttpActionResult update_survey([FromBody] survey sv)
        {
            DateTime now = DateTime.UtcNow;
            int unixTimestamp = (int)(now.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            var update_survey = db.survey.FirstOrDefault(x => x.surveyID == sv.surveyID);
            if (string.IsNullOrEmpty(sv.surveyTitle))
            {
                return Ok(new { message = "Không được bỏ trống tên phiếu", success = false });
            }
            update_survey.id_hedaotao = sv.id_hedaotao;
            update_survey.surveyTitle = sv.surveyTitle;
            update_survey.surveyDescription = sv.surveyDescription;
            update_survey.surveyTimeStart = sv.surveyTimeStart;
            update_survey.surveyTimeEnd = sv.surveyTimeEnd;
            update_survey.surveyStatus = sv.surveyStatus;
            update_survey.id_loaikhaosat = sv.id_loaikhaosat;
            update_survey.id_namhoc = sv.id_namhoc;
            update_survey.id_dot_khao_sat = sv.id_dot_khao_sat;
            update_survey.mo_thong_ke = sv.mo_thong_ke;
            update_survey.surveyTimeUpdate = unixTimestamp;
            update_survey.ty_le_phan_tram_dat = sv.ty_le_phan_tram_dat;
            db.SaveChanges();
            return Ok(new { message = "Cập nhật dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("update-time-phieu-khao-sat")]
        public async Task<IHttpActionResult> update_time_survey([FromBody] survey sv)
        {
            if (sv.surveyID == null)
            {
                return Ok(new { message = "Không xác định được phiếu khảo sát", success = false });
            }
            DateTime now = DateTime.UtcNow;
            int unixTimestamp = (int)(now.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            var update_survey = db.survey.FirstOrDefault(x => x.surveyID == sv.surveyID);
            update_survey.surveyTimeStart = sv.surveyTimeStart;
            update_survey.surveyTimeEnd = sv.surveyTimeEnd;
            update_survey.surveyTimeUpdate = unixTimestamp;
            await db.SaveChangesAsync();

            var new_record = new log_time_extension_survey
            {
                surveyid = update_survey.surveyID,
                time_log_start = update_survey.surveyTimeStart,
                time_log_end = update_survey.surveyTimeEnd
            };
            db.log_time_extension_survey.Add(new_record);
            await db.SaveChangesAsync();
            return Ok(new { message = "Cập nhật dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("xoa-du-lieu-phieu-khao-sat")]
        public async Task<IHttpActionResult> delete_survey([FromBody] survey sv)
        {
            var check_survey = db.survey.SingleOrDefault(x => x.surveyID == sv.surveyID);
            if (check_survey == null)
                return NotFound();

            var check_answer = db.answer_response.Where(x => x.surveyID == sv.surveyID).ToList();
            var check_nguoi_hoc_khao_sat = db.nguoi_hoc_khao_sat.Where(x => x.surveyID == sv.surveyID).ToList();
            var check_title_survey = db.tieu_de_phieu_khao_sat.Where(x => x.surveyID == sv.surveyID).ToList();

            if (check_answer.Any())
                db.answer_response.RemoveRange(check_answer);

            if (check_nguoi_hoc_khao_sat.Any())
                db.nguoi_hoc_khao_sat.RemoveRange(check_nguoi_hoc_khao_sat);

            if (check_title_survey.Any())
            {
                foreach (var item in check_title_survey)
                {
                    var check_chil_title = db.chi_tiet_cau_hoi_tieu_de.Where(x => x.id_tieu_de_phieu == item.id_tieu_de_phieu).ToList();
                    if (check_chil_title.Any())
                    {
                        foreach (var chil_item in check_chil_title)
                        {
                            var check_dieu_kien = db.dieu_kien_cau_hoi
                                .Where(x => x.id_chi_tiet_tieu_de_cau_hoi == chil_item.id_chi_tiet_cau_hoi_tieu_de)
                                .ToList();
                            if (check_dieu_kien.Any())
                                db.dieu_kien_cau_hoi.RemoveRange(check_dieu_kien);

                            var check_rd_cau_hoi = db.radio_cau_hoi_khac
                                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chil_item.id_chi_tiet_cau_hoi_tieu_de)
                                .ToList();
                            if (check_rd_cau_hoi.Any())
                                db.radio_cau_hoi_khac.RemoveRange(check_rd_cau_hoi);
                        }

                        db.chi_tiet_cau_hoi_tieu_de.RemoveRange(check_chil_title);
                    }
                }

                db.tieu_de_phieu_khao_sat.RemoveRange(check_title_survey);
            }

            var check_log_time = db.log_time_extension_survey
                .Where(x => x.surveyid == sv.surveyID)
                .ToList();
            if (check_log_time.Any())
            {
                db.log_time_extension_survey.RemoveRange(check_log_time);
            }
            db.survey.Remove(check_survey);
            await db.SaveChangesAsync();

            return Ok(new { message = "Xóa dữ liệu thành công", success = true });
        }


        [HttpPost]
        [Route("log-time-extension")]
        public async Task<IHttpActionResult> LogTimeStart([FromBody] survey sv)
        {
            var ListData = new List<object>();
            var Check = await db.log_time_extension_survey
                .Where(x => x.surveyid == sv.surveyID)
                .Select(x => new
                {
                    x.time_log_start,
                    x.time_log_end
                })
                .ToListAsync();
            ListData.AddRange(Check);
            if (ListData.Count > 0)
            {
                return Ok(new { data = ListData, success = true });
            }
            else
            {
                return Ok(new { message = "Không tìm thấy dữ liệu Log", success = false });
            }
        }
        #endregion
        #region Module tạo mới bộ phiếu
        // Loading bộ câu hỏi đã tạo cho phiếu khảo sát
        [HttpPost]
        [Route("load-bo-cau-hoi-phieu-khao-sat")]
        public async Task<IHttpActionResult> tieu_de_phieu_khao_sats([FromBody] survey sv)
        {
            var get_tieu_de_pks = (await db.tieu_de_phieu_khao_sat
               .Where(x => x.surveyID == sv.surveyID)
               .OrderBy(x => x.thu_tu_sap_xep)
               .ToListAsync());
            var list_data = new List<dynamic>();
            int pageCounter = 1;
            int elementCounter = 1;
            foreach (var tieude in get_tieu_de_pks)
            {
                var get_chi_tiet_cau_hoi_tieu_de = await db.chi_tiet_cau_hoi_tieu_de
                    .Where(x => x.id_tieu_de_phieu == tieude.id_tieu_de_phieu)
                    .OrderBy(x => x.thu_tu)
                    .ToListAsync();

                var chi_tiet_cau_hoi_list = new List<dynamic>();

                foreach (var chitietcauhoi in get_chi_tiet_cau_hoi_tieu_de)
                {
                    var dangCauHoi = await db.dang_cau_hoi
                        .Where(x => x.id_dang_cau_hoi == chitietcauhoi.id_dang_cau_hoi)
                        .FirstOrDefaultAsync();
                    var nhieu_lua_chon = new List<dynamic>();

                    if (dangCauHoi.id_dang_cau_hoi == 3)
                    {
                        var get_radio_cau_hoi_khac = await db.radio_cau_hoi_khac
                                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de)
                                .OrderBy(x => x.thu_tu)
                                .ToListAsync();
                        foreach (var getradiocauhoikhac in get_radio_cau_hoi_khac)
                        {
                            var get_dieu_kien_khac = await db.dieu_kien_cau_hoi
                            .Where(x => x.id_rd_chk == getradiocauhoikhac.id_rd_cau_hoi_khac)
                            .Select(x => new
                            {
                                ten_cau_hoi = x.chi_tiet_cau_hoi_tieu_de.thu_tu + ". " + x.chi_tiet_cau_hoi_tieu_de.ten_cau_hoi
                            })
                            .ToListAsync();
                            nhieu_lua_chon.Add(new
                            {
                                value = getradiocauhoikhac.id_rd_cau_hoi_khac,
                                name = $"question{elementCounter}_{getradiocauhoikhac.thu_tu}",
                                text = getradiocauhoikhac.ten_rd_cau_hoi_khac,
                                name_title = get_dieu_kien_khac
                            });
                        }
                        if (chitietcauhoi.is_ykienkhac == 1)
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }

                        }
                        else
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                });
                            }
                        }
                    }
                    else if (dangCauHoi.id_dang_cau_hoi == 4)
                    {
                        var get_radio_cau_hoi_khac = await db.radio_cau_hoi_khac
                                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de)
                                .OrderBy(x => x.thu_tu)
                                .ToListAsync();
                        foreach (var getradiocauhoikhac in get_radio_cau_hoi_khac)
                        {
                            var get_dieu_kien_khac = await db.dieu_kien_cau_hoi
                            .Where(x => x.id_rd_chk == getradiocauhoikhac.id_rd_cau_hoi_khac)
                            .Select(x => new
                            {
                                ten_cau_hoi = x.chi_tiet_cau_hoi_tieu_de.thu_tu + ". " + x.chi_tiet_cau_hoi_tieu_de.ten_cau_hoi
                            })
                            .ToListAsync();
                            nhieu_lua_chon.Add(new
                            {
                                value = getradiocauhoikhac.id_rd_cau_hoi_khac,
                                name = $"question{elementCounter}_{getradiocauhoikhac.thu_tu}",
                                text = getradiocauhoikhac.ten_rd_cau_hoi_khac,
                                name_title = get_dieu_kien_khac
                            });
                        }
                        if (chitietcauhoi.is_ykienkhac == 1)
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                        }
                        else
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }

                        }
                    }
                    else if (dangCauHoi.id_dang_cau_hoi == 5)
                    {
                        var get_radio_cau_hoi_khac = await db.radio_cau_hoi_khac
                                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de)
                                .OrderBy(x => x.thu_tu)
                                .ToListAsync();
                        foreach (var getradiocauhoikhac in get_radio_cau_hoi_khac)
                        {
                            var get_dieu_kien_khac = await db.dieu_kien_cau_hoi
                            .Where(x => x.id_rd_chk == getradiocauhoikhac.id_rd_cau_hoi_khac)
                            .Select(x => new
                            {
                                ten_cau_hoi = x.chi_tiet_cau_hoi_tieu_de.thu_tu + ". " + x.chi_tiet_cau_hoi_tieu_de.ten_cau_hoi
                            })
                            .ToListAsync();
                            nhieu_lua_chon.Add(new
                            {
                                value = getradiocauhoikhac.id_rd_cau_hoi_khac,
                                name = $"question{elementCounter}_{getradiocauhoikhac.thu_tu}",
                                text = getradiocauhoikhac.ten_rd_cau_hoi_khac,
                                name_title = get_dieu_kien_khac
                            });
                        }
                        if (chitietcauhoi.is_ykienkhac == 1)
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                        }
                        else
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }

                        }
                    }
                    else
                    {
                        if (chitietcauhoi.dieu_kien_hien_thi != null)
                        {
                            chi_tiet_cau_hoi_list.Add(new
                            {
                                value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                type = dangCauHoi.id_dang_cau_hoi == 2 ? "comment" : "text",
                                name = $"question{elementCounter}",
                                visible = false,
                                visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                            });
                        }
                        else
                        {
                            chi_tiet_cau_hoi_list.Add(new
                            {
                                value_chil = chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de,
                                type = dangCauHoi.id_dang_cau_hoi == 2 ? "comment" : "text",
                                name = $"question{elementCounter}",
                                title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                            });
                        }
                    }
                    elementCounter++;
                }

                list_data.Add(new
                {
                    value_title = tieude.id_tieu_de_phieu,
                    name = $"page{pageCounter}",
                    title = $"PHẦN {tieude.thu_tu}. {tieude.ten_tieu_de}",
                    elements = chi_tiet_cau_hoi_list,
                });

                pageCounter++;
            }
            var result = new
            {
                title = get_tieu_de_pks.FirstOrDefault()?.survey?.surveyTitle,
                description = get_tieu_de_pks.FirstOrDefault()?.survey?.surveyDescription,
                is_public = get_tieu_de_pks.FirstOrDefault()?.survey?.surveyData != null ? 1 : 0,
                pages = list_data
            };
            if (list_data.Count > 0)
            {
                return Ok(new { data = result, success = true });
            }
            else
            {
                return Ok(new { message = "Chưa có dữ liệu câu hỏi bộ phiếu", success = false });
            }
        }
        [HttpPost]
        [Route("them-moi-tieu-de-pks")]
        public async Task<IHttpActionResult> them_moi_tieu_de_pks([FromBody] tieu_de_phieu_khao_sat td)
        {
            if (string.IsNullOrEmpty(td.ten_tieu_de))
            {
                return Ok(new { message = "Tên tiêu đề không được bỏ trống", success = false });
            }

            if (db.tieu_de_phieu_khao_sat.Any(x => x.surveyID == td.surveyID && x.ten_tieu_de == td.ten_tieu_de))
            {
                return Ok(new { message = "Tiêu đề này đã tồn tại, vui lòng nhập tiêu đề khác", success = false });
            }

            string newThuTu = "";

            if (td.sortType == "alpha")
            {
                if (string.IsNullOrWhiteSpace(td.thu_tu))
                {
                    return Ok(new { message = "Vui lòng nhập thứ tự cho kiểu chữ cái (A, B, C...)", success = false });
                }

                bool exists = db.tieu_de_phieu_khao_sat.Any(x => x.surveyID == td.surveyID && x.thu_tu == td.thu_tu);
                if (exists)
                {
                    return Ok(new { message = $"Thứ tự '{td.thu_tu}' đã tồn tại, vui lòng chọn giá trị khác", success = false });
                }

                newThuTu = td.thu_tu.Trim().ToUpper();
            }
            else
            {
                var titles = await db.tieu_de_phieu_khao_sat
                    .Where(x => x.surveyID == td.surveyID)
                    .Select(x => x.thu_tu)
                    .ToListAsync();

                int newIndex = 1;
                var romanList = titles
                    .Select(s => RomanToInt(s))
                    .Where(i => i > 0)
                    .ToList();

                newIndex = romanList.Count > 0 ? romanList.Max() + 1 : 1;
                newThuTu = IntToRoman(newIndex);
            }
            int maxSortOrder = await db.tieu_de_phieu_khao_sat
                .Where(x => x.surveyID == td.surveyID)
                .Select(x => x.thu_tu_sap_xep)
                .MaxAsync() ?? 0;

            int newSortOrder = maxSortOrder + 1;

            var newTitle = new tieu_de_phieu_khao_sat
            {
                surveyID = td.surveyID,
                ten_tieu_de = td.ten_tieu_de,
                thu_tu = newThuTu,
                thu_tu_sap_xep = newSortOrder
            };

            db.tieu_de_phieu_khao_sat.Add(newTitle);
            await db.SaveChangesAsync();

            return Ok(new
            {
                message = "Thêm mới dữ liệu thành công",
                success = true,
                thu_tu_moi = newThuTu,
                thu_tu_sap_xep_moi = newSortOrder
            });
        }
        [HttpPost]
        [Route("delete-title-survey")]
        public IHttpActionResult delete_tieu_de_pks([FromBody] tieu_de_phieu_khao_sat td)
        {
            var checkChiTietTitleList = db.chi_tiet_cau_hoi_tieu_de
                .Where(x => x.id_tieu_de_phieu == td.id_tieu_de_phieu)
                .ToList();
            foreach (var chiTiet in checkChiTietTitleList)
            {
                var checkRdKhac = db.radio_cau_hoi_khac
                    .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chiTiet.id_chi_tiet_cau_hoi_tieu_de).ToList();

                if (checkRdKhac.Any())
                {
                    foreach (var rd in checkRdKhac)
                    {
                        db.radio_cau_hoi_khac.Remove(rd);
                    }
                }
                db.chi_tiet_cau_hoi_tieu_de.Remove(chiTiet);
            }
            db.SaveChanges();
            var checkTitle = db.tieu_de_phieu_khao_sat
                .SingleOrDefault(x => x.id_tieu_de_phieu == td.id_tieu_de_phieu);
            db.tieu_de_phieu_khao_sat.Remove(checkTitle);
            db.SaveChanges();
            return Ok(new { message = "Xóa dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("get-info-title-survey")]
        public async Task<IHttpActionResult> get_info_title([FromBody] tieu_de_phieu_khao_sat td)
        {
            var get_info = await db.tieu_de_phieu_khao_sat
                .Where(x => x.id_tieu_de_phieu == td.id_tieu_de_phieu)
                .Select(x => new
                {
                    x.ten_tieu_de,
                    x.thu_tu
                })
                .FirstOrDefaultAsync();

            return Ok(get_info);
        }

        [HttpPost]
        [Route("update-title-survey")]
        public IHttpActionResult update_title_survey([FromBody] tieu_de_phieu_khao_sat td)
        {
            var check_title = db.tieu_de_phieu_khao_sat.FirstOrDefault(x => td.id_tieu_de_phieu == x.id_tieu_de_phieu);
            check_title.surveyID = td.surveyID;
            check_title.ten_tieu_de = td.ten_tieu_de;
            db.SaveChanges();
            return Ok(new { message = "Cập nhật dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("option-chi-tiet-cau-hoi")]
        public async Task<IHttpActionResult> load_option([FromBody] tieu_de_phieu_khao_sat td)
        {
            if (td.surveyID == null)
            {
                return Ok(new { message = "Vui lòng chọn phiếu khảo sát để tạo mới", success = false });
            }
            var get_tieu_de_pks = (await db.tieu_de_phieu_khao_sat
                .Where(x => x.surveyID == td.surveyID)
                .OrderBy(x => x.thu_tu_sap_xep)
                .ToListAsync())
                .Select(x => new
                {
                    value_title = x.id_tieu_de_phieu,
                    name = $"{x.thu_tu}. {x.ten_tieu_de}"
                })
                .ToList();
            var get_dang_cau_hoi = await db.dang_cau_hoi
                .Select(x => new
                {
                    value_dch = x.id_dang_cau_hoi,
                    name = x.ten_dang_cau_hoi
                }).ToListAsync();
            if (get_tieu_de_pks.Count > 0)
            {
                return Ok(new
                {
                    tieu_de = get_tieu_de_pks,
                    dang_cau_hoi = get_dang_cau_hoi,
                    success = true
                });
            }
            else
            {
                return Ok(new { message = "Chưa có tiêu đề câu hỏi chính nào cho phiếu này, vui lòng tạo mới tiêu đề và quay lại để tiếp tục", success = false });
            }
        }
        public class save_children_title_survey
        {
            public int id_chi_tiet_cau_hoi_tieu_de { get; set; }
            public int surveyID { get; set; }
            public Nullable<int> thu_tu { get; set; }
            public Nullable<int> id_tieu_de_phieu { get; set; }
            public string ten_cau_hoi { get; set; }
            public Nullable<int> id_dang_cau_hoi { get; set; }
            public Nullable<int> bat_buoc { get; set; }
            public Nullable<int> is_ykienkhac { get; set; }
            public string dieu_kien_hien_thi { get; set; }
            public int id_rd_cau_hoi_khac { get; set; }
            public string ten_rd_cau_hoi_khac { get; set; }
        }
        [HttpPost]
        [Route("save-children-title")]
        public async Task<IHttpActionResult> save_option([FromBody] save_children_title_survey rd)
        {
            if (string.IsNullOrEmpty(rd.ten_cau_hoi))
            {
                return Ok(new { message = "Không được bỏ trống tên tiêu đề con", success = false });
            }

            var titles = await db.chi_tiet_cau_hoi_tieu_de
                .Where(x => x.tieu_de_phieu_khao_sat.surveyID == rd.surveyID)
                .Select(x => x.thu_tu)
                .ToListAsync();
            int newThuTuNum = (titles.Max() ?? 0) + 1;
            var chil_title = new chi_tiet_cau_hoi_tieu_de
            {
                thu_tu = newThuTuNum,
                id_tieu_de_phieu = rd.id_tieu_de_phieu,
                ten_cau_hoi = rd.ten_cau_hoi,
                id_dang_cau_hoi = rd.id_dang_cau_hoi,
                bat_buoc = rd.bat_buoc,
                is_ykienkhac = rd.is_ykienkhac,
                dieu_kien_hien_thi = null,
            };

            db.chi_tiet_cau_hoi_tieu_de.Add(chil_title);
            await db.SaveChangesAsync();
            if (!string.IsNullOrEmpty(rd.ten_rd_cau_hoi_khac))
            {
                var options = rd.ten_rd_cau_hoi_khac
                    .Split(new[] { '\n' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(o => o.Trim())
                    .Where(o => !string.IsNullOrEmpty(o))
                    .ToList();

                var newOptions = new List<radio_cau_hoi_khac>();

                foreach (var option in options)
                {
                    var parts = option.Split(new[] { '.' }, 2);
                    if (parts.Length < 2) continue;

                    if (int.TryParse(parts[0].Trim(), out int thuTu))
                    {
                        newOptions.Add(new radio_cau_hoi_khac
                        {
                            thu_tu = thuTu,
                            ten_rd_cau_hoi_khac = parts[1].Trim(),
                            id_chi_tiet_cau_hoi_tieu_de = chil_title.id_chi_tiet_cau_hoi_tieu_de
                        });
                    }
                }

                db.radio_cau_hoi_khac.AddRange(newOptions);
                await db.SaveChangesAsync();
            }
            return Ok(new { message = "Cập nhật dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("info-children-title")]
        public async Task<IHttpActionResult> load_info_chil_title([FromBody] ChildrenTitleSurvey chil)
        {
            var get_info_children_title = await db.chi_tiet_cau_hoi_tieu_de
                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chil.id_chi_tiet_cau_hoi_tieu_de)
                .Select(x => new
                {
                    x.id_chi_tiet_cau_hoi_tieu_de,
                    x.id_tieu_de_phieu,
                    x.ten_cau_hoi,
                    x.id_dang_cau_hoi,
                    x.bat_buoc,
                    x.is_ykienkhac
                })
                .FirstOrDefaultAsync();
            var get_info_rd = await db.radio_cau_hoi_khac
                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == get_info_children_title.id_chi_tiet_cau_hoi_tieu_de)
                .Select(x => new
                {
                    x.id_rd_cau_hoi_khac,
                    x.thu_tu,
                    x.ten_rd_cau_hoi_khac,
                })
                .ToListAsync();
            return Ok(new { data_chil = get_info_children_title, get_rd = get_info_rd, success = true });

        }
        [HttpPost]
        [Route("edit-children-title")]
        public IHttpActionResult edit_children_title([FromBody] ChildrenTitleSurvey chil)
        {
            var check_chil_title = db.chi_tiet_cau_hoi_tieu_de.FirstOrDefault(x => x.id_chi_tiet_cau_hoi_tieu_de == chil.id_chi_tiet_cau_hoi_tieu_de);
            if (string.IsNullOrEmpty(chil.ten_cau_hoi))
            {
                return Ok(new { message = "Vui lòng không để trống tên tiêu đề", success = false });
            }
            check_chil_title.id_tieu_de_phieu = chil.id_tieu_de_phieu;
            check_chil_title.ten_cau_hoi = chil.ten_cau_hoi;
            check_chil_title.id_dang_cau_hoi = chil.id_dang_cau_hoi;
            check_chil_title.bat_buoc = chil.bat_buoc;
            check_chil_title.is_ykienkhac = chil.is_ykienkhac;
            check_chil_title.dieu_kien_hien_thi = null;
            db.SaveChanges();
            if (string.IsNullOrEmpty(chil.ten_rd_cau_hoi_khac))
            {
                var existingRadios = db.radio_cau_hoi_khac.Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chil.id_chi_tiet_cau_hoi_tieu_de).ToList();
                db.radio_cau_hoi_khac.RemoveRange(existingRadios);
                db.SaveChanges();
            }
            else
            {
                var existingRadios = db.radio_cau_hoi_khac.Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chil.id_chi_tiet_cau_hoi_tieu_de).ToList();
                db.radio_cau_hoi_khac.RemoveRange(existingRadios);
                db.SaveChanges();
                var options = chil.ten_rd_cau_hoi_khac
                    .Split(new[] { '\n' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(o => o.Trim())
                    .Where(o => !string.IsNullOrEmpty(o))
                    .ToList();
                var newOptions = new List<radio_cau_hoi_khac>();
                foreach (var option in options)
                {
                    var parts = option.Split(new[] { '.' }, 2);
                    if (parts.Length < 2) continue;

                    if (int.TryParse(parts[0].Trim(), out int thuTu))
                    {
                        newOptions.Add(new radio_cau_hoi_khac
                        {
                            thu_tu = thuTu,
                            ten_rd_cau_hoi_khac = parts[1].Trim(),
                            id_chi_tiet_cau_hoi_tieu_de = check_chil_title.id_chi_tiet_cau_hoi_tieu_de
                        });
                    }
                }
                db.radio_cau_hoi_khac.AddRange(newOptions);
                db.SaveChanges();
            }
            return Ok(new { message = "Cập nhật dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("delete-children-title")]
        public IHttpActionResult delete_children_title([FromBody] ChildrenTitleSurvey chil)
        {
            var check_rd = db.radio_cau_hoi_khac.Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chil.id_chi_tiet_cau_hoi_tieu_de).ToList();
            if (check_rd.Any())
            {
                db.radio_cau_hoi_khac.RemoveRange(check_rd);
                db.SaveChanges();
            }
            var check_children_title = db.chi_tiet_cau_hoi_tieu_de.FirstOrDefault(x => x.id_chi_tiet_cau_hoi_tieu_de == chil.id_chi_tiet_cau_hoi_tieu_de);
            if (check_children_title != null)
            {
                db.chi_tiet_cau_hoi_tieu_de.Remove(check_children_title);
                db.SaveChanges();
            }
            return Ok(new { message = "Xóa dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("view-final-survey")]
        public async Task<IHttpActionResult> xem_truoc_va_xuat_ban([FromBody] survey sv)
        {
            var get_tieu_de_pks = (await db.tieu_de_phieu_khao_sat
                .OrderBy(x => x.thu_tu_sap_xep)
                .Where(x => x.surveyID == sv.surveyID)
                .ToListAsync());

            var list_data = new List<dynamic>();
            int pageCounter = 1;
            int elementCounter = 1;

            foreach (var tieude in get_tieu_de_pks)
            {
                var get_chi_tiet_cau_hoi_tieu_de = await db.chi_tiet_cau_hoi_tieu_de
                    .Where(x => x.id_tieu_de_phieu == tieude.id_tieu_de_phieu)
                    .OrderBy(x => x.thu_tu)
                    .ToListAsync();

                var chi_tiet_cau_hoi_list = new List<dynamic>();

                foreach (var chitietcauhoi in get_chi_tiet_cau_hoi_tieu_de)
                {
                    var dangCauHoi = await db.dang_cau_hoi
                        .Where(x => x.id_dang_cau_hoi == chitietcauhoi.id_dang_cau_hoi)
                        .FirstOrDefaultAsync();
                    var nhieu_lua_chon = new List<dynamic>();

                    if (dangCauHoi.id_dang_cau_hoi == 3)
                    {
                        var get_radio_cau_hoi_khac = await db.radio_cau_hoi_khac
                                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de)
                                .OrderBy(x => x.thu_tu)
                                .ToListAsync();

                        foreach (var getradiocauhoikhac in get_radio_cau_hoi_khac)
                        {
                            nhieu_lua_chon.Add(new
                            {
                                name = $"question{elementCounter}_{getradiocauhoikhac.thu_tu}",
                                text = getradiocauhoikhac.ten_rd_cau_hoi_khac,
                            });
                        }
                        if (chitietcauhoi.is_ykienkhac == 1)
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }

                        }
                        else
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                });
                            }
                        }
                    }
                    else if (dangCauHoi.id_dang_cau_hoi == 4)
                    {
                        var get_radio_cau_hoi_khac = await db.radio_cau_hoi_khac
                                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de)
                                .OrderBy(x => x.thu_tu)
                                .ToListAsync();

                        foreach (var getradiocauhoikhac in get_radio_cau_hoi_khac)
                        {
                            nhieu_lua_chon.Add(new
                            {
                                name = $"question{elementCounter}_{getradiocauhoikhac.thu_tu}",
                                text = getradiocauhoikhac.ten_rd_cau_hoi_khac,
                            });
                        }
                        if (chitietcauhoi.is_ykienkhac == 1)
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                        }
                        else
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }

                        }
                    }
                    else if (dangCauHoi.id_dang_cau_hoi == 5)
                    {
                        var get_radio_cau_hoi_khac = await db.radio_cau_hoi_khac
                                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de)
                                .OrderBy(x => x.thu_tu)
                                .ToListAsync();

                        foreach (var getradiocauhoikhac in get_radio_cau_hoi_khac)
                        {
                            nhieu_lua_chon.Add(new
                            {
                                name = $"question{elementCounter}_{getradiocauhoikhac.thu_tu}",
                                text = getradiocauhoikhac.ten_rd_cau_hoi_khac,
                            });
                        }
                        if (chitietcauhoi.is_ykienkhac == 1)
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                        }
                        else
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }

                        }
                    }
                    else
                    {
                        if (chitietcauhoi.dieu_kien_hien_thi != null)
                        {
                            chi_tiet_cau_hoi_list.Add(new
                            {
                                type = dangCauHoi.id_dang_cau_hoi == 2 ? "comment" : "text",
                                name = $"question{elementCounter}",
                                visible = false,
                                visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                            });
                        }
                        else
                        {
                            chi_tiet_cau_hoi_list.Add(new
                            {
                                type = dangCauHoi.id_dang_cau_hoi == 2 ? "comment" : "text",
                                name = $"question{elementCounter}",
                                title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                            });
                        }
                    }
                    elementCounter++;
                }

                list_data.Add(new
                {
                    name = $"page{pageCounter}",
                    title = $"PHẦN {tieude.thu_tu}. {tieude.ten_tieu_de}",
                    elements = chi_tiet_cau_hoi_list,
                });

                pageCounter++;
            }
            var result = new
            {
                title = get_tieu_de_pks.FirstOrDefault()?.survey?.surveyTitle,
                description = get_tieu_de_pks.FirstOrDefault()?.survey?.surveyDescription,
                pages = list_data
            };
            if (list_data.Count > 0)
            {
                return Ok(new { data = JsonConvert.SerializeObject(result), success = true });
            }
            else
            {
                return Ok(new { message = "Chưa có dữ liệu câu hỏi bộ phiếu", success = false });
            }
        }
        [HttpPost]
        [Route("save-final-survey")]
        public async Task<IHttpActionResult> save_final_survey([FromBody] survey items)
        {
            if (items.surveyID == 0)
            {
                return Ok(new { message = "Không tìm thấy phiếu khảo sát", success = false });
            }
            var get_tieu_de_pks = (await db.tieu_de_phieu_khao_sat
                .OrderBy(x => x.thu_tu_sap_xep)
                 .Where(x => x.surveyID == items.surveyID)
                 .ToListAsync());
            if (!get_tieu_de_pks.Any())
            {
                return Ok(new { message = "Chưa có dữ liệu câu hỏi phiếu khảo sát cần xuất bản", success = false });
            }
            var list_data = new List<dynamic>();
            int pageCounter = 1;
            int elementCounter = 1;

            foreach (var tieude in get_tieu_de_pks)
            {
                var get_chi_tiet_cau_hoi_tieu_de = await db.chi_tiet_cau_hoi_tieu_de
                    .Where(x => x.id_tieu_de_phieu == tieude.id_tieu_de_phieu)
                    .OrderBy(x => x.thu_tu)
                    .ToListAsync();

                var chi_tiet_cau_hoi_list = new List<dynamic>();

                foreach (var chitietcauhoi in get_chi_tiet_cau_hoi_tieu_de)
                {
                    var dangCauHoi = await db.dang_cau_hoi
                        .Where(x => x.id_dang_cau_hoi == chitietcauhoi.id_dang_cau_hoi)
                        .FirstOrDefaultAsync();
                    var nhieu_lua_chon = new List<dynamic>();

                    if (dangCauHoi.id_dang_cau_hoi == 3)
                    {
                        var get_radio_cau_hoi_khac = await db.radio_cau_hoi_khac
                                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de)
                                .OrderBy(x => x.thu_tu)
                                .ToListAsync();

                        foreach (var getradiocauhoikhac in get_radio_cau_hoi_khac)
                        {
                            nhieu_lua_chon.Add(new
                            {
                                name = $"question{elementCounter}_{getradiocauhoikhac.thu_tu}",
                                text = getradiocauhoikhac.ten_rd_cau_hoi_khac,
                            });
                        }
                        if (chitietcauhoi.is_ykienkhac == 1)
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }

                        }
                        else
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "radiogroup",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                });
                            }
                        }
                    }
                    else if (dangCauHoi.id_dang_cau_hoi == 4)
                    {
                        var get_radio_cau_hoi_khac = await db.radio_cau_hoi_khac
                                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de)
                                .OrderBy(x => x.thu_tu)
                                .ToListAsync();

                        foreach (var getradiocauhoikhac in get_radio_cau_hoi_khac)
                        {
                            nhieu_lua_chon.Add(new
                            {
                                name = $"question{elementCounter}_{getradiocauhoikhac.thu_tu}",
                                text = getradiocauhoikhac.ten_rd_cau_hoi_khac,
                            });
                        }
                        if (chitietcauhoi.is_ykienkhac == 1)
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                        }
                        else
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "checkbox",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }

                        }
                    }
                    else if (dangCauHoi.id_dang_cau_hoi == 5)
                    {
                        var get_radio_cau_hoi_khac = await db.radio_cau_hoi_khac
                                .Where(x => x.id_chi_tiet_cau_hoi_tieu_de == chitietcauhoi.id_chi_tiet_cau_hoi_tieu_de)
                                .OrderBy(x => x.thu_tu)
                                .ToListAsync();

                        foreach (var getradiocauhoikhac in get_radio_cau_hoi_khac)
                        {
                            nhieu_lua_chon.Add(new
                            {
                                name = $"question{elementCounter}_{getradiocauhoikhac.thu_tu}",
                                text = getradiocauhoikhac.ten_rd_cau_hoi_khac,
                            });
                        }
                        if (chitietcauhoi.is_ykienkhac == 1)
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon,
                                    showOtherItem = true,
                                    otherText = "Ý kiến khác:"
                                });
                            }
                        }
                        else
                        {
                            if (chitietcauhoi.dieu_kien_hien_thi != null)
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    name = $"question{elementCounter}",
                                    visible = false,
                                    visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }
                            else
                            {
                                chi_tiet_cau_hoi_list.Add(new
                                {
                                    type = "select",
                                    name = $"question{elementCounter}",
                                    title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                    isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                                    choices = nhieu_lua_chon
                                });
                            }

                        }
                    }
                    else
                    {
                        if (chitietcauhoi.dieu_kien_hien_thi != null)
                        {
                            chi_tiet_cau_hoi_list.Add(new
                            {
                                type = dangCauHoi.id_dang_cau_hoi == 2 ? "comment" : "text",
                                name = $"question{elementCounter}",
                                visible = false,
                                visibleIf = chitietcauhoi.dieu_kien_hien_thi.Split(',').ToArray(),
                                title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                            });
                        }
                        else
                        {
                            chi_tiet_cau_hoi_list.Add(new
                            {
                                type = dangCauHoi.id_dang_cau_hoi == 2 ? "comment" : "text",
                                name = $"question{elementCounter}",
                                title = $"{chitietcauhoi.thu_tu}. {chitietcauhoi.ten_cau_hoi}",
                                isRequired = chitietcauhoi.bat_buoc == 1 ? true : false,
                            });
                        }
                    }
                    elementCounter++;
                }

                list_data.Add(new
                {
                    name = $"page{pageCounter}",
                    title = $"PHẦN {tieude.thu_tu}. {tieude.ten_tieu_de}",
                    elements = chi_tiet_cau_hoi_list,
                });

                pageCounter++;
            }
            var result = new
            {
                title = get_tieu_de_pks.FirstOrDefault()?.survey?.surveyTitle,
                description = get_tieu_de_pks.FirstOrDefault()?.survey?.surveyDescription,
                pages = list_data
            };

            var check_survey = await db.survey.FirstOrDefaultAsync(x => x.surveyID == items.surveyID);
            check_survey.surveyData = JsonConvert.SerializeObject(result);
            await db.SaveChangesAsync();
            return Ok(new { message = "Cập nhật dữ liệu thành công", success = true });
        }
        [HttpPost]
        [Route("sort-title-survey")]
        public async Task<IHttpActionResult> Sort_Title([FromBody] survey items)
        {
            if (items.surveyID == 0)
            {
                return Ok(new { message = "Vui lòng chọn phiếu khảo sát", success = false });
            }
            var get_title = await db.tieu_de_phieu_khao_sat
                .OrderBy(x => x.thu_tu_sap_xep)
                .Where(x => x.surveyID == items.surveyID)
                .ToListAsync();
            if (!get_title.Any())
            {
                return Ok(new { message = "Chưa có câu hỏi trong bộ phiếu cần sắp xếp", success = false });
            }
            var sortedTitles = get_title
                .Where(x => RomanToInt(x.thu_tu) > 0)
                .Select(x => new { x, thu_tu_num = RomanToInt(x.thu_tu) })
                .OrderBy(x => x.thu_tu_num)
                .ToList();
            for (int i = 0; i < sortedTitles.Count; i++)
            {
                sortedTitles[i].x.thu_tu = IntToRoman(i + 1);
            }
            var get_children_title = await db.chi_tiet_cau_hoi_tieu_de
                .Where(x => x.tieu_de_phieu_khao_sat.surveyID == items.surveyID)
                .ToListAsync();
            var sortedChildren = get_children_title
                .OrderBy(x => RomanToInt(x.tieu_de_phieu_khao_sat.thu_tu))
                .ThenBy(x => x.thu_tu)
                .ToList();
            for (int i = 0; i < sortedChildren.Count; i++)
            {
                sortedChildren[i].thu_tu = i + 1;
            }
            await db.SaveChangesAsync();
            return Ok(new { message = "Sắp xếp thứ tự phiếu thành công", success = true });
        }
        public string IntToRoman(int num)
        {
            string[] thousands = { "", "M", "MM", "MMM" };
            string[] hundreds = { "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM" };
            string[] tens = { "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC" };
            string[] ones = { "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX" };

            return thousands[num / 1000] +
                   hundreds[(num % 1000) / 100] +
                   tens[(num % 100) / 10] +
                   ones[num % 10];
        }
        public int RomanToInt(string roman)
        {
            if (string.IsNullOrEmpty(roman))
                return 0;

            Dictionary<char, int> romanMap = new Dictionary<char, int>()
                {
                    {'I', 1}, {'V', 5}, {'X', 10}, {'L', 50},
                    {'C', 100}, {'D', 500}, {'M', 1000}
                };

            int total = 0;
            int prev = 0;

            foreach (char c in roman.ToUpper())
            {
                if (!romanMap.ContainsKey(c))
                    return 0;

                int curr = romanMap[c];

                if (curr > prev)
                {
                    total = total - 2 * prev + curr;
                }
                else
                {
                    total += curr;
                }

                prev = curr;
            }

            return total;
        }
        #endregion
        #region Các hàm ExportExcel
        [HttpPost]
        [Route("export-excel-danh-sach-cau-tra-loi")]
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
                    var query = db.answer_response.Where(x => x.surveyID == find.surveyID);
                    var data = await query
                        .Select(x => new
                        {
                            email_khao_sat = x.nguoi_hoc_khao_sat.sinhvien.ma_sv + "@student.tdmu.edu.vn",
                            ma_kq = x.id,
                            ma_nh = x.nguoi_hoc_khao_sat.sinhvien.ma_sv,
                            ten_nh = x.nguoi_hoc_khao_sat.sinhvien.hovaten,
                            thuoc_lop = x.nguoi_hoc_khao_sat.sinhvien.lop.ma_lop,
                            thuoc_ctdt = x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.ten_ctdt,
                        })
                        .ToListAsync();
                    string[] columnNames = { "STT", "Mã KQ", "Email khảo sát", "Mã người học", "Tên người học", "Thuộc lớp", "Thuộc chương trình đào tạo" };
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
                        worksheet.Cells[row, 2].Value = item.ma_kq;
                        worksheet.Cells[row, 3].Value = item.email_khao_sat;
                        worksheet.Cells[row, 4].Value = item.ma_nh;
                        worksheet.Cells[row, 5].Value = item.ten_nh;
                        worksheet.Cells[row, 6].Value = item.thuoc_lop;
                        worksheet.Cells[row, 7].Value = item.thuoc_ctdt;
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
        #endregion
        #region Module điều kiện khác
        [HttpPost]
        [Route("chi-tiet-tieu-de-cau-hoi-by-survey")]
        public async Task<IHttpActionResult> ChiTietTieuDeCauHoiBySurvey(tieu_de_phieu_khao_sat items)
        {
            var get_tieu_de_phieu_ks = await db.tieu_de_phieu_khao_sat
                .Where(x => x.surveyID == items.surveyID)
                .Select(x => x.id_tieu_de_phieu)
                .ToListAsync();
            var CheckDieuKienKhac = await db.dieu_kien_cau_hoi
                .Where(x => x.id_rd_chk == items.thu_tu_sap_xep)
                .Select(x => x.id_chi_tiet_tieu_de_cau_hoi)
                .ToListAsync();
            var list_data = new List<object>();
            var get_chi_tiet_tieu_de = await db.chi_tiet_cau_hoi_tieu_de
                .OrderBy(x => x.thu_tu)
                .Where(x => get_tieu_de_phieu_ks.Contains((int)x.id_tieu_de_phieu) && !CheckDieuKienKhac.Contains(x.id_chi_tiet_cau_hoi_tieu_de))
                .Select(x => new
                {
                    x.id_chi_tiet_cau_hoi_tieu_de,
                    x.thu_tu,
                    x.ten_cau_hoi,
                    x.dang_cau_hoi.ten_dang_cau_hoi
                })
                .ToListAsync();

            list_data.AddRange(get_chi_tiet_tieu_de);
            return Ok(list_data);
        }

        [HttpPost]
        [Route("them-moi-dieu-kien-khac")]
        public async Task<IHttpActionResult> ThemMoiDieuKienKhac(dieu_kien_cau_hoi items)
        {
            var check_dieu_kien_cau_hoi = await db.dieu_kien_cau_hoi.FirstOrDefaultAsync(x => x.id_chi_tiet_tieu_de_cau_hoi == items.id_chi_tiet_tieu_de_cau_hoi && x.id_rd_chk == items.id_rd_chk);
            if (check_dieu_kien_cau_hoi != null)
            {
                return Ok(new { message = "Đã tồn tại trong danh sách điều kiện khác", success = false });
            }
            else
            {
                var new_record = new dieu_kien_cau_hoi
                {
                    id_chi_tiet_tieu_de_cau_hoi = items.id_chi_tiet_tieu_de_cau_hoi,
                    id_rd_chk = items.id_rd_chk,
                    json_question = items.json_question
                };
                db.dieu_kien_cau_hoi.Add(new_record);
                await db.SaveChangesAsync();
                var check_dieu_kien_hien_thi = await db.dieu_kien_cau_hoi
                    .Where(x => x.id_chi_tiet_tieu_de_cau_hoi == items.id_chi_tiet_tieu_de_cau_hoi)
                    .Select(x => x.json_question)
                    .ToListAsync();

                var check_chi_tiet_tieu_de = await db.chi_tiet_cau_hoi_tieu_de
                    .FirstOrDefaultAsync(x => x.id_chi_tiet_cau_hoi_tieu_de == items.id_chi_tiet_tieu_de_cau_hoi);

                if (check_dieu_kien_hien_thi.Any())
                {
                    var dieu_kien_list = check_dieu_kien_hien_thi
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .ToList();

                    var dieu_kien_hien_thi_joined = string.Join(",", dieu_kien_list);

                    check_chi_tiet_tieu_de.dieu_kien_hien_thi = dieu_kien_hien_thi_joined;
                }
                else
                {
                    check_chi_tiet_tieu_de.dieu_kien_hien_thi = null;
                }

                await db.SaveChangesAsync();

            }


            return Ok(new { message = "Thêm điều kiện khác thành công ", success = true });
        }
        [HttpPost]
        [Route("danh-sach-cau-hoi-dieu-kien-khac-da-chon")]
        public async Task<IHttpActionResult> DanhSachDieuKienCauHoiDaChon(dieu_kien_cau_hoi items)
        {
            var list_data = new List<object>();
            var check_cau_hoi_dkk = await db.dieu_kien_cau_hoi
                .Where(x => x.id_rd_chk == items.id_rd_chk)
                .Select(x => new
                {
                    x.id_cau_hoi_dieu_kien_khac,
                    x.id_chi_tiet_tieu_de_cau_hoi,
                    x.chi_tiet_cau_hoi_tieu_de.ten_cau_hoi,
                    x.chi_tiet_cau_hoi_tieu_de.dang_cau_hoi.ten_dang_cau_hoi
                })
                .ToListAsync();
            list_data.AddRange(check_cau_hoi_dkk);
            return Ok(check_cau_hoi_dkk);
        }
        [HttpPost]
        [Route("xoa-cau-hoi-dieu-kien-khac")]
        public async Task<IHttpActionResult> XoaDieuKienKhac(dieu_kien_cau_hoi items)
        {
            var CheckDieuKienKhac = await db.dieu_kien_cau_hoi
                .FirstOrDefaultAsync(x => x.id_cau_hoi_dieu_kien_khac == items.id_cau_hoi_dieu_kien_khac);
            if (CheckDieuKienKhac == null)
            {
                return Ok(new { message = "Không tìm thấy câu hỏi điều kiện khác", success = false });
            }
            else
            {
                db.dieu_kien_cau_hoi.Remove(CheckDieuKienKhac);
                await db.SaveChangesAsync();
                var check_dieu_kien_hien_thi = await db.dieu_kien_cau_hoi
                     .Where(x => x.id_chi_tiet_tieu_de_cau_hoi == items.id_chi_tiet_tieu_de_cau_hoi)
                     .Select(x => x.json_question)
                     .ToListAsync();

                var check_chi_tiet_tieu_de = await db.chi_tiet_cau_hoi_tieu_de
                    .FirstOrDefaultAsync(x => x.id_chi_tiet_cau_hoi_tieu_de == items.id_chi_tiet_tieu_de_cau_hoi);

                if (check_dieu_kien_hien_thi.Any())
                {
                    var dieu_kien_list = check_dieu_kien_hien_thi
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .ToList();

                    var dieu_kien_hien_thi_joined = string.Join(",", dieu_kien_list);

                    check_chi_tiet_tieu_de.dieu_kien_hien_thi = dieu_kien_hien_thi_joined;
                }
                else
                {
                    check_chi_tiet_tieu_de.dieu_kien_hien_thi = null;
                }

                await db.SaveChangesAsync();
                return Ok(new { message = "Xóa câu hỏi điều kiện khác thành công", success = true });
            }
        }
        #endregion
    }
}
