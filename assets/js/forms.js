
function formMessage(form,msg,ok=false){let n=form.querySelector(".form-message");if(!n){n=document.createElement("div");n.className="form-message";form.appendChild(n)}n.className=`form-message notice ${ok?"success":"error"}`;n.textContent=msg;}
document.addEventListener("submit",async e=>{
 const form=e.target;if(!form.matches("[data-api-form]"))return;e.preventDefault();
 const action=form.dataset.apiForm;const payload=Object.fromEntries(new FormData(form).entries());
 try{const r=await VMH_API.post(action,payload);if(!r.ok)throw new Error(r.error||"Request failed.");formMessage(form,r.message||"Thank you. Your request was received.",true);if(action==="contact"||action==="subscribe")form.reset();}
 catch(err){formMessage(form,err.message||"Request failed.");}
});
