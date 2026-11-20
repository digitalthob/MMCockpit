// js/feedback.js — Feedback-Formular.
// Versendet per mailto: (öffnet das E-Mail-Programm des Nutzers).
// Die Empfängeradresse lässt sich hier zentral anpassen.
import { $, esc } from "./core.js";

// ANPASSUNG: Hier eure Feedback-E-Mail-Adresse eintragen.
const FEEDBACK_TO = "makermobile@example.org";

export function initFeedback() {
  $("#feedback-form").addEventListener("submit", onSubmit);
}

function onSubmit(e) {
  e.preventDefault();
  const name = $("#fb-name").value.trim();
  const subject = $("#fb-subject").value.trim() || "Feedback zum Makermobile-Buchungstool";
  const message = $("#fb-message").value.trim();
  if (!message) { alert("Bitte eine Nachricht eingeben."); return; }

  const body = `Feedback zum Makermobile-Buchungstool\n\n` +
    (name ? `Name: ${name}\n` : "") +
    `\nNachricht:\n${message}\n\n` +
    `(Gesendet über das Buchungstool-Feedbackformular)`;

  // mailto öffnet das lokale E-Mail-Programm mit vorausgefüllter Mail.
  const mailto = `mailto:${FEEDBACK_TO}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;

  $("#fb-sent").hidden = false;
  setTimeout(() => { $("#fb-sent").hidden = true; }, 4000);
}
