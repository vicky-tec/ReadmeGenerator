/**
 * TemplateEngine.js — Advanced README Generator v3
 * Supports: advanced | developer | minimal | creative
 */
const TemplateEngine = (() => {

    /* ── Current year helper ──────────────────────────────────── */
    const CURRENT_YEAR = new Date().getFullYear();
    const CURRENT_DATE = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' });

    /* ── GitHub stats URLs ────────────────────────────────────── */
    function statsUrl(username, theme, type) {
        var u = encodeURIComponent(username || 'yourusername');
        var t = encodeURIComponent(theme || 'tokyonight');
        var base = 'https://github-readme-stats.vercel.app/api';
        switch (type) {
            case 'stats': return base + '?username=' + u + '&show_icons=true&theme=' + t + '&border_radius=12&include_all_commits=true&count_private=true&hide_border=true';
            case 'langs': return base + '/top-langs/?username=' + u + '&layout=compact&theme=' + t + '&border_radius=12&langs_count=8&hide_border=true';
            case 'streak': return 'https://streak-stats.demolab.com?user=' + u + '&theme=' + t + '&border_radius=12&hide_border=true';
            case 'trophy': return 'https://github-profile-trophy.vercel.app/?username=' + u + '&theme=' + t + '&no-frame=true&row=1&column=7&margin-w=8';
            case 'activity': return 'https://github-readme-activity-graph.vercel.app/graph?username=' + u + '&theme=tokyo-night&hide_border=true&area=true';
            default: return '';
        }
    }

    /* ── Coding GIF pool ─────────────────────────────────────── */
    var CODING_GIFS = [
        'https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif',
        'https://media.giphy.com/media/L1R1tvI9svkIWwpVYr/giphy.gif',
        'https://media.giphy.com/media/ZVik7pBtu9dNS/giphy.gif',
        'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
        'https://media.giphy.com/media/RbDKaczqWovIugyJmW/giphy.gif',
        'https://media.giphy.com/media/M9gbBd9nbDrOTu1Mqx/giphy.gif',
        'https://media.giphy.com/media/coxQHKASG60HrHtvkt/giphy.gif',
        'https://media.giphy.com/media/KAq5w47R9rmTuxXUOs/giphy.gif',
    ];

    function getCodingGif(state) {
        // If user manually picked a GIF, use that
        var idx = (typeof state.gifIdx === 'number' && state.gifIdx >= 0)
            ? state.gifIdx
            : 0;
        // Fallback: deterministic from username
        if (typeof state.gifIdx !== 'number' || state.gifIdx < 0) {
            var u = state.username || '';
            var hash = 0;
            for (var i = 0; i < u.length; i++) hash += u.charCodeAt(i);
            idx = hash % CODING_GIFS.length;
        }
        return CODING_GIFS[idx % CODING_GIFS.length];
    }

    /* ── Version badge ───────────────────────────────────────── */
    function versionBadge(version) {
        if (!version) return '';
        return '![Version](https://img.shields.io/badge/version-' + encodeURIComponent(version) + '-9b30ff?style=for-the-badge&logoColor=white)';
    }

    /* ── Combined Tech + Version badge (per-project) ─────────── */
    function techVersionBadge(tech, ver) {
        tech = (tech || '').trim();
        ver = (ver || '').trim();
        if (!tech) return '';
        var col = ver ? '6a0dad' : '4c1d95';
        var label = ver ? tech + ' | ' + ver : tech;
        return '![' + label + '](https://img.shields.io/badge/' + encodeURIComponent(label.replace(/ /g, '_')) + '-' + col + '?style=flat-square&logoColor=white)';
    }

    /* ── Animated banner ─────────────────────────────────────── */
    function buildBanner(state) {
        if (!state.showBanner) return '';
        var text = encodeURIComponent(state.bannerText || state.name || 'Your Name');
        var desc = encodeURIComponent(state.bannerDesc || state.tagline || '');
        var color = (state.bannerColor || '0:6a0dad,50:9b30ff,100:00d4ff').replace(/#/g, '');
        return [
            '<div align="center">',
            '',
            '<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=' + color + '&height=220&section=header&text=' + text + '&fontSize=70&fontAlign=50&fontAlignY=38&desc=' + desc + '&descAlign=50&descAlignY=60&fontColor=ffffff&descColor=e0cfff&animation=fadeIn" />',
            '',
            '</div>',
            '',
        ].join('\n');
    }

    /* ── Top badges (visitor + followers + version) ──────────── */
    function buildTopBadges(state) {
        var u = state.username || state.socials.github;
        if (!u) return '';
        var lines = [
            '<div align="center">',
            '',
            '[![Profile Views](https://komarev.com/ghpvc/?username=' + u + '&label=👁️%20Profile%20Views&color=blueviolet&style=for-the-badge)](https://github.com/' + u + ')',
            '&nbsp;',
            '![Followers](https://img.shields.io/github/followers/' + u + '?label=Followers&style=for-the-badge&color=9b30ff&logo=github)',
            '&nbsp;',
            '![Open to Collaborate](https://img.shields.io/badge/Open%20to-Collaborations-00d4ff?style=for-the-badge&logo=handshake&logoColor=white)',
        ];
        if (state.version) lines.push('&nbsp;\n' + versionBadge(state.version));
        lines.push('', '</div>', '');
        return lines.join('\n');
    }

    /* ── Typing animation ────────────────────────────────────── */
    function buildTypingAnimation(state) {
        if (!state.typing) return '';
        var rawLines = state.typingLines
            ? state.typingLines.split(';').map(function (l) { return l.trim(); }).filter(Boolean)
            : (state.tagline ? [state.tagline] : ['Hello World']);
        var encoded = rawLines.map(encodeURIComponent).join(';');
        return [
            '<div align="center">',
            '',
            '<a href="https://git.io/typing-svg">',
            '  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&duration=3000&pause=1000&color=9B30FF&center=true&vCenter=true&width=650&lines=' + encoded + '" alt="Typing SVG" />',
            '</a>',
            '',
            '</div>',
            '',
        ].join('\n');
    }

    /* ── Header ──────────────────────────────────────────────── */
    function buildHeader(state, tmpl) {
        if (state.showBanner && tmpl !== 'minimal') return ''; // Using banner instead
        var name = state.name || 'Your Name';

        if (tmpl === 'minimal') {
            return '# Hi there, I\'m ' + name + ' 👋\n' + (state.tagline ? '\n> ' + state.tagline : '') + '\n\n';
        }

        // Developer/Creative/Advanced default styles
        if (tmpl === 'creative') {
            return '<div align="center">\n\n# ✨ ' + name + ' ✨\n' + (state.tagline ? '\n### *' + state.tagline + '*' : '') + '\n\n</div>\n\n';
        }

        var w = state.wave
            ? '<img src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif" width="30px" alt="wave">'
            : '👋';
        return '<div align="center">\n\n# Hi, I\'m ' + name + ' ' + w + '\n' + (state.tagline ? '### ' + state.tagline : '') + '\n\n</div>\n\n';
    }

    /* ── About ───────────────────────────────────────────────── */
    function buildAbout(state, tmpl) {
        var bio = state.bio, location = state.location, email = state.email, website = state.website;
        var motto = state.motto, team = state.team, focus = state.focus, status = state.status;
        if (!bio && !location && !email && !website && !motto) return '';

        var gif = getCodingGif(state);
        var lines = ['## 👨‍💻 About Me', ''];

        if (tmpl !== 'minimal') {
            // GIF on right
            lines.push('<img align="right" src="' + gif + '" width="240" alt="Coding GIF"/>', '');

            if (state.yamlAbout) {
                lines.push('```yaml');
                if (state.name) lines.push('Name        : ' + state.name);
                if (state.tagline) lines.push('Role        : ' + state.tagline);
                if (location) lines.push('Location    : ' + location + ' 🌍');
                if (email) lines.push('Email       : ' + email);
                if (focus) lines.push('Focus Areas : ' + focus);
                if (team) lines.push('Team        : ' + team);
                if (motto) lines.push('Motto       : "' + motto + '"');
                if (status) lines.push('Status      : 🟢 ' + status);
                lines.push('```', '');
            }
        }

        if (bio) {
            // Convert simple lines to bullet points if not already
            bio.split('\n').forEach(function (line) {
                line = line.trim();
                if (line) lines.push((line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) ? line : '- ' + line);
            });
            lines.push('');
        }

        if (tmpl === 'minimal') {
            if (location) lines.push('- 📍 Based in **' + location + '**');
            if (email) lines.push('- 📫 Reach me at **[' + email + '](mailto:' + email + ')**');
            if (website) lines.push('- 🌐 Portfolio: **[' + website + '](' + website + ')**');
            lines.push('');
        }

        if (tmpl !== 'minimal') {
            var clearTag = '<br clear="right"/>';
            // avoid duplicate clear tags
            if (lines[lines.length - 1] !== clearTag) lines.push(clearTag, '');
        }
        return lines.join('\n');
    }

    /* ── Skills — structured grid layout ────────────────────── */
    /*
     * Skills are split into rows of BADGE_ROW_SIZE with a <br/> between rows
     * so the README preview shows a clean grid rather than one long line.
     */
    var BADGE_ROW_SIZE = 5; // badges per row

    // skillicons.dev supported icon slugs (lowercase)
    var SI_MAP = {
        'javascript': 'js', 'typescript': 'ts', 'python': 'python', 'html5': 'html', 'html': 'html',
        'css3': 'css', 'css': 'css', 'react': 'react', 'vue': 'vue', 'angular': 'angular',
        'nextjs': 'nextjs', 'next.js': 'nextjs', 'nodejs': 'nodejs', 'node.js': 'nodejs',
        'django': 'django', 'flask': 'flask', 'fastapi': 'fastapi', 'streamlit': 'streamlit',
        'docker': 'docker', 'kubernetes': 'kubernetes', 'git': 'git', 'github': 'github',
        'mysql': 'mysql', 'postgresql': 'postgres', 'mongodb': 'mongodb', 'redis': 'redis', 'sqlite': 'sqlite',
        'aws': 'aws', 'gcp': 'gcp', 'azure': 'azure', 'tailwindcss': 'tailwind', 'tailwind': 'tailwind',
        'sass': 'sass', 'graphql': 'graphql', 'tensorflow': 'tensorflow', 'pytorch': 'pytorch',
        'figma': 'figma', 'vscode': 'vscode', 'rust': 'rust', 'go': 'go',
        'java': 'java', 'kotlin': 'kotlin', 'swift': 'swift', 'php': 'php', 'ruby': 'ruby',
        'flutter': 'flutter', 'nuxt': 'nuxt', 'svelte': 'svelte', 'express': 'express',
        'laravel': 'laravel', 'spring': 'spring', 'linux': 'linux',
        'power bi': 'powerbi', 'pandas': 'py', 'numpy': 'py', 'matplotlib': 'py',
        'huggingface': 'pytorch', 'scikit-learn': 'sklearn',
    };

    function buildSkills(state, tmpl) {
        var skills = state.skills;
        if (!skills || !skills.length) return '';

        if (tmpl === 'minimal') {
            return '## 🛠 Tech Stack\n\n' + skills.map(function (s) { return '`' + s + '`'; }).join(' ') + '\n\n';
        }

        // Split skills into skillicons.dev and shields.io
        var siIcons = [];
        var shieldSkills = [];
        skills.forEach(function (s) {
            var slug = SI_MAP[s.toLowerCase()];
            if (slug && state.skillIcons && siIcons.indexOf(slug) === -1) {
                siIcons.push(slug);
            } else {
                shieldSkills.push(s);
            }
        });

        var lines = ['## 🛠️ Languages & Tools', ''];

        // Row 1: skillicons.dev (up to 10 per row)
        if (tmpl !== 'minimal' && siIcons.length && state.skillIcons) {
            for (var i = 0; i < siIcons.length; i += 10) {
                var chunk = siIcons.slice(i, i + 10).join(',');
                lines.push(
                    '<div align="center">',
                    '',
                    '<img src="https://skillicons.dev/icons?i=' + chunk + '&perline=10" height="45" alt="skills"/>',
                    '',
                    '</div>',
                    ''
                );
            }
        }

        // Shields.io badges in rows of BADGE_ROW_SIZE
        if (shieldSkills.length) {
            lines.push('<div align="center">', '');
            for (var j = 0; j < shieldSkills.length; j += BADGE_ROW_SIZE) {
                var row = shieldSkills.slice(j, j + BADGE_ROW_SIZE);
                lines.push(row.map(function (s) { return BadgeBuilder.skillBadgeMarkdown(s); }).join(' '));
                if (j + BADGE_ROW_SIZE < shieldSkills.length) lines.push(''); // blank line = row break
            }
            lines.push('', '</div>', '');
        }

        return lines.join('\n');
    }

    /* ── GitHub Stats & Achievements ─────────────────────────── */
    function buildStats(state, tmpl) {
        var u = state.username || 'yourusername';
        if (!state.showStats && !state.showStreak && !state.showTrophies && !state.showLangs) return '';

        var isMin = (tmpl === 'minimal');
        var lines = [
            '## 📊 GitHub Stats & Achievements',
            '',
            '> 📅 *Stats updated: **' + CURRENT_DATE + '** — tracking contributions since joined GitHub*',
            '',
        ];

        if (!isMin) lines.push('<div align="center">', '');

        var bgParam = isMin ? '&bg_color=00000000' : ''; // Transparent background for minimal

        if (state.showTrophies) {
            lines.push(
                '<img src="' + statsUrl(u, state.statsTheme, 'trophy') + bgParam + '" alt="Trophies" width="100%"/>',
                isMin ? '' : '<br/><br/>',
                ''
            );
        }

        if (state.showStats || state.showStreak) {
            if (isMin) {
                if (state.showStats) lines.push('![' + u + ' Stats](' + statsUrl(u, state.statsTheme, 'stats') + bgParam + ')', '');
                if (state.showStreak) lines.push('![' + u + ' Streak](' + statsUrl(u, state.statsTheme, 'streak') + bgParam + ')', '');
            } else {
                lines.push('<table border="0" cellspacing="0" cellpadding="6"><tr>');
                if (state.showStats) lines.push('<td><img src="' + statsUrl(u, state.statsTheme, 'stats') + '" alt="GitHub Stats" height="180"/></td>');
                if (state.showStreak) lines.push('<td><img src="' + statsUrl(u, state.statsTheme, 'streak') + '" alt="GitHub Streak" height="180"/></td>');
                lines.push('</tr></table>', '');
            }
        }

        if (state.showLangs) {
            if (isMin) {
                lines.push('![' + u + ' Top Languages](' + statsUrl(u, state.statsTheme, 'langs') + bgParam + ')', '');
            } else {
                lines.push('<img src="' + statsUrl(u, state.statsTheme, 'langs') + '" alt="Top Languages" height="160"/>', '');
            }
        }

        if (state.showActivity) {
            if (isMin) {
                lines.push('![' + u + ' Activity](' + statsUrl(u, state.statsTheme, 'activity') + bgParam + ')', '');
            } else {
                lines.push('<br/>', '<img src="' + statsUrl(u, state.statsTheme, 'activity') + '" width="95%" alt="Activity Graph"/>', '');
            }
        }

        if (!isMin) lines.push('</div>', '');
        return lines.join('\n');
    }

    /* ── Projects ────────────────────────────────────────────── */
    function buildProjects(state, tmpl) {
        var projects = state.projects;
        if (!projects || !projects.length) return '';

        if (tmpl === 'minimal') {
            var l = ['## 🚀 Projects', ''];
            projects.forEach(function (p) {
                if (!p.name) return;
                var url = p.repo || '';
                l.push('- **[' + p.name + '](' + url + ')** — ' + (p.description || ''));
            });
            return l.join('\n') + '\n\n';
        }

        var named = projects.filter(function (p) { return p.name; });

        /* Advanced: fancy HTML table */
        if (tmpl !== 'minimal' && named.length >= 2) {
            var cols = Math.min(named.length, 3);
            var pct = Math.floor(100 / cols);
            var rows = ['## 🚀 Featured Projects', '', '<table align="center" width="100%">', '  <tr>'];

            named.forEach(function (p) {
                var repoUrl = p.repo || ('https://github.com/' + (state.username || 'username') + '/' + p.name.replace(/\s+/g, '-'));
                // Combine tech parts + version into individual styled badges
                var techBadges = '';
                if (p.tech) {
                    techBadges = p.tech.split(',').map(function (t, idx) {
                        var colors = ['6a0dad', '0052cc', '00875a', 'c05621', '1d4ed8', '831843'];
                        var col = colors[idx % colors.length];
                        // Include version in the first tech badge
                        var label = t.trim() + (idx === 0 && p.version ? ' ' + p.version : '');
                        return '<img src="https://img.shields.io/badge/' + encodeURIComponent(label.replace(/ /g, '_')) + '-' + col + '?style=flat-square&logoColor=white" alt="' + label + '"/>';
                    }).join('&nbsp;');
                }

                rows.push(
                    '    <td width="' + pct + '%" valign="top" align="center">',
                    '      <h3>' + p.name + '</h3>',
                    p.repo ? '      <a href="' + repoUrl + '"><img src="https://img.shields.io/badge/GitHub-6a0dad?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>' : '',
                    p.demo ? '      &nbsp;<a href="' + p.demo + '"><img src="https://img.shields.io/badge/Live_Demo-00d4ff?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"/></a>' : '',
                    '      <br/><br/>',
                    '      <p>' + (p.description || '') + '</p>',
                    techBadges ? '      <div>\n      ' + techBadges + '\n      </div>' : '',
                    '    </td>'
                );
            });

            rows.push('  </tr>', '</table>', '');
            return rows.join('\n');
        }

        /* Standard card layout for single project or creative */
        var lines = ['## 🚀 Projects', ''];
        named.forEach(function (p) {
            var repoUrl = p.repo || ('https://github.com/' + (state.username || 'username') + '/' + p.name.replace(/\s+/g, '-'));
            lines.push('### [' + p.name + '](' + repoUrl + ')');
            // combined tech|version badge
            if (p.tech || p.version) {
                var techArr = p.tech ? p.tech.split(',') : [];
                var combined = techArr.map(function (t, i) { return techVersionBadge(t, i === 0 ? p.version : ''); }).join(' ');
                if (combined) lines.push(combined);
            }
            lines.push(p.description || '', '');
            var live = p.demo ? '[🔗 Live Demo](' + p.demo + ') · ' : '';
            lines.push(live + '[📁 Repo](' + repoUrl + ')', '');
        });
        return lines.join('\n');
    }

    /* ── Custom Badges ───────────────────────────────────────── */
    function buildBadgesSection() {
        var md = BadgeBuilder.getBadgesMarkdown();
        if (!md) return '';
        return ['## 🏷 Badges', '', '<div align="center">', '', md, '', '</div>', ''].join('\n');
    }

    /* ── Social — structured table grid ──────────────────────── */
    function buildSocial(state) {
        var s = state.socials;
        var defs = [];
        if (s.linkedin) defs.push({ label: 'LinkedIn', color: '0077B5', logo: 'linkedin', url: 'https://linkedin.com/in/' + s.linkedin });
        if (s.github) defs.push({ label: 'GitHub', color: '181717', logo: 'github', url: 'https://github.com/' + s.github });
        if (s.instagram) defs.push({ label: 'Instagram', color: 'E4405F', logo: 'instagram', url: 'https://instagram.com/' + s.instagram });
        if (s.twitter) defs.push({ label: 'Twitter', color: '1DA1F2', logo: 'twitter', url: 'https://twitter.com/' + s.twitter });
        if (s.youtube) defs.push({ label: 'YouTube', color: 'FF0000', logo: 'youtube', url: 'https://youtube.com/@' + s.youtube });
        if (s.dev) defs.push({ label: 'Dev.to', color: '0A0A0A', logo: 'devdotto', url: 'https://dev.to/' + s.dev });
        if (s.medium) defs.push({ label: 'Medium', color: '12100E', logo: 'medium', url: 'https://medium.com/@' + s.medium });
        if (s.buymeacoffee) defs.push({ label: 'Buy_Me_A_Coffee', color: 'FFDD00', logo: 'buy-me-a-coffee', url: 'https://buymeacoffee.com/' + s.buymeacoffee });
        if (s.discord) defs.push({ label: 'Discord', color: '5865F2', logo: 'discord', url: s.discord });
        if (!defs.length) return '';

        var COLS = 3; // badges per row in the HTML table
        var tableRows = [];
        for (var i = 0; i < defs.length; i += COLS) {
            var cells = defs.slice(i, i + COLS).map(function (d) {
                var badge = '<a href="' + d.url + '"><img src="https://img.shields.io/badge/' + encodeURIComponent(d.label) + '-' + d.color + '?style=for-the-badge&logo=' + d.logo + '&logoColor=white" alt="' + d.label + '"/></a>';
                return '    <td align="center" width="33%">\n      ' + badge + '\n    </td>';
            }).join('\n');
            tableRows.push('  <tr>\n' + cells + '\n  </tr>');
        }

        var lines = [
            '## 📫 Connect with Me',
            '',
            '<table align="center">',
            tableRows.join('\n'),
            '</table>',
            '',
        ];

        // Dev quote
        if (state.username || s.github) {
            lines.push(
                '<div align="center">', '',
                '<img src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=tokyonight" width="70%" alt="Dev Quote"/>',
                '', '</div>', ''
            );
        }

        return lines.join('\n');
    }

    /* ── Contact ─────────────────────────────────────────────── */
    function buildContact(state) {
        var { email, website } = state;
        if (!email && !website) return '';
        var lines = ['## 📬 Get In Touch', ''];
        if (email) lines.push('📧 **Email:** [' + email + '](mailto:' + email + ')');
        if (website) lines.push('🌐 **Portfolio:** [' + website + '](' + website + ')');
        lines.push('');
        return lines.join('\n');
    }

    /* ── Footer ──────────────────────────────────────────────── */
    function buildFooter(state, tmpl) {
        var u = state.username;
        var lines = ['---', ''];

        if (state.visitorBadge && u) {
            lines.push(
                '<div align="center">', '',
                '![visitors](https://visitor-badge.laobi.icu/badge?page_id=' + u + '.' + u + ')',
                '', '</div>', ''
            );
        }

        if (tmpl !== 'minimal') {
            lines.push(
                '<div align="center">', '',
                '<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:00d4ff,50:9b30ff,100:6a0dad&height=130&section=footer&text=Thanks+for+Visiting+%E2%9C%A8&fontSize=28&fontColor=ffffff&fontAlign=50&fontAlignY=70&animation=fadeIn"/>',
                '',
                '**⭐ Star my repos if you find them useful — it motivates me to build more! 🚀**',
                '',
                '*Made with ❤️ by ' + (state.name || 'Me') + ' | © ' + CURRENT_YEAR + '*',
                '', '</div>', ''
            );
        } else {
            lines.push(
                '<div align="center">', '',
                '<i>Thanks for visiting! 😊 © ' + CURRENT_YEAR + '</i>',
                '', '</div>', ''
            );
        }

        return lines.join('\n');
    }

    /* ── PUBLIC: generate ────────────────────────────────────── */
    function generate(state, template, enabledSections) {
        var parts = [];
        var enabledIds = enabledSections.map(function (s) { return s.id; });

        // Fixed pre-sections for non-minimal templates
        if (template !== 'minimal') {
            if (state.showBanner) parts.push(buildBanner(state));
            parts.push(buildTopBadges(state));
            if (state.typing) parts.push(buildTypingAnimation(state));
        }

        var builders = {
            header: function () { return buildHeader(state, template); },
            about: function () { return buildAbout(state, template); },
            skills: function () { return buildSkills(state, template); },
            stats: function () { return buildStats(state, template); },
            projects: function () { return buildProjects(state, template); },
            badges: function () { return buildBadgesSection(); },
            social: function () { return buildSocial(state); },
            contact: function () { return buildContact(state); },
            footer: function () { return buildFooter(state, template); },
        };

        enabledIds.forEach(function (id) {
            var builder = builders[id];
            if (builder) {
                var content = builder();
                if (content) parts.push(content);
            }
        });

        return parts.join('\n');
    }

    return { generate };
})();
