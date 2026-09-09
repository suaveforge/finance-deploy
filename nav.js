(function () {
    const PAGES = [
        { href: 'index.html',      label: '설정' },
        { href: 'symbols.html',    label: '종목 순위' },
        { href: 'holdings.html',   label: '잔고' },
        { href: 'pending.html',    label: '미체결' },
        { href: 'overview.html',   label: '전광판' },
        { href: 'search.html',     label: '종목 검색' },
        { href: 'hoga.html',       label: '호가' },
        { href: 'orders.html',     label: '주문대기열' },
    ];

    const cur = location.pathname.split('/').pop() || 'index.html';

    function inject() {
        const s = document.createElement('style');
        s.textContent =
            '.nav-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:18px;}' +
            '.nav-bar a{text-decoration:none;}' +
            '.nav-bar button{background:#2a2a3e;color:#ccc;border:1px solid #444;' +
            'padding:8px 14px;border-radius:6px;cursor:pointer;font-size:13px;touch-action:manipulation;}' +
            '.nav-bar button:hover{background:#3a3a5e;color:#fff;}' +
            '.nav-bar button.active{background:#2a3a5e;color:#7eb8f7;border-color:#7eb8f7;}';
        document.head.appendChild(s);

        const nav = document.createElement('div');
        nav.className = 'nav-bar';
        nav.innerHTML = PAGES.map(p =>
            `<a href="${p.href}"><button${cur === p.href ? ' class="active"' : ''}>${p.label}</button></a>`
        ).join('');
        document.body.insertBefore(nav, document.body.firstChild);
    }

    if (document.body) inject();
    else document.addEventListener('DOMContentLoaded', inject);
})();
