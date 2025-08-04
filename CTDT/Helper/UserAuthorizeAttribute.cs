using CTDT.Helper;
using CTDT.Models;
using System.Linq;
using System.Web.Mvc;
using System.Web;

public class UserAuthorizeAttribute : AuthorizeAttribute
{
    private readonly int[] _allowedUserTypes;
    private readonly string _requiredFunctionCode;

    public UserAuthorizeAttribute(string requiredFunctionCode = "", params int[] allowedUserTypes)
    {
        _allowedUserTypes = allowedUserTypes ?? new int[0];
        _requiredFunctionCode = requiredFunctionCode ?? "";
    }

    protected override bool AuthorizeCore(HttpContextBase httpContext)
    {
        var user = SessionHelper.GetUser();
        if (user == null || user.id_typeusers == null)
            return false;

        if (_allowedUserTypes.Length > 0 && !_allowedUserTypes.Contains(user.id_typeusers.Value))
            return false;

        if (string.IsNullOrWhiteSpace(_requiredFunctionCode))
        {
            return true;
        }

        var db = new dbSurveyEntities();

        var userFunctionCodes = db.phan_quyen_chuc_nang_users
            .Where(p => p.id_users == user.id_users)
            .Select(p => p.chuc_nang_users.ma_chuc_nang)
            .ToList();

        return userFunctionCodes.Contains(_requiredFunctionCode);
    }

    protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
    {
        filterContext.Result = new RedirectResult("~/trang-chu");
    }
}
