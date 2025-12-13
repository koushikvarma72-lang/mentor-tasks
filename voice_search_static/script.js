// Voice Search + Offline Sample Search

const sampleDocs = [
  {id:1,title:"How to use Web Speech API",body:"Guide to using SpeechRecognition in browsers."},
  {id:2,title:"Stock Market Basics",body:"Understanding prices and indicators."},
  {id:3,title:"Building Dashboards",body:"Designing responsive dashboard UIs."},
  {id:4,title:"Voice Interfaces",body:"Principles for voice-first UX."}
];

const startBtn=document.getElementById("startBtn");
const searchBtn=document.getElementById("searchBtn");
const queryInput=document.getElementById("query");
const resultsEl=document.getElementById("results");

function renderResults(items){
  if(!items.length){
    resultsEl.innerHTML="<div class='result-item'>No results found.</div>";
    return;
  }
  resultsEl.innerHTML="";
  items.forEach(x=>{
    const div=document.createElement("div");
    div.className="result-item";
    div.innerHTML=`<strong>${x.title}</strong><div>${x.body}</div>`;
    resultsEl.appendChild(div);
  });
}

function doSearch(q){
  const text=q.toLowerCase().trim();
  const r=sampleDocs.filter(d=>(d.title+" "+d.body).toLowerCase().includes(text));
  renderResults(r);
}

searchBtn.addEventListener("click",()=>doSearch(queryInput.value));
queryInput.addEventListener("keydown",(e)=>{if(e.key==="Enter")doSearch(queryInput.value);});

let recognition=null;
if("webkitSpeechRecognition" in window || "SpeechRecognition" in window){
  const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
  recognition=new Rec();
  recognition.lang="en-US";
  recognition.interimResults=false;
  recognition.onresult=(e)=>{
    const text=e.results[0][0].transcript;
    queryInput.value=text;
    doSearch(text);
  };
  recognition.onerror=()=>alert("Speech error or not supported.");
}else{
  startBtn.disabled=true;
  startBtn.textContent="Voice Not Supported";
}

startBtn.addEventListener("click",()=>{
  if(!recognition){alert("Speech not supported");return;}
  recognition.start();
});
