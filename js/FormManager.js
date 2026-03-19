/**
 * FormManager.js
 * Collects all form values, manages skill chips and project cards.
 */
const FormManager = (() => {
    let skills = [];
    let projects = [];
    let onChangeCallback = null;

    const QUICK_SKILLS = [
        'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
        'Docker', 'Git', 'MongoDB', 'MySQL', 'PostgreSQL', 'AWS',
        'TailwindCSS', 'Vue', 'Angular', 'Django', 'Flask', 'FastAPI',
        'Figma', 'GraphQL', 'Rust', 'Go', 'Power BI', 'Pandas', 'NumPy',
        'TensorFlow', 'PyTorch', 'Streamlit', 'HuggingFace', 'SQLite',
    ];

    /* ── State collector ─────────────────────────────────────── */
    function getState() {
        return {
            name: _val('f-name'),
            username: _val('f-username'),
            tagline: _val('f-tagline'),
            bio: _val('f-bio'),
            location: _val('f-location'),
            email: _val('f-email'),
            website: _val('f-website'),
            motto: _val('f-motto'),
            team: _val('f-team'),
            focus: _val('f-focus'),
            status: _val('f-status'),
            version: _val('f-version'),
            typingLines: _val('f-typing-lines'),
            bannerText: _val('f-banner-text'),
            bannerDesc: _val('f-banner-desc'),
            bannerColor: _val('f-banner-color') || '0:6a0dad,50:9b30ff,100:00d4ff',

            showBanner: _checked('f-banner'),
            showStats: _checked('f-show-stats'),
            showStreak: _checked('f-show-streak'),
            showTrophies: _checked('f-show-trophies'),
            showLangs: _checked('f-show-langs'),
            showActivity: _checked('f-show-activity'),
            statsTheme: _val('f-stats-theme'),
            visitorBadge: _checked('f-visitor-badge'),
            wave: _checked('f-wave'),
            typing: _checked('f-typing'),
            yamlAbout: _checked('f-yaml-about'),
            skillIcons: _checked('f-skill-icons'),
            gifIdx: (function () { var el = document.getElementById('f-gif-idx'); return el ? parseInt(el.value, 10) : -1; })(),

            skills: [...skills],
            projects: projects.map(p => ({
                name: p.name, description: p.description,
                repo: p.repo, demo: p.demo, tech: p.tech,
                version: p.version,
            })),
            socials: {
                twitter: _val('s-twitter'),
                linkedin: _val('s-linkedin'),
                instagram: _val('s-instagram'),
                youtube: _val('s-youtube'),
                dev: _val('s-dev'),
                medium: _val('s-medium'),
                discord: _val('s-discord'),
                buymeacoffee: _val('s-buymeacoffee'),
                github: _val('s-github'),
            },
        };
    }

    function _val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    function _checked(id) { var el = document.getElementById(id); return el ? el.checked : false; }

    /* ── Skills management ─────────────────────────────────── */
    function addSkill(name) {
        var trimmed = name.trim();
        if (!trimmed) return false;
        if (skills.find(function (s) { return s.toLowerCase() === trimmed.toLowerCase(); })) return false;
        skills.push(trimmed);
        _renderSkills();
        _notify();
        return true;
    }

    function removeSkill(name) {
        skills = skills.filter(function (s) { return s !== name; });
        _renderSkills();
        _notify();
    }

    function _renderSkills() {
        var grid = document.getElementById('skills-grid');
        if (!grid) return;
        grid.innerHTML = '';
        skills.forEach(function (skill) {
            var chip = document.createElement('span');
            chip.className = 'skill-tag';
            chip.innerHTML = skill + '<button type="button" aria-label="Remove ' + skill + '">&times;</button>';
            chip.querySelector('button').onclick = function () { removeSkill(skill); };
            grid.appendChild(chip);
        });
        document.querySelectorAll('.quick-skill-chip').forEach(function (btn) {
            var s = btn.getAttribute('data-skill');
            var added = skills.some(function (x) { return x.toLowerCase() === s.toLowerCase(); });
            btn.style.borderColor = added ? 'var(--accent-primary)' : '';
            btn.style.color = added ? 'var(--accent-primary)' : '';
        });
    }

    function renderQuickSkills() {
        var container = document.getElementById('quick-skills');
        if (!container) return;
        container.innerHTML = QUICK_SKILLS.map(function (s) {
            return '<button type="button" class="quick-skill-chip" data-skill="' + s + '">' + s + '</button>';
        }).join('');
        container.querySelectorAll('.quick-skill-chip').forEach(function (btn) {
            btn.onclick = function () { addSkill(btn.getAttribute('data-skill')); };
        });
    }

    /* ── Projects management ───────────────────────────────── */
    function addProject() {
        var id = Date.now();
        projects.push({ id: id, name: '', description: '', repo: '', demo: '', tech: '', version: '' });
        _renderProjects();
        _notify();
    }

    function removeProject(id) {
        projects = projects.filter(function (p) { return p.id !== id; });
        _renderProjects();
        _notify();
    }

    function _renderProjects() {
        var list = document.getElementById('projects-list');
        if (!list) return;
        list.innerHTML = '';
        if (!projects.length) {
            list.innerHTML = '<p class="hint" style="margin-bottom:12px">No projects yet. Click \u201cAdd Project\u201d below.</p>';
            return;
        }
        projects.forEach(function (p, idx) {
            var card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML =
                '<div class="project-card-header">' +
                '<span class="project-label">Project ' + (idx + 1) + '</span>' +
                '<button type="button" class="btn btn-ghost btn-sm" style="padding:4px 8px;font-size:16px" aria-label="Remove project">🗑</button>' +
                '</div>' +
                '<div class="form-group"><label>Project Name</label>' +
                '<input type="text" class="pf-name" value="' + _esc(p.name) + '" placeholder="My Awesome Project"/></div>' +
                '<div class="form-group"><label>Description</label>' +
                '<input type="text" class="pf-desc" value="' + _esc(p.description) + '" placeholder="A short description..."/></div>' +
                '<div class="form-group"><label>Repo URL</label>' +
                '<input type="url" class="pf-repo" value="' + _esc(p.repo) + '" placeholder="https://github.com/user/repo"/></div>' +
                '<div class="form-group"><label>Live Demo URL</label>' +
                '<input type="url" class="pf-demo" value="' + _esc(p.demo) + '" placeholder="https://myproject.vercel.app"/></div>' +
                '<div class="form-group"><label>Tech Used (comma-separated)</label>' +
                '<input type="text" class="pf-tech" value="' + _esc(p.tech) + '" placeholder="React, Node.js, MongoDB"/></div>' +
                '<div class="form-group"><label>Version Badge <span class="hint-inline">e.g. v1.0.0</span></label>' +
                '<input type="text" class="pf-version" value="' + _esc(p.version) + '" placeholder="v1.0.0"/></div>';

            list.appendChild(card);

            // wire fields
            var map = { 'pf-name': 'name', 'pf-desc': 'description', 'pf-repo': 'repo', 'pf-demo': 'demo', 'pf-tech': 'tech', 'pf-version': 'version' };
            Object.keys(map).forEach(function (cls) {
                var el = card.querySelector('.' + cls);
                if (el) el.addEventListener('input', function () { p[map[cls]] = el.value; _notify(); });
            });

            card.querySelector('.project-remove').onclick = function () { removeProject(p.id); };
        });
    }

    function _esc(str) { return (str || '').replace(/"/g, '&quot;'); }

    /* ── Wire static form fields ───────────────────────────── */
    function wireFormFields() {
        var ids = [
            'f-name', 'f-username', 'f-tagline', 'f-bio', 'f-location', 'f-email', 'f-website',
            'f-motto', 'f-team', 'f-focus', 'f-status', 'f-version',
            'f-typing-lines', 'f-banner-text', 'f-banner-desc', 'f-banner-color',
            'f-show-stats', 'f-show-streak', 'f-show-trophies', 'f-show-langs', 'f-show-activity',
            'f-stats-theme', 'f-visitor-badge', 'f-wave', 'f-typing', 'f-yaml-about',
            'f-skill-icons', 'f-banner',
            's-twitter', 's-linkedin', 's-instagram', 's-youtube', 's-dev',
            's-medium', 's-discord', 's-buymeacoffee', 's-github',
        ];
        ids.forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', _notify);
            if (el.type === 'checkbox' || el.tagName === 'SELECT') el.addEventListener('change', _notify);
        });
    }

    function wireSkillInput() {
        var input = document.getElementById('skill-input');
        var btn = document.getElementById('btn-add-skill');
        if (!input || !btn) return;
        btn.onclick = function () { if (addSkill(input.value)) input.value = ''; };
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); if (addSkill(input.value)) input.value = ''; }
        });
    }

    function wireGifPicker() {
        var picker = document.getElementById('gif-picker');
        if (!picker) return;
        picker.querySelectorAll('.gif-option').forEach(function (btn) {
            btn.onclick = function () {
                picker.querySelectorAll('.gif-option').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var hidden = document.getElementById('f-gif-idx');
                if (hidden) hidden.value = btn.getAttribute('data-gif-idx');
                _notify();
            };
        });
    }

    function onChange(cb) { onChangeCallback = cb; }
    function _notify() { if (typeof onChangeCallback === 'function') onChangeCallback(); }

    function init() {
        wireFormFields();
        wireSkillInput();
        renderQuickSkills();
        _renderProjects();
        var btnAddProject = document.getElementById('btn-add-project');
        if (btnAddProject) btnAddProject.onclick = addProject;
        wireGifPicker();
    }

    return { init, getState, addSkill, onChange };
})();
