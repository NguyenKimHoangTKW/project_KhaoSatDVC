using CTDT.Helper;
using CTDT.Models;
using Newtonsoft.Json;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.UI.WebControls;

namespace CTDT.Areas.Admin.Controllers
{
    [Authorize(Roles = "2")]
    [RoutePrefix("api/v1/admin")]
    public class MailManagerApiController : ApiController
    {
        dbSurveyEntities db = new dbSurveyEntities();
        private int unixTimestamp;
        private users user;
        public MailManagerApiController()
        {
            DateTime now = DateTime.UtcNow;
            unixTimestamp = (int)(now.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            user = SessionHelper.GetUser();
        }
        [HttpPost]
        [Route("load-phieu-khao-sat-chuc-nang-mail-manager")]
        public async Task<IHttpActionResult> LoadPhieuKhaoSat([FromBody] survey items)
        {
            var ListData = new List<object>();
            var get_survey = await db.survey
                .Where(x => x.id_hedaotao == items.id_hedaotao && x.id_namhoc == items.id_namhoc)
                .Select(x => new
                {
                    x.surveyID,
                    x.surveyTitle
                })
                .ToListAsync();
            ListData.AddRange(get_survey);
            if (ListData.Count > 0)
            {
                return Ok(new { data = get_survey, success = true });
            }
            else
            {
                return Ok(new { message = "Không có dữ liệu phiếu khảo sát  trong hệ hoặc năm học", success = false });
            }
        }
        [HttpPost]
        [Route("info-dap-vien-chua-khao-sat-cua-phieu-thuoc-mail-manager")]
        public async Task<IHttpActionResult> load_info_dap_vien_khao_sat([FromBody] GiamSatThongKeKetQua find)
        {
            var check_survey = await db.survey
                .FirstOrDefaultAsync(x => x.surveyID == find.surveyID);
            var list_data = new List<dynamic>();
            int totalRecords = 0;
            string responseType = "";
            var surveyGroup = check_survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat;
            var surveyType = check_survey.id_loaikhaosat;

            if (surveyGroup == "Phiếu người học" || surveyGroup == "Phiếu cựu người học")
            {
                var query = db.nguoi_hoc_khao_sat.Where(x => x.surveyID == find.surveyID && x.is_khao_sat == 0).AsQueryable();
                totalRecords = await query.CountAsync();
                var _list_data = await query
                    .OrderBy(x => x.id_nguoi_hoc_khao_sat)
                    .Skip((find.page - 1) * find.pageSize)
                    .Take(find.pageSize)
                    .Select(x => new
                    {
                        ma_nh = x.sinhvien.ma_sv,
                        ten_nh = x.sinhvien.hovaten,
                        lop = x.sinhvien.lop.ma_lop,
                        sdt = x.sinhvien.sodienthoai,
                        mota = x.sinhvien.description,
                        email_khao_sat = x.sinhvien.ma_sv + "@student.tdmu.edu.vn",
                        trang_thai = x.is_khao_sat == 1 ? "Đã khảo sát" : "Chưa khảo sát"
                    })
                    .ToListAsync();
                list_data.Add(_list_data);
                responseType = "is_nguoi_hoc";
            }

            if (list_data.Any())
            {
                return Ok(new
                {
                    data = JsonConvert.SerializeObject(list_data),
                    responseType,
                    totalRecords,
                    totalPages = (int)Math.Ceiling((double)totalRecords / find.pageSize),
                    currentPage = find.page,
                    success = true
                });
            }
            return Ok(new { message = "Không có dữ liệu", success = false });
        }

        [HttpPost]
        [Route("lay-email-thuoc-phieu-mail-manager")]
        public async Task<IHttpActionResult> LayDanhSachMailThuocPhieu([FromBody] survey items)
        {
            var list_data = new List<dynamic>();
            var check_survey = await db.survey
                .FirstOrDefaultAsync(x => x.surveyID == items.surveyID);
            var surveyGroup = check_survey.LoaiKhaoSat.group_loaikhaosat.name_gr_loaikhaosat;
            var surveyType = check_survey.id_loaikhaosat;

            if (surveyGroup == "Phiếu người học" || surveyGroup == "Phiếu cựu người học")
            {
                var query = db.nguoi_hoc_khao_sat.Where(x => x.surveyID == items.surveyID && x.is_khao_sat == 0).AsQueryable();
                var _list_data = await query
                    .Select(x => new
                    {
                        email_khao_sat = x.sinhvien.ma_sv + "@student.tdmu.edu.vn",
                    })
                    .ToListAsync();
                list_data.AddRange(_list_data);
            }
           
            if (list_data.Count > 0)
            {

                return Ok(new { data = list_data, message = "Lấy danh sách Mail trong phiếu thành công", success = true });
            }
            else
            {
                return Ok(new { message = "Không có danh sách Mail trong phiếu này", success = false });
            }
        }
        [HttpPost]
        [Route("upload-excel-mail-manager")]
        public async Task<IHttpActionResult> UploadExcelNguoiHoc()
        {
            var provider = new MultipartMemoryStreamProvider();
            await Request.Content.ReadAsMultipartAsync(provider);

            foreach (var file in provider.Contents)
            {
                var fileName = file.Headers.ContentDisposition.FileName.Trim('\"');
                var fileStream = await file.ReadAsStreamAsync();

                if (fileName.EndsWith(".xlsx") || fileName.EndsWith(".xls"))
                {
                    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                    using (var package = new ExcelPackage(fileStream))
                    {
                        var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                        if (worksheet == null)
                        {
                            return Ok(new { status = "Không tìm thấy worksheet trong file Excel", success = false });
                        }

                        var ListData = new List<object>();
                        for (int row = 2; row <= worksheet.Dimension.End.Row; row++)
                        {
                            var email = worksheet.Cells[row, 1].Text.Trim();
                            ListData.Add(new { email_khao_sat = email });
                        }

                        return Ok(new { data = ListData, message = "Import dữ liệu thành công", success = true });
                    }
                }
                else
                {
                    return Ok(new { message = "Chỉ hỗ trợ upload file Excel.", success = false });
                }
            }
            return Ok(new { message = "Vui lòng chọn file Excel.", success = false });
        }

        public class SendMailRequest
        {
            public List<string> Emails { get; set; }
            public string Subject { get; set; }
            public string Content { get; set; }
        }

        [HttpPost]
        [Route("send-mail-manager")]
        public async Task<IHttpActionResult> SendMailManager()
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                return BadRequest("Unsupported media type");
            }

