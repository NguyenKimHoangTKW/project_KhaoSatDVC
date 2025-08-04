function handleCredentialResponse(response) {
    let info = JSON.parse(atob(response.credential.split('.')[1]));
    Session_Login(info.email, info.given_name, info.family_name, info.picture);
}
$(document).on("click", "#btnGoogleLogin", async function () {
    await signIn();
})
$(document).on("click", "#logout", async function () {
    await logout();
})
function signIn() {
    google.accounts.oauth2.initTokenClient({
        client_id: "183100229430-394rpj38v42o4kfgum7hvnjplnv3ebrl.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        callback: (response) => {
            if (response.access_token) {
                // Lưu token này vào session hoặc database
                localStorage.setItem('access_token', response.access_token);

                fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { "Authorization": `Bearer ${response.access_token}` }
                })
                    .then(res => res.json())
                    .then(userInfo => {
                        Session_Login(userInfo.email, userInfo.given_name, userInfo.family_name, userInfo.picture);
                    });
            }
        }
    }).requestAccessToken();
}

async function Session_Login(email, firstname, lastname, urlimage) {
    const res = await $.ajax({
        url: '/api/session_login',
        type: 'POST',
        dataType: 'JSON',
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: {
            email: email,
            firstName: firstname,
            lastName: lastname,
            avatarUrl: urlimage
        },
    });
    if (res.success) {
        if (typeof load_he_dao_tao === "function") {
            load_he_dao_tao();
        }
        $("#nav-placeholder").load('/InterfaceClient/NavLayout');
        Sweet_Alert("success", res.message);
        window.location.reload();
    }

}

function Logout_Session() {
    $.ajax({
        url: '/api/clear_session',
        type: 'POST',
        success: function (res) {
            if (res.success) {
                localStorage.removeItem('authInfo');
                location.replace("/");
            }
        }
    });
}

function logout() {
    Logout_Session();
}