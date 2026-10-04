const requestForm = document.querySelector("#request-form");

const characterNameInput = document.querySelector("#characterName");

const requestButton = document.querySelector("#requestButton");

const requestMessage = document.querySelector("#requestMessage");

let isRequested = false;

function handleRequest(event) {

    event.preventDefault();

    const characterName = characterNameInput.value.trim();


    if (characterName === "") {

        requestMessage.textContent = "캐릭터 이름을 입력해 주세요.";

        requestMessage.classList.remove("is-success");

        requestMessage.classList.add( "is-error");

        return;
    }

    if (isRequested === true) {
          return;
    }

    isRequested = true;


    requestMessage.textContent =characterName +" 캐릭터 제작 신청이 완료되었습니다.";

    requestMessage.classList.remove("is-error");

    requestMessage.classList.add("is-success");

    requestButton.textContent = "신청 완료";

    requestButton.disabled = true;

    characterNameInput.disabled = true;


    console.log(  characterName +" 캐릭터 제작 신청이 완료되었습니다.");
}

requestForm.addEventListener("submit", handleRequest);