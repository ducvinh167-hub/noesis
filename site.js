(() => {
  const base = new URL('.', window.location.href);
  const documentsUrl = new URL('content/documents.json', base);
  const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const inline = (value) => escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1 ↗</a>');

  function renderMarkdown(source) {
    const lines = source.replace(/^---[\s\S]*?---\s*/m, '').trim().split('\n');
    const blocks = [];
    let paragraph = [];
    let list = [];
    let listType = '';
    const flushParagraph = () => {
      if (paragraph.length) blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    };
    const flushList = () => {
      if (list.length) blocks.push(`<${listType}>${list.map((item) => `<li>${inline(item)}</li>`).join('')}</${listType}>`);
      list = []; listType = '';
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      const unordered = line.match(/^[-*]\s+(.+)$/);
      const ordered = line.match(/^\d+\.\s+(.+)$/);
      if (!line) { flushParagraph(); flushList(); continue; }
      if (heading) { flushParagraph(); flushList(); blocks.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); continue; }
      if (line === '---') { flushParagraph(); flushList(); blocks.push('<hr>'); continue; }
      if (line.startsWith('> ')) { flushParagraph(); flushList(); blocks.push(`<blockquote><p>${inline(line.slice(2))}</p></blockquote>`); continue; }
      if (unordered || ordered) {
        const nextType = unordered ? 'ul' : 'ol';
        if (listType && listType !== nextType) flushList();
        listType = nextType; list.push((unordered || ordered)[1]); continue;
      }
      flushList(); paragraph.push(line);
    }
    flushParagraph(); flushList();
    return blocks.join('\n');
  }

  async function getDocuments() {
    const response = await fetch(documentsUrl);
    if (!response.ok) throw new Error('Không thể tải danh mục văn bản.');
    const documents = await response.json();
    return documents.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`));
  }

  function documentCard(document) {
    const href = `read.html?doc=${encodeURIComponent(document.slug)}`;
    return `<a class="document-item" href="${href}">
      <p class="document-meta">${escapeHtml(document.type)}<br>${formatDate(document.date)} · ${escapeHtml(document.readTime)}</p>
      <h3 class="document-title">${escapeHtml(document.title)}</h3>
      <p class="document-summary">${escapeHtml(document.summary)}</p>
    </a>`;
  }

  async function populateLists() {
    const featured = document.querySelector('[data-featured-documents]');
    const library = document.querySelector('[data-document-library]');
    if (!featured && !library) return;
    try {
      const documents = await getDocuments();
      if (featured) featured.innerHTML = documents.filter((item) => item.featured).slice(0, 3).map(documentCard).join('');
      if (library) library.innerHTML = documents.map(documentCard).join('');
    } catch (error) {
      const message = `<p class="load-error">${escapeHtml(error.message)}</p>`;
      if (featured) featured.innerHTML = message;
      if (library) library.innerHTML = message;
    }
  }

  async function populateArticle() {
    const target = document.querySelector('[data-article]');
    if (!target) return;
    const slug = new URLSearchParams(window.location.search).get('doc');
    try {
      const documents = await getDocuments();
      const item = documents.find((document) => document.slug === slug);
      if (!item) throw new Error('Không tìm thấy bài viết này.');
      const markdown = await fetch(new URL(`content/docs/${item.file}`, base));
      if (!markdown.ok) throw new Error('Không thể tải nội dung bài viết.');
      document.title = `${item.title} — NOESIS`;
      target.innerHTML = `<p class="article-kicker">${escapeHtml(item.type)} · ${formatDate(item.date)} · ${escapeHtml(item.readTime)}</p>
        <h1 class="article-title">${escapeHtml(item.title)}</h1>
        <p class="article-dek">${escapeHtml(item.summary)}</p>
        <hr class="article-rule">
        <article class="prose">${renderMarkdown(await markdown.text())}</article>`;
    } catch (error) {
      target.innerHTML = `<p class="load-error">${escapeHtml(error.message)} <a href="writing.html">Quay lại văn bản</a>.</p>`;
    }
  }

  window.Noesis = { renderMarkdown, escapeHtml };
  document.addEventListener('DOMContentLoaded', () => { populateLists(); populateArticle(); });
})();
