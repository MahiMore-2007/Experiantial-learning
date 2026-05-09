document.addEventListener("mousemove", e => {
  const g = document.getElementById("cursorGlow");
  g.style.left = e.clientX + "px";
  g.style.top  = e.clientY + "px";
});

/* ── SECTION SWITCH ── */
function launchDashboard() {
  document.getElementById("landingPage").classList.add("page-exit");
  setTimeout(() => {
    document.getElementById("landingPage").classList.add("d-none");
    document.getElementById("dashboardPage").classList.remove("d-none");
    document.getElementById("dashboardPage").classList.add("page-enter");
    window.scrollTo(0, 0);
    render();
  }, 400);
}

function goLanding() {
  document.getElementById("dashboardPage").classList.add("d-none");
  document.getElementById("landingPage").classList.remove("d-none");
  document.getElementById("landingPage").classList.remove("page-exit");
  window.scrollTo(0, 0);
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
  const m = document.getElementById("mobileMenu");
  m.classList.toggle("d-none");
}

/* ── SCROLL REVEAL (Landing) ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("revealed");
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* ── FEATURE CARD SCROLL ANIMATION (from your original code) ── */
const featCards = document.querySelectorAll(".feat-card");
window.addEventListener("scroll", () => {
  featCards.forEach(card => {
    const top = card.getBoundingClientRect().top;
    if (top < window.innerHeight - 60) {
      card.classList.add("feat-visible");
    }
  });
});

/* ════════════════════════════════════════
   TASK MANAGER STATE & LOGIC
════════════════════════════════════════ */
let tasks = [
  { id:1, title:"Submit College Project Report",    desc:"Complete and submit the final report for Computer Networks.",  priority:"High",   due:"2025-05-10", done:false },
  { id:2, title:"Prepare for Data Structures Exam", desc:"Revise trees, graphs, and dynamic programming topics.",        priority:"Medium", due:"2025-05-12", done:false },
  { id:3, title:"Buy Stationery from Market",        desc:"Get notebooks, pens, and highlighters for new semester.",      priority:"Low",    due:"2025-05-01", done:true  },
  { id:4, title:"Fix Bug in Web Dev Assignment",     desc:"Login form validation is broken — fix JS and resubmit.",       priority:"High",   due:"2025-05-08", done:false },
  { id:5, title:"Watch OS Lecture Recording",        desc:"Watch recorded lecture on Process Scheduling algorithms.",     priority:"Medium", due:"2025-04-30", done:true  },
];
let nextId=6, deleteTargetId=null, filterStatus="all", filterPriority="all", searchQuery="";

const toastEl  = document.getElementById("liveToast");
const bsToast  = new bootstrap.Toast(toastEl, { delay:2400 });
const delModal = new bootstrap.Modal(document.getElementById("deleteModal"));

function showToast(msg, type="success") {
  document.getElementById("toastMsg").textContent = msg;
  toastEl.className = `toast align-items-center border-0 toast-${type}`;
  bsToast.show();
}

