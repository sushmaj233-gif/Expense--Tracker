const balance=document.getElementById("balance");
const money_plus=document.getElementById("money-plus");
const money_minus=document.getElementById("money-minus");
const list=document.getElementById("list");
const form=document.getElementById("form");

const text=document.getElementById("text");
const amount=document.getElementById("amount");
const category=document.getElementById("category");
const date=document.getElementById("date");

const search=document.getElementById("search");
const clearBtn=document.getElementById("clearBtn");

let transactions=
JSON.parse(
localStorage.getItem("transactions")
)||[];

function addTransactionDOM(transaction,index){

const item=document.createElement("li");

item.innerHTML=`
<div>
<b>${transaction.text}</b>
<br>
${transaction.category}
<br>
${transaction.date}
</div>

<div>
₹${transaction.amount}

<button
class="delete-btn"
onclick="removeTransaction(${index})"
>
X
</button>
</div>
`;

list.appendChild(item);

}

function updateValues(){

const amounts=
transactions.map(
t=>t.amount
);

const total=
amounts.reduce(
(acc,item)=>acc+item,
0
);

const income=
amounts
.filter(item=>item>0)
.reduce(
(acc,item)=>acc+item,
0
);

const expense=
amounts
.filter(item=>item<0)
.reduce(
(acc,item)=>acc+item,
0
)*-1;

balance.innerText=`₹${total}`;
money_plus.innerText=`₹${income}`;
money_minus.innerText=`₹${expense}`;

}

function removeTransaction(index){

transactions.splice(index,1);

updateLocalStorage();

init();

}

function updateLocalStorage(){

localStorage.setItem(
"transactions",
JSON.stringify(transactions)
);

}

function init(){

list.innerHTML="";

transactions.forEach(
(transaction,index)=>
addTransactionDOM(transaction,index)
);

updateValues();

}

form.addEventListener(
"submit",
(e)=>{

e.preventDefault();

const transaction={

text:text.value,
amount:+amount.value,
category:category.value,
date:date.value

};

transactions.push(transaction);

updateLocalStorage();

init();

form.reset();

}
);

clearBtn.addEventListener(
"click",
()=>{

transactions=[];

updateLocalStorage();

init();

}
);

search.addEventListener(
"keyup",
(e)=>{

const term=
e.target.value.toLowerCase();

document.querySelectorAll(
"#list li"
).forEach(item=>{

item.style.display=
item.innerText
.toLowerCase()
.includes(term)
?"flex"
:"none";

});

}
);

init();