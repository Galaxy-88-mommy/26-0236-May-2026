const supabaseUrl = "https://olyeeylqjchaspkzcrip.supabase.co";
const supabaseKey = "sb_publishable_IAayct83nZ-RcUeS7IDUQQ_WF_nVdEc";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

/* WELCOME POPUP */
window.onload = function () {
  document.getElementById('welcomePopup').style.display = 'flex';
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


/* FORM VALIDATION */

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

/* SUBMIT FORM -> INSERT INTO SUPABASE */
async function submitForm() {
  var nameOk = validateName(), emailOk = validateEmail(),
      phoneOk = validatePhone(), genderOk = validateGender();

  if (!(nameOk && emailOk && phoneOk && genderOk)) {
    alert('⚠️ Please fill in all required fields correctly before submitting.');
    return;
  }

  var name    = document.getElementById('fname').value.trim();
  var email   = document.getElementById('femail').value.trim();
  var phone   = document.getElementById('fphone').value.trim();
  var gender  = document.querySelector('input[name="gender"]:checked').value;
  var message = document.getElementById('fmessage').value.trim();

  var submitBtn = document.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      full_name: name,
      email: email,
      phone: phone,
      gender: gender,
      message: message
    }]);

  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Message →';

  if (error) {
    console.error(error);
    alert('❌ Something went wrong sending your message. Please try again.');
    return;
  }

  document.getElementById('form-success').style.display = 'block';
  setTimeout(function () {
    document.getElementById('fname').value = '';
    document.getElementById('femail').value = '';
    document.getElementById('fphone').value = '';
    document.getElementById('fmessage').value = '';
    document.querySelectorAll('input[name="gender"]').forEach(function (r) { r.checked = false; });
    document.querySelectorAll('#contact .valid, #contact .invalid').forEach(function (el) { el.className = ''; });
    document.getElementById('form-success').style.display = 'none';
  }, 4000);
}


/* PAYMENT SOUND */
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
