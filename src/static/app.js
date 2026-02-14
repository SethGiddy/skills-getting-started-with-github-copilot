// helper for rendering activity cards
async function loadActivities() {
  // force a fresh request every time; otherwise the browser may return a cached
  // copy and the UI won't reflect recent signups/deletions.
  const res = await fetch('/activities', { cache: 'no-store' });
  const data = await res.json();
  const container = document.getElementById('activities-list');
  const activitySelect = document.getElementById('activity');
  container.innerHTML = '';
  activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

  Object.entries(data).forEach(([name, details]) => {
    const spotsLeft = details.max_participants - details.participants.length;
    const activityCard = document.createElement('div');
    activityCard.className = 'activity-card';
    activityCard.innerHTML = `
      <h4>${name}</h4>
      <p>${details.description}</p>
      <p><strong>Schedule:</strong> ${details.schedule}</p>
      <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
      <div class="participants-section">
        <strong>Participants:</strong>
        <ul class="participants-list">
          ${details.participants
            .map(
              p => `
                <li>
                  <span class="participant-email">${p}</span>
                  <button class="remove-participant" data-activity="${name}" data-email="${p}" title="Remove">🗑️</button>
                </li>`
            )
            .join('')}
        </ul>
      </div>
    `;

    container.appendChild(activityCard);

    // add option to signup dropdown
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    activitySelect.appendChild(option);
  });
}

async function signupHandler(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const activity = document.getElementById('activity').value;
  const msg = document.getElementById('message');
  if (!email || !activity) return;

  const resp = await fetch(
    `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
    { method: 'POST' }
  );

  if (resp.ok) {
    msg.textContent = `Signed up ${email} for ${activity}`;
    msg.className = 'message success';
    // reset form
    document.getElementById('email').value = '';
    document.getElementById('activity').value = '';
    await loadActivities();
  } else {
    const err = await resp.json();
    msg.textContent = err.detail || 'Sign-up failed';
    msg.className = 'message error';
  }
  msg.classList.remove('hidden');
}

document.addEventListener('click', async event => {
  if (event.target.matches('.remove-participant')) {
    const activity = event.target.dataset.activity;
    const email = event.target.dataset.email;

    const resp = await fetch(
      `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
      { method: 'DELETE' }
    );

    if (resp.ok) {
      await loadActivities();
    } else {
      const err = await resp.json();
      alert(err.detail || 'Unable to remove participant');
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  loadActivities();
  document.getElementById('signup-form').addEventListener('submit', signupHandler);
});
