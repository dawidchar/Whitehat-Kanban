async function signup(e) {
    e.preventDefault()
    const reqUserExists = await fetch(`/api/users/${document.querySelector("#signup-username").value.toLowerCase()}/exists`)
    const userexists = await reqUserExists.json()
    if (userexists) {
        // alert('Username Already Exists')
        toastr.error("Username Is Taken", "Error")
        return false
    }
    const userobj = {
        name: document.querySelector("#signup-name").value,
        username: document.querySelector("#signup-username").value.toLowerCase(),
        avatar: document.querySelector("#signup-avatar").value
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
    const reqUserExists = await fetch(`/api/users/${document.querySelector("#login-username").value.toLowerCase()}/exists`)
    const userexists = await reqUserExists.json()
    if (!userexists) {
        // alert('User Does Not Exist')
        toastr.error("User does not exist", "Warning")
        return false
    }
    await fetch(`/api/users/${document.querySelector("#login-username").value.toLowerCase()}/login`).then(res => { res.json().then(data => { if (data) { window.location.replace("/myboards") } else { toastr.error("Error Logging In", "Warning") } }) })
    // window.location.replace("/myboards")
}