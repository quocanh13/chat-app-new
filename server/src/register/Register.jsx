import { register } from "../request/register.js"
import {createPopUp} from "../utils/popUp/popUp.js"

export default function Register() {

    async function onSubmitForm() {
        const formData = new FormData(document.querySelector(".register-form"))
        const data = {
            username : formData.get("username"),
            password : formData.get("password"),
            name : formData.get("name"),
        }
        console.log(data)
        const resData = await register(data)
        if(resData.type != "OK") {
            createPopUp(resData)
        }
    }

    return (
        <div className="register-container">
            <h3>Đăng Ký Tài Khoản</h3>
            <form className="register-form" action="">
                <div className="form-group">
                    <img src={"../images/username-icon.png"} alt="user" />
                    <input type="text" name="username" id="username" placeholder="Nhập tài khoản..." required />
                </div>
                
                <div className="form-group">
                    <img src={"../images/password-icon.png"} alt="lock" />
                    <input type="password" id="password" name="password" placeholder="Nhập mật khẩu..." required />
                </div>

                <div className="form-group">
                    <img src={"../images/password-icon.png"} alt="name" />
                    <input type="text" id="name" placeholder="Nhập tên của bạn..." name="name" required />
                </div>

                <button type="button" className="btn-register" onClick={onSubmitForm}>Đăng ký</button>
                <p>Nếu bạn đã có tài khoản, <a href="/login/login.html">nhấn vào đây</a> để đăng nhập</p>
            </form>
        </div>
    )
}