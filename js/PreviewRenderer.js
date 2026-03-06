/**
 * PreviewRenderer.js
 * Renders the markdown string into the live preview pane using marked.js.
 * Debounced at 300ms to prevent render storms on rapid typing.
 */
const PreviewRenderer = (() => {
    let debounceTimer = null;
    let _lastMarkdown = '';

    // Configure marked.js
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true,
        });
    }

    /**
     * Render markdown to the preview pane (debounced 300ms).
     * @param {string} markdown 
     */
    function render(markdown) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => _doRender(markdown), 300);
    }

    /** Immediate (no debounce) render — used on init */
    function renderNow(markdown) {
        clearTimeout(debounceTimer);
        _doRender(markdown);
    }

    function _doRender(markdown) {
        _lastMarkdown = markdown;

        // Update raw code view
        const rawEl = document.getElementById('raw-code');
        if (rawEl) {
            rawEl.textContent = markdown;
        }

        // Update HTML preview
        const previewEl = document.getElementById('preview-render');
        if (!previewEl) return;

        if (!markdown.trim()) {
            previewEl.innerHTML = _emptyState();
            return;
        }

        try {
            // marked.js converts markdown → HTML
            const html = marked.parse(markdown);
            previewEl.innerHTML = html;

            // pulse animation to signal update
            previewEl.classList.remove('preview-updated');
            void previewEl.offsetWidth; // reflow trick
            previewEl.classList.add('preview-updated');

        } catch (err) {
            console.error('PreviewRenderer error:', err);
            previewEl.innerHTML = `<p style="color:red">Preview error: ${err.message}</p>`;
        }
    }

    function getLastMarkdown() {
        return _lastMarkdown;
    }

    function _emptyState() {
        return `
      <div style="
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        height:60vh; gap:16px; color:#8b949e; text-align:center;
      ">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <p style="font-size:1rem; font-weight:600; margin:0">Your README preview will appear here</p>
        <p style="font-size:.875rem; margin:0">Fill in the form on the left to get started ✨</p>
      </div>
    `;
    }

    return { render, renderNow, getLastMarkdown };
})();
