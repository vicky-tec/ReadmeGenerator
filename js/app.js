/**
 * app.js — Bootstrap & Event Wiring
 */

function init() {

    /* ── 1. INITIALISE MODULES ─────────────────────────────────── */
    FormManager.init();
    SectionManager.render();

    let currentTemplate = 'advanced';
    let aiMarkdownOutput = '';   // stores last AI-generated markdown

    /* ── 2. CORE PIPELINE ──────────────────────────────────────── */
    function rebuildReadme() {
        const state = FormManager.getState();
        const sections = SectionManager.getEnabled();
        const markdown = TemplateEngine.generate(state, currentTemplate, sections);
        PreviewRenderer.render(markdown);
    }

    FormManager.onChange(rebuildReadme);
    SectionManager.onChange(rebuildReadme);
    BadgeBuilder.onChange(rebuildReadme);

    PreviewRenderer.renderNow('');

    /* ── 3. TEMPLATE SELECTOR ──────────────────────────────────── */
    const templateSelect = document.getElementById('template-select');
    if (templateSelect) {
        templateSelect.value = 'advanced';
        templateSelect.addEventListener('change', function () {
            currentTemplate = this.value;
            rebuildReadme();
            ExportManager.showToast('Template: ' + this.options[this.selectedIndex].text, 'success', 1800);
        });
    }

    /* ── 4. THEME TOGGLE ───────────────────────────────────────── */
    document.getElementById('theme-toggle').onclick = function () {
        var html = document.documentElement;
        var isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        document.getElementById('icon-moon').style.display = isDark ? 'none' : '';
        document.getElementById('icon-sun').style.display = isDark ? '' : 'none';
        ExportManager.showToast(isDark ? '☀️ Light mode' : '🌙 Dark mode', '', 1500);
    };

    /* ── 5. EXPORT BUTTONS ─────────────────────────────────────── */
    document.getElementById('btn-copy').onclick = function () {
        ExportManager.copyToClipboard(PreviewRenderer.getLastMarkdown());
    };
    document.getElementById('btn-download').onclick = function () {
        ExportManager.downloadReadme(PreviewRenderer.getLastMarkdown());
    };
    // Apply raw edits back to preview
    var btnApplyRaw = document.getElementById('btn-apply-raw');
    if (btnApplyRaw) {
        btnApplyRaw.onclick = function () {
            var rawCode = document.getElementById('raw-code');
            if (!rawCode) return;
            var edited = rawCode.value;
            PreviewRenderer.render(edited);
            ptabPreview.click();
            ExportManager.showToast('✅ Markdown applied to preview!', 'success', 1800);
        };
    }
    // Copy raw reads from editable textarea
    var btnCopyRaw = document.getElementById('btn-copy-raw');
    if (btnCopyRaw) {
        btnCopyRaw.onclick = function () {
            var rawCode = document.getElementById('raw-code');
            var md = rawCode ? rawCode.value : PreviewRenderer.getLastMarkdown();
            ExportManager.copyToClipboard(md);
        };
    }

    /* ── 6. RESET BUTTON ───────────────────────────────────────── */
    document.getElementById('btn-reset').onclick = function () {
        if (!confirm('Reset all fields? This cannot be undone.')) return;
        document.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], textarea').forEach(function (el) { el.value = ''; });
        document.querySelectorAll('input[type="checkbox"]').forEach(function (el) {
            var defaults = ['f-show-stats', 'f-show-streak', 'f-show-langs', 'f-wave', 'f-typing', 'f-banner', 'f-yaml-about', 'f-skill-icons'];
            el.checked = defaults.indexOf(el.id) !== -1;
        });
        // Hide AI output section on reset
        var aiSection = document.getElementById('ai-output-section');
        if (aiSection) aiSection.style.display = 'none';
        aiMarkdownOutput = '';
        PreviewRenderer.renderNow('');
        ExportManager.showToast('Form reset ✓', '', 1800);
    };

    /* ── 7. FORM TABS ──────────────────────────────────────────── */
    var tabs = document.querySelectorAll('.tab-bar .tab');
    var panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(function (tab) {
        tab.onclick = function () {
            var target = tab.getAttribute('data-tab');
            tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            panels.forEach(function (p) { p.classList.remove('active'); });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            var panel = document.getElementById('tab-' + target);
            if (panel) panel.classList.add('active');
        };
    });

    /* ── 8. PREVIEW TABS ───────────────────────────────────────── */
    var ptabPreview = document.getElementById('ptab-preview');
    var ptabRaw = document.getElementById('ptab-raw');
    var previewBody = document.getElementById('preview-body');
    var rawBody = document.getElementById('raw-body');

    ptabPreview.onclick = function () {
        ptabPreview.classList.add('active'); ptabPreview.setAttribute('aria-selected', 'true');
        ptabRaw.classList.remove('active'); ptabRaw.setAttribute('aria-selected', 'false');
        previewBody.classList.remove('hidden');
        rawBody.classList.add('hidden');
    };

    ptabRaw.onclick = function () {
        ptabRaw.classList.add('active'); ptabRaw.setAttribute('aria-selected', 'true');
        ptabPreview.classList.remove('active'); ptabPreview.setAttribute('aria-selected', 'false');
        rawBody.classList.remove('hidden');
        previewBody.classList.add('hidden');
        var rawCode = document.getElementById('raw-code');
        if (rawCode) rawCode.value = PreviewRenderer.getLastMarkdown();
    };

    /* ── 9. BADGE BUILDER ──────────────────────────────────────── */
    var badgeLabelEl = document.getElementById('badge-label');
    var badgeMessageEl = document.getElementById('badge-message');
    var badgeColorEl = document.getElementById('badge-color');
    var badgeColorPicker = document.getElementById('badge-color-picker');
    var badgeStyleEl = document.getElementById('badge-style');
    var badgePreviewImg = document.getElementById('badge-preview-img');

    function updateBadgePreview() {
        var label = (badgeLabelEl && badgeLabelEl.value) || 'label';
        var message = (badgeMessageEl && badgeMessageEl.value) || 'badge';
        var color = (badgeColorEl && badgeColorEl.value) || 'blueviolet';
        var style = (badgeStyleEl && badgeStyleEl.value) || 'for-the-badge';
        var url = BadgeBuilder.buildBadgeUrl(label, message, color, style);
        if (badgePreviewImg) { badgePreviewImg.src = url; badgePreviewImg.alt = label + ' ' + message; }
    }

    if (badgeColorPicker) {
        badgeColorPicker.addEventListener('input', function () {
            if (badgeColorEl) badgeColorEl.value = badgeColorPicker.value;
            updateBadgePreview();
        });
    }
    if (badgeColorEl) {
        badgeColorEl.addEventListener('input', function () {
            var hex = badgeColorEl.value;
            if (/^#[0-9a-f]{6}$/i.test(hex) && badgeColorPicker) badgeColorPicker.value = hex;
            updateBadgePreview();
        });
    }
    [badgeLabelEl, badgeMessageEl, badgeStyleEl].forEach(function (el) {
        if (el) el.addEventListener('input', updateBadgePreview);
    });

    var btnAddBadge = document.getElementById('btn-add-badge');
    if (btnAddBadge) {
        btnAddBadge.onclick = function () {
            var label = (badgeLabelEl && badgeLabelEl.value.trim()) || '';
            var message = (badgeMessageEl && badgeMessageEl.value.trim()) || '';
            if (!label || !message) { ExportManager.showToast('Fill Label and Message first', 'error'); return; }
            BadgeBuilder.addCustomBadge({
                label, message,
                color: (badgeColorEl && badgeColorEl.value) || 'blueviolet',
                style: (badgeStyleEl && badgeStyleEl.value) || 'for-the-badge',
            });
            BadgeBuilder.renderBadgeList();
            rebuildReadme();
            ExportManager.showToast('Badge added! 🏷', 'success', 1800);
        };
    }

    updateBadgePreview();

    /* ── 10. AI TAB LOGIC ──────────────────────────────────────── */
    var btnAiGenerate = document.getElementById('btn-ai-generate');
    var aiOutputSection = document.getElementById('ai-output-section');
    var aiOutputBox = document.getElementById('ai-output-box');
    var btnCopyAi = document.getElementById('btn-copy-ai');
    var btnApplyAi = document.getElementById('btn-apply-ai');

    // README type card active state toggle
    var rtypeCards = document.querySelectorAll('.readme-type-card');
    rtypeCards.forEach(function (card) {
        var radio = card.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', function () {
                rtypeCards.forEach(function (c) { c.classList.remove('active'); });
                if (radio.checked) card.classList.add('active');
            });
            card.addEventListener('click', function () {
                rtypeCards.forEach(function (c) { c.classList.remove('active'); });
                card.classList.add('active');
            });
        }
    });

    if (btnAiGenerate) {
        btnAiGenerate.onclick = async function () {
            var state = FormManager.getState();
            var extraText = (document.getElementById('f-ai-extra') || {}).value || '';
            var readmeType = 'full';
            var checked = document.querySelector('input[name="readme-type"]:checked');
            if (checked) readmeType = checked.value;

            // Validate: need at least a username
            if (!state.username && !state.name) {
                ExportManager.showToast('Please fill in your Name or GitHub Username first!', 'error');
                return;
            }

            // Loading state
            btnAiGenerate.disabled = true;
            btnAiGenerate.innerHTML = '<span class="ai-loading-spinner"><span class="spinner-ring"></span> Generating...</span>';

            if (aiOutputSection) aiOutputSection.style.display = 'flex';
            if (aiOutputBox) {
                aiOutputBox.className = 'ai-output-box loading';
                aiOutputBox.innerHTML = '<span class="ai-loading-spinner"><span class="spinner-ring"></span>&nbsp;AI is crafting your README...</span>';
            }

            try {
                var generated = await AIManager.generateReadme(state, readmeType, extraText);
                aiMarkdownOutput = generated;

                if (aiOutputBox) {
                    aiOutputBox.className = 'ai-output-box';
                    aiOutputBox.textContent = generated;
                }
                ExportManager.showToast('✨ AI README generated!', 'success', 2500);
            } catch (err) {
                console.error('AI generation error:', err);
                if (aiOutputBox) {
                    aiOutputBox.className = 'ai-output-box';
                    aiOutputBox.textContent = '❌ Generation failed: ' + (err.message || 'Network error. Please check your connection and try again.');
                }
                ExportManager.showToast('AI generation failed. Try again!', 'error');
            } finally {
                btnAiGenerate.disabled = false;
                btnAiGenerate.innerHTML =
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events:none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
                    ' Generate with AI';
            }
        };
    }

    if (btnCopyAi) {
        btnCopyAi.onclick = function () {
            if (!aiMarkdownOutput) { ExportManager.showToast('Nothing to copy yet!', 'error'); return; }
            ExportManager.copyToClipboard(aiMarkdownOutput);
        };
    }

    if (btnApplyAi) {
        btnApplyAi.onclick = function () {
            if (!aiMarkdownOutput) { ExportManager.showToast('Generate a README first!', 'error'); return; }
            PreviewRenderer.render(aiMarkdownOutput);
            ExportManager.showToast('✅ AI README applied to preview!', 'success', 2000);
            // Switch to preview tab
            ptabPreview.click();
        };
    }

    /* ── 11. SEED DEMO DATA (first visit) ─────────────────────── */
    function seedDemoData() {
        if (localStorage.getItem('readme-forge-v3-visited')) return;
        localStorage.setItem('readme-forge-v3-visited', '1');

        function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
        function setChk(id, val) { var el = document.getElementById(id); if (el) el.checked = val; }

        setVal('f-name', 'Vicky Raj');
        setVal('f-username', 'vicky-tec');
        setVal('f-tagline', 'Data Analyst | ML Learner | Web Developer | AI Builder');
        setVal('f-bio', 'Building insights. Creating impact. One project at a time.');
        setVal('f-location', 'Bihar, India');
        setVal('f-email', 'vickyrazzz81@gmail.com');
        setVal('f-website', 'https://vicky-tec.github.io/PortFoilo/');
        setVal('f-motto', 'Turning data into decisions and ideas into working code.');
        setVal('f-team', 'Cosmic Shakti');
        setVal('f-focus', 'Data Analytics, Machine Learning, AI Integration');
        setVal('f-status', 'Open to Collaborations & Internships');
        setVal('f-version', 'v2.0.0');
        setVal('f-typing-lines', 'Turning Data Into Insights;Building Local AI Agents;Crafting Beautiful Web Experiences;Privacy-First AI | RAG | OCR');
        setVal('f-banner-text', 'VICKY RAJ');
        setVal('f-banner-desc', 'Data Analyst | ML Learner | Web Dev | AI Builder');

        setChk('f-banner', true);
        setChk('f-show-stats', true);
        setChk('f-show-streak', true);
        setChk('f-show-langs', true);
        setChk('f-typing', true);
        setChk('f-yaml-about', true);
        setChk('f-skill-icons', true);
        setChk('f-wave', true);

        setVal('s-linkedin', 'vicky-raj-090760282');
        setVal('s-instagram', 'vr_razzz');
        setVal('s-github', 'vicky-tec');

        // Add default skills (clear first to avoid duplicates on re-init)
        ['HTML5', 'CSS3', 'JavaScript', 'Python', 'MySQL', 'Git', 'GitHub', 'Figma', 'Django', 'Power BI'].forEach(function (s) {
            FormManager.addSkill(s);
        });

        rebuildReadme();
    }

    seedDemoData();
    if (localStorage.getItem('readme-forge-v3-visited')) {
        setTimeout(rebuildReadme, 80);
    }

    /* ── 12. KEYBOARD SHORTCUTS ─────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') { e.preventDefault(); ExportManager.downloadReadme(PreviewRenderer.getLastMarkdown()); }
        if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); ExportManager.copyToClipboard(PreviewRenderer.getLastMarkdown()); }
    });

} // end init()

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
