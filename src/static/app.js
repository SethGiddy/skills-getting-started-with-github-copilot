activityCard.innerHTML = `
  <h4>${name}</h4>
  <p>${details.description}</p>
  <p><strong>Schedule:</strong> ${details.schedule}</p>
  <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
  <div class="participants-section">
    <strong>Participants:</strong>
    <ul class="participants-list">
      ${details.participants.map(participant => `<li>${participant}</li>`).join('')}
    </ul>
  </div>
`;
