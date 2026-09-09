(function () {
    const KEY_AUTH   = 'trade_auth_key';
    const KEY_SERVER = 'trade_server';

    const getAuthKey = () => localStorage.getItem(KEY_AUTH) || '';
    const setAuthKey = k  => localStorage.setItem(KEY_AUTH, k);
    const clearAuth  = () => localStorage.removeItem(KEY_AUTH);
    const getServer  = () => (localStorage.getItem(KEY_SERVER) || 'https://api-finance.suaveforge.com:18465/api').replace(/\/$/, '');
    const AUTH_PATHS = new Set(['/buy', '/sell', '/cancel', '/modify', '/orders/add', '/orders/approve', '/orders/cancel', '/orders/clear']);

    function isServerUrl(url) {
        return typeof url === 'string' && url.startsWith(getServer());
    }

    function serverPath(url) {
        if (!isServerUrl(url)) return '';
        const path = url.slice(getServer().length).split('?')[0] || '/';
        return path.replace(/^\/+/, '/');
    }

    function needsAuth(url) {
        return AUTH_PATHS.has(serverPath(url));
    }

    // ── 모달 ──────────────────────────────────────────────
    let _resolve = null;

    function injectModal() {
        if (document.getElementById('auth-overlay')) return;
        const el = document.createElement('div');
        el.id = 'auth-overlay';
        el.style.cssText =
            'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);'
            + 'z-index:9999;align-items:center;justify-content:center;';
        el.innerHTML =
            '<div style="background:#1a1a2e;border:1px solid #444;border-radius:12px;'
            + 'padding:28px;width:320px;max-width:calc(100vw-32px)">'
            + '<div style="font-size:17px;font-weight:bold;color:#fff;margin-bottom:16px">인증 필요</div>'
            + '<input id="auth-input" type="password" placeholder="인증 키 입력"'
            + ' style="width:100%;background:#0f0f1a;border:1px solid #444;border-radius:6px;'
            + 'color:#fff;padding:12px;font-size:16px;outline:none;box-sizing:border-box;margin-bottom:14px">'
            + '<button id="auth-btn"'
            + ' style="width:100%;background:#2a3a5e;color:#7eb8f7;border:1px solid #7eb8f7;'
            + 'border-radius:6px;padding:12px;font-size:15px;font-weight:bold;cursor:pointer">확인</button>'
            + '<div id="auth-err" style="color:#ff9999;font-size:13px;margin-top:10px;display:none">'
            + '인증 키가 올바르지 않습니다.</div>'
            + '</div>';
        document.body.appendChild(el);

        function confirm() {
            const val = document.getElementById('auth-input').value.trim();
            if (!val) return;
            setAuthKey(val);
            el.style.display = 'none';
            document.getElementById('auth-err').style.display = 'none';
            document.getElementById('auth-input').value = '';
            if (_resolve) { _resolve(); _resolve = null; }
        }

        document.getElementById('auth-btn').onclick = confirm;
        document.getElementById('auth-input').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') confirm();
        });
    }

    function showAuthModal(isWrong) {
        return new Promise(function (resolve) {
            _resolve = resolve;
            var el = document.getElementById('auth-overlay');
            el.style.display = 'flex';
            if (isWrong) document.getElementById('auth-err').style.display = 'block';
            setTimeout(function () { document.getElementById('auth-input').focus(); }, 50);
        });
    }

    // ── fetch 오버라이드 ───────────────────────────────────
    var _origFetch = window.fetch.bind(window);
    window.fetch = async function (url, options) {
        options = options || {};
        if (!isServerUrl(url)) return _origFetch(url, options);
        if (!needsAuth(url)) return _origFetch(url, options);

        options = Object.assign({}, options, {
            headers: Object.assign({}, options.headers || {}, { 'X-Auth-Key': getAuthKey() })
        });
        var res = await _origFetch(url, options);
        if (res.status === 401) {
            clearAuth();
            await showAuthModal(true);
            options.headers['X-Auth-Key'] = getAuthKey();
            return _origFetch(url, options);
        }
        return res;
    };

    // ── 초기화 ────────────────────────────────────────────
    function init() {
        injectModal();
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
