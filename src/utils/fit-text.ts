/**
 * Injects a shrink-to-fit routine into rendered card HTML. Elements marked
 * with class="fit-text" (school name, student name, and row/field values in
 * the seeded templates) get their font-size reduced in-browser until their
 * content fits on one line, so long values never overflow the fixed-size
 * card layout.
 *
 * Measuring the "available width" is intentionally done from the element's
 * clientWidth *before* switching it to `white-space: nowrap` — flex items
 * have an automatic min-width equal to their content's min-content size
 * (full unwrapped width) unless overflow is constrained, so setting nowrap
 * first would make the box grow to fit the text instead of clipping it,
 * and clientWidth/scrollWidth would then always be equal. Capturing the
 * wrapped-layout width first avoids that flexbox quirk. If even the minimum
 * font size doesn't fit, the element is reverted to normal wrapping rather
 * than left visually clipped.
 *
 * The script sets `data-fit-done="1"` on <html> when finished; callers using
 * Puppeteer should wait for that attribute before capturing a screenshot/PDF.
 */
const FIT_TEXT_SCRIPT = `
<script>
(function () {
  var MIN_FONT_PX = 5.5;
  var STEP_PX = 0.5;
  function shrinkToFit(el) {
    var availableWidth = el.clientWidth;
    el.style.whiteSpace = 'nowrap';
    var size = parseFloat(window.getComputedStyle(el).fontSize) || 10;
    var guard = 0;
    while (el.scrollWidth > availableWidth + 1 && size > MIN_FONT_PX && guard < 40) {
      size -= STEP_PX;
      el.style.fontSize = size + 'px';
      guard += 1;
    }
    if (el.scrollWidth > availableWidth + 1) {
      el.style.whiteSpace = 'normal';
    }
  }
  document.querySelectorAll('.fit-text').forEach(shrinkToFit);
  document.documentElement.setAttribute('data-fit-done', '1');
})();
</script>`;

export const injectAutoFitText = (html: string): string =>
    html.includes('</body>') ? html.replace('</body>', `${FIT_TEXT_SCRIPT}</body>`) : html + FIT_TEXT_SCRIPT;
