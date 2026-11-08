// 6주차: 기존 기능 탭 3개를 유지합니다.
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function activateTab(selectedTab) {
    const targetId = selectedTab.getAttribute("aria-controls");
    tabs.forEach(function (tab) {
        const active = tab === selectedTab;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
    });
    panels.forEach(function (panel) {
        const active = panel.id === targetId;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
    });
}

tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activateTab(tab); });
    tab.addEventListener("keydown", function (event) {
        let next = -1;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next < 0) return;
        event.preventDefault();
        activateTab(tabs[next]);
        tabs[next].focus();
    });
});

// 7주차: 사용자 흐름. 0=시작, 1=입력, 2=선택, 3=확인, 4=완료
const flowSteps = document.querySelectorAll(".flow-step");
const flowProgress = document.querySelector("#flowProgress");
const characterNameInput = document.querySelector("#characterName");
const nameCount = document.querySelector("#nameCount");
const namePreview = document.querySelector("#namePreview");
const nameStatus = document.querySelector("#nameStatus");
const nameError = document.querySelector("#nameError");
const usageType = document.querySelector("#usageType");
const usageError = document.querySelector("#usageError");
// 9주차 선택에 따라 입력 가능 여부가 바뀌는 추가 제작 요청
const requestMoreCheck = document.querySelector("#requestMoreCheck");
const requestMoreField = document.querySelector("#requestMoreField");
const requestMoreText = document.querySelector("#requestMoreText");
const requestMoreCount = document.querySelector("#requestMoreCount");
const requestMoreFeedback = document.querySelector("#requestMoreFeedback");
const requestMoreError = document.querySelector("#requestMoreError");
const agreeCheck = document.querySelector("#agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");
const agreeError = document.querySelector("#agreeError");
const nextOptions = document.querySelector("#nextOptions");
const requestForm = document.querySelector("#request-form");
const requestButton = document.querySelector("#requestButton");
const requestError = document.querySelector("#requestError");
const summaryName = document.querySelector("#summaryName");
const summaryUsage = document.querySelector("#summaryUsage");
const summaryMore = document.querySelector("#summaryMore");
const summaryAgree = document.querySelector("#summaryAgree");
const completeMessage = document.querySelector("#completeMessage");
const simulateFailureCheck = document.querySelector("#simulateFailureCheck");
const submitStatus = document.querySelector("#submitStatus");
const backToOptionsButton = document.querySelector("#backToOptions");

const purposeLabels = {
    stream: "실시간 버추얼 방송",
    vrchat: "VRChat 아바타 활동",
    video: "영상 콘텐츠 제작"
};
const stepLabels = ["시작", "이름 입력", "활용 목적 선택", "내용 확인", "완료"];
let currentStep = 0;
let isRequested = false;
let isSubmitting = false;

function showStep(step) {
    currentStep = step;
    flowSteps.forEach(function (item) { item.hidden = Number(item.dataset.step) !== step; });
    flowProgress.textContent = (step + 1) + " / 5 · " + stepLabels[step];
}

function clearError(element, input) {
    element.textContent = "";
    if (input) input.classList.remove("has-error");
}

function setError(element, input, message) {
    element.textContent = message;
    if (input) {
        input.classList.add("has-error");
        input.focus();
    }
}

// 6주차 input 이벤트 유지 + 9주차 최소 2자 실시간 검증
function handleNameInput() {
    const name = characterNameInput.value.trim();
    const valid = name.length >= 2 && name.length <= 20;
    nameCount.textContent = characterNameInput.value.length + " / 20자";
    namePreview.textContent = "캐릭터 이름 미리보기: " + (name || "미입력");
    namePreview.classList.toggle("has-value", name !== "");
    nameStatus.textContent = valid ? "사용 가능한 캐릭터 이름입니다." : "캐릭터 이름은 2~20자로 입력해 주세요.";
    nameStatus.classList.toggle("is-valid", valid);
    nameStatus.classList.toggle("is-invalid", !valid && name.length > 0);
    if (valid) clearError(nameError, characterNameInput);
    else if (nameError.textContent) nameError.textContent = "이름을 2~20자로 수정해 주세요.";
    updateReadiness();
}

