(() => {
  const key = 'noesis-studio-draft-v1';
  const slugify = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'bai-viet-moi';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('[data-composer]');
    if (!form) return;
    const title = form.elements.title;
    const summary = form.elements.summary;
    const body = form.elements.body;
    const preview = document.querySelector('[data-preview]');
    const status = document.querySelector('[data-studio-status]');
    const existingDocument = document.querySelector('[data-existing-document]');
    let documents = [];
    let activeDocument = null;
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    title.value = saved.title || '';
    summary.value = saved.summary || '';
    body.value = saved.body || '';

    const update = () => {
      const articleTitle = title.value.trim() || 'Tiêu đề bài viết';
      const articleSummary = summary.value.trim();
      const articleBody = body.value.trim() || 'Bản xem trước sẽ hiện ở đây khi bạn bắt đầu viết.';
      preview.innerHTML = `<h1>${window.Noesis.escapeHtml(articleTitle)}</h1>${articleSummary ? `<p><em>${window.Noesis.escapeHtml(articleSummary)}</em></p>` : ''}${window.Noesis.renderMarkdown(articleBody)}`;
      localStorage.setItem(key, JSON.stringify({ title: title.value, summary: summary.value, body: body.value }));
      status.textContent = 'Nháp đã được lưu trên trình duyệt này.';
    };
    [title, summary, body].forEach((field) => field.addEventListener('input', update));
    update();

    async function loadExistingDocuments() {
      try {
        const base = new URL('.', window.location.href);
        const response = await fetch(new URL('content/documents.json', base));
        documents = await response.json();
        documents.forEach((item) => {
          const option = document.createElement('option');
          option.value = item.slug;
          option.textContent = item.title;
          existingDocument.append(option);
        });
        existingDocument.addEventListener('change', async () => {
          activeDocument = documents.find((item) => item.slug === existingDocument.value) || null;
          if (!activeDocument) {
            status.textContent = 'Bài mới. Nháp đang được lưu trên trình duyệt này.';
            return;
          }
          const markdown = await fetch(new URL(`content/docs/${activeDocument.file}`, base));
          title.value = activeDocument.title;
          summary.value = activeDocument.summary;
          body.value = await markdown.text();
          update();
          status.textContent = `Đã mở “${activeDocument.title}”. Tải lại tệp để lưu bản chỉnh sửa.`;
        });
      } catch {
        status.textContent = 'Không thể mở danh mục hiện có. Bạn vẫn có thể viết một bài mới.';
      }
    }
    loadExistingDocuments();

    document.querySelector('[data-download]').addEventListener('click', () => {
      const file = new Blob([body.value.trim() || '# Bài viết mới\n'], { type: 'text/markdown;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = activeDocument?.file || `${slugify(title.value)}.md`;
      link.click();
      URL.revokeObjectURL(link.href);
      status.textContent = 'Đã tạo tệp Markdown. Đưa tệp vào content/docs rồi thêm mục danh mục.';
    });

    document.querySelector('[data-copy-index]').addEventListener('click', async () => {
      const item = {
        title: title.value.trim() || 'Tiêu đề bài viết',
        slug: activeDocument?.slug || slugify(title.value),
        file: activeDocument?.file || `${slugify(title.value)}.md`,
        type: 'Ghi chép',
        date: new Date().toISOString().slice(0, 10),
        readTime: '5 phút',
        featured: false,
        summary: summary.value.trim() || 'Tóm tắt bài viết.'
      };
      await navigator.clipboard.writeText(JSON.stringify(item, null, 2));
      status.textContent = 'Đã sao chép một mục danh mục. Dán vào content/documents.json.';
    });
  });
})();
