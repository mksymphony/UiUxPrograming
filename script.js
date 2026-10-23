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
const nameError = document.querySelector("#nameError");
const usageType = document.querySelector("#usageType");
const usageError = document.querySelector("#usageError");
const agreeCheck = document.querySelector("#agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");
const agreeError = document.querySelector("#agreeError");
const nextOptions = document.querySelector("#nextOptions");
const requestForm = document.querySelector("#request-form");
const requestButton = document.querySelector("#requestButton");
const requestError = document.querySelector("#requestError");
const summaryName = document.querySelector("#summaryName");
const summaryUsage = document.querySelector("#summaryUsage");
const summaryAgree = document.querySelector("#summaryAgree");
const completeMessage = document.querySelector("#completeMessage");

const purposeLabels = {
    stream: "실시간 버추얼 방송",
    vrchat: "VRChat 아바타 활동",
    video: "영상 콘텐츠 제작"
};
const stepLabels = ["시작", "이름 입력", "활용 목적 선택", "내용 확인", "완료"];
let currentStep = 0;
let isRequested = false;

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

// 6주차 input 이벤트 유지: 글자 수와 이름 미리보기를 즉시 변경합니다.
function handleNameInput() {
    const name = characterNameInput.value.trim();
    nameCount.textContent = characterNameInput.value.length + " / 20자";
    namePreview.textContent = "캐릭터 이름 미리보기: " + (name || "미입력");
    namePreview.classList.toggle("has-value", name !== "");
    if (name !== "") clearError(nameError, characterNameInput);
    updateReadiness();
}

function validName() {
    if (characterNameInput.value.trim() !== "") {
        clearError(nameError, characterNameInput);
        return true;
    }
    setError(nameError, characterNameInput, "캐릭터 이름을 입력해 주세요. 최대 20자까지 가능합니다.");
    return false;
}

// 6주차 change 이벤트 유지: 선택에 맞춰 문구·스타일·버튼 상태를 변경합니다.
function updateReadiness() {
    const agreed = agreeCheck.checked;
    const ready = agreed && usageType.value !== "" && characterNameInput.value.trim() !== "";
    agreeMessage.textContent = agreed
        ? "안내를 확인했습니다. 활용 목적을 선택한 뒤 내용을 확인해 주세요."
        : "안내를 확인해야 다음 단계로 이동할 수 있습니다.";
    agreeMessage.classList.toggle("is-ready", agreed);
    nextOptions.classList.toggle("is-ready", ready);
    nextOptions.textContent = ready ? "선택 완료 · 내용 확인하기" : "내용 확인하기";
    requestButton.disabled = !ready || isRequested;
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

// 5주차 submit 기능 유지: 최종 확인 후 완료 단계로 이동합니다.
function handleRequest(event) {
    event.preventDefault();
    if (isRequested || currentStep !== 3) return;
    if (!validName()) { showStep(1); return; }
    if (!validOptions()) { showStep(2); return; }
    clearError(requestError);
    isRequested = true;
    requestButton.disabled = true;
    requestButton.textContent = "신청 완료";
    completeMessage.textContent = "'" + characterNameInput.value.trim() + "' 캐릭터의 '"
        + purposeLabels[usageType.value] + "' 활용 신청 체험이 완료되었습니다.";
    showStep(4);
    saveCompletedHistory(characterNameInput.value.trim(), usageType.value);
}
requestForm.addEventListener("submit", handleRequest);

// 다시 시작: 이름·선택·동의·오류·미리보기·버튼·단계 모두 초기화합니다.
function restartFlow() {
    isRequested = false;
    characterNameInput.value = "";
    usageType.value = "";
    agreeCheck.checked = false;
    nameCount.textContent = "0 / 20자";
    namePreview.textContent = "캐릭터 이름 미리보기: 미입력";
    namePreview.classList.remove("has-value");
    clearError(nameError, characterNameInput);
    clearError(usageError, usageType);
    clearError(agreeError);
    clearError(requestError);
    summaryName.textContent = "-";
    summaryUsage.textContent = "-";
    summaryAgree.textContent = "-";
    completeMessage.textContent = "";
    requestButton.textContent = "신청 확정하기";
    updateReadiness();
    showStep(0);
    requestStart.focus();
}
document.querySelector("#requestRestart").addEventListener("click", restartFlow);
updateReadiness();
console.log("Virtual Character Studio - 7주차 사용자 흐름 연결 완료");


// ======================================================
// 중간고사 NEW: 완료한 시연 신청을 조회/검색/취소하는 기능
// 7주차 '신청 확정' 결과를 브라우저 로컬 저장소에 기록합니다.
// 저장소 접근이 막힌 환경에서는 현재 페이지에서만 기록됩니다.
// ======================================================
const HISTORY_KEY = "virtual-character-studio-midterm-history-v1";
const historySearch = document.querySelector("#historySearch");
const historyFilter = document.querySelector("#historyFilter");
const historyList = document.querySelector("#historyList");
const historyFeedback = document.querySelector("#historyFeedback");
const historyEmpty = document.querySelector("#historyEmpty");
const historyCount = document.querySelector("#historyCount");
const historyDetail = document.querySelector("#historyDetail");
const detailName = document.querySelector("#detailName");
const detailUsage = document.querySelector("#detailUsage");
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

function saveCompletedHistory(name, usage) {
    const record = {
        id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8),
        name: name,
        usage: usage,
        status: "active",
        createdAt: new Date().toISOString()
    };
    historyRecords.unshift(record);
    historyRecords = historyRecords.slice(0, 30);
    persistHistory();
    historySearch.value = "";
    historyFilter.value = "all";
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
    detailStatus.textContent = record.status === "active" ? "완료" : "취소";
    detailDate.textContent = formatDate(record.createdAt);
    historyDetail.hidden = false;
}

function renderHistory() {
    const query = historySearch.value.trim().toLocaleLowerCase("ko-KR");
    const filter = historyFilter.value;
    const filtered = historyRecords.filter(function (item) {
        const matchesName = item.name.toLocaleLowerCase("ko-KR").includes(query);
        const matchesStatus = filter === "all" || item.status === filter;
        return matchesName && matchesStatus;
    });

    historyList.replaceChildren();
    historyCount.textContent = "전체 " + historyRecords.length + "건";
    historyEmpty.hidden = filtered.length !== 0;
    if (filtered.length === 0) {
        historyEmpty.textContent = historyRecords.length === 0
            ? "저장된 신청 내역이 없습니다. 위의 '제작 신청'을 먼저 체험해 보세요."
            : "조건에 맞는 결과가 없습니다. 검색어를 바꾸거나 '검색 초기화'를 눌러 주세요.";
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
historyFilter.addEventListener("change", function () {
    setHistoryFeedback("선택한 상태의 신청 내역을 표시합니다.");
    renderHistory();
});
historyList.addEventListener("click", handleHistoryAction);
document.querySelector("#historyClear").addEventListener("click", function () {
    historySearch.value = "";
    historyFilter.value = "all";
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
