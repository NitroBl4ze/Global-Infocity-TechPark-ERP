(function () {
  'use strict';
  const KEY = {
    applications: 'infocity_user_applications', users: 'infocity_users', contractors: 'infocity_hr_contractors',
    attendance: 'infocity_hr_attendance', leaves: 'infocity_hr_leaves', jobs: 'infocity_hr_jobs',
    training: 'infocity_hr_training', performance: 'infocity_hr_performance', relations: 'infocity_hr_relations',
    compliance: 'infocity_hr_compliance'
  };
  const titles = {
    overview: ['People Operations Overview','Manage employees, contract teams and the services that keep the campus running.'],
    approvals: ['New User Approvals','Review registration requests, assign roles and activate workspace access.'],
    recruitment: ['Recruitment & Hiring','Publish openings and track staffing demand across the campus.'],
    workforce: ['Employee Directory','Review active and inactive user accounts and their assigned roles.'],
    contractors: ['Contract & Facility Workforce','Manage outsourced service partners and contract manpower.'],
    attendance: ['Attendance & Shift Management','Record daily attendance and monitor campus shift coverage.'],
    leave: ['Leave Management','Review leave requests and record HR decisions.'],
    learning: ['Training & Performance','Coordinate induction, role training and performance reviews.'],
    relations: ['Employee Relations','Maintain a controlled log for employee concerns and workplace cases.'],
    compliance: ['HR Compliance Checklist','Track workforce documentation, safety and statutory review items.']
  };
  const $ = id => document.getElementById(id);
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const write = (key, rows) => localStorage.setItem(key, JSON.stringify(rows));
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const fmtDate = value => value ? new Date(value).toLocaleDateString('en-IN') : '—';
  let activeApplicationId = null;

  function currentUser() { try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch { return null; } }
  function log(action, module, severity='INFO') {
    const logs=read('infocity_audit_logs'); logs.unshift({id:Date.now(),time:new Date().toLocaleString(),actor:currentUser()?.username||'HR',action,module,severity}); write('infocity_audit_logs',logs.slice(0,500));
  }
  function initAccess() {
    const user=currentUser();
    if(!user || !['HR','SuperAdmin'].includes(user.role)) { location.href='index.html'; return false; }
    $('userDisplay').textContent=user.name||user.username;
    if(user.role==='SuperAdmin'){ $('roleBadge').textContent='Super Admin · HR Overview'; $('hrAdminLinks').classList.remove('hidden'); }
    $('hrLogout').addEventListener('click',()=>{localStorage.removeItem('currentUser');location.href='index.html';});
    return true;
  }
  function navigate() {
    const requested=new URLSearchParams(location.search).get('view')||'overview';
    const view=titles[requested]?requested:'overview';
    document.querySelectorAll('.hr-view').forEach(el=>el.classList.toggle('hidden',el.id!=='hr-'+view));
    document.querySelectorAll('.sidebar [data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
    $('hrPageTitle').textContent=titles[view][0]; $('hrPageDescription').textContent=titles[view][1]; $('hrPageTag').textContent='HR · '+view;
    document.title='Global InfoCity — '+titles[view][0];
    return view;
  }
  function renderAll() {
    const apps=read(KEY.applications), users=read(KEY.users), contractors=read(KEY.contractors), jobs=read(KEY.jobs);
    $('pendingBadge').textContent=apps.filter(a=>a.status==='Pending').length;
    $('kpiPending').textContent=apps.filter(a=>a.status==='Pending').length;
    $('kpiEmployees').textContent=users.filter(u=>u.status==='Active').length;
    $('kpiContractors').textContent=contractors.reduce((n,c)=>n+Number(c.headcount||0),0);
    $('kpiOpenJobs').textContent=jobs.filter(j=>j.status==='Open').length;
    const services={}; contractors.forEach(c=>services[c.service]=(services[c.service]||0)+Number(c.headcount||0));
    $('workforceSummary').innerHTML=Object.entries(services).map(([k,v])=>'<div class="hr-summary-row"><span>'+escapeHtml(k)+'</span><strong>'+v+'</strong></div>').join('')||'<p class="subtitle">No contract workforce records yet.</p>';
    $('hrActivityBody').innerHTML=read('infocity_audit_logs').filter(x=>/registration|approved|rejected|contractor|leave/i.test(x.action)).slice(0,8).map(x=>'<tr><td>'+escapeHtml(x.time)+'</td><td>'+escapeHtml(x.actor)+'</td><td>'+escapeHtml(x.action)+'</td><td>'+escapeHtml(x.module)+'</td></tr>').join('')||'<tr><td colspan="4">No recent activity.</td></tr>';
    renderApprovals(); renderJobs(); renderEmployees(); renderContractors(); renderAttendance(); renderLeaves(); renderLearning(); renderRelations(); loadCompliance();
  }
  function renderApprovals() {
    const rows=read(KEY.applications);
    $('approvalCount').textContent=rows.filter(x=>x.status==='Pending').length+' pending';
    $('applicationTableBody').innerHTML=rows.map(a=>'<tr><td><strong>'+escapeHtml(a.name)+'</strong><br><small>'+escapeHtml(a.requestedPosition||'Position not specified')+'</small></td><td>'+escapeHtml(a.email)+'<br>'+escapeHtml(a.phone)+'</td><td>'+escapeHtml(a.preferredDepartment||'No preference')+'</td><td>'+escapeHtml(a.requestedPosition||'—')+'<br>'+escapeHtml(a.experience||'—')+'</td><td>'+fmtDate(a.appliedOn)+'</td><td>'+(a.status==='Pending'?'<button class="btn-sm btn-success" data-approve="'+a.id+'">Review & assign</button>':'<span class="pill-tag">'+escapeHtml(a.status)+' · '+escapeHtml(a.assignedRole||'')+'</span>')+'</td></tr>').join('')||'<tr><td colspan="6">No registration requests have been submitted.</td></tr>';
    document.querySelectorAll('[data-approve]').forEach(btn=>btn.addEventListener('click',()=>openApproval(Number(btn.dataset.approve))));
  }
  function openApproval(id) {
    const app=read(KEY.applications).find(x=>Number(x.id)===id); if(!app)return;
    activeApplicationId=id; $('approvalApplicationId').value=id; $('approvalApplicantName').textContent=app.name;
    $('approvalRole').value=app.preferredDepartment||''; $('approvalScope').value=app.requestedPosition||'';
    $('approvalDialog').showModal();
  }
  async function approveApplication(event) {
    event.preventDefault(); const id=Number($('approvalApplicationId').value), role=$('approvalRole').value, scope=$('approvalScope').value.trim();
    const apps=read(KEY.applications), app=apps.find(x=>Number(x.id)===id); if(!app||!role)return;
    const users=read(KEY.users);
    if(users.some(u=>String(u.email||u.username).toLowerCase()===app.email.toLowerCase())){ alert('An account already exists for this email.'); return; }
    const username=app.email;
    const user={name:app.name,username,email:app.email,password:app.initialPassword,phone:app.phone,role,status:'Active',scope:scope||role.toUpperCase()+'_DEFAULT',createdAt:new Date().toISOString(),approvedBy:currentUser()?.username||'HR'};
    users.push(user); write(KEY.users,users);
    app.status='Approved'; app.assignedRole=role; app.authorityScope=user.scope; app.reviewedBy=currentUser()?.username||'HR'; app.reviewedOn=new Date().toISOString(); delete app.initialPassword;
    write(KEY.applications,apps);
    log('Approved '+app.email+' and assigned '+role,'User Access','INFO');
    $('approvalDialog').close(); renderAll();
    const result=window.InfoCityEmail ? await window.InfoCityEmail.sendApproval(user,role) : {status:'queued'};
    alert(result.sent?'Account activated. Approval email sent.':'Account activated. Email notification is '+(result.status||'queued')+'. Configure email-service.js to enable delivery.');
  }
  function rejectApplication() {
    const id=Number($('approvalApplicationId').value), apps=read(KEY.applications), app=apps.find(x=>Number(x.id)===id); if(!app)return;
    app.status='Rejected'; app.reviewedBy=currentUser()?.username||'HR'; app.reviewedOn=new Date().toISOString(); delete app.initialPassword;
    write(KEY.applications,apps); log('Rejected registration for '+app.email,'User Access','WARN'); $('approvalDialog').close(); renderAll();
  }
  function renderEmployees() {
    $('employeeTableBody').innerHTML=read(KEY.users).map(u=>'<tr><td>'+escapeHtml(u.name)+'</td><td>'+escapeHtml(u.username)+'<br><small>'+escapeHtml(u.email||'')+'</small></td><td>'+escapeHtml(u.role)+'</td><td>'+escapeHtml(u.scope||'—')+'</td><td><span class="pill-tag">'+escapeHtml(u.status)+'</span></td></tr>').join('')||'<tr><td colspan="5">No employees found.</td></tr>';
  }
  function renderJobs() {
    $('jobTableBody').innerHTML=read(KEY.jobs).map(j=>'<tr><td>'+escapeHtml(j.title)+'</td><td>'+escapeHtml(j.department)+'</td><td>'+escapeHtml(j.type)+'</td><td>'+j.openings+'</td><td>'+escapeHtml(j.status)+'</td><td><button class="btn-sm btn-secondary" data-job-close="'+j.id+'">Close</button></td></tr>').join('')||'<tr><td colspan="6">No vacancies published.</td></tr>';
    const jobs=read(KEY.jobs); $('recruitmentStats').innerHTML='<div class="hr-summary-row"><span>Open vacancies</span><strong>'+jobs.filter(j=>j.status==='Open').length+'</strong></div><div class="hr-summary-row"><span>Total openings</span><strong>'+jobs.filter(j=>j.status==='Open').reduce((n,j)=>n+Number(j.openings),0)+'</strong></div>';
    document.querySelectorAll('[data-job-close]').forEach(b=>b.addEventListener('click',()=>{const rows=read(KEY.jobs);const j=rows.find(x=>x.id===Number(b.dataset.jobClose));if(j)j.status='Closed';write(KEY.jobs,rows);renderAll();}));
  }
  function renderContractors() {
    const rows=read(KEY.contractors); const coverage={}; rows.forEach(r=>coverage[r.service]=(coverage[r.service]||0)+Number(r.headcount||0));
    $('contractCoverage').innerHTML=Object.entries(coverage).map(([s,n])=>'<div class="hr-summary-row"><span>'+escapeHtml(s)+'</span><strong>'+n+' personnel</strong></div>').join('')||'<p class="subtitle">Add service partners to see coverage by service.</p>';
    $('contractorTableBody').innerHTML=rows.map(r=>'<tr><td><strong>'+escapeHtml(r.name)+'</strong><br><small>'+escapeHtml(r.contact||'')+'</small></td><td>'+escapeHtml(r.service)+'</td><td>'+escapeHtml(r.type)+'</td><td>'+r.headcount+'</td><td>'+fmtDate(r.start)+' – '+fmtDate(r.end)+'</td><td>₹'+Number(r.value||0).toLocaleString('en-IN')+'</td><td>'+escapeHtml(r.status)+'</td><td><button class="btn-sm btn-secondary" data-contract-status="'+r.id+'">Toggle status</button></td></tr>').join('')||'<tr><td colspan="8">No contract workforce records.</td></tr>';
    document.querySelectorAll('[data-contract-status]').forEach(b=>b.addEventListener('click',()=>{const items=read(KEY.contractors),r=items.find(x=>x.id===Number(b.dataset.contractStatus));if(r)r.status=r.status==='Active'?'On Hold':'Active';write(KEY.contractors,items);renderAll();}));
  }
  function renderAttendance() {
    const rows=read(KEY.attendance); $('attendanceTableBody').innerHTML=rows.slice().reverse().map(r=>'<tr><td>'+escapeHtml(r.name)+'</td><td>'+escapeHtml(r.department)+'</td><td>'+fmtDate(r.date)+'</td><td>'+escapeHtml(r.shift)+'</td><td>'+escapeHtml(r.status)+'</td></tr>').join('')||'<tr><td colspan="5">No attendance entries.</td></tr>';
    $('attendanceKpis').innerHTML='<div class="hr-summary-row"><span>Present / overtime entries</span><strong>'+rows.filter(r=>['Present','Overtime'].includes(r.status)).length+'</strong></div><div class="hr-summary-row"><span>Absent entries</span><strong>'+rows.filter(r=>r.status==='Absent').length+'</strong></div>';
    if(!$('attendanceDate').value)$('attendanceDate').value=new Date().toISOString().slice(0,10);
  }
  function renderLeaves() {
    const rows=read(KEY.leaves); $('leaveTableBody').innerHTML=rows.slice().reverse().map(r=>'<tr><td>'+escapeHtml(r.employee)+'</td><td>'+escapeHtml(r.type)+'</td><td>'+fmtDate(r.from)+' – '+fmtDate(r.to)+'</td><td>'+escapeHtml(r.reason)+'</td><td>'+escapeHtml(r.status)+'</td><td>'+(r.status==='Pending'?'<button class="btn-sm btn-success" data-leave="'+r.id+'" data-status="Approved">Approve</button> <button class="btn-sm btn-danger" data-leave="'+r.id+'" data-status="Rejected">Reject</button>':'—')+'</td></tr>').join('')||'<tr><td colspan="6">No leave requests.</td></tr>';
    document.querySelectorAll('[data-leave]').forEach(b=>b.addEventListener('click',()=>{const items=read(KEY.leaves),r=items.find(x=>x.id===Number(b.dataset.leave));if(r){r.status=b.dataset.status;r.reviewedBy=currentUser()?.username;write(KEY.leaves,items);log(r.status+' leave request for '+r.employee,'Leave Management');renderAll();}}));
  }
  function renderLearning() {
    $('trainingTableBody').innerHTML=read(KEY.training).map(r=>'<tr><td>'+escapeHtml(r.title)+'</td><td>'+escapeHtml(r.team)+'</td><td>'+fmtDate(r.date)+'</td><td>'+escapeHtml(r.owner)+'</td></tr>').join('')||'<tr><td colspan="4">No training programmes.</td></tr>';
    $('performanceTableBody').innerHTML=read(KEY.performance).map(r=>'<tr><td>'+escapeHtml(r.employee)+'</td><td>'+escapeHtml(r.period)+'</td><td>'+escapeHtml(r.rating)+'</td><td>'+escapeHtml(r.reviewer)+'</td></tr>').join('')||'<tr><td colspan="4">No performance reviews.</td></tr>';
  }
  function renderRelations() {
    const rows=read(KEY.relations); $('relationStats').innerHTML='<div class="hr-summary-row"><span>Open cases</span><strong>'+rows.filter(r=>r.status==='Open').length+'</strong></div><div class="hr-summary-row"><span>Confidential / urgent</span><strong>'+rows.filter(r=>['Confidential','Urgent'].includes(r.priority)).length+'</strong></div>';
    $('relationTableBody').innerHTML=rows.map(r=>'<tr><td>#'+r.id+'</td><td>'+escapeHtml(r.person)+'</td><td>'+escapeHtml(r.category)+'</td><td>'+escapeHtml(r.priority)+'</td><td>'+escapeHtml(r.summary)+'</td><td>'+escapeHtml(r.status)+'</td><td><button class="btn-sm btn-secondary" data-case="'+r.id+'">Resolve</button></td></tr>').join('')||'<tr><td colspan="7">No cases recorded.</td></tr>';
    document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{const items=read(KEY.relations),r=items.find(x=>x.id===Number(b.dataset.case));if(r)r.status='Resolved';write(KEY.relations,items);renderAll();}));
  }
  function loadCompliance() {
    const saved=read(KEY.compliance); document.querySelectorAll('[data-compliance]').forEach(cb=>cb.checked=saved.includes(cb.dataset.compliance));
  }
  function bindForms() {
    $('approvalForm').addEventListener('submit',approveApplication); $('rejectApplication').addEventListener('click',rejectApplication);
    $('jobForm').addEventListener('submit',e=>{e.preventDefault();const rows=read(KEY.jobs);rows.unshift({id:Date.now(),title:$('jobTitle').value.trim(),department:$('jobDepartment').value,type:$('jobType').value,openings:Number($('jobCount').value),description:$('jobDescription').value.trim(),status:'Open'});write(KEY.jobs,rows);e.target.reset();log('Published vacancy','Recruitment');renderAll();});
    $('contractorForm').addEventListener('submit',e=>{e.preventDefault();const rows=read(KEY.contractors);rows.unshift({id:Date.now(),name:$('contractorName').value.trim(),service:$('contractorService').value,type:$('contractorType').value,headcount:Number($('contractorCount').value),supervisor:$('contractorSupervisor').value,contact:$('contractorContact').value,start:$('contractStart').value,end:$('contractEnd').value,value:Number($('contractValue').value),shift:$('contractShift').value,status:'Active'});write(KEY.contractors,rows);e.target.reset();log('Added facility contractor','Contract Workforce');renderAll();});
    $('attendanceForm').addEventListener('submit',e=>{e.preventDefault();const rows=read(KEY.attendance);rows.push({id:Date.now(),name:$('attendanceName').value.trim(),department:$('attendanceDepartment').value.trim(),date:$('attendanceDate').value,shift:$('attendanceShift').value,status:$('attendanceStatus').value});write(KEY.attendance,rows);e.target.reset();log('Recorded attendance','Attendance');renderAll();});
    $('leaveForm').addEventListener('submit',e=>{e.preventDefault();const rows=read(KEY.leaves);rows.push({id:Date.now(),employee:$('leaveEmployee').value.trim(),type:$('leaveType').value,from:$('leaveFrom').value,to:$('leaveTo').value,reason:$('leaveReason').value.trim(),status:'Pending'});write(KEY.leaves,rows);e.target.reset();renderAll();});
    $('trainingForm').addEventListener('submit',e=>{e.preventDefault();const rows=read(KEY.training);rows.push({id:Date.now(),title:$('trainingTitle').value.trim(),team:$('trainingTeam').value,date:$('trainingDate').value,owner:$('trainingOwner').value});write(KEY.training,rows);e.target.reset();renderLearning();});
    $('performanceForm').addEventListener('submit',e=>{e.preventDefault();const rows=read(KEY.performance);rows.push({id:Date.now(),employee:$('performanceEmployee').value.trim(),period:$('performancePeriod').value,rating:$('performanceRating').value,reviewer:$('performanceReviewer').value});write(KEY.performance,rows);e.target.reset();renderLearning();});
    $('relationForm').addEventListener('submit',e=>{e.preventDefault();const rows=read(KEY.relations);rows.unshift({id:Date.now(),person:$('relationPerson').value.trim(),category:$('relationCategory').value,priority:$('relationPriority').value,summary:$('relationSummary').value.trim(),status:'Open'});write(KEY.relations,rows);e.target.reset();renderRelations();});
    $('saveCompliance').addEventListener('click',()=>{write(KEY.compliance,Array.from(document.querySelectorAll('[data-compliance]:checked')).map(x=>x.dataset.compliance));$('complianceSaved').textContent='Checklist saved locally.';});
    $('exportEmployees').addEventListener('click',()=>{const rows=read(KEY.users),head=['Name','Username','Email','Role','Status','Scope'];const csv=[head,...rows.map(u=>[u.name,u.username,u.email,u.role,u.status,u.scope])].map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='global-infocity-employee-directory.csv';a.click();URL.revokeObjectURL(url);});
  }
  document.addEventListener('DOMContentLoaded',function(){
    if(!initAccess())return;
    navigate(); bindForms(); renderAll();
  },{once:true});
})();