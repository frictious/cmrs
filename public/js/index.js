//=========================================================================================
//Nav section
const navs = document.querySelectorAll(".tabs div ul li a");//Side Nav
const print = document.getElementById("print");

//=========================================================================================

//=========================================================================================

// =========================================================================================
// Event listeners Section
window.addEventListener("load", function(){
    if(document.baseURI === ("http://localhost:2000/child/add" || "http://cmrs.herokuapp.com/child/add")){
        navs[0].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/father/add" || "http://cmrs.herokuapp.com/father/add")){
        navs[1].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/mother/add" || "http://cmrs.herokuapp.com/mother/add")){
        navs[2].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/guardian/add" || "http://cmrs.herokuapp.com/guardian/add")){
        navs[3].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/admission/add" || "http://cmrs.herokuapp.com/admission/add")){
        navs[4].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/emergency/add" || "http://cmrs.herokuapp.com/emergency/add")){
        navs[5].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/waiting/add" || "http://cmrs.herokuapp.com/waiting/add")){
        navs[6].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/visitors/add" || "http://cmrs.herokuapp.com/visitors/add")){
        navs[7].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/referral/add" || "http://cmrs.herokuapp.com/referral/add")){
        navs[8].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/delivery/add" || "http://cmrs.herokuapp.com/delivery/add")){
        navs[9].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/deceased/add" || "http://cmrs.herokuapp.com/deceased/add")){
        navs[10].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/test/add" || "http://cmrs.herokuapp.com/test/add")){
        navs[11].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/prescription/add" || "http://cmrs.herokuapp.com/prescription/add")){
        navs[12].classList.add("visited");
    }else if(document.baseURI === ("http://localhost:2000/diagnosis/add" || "http://cmrs.herokuapp.com/diagnosis/add")){
        navs[13].classList.add("visited");
    }
});

print.addEventListener("click", () => {
    window.print();
});

//Selecting the delete button
// const deleteBtn = document.querySelector("#delete");

// deleteBtn.addEventListener("click", function(){
//     console.log("OUCH!!!");
//     const req = fetch(`${document.baseURI}?_method=DELETE}`, {method : "POST", redirect : "back"})
//     .then(data => {
//         if(data){
//             console.log("DELETED SUCCESSFULLY");
//         }
//     })
// });
