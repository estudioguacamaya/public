const love = document.querySelector(".card__content-body-users-react");

const action = document.querySelector(".card__action");
const content = document.querySelector(".card__content");

love.addEventListener("click",function(){
  this.classList.toggle("loved");
  
})



action.addEventListener("click",function(){
content.classList.toggle("show")  
})