function validName() {
    const name = characterNameInput.value.trim();
    if (name.length >= 2 && name.length <= 20) {
        clearError(nameError, characterNameInput);
        return true;
    }
    setError(nameError, characterNameInput, name === "" ? "캐릭터 이름을 입력해 주세요. 최소 2자입니다." : "캐릭터 이름은 2~20자로 입력해 주세요.");
    return false;
}

// 9주차: 추가 요청 체크박스가 꺼져 있으면 입력창을 숨기고 disabled로 만듭니다.
function updateExtraFeedback() {
    const text = requestMoreText.value.trim();
    const valid = text.length >= 8 && text.length <= 150;
    requestMoreCount.textContent = requestMoreText.value.length + " / 150자";
    requestMoreFeedback.textContent = valid ? "추가 요청 조건을 충족했습니다." : "추가 요청 사항은 8자 이상 입력해 주세요.";
    requestMoreFeedback.classList.toggle("is-valid", valid && requestMoreCheck.checked);
    requestMoreFeedback.classList.toggle("is-invalid", !valid && text.length > 0 && requestMoreCheck.checked);
    if (valid) clearError(requestMoreError, requestMoreText);
    else if (requestMoreError.textContent) requestMoreError.textContent = "추가 요청 사항을 8자 이상 작성해 주세요.";
    updateReadiness();
}

function handleMoreChange() {
    const enabled = requestMoreCheck.checked;
    requestMoreField.hidden = !enabled;
    requestMoreText.disabled = !enabled;
    requestMoreText.required = enabled;
    if (!enabled) clearError(requestMoreError, requestMoreText);
    updateExtraFeedback();
}

function isFlowReady() {
    const name = characterNameInput.value.trim();
    const extraReady = !requestMoreCheck.checked || (requestMoreText.value.trim().length >= 8 && requestMoreText.value.trim().length <= 150);
    return agreeCheck.checked && usageType.value !== "" && name.length >= 2 && name.length <= 20 && extraReady;
}

// 6주차 change 이벤트 유지: 문구·스타일·버튼 상태 함께 변경
function updateReadiness() {
    const agreed = agreeCheck.checked;
    const ready = isFlowReady();
    agreeMessage.textContent = agreed
        ? "안내를 확인했습니다. 필수 항목을 작성한 뒤 내용을 확인해 주세요."
        : "안내를 확인해야 다음 단계로 이동할 수 있습니다.";
    agreeMessage.classList.toggle("is-ready", agreed);
    nextOptions.classList.toggle("is-ready", ready);
    nextOptions.textContent = ready ? "선택 완료 · 내용 확인하기" : "내용 확인하기";
    requestButton.disabled = !ready || isRequested || isSubmitting;
}

function handleUsageChange() {
    if (usageType.value !== "") clearError(usageError, usageType);
    updateReadiness();
}

function handleAgreeChange() {
    if (agreeCheck.checked) clearError(agreeError);
    updateReadiness();
}

function validOptions() {
    if (usageType.value === "") {
        setError(usageError, usageType, "캐릭터 활용 목적을 목록에서 선택해 주세요.");
        return false;
    }
    clearError(usageError, usageType);
    if (requestMoreCheck.checked && requestMoreText.value.trim().length < 8) {
        setError(requestMoreError, requestMoreText, "추가 제작 요청은 최소 8자 이상 입력해 주세요.");
        return false;
    }
    clearError(requestMoreError, requestMoreText);
    if (!agreeCheck.checked) {
        setError(agreeError, null, "시연 안내를 확인하고 체크박스를 선택해 주세요.");
        agreeCheck.focus();
        return false;
    }
    clearError(agreeError);
    return true;
}

function showSummary() {
    summaryName.textContent = characterNameInput.value.trim();
    summaryUsage.textContent = purposeLabels[usageType.value] || "선택되지 않음";
    summaryMore.textContent = requestMoreCheck.checked ? requestMoreText.value.trim() : "추가 요청 없음";
    summaryAgree.textContent = agreeCheck.checked ? "확인함" : "확인 필요";
}

// 시작 → 이름 입력
const requestStart = document.querySelector("#requestStart");
requestStart.addEventListener("click", function () {
    showStep(1);
    characterNameInput.focus();
});

