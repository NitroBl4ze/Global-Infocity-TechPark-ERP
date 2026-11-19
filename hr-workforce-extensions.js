(function(){
'use strict';
const $=id=>document.getElementById(id),read=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}},write=(k,v)=>localStorage.setItem(k,JSON.stringify(v)),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),date=v=>v?new Date(v).toLocaleDateString('en-IN'):'—';
function addWorkforceServices(){
 const select=$('contractorService');if(!select)return;
 const services=['Security Team','Security Supervisor','Parking Manager','Parking Attendants','Lift / Elevator Manager','Lift Maintenance Technicians','Cafeteria Manager','Cafeteria Staff','Cleaners / Housekeeping','Electricians','Plumbers','Server Maintenance','Data Centre Technicians','Internet / ISP Provider','Network Support Engineers','HVAC / BMS Engineers','Fire & Safety Team','Waste Management','Landscaping Team','Pest Control','General Civil Maintenance'];
 services.forEach(x=>{if(!Array.from(select.options).some(o=>o.value===x||o.textContent===x)){const o=document.createElement('option');o.textContent=x;select.appendChild(o)}});
}
function addActivityView(){
 const nav=document.querySelector('.sidebar-nav'),group=document.createElement('section');group.className='sidebar-group';group.innerHTML='<div class="sidebar-label">Workforce Control</div><a class="nav-item" data-hr-extra="activity" href="hr.html?view=activity"><span class="nav-icon">◷</span><span class="nav-text">Registrations, Attendance & Activities</span></a>';
 nav.insertBefore(group,document.getElementById('hrAdminLinks')||null);
 const root=document.createElement('section');root.className='hr-view hidden';root.id='hr-extra-activity';
 root.innerHTML='<div class="workflow-kpis"><article><span>Pending registrations</span><strong id="hrExPending">0</strong></article><article><span>Active employees</span><strong id="hrExEmployees">0</strong></article><article><span>Attendance entries today</span><strong id="hrExAttendance">0</strong></article><article><span>Employee activity records</span><strong id="hrExActivities">0</strong></article></div>'+
 '<div class="grid-2"><div class="panel"><div class="panel-header"><h2>Record employee activity</h2></div><form id="hrEmployeeActivityForm" class="workflow-form"><label>Employee / contractor<input id="hrActivityEmployee" required></label><label>Department / service<input id="hrActivityTeam" placeholder="Security / Finance / Housekeeping"></label><label>Activity type<select id="hrActivityType"><option>Onboarding</option><option>Training / Induction</option><option>Safety Drill / PPE</option><option>Shift Handover</option><option>Performance Review</option><option>Recognition</option><option>Incident / Safety Report</option><option>Asset Handover</option><option>Disciplinary Action</option><option>Other</option></select></label><label>Activity date<input id="hrActivityDate" type="date" required></label><label class="full-width">Activity notes<textarea id="hrActivityNotes" rows="2" required></textarea></label><button class="btn-primary">Save employee activity</button></form></div>'+
 '<div class="panel"><div class="panel-header"><h2>Campus workforce services</h2><a href="hr.html?view=contractors">Manage contractors →</a></div><div class="workflow-service-list" id="hrServiceSummary"></div></div></div>'+
 '<div class="panel"><div class="panel-header"><h2>New user registrations</h2><a href="hr.html?view=approvals">Open approval queue →</a></div><div class="workflow-table-wrap"><table><thead><tr><th>Applicant</th><th>Email</th><th>Preferred team</th><th>Date</th><th>Status</th></tr></thead><tbody id="hrExApplications"></tbody></table></div></div>'+
 '<div class="panel"><div class="panel-header"><h2>Attendance and shift activity</h2><a href="hr.html?view=attendance">Open attendance register →</a></div><div class="workflow-table-wrap"><table><thead><tr><th>Employee / worker</th><th>Department / service</th><th>Date</th><th>Shift</th><th>Status</th></tr></thead><tbody id="hrExAttendanceRows"></tbody></table></div></div>'+
 '<div class="panel"><div class="panel-header"><h2>Employee activity timeline</h2></div><div class="workflow-table-wrap"><table><thead><tr><th>Date</th><th>Employee</th><th>Team</th><th>Activity</th><th>Notes</th><th>Recorded by</th></tr></thead><tbody id="hrExActivityRows"></tbody></table></div></div>';
 document.querySelector('.main-content').appendChild(root);
}
function renderExtra(){
 const apps=read('infocity_user_applications'),users=read('infocity_users'),attendance=read('infocity_hr_attendance'),activities=read('infocity_hr_employee_activities'),contractors=read('infocity_hr_contractors');
 const today=new Date().toISOString().slice(0,10);
 $('hrExPending').textContent=apps.filter(x=>x.status==='Pending').length;$('hrExEmployees').textContent=users.filter(x=>x.status==='Active').length;$('hrExAttendance').textContent=attendance.filter(x=>x.date===today).length;$('hrExActivities').textContent=activities.length;
 $('hrExApplications').innerHTML=apps.slice().sort((a,b)=>new Date(b.appliedOn)-new Date(a.appliedOn)).map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+esc(x.email)+'</td><td>'+esc(x.preferredDepartment||'No preference')+'</td><td>'+esc(date(x.appliedOn))+'</td><td>'+esc(x.status)+'</td></tr>').join('')||'<tr><td colspan="5">No registration requests.</td></tr>';
 $('hrExAttendanceRows').innerHTML=attendance.slice().reverse().slice(0,30).map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+esc(x.department)+'</td><td>'+esc(date(x.date))+'</td><td>'+esc(x.shift)+'</td><td>'+esc(x.status)+'</td></tr>').join('')||'<tr><td colspan="5">No attendance records.</td></tr>';
 $('hrExActivityRows').innerHTML=activities.slice().reverse().map(x=>'<tr><td>'+esc(date(x.date))+'</td><td>'+esc(x.employee)+'</td><td>'+esc(x.team||'—')+'</td><td>'+esc(x.type)+'</td><td>'+esc(x.notes)+'</td><td>'+esc(x.recordedBy||'HR')+'</td></tr>').join('')||'<tr><td colspan="6">No employee activities logged.</td></tr>';
 const counts={};contractors.forEach(x=>counts[x.service]=(counts[x.service]||0)+Number(x.headcount||0));
 $('hrServiceSummary').innerHTML=Object.entries(counts).map(([k,v])=>'<div class="workflow-service-row"><span>'+esc(k)+'</span><strong>'+v+' personnel</strong></div>').join('')||'<p class="subtitle">No service workforce records yet. Add vendors or individual contracts in Contract & Facility Workforce.</p>';
}
function init(){
 addWorkforceServices();addActivityView();
 $('hrActivityDate').value=new Date().toISOString().slice(0,10);
 $('hrEmployeeActivityForm').onsubmit=e=>{e.preventDefault();const a=read('infocity_hr_employee_activities');let user;try{user=JSON.parse(localStorage.getItem('currentUser')||'null')}catch{}a.unshift({id:Date.now(),employee:$('hrActivityEmployee').value.trim(),team:$('hrActivityTeam').value.trim(),type:$('hrActivityType').value,date:$('hrActivityDate').value,notes:$('hrActivityNotes').value.trim(),recordedBy:user?.username||'HR',createdAt:new Date().toISOString()});write('infocity_hr_employee_activities',a);const logs=read('infocity_audit_logs');logs.unshift({id:Date.now(),time:new Date().toLocaleString(),actor:user?.username||'HR',action:'Recorded '+$('hrActivityType').value+' for '+$('hrActivityEmployee').value,module:'Employee Activities',severity:'INFO'});write('infocity_audit_logs',logs);e.target.reset();$('hrActivityDate').value=new Date().toISOString().slice(0,10);renderExtra();};
 const view=new URLSearchParams(location.search).get('view');
 if(view==='activity'){
  document.querySelectorAll('.hr-view').forEach(x=>x.classList.add('hidden'));
  $('hr-extra-activity').classList.remove('hidden');
  $('hrPageTitle').textContent='Registrations, Attendance & Employee Activities';
  $('hrPageDescription').textContent='One operational view for new registrations, daily attendance and employee activity history.';
  $('hrPageTag').textContent='Workforce control';
  document.querySelectorAll('[data-hr-extra]').forEach(x=>x.classList.add('active'));
  renderExtra();
 }
}
document.addEventListener('DOMContentLoaded',init,{once:true});
})();