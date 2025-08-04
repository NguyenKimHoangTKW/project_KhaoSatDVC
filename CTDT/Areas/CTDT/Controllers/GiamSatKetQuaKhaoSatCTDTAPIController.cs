using CTDT.Helper;
using CTDT.Models;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Web.Http;
using System.Web.Script.Serialization;
using Microsoft.Ajax.Utilities;
using CTDT.Models.Khoa;
using FirebaseAdmin.Auth;
using System.Threading.Tasks;
using System.Data.Entity;
using System.Text.RegularExpressions;
namespace CTDT.Areas.CTDT.Controllers
{
    [Authorize(Roles = "3")]
    [RoutePrefix("api/v1/ctdt")]
    public class GiamSatKetQuaKhaoSatCTDTAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        private users user;

        public GiamSatKetQuaKhaoSatCTDTAPIController()
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
        [HttpPost]
        [Route("giam-sat-ty-le-tham-gia-khao-sat-theo-nam-dashboard")]
        public async Task<IHttpActionResult> load_charts_nguoi_hoc([FromBody] GiamSatThongKeKetQua find)
        {
            var get_user_ctdt = await GetUserCTDTAsync();
            var List_data = new List<dynamic>();
            var survey = await db.survey
                .Where(x => x.id_namhoc == find.id_namhoc && x.mo_thong_ke == 1 && x.hedaotao.is_statistical == 1)
                .ToListAsync();
            if (find.id_namhoc != null)
            {
                survey = survey.Where(x => x.id_namhoc == find.id_namhoc).ToList();
            }
            foreach (var items in survey)
            {

                if (items.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học" || items.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
                {
                    var query = await db.nguoi_hoc_khao_sat
                        .Where(x => x.surveyID == items.surveyID && get_user_ctdt.Contains(x.sinhvien.lop.id_ctdt))
                        .ToListAsync();
                    var TotalAll = query.Count;
                    var idphieu = db.survey.Where(x => x.surveyID == items.surveyID).FirstOrDefault();
                    var TotalDaKhaoSat = query.Where(x => x.is_khao_sat == 1).ToList();
                    double percentage = TotalAll > 0 ? Math.Round(((double)TotalDaKhaoSat.Count / TotalAll) * 100, 2) : 0;
                    double unpercentage = TotalAll > 0 ? Math.Round(((double)100 - percentage), 2) : 0;
                    var DataCBVC = new
                    {
                        id_phieu = items.surveyID,
                        ten_phieu = items.surveyTitle,
                        he_dao_tao = items.hedaotao.ten_hedaotao,
                        tong_khao_sat = TotalAll,
                        tong_phieu_da_tra_loi = TotalDaKhaoSat.Count,
                        tong_phieu_chua_tra_loi = (TotalAll - TotalDaKhaoSat.Count),
                        ty_le_da_tra_loi = percentage,
                        ty_le_chua_tra_loi = unpercentage,
                        ty_le_can_dat = items.ty_le_phan_tram_dat
                    };
                    List_data.Add(DataCBVC);
                }
            }
            if (List_data.Count > 0)
            {
                return Ok(new { data = JsonConvert.SerializeObject(List_data), success = true });
            }
            else
            {
                return Ok(new { message = "Chưa có dữ liệu khảo sát trong năm học để thống kê", success = false });
            }
        }
        [HttpPost]
        [Route("giam-sat-ket-qua-khao-sat-theo-nam-dashboard")]
        public async Task<IHttpActionResult> load_chart_ket_qua_khao_sat([FromBody] GiamSatThongKeKetQua find)
        {
            var get_user_ctdt = await GetUserCTDTAsync();
            var surveyList = await db.survey
                .Where(x => x.id_namhoc == find.id_namhoc && x.mo_thong_ke == 1 && x.hedaotao.is_statistical == 1)
                .Select(x => new
                {
                    x.surveyID,
                    x.surveyTitle,
                    x.id_hedaotao,
                    ten_hedaotao = x.hedaotao.ten_hedaotao,
                    x.surveyData,
                    LoaiKhaoSat = new
                    {
                        x.id_loaikhaosat,
                        group_name = x.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat
                    }
                }).ToListAsync();

            var surveyIds = surveyList.Select(x => x.surveyID).ToList();

            var allAnswers = await db.answer_response
                .Where(x => surveyIds.Contains(x.surveyID))
                .Select(x => new
                {
                    x.surveyID,
                    x.json_answer,
                    surveyJson = x.survey.surveyData,
                    id_nghoc_thuoc_dv = (int?)x.nguoi_hoc_khao_sat.sinhvien.lop.id_ctdt,
                }).ToListAsync();

            var List_data = new List<dynamic>();

            var surveysByHe = surveyList
                .GroupBy(x => new { x.id_hedaotao, x.ten_hedaotao });

            foreach (var group in surveysByHe)
            {
                var mucdoTasks = group.Select(async survey =>
                {
                    var mucdohailong = new List<dynamic>();

                    var relatedAnswers = allAnswers
                        .Where(x => x.surveyID == survey.surveyID)
                        .ToList();
                    if (survey.LoaiKhaoSat.group_name == "Phiếu người học" || survey.LoaiKhaoSat.group_name == "Phiếu cựu người học")
                    {
                        relatedAnswers = relatedAnswers.Where(x => get_user_ctdt.Contains(x.id_nghoc_thuoc_dv)).ToList();
                    }
                    await muc_do_hai_long_optimized(survey, relatedAnswers.Cast<dynamic>().ToList(), mucdohailong);
                    return new
                    {
                        id_phieu = survey.surveyID,
                        ten_phieu = survey.surveyTitle,
                        muc_do_hai_long = mucdohailong
                    };
                });

                var list_survey = await Task.WhenAll(mucdoTasks);

                List_data.Add(new
                {
                    ten_hedaotao = group.Key.ten_hedaotao,
                    survey = list_survey
                });
            }

            return Ok(JsonConvert.SerializeObject(List_data));
        }
        private async Task muc_do_hai_long_optimized(dynamic survey, List<dynamic> relatedAnswers, List<dynamic> MucDoHaiLong)
        {


            var specificChoices = new List<string> {
                    "Hoàn toàn không đồng ý", "Không đồng ý", "Bình thường", "Đồng ý", "Hoàn toàn đồng ý"
                };

            var specificChoicesHaiLong = new List<string> {
                    "Rất không hài lòng", "Không hài lòng", "Bình thường", "Hài lòng", "Rất hài lòng"
                };

            var scoreMap = new Dictionary<string, int> {
                    { "Hoàn toàn không đồng ý", 1 }, { "Không đồng ý", 2 }, { "Bình thường", 3 },
                    { "Đồng ý", 4 }, { "Hoàn toàn đồng ý", 5 },
                    { "Rất không hài lòng", 1 }, { "Không hài lòng", 2 },
                    { "Hài lòng", 4 }, { "Rất hài lòng", 5 }
                };

            var questionDataDict = new Dictionary<string, dynamic>();

            foreach (var response in relatedAnswers)
            {
                var surveyDataObject = JObject.Parse((string)survey.surveyData);
                var answerDataObject = JObject.Parse(response.json_answer);

                var surveyPages = (JArray)surveyDataObject["pages"];
                var answerPages = (JArray)answerDataObject["pages"];

                foreach (JObject surveyPage in surveyPages)
                {
                    var surveyElements = (JArray)surveyPage["elements"];
                    foreach (JObject surveyElement in surveyElements)
                    {
                        if (surveyElement["type"]?.ToString() != "radiogroup") continue;

                        var questionName = surveyElement["name"]?.ToString();
                        var questionTitle = surveyElement["title"]?.ToString();
                        var choices = (JArray)surveyElement["choices"];
                        var elementChoiceTexts = choices.Select(c => c["text"].ToString()).ToList();

                        bool isValidChoiceSet = elementChoiceTexts.SequenceEqual(specificChoices) ||
                                                elementChoiceTexts.SequenceEqual(specificChoicesHaiLong);
                        if (!isValidChoiceSet) continue;

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
                            });

                        int totalResponses = 0;

                        foreach (JObject answerPage in answerPages)
                        {
                            var answerElements = (JArray)answerPage["elements"];
                            foreach (JObject answerElement in answerElements)
                            {
                                if (answerElement["name"]?.ToString() != questionName) continue;

                                var responseObject = answerElement["response"];
                                if (responseObject == null) continue;

                                string responseName = responseObject["name"]?.ToString();
                                string responseText = responseObject["text"]?.ToString();

                                if (!string.IsNullOrEmpty(responseName) && choiceCounts.ContainsKey(responseName))
                                {
                                    choiceCounts[responseName].Count++;
                                    totalResponses++;
                                }
                                else if (!string.IsNullOrEmpty(responseText))
                                {
                                    var match = choiceCounts.Values.FirstOrDefault(c => c.ChoiceText == responseText);
                                    if (match != null)
                                    {
                                        match.Count++;
                                        totalResponses++;
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
                            var existing = questionDataDict[questionName];
                            existing.TotalResponses += totalResponses;

                            foreach (var oldChoice in existing.Choices)
                            {
                                var newChoice = choiceCounts.Values.FirstOrDefault(c => c.ChoiceName == oldChoice.ChoiceName);
                                if (newChoice != null)
                                {
                                    oldChoice.Count += newChoice.Count;
                                    oldChoice.Percentage = existing.TotalResponses > 0
                                        ? (double)oldChoice.Count / existing.TotalResponses * 100
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
                    scoreMap.TryGetValue(c.ChoiceText, out int score) ? c.Count * score : 0
                ) / (double)q.TotalResponses,
                MucDoHaiLong = ((List<dynamic>)q.Choices).Where(c =>
                    c.ChoiceText == "Đồng ý" || c.ChoiceText == "Hoàn toàn đồng ý" ||
                    c.ChoiceText == "Hài lòng" || c.ChoiceText == "Rất hài lòng"
                ).Sum(c => (double)c.Percentage)
            }).ToList();

            var totalMucDoHaiLong = questionDataList.Sum(x => x.MucDoHaiLong);
            var totalPhieu = questionDataList.Count();
            var totalAverageScore = questionDataList.Sum(x => x.AverageScore);

            var GetDataMucDoHaiLong = new
            {
                avg_ty_le_hai_long = totalPhieu > 0 ? Math.Round(totalMucDoHaiLong / totalPhieu, 2) : 0,
                avg_score = totalPhieu > 0 ? Math.Round(totalAverageScore / totalPhieu, 2) : 0
            };

            MucDoHaiLong.Add(GetDataMucDoHaiLong);
        }
    }
}
