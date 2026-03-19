/**
 * AIManager.js — AI-powered README generation
 * API: OpenRouter (https://openrouter.ai)
 * Model: arcee-ai/trinity-mini:free
 */

const AIManager = (() => {

    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    const API_KEY = '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';
    const MODEL = 'arcee-ai/trinity-mini:free';

    /**
     * Build the system prompt based on readme type
     */
    function buildSystemPrompt(readmeType) {
        const common = 'You are an expert GitHub profile README writer. Output ONLY valid GitHub Markdown — no explanations, no code fences wrapping the entire output, just raw markdown. Use HTML tags where needed for centering (e.g. <div align="center">). Produce complete, high-quality, real content. Never use placeholder text.';

        switch (readmeType) {
            case 'short':
                return common + ' Generate a SHORT, CLEAN, minimal GitHub profile README. Max 4 sections. Be punchy, impactful, concise. Structure: greeting, 3-bullet about, inline code skills, compact stats. No long walls of text.';
            case 'creative':
                return common + ' Generate a HIGHLY CREATIVE and VISUALLY RICH GitHub profile README. Must include: (1) capsule-render waving banner, (2) readme-typing-svg animation, (3) emoji-heavy sections with personality, (4) ASCII art or decorative dividers, (5) skillicons.dev icons, (6) GitHub stats side-by-side table, (7) a unique fun section like "My Coding Vibe", (8) animated footer wave. Make it feel alive and uniquely personal.';
            case 'idea':
                return common + ' The user will describe a project or profile idea in plain language. Generate a PROFESSIONAL, COMPLETE GitHub README for that idea. Structure it with: title, badges, description, features, tech stack, installation, usage, contributing, and license sections. Make it realistic and impressive.';
            case 'full':
            default:
                return common + ' Generate a COMPREHENSIVE, FULL GitHub profile README with: (1) Animated capsule-render banner, (2) profile view + follower badges, (3) typing animation SVG, (4) About Me with YAML code block, (5) Skills with skillicons.dev, (6) GitHub Stats side-by-side table, (7) Featured Projects table, (8) Social links badges, (9) Dev quote widget, (10) animated footer wave. Polished and professional.';
        }
    }

    /**
     * Build user prompt from form state + extra text
     */
    function buildUserPrompt(state, readmeType, extraText) {
        // If "idea" mode — the prompt IS the user's idea description
        if (readmeType === 'idea') {
            return 'Generate a complete, professional GitHub README for the following project idea:\n\n' + (extraText || 'A cool open-source project') + '\n\nMake it production-ready and impressive.';
        }

        const lines = [];
        lines.push('Generate a ' + (readmeType === 'short' ? 'short clean' : readmeType === 'creative' ? 'creative interactive' : 'full comprehensive') + ' GitHub profile README using this info:');
        lines.push('');

        if (state.name) lines.push('- Name: ' + state.name);
        if (state.username) lines.push('- GitHub Username: ' + state.username);
        if (state.tagline) lines.push('- Role/Tagline: ' + state.tagline);
        if (state.bio) lines.push('- About: ' + state.bio);
        if (state.location) lines.push('- Location: ' + state.location);
        if (state.email) lines.push('- Email: ' + state.email);
        if (state.website) lines.push('- Portfolio: ' + state.website);
        if (state.motto) lines.push('- Motto: ' + state.motto);
        if (state.status) lines.push('- Status: ' + state.status);
        if (state.focus) lines.push('- Focus Areas: ' + state.focus);
        if (state.team) lines.push('- Team/Org: ' + state.team);
        if (state.version) lines.push('- Version: ' + state.version);

        if (state.skills && state.skills.length) {
            lines.push('- Skills: ' + state.skills.join(', '));
        }

        if (state.socials) {
            const s = state.socials;
            if (s.github) lines.push('- GitHub: https://github.com/' + s.github);
            if (s.linkedin) lines.push('- LinkedIn: https://linkedin.com/in/' + s.linkedin);
            if (s.instagram) lines.push('- Instagram: https://instagram.com/' + s.instagram);
            if (s.twitter) lines.push('- Twitter: https://twitter.com/' + s.twitter);
            if (s.youtube) lines.push('- YouTube: https://youtube.com/@' + s.youtube);
            if (s.buymeacoffee) lines.push('- BuyMeACoffee: https://buymeacoffee.com/' + s.buymeacoffee);
        }

        if (state.projects && state.projects.length) {
            const named = state.projects.filter(p => p.name);
            if (named.length) {
                lines.push('- Projects:');
                named.forEach(p => {
                    lines.push('  * ' + p.name + (p.description ? ': ' + p.description : '') + (p.tech ? ' [' + p.tech + ']' : ''));
                });
            }
        }

        if (extraText && extraText.trim()) {
            lines.push('');
            lines.push('Additional context (use creatively):');
            lines.push(extraText.trim());
        }

        if (readmeType !== 'short') {
            lines.push('');
            lines.push('Stats theme: ' + (state.statsTheme || 'tokyonight'));
            lines.push('GitHub username for stats URLs: ' + (state.username || 'yourusername'));
        }

        lines.push('\nMake it impressive and ready to paste on GitHub.');
        return lines.join('\n');
    }

    /**
     * Generate README via OpenRouter API
     * @param {Object} state - form state from FormManager.getState()
     * @param {string} readmeType - 'full' | 'short' | 'creative' | 'idea'
     * @param {string} extraText - freeform extra context or idea description
     * @returns {Promise<string>} generated markdown
     */
    async function generateReadme(state, readmeType, extraText) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + API_KEY,
                'HTTP-Referer': 'https://vicky-tec.github.io/ReadmeGenerator/',
                'X-Title': 'README Forge',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: buildSystemPrompt(readmeType) },
                    { role: 'user', content: buildUserPrompt(state, readmeType, extraText) },
                ],
                temperature: 0.85,
                max_tokens: 3500,
            }),
        });

        if (!response.ok) {
            const err = await response.text().catch(() => '');
            throw new Error('OpenRouter API Error ' + response.status + ': ' + (err || response.statusText));
        }

        const data = await response.json();

        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content || '';
        }

        throw new Error('Unexpected response format from OpenRouter');
    }

    return { generateReadme };
})();
