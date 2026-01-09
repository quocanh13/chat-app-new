function checkPopUp(){
    const popUp = document.querySelector(".popUp-card");
    if(popUp) {
        popUp.remove();
    }
}
/**
 * @param {Object} param0 
 * @param {string} param0.message
 * @param {boolean} param0.error
 * @param {(ev : Event)=>void} param0.buttonEvent
 */
export function createPopUp({message, error = true, buttonEvent}) {
    if(message != undefined && message != null) {
        checkPopUp();
        let img = "../images/popUp-ok.png";
        if(error) {
            img = "../images/error-cancel.png";
        }
        const popUpHTML = 
            `
                <div class="popUp-card">
                    <div class="popUp-message-frame">
                        <img src="${img}" alt="" class="popUp-image">
                        <p class="popUp-message">${message}</p>
                    </div>
                    <button class="popUp-button">OK</button>
                </div>
            `;
        document.querySelector("body").insertAdjacentHTML("afterbegin",popUpHTML);
        const popUp = document.querySelector(".popUp-card");
        document.querySelector(".popUp-button").addEventListener("click", (ev)=>{
            if(buttonEvent != undefined) {
                buttonEvent(ev);
            }
            popUp.remove();
        });
    }
}