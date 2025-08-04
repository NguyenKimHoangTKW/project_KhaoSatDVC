using CTDT.Models;
using GoogleApi.Entities.Search.Common;
using GoogleApi.Entities.Search.Video.Common;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography.Xml;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.UI.WebControls;
using static CTDT.Areas.Admin.Controllers.GiamSatTyLeThamGiaKhaoSatAPIController;

namespace CTDT.Areas.Admin.Controllers
{
    [Authorize(Roles = "2")]
    [RoutePrefix("api/v1/admin")]
    public class ThongKeKetQuaKhaoSatAPIController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();

        public class option_giam_sat_ty_le_tham_gia_khao_sat
        {
            public int id_hedaotao { get; set; }
            public int id_namhoc { get; set; }
            public string check_option { get; set; }
            public int survey { get; set; }
        }
        [HttpPost]
        [Route("load-bo-loc-thong-ke-ket-qua-khao-sat")]
        public async Task<IHttpActionResult> load_pks_by_year([FromBody] option_giam_sat_ty_le_tham_gia_khao_sat survey)
        {
            var pks = await db.survey
                .Where(x => x.id_namhoc == survey.id_namhoc && x.id_hedaotao == survey.id_hedaotao)
                .Select(x => new
                {
                    id_phieu = x.surveyID,
                    ten_phieu = x.dot_khao_sat.ten_dot_khao_sat != null ? x.surveyTitle + " - " + x.dot_khao_sat.ten_dot_khao_sat : x.surveyTitle,
                })
                .ToListAsync();

            var list_data = new List<dynamic>();
            if (survey.check_option == "true")
            {
                if (survey.id_hedaotao == 3)
                {
                    var get_don_vi = await db.khoa_vien_truong
                   .Where(x => x.id_namhoc == survey.id_namhoc)
                   .Select(x => new
                   {
                       value = x.id_khoa,
                       name = x.ten_khoa
                   })
                   .ToListAsync();

                    foreach (var donvi in get_don_vi)
                    {
                        var get_khoa = await db.khoa_children
                            .Where(x => x.id_khoa_vien_truong == donvi.value)
                            .Select(x => new
                            {
                                value_dv = x.id_khoa_vien_truong,
                                value = x.id_khoa_children,
                                name = x.ten_khoa_children
                            })
                            .ToListAsync();

                        var khoa_data = new List<dynamic>();

                        foreach (var khoa in get_khoa)
                        {
                            var bo_mon = await db.bo_mon
                                .Where(x => x.id_khoa_children == khoa.value)
                                .Select(x => new
                                {
                                    value_k = x.id_khoa_children,
                                    value = x.id_bo_mon,
                                    name = x.ten_bo_mon
                                })
                                .ToListAsync();

                            khoa_data.Add(new
                            {
                                khoa = khoa,
                                bo_mon = bo_mon
                            });
                        }

                        list_data.Add(new
                        {
                            don_vi = donvi,
                            khoa_data = khoa_data
                        });
                    }
                }
                else
                {
                    var latestNamHoc = await db.NamHoc
                        .OrderByDescending(x => x.id_namhoc)
                        .Select(x => x.id_namhoc)
                        .FirstOrDefaultAsync();

                    var get_don_vi = await db.khoa_vien_truong
                        .Where(x => x.id_namhoc == latestNamHoc)
                        .Select(x => new
                        {
                            value = x.id_khoa,
                            name = x.ten_khoa
                        })
                        .ToListAsync();

                    foreach (var donvi in get_don_vi)
                    {
                        var get_khoa = await db.khoa_children
                            .Where(x => x.id_khoa_vien_truong == donvi.value)
                            .Select(x => new
                            {
                                value_dv = x.id_khoa_vien_truong,
                                value = x.id_khoa_children,
                                name = x.ten_khoa_children
                            })
                            .ToListAsync();

                        var khoa_data = new List<dynamic>();

                        foreach (var khoa in get_khoa)
                        {
                            var bo_mon = await db.bo_mon
                                .Where(x => x.id_khoa_children == khoa.value)
                                .Select(x => new
                                {
                                    value_k = x.id_khoa_children,
                                    value = x.id_bo_mon,
                                    name = x.ten_bo_mon
                                })
                                .ToListAsync();

                            khoa_data.Add(new
                            {
                                khoa = khoa,
                                bo_mon = bo_mon
                            });
                        }

                        list_data.Add(new
                        {
                            don_vi = donvi,
                            khoa_data = khoa_data
                        });
                    }
                }
                return Ok(new { data = JsonConvert.SerializeObject(list_data), success = true });

            }
            else if (survey.check_option == "false")
            {
                if (survey.id_hedaotao == 1 || survey.id_hedaotao == 2)
                {
                    var get_ctdt = await db.ctdt
                        .Where(x => x.id_hdt == survey.id_hedaotao)
                    .Select(x => new
                    {
                        value = x.id_ctdt,
                        text = x.ten_ctdt
                    }).ToListAsync();
                    list_data.Add(get_ctdt);
                }
                else
                {
                    var get_ctdt = await db.ctdt
                    .Select(x => new
                    {
                        value = x.id_ctdt,
                        text = x.ten_ctdt
                    }).ToListAsync();
                    list_data.Add(get_ctdt);
                }

            }
            if (list_data.Any())
            {
                return Ok(new { data = JsonConvert.SerializeObject(list_data), success = true });
            }
            else
            {
                return Ok(new { message = "Không có dữ liệu bộ lọc", success = false });
            }
        }
        [HttpPost]
        [Route("giam-sat-ket-qua-khao-sat")]
        public async Task<IHttpActionResult> giam_sat_ket_qua_khao_sat([FromBody] GiamSatThongKeKetQua aw)
        {
            if (aw.surveyID == 0)
            {
                return Ok(new { message = "Không tìm thấy phiếu khảo sát để thống kê", success = false });
            }
            if (aw.check_option == null)
            {
                return Ok(new { message = "Vui lòng chọn chức năng để thống kê", success = false });
            }
            var check_survey = await db.survey.FirstOrDefaultAsync(x => x.surveyID == aw.surveyID);
            var check_answer = db.answer_response
                    .AsNoTracking()
                    .Where(x => x.surveyID == aw.surveyID);

            if (check_survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học" || check_survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
            {
                check_answer = check_answer.Where(x =>
                (aw.id_don_vi == 0 || x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.id_khoa_vien_truong == aw.id_don_vi) &&
                (aw.id_khoa == 0 || x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.id_khoa_children == aw.id_khoa) &&
                (aw.id_bo_mon == 0 || x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.id_bo_mon == aw.id_bo_mon));
                if (aw.id_ctdt != null)
                {
                    check_answer = check_answer.Where(x =>
                         (aw.id_ctdt == 0 || x.nguoi_hoc_khao_sat.sinhvien.lop.id_ctdt == aw.id_ctdt));
                }
            }
            var get_data = await check_answer
                .Select(x => new
                {
                    JsonAnswer = x.json_answer,
                    SurveyJson = x.survey.surveyData
                })
                .ToListAsync();
            var list_count = new List<dynamic>();
            list_count = await load_ty_le_khong_dau_thoi_gian(aw);
            if (list_count.Count > 0)
            {
                List<object> tan_xuat_5_muc = new List<object>();
                List<object> tan_xuat_1_lua_chon = new List<object>();
                List<object> tan_xuat_nhieu_lua_chon = new List<object>();
                List<object> tan_xuat_y_kien_khac = new List<object>();
                tan_xuat_5_muc = cau_hoi_5_muc(get_data);
                tan_xuat_1_lua_chon = cau_hoi_mot_lua_chon(get_data);
                tan_xuat_nhieu_lua_chon = cau_hoi_nhieu_lua_chon(get_data);
                tan_xuat_y_kien_khac = y_kien_khac(get_data);
                return Ok(new
                {
                    rate = JsonConvert.SerializeObject(list_count),
                    five_levels = JsonConvert.SerializeObject(tan_xuat_5_muc),
                    single_levels = JsonConvert.SerializeObject(tan_xuat_1_lua_chon),
                    many_leves = JsonConvert.SerializeObject(tan_xuat_nhieu_lua_chon),
                    other_levels = JsonConvert.SerializeObject(tan_xuat_y_kien_khac),
                    success = true
                });
            }
            else
            {
                return Ok(new
                {
                    message = "Chưa có dữ liệu để thống kê",
                    success = false
                });
            }
        }

        public async Task<List<dynamic>> load_ty_le_khong_dau_thoi_gian([FromBody] GiamSatThongKeKetQua aw)
        {
            var list_count = new List<dynamic>();
            var check_group_pks = await db.survey.FirstOrDefaultAsync(x => x.surveyID == aw.surveyID);
            if (check_group_pks.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học" || check_group_pks.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
            {
                var query = await db.nguoi_hoc_khao_sat.Where(x => x.surveyID == aw.surveyID).ToListAsync();
                var get_ctdt = "Tất cả";
                if (aw.id_don_vi != 0)
                {
                    query = query.Where(x => x.sinhvien.lop.ctdt.id_khoa_vien_truong == aw.id_don_vi).ToList();
                }
                if (aw.id_khoa != 0)
                {
                    query = query.Where(x => x.sinhvien.lop.ctdt.id_khoa_children == aw.id_khoa).ToList();
                }
                if (aw.id_bo_mon != 0)
                {
                    query = query.Where(x => x.sinhvien.lop.ctdt.id_bo_mon == aw.id_bo_mon).ToList();
                }
                if (aw.id_ctdt != null)
                {
                    query = query.Where(x => (aw.id_ctdt == 0 || x.sinhvien.lop.id_ctdt == aw.id_ctdt)).ToList();
                }
                var TotalAll = query.Count;
                var TotalDaKhaoSat = query.Where(x => x.is_khao_sat == 1).ToList();
                double percentage = TotalAll > 0 ? Math.Round(((double)TotalDaKhaoSat.Count / TotalAll) * 100, 2) : 0;
                double unpercentage = TotalAll > 0 ? Math.Round(((double)100 - percentage), 2) : 0;
                var DataCBVC = new
                {
                    ctdt = get_ctdt,
                    tong_khao_sat = TotalAll,
                    tong_phieu_da_tra_loi = TotalDaKhaoSat.Count,
                    tong_phieu_chua_tra_loi = (TotalAll - TotalDaKhaoSat.Count),
                    ty_le_da_tra_loi = percentage,
                    ty_le_chua_tra_loi = unpercentage
                };
                list_count.Add(DataCBVC);
            }
            return list_count;
        }
        public List<object> cau_hoi_5_muc(dynamic get_data)
        {
            Dictionary<string, Dictionary<string, int>> frequency = new Dictionary<string, Dictionary<string, int>>();
            Dictionary<string, List<string>> choices = new Dictionary<string, List<string>>();
            List<string> specificChoices = new List<string>
                {
                    "Hoàn toàn không đồng ý",
                    "Không đồng ý",
                    "Bình thường",
                    "Đồng ý",
                    "Hoàn toàn đồng ý"
                };

            foreach (var response in get_data)
            {
                JObject jsonAnswerObject = JObject.Parse(response.JsonAnswer);
                JObject surveydataObject = JObject.Parse(response.SurveyJson);

                JArray answerPages = (JArray)jsonAnswerObject["pages"];
                JArray surveyPages = (JArray)surveydataObject["pages"];

                foreach (JObject surveyPage in surveyPages)
                {
                    JArray surveyElements = (JArray)surveyPage["elements"];

                    foreach (JObject surveyElement in surveyElements)
                    {
                        string type = surveyElement["type"].ToString();
                        if (type == "radiogroup")
                        {
                            JArray elementChoices = (JArray)surveyElement["choices"];
                            List<string> elementChoiceTexts = elementChoices.Select(c => c["text"].ToString()).ToList();

                            if (elementChoiceTexts.SequenceEqual(specificChoices))
                            {
                                string questionName = surveyElement["name"].ToString();
                                string questionTitle = surveyElement["title"].ToString();

                                if (!choices.ContainsKey(questionTitle))
                                {
                                    choices[questionTitle] = elementChoiceTexts;
                                }

                                foreach (JObject answerPage in answerPages)
                                {
                                    JArray answerElements = (JArray)answerPage["elements"];

                                    foreach (JObject answerElement in answerElements)
                                    {
                                        if (answerElement["name"].ToString() == questionName)
                                        {
                                            string answer = "";

                                            // Xử lý trường hợp other
                                            var responseObj = answerElement["response"];
                                            if (responseObj["name"]?.ToString() == "other" && responseObj["text"] != null)
                                            {
                                                answer = responseObj["text"].ToString();
                                            }
                                            else
                                            {
                                                answer = responseObj["text"]?.ToString() ?? responseObj["name"]?.ToString() ?? "";
                                            }

                                            if (!frequency.ContainsKey(questionTitle))
                                            {
                                                frequency[questionTitle] = new Dictionary<string, int>();
                                            }

                                            if (!frequency[questionTitle].ContainsKey(answer))
                                            {
                                                frequency[questionTitle][answer] = 0;
                                            }

                                            frequency[questionTitle][answer]++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            var results = frequency.Select(f => (object)new
            {
                Question = f.Key,
                TotalResponses = f.Value.Values.Sum(),
                Frequencies = f.Value,
                Percentages = f.Value.ToDictionary(
                    kvp => kvp.Key,
                    kvp => (double)kvp.Value / f.Value.Values.Sum() * 100
                ),
                AverageScore = f.Value.Sum(kvp =>
                {
                    switch (kvp.Key)
                    {
                        case "Hoàn toàn không đồng ý": return kvp.Value * 1;
                        case "Không đồng ý": return kvp.Value * 2;
                        case "Bình thường": return kvp.Value * 3;
                        case "Đồng ý": return kvp.Value * 4;
                        case "Hoàn toàn đồng ý": return kvp.Value * 5;
                        default: return 0;
                    }
                }) / (double)f.Value.Values.Sum()
            }).ToList();

            return results;
        }
        public List<object> cau_hoi_mot_lua_chon(dynamic get_data)
        {
            var questionDataDict = new Dictionary<string, dynamic>();

            List<string> specificChoices = new List<string> {
                    "Hoàn toàn không đồng ý",
                    "Không đồng ý",
                    "Bình thường",
                    "Đồng ý",
                    "Hoàn toàn đồng ý"
                };
            foreach (var response in get_data)
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

                            if (!elementChoiceTexts.SequenceEqual(specificChoices))
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
                                                if (responseName == "other" && !string.IsNullOrEmpty(responseText))
                                                {
                                                    var existing = choiceCounts.Values.FirstOrDefault(c => c.ChoiceText == responseText);
                                                    if (existing != null)
                                                    {
                                                        existing.Count++;
                                                    }
                                                    else
                                                    {
                                                        dynamic newChoice = new ExpandoObject();
                                                        newChoice.ChoiceName = "other";
                                                        newChoice.ChoiceText = responseText;
                                                        newChoice.Count = 1;
                                                        newChoice.Percentage = 0.0;
                                                        choiceCounts[Guid.NewGuid().ToString()] = newChoice;
                                                    }
                                                    totalResponses++;
                                                }
                                                else if (!string.IsNullOrEmpty(responseName) && choiceCounts.ContainsKey(responseName))
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

                                    foreach (var newChoice in choiceCounts.Values)
                                    {
                                        var existingChoice = ((List<dynamic>)existingQuestionData.Choices)
                                            .FirstOrDefault(c => c.ChoiceText == newChoice.ChoiceText);

                                        if (existingChoice != null)
                                        {
                                            existingChoice.Count += newChoice.Count;
                                        }
                                        else
                                        {
                                            ((List<dynamic>)existingQuestionData.Choices).Add(newChoice);
                                        }
                                    }

                                    foreach (var choice in existingQuestionData.Choices)
                                    {
                                        choice.Percentage = existingQuestionData.TotalResponses > 0
                                            ? (double)choice.Count / existingQuestionData.TotalResponses * 100
                                            : 0;
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
                }).ToList()
            }).ToList().Cast<object>().ToList();

            return questionDataList;
        }
        public List<object> cau_hoi_nhieu_lua_chon(dynamic get_data)
        {
            var questionDataDict = new Dictionary<string, dynamic>();

            foreach (var response in get_data)
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
                        if (type == "checkbox")
                        {
                            var questionName = surveyElement["name"].ToString();
                            var questionTitle = surveyElement["title"].ToString();
                            var choices = (JArray)surveyElement["choices"];
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
                                        var responsesArray = (JArray)answerElement["response"]["name"];

                                        foreach (var responseName in responsesArray)
                                        {
                                            var responseString = responseName.ToString();

                                            if (responseString == "other")
                                            {
                                                var responseTextArray = answerElement["response"]["text"] as JArray;
                                                if (responseTextArray != null && responseTextArray.Count > 0)
                                                {
                                                    string otherText = responseTextArray.Last.ToString();

                                                    var existingOther = choiceCounts.Values
                                                        .FirstOrDefault(c => c.ChoiceName == "other" && c.ChoiceText == otherText);

                                                    if (existingOther != null)
                                                    {
                                                        existingOther.Count++;
                                                    }
                                                    else
                                                    {
                                                        dynamic newOther = new ExpandoObject();
                                                        newOther.ChoiceName = "other";
                                                        newOther.ChoiceText = otherText;
                                                        newOther.Count = 1;
                                                        newOther.Percentage = 0.0;
                                                        choiceCounts[Guid.NewGuid().ToString()] = newOther;
                                                    }
                                                    totalResponses++;
                                                }
                                            }
                                            else if (choiceCounts.ContainsKey(responseString))
                                            {
                                                choiceCounts[responseString].Count++;
                                                totalResponses++;
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

                                foreach (var newChoice in choiceCounts.Values)
                                {
                                    var matched = ((List<dynamic>)existingQuestionData.Choices)
                                        .FirstOrDefault(c => c.ChoiceName == newChoice.ChoiceName && c.ChoiceText == newChoice.ChoiceText);

                                    if (matched != null)
                                    {
                                        matched.Count += newChoice.Count;
                                        matched.Percentage = existingQuestionData.TotalResponses > 0
                                            ? (double)matched.Count / existingQuestionData.TotalResponses * 100
                                            : 0;
                                    }
                                    else
                                    {
                                        ((List<dynamic>)existingQuestionData.Choices).Add(newChoice);
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
                }).ToList()
            }).ToList<object>();

            return questionDataList;
        }

        public List<object> y_kien_khac(dynamic get_data)
        {
            var questionDataList = new List<dynamic>();

            foreach (var response in get_data)
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
                        if (type == "comment" || type == "text")
                        {
                            var questionName = surveyElement["name"].ToString();
                            var questionTitle = surveyElement["title"].ToString();
                            var responsesList = new List<string>();

                            foreach (JObject answerPage in answerPages)
                            {
                                var answerElements = (JArray)answerPage["elements"];

                                foreach (JObject answerElement in answerElements)
                                {
                                    if (answerElement["name"].ToString() == questionName)
                                    {
                                        var responseText = answerElement["response"]["text"].ToString();
                                        if (!string.IsNullOrEmpty(responseText))
                                        {
                                            responsesList.Add(responseText);
                                        }
                                    }
                                }
                            }

                            var existingQuestion = questionDataList.FirstOrDefault(q => q.QuestionName == questionName);

                            if (existingQuestion != null)
                            {
                                existingQuestion.Responses.AddRange(responsesList);
                            }
                            else
                            {
                                var questionData = new
                                {
                                    QuestionName = questionName,
                                    QuestionTitle = questionTitle,
                                    Responses = responsesList
                                };

                                questionDataList.Add(questionData);
                            }
                        }
                    }
                }
            }


            return questionDataList;
        }
        // Hàm xuất dữ liệu thô
        [HttpPost]
        [Route("export-du-lieu-tho")]
        public async Task<IHttpActionResult> export_du_lieu_tho([FromBody] GiamSatThongKeKetQua aw)
        {
            var check_group_pks = await db.survey.FirstOrDefaultAsync(x => x.surveyID == aw.surveyID);
            IQueryable<answer_response> query = db.answer_response
                    .AsNoTracking()
                    .Where(x => x.surveyID == aw.surveyID);
            bool is_subject = false;
            bool is_student = false;
            bool is_staff = false;
            bool is_program = false;
            bool is_gv = false;
            bool is_gv_ctdt = false;

            List<JObject> surveyData = new List<JObject>();

            if (check_group_pks.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu người học" || check_group_pks.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat == "Phiếu cựu người học")
            {
                if (aw.id_don_vi != 0)
                {
                    query = query.Where(x => x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.id_khoa_vien_truong == aw.id_don_vi);
                }
                if (aw.id_khoa != 0)
                {
                    query = query.Where(x => x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.id_khoa_children == aw.id_khoa);
                }
                if (aw.id_bo_mon != 0)
                {
                    query = query.Where(x => x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.id_bo_mon == aw.id_bo_mon);
                }
                if (aw.id_ctdt != null)
                {
                    query = query.Where(x => (aw.id_ctdt == 0 || x.nguoi_hoc_khao_sat.sinhvien.lop.id_ctdt == aw.id_ctdt));
                }
                is_student = true;
                var rawAnswers = await query
                     .Select(x => new
                     {
                         x.time,
                         x.survey.surveyData,
                         x.json_answer,
                         Email = x.users.email,
                         ma_nh = x.nguoi_hoc_khao_sat.sinhvien.ma_sv,
                         ten_nh = x.nguoi_hoc_khao_sat.sinhvien.hovaten,
                         gioi_tinh = x.nguoi_hoc_khao_sat.sinhvien.phai,
                         ngaysinh = x.nguoi_hoc_khao_sat.sinhvien.ngaysinh,
                         thuoc_lop = x.nguoi_hoc_khao_sat.sinhvien.lop.ma_lop,
                         thuoc_ctdt = x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.ten_ctdt,
                         thuoc_don_vi = x.nguoi_hoc_khao_sat.sinhvien.lop.ctdt.khoa_vien_truong.ten_khoa,
                         mo_ta = x.nguoi_hoc_khao_sat.sinhvien.description
                     })
                     .ToListAsync();

                var answers = rawAnswers.Select(x => new
                {
                    DauThoiGian = x.time,
                    x.json_answer,
                    x.Email,
                    x.ma_nh,
                    x.ten_nh,
                    x.gioi_tinh,
                    ngaysinh = x.ngaysinh?.ToString("dd-MM-yyyy") ?? " ",
                    x.thuoc_lop,
                    x.thuoc_ctdt,
                    x.thuoc_don_vi,
                    mo_ta = x.mo_ta ?? ""
                }).ToList();


                foreach (var answer in answers)
                {
                    JObject answerObject = JObject.Parse(answer.json_answer);
                    answerObject["DauThoiGian"] = answer.DauThoiGian;
                    answerObject["Email"] = answer.Email;
                    answerObject["MaNH"] = answer.ma_nh;
                    answerObject["TenNH"] = answer.ten_nh;
                    answerObject["GioiTinh"] = answer.gioi_tinh;
                    answerObject["ThuocLop"] = answer.thuoc_lop;
                    answerObject["ThuocCTDT"] = answer.thuoc_ctdt;
                    answerObject["ThuocDonVi"] = answer.thuoc_don_vi;
                    answerObject["NgaySinh"] = answer.ngaysinh;
                    answerObject["MoTa"] = answer.mo_ta;
                    surveyData.Add(answerObject);
                }
            }
            if (surveyData.Count > 0)
            {
                if (is_subject)
                {
                    return Ok(new { data = surveyData, success = true, is_subject = true });
                }
                else if (is_student)
                {
                    return Ok(new { data = surveyData, success = true, is_student = true });
                }
                else if (is_program)
                {
                    return Ok(new { data = surveyData, success = true, is_program = true });
                }
                else if (is_staff)
                {
                    return Ok(new { data = surveyData, success = true, is_staff = true });
                }
                else if (is_gv)
                {
                    return Ok(new { data = surveyData, success = true, is_gv = true });
                }
                else if (is_gv_ctdt)
                {
                    return Ok(new { data = surveyData, success = true, is_gv_ctdt = true });
                }
            }
            return Ok(new { message = "Không tìm thấy dữ liệu", success = false });
        }
    }
}
