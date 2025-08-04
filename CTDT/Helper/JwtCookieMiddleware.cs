using System.Threading.Tasks;
using Microsoft.Owin;

namespace CTDT.Helper
{
    public class JwtCookieMiddleware : OwinMiddleware
    {
        public JwtCookieMiddleware(OwinMiddleware next) : base(next) { }

        public async override Task Invoke(IOwinContext context)
        {
            var token = context.Request.Cookies["access_token"];
            if (!string.IsNullOrEmpty(token))
            {
                context.Request.Headers.Append("Authorization", "Bearer " + token);
            }

            await Next.Invoke(context);
        }
    }
}