document.querySelector("#backToStart").addEventListener("click", function () { showStep(0); });
document.querySelector("#nextName").addEventListener("click", function () {
    if (!validName()) return;
    showStep(2);
    usageType.focus();
});
document.querySelector("#backToName").addEventListener("click", function () {
    showStep(1);
    characterNameInput.focus();
});
document.querySelector("#nextOptions").addEventListener("click", function () {
    if (!validOptions()) return;
    showSummary();
    showStep(3);
});
document.querySelector("#backToOptions").addEventListener("click", function () {
    showStep(2); // 값을 초기화하지 않으므로 이전 입력과 선택이 유지됩니다.
});

characterNameInput.addEventListener("input", handleNameInput);
usageType.addEventListener("change", handleUsageChange);
agreeCheck.addEventListener("change", handleAgreeChange);
requestMoreCheck.addEventListener("change", handleMoreChange);
requestMoreText.addEventListener("input", updateExtraFeedback);

// 9주차: submit 이벤트에서 유효성 검사 → 처리 중 비활성화 → 성공/실패를 처리합니다.
// 서버 없이 시연: 사용자가 실패 테스트를 체크한 경우에만 이번 제출을 실패 처리합니다.
async function handleRequest(event) {
    event.preventDefault();
    if (isRequested || isSubmitting || currentStep !== 3) return;
    if (!validName()) { showStep(1); return; }
    if (!validOptions()) { showStep(2); return; }

    isSubmitting = true;
    clearError(requestError);
    requestButton.disabled = true;
    backToOptionsButton.disabled = true;
    requestButton.textContent = "제출 중...";
    submitStatus.textContent = "시연 신청을 처리하고 있습니다. 중복 제출은 차단됩니다.";
    submitStatus.classList.add("is-pending");
    submitStatus.classList.remove("is-failed");

    try {
        await new Promise(function (resolve) { setTimeout(resolve, 800); });
        if (simulateFailureCheck.checked) {
            simulateFailureCheck.checked = false; // 다음 시도는 성공할 수 있게 일회성 실패 처리
            requestError.textContent = "시연용 제출 실패입니다. 입력값은 유지됐어요. '신청 확정하기'를 다시 눌러 재시도해 주세요.";
            submitStatus.textContent = "제출에 실패했습니다. 내용을 수정하거나 다시 시도할 수 있습니다.";
            submitStatus.classList.add("is-failed");
            return;
        }

        isRequested = true;
        completeMessage.textContent = "'" + characterNameInput.value.trim() + "' 캐릭터의 '" + purposeLabels[usageType.value] + "' 활용 신청 체험이 완료되었습니다.";
        saveCompletedHistory(characterNameInput.value.trim(), usageType.value,
            requestMoreCheck.checked ? requestMoreText.value.trim() : "");
        submitStatus.textContent = "";
        showStep(4);
    } catch (error) {
        console.error("시연 신청 처리 오류", error);
        requestError.textContent = "처리 중 오류가 발생했습니다. 입력값을 유지했으니 다시 시도해 주세요.";
        submitStatus.textContent = "처리에 실패했습니다. 다시 시도할 수 있습니다.";
        submitStatus.classList.add("is-failed");
    } finally {
        isSubmitting = false;
        backToOptionsButton.disabled = false;
        requestButton.textContent = isRequested ? "신청 완료" : "신청 확정하기";
        requestButton.disabled = isRequested || !isFlowReady();
        submitStatus.classList.remove("is-pending");
    }
}
requestForm.addEventListener("submit", handleRequest);

