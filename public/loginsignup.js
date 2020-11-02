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
    return false
}
