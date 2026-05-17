const sectionSources = {
    home: 'content/home.md',
    design: 'content/design.md',
    algorithms: 'content/algorithms.md',
    specification: 'content/specification.md',
    implementation: 'content/implementation.md',
    results: 'content/results.md',
    conclusion: 'content/conclusion.md'
};

function activateNavLink(pageKey) {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (pageKey && link.getAttribute('href')?.includes(`${pageKey}.html`)) {
            link.classList.add('active');
        }
    });
}

function loadStylesheet(href) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function loadKatexAssets() {
    if (window.renderMathInElement) {
        return Promise.resolve();
    }
    if (window.katexAssetsLoading) {
        return window.katexAssetsLoading;
    }

    window.katexAssetsLoading = loadStylesheet('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css')
        .then(() => loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js'))
        .then(() => loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js'))
        .catch(error => {
            console.error('Failed to load KaTeX assets:', error);
        });

    return window.katexAssetsLoading;
}

function renderMath(el) {
    if (!window.renderMathInElement || !el) return;
    try {
        window.renderMathInElement(el, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false
        });
    } catch (error) {
        console.error('KaTeX render error:', error);
    }
}

async function loadSectionContent(pageKey) {
    let sources = sectionSources[pageKey];
    if (!sources) return;
    if (!Array.isArray(sources)) sources = [sources];

    for (let i = 0; i < sources.length; i++) {
        const filePath = sources[i];
        const targetId = i === 0 ? 'section-content' : `section-content-${i + 1}`;
        try {
            const response = await fetch(`${filePath}?t=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const markdown = await response.text();
            const html = marked.parse(markdown);
            const el = document.getElementById(targetId);
            if (el) {
                el.innerHTML = html;
                renderMath(el);
            }
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            loadWithXHR(filePath, targetId);
        }
    }
}

function loadWithXHR(filePath, targetId = 'section-content') {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${filePath}?t=${Date.now()}`, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            const el = document.getElementById(targetId);
            if (xhr.status === 200) {
                if (el) {
                    el.innerHTML = marked.parse(xhr.responseText);
                    renderMath(el);
                }
            } else {
                if (el) el.innerHTML = '<p>Error loading content.</p>';
            }
        }
    };
    xhr.send();
}

window.addEventListener('DOMContentLoaded', () => {
    const pageKey = document.body.dataset.page;
    activateNavLink(pageKey);
    loadKatexAssets().finally(() => {
        if (pageKey) {
            loadSectionContent(pageKey);
        }
    });
});