// 다시 시작: 이름·선택·동의·오류·미리보기·버튼·단계 모두 초기화합니다.
function restartFlow() {
    isRequested = false;
    isSubmitting = false;
    characterNameInput.value = "";
    requestMoreCheck.checked = false;
    requestMoreText.value = "";
    requestMoreText.disabled = true;
    requestMoreText.required = false;
    requestMoreField.hidden = true;
    requestMoreCount.textContent = "0 / 150자";
    requestMoreFeedback.textContent = "8자 이상 작성해 주세요.";
    requestMoreFeedback.classList.remove("is-valid", "is-invalid");
    clearError(requestMoreError, requestMoreText);
    simulateFailureCheck.checked = false;
    submitStatus.textContent = "";
    submitStatus.classList.remove("is-pending", "is-failed");
    backToOptionsButton.disabled = false;
    usageType.value = "";
    agreeCheck.checked = false;
    nameCount.textContent = "0 / 20자";
    nameStatus.textContent = "이름을 2글자 이상 입력해 주세요.";
    nameStatus.classList.remove("is-valid", "is-invalid");
    namePreview.textContent = "캐릭터 이름 미리보기: 미입력";
    namePreview.classList.remove("has-value");
    clearError(nameError, characterNameInput);
    clearError(usageError, usageType);
    clearError(agreeError);
    clearError(requestError);
    summaryName.textContent = "-";
    summaryUsage.textContent = "-";
    summaryMore.textContent = "없음";
    summaryAgree.textContent = "-";
    completeMessage.textContent = "";
    requestButton.textContent = "신청 확정하기";
    updateReadiness();
    showStep(0);
    requestStart.focus();
}
document.querySelector("#requestRestart").addEventListener("click", restartFlow);
handleNameInput();
handleMoreChange();
updateReadiness();
console.log("Virtual Character Studio - 9주차 폼 검증 및 제출 처리 연결 완료");


// ======================================================
// 중간고사 NEW: 완료한 시연 신청을 조회/검색/취소하는 기능
// 7주차 '신청 확정' 결과를 브라우저 로컬 저장소에 기록합니다.
// 저장소 접근이 막힌 환경에서는 현재 페이지에서만 기록됩니다.
// ======================================================
const HISTORY_KEY = "virtual-character-studio-midterm-history-v1";
const historySearch = document.querySelector("#historySearch");
const historyFilters = document.querySelectorAll(".history-filter");
let activeHistoryFilter = "all";
const historyList = document.querySelector("#historyList");
const historyFeedback = document.querySelector("#historyFeedback");
const historyEmpty = document.querySelector("#historyEmpty");
const historyCount = document.querySelector("#historyCount");
const historyDetail = document.querySelector("#historyDetail");
const detailName = document.querySelector("#detailName");
const detailUsage = document.querySelector("#detailUsage");
const detailNote = document.querySelector("#detailNote");
const detailStatus = document.querySelector("#detailStatus");
const detailDate = document.querySelector("#detailDate");
let selectedHistoryId = null;
let historyRecords = loadHistory();

function loadHistory() {
    try {
        const records = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
        if (!Array.isArray(records)) return [];
        return records.filter(function (item) {
            return item && typeof item.id === "string" && typeof item.name === "string"
                && Object.prototype.hasOwnProperty.call(purposeLabels, item.usage)
                && (item.status === "active" || item.status === "cancelled")
                && typeof item.createdAt === "string";
        }).slice(0, 30);
    } catch (error) {
        console.warn("브라우저 저장소를 사용할 수 없어 현재 화면에서만 내역을 표시합니다.", error);
        return [];
    }
}

function persistHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(historyRecords)); }
    catch (error) { console.warn("저장소 쓰기 실패: 새로고침 시 기록이 사라질 수 있습니다.", error); }
}

function setHistoryFeedback(message, type) {
    historyFeedback.textContent = message;
    historyFeedback.classList.toggle("is-notice", type === "success");
    historyFeedback.classList.toggle("is-error", type === "error");
}

function saveCompletedHistory(name, usage, note) {
    const record = {
        id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8),
        name: name,
        usage: usage,
        note: note || "",
        status: "active",
        createdAt: new Date().toISOString()
    };
    historyRecords.unshift(record);
    historyRecords = historyRecords.slice(0, 30);
    persistHistory();
    historySearch.value = "";
    setActiveHistoryFilter("all");
    selectedHistoryId = null;
    setHistoryFeedback("'" + name + "' 신청 체험이 내역에 추가됐어요. 상세 보기나 취소를 선택할 수 있습니다.", "success");
    renderHistory();
}

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "날짜 정보 없음" : date.toLocaleString("ko-KR");
}

