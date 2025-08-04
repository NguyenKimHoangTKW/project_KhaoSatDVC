using CTDT.Helper;
using CTDT.Models;
using GoogleApi.Entities.Search.Video.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CTDT.Controllers
{
   
    public class InterfaceClientController : Controller
    {
        dbSurveyEntities db = new dbSurveyEntities();
        // GET: InterfaceClient
        public ActionResult Index()
        {
            return View();
        }
        public PartialViewResult NavLayout()
        {
            var get_navbar = db.NavBar
                .Where(x => x.is_open == 1)
                .OrderBy(x => x.thu_tu_hien_thi)
                .ToList();

            return PartialView("_NavLayout", get_navbar);
        }
        [CheckLoginHelper]
        public ActionResult PhieuKhaoSat(string namehdt)
        {
            ViewBag.HDT = namehdt;
            var phieukhaosat = db.hedaotao
                            .Where(x => x.ten_hedaotao == namehdt)
                            .ToList();
            if (phieukhaosat != null && phieukhaosat.Any())
            {
                ViewBag.Name = phieukhaosat.First().ten_hedaotao;
            }
            else
            {
                ViewBag.Name = "";
            }
            return View(phieukhaosat);
        }
        [CheckLoginHelper]
        public ActionResult xac_thuc(int id)
        {
            ViewBag.id = id;
            return View();
        }
        [CheckLoginHelper]
        public ActionResult Survey(int id)
        {
            ViewBag.id = id;
            return View();
        }
        [CheckLoginHelper]
        public ActionResult AnswerPKS(int id, int surveyid)
        {
            ViewBag.SurveyId = surveyid;
            ViewBag.Id = id;
            return View();
        }
        [CheckLoginHelper]
        public ActionResult SurveyedForm()
        {
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(x => x.id_namhoc), "id_namhoc", "ten_namhoc");
            ViewBag.Hedaotao = new SelectList(db.hedaotao.OrderBy(x => x.id_hedaotao), "id_hedaotao", "ten_hedaotao");
            return View();
        }
    }
}