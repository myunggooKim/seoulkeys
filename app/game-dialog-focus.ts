/** Keep keyboard focus inside the existing game-exit alertdialog. */
export function trapGameDialogTab(
  event: Pick<KeyboardEvent, "key" | "shiftKey" | "preventDefault">,
  dialog: HTMLElement | null,
): boolean {
  if (event.key !== "Tab" || !dialog) return false;
  const controls = Array.from(dialog.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  ));
  const first = controls[0];
  const last = controls.at(-1);
  const active = dialog.ownerDocument.activeElement;
  if (!first || !last) { event.preventDefault(); dialog.focus(); return true; }
  if (!dialog.contains(active) || active === dialog || (event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
    return true;
  }
  return false;
}
