async function signup(e) {
    e.preventDefault()
    const reqUserExists = await fetch(`/api/users/${document.querySelector("#signup-username").value.toLowerCase()}/exists`)
    const userexists = await reqUserExists.json()
    if (userexists) {
        alert('Username Already Exists')
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
        alert('User Does Not Exist')
        return false
    }
    await fetch(`/api/users/${document.querySelector("#login-username").value.toLowerCase()}/login`).then(res => { res.json().then(data => { if (data) { window.location.replace("/myboards") } else { alert("Error Logging In") } }) })
    // window.location.replace("/myboards")
}