            var provider = new MultipartMemoryStreamProvider();
            await Request.Content.ReadAsMultipartAsync(provider);

            var subjectPart = provider.Contents.FirstOrDefault(x => x.Headers.ContentDisposition.Name.Trim('"') == "Subject");
            var contentPart = provider.Contents.FirstOrDefault(x => x.Headers.ContentDisposition.Name.Trim('"') == "Content");
            var emailsPart = provider.Contents.FirstOrDefault(x => x.Headers.ContentDisposition.Name.Trim('"') == "Emails");

            string subject = subjectPart != null ? await subjectPart.ReadAsStringAsync() : "";
            string body = contentPart != null ? await contentPart.ReadAsStringAsync() : "";
            if (emailsPart == null)
                return Ok(new { success = false, message = "Danh sách email trống!" });

            string rawEmails = await emailsPart.ReadAsStringAsync();
            var emails = rawEmails.Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries)
                                  .Select(e => e.Trim())
                                  .Where(e => !string.IsNullOrWhiteSpace(e))
                                  .Distinct()
                                  .ToList();
            if (!emails.Any())
                return Ok(new { success = false, message = "Không có email hợp lệ!" });

            var attachmentParts = provider.Contents
                                          .Where(x => x.Headers.ContentDisposition.Name.Trim('"') == "Attachments")
                                          .ToList();

            var savedFiles = new List<(string FileName, string FilePath, long FileSize, byte[] FileBytes)>();

