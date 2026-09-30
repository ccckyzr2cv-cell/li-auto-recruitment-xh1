/* ============================================================
   Li Auto Global Careers — interactions
   ============================================================ */

// ---- Sticky nav border on scroll ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

// ---- Mobile menu ----
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  })
);

// ---- Dropdown menu ----
const dropdownBtn = document.querySelector('.nav__dropdown-btn');
const dropdownMenu = document.querySelector('.nav__dropdown-menu');
if (dropdownBtn && dropdownMenu) {
  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownBtn.setAttribute('aria-expanded', dropdownBtn.getAttribute('aria-expanded') === 'false');
    dropdownMenu.classList.toggle('open');
  });
  document.addEventListener('click', () => {
    dropdownMenu.classList.remove('open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
  });
  dropdownMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// ---- Referral dropdown toggle ----
const referralSelect = document.getElementById('referral');
const referralDetails = document.getElementById('referralDetails');
if (referralSelect && referralDetails) {
  referralSelect.addEventListener('change', () => {
    if (referralSelect.value === 'yes') {
      referralDetails.style.display = 'block';
    } else {
      referralDetails.style.display = 'none';
    }
  });
}

// ---- Job filters ----
const filters = document.getElementById('filters');
const jobList = document.getElementById('jobList');
filters.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  filters.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
  chip.classList.add('chip--active');
  const f = chip.dataset.filter;
  jobList.querySelectorAll('.job').forEach(job => {
    const show = f === 'all' || job.dataset.category === f;
    job.classList.toggle('hide', !show);
    if (show) {
      // restart entrance animation
      job.style.animation = 'none';
      void job.offsetWidth;
      job.style.animation = '';
    }
  });
});

// ---- "Apply for this role" → prefill role + scroll to form ----
document.querySelectorAll('.job__link').forEach(link => {
  link.addEventListener('click', () => {
    const role = link.dataset.role;
    const sel = document.getElementById('role');
    [...sel.options].forEach(o => { if (o.text.replace(/\s+/g, ' ') === role) sel.value = o.text; });
    document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
  });
});

// ---- Resume upload: drag & drop + file chip ----
const dropZone  = document.getElementById('dropZone');
const fileInput = document.getElementById('resume');
const fileChip  = document.getElementById('fileChip');
const fileName  = document.getElementById('fileName');
const removeBtn = document.getElementById('removeFile');
const MAX_SIZE  = 10 * 1024 * 1024; // 10 MB

['dragover', 'dragenter'].forEach(ev =>
  dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.add('drag'); })
);
['dragleave', 'drop'].forEach(ev =>
  dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.remove('drag'); })
);
dropZone.addEventListener('drop', e => {
  if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) setFile(fileInput.files[0]);
});
removeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  fileInput.value = '';
  fileChip.hidden = true;
});
function setFile(file) {
  if (file.size > MAX_SIZE) {
    alert('File is too large. Please upload a resume under 10 MB.');
    fileInput.value = '';
    return;
  }
  fileName.textContent = file.name + `  (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
  fileChip.hidden = false;
}

// ---- Form submit (demo: no backend) ----
const form = document.getElementById('applyForm');
const success = document.getElementById('formSuccess');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  if (!fileInput.files.length) {
    alert('Please upload your resume before submitting.');
    return;
  }

  // 自动填充申请人的邮箱到 _replyto
  const emailInput = document.getElementById('email');
  if (emailInput && emailInput.value) {
    document.getElementById('replyto').value = emailInput.value;
    document.getElementById('fromEmail').value = emailInput.value;
  }

  // 自动填充申请人姓名
  const nameInput = document.getElementById('fullName');
  if (nameInput && nameInput.value) {
    document.getElementById('fromName').value = nameInput.value;
  }

  // 显示提交中状态
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  // 收集数据并发送
  const formData = new FormData(form);

  // 使用 fetch 发送到 formsubmit.co
  fetch(form.action, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      // 成功 - 显示感谢页面
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.hidden = true;
      success.hidden = false;
      // 平滑滚动到成功消息
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });

      console.log('Application submitted successfully!');
    } else {
      throw new Error('Submission failed: ' + response.status);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Submission encountered an error. Please check that:\n\n1. You have network connection\n2. Your resume is under 10 MB\n3. All required fields are filled\n\nTry again or contact admin@liauto.com');
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
});