function renderHistoryDetail() {
    const record = historyRecords.find(function (item) { return item.id === selectedHistoryId; });
    if (!record) { historyDetail.hidden = true; return; }
    detailName.textContent = record.name;
    detailUsage.textContent = purposeLabels[record.usage];
    detailNote.textContent = record.note || "추가 요청 없음";
    detailStatus.textContent = record.status === "active" ? "완료" : "취소";
    detailDate.textContent = formatDate(record.createdAt);
    historyDetail.hidden = false;
}

function renderHistory() {
    const query = historySearch.value.trim().toLocaleLowerCase("ko-KR");
    const filter = activeHistoryFilter;
    const filtered = historyRecords.filter(function (item) {
        const matchesName = item.name.toLocaleLowerCase("ko-KR").includes(query);
        const matchesStatus = filter === "all" || item.status === filter;
        return matchesName && matchesStatus;
    });

    historyList.replaceChildren();
    historyCount.textContent = "표시 " + filtered.length + "건 / 전체 " + historyRecords.length + "건";
    historyEmpty.hidden = filtered.length !== 0;
    if (filtered.length === 0) {
        if (historyRecords.length === 0) {
            historyEmpty.textContent = "아직 저장된 신청 내역이 없습니다. '제작 신청'에서 신청 체험을 완료해 보세요.";
        } else if (query && filter !== "all") {
            historyEmpty.textContent = "검색어와 선택한 상태에 맞는 결과가 없습니다. 검색어 또는 상태 필터를 변경해 주세요.";
        } else if (query) {
            historyEmpty.textContent = "검색어에 맞는 결과가 없습니다. 다른 캐릭터 이름으로 검색하거나 '검색 초기화'를 눌러 주세요.";
        } else {
            historyEmpty.textContent = "선택한 상태의 신청 내역이 없습니다. '전체'를 선택하면 다른 상태의 기록을 볼 수 있습니다.";
        }
    }

    filtered.forEach(function (record) {
        const row = document.createElement("li");
        row.className = "history-item";

        const info = document.createElement("div");
        const name = document.createElement("h3");
        name.textContent = record.name;
        const desc = document.createElement("p");
        desc.textContent = purposeLabels[record.usage] + " · " + formatDate(record.createdAt);
        const status = document.createElement("span");
        status.className = "history-status" + (record.status === "cancelled" ? " is-cancelled" : "");
        status.textContent = record.status === "active" ? "완료" : "취소";
        info.append(name, desc, status);

        const actions = document.createElement("div");
        actions.className = "history-actions";
        const detailButton = document.createElement("button");
        detailButton.type = "button";
        detailButton.className = "detail-action";
        detailButton.dataset.action = "detail";
        detailButton.dataset.id = record.id;
        detailButton.textContent = "상세 보기";
        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "cancel-action";
        cancelButton.dataset.action = "cancel";
        cancelButton.dataset.id = record.id;
        cancelButton.textContent = record.status === "active" ? "체험 취소" : "취소됨";
        cancelButton.disabled = record.status !== "active";
        actions.append(detailButton, cancelButton);
        row.append(info, actions);
        historyList.append(row);
    });
    if (selectedHistoryId && !filtered.some(function (record) { return record.id === selectedHistoryId; })) selectedHistoryId = null;
    renderHistoryDetail();
}

function handleHistoryAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button || !historyList.contains(button)) return;
    const record = historyRecords.find(function (item) { return item.id === button.dataset.id; });
    if (!record) return;

    if (button.dataset.action === "detail") {
        selectedHistoryId = record.id;
        renderHistoryDetail();
        setHistoryFeedback("'" + record.name + "'의 상세 내용을 열었습니다.", "success");
    }
    if (button.dataset.action === "cancel" && record.status === "active") {
        record.status = "cancelled";
        persistHistory();
        setHistoryFeedback("'" + record.name + "' 체험 기록을 취소했습니다. 실제 신청에 영향은 없습니다.", "success");
        renderHistory();
    }
}

