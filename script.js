// 제작 신청 폼을 찾습니다.
const requestForm =
    document.querySelector("#request-form");


// 캐릭터 이름 입력창을 찾습니다.
const characterNameInput =
    document.querySelector("#characterName");


// 신청 버튼을 찾습니다.
const requestButton =
    document.querySelector("#requestButton");


// 결과 안내 문구를 찾습니다.
const requestMessage =
    document.querySelector("#requestMessage");


// 신청 완료 상태를 저장합니다.
// 처음에는 아직 신청하지 않았으므로 false입니다.
let isRequested = false;


/*
캐릭터 제작 신청을 처리하는 함수입니다.
*/
function handleRequest(event) {

    // form의 기본 새로고침을 막습니다.
    event.preventDefault();


    // 입력한 캐릭터 이름을 가져옵니다.
    const characterName =
        characterNameInput.value.trim();


    /*
    캐릭터 이름을 입력하지 않은 경우
    */
    if (characterName === "") {

        requestMessage.textContent =
            "캐릭터 이름을 입력해 주세요.";


        requestMessage.classList.remove(
            "is-success"
        );


        requestMessage.classList.add(
            "is-error"
        );


        return;
    }


    /*
    이미 신청이 완료된 경우
    */
    if (isRequested === true) {
        return;
    }


    /*
    정상적으로 신청된 경우
    */

    isRequested = true;


    requestMessage.textContent =
        characterName +
        " 캐릭터 제작 신청이 완료되었습니다.";


    requestMessage.classList.remove(
        "is-error"
    );


    requestMessage.classList.add(
        "is-success"
    );


    // 버튼 문구 변경
    requestButton.textContent =
        "신청 완료";


    // 중복 신청 방지
    requestButton.disabled = true;


    // 신청 후 이름 변경 방지
    characterNameInput.disabled = true;


    console.log(
        characterName +
        " 캐릭터 제작 신청 완료"
    );
}


/*
사용자가 신청 버튼을 누르거나
Enter 키를 눌러 form을 제출하면
handleRequest 함수가 실행됩니다.
*/
requestForm.addEventListener(
    "submit",
    handleRequest
);