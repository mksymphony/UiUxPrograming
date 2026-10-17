
// ========================================
// 5주차 - 캐릭터 제작 신청
// ========================================

const requestForm = document.querySelector("#request-form");
const characterNameInput = document.querySelector("#characterName");
const requestButton = document.querySelector("#requestButton");
const requestMessage = document.querySelector("#requestMessage");

let isRequested = false;


// ========================================
// 6주차 - input 이벤트
// ========================================

const nameCount = document.querySelector("#nameCount");
const namePreview = document.querySelector("#namePreview");

function handleNameInput() {
    const characterName = characterNameInput.value.trim();
    const currentLength = characterNameInput.value.length;

    // 글자 수 변경
    nameCount.textContent = currentLength + " / 20자";

    // 캐릭터 이름 미리보기
    if (characterName === "") {
        namePreview.textContent = "캐릭터 이름 미리보기: 미입력";
        namePreview.classList.remove("has-value");
    }
    else {
        namePreview.textContent = "캐릭터 이름 미리보기: " + characterName;
        namePreview.classList.add("has-value");
    }

    // 입력이 다시 시작되면 기존 오류 메시지 초기화
    if (!isRequested && requestMessage.classList.contains("is-error")) {
        requestMessage.textContent = "캐릭터 이름을 입력한 뒤 신청해 주세요.";
        requestMessage.classList.remove("is-error");
    }
}


// ========================================
// 6주차 - change 이벤트
// ========================================

const agreeCheck = document.querySelector("#agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");

function handleAgreeChange() {
    const agreed = agreeCheck.checked;

    // 체크박스 상태에 따라 버튼 활성화
    requestButton.disabled = !agreed || isRequested;

    if (agreed) {
        agreeMessage.textContent = "확인되었습니다. 캐릭터 제작을 신청할 수 있습니다.";
        agreeMessage.classList.add("is-ready");
    }
    else {
        agreeMessage.textContent = "안내를 확인하면 신청 버튼이 활성화됩니다.";
        agreeMessage.classList.remove("is-ready");
    }
}


// ========================================
// 5주차 - submit 이벤트
// ========================================

function handleRequest(event) {
    event.preventDefault();

    if (isRequested) return;

    const characterName = characterNameInput.value.trim();

    // 제작 안내를 확인하지 않은 경우
    if (!agreeCheck.checked) {
        requestMessage.textContent = "제작 신청 안내를 먼저 확인해 주세요.";
        requestMessage.classList.remove("is-success");
        requestMessage.classList.add("is-error");
        return;
    }

    // 캐릭터 이름이 비어 있는 경우
    if (characterName === "") {
        requestMessage.textContent = "캐릭터 이름을 입력해 주세요.";
        requestMessage.classList.remove("is-success");
        requestMessage.classList.add("is-error");
        characterNameInput.focus();
        return;
    }

    // 신청 완료
    isRequested = true;

    requestMessage.textContent = characterName + " 캐릭터 제작 신청이 완료되었습니다.";
    requestMessage.classList.remove("is-error");
    requestMessage.classList.add("is-success");

    // 버튼 및 입력창 비활성화
    requestButton.textContent = "신청 완료";
    requestButton.disabled = true;
    characterNameInput.disabled = true;
    agreeCheck.disabled = true;

    console.log("캐릭터 제작 신청:", characterName);
}


// ========================================
// 6주차 - click 이벤트 / 탭 UI
// ========================================

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function handleTabClick(event) {
    const selectedTab = event.currentTarget;
    const targetId = selectedTab.getAttribute("aria-controls");

    // 모든 탭 버튼의 상태 변경
    tabs.forEach(function (tab) {
        const isActive = tab === selectedTab;

        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
    });

    // 해당 콘텐츠만 표시
    panels.forEach(function (panel) {
        const isActive = panel.id === targetId;

        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);
    });
}


// ========================================
// 이벤트 등록
// ========================================

// 텍스트 입력
characterNameInput.addEventListener("input", handleNameInput);

// 체크박스 변경
agreeCheck.addEventListener("change", handleAgreeChange);

// 제작 신청
requestForm.addEventListener("submit", handleRequest);

// 기능 탭 클릭
tabs.forEach(function (tab) {
    tab.addEventListener("click", handleTabClick);
});

console.log("Virtual Character Studio - 6주차 이벤트 연결 완료");
