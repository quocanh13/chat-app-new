import {login} from "../request/login.js"
import {createPopUp} from "../utils/popUp/popUp.js"

export default function Login() {

    async function onSubmitForm() {
        const formData = new FormData(document.querySelector(".login-form"))
        const resData = await login({
            username : formData.get("username"),
            password : formData.get("password")
        })
        if(resData.type != "OK") {
            createPopUp({message : resData.message})
        }
    }

    return (
        <div className="login-container">
            <h3>Đăng Nhập</h3>
            <form className="login-form" action="">
                <div className="form-group">
                    <img src={"../images/username-icon.png"} alt="" />
                    <input type="text" name="username" id="username" placeholder="Nhập tài khoản..." />
                </div>
                
                <div className="form-group">
                    <img src={"../images/password-icon.png"} alt="" />
                    <input type="password" id="password" name="password" placeholder="Nhập mật khẩu..." />
                </div>

                <button type="button" className="btn-login" onClick={onSubmitForm}>Đăng nhập</button>
                <p>Nếu bạn chưa có tài khoản, <a href="/register/register.html">nhấn vào đây</a> để đăng ký</p>
            </form>
        </div>
    )
}