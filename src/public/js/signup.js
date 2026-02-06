console.log("Signup frontend javascript file");
 $(function(){
    const fileTarget = $(".file-box .upload-hidden");
    let filename;
    fileTarget.on("change", function(){
        const uploadFile = $(this)[0].files[0];
        console.log(uploadFile);
        const fileType = uploadFile["type"]
    })
 });

function validateSignupForm() {
    const memberNick = $(".member-nick").val();
    const memberPhone = $(".member-phone").val();
    const memberPassword = $(".member-password").val();
    const confirmPassword = $(".confirm-password").val();

    if(
    memberNick === "" ||
    memberPhone === "" ||
    memberPassword === "" ||
    confirmPassword === "" 
    ) {
    alert("Please insert all required inputs!")
    return false;
    }
    if(memberPassword !== confirmPassword) {
    alert("password differs, please check ");
    return false ;
    }
}
