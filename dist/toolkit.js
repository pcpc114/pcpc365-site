(() => {
  const form = document.querySelector('[data-workbook]');
  if (!form) return;

  const storageKey = 'spc-founder-workbook-v1';
  const fields = [...form.querySelectorAll('[data-persist]')];
  const checklistItems = [...form.querySelectorAll('[data-checklist-item]')];
  const completeCount = document.querySelector('[data-complete-count]');
  const progress = document.querySelector('[data-progress]');
  const progressCopy = document.querySelector('[data-progress-copy]');
  const saveStatus = document.querySelector('[data-save-status]');
  const inquiryOutput = document.querySelector('[data-inquiry-output]');
  const budgetRows = [...form.querySelectorAll('[data-budget-row]')];
  const budgetAmounts = [...form.querySelectorAll('[data-budget-amount]')];
  const budgetTotal = document.querySelector('[data-budget-total]');
  const budgetConfirmed = document.querySelector('[data-budget-confirmed]');
  const budgetEstimated = document.querySelector('[data-budget-estimated]');
  const budgetUnknown = document.querySelector('[data-budget-unknown]');
  const budgetTotalNote = document.querySelector('[data-budget-total-note]');

  const readValue = (name) => form.elements.namedItem(name)?.value?.trim() || '';

  function updateChecklist() {
    const complete = checklistItems.filter((item) => item.checked).length;
    checklistItems.forEach((item) => item.closest('[data-check-card]')?.classList.toggle('is-checked', item.checked));
    if (completeCount) completeCount.textContent = String(complete);
    if (progress) {
      progress.value = complete;
      progress.setAttribute('aria-label', `확인한 준비 항목 ${complete}개`);
    }
    if (!progressCopy) return;
    if (complete === 0) progressCopy.textContent = '아직 확인하지 않은 조건부터 차분히 적어 보세요.';
    else if (complete === checklistItems.length) progressCopy.textContent = '모든 항목을 표시했습니다. 이제 근거의 출처와 확인일을 다시 살펴보세요.';
    else progressCopy.textContent = `확인한 항목은 ${complete}개입니다. 남은 항목은 실제 자료나 관찰 기록으로 채워 보세요.`;
  }

  function buildInquiryBrief() {
    const place = readValue('inquiry-place') || '검토 대상 미입력';
    const operation = readValue('inquiry-operation') || '운영 형태 확인 중';
    const contact = readValue('inquiry-contact') || '문의처 미정';
    const date = readValue('inquiry-date') || '확인 기준일 미입력';
    const question = readValue('inquiry-question') || '확인할 질문을 입력해 주세요.';
    return `안녕하세요. 아래 조건에 대해 최신 확인이 필요한 사항을 문의드립니다.\n\n- 검토 대상: ${place}\n- 검토 중인 운영 형태: ${operation}\n- 문의 예정: ${contact}\n- 확인 기준일: ${date}\n\n[확인할 질문]\n${question}\n\n답변 가능한 범위와 참고할 최신 안내가 있다면 함께 알려주시면 감사하겠습니다.`;
  }

  function updateInquiryPreview() {
    if (inquiryOutput) inquiryOutput.textContent = buildInquiryBrief();
  }

  function getAmount(value) {
    const amount = Number(String(value).replace(/[^\d]/g, ''));
    return Number.isFinite(amount) ? amount : 0;
  }

  function formatCurrency(value) {
    return `${new Intl.NumberFormat('ko-KR').format(value)}원`;
  }

  function updateBudgetSummary() {
    let total = 0;
    let confirmed = 0;
    let estimated = 0;
    let unknown = 0;
    let entered = 0;

    budgetRows.forEach((row) => {
      const amount = getAmount(row.querySelector('[data-budget-amount]')?.value || '');
      const status = row.querySelector('[data-budget-status]')?.value || 'unknown';
      if (amount > 0) {
        total += amount;
        entered += 1;
        if (status === 'verified' || status === 'quoted') confirmed += amount;
        if (status === 'estimated') estimated += amount;
      }
      if (amount === 0 || status === 'unknown') unknown += 1;
    });

    if (budgetTotal) budgetTotal.textContent = formatCurrency(total);
    if (budgetConfirmed) budgetConfirmed.textContent = formatCurrency(confirmed);
    if (budgetEstimated) budgetEstimated.textContent = formatCurrency(estimated);
    if (budgetUnknown) budgetUnknown.textContent = String(unknown);
    if (!budgetTotalNote) return;
    if (entered === 0) budgetTotalNote.textContent = '입력한 금액이 없습니다. 확인한 견적부터 하나씩 기록해 보세요.';
    else if (unknown > 0) budgetTotalNote.textContent = `입력한 ${entered}개 항목의 단순 합계입니다. 금액 또는 범위가 미확인인 항목은 ${unknown}개입니다.`;
    else budgetTotalNote.textContent = `입력한 ${entered}개 항목의 단순 합계입니다. 원본 견적과 계약 조건을 다시 확인해 보세요.`;
  }

  function formatBudgetField(field) {
    const amount = getAmount(field.value);
    field.value = amount > 0 ? new Intl.NumberFormat('ko-KR').format(amount) : '';
  }

  function save() {
    const state = {};
    fields.forEach((field) => {
      state[field.name] = field.type === 'checkbox' ? field.checked : field.value;
    });
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
      if (saveStatus) saveStatus.textContent = '입력한 내용은 이 브라우저에 자동 저장되었습니다.';
    } catch {
      if (saveStatus) saveStatus.textContent = '이 브라우저에서는 자동 저장을 사용할 수 없습니다.';
    }
  }

  function restore() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
      fields.forEach((field) => {
        if (!(field.name in saved)) return;
        if (field.type === 'checkbox') field.checked = Boolean(saved[field.name]);
        else field.value = String(saved[field.name] || '');
      });
    } catch {
      // The workbook remains fully usable when browser storage is unavailable.
    }
  }

  restore();
  updateChecklist();
  updateInquiryPreview();
  updateBudgetSummary();

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      save();
      updateInquiryPreview();
      updateBudgetSummary();
    });
    field.addEventListener('change', () => {
      save();
      updateChecklist();
      updateInquiryPreview();
      updateBudgetSummary();
    });
  });

  budgetAmounts.forEach((field) => {
    field.addEventListener('blur', () => {
      formatBudgetField(field);
      save();
      updateBudgetSummary();
    });
  });

  document.querySelector('[data-reset]')?.addEventListener('click', () => {
    if (!window.confirm('현재 브라우저에 저장된 워크북 기록을 지울까요? 이 작업은 되돌릴 수 없습니다.')) return;
    form.reset();
    try { window.localStorage.removeItem(storageKey); } catch { /* Browser storage may be unavailable. */ }
    updateChecklist();
    updateInquiryPreview();
    updateBudgetSummary();
    if (saveStatus) saveStatus.textContent = '이 브라우저에 저장된 워크북 기록을 지웠습니다.';
  });

  document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

  document.querySelector('[data-copy-brief]')?.addEventListener('click', async () => {
    const brief = buildInquiryBrief();
    updateInquiryPreview();
    try {
      await navigator.clipboard.writeText(brief);
      if (saveStatus) saveStatus.textContent = '문의 문안을 클립보드에 복사했습니다.';
    } catch {
      if (saveStatus) saveStatus.textContent = '문의 문안을 선택해 직접 복사해 주세요.';
    }
  });
})();
