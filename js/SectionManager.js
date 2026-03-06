/**
 * SectionManager.js
 * Manages the ordered list of README sections and their visibility.
 * Provides drag-and-drop ordering via Sortable.js.
 */
const SectionManager = (() => {
    // Default section configuration
    const DEFAULT_SECTIONS = [
        { id: 'header', label: '👋 Header / Greeting', enabled: true },
        { id: 'about', label: '🧑 About Me', enabled: true },
        { id: 'skills', label: '🛠 Skills & Tech Stack', enabled: true },
        { id: 'stats', label: '📊 GitHub Stats', enabled: true },
        { id: 'projects', label: '🚀 Projects', enabled: true },
        { id: 'badges', label: '🏷 Custom Badges', enabled: true },
        { id: 'social', label: '🔗 Social Links', enabled: true },
        { id: 'contact', label: '📬 Contact', enabled: true },
        { id: 'footer', label: '🌟 Footer', enabled: true },
    ];

    let sections = DEFAULT_SECTIONS.map(s => ({ ...s }));
    let sortableInstance = null;
    let onChangeCallback = null;

    /**
     * Render the sortable list into the DOM.
     */
    function render() {
        const list = document.getElementById('sections-sortable');
        if (!list) return;

        list.innerHTML = '';

        sections.forEach(sec => {
            const li = document.createElement('li');
            li.className = 'section-item';
            li.dataset.id = sec.id;

            li.innerHTML = `
        <span class="section-drag-handle" aria-hidden="true">⠿</span>
        <span class="section-item-label">${sec.label}</span>
        <input
          type="checkbox"
          class="section-item-toggle"
          ${sec.enabled ? 'checked' : ''}
          aria-label="Enable ${sec.label} section"
          data-section-id="${sec.id}"
        />
      `;

            list.appendChild(li);
        });

        // Wire toggle checkboxes
        list.querySelectorAll('.section-item-toggle').forEach(cb => {
            cb.addEventListener('change', e => {
                const id = e.target.dataset.sectionId;
                const sec = sections.find(s => s.id === id);
                if (sec) { sec.enabled = e.target.checked; }
                _notify();
            });
        });

        // Initialise Sortable
        if (sortableInstance) sortableInstance.destroy();
        if (typeof Sortable !== 'undefined') {
            sortableInstance = Sortable.create(list, {
                handle: '.section-drag-handle',
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                onEnd() {
                    // Sync order from DOM to sections array
                    const ids = [...list.querySelectorAll('.section-item')].map(li => li.dataset.id);
                    sections = ids.map(id => sections.find(s => s.id === id));
                    _notify();
                },
            });
        }
    }

    /** Get the current ordered list of sections */
    function getOrdered() {
        return sections;
    }

    /** Get only enabled sections in order */
    function getEnabled() {
        return sections.filter(s => s.enabled);
    }

    /** Register a callback fired whenever sections change */
    function onChange(cb) {
        onChangeCallback = cb;
    }

    function _notify() {
        if (typeof onChangeCallback === 'function') onChangeCallback();
    }

    return { render, getOrdered, getEnabled, onChange };
})();