            foreach (var fileContent in attachmentParts)
            {
                var fileBytes = await fileContent.ReadAsByteArrayAsync();
                if (fileBytes.Length > 10 * 1024 * 1024)
                    continue;

                var fileName = fileContent.Headers.ContentDisposition.FileName.Trim('"');
                var extension = Path.GetExtension(fileName);
                var fileNameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
                var timeStamp = DateTime.Now.ToString("yyyyMMdd_HHmmssfff");

                var fileNameTime = $"{fileNameWithoutExt}_{timeStamp}{extension}";

                var folderPath = "/Areas/Admin/uploads/mail-attachments/";
                var physicalPath = HttpContext.Current.Server.MapPath("~" + folderPath);

                if (!Directory.Exists(physicalPath))
                    Directory.CreateDirectory(physicalPath);

                var fullPath = Path.Combine(physicalPath, fileNameTime);
                File.WriteAllBytes(fullPath, fileBytes);
                savedFiles.Add((fileNameTime, folderPath + fileNameTime, fileBytes.Length, fileBytes));
            }


            var mailLog = new MailLogs
            {
                Subject = subject,
                Body = body,
                Create_Date = unixTimestamp,
                id_user = user.id_users
            };
            db.MailLogs.Add(mailLog);
            await db.SaveChangesAsync();

            foreach (var toEmail in emails)
            {
                db.MailRecipients.Add(new MailRecipients
                {
                    id_mail_log = mailLog.id_mail_logs,
                    MailSend = toEmail
                });
            }

            foreach (var file in savedFiles)
            {
                db.MailAttachments.Add(new MailAttachments
                {
                    id_mail_logs = mailLog.id_mail_logs,
                    FileName = file.FileName,
                    FilePath = file.FileName,
                    FileSize = file.FileSize
                });
            }

            await db.SaveChangesAsync();
            await SendEmailGmail(emails, subject, body, savedFiles);

