document.addEventListener('DOMContentLoaded', () => {

    // ══════════════════════════════════════════════════════
    // 1. BUTTON TEXT – right-click to edit
    // ══════════════════════════════════════════════════════
    document.querySelectorAll('.btn').forEach((btn, i) => {
        const id = btn.id || ('btn_' + i);
        if (!btn.id) btn.id = id;
        btn.title = 'Right-click to edit text';
        const saved = localStorage.getItem('btn_html_' + id);
        if (saved) btn.innerHTML = saved;
        btn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const t = prompt('Edit button text:', btn.innerText.trim());
            if (t !== null && t.trim()) { btn.innerHTML = t.trim(); localStorage.setItem('btn_html_' + id, t.trim()); }
        });
    });

    // ══════════════════════════════════════════════════════
    // 2. EDITABLE TEXT – double-click to edit
    // ══════════════════════════════════════════════════════
    document.querySelectorAll('.editable').forEach((el, i) => {
        const id = el.id || ('edit_' + i);
        if (!el.id) el.id = id;
        const saved = localStorage.getItem(id);
        if (saved) el.innerHTML = saved;
        el.addEventListener('dblclick', (e) => { e.stopPropagation(); el.setAttribute('contenteditable', 'true'); el.focus(); });
        el.addEventListener('blur', () => { el.removeAttribute('contenteditable'); localStorage.setItem(id, el.innerHTML); });
    });

    // ══════════════════════════════════════════════════════
    // 3. PHONE – double-click to edit all instances
    // ══════════════════════════════════════════════════════
    const PHONE_KEY = 'site-phone';
    const storedPhone = localStorage.getItem(PHONE_KEY) || '(501) 555-0199';

    function updateAllPhones(num) {
        localStorage.setItem(PHONE_KEY, num);
        document.querySelectorAll('[data-phone]').forEach(el => {
            el.textContent = num;
            const link = el.closest('a');
            if (link) link.href = 'tel:' + num.replace(/\D/g, '');
        });
    }
    updateAllPhones(storedPhone);

    document.querySelectorAll('[data-phone]').forEach(el => {
        el.style.cursor = 'pointer';
        el.title = 'Double-click to edit number';
        el.addEventListener('dblclick', (e) => {
            e.preventDefault(); e.stopPropagation();
            const n = prompt('New phone number:', el.textContent.trim());
            if (n && n.trim()) updateAllPhones(n.trim());
        });
    });

    // ══════════════════════════════════════════════════════
    // 4. LOGO – click to open popup with URL, name, size
    // ══════════════════════════════════════════════════════
    const logoArea   = document.getElementById('logo-area');
    const logoImg    = document.getElementById('navbar-logo-img');
    const logoName   = document.getElementById('logo-name');
    const logoPopup  = document.getElementById('logo-popup');
    const lpImgInput = document.getElementById('lp-img-input');
    const lpNameIn   = document.getElementById('lp-name-input');
    const lpSizeIn   = document.getElementById('lp-size-input');
    const lpSizeVal  = document.getElementById('lp-size-val');
    const lpApply    = document.getElementById('lp-apply-btn');
    const lpCancel   = document.getElementById('lp-cancel-btn');

    const LOGO_KEY = 'logo-src';
    const NAME_KEY = 'logo-name';
    const SIZE_KEY = 'logo-scale';

    // Restore saved logo
    let currentScale = parseFloat(localStorage.getItem(SIZE_KEY)) || 1;
    if (localStorage.getItem(LOGO_KEY)) logoImg.src = localStorage.getItem(LOGO_KEY);
    if (localStorage.getItem(NAME_KEY)) logoName.textContent = localStorage.getItem(NAME_KEY);
    logoImg.style.transform = `scale(${currentScale})`;

    function openLogoPopup(e) {
        e.stopPropagation();
        if (logoPopup.classList.contains('open')) { logoPopup.classList.remove('open'); return; }
        lpImgInput.value  = localStorage.getItem(LOGO_KEY) || '';
        lpNameIn.value    = localStorage.getItem(NAME_KEY) || logoName.textContent.trim();
        lpSizeIn.value    = Math.round(currentScale * 50); // slider 10-100 → scale 0.2-2
        lpSizeVal.textContent = Math.round(currentScale * 100) + '%';
        logoPopup.classList.add('open');
        setTimeout(() => lpImgInput.focus(), 80);
    }

    logoArea.addEventListener('click', openLogoPopup);

    // Live size preview via slider
    lpSizeIn.addEventListener('input', () => {
        const scale = lpSizeIn.value / 50; // 10→0.2, 50→1, 100→2
        lpSizeVal.textContent = Math.round(scale * 100) + '%';
        logoImg.style.transform = `scale(${scale})`;
    });

    lpApply.addEventListener('click', () => {
        const newSrc  = lpImgInput.value.trim();
        const newName = lpNameIn.value.trim();
        const scale   = lpSizeIn.value / 50;

        if (newSrc) {
            logoImg.src = newSrc;
            localStorage.setItem(LOGO_KEY, newSrc);
        }
        if (newName) {
            logoName.textContent = newName;
            localStorage.setItem(NAME_KEY, newName);
        }
        currentScale = scale;
        logoImg.style.transform = `scale(${scale})`;
        localStorage.setItem(SIZE_KEY, scale);
        logoPopup.classList.remove('open');
    });

    lpCancel.addEventListener('click', () => {
        // revert preview on cancel
        logoImg.style.transform = `scale(${currentScale})`;
        logoPopup.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
        if (logoArea && !logoArea.contains(e.target)) logoPopup.classList.remove('open');
    });

    // ══════════════════════════════════════════════════════
    // 5. FAQ ACCORDION
    // ══════════════════════════════════════════════════════
    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            const open = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!open) item.classList.add('active');
        });
    });

    // ══════════════════════════════════════════════════════
    // 6. GALLERY – restore, replace modal, lightbox
    // ══════════════════════════════════════════════════════
    const imgModal    = document.getElementById('img-modal');
    const imgUrlIn    = document.getElementById('img-url-input');
    const imgApplyBtn = document.getElementById('img-apply-btn');
    const imgCancelBtn= document.getElementById('img-cancel-btn');
    let galTarget = null;

    function openImgModal(t) { galTarget = t; imgUrlIn.value = ''; imgModal.classList.add('open'); setTimeout(() => imgUrlIn.focus(), 80); }
    function closeImgModal() { imgModal.classList.remove('open'); galTarget = null; }
    function applyImg(src) { if (!src || !galTarget) return; galTarget.el.src = src; localStorage.setItem(galTarget.key, src); closeImgModal(); }

    imgApplyBtn.addEventListener('click', () => applyImg(imgUrlIn.value.trim()));
    imgUrlIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyImg(imgUrlIn.value.trim()); });
    imgCancelBtn.addEventListener('click', closeImgModal);
    imgModal.addEventListener('click', (e) => { if (e.target === imgModal) closeImgModal(); });

    document.querySelectorAll('.gallery-wrap').forEach((wrap, i) => {
        const img  = wrap.querySelector('img');
        const key  = 'gallery-img-' + i;
        const saved = localStorage.getItem(key);
        if (saved) img.src = saved;
        wrap.querySelector('.gallery-edit-btn').addEventListener('click', (e) => { e.stopPropagation(); openImgModal({ key, el: img }); });
        img.addEventListener('click', () => openLightbox(img.src));
    });

    // ══════════════════════════════════════════════════════
    // 7. LIGHTBOX
    // ══════════════════════════════════════════════════════
    const lightbox      = document.getElementById('lightbox');
    const lightboxImg   = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    function openLightbox(src) { lightboxImg.src = src; lightbox.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeLightbox()   { lightbox.classList.remove('open'); document.body.style.overflow = ''; }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    // ══════════════════════════════════════════════════════
    // 8. GLOBAL PASTE → fill active modal/popup input
    // ══════════════════════════════════════════════════════
    document.addEventListener('paste', (e) => {
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (!text) return;
        if (imgModal.classList.contains('open'))  { e.preventDefault(); imgUrlIn.value  = text; }
        else if (logoPopup.classList.contains('open')) { e.preventDefault(); lpImgInput.value = text; }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeLightbox(); closeImgModal(); logoPopup.classList.remove('open'); }
    });
});
