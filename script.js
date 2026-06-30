/* ================================================
   SUPABASE CONFIG
   Paste your Project URL and anon key below
================================================ */
const SUPABASE_URL = 'https://olyeeylqjchaspkzcrip.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IAayct83nZ-RcUeS7IDUQQ_WF_nVdEc';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);


/* ================================================
   WELCOME POPUP
================================================ */
window.onload = function () {
  document.getElementById('welcomePopup').style.display = 'flex';
  loadMessages();
};

function closePopup() {
  var popup = document.getElementById('welcomePopup');
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.3s ease';
  setTimeout(function () { popup.style.display = 'none'; }, 300);
}
document.getElementById('welcomePopup').addEventListener('click', function (e) {
  if (e.target === this) closePopup();
});


/* ================================================
   FORM VALIDATION
================================================ */
function validateName() {
  var val = document.getElementById('fname').value.trim();
  var input = document.getElementById('fname');
  var err = document.getElementById('fname-error');
  if (val.length >= 2) { input.className = 'valid'; err.style.display = 'none'; return true; }
  else { input.className = 'invalid'; err.style.display = 'block'; return false; }
}

function validateEmail() {
  var val = document.getElementById('femail').value.trim();
  var input = document.getElementById('femail');
  var err = document.getElementById('femail-error');
  var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(val)) { input.className = 'valid'; err.style.display = 'none'; return true; }
  else { input.className = 'invalid'; err.style.display = 'block'; return false; }
}

function validatePhone() {
  var val = document.getElementById('fphone').value.trim();
  var input = document.getElementById('fphone');
  var err = document.getElementById('fphone-error');
  var phoneRegex = /^(\+254|0)[7][0-9]{8}$/;
  if (phoneRegex.test(val)) { input.className = 'valid'; err.style.display = 'none'; return true; }
  else { input.className = 'invalid'; err.style.display = 'block'; return false; }
}

function validateGender() {
  var selected = document.querySelector('input[name="gender"]:checked');
  var err = document.getElementById('fgender-error');
  if (selected) { err.style.display = 'none'; return true; }
  else { err.style.display = 'block'; return false; }
}


/* ================================================
   SUBMIT FORM — INSERT into Supabase
================================================ */
async function submitForm() {
  var nameOk = validateName(), emailOk = validateEmail(),
      phoneOk = validatePhone(), genderOk = validateGender();

  if (!nameOk || !emailOk || !phoneOk || !genderOk) {
    alert('⚠️ Please fill in all required fields correctly.');
    return;
  }

  var btn = document.querySelector('.submit-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  var newRow = {
    full_name : document.getElementById('fname').value.trim(),
    email     : document.getElementById('femail').value.trim(),
    phone     : document.getElementById('fphone').value.trim(),
    gender    : document.querySelector('input[name="gender"]:checked').value,
    message   : document.getElementById('fmessage').value.trim()
  };

  // INSERT into Supabase table
  var result = await db.from('messages').insert([newRow]);

  if (result.error) {
    alert('❌ Error saving to database:\n' + result.error.message);
  } else {
    alert('✅ Thank you, ' + newRow.full_name + '!\nYour message has been saved to the database.');

    document.getElementById('form-success').style.display = 'block';

    // Clear form
    ['fname', 'femail', 'fphone', 'fmessage'].forEach(function (id) {
      document.getElementById(id).value = '';
    });
    document.querySelectorAll('input[name="gender"]').forEach(function (r) { r.checked = false; });
    document.querySelectorAll('#contact .valid, #contact .invalid').forEach(function (el) { el.className = ''; });

    setTimeout(function () {
      document.getElementById('form-success').style.display = 'none';
    }, 4000);

    loadMessages(); // refresh table
  }

  btn.textContent = 'Send Message →';
  btn.disabled = false;
}


/* ================================================
   LOAD MESSAGES — SELECT from Supabase
================================================ */
async function loadMessages() {
  var container = document.getElementById('messages-table-body');
  var countEl   = document.getElementById('messages-count');
  if (!container) return;

  container.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:1.5rem;">Loading from database…</td></tr>';

  // SELECT all rows, newest first
  var result = await db
    .from('messages')
    .select('id, full_name, email, phone, gender, created_at')
    .order('created_at', { ascending: false });

  if (result.error) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#cc2200;padding:1.5rem;">❌ ' + result.error.message + '</td></tr>';
    return;
  }

  var rows = result.data;

  if (!rows || rows.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:1.5rem;">No messages yet. Be the first to send one!</td></tr>';
    if (countEl) countEl.textContent = '0';
    return;
  }

  if (countEl) countEl.textContent = rows.length;

  container.innerHTML = rows.map(function (m) {
    return '<tr>' +
      '<td><strong>' + escHtml(m.id) + '</strong></td>' +
      '<td>' + escHtml(m.full_name) + '</td>' +
      '<td>' + escHtml(m.email) + '</td>' +
      '<td>' + escHtml(m.phone) + '</td>' +
      '<td>' + escHtml(m.gender) + '</td>' +
      '<td>' + escHtml(m.created_at.replace('T', ' ').slice(0, 19)) + '</td>' +
      '</tr>';
  }).join('');
}

// Prevent XSS when displaying fetched data
function escHtml(str) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}


/* ================================================
   PAYMENT SOUND
================================================ */
function playPaymentSound() {
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var osc1 = audioCtx.createOscillator(), gain1 = audioCtx.createGain();
  osc1.connect(gain1); gain1.connect(audioCtx.destination);
  osc1.type = 'sine'; osc1.frequency.value = 800;
  gain1.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  osc1.start(audioCtx.currentTime); osc1.stop(audioCtx.currentTime + 0.3);
  var osc2 = audioCtx.createOscillator(), gain2 = audioCtx.createGain();
  osc2.connect(gain2); gain2.connect(audioCtx.destination);
  osc2.type = 'sine'; osc2.frequency.value = 1100;
  gain2.gain.setValueAtTime(0.4, audioCtx.currentTime + 0.35);
  gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.65);
  osc2.start(audioCtx.currentTime + 0.35); osc2.stop(audioCtx.currentTime + 0.65);
  var msg = document.getElementById('payment-msg');
  msg.style.display = 'block';
  setTimeout(function () { msg.style.display = 'none'; }, 4000);
}
