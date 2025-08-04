using CTDT.Helper;
using CTDT.Models;
using CTDT.Models.Khoa;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Dynamic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Script.Serialization;
using System.Web.UI.WebControls;

namespace CTDT.Areas.CTDT.Controllers
{
    [Authorize(Roles = "3")]
    [RoutePrefix("api/v1/ctdt")]
    public class BaoCaoTongHopKetQuaKhaoSatCTDTAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        private users user;

        public BaoCaoTongHopKetQuaKhaoSatCTDTAPIController()
        {
            user = SessionHelper.GetUser();
        }
        public async Task<List<int?>> GetUserCTDTAsync()
        {
            return await db.phan_quyen_users
                .Where(x => x.id_users == user.id_users)
                .Select(x => x.id_ctdt)
                .ToListAsync();
        }
        public class option_bao_cao_tong_hop_donvi
        {
            public int namhoc { get; set; }
            public int hedaotao { get; set; }
            public string check_option { get; set; }
        }
        [HttpPost]
        [Route("load_option_bao_cao_tong_hop")]
        public async Task<IHttpActionResult> load_pks_by_year([FromBody] option_bao_cao_tong_hop_donvi option)
        {
            var pks = await db.survey
                .Where(x => x.id_namhoc == option.namhoc && x.id_hedaotao == option.hedaotao && x.mo_thong_ke == 1 && x.hedaotao.is_statistical == 1)
                .Select(x => new
                {
                    id_phieu = x.surveyID,
                    ten_phieu = x.dot_khao_sat.ten_dot_khao_sat != null ? x.surveyTitle + " - " + x.dot_khao_sat.ten_dot_khao_sat : x.surveyTitle,
                })
                .ToListAsync();
            var sortedPks = pks.OrderBy(p =>
            {
                var match = System.Text.RegularExpressions.Regex.Match(p.ten_phieu, @"Phiếu (\d+)");
                return match.Success ? int.Parse(match.Groups[1].Value) : int.MaxValue;
            }).ToList();
            if (sortedPks.Any())
            {
                return Ok(new { survey = JsonConvert.SerializeObject(sortedPks), success = true });
            }
            else
            {
                return Ok(new { message = "Không có dữ liệu phiếu khảo sát", success = false });
            }
        }
        [HttpPost]
        [Route("bao-cao-tong-hop-ket-qua-khao-sat")]
        public async Task<IHttpActionResult> bao_cao_tong_hop_ket_qua_khao_sat([FromBody] GiamSatThongKeKetQua giamsat)
        {
            var response = new List<dynamic>();
            var check_role = "";
            foreach (var items in giamsat.surveyList)
            {
                var query = await db.survey
                    .Where(x =>
                        x.id_namhoc == giamsat.id_namhoc &&
                        x.id_hedaotao == giamsat.id_hdt &&
                        x.surveyID == items &&
                        x.mo_thong_ke == 1)
                    .ToListAsync();

                var sortedSurveys = query
                    .OrderBy(s => s.surveyTitle.Split('.').FirstOrDefault())
                    .ThenBy(s => s.surveyTitle)
                    .ToList();
                var namhoc = await db.NamHoc
                    .Where(x => x.id_namhoc == giamsat.id_namhoc)
                    .OrderByDescending(x => x.id_namhoc)
                    .Select(x => new
                    {
                        x.id_namhoc
                    })
                    .FirstOrDefaultAsync();
                await bao_cao_tong_hop_no_dtg(sortedSurveys, namhoc.id_namhoc, response, check_role, giamsat);
            }

            if (response.Count > 0)
            {
                return Ok(new { results = JsonConvert.SerializeObject(response), success = true });
            }
            else
            {
                return Ok(new { message = "Không có dữ liệu để thống kê báo cáo", success = false });
            }
        }
        public async Task<List<dynamic>> bao_cao_tong_hop_no_dtg(IEnumerable<survey> sortedSurveys, int id_nam_hoc, dynamic response, string check_role, GiamSatThongKeKetQua giamsat)
        {
            var get_user_ctdt = await GetUserCTDTAsync();
            foreach (var survey in sortedSurveys)
            {
                var list_data = new List<dynamic>();

                 if (survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học" || survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
                {
                    var ctdt = await db.ctdt.Where(x => get_user_ctdt.Contains(x.id_ctdt)).ToListAsync();
                    foreach (var _ctdt in ctdt)
                    {
                        var mucdohailong = new List<dynamic>();
                        await muc_do_hai_long(survey, mucdohailong, _ctdt.id_ctdt, survey.surveyID, giamsat);
                        var nguoihoc = await db.nguoi_hoc_khao_sat
                            .Where(x => x.surveyID == survey.surveyID && x.sinhvien.lop.id_ctdt == _ctdt.id_ctdt)
                            .ToListAsync();
                        var TotalAll = nguoihoc.Count();
                        var TotalDaKhaoSat = nguoihoc.Where(x => x.is_khao_sat == 1).ToList();
                        double percentage = TotalAll > 0 ? Math.Round(((double)TotalDaKhaoSat.Count / TotalAll) * 100, 2) : 0;
                        double unpercentage = TotalAll > 0 ? Math.Round(((double)100 - percentage), 2) : 0;
                        if(TotalAll > 0)
                        {
                            list_data.Add(new
                            {
                                ctdt = _ctdt.ten_ctdt,
                                tong_khao_sat = TotalAll,
                                tong_phieu_da_tra_loi = TotalDaKhaoSat.Count,
                                tong_phieu_chua_tra_loi = (TotalAll - TotalDaKhaoSat.Count),
                                ty_le_da_tra_loi = percentage,
                                ty_le_chua_tra_loi = unpercentage,
                                muc_do_hai_long = mucdohailong

                            });
                        }     
                    }
                    check_role = "is_nghoc";
                }
   
                response.Add(new
                {
                    survey = survey.surveyTitle,
                    from_date = survey.surveyTimeStart,
                    to_date = survey.surveyTimeEnd,
                    data = list_data,
                    role = check_role
                });
            }
            return response;
        }
        private async Task muc_do_hai_long(survey survey, dynamic MucDoHaiLong, int? idctdt, int? idsurvey, GiamSatThongKeKetQua giamsat)
        {
            var Mucdohailong = db.answer_response
                .Where(d => d.surveyID == idsurvey && d.nguoi_hoc_khao_sat.sinhvien.lop.id_ctdt == idctdt)
                .AsEnumerable()
                .AsQueryable();

            var responses = await Mucdohailong
                .Select(x => new { IDPhieu = x.surveyID, JsonAnswer = x.json_answer, SurveyJson = x.survey.surveyData })
                .ToListAsync();

            var questionDataDict = new Dictionary<string, dynamic>();

            List<string> set1 = new List<string> {
        "Hoàn toàn không đồng ý", "Không đồng ý", "Bình thường", "Đồng ý", "Hoàn toàn đồng ý"
    };

            List<string> set2 = new List<string> {
        "Rất không hài lòng", "Không hài lòng", "Bình thường", "Hài lòng", "Rất hài lòng"
    };

            foreach (var response in responses)
            {
                var surveyDataObject = JObject.Parse(response.SurveyJson);
                var answerDataObject = JObject.Parse(response.JsonAnswer);
                var surveyPages = (JArray)surveyDataObject["pages"];
                var answerPages = (JArray)answerDataObject["pages"];

                foreach (JObject surveyPage in surveyPages)
                {
                    var surveyElements = (JArray)surveyPage["elements"];

                    foreach (JObject surveyElement in surveyElements)
                    {
                        var type = surveyElement["type"].ToString();
                        if (type == "radiogroup")
                        {
                            var questionName = surveyElement["name"].ToString();
                            var questionTitle = surveyElement["title"].ToString();
                            var choices = (JArray)surveyElement["choices"];
                            List<string> elementChoiceTexts = choices.Select(c => c["text"].ToString()).ToList();

                            if (elementChoiceTexts.SequenceEqual(set1) || elementChoiceTexts.SequenceEqual(set2))
                            {
                                var choiceCounts = choices.ToDictionary(
                                    c => c["name"].ToString(),
                                    c =>
                                    {
                                        dynamic choice = new ExpandoObject();
                                        choice.ChoiceName = c["name"].ToString();
                                        choice.ChoiceText = c["text"].ToString();
                                        choice.Count = 0;
                                        choice.Percentage = 0.0;
                                        return choice;
                                    }
                                );

                                int totalResponses = 0;
                                foreach (JObject answerPage in answerPages)
                                {
                                    var answerElements = (JArray)answerPage["elements"];
                                    foreach (JObject answerElement in answerElements)
                                    {
                                        if (answerElement["name"].ToString() == questionName)
                                        {
                                            var responseObject = answerElement["response"];
                                            if (responseObject != null)
                                            {
                                                string responseName = responseObject["name"]?.ToString();
                                                string responseText = responseObject["text"]?.ToString();

                                                if (!string.IsNullOrEmpty(responseName) && choiceCounts.ContainsKey(responseName))
                                                {
                                                    choiceCounts[responseName].Count++;
                                                    totalResponses++;
                                                }
                                                else if (!string.IsNullOrEmpty(responseText))
                                                {
                                                    var matchingChoice = choiceCounts.Values.FirstOrDefault(c => c.ChoiceText == responseText);
                                                    if (matchingChoice != null)
                                                    {
                                                        matchingChoice.Count++;
                                                        totalResponses++;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                foreach (var choice in choiceCounts.Values)
                                {
                                    choice.Percentage = totalResponses > 0 ? (double)choice.Count / totalResponses * 100 : 0;
                                }

                                if (questionDataDict.ContainsKey(questionName))
                                {
                                    var existingQuestionData = questionDataDict[questionName];
                                    existingQuestionData.TotalResponses += totalResponses;

                                    foreach (var existingChoice in existingQuestionData.Choices)
                                    {
                                        var matchingNewChoice = choiceCounts.Values.FirstOrDefault(c => c.ChoiceName == existingChoice.ChoiceName);
                                        if (matchingNewChoice != null)
                                        {
                                            existingChoice.Count += matchingNewChoice.Count;
                                            existingChoice.Percentage = existingQuestionData.TotalResponses > 0
                                                ? (double)existingChoice.Count / existingQuestionData.TotalResponses * 100
                                                : 0;
                                        }
                                    }
                                }
                                else
                                {
                                    dynamic questionData = new ExpandoObject();
                                    questionData.QuestionName = questionName;
                                    questionData.QuestionTitle = questionTitle;
                                    questionData.TotalResponses = totalResponses;
                                    questionData.Choices = choiceCounts.Values.ToList();
                                    questionDataDict[questionName] = questionData;
                                }
                            }
                        }
                    }
                }
            }

            var questionDataList = questionDataDict.Values.Select(q => new
            {
                q.QuestionName,
                q.QuestionTitle,
                q.TotalResponses,
                Choices = ((List<dynamic>)q.Choices).Select(c => new
                {
                    c.ChoiceName,
                    c.ChoiceText,
                    c.Count,
                    c.Percentage
                }).ToList(),
                AverageScore = ((List<dynamic>)q.Choices).Sum(c =>
                {
                    switch (c.ChoiceText)
                    {
                        case "Hoàn toàn không đồng ý":
                        case "Rất không hài lòng":
                            return c.Count * 1;
                        case "Không đồng ý":
                        case "Không hài lòng":
                            return c.Count * 2;
                        case "Bình thường":
                            return c.Count * 3;
                        case "Đồng ý":
                        case "Hài lòng":
                            return c.Count * 4;
                        case "Hoàn toàn đồng ý":
                        case "Rất hài lòng":
                            return c.Count * 5;
                        default:
                            return 0;
                    }
                }) / (double)q.TotalResponses,
                MucDoHaiLong = ((List<dynamic>)q.Choices).Where(c =>
                    c.ChoiceText == "Đồng ý" ||
                    c.ChoiceText == "Hoàn toàn đồng ý" ||
                    c.ChoiceText == "Hài lòng" ||
                    c.ChoiceText == "Rất hài lòng"
                ).Sum(c => (double)c.Percentage)
            }).ToList();

            var totalMucDoHaiLong = questionDataList.Sum(x => x.MucDoHaiLong);
            var totalPhieu = questionDataList.Count();
            var totalAverageScore = questionDataList.Sum(x => x.AverageScore);

            var GetDataMucDoHaiLong = new
            {
                avg_ty_le_hai_long = totalPhieu > 0 ? Math.Round(((double)totalMucDoHaiLong / totalPhieu), 2) : 0,
                avg_score = totalPhieu > 0 ? Math.Round(((double)totalAverageScore / totalPhieu), 2) : 0
            };

            MucDoHaiLong.Add(GetDataMucDoHaiLong);
        }
    }
}
