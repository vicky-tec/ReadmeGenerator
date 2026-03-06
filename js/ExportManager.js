/**
 * ExportManager.js
 * Handles copy-to-clipboard and download-as-file for the generated README.
 */
const ExportManager = (() => {

    /**
     * Copy markdown to clipboard with Clipboard API + execCommand fallback.
     * @param {string} markdown
     */
    async function copyToClipboard(markdown) {
        if (!markdown.trim()) {
            showToast('Nothing to copy yet. Fill in the form first!', 'error');
            return;
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(markdown);
            } else {
                // Fallback for non-secure contexts (file://)
                _fallbackCopy(markdown);
            }
            showToast('✅ Copied to clipboard!', 'success');
        } catch (err) {
            // Try fallback
            try {
                _fallbackCopy(markdown);
                showToast('✅ Copied to clipboard!', 'success');
            } catch (e) {
                showToast('❌ Copy failed. Try right-clicking the raw markdown tab.', 'error');
                console.error('Copy error:', e);
            }
        }
    }

    /** textarea-based copy fallback */
    function _fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        const success = document.execCommand('copy');
        document.body.removeChild(ta);
        if (!success) throw new Error('execCommand copy failed');
    }

    /**
     * Trigger a download of the markdown as README.md.
     * @param {string} markdown
     */
    function downloadReadme(markdown) {
        if (!markdown.trim()) {
            showToast('Nothing to download yet. Fill in the form first!', 'error');
            return;
        }
        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'README.md';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        // Revoke after short delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 1000);
        showToast('📥 README.md downloaded!', 'success');
    }

    /* ── Toast notification ──────────────────────────────────────── */
    let toastTimer = null;

    /**
     * Show a toast notification.
     * @param {string} message
     * @param {'success'|'error'|''} type
     * @param {number} duration ms
     */
    function showToast(message, type = '', duration = 2800) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        clearTimeout(toastTimer);

        toast.textContent = message;
        toast.className = `toast ${type}`;

        // Force reflow to restart animation
        void toast.offsetWidth;
        toast.classList.add('show');

        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    return { copyToClipboard, downloadReadme, showToast };
})();

// Make showToast globally accessible for simple calls
function showToast(msg, type, dur) {
    ExportManager.showToast(msg, type, dur);
}
