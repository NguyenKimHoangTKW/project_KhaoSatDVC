using System.Web.Mvc;

namespace CTDT.Areas.Admin
{
    public class AdminAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "Admin";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "Admin_ThongKeKetQuaKhaoSat",
                "admin/giam-sat-ty-le-ket-qua-khao-sat",
                new { controller = "InterfaceAdmin", action = "Thong_Ke_Ket_Qua_Khao_Sat" }
            );

            context.MapRoute(
                "Admin_GiamSatTyLeThamGiaKhaoSat",
                "admin/giam-sat-ty-le-tham-gia-khao-sat",
                new { controller = "InterfaceAdmin", action = "giam_sat_ty_le_tham_gia_khao_sat" }
            );
            context.MapRoute(
                "Admin_BaoCaoTongHopKetQuaKhaoSat",
                "admin/giam-sat-bao-cao-tong-hop-ket-qua-khao-sat",
                new { controller = "InterfaceAdmin", action = "bao_cao_tong_hop_ket_qua_khao_sat" }
            );
            context.MapRoute(
                "Admin_TieuDePhieuKhaoSat",
                "admin/tieu-de-cau-hoi-phieu-khao-sat",
                new { controller = "InterfaceAdmin", action = "tieu_de_cau_hoi_pks" }
            );
            context.MapRoute(
                "Admin_XemTruocCauHoiDaTao",
                "xem-truoc-cau-hoi-da-tao/{id}",
                new { controller = "InterfaceAdmin", action = "xem_truoc_cau_hoi_da_tao", id = UrlParameter.Optional }
            );
            context.MapRoute(
                "Admin_DanhSachPhieuKhaoSat",
                "admin/danh-sach-phieu-khao-sat",
                new { controller = "InterfaceAdmin", action = "danh_sach_phieu_khao_sat" }
            );
            context.MapRoute(
                "Admin_ChiTietPhieuKhaoSat",
                "admin/chi-tiet-phieu-khao-sat/{id}",
                new { controller = "InterfaceAdmin", action = "chi_tiet_phieu_khao_sat", id = UrlParameter.Optional }
            );
            context.MapRoute(
                "Admin_DanhSachKhoaVienTruong",
                "admin/danh-sach-khoa-vien-truong",
                new { controller = "InterfaceAdmin", action = "danh_sach_khoa_vien_truong" }
            );
            context.MapRoute(
                "Admin_DanhSachKhoaDuoiCap",
                "admin/danh-sach-khoa-duoi-cap",
                new { controller = "InterfaceAdmin", action = "danh_sach_khoa_duoi_cap" }
            );
            context.MapRoute(
                "Admin_DanhSachBoMon",
                "admin/danh-sach-bo-mon",
                new { controller = "InterfaceAdmin", action = "danh_sach_bo_mon" }
            );
            context.MapRoute(
                "Admin_DanhSachCTDT",
                "admin/danh-sach-ctdt",
                new { controller = "InterfaceAdmin", action = "danh_sach_ctdt" }
            );
            context.MapRoute(
                "Admin_DanhSachLop",
                "admin/danh-sach-lop",
                new { controller = "InterfaceAdmin", action = "danh_sach_lop" }
            );
            context.MapRoute(
                "Admin_DanhSachNguoiHoc",
                "admin/danh-sach-nguoi-hoc",
                new { controller = "InterfaceAdmin", action = "danh_sach_nguoi_hoc" }
            );

            context.MapRoute(
                "Admin_DanhSachNguoiHocKhaoSat",
                "admin/danh-sach-nguoi-hoc-khao-sat-phieu",
                new { controller = "InterfaceAdmin", action = "danh_sach_nguoi_hoc_khao_sat" }
            );

            context.MapRoute(
                "Admin_DanhSachNguoiDung",
                "admin/danh-sach-users",
                new { controller = "InterfaceAdmin", action = "UserInterface" }
            );
            context.MapRoute(
                "Admin_PhanQuyenNguoiDung",
                "admin/phan-quyen-users/{id}",
                new { controller = "InterfaceAdmin", action = "PhanQuyen", id = UrlParameter.Optional }
            );
            context.MapRoute(
                "Admin_ThietLapThongKePhieuUser",
                "admin/thiet-lap-thong-ke-phieu-user/{id}",
                new { controller = "InterfaceAdmin", action = "thiet_lap_xem_phieu", id = UrlParameter.Optional }
            );
            context.MapRoute(
                "Admin_HeDaoTao",
                "admin/danh-sach-he-dao-tao",
                new { controller = "InterfaceAdmin", action = "danh_sach_he_dao_tao" }
            );
            context.MapRoute(
                "Admin_HinhAnh",
                "admin/danh-sach-hinh-anh",
                new { controller = "InterfaceAdmin", action = "danh_sach_hinh_anh" }
            );
            context.MapRoute(
                "Admin_Banner",
                "admin/banner-giao-dien-chinh",
                new { controller = "InterfaceAdmin", action = "danh_sach_banner" }
            );
            context.MapRoute(
                "Admin_TrangChu",
                "admin/trang-chu",
                new { controller = "InterfaceAdmin", action = "Index" }
            );
            context.MapRoute(
               "Admin_Navbar",
               "admin/danh-sach-navbar",
               new { controller = "InterfaceAdmin", action = "danh_sach_navbar" }
           );

            context.MapRoute(
              "Admin_MailManager",
              "admin/mail-manager",
              new { controller = "InterfaceAdmin", action = "MailManager" }
          );
            context.MapRoute(
                "Admin_default",
                "Admin/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}