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
