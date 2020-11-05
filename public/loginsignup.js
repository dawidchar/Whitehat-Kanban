async function signup(e) {
    e.preventDefault()
    const reqUserExists = await fetch(`/api/users/${document.querySelector("#signup-username").value.toLowerCase()}/exists`)
    const userexists = await reqUserExists.json()
    if (userexists) {
        // alert('Username Already Exists')
        toastr.error("Username Is Taken", "Error")
        return false
    }
    let passcode = ""
    $('.singledigit').each(function () {
        passcode += String(this.value)
    })
    const passhash = CryptoJS.MD5(passcode + "s2TIib!FCuzHtz#KkctwRTzqn&Oyr@9!r&OLx7!iI$1N@&n^FnxARe%Yg%ukAt76kUvsrN8Yt09rNPg$M81zD4hxCzer70aI0UO").toString();
    const userobj = {
        name: document.querySelector("#signup-name").value,
        username: document.querySelector("#signup-username").value.toLowerCase(),
        avatar: document.querySelector("#signup-avatar").value,
        passcode: passhash
    }
    const postRequest = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userobj)
    }
    await fetch('/api/users', postRequest)
    window.location.replace("/myboards")
    return false
}

async function login(e) {
    e.preventDefault()
    const username = $('.activeuser').attr('username')
    if (!username) {
        toastr.warning("Please Select a User", "Warning")
        return false
    }
    let passcode = ""
    $('.singledigit').each(function () {
        passcode += String(this.value)
    })
    const passhash = CryptoJS.MD5(passcode + "s2TIib!FCuzHtz#KkctwRTzqn&Oyr@9!r&OLx7!iI$1N@&n^FnxARe%Yg%ukAt76kUvsrN8Yt09rNPg$M81zD4hxCzer70aI0UO").toString();
    const reqUserExists = await fetch(`/api/users/${username.toLowerCase()}/exists`)
    const userexists = await reqUserExists.json()
    if (!userexists) {
        // alert('User Does Not Exist')
        toastr.error("User does not exist", "Error")
        return false
    }
    const postRequest = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pass: passhash })
    }
    await fetch(`/api/users/${username.toLowerCase()}/login`, postRequest).then(res => res.json().then(data => {
        if (data.success) {
            window.location.replace("/myboards")
        } else {
            toastr.error(data.message, "Login Error")
        }
    }))
    // 
}