            return Ok(new { success = true, message = "Gửi mail thành công!" });
        }


        private async Task SendEmailGmail(List<string> toEmails, string subject, string htmlContent, List<(string FileName, string FilePath, long FileSize, byte[] FileBytes)> savedFiles)
        {
            using (var smtpClient = new SmtpClient("smtp.gmail.com", 587))
            {
                smtpClient.EnableSsl = true;
                smtpClient.Credentials = new NetworkCredential("khaosat@tdmu.edu.vn", "bbfk upqd rdhw rxof");

                using (var mailMessage = new MailMessage())
                {
                    mailMessage.From = new MailAddress("khaosat@tdmu.edu.vn");

                    foreach (var email in toEmails)
                    {
                        mailMessage.Bcc.Add(email);
                    }

                    mailMessage.Subject = subject;
                    mailMessage.Body = htmlContent;
                    mailMessage.IsBodyHtml = true;

                    foreach (var file in savedFiles)
                    {
                        var stream = new MemoryStream(file.FileBytes);
                        mailMessage.Attachments.Add(new Attachment(stream, file.FileName));
                    }

                    await smtpClient.SendMailAsync(mailMessage);
                }
            }
        }


        [HttpGet]
        [Route("danh-sach-log-mail")]
        public async Task<IHttpActionResult> LogMail()
        {
            var listData = new List<object>();
            var GetData = await db.MailLogs
                .Select(x => new
                {
                    x.id_mail_logs,
                    userName = x.users.firstName + " " + x.users.lastName,
                    x.Subject,
                    x.Create_Date
                })
                .ToListAsync();
            listData.AddRange(GetData);
            if (listData.Count > 0)
            {
                return Ok(new { data = listData, success = true });
            }
            else
            {
                return Ok(new { message = "Chưa có dữ liệu", success = false });
            }

        }
        [HttpPost]
        [Route("info-mail-recipients")]
        public async Task<IHttpActionResult> LoadMailRecipients([FromBody] MailRecipients items)
        {
            var ListData = new List<object>();
            var GetLogMail = await db.MailLogs
                .Where(x => x.id_mail_logs == items.id_mail_log)
                .Select(x => x.Subject)
                .FirstOrDefaultAsync();
            var GetDetails = await db.MailRecipients
                .Where(x => x.id_mail_log == items.id_mail_log)
                .Select(x => new
                {
                    x.MailSend
                })
                .ToListAsync();
            ListData.Add(new
            {
                GetLogMail,
                Recipients = GetDetails
            });
            return Ok(ListData);
        }

        [HttpPost]
        [Route("info-mail-log")]
        public async Task<IHttpActionResult> LoadInfoMailLog([FromBody] MailAttachments items)
        {
            var ListData = new List<object>();
            var GetMailLog = await db.MailLogs
                .Where(x => x.id_mail_logs == items.id_mail_logs)
                .Select(x => new
                {
                    x.Subject,
                    x.Body
                })
                .FirstOrDefaultAsync();
            var GetDetails = await db.MailAttachments
                .Where(x => x.id_mail_logs == items.id_mail_logs)
                .Select(x => new
                {
                    x.FileName,
                    x.FilePath
                })
                .ToListAsync();
            ListData.Add(new
            {
                GetMailLog,
                Recipients = GetDetails
            });
            return Ok(ListData);
        }
        [HttpPost]
        [Route("delete-logs-mails")]
        public async Task<IHttpActionResult> DeleteLogsMail([FromBody] MailLogs items)
        {
            var mailRecipients = await db.MailRecipients
                .Where(x => x.id_mail_log == items.id_mail_logs)
                .ToListAsync();
            if (mailRecipients.Any())
            {
                db.MailRecipients.RemoveRange(mailRecipients);
            }
            var mailAttachments = await db.MailAttachments
                .Where(x => x.id_mail_logs == items.id_mail_logs)
                .ToListAsync();
            if (mailAttachments.Any())
            {
                foreach (var attachment in mailAttachments)
                {
                    var relativePath = "/Areas/Admin/uploads/mail-attachments/" + attachment.FilePath;
                    var fullPath = HttpContext.Current.Server.MapPath("~" + relativePath);
                    if (File.Exists(fullPath))
                    {
                        File.Delete(fullPath);
                    }
                }
                db.MailAttachments.RemoveRange(mailAttachments);
            }

            var mailLog = await db.MailLogs.FirstOrDefaultAsync(x => x.id_mail_logs == items.id_mail_logs);
            if (mailLog != null)
            {
                db.MailLogs.Remove(mailLog);
            }

            await db.SaveChangesAsync();
            return Ok(new { success = true, message = "Xóa log mail thành công!" });
        }

        [HttpGet]
        [Route("preview")]
        public HttpResponseMessage Preview([FromUri] string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Invalid file path");

            string absolutePath = HttpContext.Current.Server.MapPath("~/Areas/Admin/uploads/mail-attachments/" + filePath);
            if (!File.Exists(absolutePath))
                return Request.CreateResponse(HttpStatusCode.NotFound, "File not found");

            var fileBytes = File.ReadAllBytes(absolutePath);
            var contentType = GetMimeType(Path.GetExtension(absolutePath));

            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new ByteArrayContent(fileBytes)
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline")
            {
                FileName = Path.GetFileName(absolutePath)
            };

            return response;
        }

        private string GetMimeType(string extension)
        {
            switch (extension.ToLower())
            {
                case ".pdf": return "application/pdf";
                case ".doc": return "application/msword";
                case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                case ".xls": return "application/vnd.ms-excel";
                case ".xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                case ".ppt": return "application/vnd.ms-powerpoint";
                case ".pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                case ".txt": return "text/plain";
                case ".csv": return "text/csv";
                case ".html": return "text/html";
                case ".js": return "application/javascript";
                case ".css": return "text/css";
                case ".json": return "application/json";
                case ".xml": return "application/xml";
                case ".cs": return "text/plain";
                case ".java": return "text/plain";
                case ".cpp": return "text/plain";
                case ".py": return "text/plain";
                case ".ts": return "text/plain";
                case ".md": return "text/markdown";
                default: return "application/octet-stream";
            }
        }

    }

}
