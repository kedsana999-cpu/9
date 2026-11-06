/* Atelier d'écriture — export Word (.docx), PDF, texte et partage
   Tout est fabriqué dans le navigateur, sans connexion. */
window.Atelier = window.Atelier || {};

(function (A) {
  'use strict';

  const JSPDF_URL = 'vendor/jspdf-4.2.1.umd.min.js';
  const MIME = {
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf',
    txt: 'text/plain;charset=utf-8',
    md: 'text/markdown;charset=utf-8',
    json: 'application/json'
  };

  /* ---------- Préparation du texte ---------- */

  /** Découpe un chapitre en paragraphes, lignes vides et changements de scène (*** ou #). */
  function blocks(text) {
    const lines = (text || '').replace(/\r/g, '').replace(/\t/g, ' ').split('\n');
    const raw = [];
    lines.forEach(l => {
      const t = l.trim();
      if (!t) { if (raw.length && raw[raw.length - 1].type !== 'blank') raw.push({ type: 'blank' }); }
      else if (/^(\*\s*){1,3}$|^#$|^~+$|^—$/.test(t)) raw.push({ type: 'scene' });
      else raw.push({ type: 'p', text: t });
    });
    while (raw.length && raw[raw.length - 1].type === 'blank') raw.pop();
    // Si presque tous les paragraphes sont séparés par une ligne vide (habitude du web),
    // ces lignes vides ne sont pas des pauses voulues : on les ignore.
    let withBlank = 0, without = 0;
    for (let i = 1; i < raw.length; i++) {
      if (raw[i].type === 'p') { if (raw[i - 1].type === 'blank') withBlank++; else if (raw[i - 1].type === 'p') without++; }
    }
    const ignoreBlanks = withBlank > 0 && withBlank >= without;
    return raw.filter(b => !(b.type === 'blank' && ignoreBlanks));
  }

  /**
   * Prépare le document à exporter.
   * opts : { titlePage, numbering, pageBreak, pitch, exclude: [ids], author }
   */
  function prepare(p, opts) {
    const ex = new Set(opts.exclude || []);
    const chapters = p.chapters.filter(c => !ex.has(c.id) && (c.text || '').trim());
    return {
      title: p.title || 'Sans titre',
      genre: p.genre || '',
      pitch: opts.pitch ? (p.pitch || '') : '',
      author: (opts.author || '').trim(),
      chapters: chapters.map((c, i) => ({ label: 'Chapitre ' + (i + 1), title: c.title || '', blocks: blocks(c.text) })),
      opts
    };
  }

  /* ---------- Texte brut et Markdown ---------- */

  function toTxt(doc) {
    let s = '';
    if (doc.opts.titlePage) {
      s += doc.title.toUpperCase() + '\n';
      if (doc.genre) s += doc.genre + '\n';
      if (doc.author) s += doc.author + '\n';
      if (doc.pitch) s += '\n' + doc.pitch + '\n';
      s += '\n\n';
    }
    doc.chapters.forEach(c => {
      const head = (doc.opts.numbering ? c.label + (c.title ? ' — ' : '') : '') + c.title;
      if (head) s += head + '\n\n';
      c.blocks.forEach(b => { s += b.type === 'p' ? b.text + '\n' : b.type === 'scene' ? '\n*   *   *\n\n' : '\n'; });
      s += '\n\n';
    });
    return s.trim() + '\n';
  }

  function toMd(doc) {
    let s = '';
    if (doc.opts.titlePage) {
      s += '# ' + doc.title + '\n\n';
      if (doc.genre) s += '*' + doc.genre + '*\n\n';
      if (doc.author) s += doc.author + '\n\n';
      if (doc.pitch) s += '> ' + doc.pitch + '\n\n';
    }
    doc.chapters.forEach(c => {
      const head = (doc.opts.numbering ? c.label + (c.title ? ' — ' : '') : '') + c.title;
      if (head) s += '## ' + head + '\n\n';
      c.blocks.forEach(b => { s += b.type === 'p' ? b.text + '\n\n' : b.type === 'scene' ? '\\*   \\*   \\*\n\n' : ''; });
    });
    return s.trim() + '\n';
  }

  /* ---------- ZIP minimal (pour le .docx) ---------- */

  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  /** Crée une archive ZIP non compressée. files : [{ name, text }] */
  function zip(files) {
    const enc = new TextEncoder();
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const parts = [];
    const central = [];
    let offset = 0;
    files.forEach(f => {
      const name = enc.encode(f.name);
      const data = enc.encode(f.text);
      const crc = crc32(data);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true); // noms en UTF-8
      local.setUint16(8, 0, true);      // pas de compression
      local.setUint16(10, dosTime, true);
      local.setUint16(12, dosDate, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, name.length, true);
      local.setUint16(28, 0, true);
      parts.push(new Uint8Array(local.buffer), name, data);

      const cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true);
      cd.setUint16(4, 20, true);
      cd.setUint16(6, 20, true);
      cd.setUint16(8, 0x0800, true);
      cd.setUint16(10, 0, true);
      cd.setUint16(12, dosTime, true);
      cd.setUint16(14, dosDate, true);
      cd.setUint32(16, crc, true);
      cd.setUint32(20, data.length, true);
      cd.setUint32(24, data.length, true);
      cd.setUint16(28, name.length, true);
      cd.setUint32(42, offset, true);
      central.push(new Uint8Array(cd.buffer), name);
      offset += 30 + name.length + data.length;
    });
    const cdSize = central.reduce((s, a) => s + a.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true);
    end.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: MIME.docx });
  }

  /* ---------- Word (.docx) ---------- */

  const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

  function x(s) {
    return String(s == null ? '' : s)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function para(style, text, extraPPr) {
    return '<w:p><w:pPr><w:pStyle w:val="' + style + '"/>' + (extraPPr || '') + '</w:pPr>' +
      (text ? '<w:r><w:t xml:space="preserve">' + x(text) + '</w:t></w:r>' : '') + '</w:p>';
  }

  function docxStyles() {
    return XML_HEAD + '<w:styles xmlns:w="' + W_NS + '">' +
      '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/>' +
      '<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="fr-FR" w:eastAsia="fr-FR" w:bidi="ar-SA"/></w:rPr></w:rPrDefault>' +
      '<w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Corps"><w:name w:val="Corps du récit"/><w:basedOn w:val="Normal"/><w:qFormat/>' +
      '<w:pPr><w:ind w:firstLine="397"/><w:jc w:val="both"/></w:pPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>' +
      '<w:pPr><w:spacing w:before="3600" w:after="480" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="56"/><w:szCs w:val="56"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:qFormat/>' +
      '<w:pPr><w:spacing w:after="240"/><w:jc w:val="center"/></w:pPr><w:rPr><w:i/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Auteur"><w:name w:val="Auteur"/><w:basedOn w:val="Normal"/>' +
      '<w:pPr><w:spacing w:before="720" w:after="240"/><w:jc w:val="center"/></w:pPr><w:rPr><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Pitch"><w:name w:val="Résumé"/><w:basedOn w:val="Normal"/>' +
      '<w:pPr><w:spacing w:before="720"/><w:ind w:left="1134" w:right="1134"/><w:jc w:val="center"/></w:pPr><w:rPr><w:i/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="NumeroChapitre"><w:name w:val="Numéro de chapitre"/><w:basedOn w:val="Normal"/><w:next w:val="Heading1"/>' +
      '<w:pPr><w:keepNext/><w:spacing w:before="1440" w:after="120"/><w:jc w:val="center"/></w:pPr><w:rPr><w:smallCaps/><w:color w:val="595959"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Corps"/><w:qFormat/>' +
      '<w:pPr><w:keepNext/><w:spacing w:before="240" w:after="600" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:outlineLvl w:val="0"/></w:pPr>' +
      '<w:rPr><w:b/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Scene"><w:name w:val="Changement de scène"/><w:basedOn w:val="Normal"/>' +
      '<w:pPr><w:spacing w:before="240" w:after="240"/><w:jc w:val="center"/></w:pPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Footer"><w:name w:val="footer"/><w:basedOn w:val="Normal"/>' +
      '<w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:style>' +
      '</w:styles>';
  }

  function toDocx(doc) {
    const o = doc.opts;
    let body = '';
    if (o.titlePage) {
      body += para('Title', doc.title);
      if (doc.genre) body += para('Subtitle', doc.genre);
      if (doc.author) body += para('Auteur', doc.author);
      if (doc.pitch) body += para('Pitch', doc.pitch);
    }
    doc.chapters.forEach((c, i) => {
      const breakBefore = (o.titlePage && i === 0) || (o.pageBreak && i > 0);
      const pb = breakBefore ? '<w:pageBreakBefore/>' : '';
      if (o.numbering) {
        body += para('NumeroChapitre', c.label, pb);
        if (c.title) body += para('Heading1', c.title);
      } else if (c.title) {
        body += para('Heading1', c.title, pb);
      } else if (pb) {
        body += para('Normal', '', pb);
      }
      let afterBlank = false;
      c.blocks.forEach(b => {
        if (b.type === 'p') { body += para('Corps', b.text, afterBlank ? '<w:spacing w:before="240"/>' : ''); afterBlank = false; }
        else if (b.type === 'scene') { body += para('Scene', '*   *   *'); afterBlank = false; }
        else afterBlank = true;
      });
    });
    const sect = '<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/>' +
      '<w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="709" w:footer="709" w:gutter="0"/>' +
      (o.titlePage ? '<w:pgNumType w:start="0"/><w:titlePg/>' : '') + '</w:sectPr>';
    const document = XML_HEAD + '<w:document xmlns:w="' + W_NS + '" xmlns:r="' + R_NS + '"><w:body>' + body + sect + '</w:body></w:document>';
    const iso = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

    return zip([
      { name: '[Content_Types].xml', text: XML_HEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
        '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
        '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>' +
        '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' +
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>' },
      { name: '_rels/.rels', text: XML_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
        '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>' },
      { name: 'word/_rels/document.xml.rels', text: XML_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>' +
        '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>' },
      { name: 'word/document.xml', text: document },
      { name: 'word/styles.xml', text: docxStyles() },
      { name: 'word/settings.xml', text: XML_HEAD + '<w:settings xmlns:w="' + W_NS + '"><w:defaultTabStop w:val="709"/><w:hyphenationZone w:val="425"/>' +
        '<w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>' },
      { name: 'word/footer1.xml', text: XML_HEAD + '<w:ftr xmlns:w="' + W_NS + '" xmlns:r="' + R_NS + '"><w:p><w:pPr><w:pStyle w:val="Footer"/></w:pPr>' +
        '<w:fldSimple w:instr=" PAGE "><w:r><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>' },
      { name: 'docProps/core.xml', text: XML_HEAD + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
        'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
        '<dc:title>' + x(doc.title) + '</dc:title><dc:creator>' + x(doc.author) + '</dc:creator><dc:language>fr-FR</dc:language>' +
        '<dcterms:created xsi:type="dcterms:W3CDTF">' + iso + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + iso + '</dcterms:modified></cp:coreProperties>' },
      { name: 'docProps/app.xml', text: XML_HEAD + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Atelier d\'écriture</Application></Properties>' }
    ]);
  }

  /* ---------- PDF ---------- */

  let pdfLibPromise = null;
  function loadPdfLib() {
    if (window.jspdf) return Promise.resolve(window.jspdf);
    if (pdfLibPromise) return pdfLibPromise;
    pdfLibPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = JSPDF_URL;
      s.onload = () => window.jspdf ? resolve(window.jspdf) : reject(new Error('Bibliothèque PDF introuvable.'));
      s.onerror = () => { pdfLibPromise = null; reject(new Error('Impossible de charger la bibliothèque PDF.')); };
      document.head.appendChild(s);
    });
    return pdfLibPromise;
  }

  // Caractères disponibles dans les polices PDF standard (WinAnsi).
  const WIN_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
  function pdfSafe(s) {
    return String(s || '').replace(/[\u202f\u2009\u2007\u200a]/g, '\u00a0').replace(/[\u200b\u200c\u200d\ufeff]/g, '')
      .replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, ch => {
        if (WIN_EXTRA.includes(ch)) return ch;
        if (ch === '\u2010' || ch === '\u2011') return '-';
        if (ch === '\u2032') return "'";
        const base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return /^[\u0020-\u007e\u00a0-\u00ff]$/.test(base) ? base : '';
      });
  }

  function toPdf(doc) {
    if (!window.jspdf) throw new Error('La bibliothèque PDF n\'est pas encore chargée.');
    const o = doc.opts;
    const d = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4', compress: true });
    d.setProperties({ title: doc.title, author: doc.author, creator: 'Atelier d\'écriture', subject: doc.genre });
    if (d.setLanguage) d.setLanguage('fr-FR');
    const W = d.internal.pageSize.getWidth(), H = d.internal.pageSize.getHeight();
    const ML = 72, MR = 72, MT = 80, MB = 80, TW = W - ML - MR;
    const FS = 12, LH = FS * 1.5, IND = 20;
    let y = MT;
    let atTop = true;

    function newPage() { d.addPage(); y = MT; atTop = true; }
    function ensure(h) { if (y + h > H - MB) newPage(); }

    function wrap(text, width, firstIndent) {
      const words = pdfSafe(text).split(/ +/).filter(Boolean);
      const lines = [];
      let cur = [], curW = 0;
      const space = d.getTextWidth(' ');
      words.forEach(w => {
        const ww = d.getTextWidth(w);
        const avail = width - (lines.length === 0 ? firstIndent : 0);
        if (cur.length && curW + space + ww > avail) { lines.push(cur); cur = [w]; curW = ww; }
        else { curW += (cur.length ? space : 0) + ww; cur.push(w); }
      });
      if (cur.length) lines.push(cur);
      return lines;
    }

    function drawLine(words, xPos, yPos, width, justify) {
      const ww = words.map(w => d.getTextWidth(w));
      const total = ww.reduce((a, b) => a + b, 0);
      const gap = words.length > 1 ? (width - total) / (words.length - 1) : 0;
      if (!justify || words.length < 2 || gap > d.getTextWidth(' ') * 3.5) { d.text(words.join(' '), xPos, yPos); return; }
      let cx = xPos;
      words.forEach((w, i) => { d.text(w, cx, yPos); cx += ww[i] + gap; });
    }

    function centered(text, size, style, color, lineH) {
      d.setFont('times', style); d.setFontSize(size); d.setTextColor(color || 0);
      wrap(text, TW - 60, 0).forEach(words => {
        ensure(lineH);
        d.text(words.join(' '), W / 2, y + size, { align: 'center' });
        y += lineH;
      });
      atTop = false;
    }

    // Page de titre
    if (o.titlePage) {
      y = H * 0.3;
      centered(doc.title, 28, 'bold', 0, 34);
      if (doc.genre) { y += 10; centered(doc.genre, 14, 'italic', 80, 20); }
      if (doc.author) { y += 40; centered(doc.author, 15, 'normal', 0, 20); }
      if (doc.pitch) { y += 50; centered(doc.pitch, 11, 'italic', 80, 16); }
    }

    doc.chapters.forEach((c, i) => {
      if ((o.titlePage && i === 0) || (o.pageBreak && i > 0)) newPage();
      else if (i > 0) { y += LH * 2; ensure(LH * 6); }
      if (atTop) y = MT + 70;
      if (o.numbering) { centered(c.label.toUpperCase(), 10, 'normal', 90, 18); y += 4; }
      if (c.title) centered(c.title, 18, 'bold', 0, 24);
      y += 26;
      d.setFont('times', 'normal'); d.setFontSize(FS); d.setTextColor(0);
      let pendingSpace = false;
      c.blocks.forEach(b => {
        if (b.type === 'blank') { pendingSpace = true; return; }
        if (b.type === 'scene') {
          ensure(LH * 3);
          y += LH * 0.5;
          d.text('*   *   *', W / 2, y + FS, { align: 'center' });
          y += LH * 1.5; pendingSpace = false; atTop = false;
          return;
        }
        if (pendingSpace && !atTop) y += LH * 0.6;
        pendingSpace = false;
        const lines = wrap(b.text, TW, IND);
        lines.forEach((words, k) => {
          ensure(LH);
          const xPos = ML + (k === 0 ? IND : 0);
          drawLine(words, xPos, y + FS, TW - (k === 0 ? IND : 0), k < lines.length - 1);
          y += LH;
          atTop = false;
        });
      });
    });

    // Numéros de page (pas sur la page de titre)
    const n = d.getNumberOfPages();
    d.setFont('times', 'normal'); d.setFontSize(10); d.setTextColor(90);
    for (let i = o.titlePage ? 2 : 1; i <= n; i++) {
      d.setPage(i);
      d.text(String(o.titlePage ? i - 1 : i), W / 2, H - 42, { align: 'center' });
    }
    return d.output('blob');
  }

  /* ---------- Téléchargement et partage ---------- */

  function download(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function canShareFile(type) {
    try {
      if (!navigator.canShare || !window.File) return false;
      return navigator.canShare({ files: [new File(['x'], 'test', { type: type || MIME.pdf })] });
    } catch (e) { return false; }
  }

  /**
   * Ouvre la feuille de partage du téléphone (Mail, Messages, WhatsApp, Drive…) si possible,
   * sinon télécharge le fichier. Renvoie 'shared', 'cancelled' ou 'downloaded'.
   */
  async function deliver(blob, filename, title, wantShare) {
    if (wantShare && navigator.canShare && window.File) {
      const file = new File([blob], filename, { type: blob.type });
      let ok = false;
      try { ok = navigator.canShare({ files: [file] }); } catch (e) { ok = false; }
      if (ok) {
        try { await navigator.share({ files: [file], title }); return 'shared'; }
        catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
      }
    }
    download(blob, filename);
    return 'downloaded';
  }

  A.exporter = { MIME, blocks, prepare, toTxt, toMd, toDocx, toPdf, loadPdfLib, deliver, download, canShareFile, pdfSafe };
})(window.Atelier);
