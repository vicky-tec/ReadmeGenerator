/**
 * BadgeBuilder.js
 * Builds shields.io badge URLs and manages the custom badge list.
 * O(k) where k = number of badges.
 */
const BadgeBuilder = (() => {
    let badges = []; // { label, message, color, style }
    let onChangeCallback = null;

    /* ── Skill → shields.io logo mapping ────────────────────────── */
    const SKILL_META = {
        // Languages
        javascript: { logo: 'javascript', color: 'F7DF1E', logoColor: 'black' },
        typescript: { logo: 'typescript', color: '3178C6', logoColor: 'white' },
        python: { logo: 'python', color: '3776AB', logoColor: 'white' },
        java: { logo: 'java', color: 'ED8B00', logoColor: 'white' },
        'c++': { logo: 'cplusplus', color: '00599C', logoColor: 'white' },
        c: { logo: 'c', color: 'A8B9CC', logoColor: 'black' },
        rust: { logo: 'rust', color: '000000', logoColor: 'white' },
        go: { logo: 'go', color: '00ADD8', logoColor: 'white' },
        kotlin: { logo: 'kotlin', color: '7F52FF', logoColor: 'white' },
        swift: { logo: 'swift', color: 'FA7343', logoColor: 'white' },
        dart: { logo: 'dart', color: '0175C2', logoColor: 'white' },
        php: { logo: 'php', color: '777BB4', logoColor: 'white' },
        ruby: { logo: 'ruby', color: 'CC342D', logoColor: 'white' },
        scala: { logo: 'scala', color: 'DC322F', logoColor: 'white' },
        r: { logo: 'r', color: '276DC3', logoColor: 'white' },
        // Web
        html: { logo: 'html5', color: 'E34F26', logoColor: 'white' },
        html5: { logo: 'html5', color: 'E34F26', logoColor: 'white' },
        css: { logo: 'css3', color: '1572B6', logoColor: 'white' },
        css3: { logo: 'css3', color: '1572B6', logoColor: 'white' },
        sass: { logo: 'sass', color: 'CC6699', logoColor: 'white' },
        // Frameworks
        react: { logo: 'react', color: '61DAFB', logoColor: 'black' },
        vue: { logo: 'vue.js', color: '4FC08D', logoColor: 'white' },
        'vue.js': { logo: 'vue.js', color: '4FC08D', logoColor: 'white' },
        angular: { logo: 'angular', color: 'DD0031', logoColor: 'white' },
        svelte: { logo: 'svelte', color: 'FF3E00', logoColor: 'white' },
        nextjs: { logo: 'next.js', color: '000000', logoColor: 'white' },
        'next.js': { logo: 'next.js', color: '000000', logoColor: 'white' },
        nuxt: { logo: 'nuxt.js', color: '00C58E', logoColor: 'white' },
        // Backend
        nodejs: { logo: 'node.js', color: '339933', logoColor: 'white' },
        'node.js': { logo: 'node.js', color: '339933', logoColor: 'white' },
        express: { logo: 'express', color: '000000', logoColor: 'white' },
        fastapi: { logo: 'fastapi', color: '009688', logoColor: 'white' },
        django: { logo: 'django', color: '092E20', logoColor: 'white' },
        flask: { logo: 'flask', color: '000000', logoColor: 'white' },
        laravel: { logo: 'laravel', color: 'FF2D20', logoColor: 'white' },
        spring: { logo: 'spring', color: '6DB33F', logoColor: 'white' },
        // Databases
        mongodb: { logo: 'mongodb', color: '47A248', logoColor: 'white' },
        mysql: { logo: 'mysql', color: '4479A1', logoColor: 'white' },
        postgresql: { logo: 'postgresql', color: '336791', logoColor: 'white' },
        redis: { logo: 'redis', color: 'DC382D', logoColor: 'white' },
        sqlite: { logo: 'sqlite', color: '003B57', logoColor: 'white' },
        // Cloud/DevOps
        docker: { logo: 'docker', color: '2496ED', logoColor: 'white' },
        kubernetes: { logo: 'kubernetes', color: '326CE5', logoColor: 'white' },
        aws: { logo: 'amazon-aws', color: '232F3E', logoColor: 'white' },
        gcp: { logo: 'google-cloud', color: '4285F4', logoColor: 'white' },
        azure: { logo: 'microsoft-azure', color: '0078D4', logoColor: 'white' },
        git: { logo: 'git', color: 'F05032', logoColor: 'white' },
        github: { logo: 'github', color: '181717', logoColor: 'white' },
        linux: { logo: 'linux', color: 'FCC624', logoColor: 'black' },
        // AI/ML
        tensorflow: { logo: 'tensorflow', color: 'FF6F00', logoColor: 'white' },
        pytorch: { logo: 'pytorch', color: 'EE4C2C', logoColor: 'white' },
        // Mobile
        flutter: { logo: 'flutter', color: '02569B', logoColor: 'white' },
        'react native': { logo: 'react', color: '61DAFB', logoColor: 'black' },
        // Tools
        figma: { logo: 'figma', color: 'F24E1E', logoColor: 'white' },
        vscode: { logo: 'visual-studio-code', color: '007ACC', logoColor: 'white' },
        graphql: { logo: 'graphql', color: 'E10098', logoColor: 'white' },
        tailwindcss: { logo: 'tailwind-css', color: '06B6D4', logoColor: 'white' },
        tailwind: { logo: 'tailwind-css', color: '06B6D4', logoColor: 'white' },
    };

    /**
     * Build a shields.io badge URL for a skill.
     * @param {string} skill
     * @returns {string} badge markdown image string
     */
    function skillBadgeMarkdown(skill) {
        const key = skill.toLowerCase();
        const meta = SKILL_META[key] || {
            logo: encodeURIComponent(key),
            color: '6e40c9',
            logoColor: 'white',
        };
        const label = encodeURIComponent(skill);
        const logo = encodeURIComponent(meta.logo);
        const color = meta.color;
        const logoColor = meta.logoColor;
        return `![${skill}](https://img.shields.io/badge/${label}-${color}?style=for-the-badge&logo=${logo}&logoColor=${logoColor})`;
    }

    /**
     * Build a custom badge URL and add it to the badge list.
     */
    function addCustomBadge({ label, message, color, style }) {
        const url = buildBadgeUrl(label, message, color, style);
        badges.push({ label, message, color, style, url });
        _notify();
        return url;
    }

    function removeBadge(index) {
        badges.splice(index, 1);
        _notify();
    }

    function getBadges() { return [...badges]; }

    function buildBadgeUrl(label, message, color, style) {
        const l = encodeURIComponent(label || 'label');
        const m = encodeURIComponent(message || 'badge');
        const c = encodeURIComponent(color || 'blueviolet').replace(/#/g, '');
        const s = encodeURIComponent(style || 'for-the-badge');
        return `https://img.shields.io/badge/${l}-${m}-${c}?style=${s}`;
    }

    function getBadgesMarkdown() {
        if (!badges.length) return '';
        return badges
            .map(b => `![${b.label} ${b.message}](${b.url})`)
            .join(' ');
    }

    /**
     * Render the badge list DOM in #badge-list.
     */
    function renderBadgeList() {
        const container = document.getElementById('badge-list');
        if (!container) return;
        if (!badges.length) {
            container.innerHTML = '<p style="font-size:.8rem;color:var(--text-muted)">No custom badges added yet.</p>';
            return;
        }
        container.innerHTML = badges.map((b, i) => `
      <div class="badge-item">
        <img src="${b.url}" alt="${b.label} ${b.message}" loading="lazy" />
        <button class="badge-item-remove" data-index="${i}" aria-label="Remove badge">✕</button>
      </div>
    `).join('');

        container.querySelectorAll('.badge-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                removeBadge(parseInt(btn.dataset.index, 10));
                renderBadgeList();
            });
        });
    }

    function onChange(cb) { onChangeCallback = cb; }
    function _notify() { if (typeof onChangeCallback === 'function') onChangeCallback(); }

    return {
        skillBadgeMarkdown,
        addCustomBadge,
        getBadges,
        getBadgesMarkdown,
        buildBadgeUrl,
        renderBadgeList,
        onChange,
        SKILL_META,
    };
})();
