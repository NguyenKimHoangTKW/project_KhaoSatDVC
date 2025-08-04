using CTDT.Helper;
using CTDT.Models;
using GleamTech.AspNet.UI;
using GleamTech.FileUltimate.AspNet.UI;
using GoogleApi.Entities.Search.Video.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace CTDT.Areas.Admin.Controllers
{
    [UserAuthorize("", 2)]
    public class InterfaceAdminController : Controller
    {
        dbSurveyEntities db = new dbSurveyEntities();
        public ActionResult Index()
        {
            return View();
        }
        #region Quản lý phiếu khảo sát
        [UserAuthorize("Admin_QuanLyPhieuKhaoSat", 2)]
        public ActionResult danh_sach_phieu_khao_sat()
        {
            ViewBag.HDT = new SelectList(db.hedaotao, "id_hedaotao", "ten_hedaotao");
            ViewBag.LKS = new SelectList(db.LoaiKhaoSat, "id_loaikhaosat", "name_loaikhaosat");
            ViewBag.Year = new SelectList(db.NamHoc, "id_namhoc", "ten_namhoc");
            ViewBag.DotKhaoSat = new SelectList(db.dot_khao_sat, "id_dot_khao_sat", "ten_dot_khao_sat");
            return View();
        }
        [UserAuthorize("Admin_QuanLyPhieuKhaoSat", 2)]
        public ActionResult chi_tiet_phieu_khao_sat(int id)
        {
            ViewBag.id = id;
            ViewBag.HDT = new SelectList(db.hedaotao, "id_hedaotao", "ten_hedaotao");
            ViewBag.LKS = new SelectList(db.LoaiKhaoSat, "id_loaikhaosat", "name_loaikhaosat");
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(x => x.id_namhoc), "id_namhoc", "ten_namhoc");
            ViewBag.DotKhaoSat = new SelectList(db.dot_khao_sat, "id_dot_khao_sat", "ten_dot_khao_sat");
            return View();
        }

        [UserAuthorize("Admin_QuanLyPhieuKhaoSat", 2)]
        public ActionResult tieu_de_cau_hoi_pks()
        {
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(l => l.id_namhoc), "id_namhoc", "ten_namhoc");
            ViewBag.HeDaoTao = new SelectList(db.hedaotao.OrderBy(l => l.ten_hedaotao), "id_hedaotao", "ten_hedaotao");
            return View();
        }
        [UserAuthorize("Admin_QuanLyPhieuKhaoSat", 2)]
        public ActionResult xem_truoc_cau_hoi_da_tao(int id)
        {
            ViewBag.id = id;
            return View();
        }
        [UserAuthorize("Admin_QuanLyPhieuKhaoSat", 2)]
        public ActionResult danh_sach_nguoi_hoc_khao_sat()
        {
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(l => l.id_namhoc), "id_namhoc", "ten_namhoc");
            ViewBag.HeDaoTao = new SelectList(db.hedaotao.OrderBy(l => l.id_hedaotao), "id_hedaotao", "ten_hedaotao");
            return View();
        }


        #endregion
        #region Quản lý danh sách các đơn vị
        [UserAuthorize("Admin_QuanLyDanhSachCacDonVi", 2)]
        public ActionResult danh_sach_khoa_vien_truong()
        {
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(l => l.id_namhoc), "id_namhoc", "ten_namhoc");
            return View();
        }
        [UserAuthorize("Admin_QuanLyDanhSachCacDonVi", 2)]
        public ActionResult danh_sach_khoa_duoi_cap()
        {
            ViewBag.KhoaVienTruong = new SelectList(db.khoa_vien_truong.OrderBy(l => l.id_khoa), "id_khoa", "ten_khoa");
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(l => l.id_namhoc), "id_namhoc", "ten_namhoc");
            return View();
        }
        [UserAuthorize("Admin_QuanLyDanhSachCacDonVi", 2)]
        public ActionResult danh_sach_bo_mon()
        {
            ViewBag.KhoaVienTruong = new SelectList(db.khoa_vien_truong.OrderBy(l => l.id_khoa), "id_khoa", "ten_khoa");
            ViewBag.KhoaDuoiCap = new SelectList(db.khoa_children.OrderBy(l => l.id_khoa_children), "id_khoa_children", "ten_khoa_children");
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(l => l.id_namhoc), "id_namhoc", "ten_namhoc");
            return View();
        }
        [UserAuthorize("Admin_QuanLyDanhSachCacDonVi", 2)]
        public ActionResult danh_sach_ctdt()
        {
            ViewBag.DonViList = new SelectList(db.khoa_vien_truong.OrderBy(l => l.id_khoa), "id_khoa", "ten_khoa");
            ViewBag.HDT = new SelectList(db.hedaotao.OrderBy(l => l.id_hedaotao), "id_hedaotao", "ten_hedaotao");
            ViewBag.KhoaList = new SelectList(db.khoa_children.OrderBy(l => l.id_khoa_children), "id_khoa_children", "ten_khoa_children");
            ViewBag.CTDTList = new SelectList(db.ctdt.OrderBy(l => l.id_ctdt), "id_ctdt", "ten_ctdt");
            ViewBag.BoMonList = new SelectList(db.bo_mon.OrderBy(l => l.id_bo_mon), "id_bo_mon", "ten_bo_mon");
            return View();
        }
        #endregion
        #region Quản lý giao diện người dùng
        [UserAuthorize("Admin_QuanLyGiaoDienNguoiDung", 2)]
        public ActionResult danh_sach_hinh_anh()
        {
            return View();
        }
        [UserAuthorize("Admin_QuanLyGiaoDienNguoiDung", 2)]
        public ActionResult danh_sach_banner()
        {
            return View();
        }
        [UserAuthorize("Admin_QuanLyGiaoDienNguoiDung", 2)]
        public ActionResult danh_sach_he_dao_tao()
        {
            return View();
        }

        [UserAuthorize("Admin_QuanLyGiaoDienNguoiDung", 2)]
        public ActionResult danh_sach_navbar()
        {
            return View();
        }
        #endregion
        #region Quản lý chức năng người dùng
        [UserAuthorize("Admin_QuanLyChucNangNguoiDung", 2)]
        public ActionResult danh_sach_lop()
        {
            ViewBag.CTDTList = new SelectList(db.ctdt.OrderBy(l => l.id_ctdt), "id_ctdt", "ten_ctdt");
            return View();
        }
        [UserAuthorize("Admin_QuanLyChucNangNguoiDung", 2)]
        public ActionResult danh_sach_nguoi_hoc()
        {
            ViewBag.LopList = new SelectList(db.lop.OrderBy(x => x.id_lop), "id_lop", "ma_lop");
            return View();
        }
        #endregion
        #region Giám sát khảo sát
        [UserAuthorize("Admin_GiamSatKhaoSat", 2)]
        public ActionResult Thong_Ke_Ket_Qua_Khao_Sat()
        {
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(l => l.id_namhoc), "id_namhoc", "ten_namhoc");
            ViewBag.HeDaoTao = new SelectList(db.hedaotao.OrderBy(l => l.ten_hedaotao), "id_hedaotao", "ten_hedaotao");
            ViewBag.DotKhaoSat = new SelectList(db.dot_khao_sat.OrderBy(l => l.id_dot_khao_sat), "id_dot_khao_sat", "ten_dot_khao_sat");
            return View();
        }
        [UserAuthorize("Admin_GiamSatKhaoSat", 2)]
        public ActionResult giam_sat_ty_le_tham_gia_khao_sat()
        {
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(l => l.id_namhoc), "id_namhoc", "ten_namhoc");
            ViewBag.HeDaoTao = new SelectList(db.hedaotao.OrderBy(l => l.ten_hedaotao), "id_hedaotao", "ten_hedaotao");
            return View();
        }
        [UserAuthorize("Admin_GiamSatKhaoSat", 2)]
        public ActionResult bao_cao_tong_hop_ket_qua_khao_sat()
        {
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(l => l.id_namhoc), "id_namhoc", "ten_namhoc");
            ViewBag.HeDaoTao = new SelectList(db.hedaotao.OrderBy(l => l.ten_hedaotao), "id_hedaotao", "ten_hedaotao");
            return View();
        }
        #endregion
        #region Quản lý tài khoản
        [UserAuthorize("Admin_PhanQuyenTaiKhoan", 2)]
        public ActionResult UserInterface()
        {
            ViewBag.CTDTList = new SelectList(db.ctdt.OrderBy(l => l.id_ctdt), "id_ctdt", "ten_ctdt");
            ViewBag.TypeUserList = new SelectList(db.typeusers.OrderBy(l => l.id_typeusers), "id_typeusers", "name_typeusers");
            ViewBag.KhoaList = new SelectList(db.khoa_vien_truong.OrderBy(x => x.id_khoa), "id_khoa", "ten_khoa");
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(x => x.id_namhoc), "id_namhoc", "ten_namhoc");
            return View();
        }
        [UserAuthorize("Admin_PhanQuyenTaiKhoan", 2)]
        public ActionResult PhanQuyen(int id)
        {
            var PhanQuyen = db.users.Where(x => x.id_users == id).FirstOrDefault();
            return View(PhanQuyen);
        }
        #endregion
        #region Chức năng gửi mail
        public ActionResult MailManager()
        {
            ViewBag.Year = new SelectList(db.NamHoc.OrderByDescending(x => x.id_namhoc), "id_namhoc", "ten_namhoc");
            ViewBag.HeDaoTao = new SelectList(db.hedaotao.OrderBy(x => x.id_hedaotao), "id_hedaotao", "ten_hedaotao");
            return View();
        }
        #endregion
    }
}