using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CTDT.Models
{
    public class GiamSatThongKeKetQua
    {
        public int? id_hdt { get; set; }
        public int surveyID { get; set; }
        public int? id_namhoc { get; set; }
        public int? id_ctdt { get; set; }
        public int? id_lop { get; set; }
        public int? id_mh { get; set; }
        public int? id_CBVC { get; set; }
        public long? from_date { get; set; }
        public long? to_date { get; set; }
        public int id_don_vi { get; set; }
        public int id_bo_mon { get; set; }
        public int id_khoa { get; set; }
        public int[] surveyList { get; set; }
        public int[] DonViList { get; set; }
        public int trang_thai_khao_sat { get; set; }
        public string check_option { get; set; }
        public string  ten_cau_hoi { get; set; }
        public int page { get; set; }
        public int pageSize { get; set; }
        public string searchTerm { get; set; }
    }
}