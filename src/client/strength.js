/* The meter under a new password (Sign up, and the reset page). The rules are Better Auth's: at least 12 characters,
   and on the real site no password known from a data breach (checked by the server when the form is sent). The meter
   only shows length, in four segments: the first while it's too short, then one more at 12, 16 and 20 characters.
   The form's button stays off until there are 12. */
const MIN = 12;
const STEPS = [MIN, 16, 20];
const LABEL = ["Okay", "Strong", "Very strong"];

export function strengthMeter({ input, meter, button }) {
  if (!input || !meter || input.dataset.meterOn) return;
  input.dataset.meterOn = "1";
  const label = meter.querySelector("[data-strength-label]");
  const update = () => {
    const n = input.value.length;
    const reached = STEPS.filter((s) => n >= s).length;
    meter.dataset.score = n ? String(reached + 1) : "";
    meter.dataset.ok = String(n >= MIN);
    label.textContent = !n ? "" : reached ? LABEL[reached - 1] : `Too short (${n} of ${MIN})`;
    if (button) button.disabled = n > 0 && n < MIN;
  };
  input.addEventListener("input", update);
}