historySearch.addEventListener("input", function () {
    setHistoryFeedback("검색 조건에 따라 신청 내역을 표시합니다.");
    renderHistory();
});
function setActiveHistoryFilter(value) {
    activeHistoryFilter = value;
    historyFilters.forEach(function (button) {
        const active = button.dataset.filter === value;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}
historyFilters.forEach(function (button) {
    button.addEventListener("click", function () {
        setActiveHistoryFilter(button.dataset.filter);
        setHistoryFeedback("'" + button.textContent.trim() + "' 상태의 신청 내역을 표시합니다.");
        renderHistory();
    });
});
historyList.addEventListener("click", handleHistoryAction);
document.querySelector("#historyClear").addEventListener("click", function () {
    historySearch.value = "";
    setActiveHistoryFilter("all");
    setHistoryFeedback("검색 조건을 초기화했습니다. 전체 내역을 보여줍니다.", "success");
    renderHistory();
});
document.querySelector("#closeDetail").addEventListener("click", function () {
    selectedHistoryId = null;
    historyDetail.hidden = true;
    setHistoryFeedback("상세 보기를 닫았습니다.");
});

// 페이지를 새로 열어도 브라우저에 저장된 내역을 다시 렌더링합니다.
renderHistory();
console.log("Virtual Character Studio - 중간고사 신청 내역 기능 연결 완료");


// ======================================================
// 10주차: nav + 목록 메뉴 / 현재 위치(aria-current) / 모바일 토글
// ======================================================
const menuToggle = document.querySelector("#menuToggle");
const primaryNav = document.querySelector("#primaryNav");
const primaryLinks = Array.from(primaryNav.querySelectorAll("a[href^='#']"));
const menuSections = primaryLinks.map(function (link) {
    return document.getElementById(link.getAttribute("href").slice(1));
}).filter(Boolean);
const mobileMenuMedia = window.matchMedia("(max-width: 768px)");
let scrollQueued = false;

function setMenuOpen(open) {
    const actuallyOpen = Boolean(open && mobileMenuMedia.matches);
    primaryNav.classList.toggle("is-open", actuallyOpen);
    menuToggle.setAttribute("aria-expanded", String(actuallyOpen));
    menuToggle.textContent = actuallyOpen ? "메뉴 닫기" : "메뉴 열기";
}

function setCurrentMenu(sectionId) {
    primaryLinks.forEach(function (link) {
        const current = link.getAttribute("href") === "#" + sectionId;
        link.classList.toggle("is-current", current);
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
    });
}

// 스크롤로 방문한 섹션도 현재 위치로 표시합니다.
function syncMenuFromViewport() {
    let current = menuSections.length ? menuSections[0].id : "about";
    const threshold = Math.min(180, window.innerHeight * 0.35);
    menuSections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= threshold) current = section.id;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8 && menuSections.length) {
        current = menuSections[menuSections.length - 1].id;
    }
    setCurrentMenu(current);
}
function queueViewportSync() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(function () {
        scrollQueued = false;
        syncMenuFromViewport();
    });
}
function syncFromLocation() {
    const hashId = decodeURIComponent(window.location.hash.slice(1));
    const matching = menuSections.find(function (section) { return section.id === hashId; });
    if (matching) setCurrentMenu(matching.id);
    else queueViewportSync();
    setMenuOpen(false);
    // 브라우저의 앵커 이동 및 뒤로 가기 스크롤 복원을 반영합니다.
    window.requestAnimationFrame(queueViewportSync);
}

menuToggle.addEventListener("click", function () {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});
primaryLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        setCurrentMenu(link.getAttribute("href").slice(1));
        setMenuOpen(false);
    });
});
window.addEventListener("hashchange", syncFromLocation);
window.addEventListener("popstate", syncFromLocation);
window.addEventListener("scroll", queueViewportSync, { passive: true });
window.addEventListener("resize", function () {
    if (!mobileMenuMedia.matches) setMenuOpen(false);
    queueViewportSync();
});
function initializeNavigation() {
    const hashId = decodeURIComponent(window.location.hash.slice(1));
    const target = menuSections.find(function (section) { return section.id === hashId; });
    if (target) {
        // 새로고침 시에도 URL의 위치와 실제 보이는 섹션을 일치시킵니다.
        target.scrollIntoView({ behavior: "instant", block: "start" });
        setCurrentMenu(target.id);
    } else {
        syncMenuFromViewport();
    }
    setMenuOpen(false);
}
window.addEventListener("load", initializeNavigation);
window.requestAnimationFrame(initializeNavigation);
console.log("Virtual Character Studio - 10주차 탐색/모바일 메뉴/상태 필터 연결 완료");
