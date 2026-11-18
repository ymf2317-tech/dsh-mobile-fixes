/**
 * dsh-mobile-fixes — browser half.
 *
 * Injects exactly one <style> element into document.head. No DOM ownership, no
 * observers, no event listeners: if this module is disabled the page is byte-for
 * byte the page the upstream plugins render. That discipline is the whole point
 * — see the sidebar-entries incident where a 500ms sweep of document.body ate a
 * Host dialog. A stylesheet cannot delete anything.
 *
 * Every rule is scoped to @media (max-width: 640px) so desktop layout is
 * untouched, and every selector is prefixed with `html body` on purpose:
 * dsh-expert appends its own <style> when the popup MOUNTS, i.e. after this one,
 * and its rules carry the same specificity (0,2,1 for the grid). Without the
 * extra type selectors the upstream rule wins on source order and the whole
 * block silently does nothing. Verified the hard way: the width override below
 * applied while the column override did not.
 */
window.__ModuleLoader__.load({
  id: 'dsh-mobile-fixes',
  factory: () => {
    const STYLE_ID = 'dsh-mobile-fixes';

    const CSS = `
@media (max-width: 640px) {
  /* ── dsh-expert · T专家 弹窗 (.t-team-pop) ─────────────────────────────
     上游把网格列数钉死成 repeat(4,minmax(0,1fr)) —— 桌面端用户明确要求
     "固定 4 个"，作者照做了，于是没有任何按宽度的回退。而弹窗本身是
     width:var(--t-team-pop-w,720px) + max-width:calc(100vw - 16px)，
     在 390px 手机上：弹窗 374px，扣掉 padding-left 10 与 "> *" 的 margin-right 10
     后内容宽 354px，四列各分到 (354 - 3×12)/4 ≈ 79px —— 这就是"被左右压扁"。
     两列后每列 ≈172px，卡片终于能站直。 */
  html body .t-team-pop[data-tab="experts"] .t-team-pop-list,
  html body .t-team-pop[data-tab="skills"] .t-team-pop-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 10px;
  }

  /* 名字/副标题上游是 nowrap + 省略号（截图里的"端侧 Rikk…"）。两列有宽度了，
     给两行更值；再多行会把卡片高度撑乱，所以夹在 2 行。 */
  html body .t-team-pop-name,
  html body .t-team-pop-sub {
    white-space: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  html body .t-team-pop-name { -webkit-line-clamp: 2; }
  html body .t-team-pop-sub  { -webkit-line-clamp: 2; }

  /* 44px 头像在 172px 的卡里吃掉四分之一，缩到 36px 把宽度还给文字。 */
  html body .t-team-pop-avatar { width: 36px; height: 36px; font-size: 22px; }
  html body .t-team-pop-item .t-team-pop-head { height: auto; }

  /* iOS Safari 聚焦 font-size < 16px 的输入框会自动放大整页 —— 而搜索专家正是
     这个弹窗的主入口，一放大弹窗就只剩半屏。顺带把 30px 的行高抬到 36px，
     16px 的字塞进 30px 会被裁。 */
  html body .t-team-pop .t-team-input {
    font-size: 16px;
    height: 36px;
  }

  /* 分类标签条上游已有 overflow-x:auto + 两侧圆形箭头；手机上把滚动条藏掉，
     免得它比标签本身更抢眼。 */
  html body .t-team-pop-divs { scrollbar-width: none; }
  html body .t-team-pop-divs::-webkit-scrollbar { display: none; }

  /* 手机浏览器的 100vh 含地址栏，100dvh 才是真正可见的那块。 */
  html body .t-team-pop { max-height: calc(100dvh - 16px); }

  /* ── dsh-purge · 净化面板 (.dshp-dock) ─────────────────────────────────
     上游 PurgeDock 把 left/top/width/height 直接写进内联 style（client.js 里
     panel 的 style 对象：left:geom.x+"px", width:geom.w+"px" …），而
     clampDockGeom 用的是 Math.max(380, vw-16) —— 380 是地板不是天花板。
     422px 视口算出来 w=408、x=8，面板右边缘到 416，再被 root 的 16px 内边距
     往里推，右侧按钮就贴边；而 .dshp-dock 又是 overflow:visible，溢出的部分
     直接画到屏幕外（截图里「检测更新」被切掉半个就是这个）。
     内联样式只能靠 !important 压过，这是本文件唯一一处 !important，
     范围锁死在 .dshp-dock 的盒模型，不动它的配色和字号。
     代价：窄屏下拖拽/缩放改尺寸会失效（反正触屏也抓不住那 10px 手柄），
     桌面宽度完全不受影响。 */
  html body .dshp-dock {
    left: 8px !important;
    right: 8px !important;
    top: 8px !important;
    bottom: auto !important;
    width: auto !important;
    height: auto !important;
    min-width: 0;
    max-width: none;
    max-height: calc(100dvh - 96px);
  }

  /* 400px 级宽度里 16px 内边距加 18px 行距太奢侈，收到 12/14。 */
  html body .dshp-dock-body .dshp-root { padding: 12px 12px 16px; gap: 14px; }
  html body .dshp-dock-body .dshp-panel { padding: 14px 12px; }

  /* 「本机 v1.1.73+dsh0.2.1」这种长版本号与「正式版」并排时，名字列
     允许折行，别把同行的按钮顶出去。 */
  html body .dshp-dock-body .dshp-edition-name { white-space: normal; }
  html body .dshp-dock-body .dshp-now { row-gap: 6px; }

  /* 触屏抓不住 10px 的拖拽边条，留着只会在边缘吃掉点击。 */
  html body .dshp-dock-resize,
  html body .dshp-dock-resize-l,
  html body .dshp-dock-resize-r,
  html body .dshp-dock-resize-b { display: none; }

  /* 打开面板的悬浮入口（PurgeLauncher → .dshp-launch）。上游钉在
     right:16 / bottom:16，桌面端没问题，手机端正好压在输入框的发送键上。
     抬到输入框上方、缩一号、稍透明；面板打开时上游本来就让位（[data-open="1"]）。 */
  html body .dshp-launch {
    right: 8px;
    bottom: calc(140px + env(safe-area-inset-bottom, 0px));
    height: 32px;
    padding: 0 11px;
    font-size: 11px;
    opacity: .72;
  }
  html body .dshp-launch:active { opacity: 1; }
}
`;

    /* 老内核补丁：Map/WeakMap 的 upsert 族（getOrInsert / getOrInsertComputed）。
       背景（2026-11-13 实测确认）：caniuse 显示 Chrome/Android WebView 4–144 一律
       不支持，145（2026-02-10 发布）才有。而 DSH 核心的侧栏 PDF 预览
       （dsh-client-ui-sidebar-documentpreview/lib/client.pdf.js，打包的 pdf.js）在
       WorkerTransport.#cacheSimpleMethod 里直接用了
       this.#methodPromises.getOrInsertComputed(name, …)。
       结果：Hermit / 旧系统 WebView（144.0.7559.132）里打开 PDF 会报
       "this[#methodPromises].getOrInsertComputed is not a function"，而同一台手机上
       Chrome 157 正常 —— 因为它内核够新。补上这两个方法就能让 Hermit 这种
       "能真沉浸全屏但内核旧" 的壳继续用，不必赌厂商什么时候推 WebView 更新。
       语义按 tc39 upsert 提案：先 has 再取，否则写入并返回。 */
    function polyfillUpsert() {
      const def = (proto, name, fn) => {
        if (!proto || typeof proto[name] === 'function') return;
        try {
          Object.defineProperty(proto, name, { configurable: true, writable: true, value: fn });
        } catch (error) {
          try { console.warn('[dsh-mobile-fixes] cannot polyfill', name, error); } catch (e) {}
        }
      };
      const computed = function (key, callback) {
        if (this.has(key)) return this.get(key);
        const value = callback(key);
        this.set(key, value);
        return value;
      };
      const direct = function (key, value) {
        if (this.has(key)) return this.get(key);
        this.set(key, value);
        return value;
      };
      for (const proto of [typeof Map !== 'undefined' && Map.prototype, typeof WeakMap !== 'undefined' && WeakMap.prototype]) {
        def(proto, 'getOrInsertComputed', computed);
        def(proto, 'getOrInsert', direct);
      }
    }

    function inject() {
      try {
        const existing = document.getElementById(STYLE_ID);
        if (existing) existing.remove();
        const el = document.createElement('style');
        el.id = STYLE_ID;
        el.textContent = CSS;
        (document.head || document.documentElement).appendChild(el);
      } catch (error) {
        // A stylesheet that fails to attach must never take the page down.
        try { console.error('[dsh-mobile-fixes] style injection failed:', error); } catch (e) {}
      }
    }

    function applyAll() {
      polyfillUpsert();
      inject();
    }

    return { inject: [], apply: applyAll };
  },
});