function fmtDate(d) {
  if (!d) return "No due date";
  const [y,m,day] = d.split("-");
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${mo[+m-1]} ${+day}, ${y}`;
}

function priCfg(p) {
  if (p==="High")   return { cls:"high",   icon:"△" };
  if (p==="Medium") return { cls:"medium", icon:"▷" };
  return                   { cls:"low",    icon:"▽" };
}

function esc(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function buildCard(t) {
  const cfg = priCfg(t.priority);
  return `
  <div class="task-card priority-${cfg.cls} ${t.done?"completed":""} animate-in" data-id="${t.id}">
    <div class="d-flex align-items-start justify-content-between gap-3 mb-2">
      <div class="d-flex align-items-start gap-3 flex-grow-1">
        <label class="custom-cb mt-1">
          <input type="checkbox" onchange="toggleDone(${t.id})" ${t.done?"checked":""} />
          <span class="cb-mark"></span>
        </label>
        <div>
          <h3 class="task-title ${t.done?"struck":""}">${esc(t.title)}</h3>
          ${t.desc?`<p class="task-desc ${t.done?"struck":""}">${esc(t.desc)}</p>`:""}
        </div>
      </div>
      <div class="d-flex flex-column align-items-end gap-1 flex-shrink-0">
        <span class="pri-badge ${cfg.cls}">${cfg.icon} ${t.priority}</span>
        ${t.done?`<span class="done-badge"><i class="bi bi-check2-circle me-1"></i>Done</span>`:""}
      </div>
    </div>
    <div class="task-foot d-flex align-items-center justify-content-between flex-wrap gap-2">
      <span class="task-due"><i class="bi bi-calendar3 me-1"></i>${fmtDate(t.due)}</span>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <select class="mini-sel" onchange="changePri(${t.id},this.value)">
          <option value="High"   ${t.priority==="High"  ?"selected":""}>△ High</option>
          <option value="Medium" ${t.priority==="Medium"?"selected":""}>▷ Medium</option>
          <option value="Low"    ${t.priority==="Low"   ?"selected":""}>▽ Low</option>
        </select>
        <button class="btn-mini" onclick="moveTop(${t.id})"><i class="bi bi-arrow-up-circle"></i> Top</button>
        <button class="btn-mini danger" onclick="openDel(${t.id},'${esc(t.title)}')"><i class="bi bi-trash3"></i> Delete</button>
      </div>
    </div>
  </div>`;
}

function render() {
  const visible = tasks.filter(t => {
    const ms = filterStatus==="all"     || (filterStatus==="Done"?t.done:!t.done);
    const mp = filterPriority==="all"   || t.priority===filterPriority;
    const mq = searchQuery===""         || t.title.toLowerCase().includes(searchQuery) || (t.desc&&t.desc.toLowerCase().includes(searchQuery));
    return ms && mp && mq;
  });
  const tl = document.getElementById("taskList");
  const es = document.getElementById("emptyState");
  tl.innerHTML = visible.map(buildCard).join("");
  if (visible.length===0) { es.classList.remove("d-none"); tl.classList.add("d-none"); }
  else                    { es.classList.add("d-none");    tl.classList.remove("d-none"); }
  updateStats();
}

function updateStats() {
  const total=tasks.length, done=tasks.filter(t=>t.done).length, pending=total-done;
  const high=tasks.filter(t=>t.priority==="High").length;
  const med=tasks.filter(t=>t.priority==="Medium").length;
  const low=tasks.filter(t=>t.priority==="Low").length;
  const pct=total?Math.round((done/total)*100):0;
  ["navTotal","sumTotal"].forEach(id=>document.getElementById(id).textContent=total);
  ["navPending","sumPending"].forEach(id=>document.getElementById(id).textContent=pending);
  ["navDone","sumDone"].forEach(id=>document.getElementById(id).textContent=done);
  document.getElementById("sumHigh").textContent=high;
  document.getElementById("sumMed").textContent=med;
  document.getElementById("sumLow").textContent=low;
  document.getElementById("progressPct").textContent=pct+"%";
  document.getElementById("progressBar").style.width=pct+"%";
  document.getElementById("taskCountBadge").textContent=total+" task"+(total!==1?"s":"");
}

/* ── ADD TASK ── */
document.getElementById("addTaskBtn").addEventListener("click", () => {
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) {
    document.getElementById("taskTitle").classList.add("shake");
    setTimeout(()=>document.getElementById("taskTitle").classList.remove("shake"),500);
    showToast("Please enter a task title!","error"); return;
  }
  tasks.unshift({ id:nextId++, title, desc:document.getElementById("taskDesc").value.trim(),
    priority:document.getElementById("taskPriority").value,
    due:document.getElementById("taskDue").value, done:false });
  ["taskTitle","taskDesc","taskDue"].forEach(id=>document.getElementById(id).value="");
  document.getElementById("taskPriority").value="Medium";
  showToast("✦ Task added!"); render();
});

document.getElementById("clearFormBtn").addEventListener("click",()=>{
  ["taskTitle","taskDesc","taskDue"].forEach(id=>document.getElementById(id).value="");
  document.getElementById("taskPriority").value="Medium";
});

document.getElementById("taskTitle").addEventListener("keydown",e=>{
  if(e.key==="Enter") document.getElementById("addTaskBtn").click();
});

/* ── TASK ACTIONS ── */
function toggleDone(id) {
  const t=tasks.find(t=>t.id===id);
  if(t){ t.done=!t.done; showToast(t.done?"✓ Task complete!":"↩ Marked pending!"); render(); }
}
function changePri(id,val) {
  const t=tasks.find(t=>t.id===id);
  if(t){ t.priority=val; showToast("Priority updated!"); render(); }
}
function moveTop(id) {
  const idx=tasks.findIndex(t=>t.id===id);
  if(idx>0){ const [t]=tasks.splice(idx,1); tasks.unshift(t); showToast("⬆ Moved to top!"); render(); }
}
function openDel(id,name) {
  deleteTargetId=id;
  document.getElementById("deleteTaskName").textContent=`"${name}"`;
  delModal.show();
}
document.getElementById("confirmDeleteBtn").addEventListener("click",()=>{
  tasks=tasks.filter(t=>t.id!==deleteTargetId);
  delModal.hide(); showToast("🗑 Task deleted.","error"); render();
});
document.getElementById("clearAllBtn").addEventListener("click",()=>{
  if(!tasks.length) return;
  if(confirm("Clear ALL tasks?")){ tasks=[]; showToast("All tasks cleared.","error"); render(); }
});

/* ── FILTERS ── */
document.getElementById("statusFilter").addEventListener("click",e=>{
  const btn=e.target.closest(".dash-filter-btn"); if(!btn) return;
  document.querySelectorAll("#statusFilter .dash-filter-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); filterStatus=btn.dataset.value; render();
});
document.getElementById("priorityFilter").addEventListener("click",e=>{
  const btn=e.target.closest(".dash-filter-btn"); if(!btn) return;
  document.querySelectorAll("#priorityFilter .dash-filter-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); filterPriority=btn.dataset.value; render();
});
document.getElementById("searchInput").addEventListener("input",e=>{
  searchQuery=e.target.value.trim().toLowerCase(); render();
});
