/**
 * Auth with code
 *
 * @param {*} authCode
 * @param {*} client_id
 *
 * @returns { has_sydney: boolean, cookies }
 */
export async function auth(authCode, client_id = "0000000040170455") {
    let access_token = null
    let cookies = null
    let has_sydney = false

    const token_url = "https://login.live.com/oauth20_token.srf"

    const headers = {
        "User-Agent":
            "Mozilla/5.0 (Linux; Android 11; WayDroid x86_64 Device Build/RQ3A.211001.001; ) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.5414.118 Safari/537.36 BingSapphire/24.1.410310303",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    }

    {
        const params = {
            client_id,
            code: authCode,
            redirect_uri: "https://login.live.com/oauth20_desktop.srf",
            grant_type: "authorization_code",
        }
        const url = `${token_url}?client_id=${client_id}&code=${authCode}&redirect_uri=https://login.live.com/oauth20_desktop.srf&grant_type=authorization_code`
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(params),
        })
        if (response.status === 200) {
            const js = await response.json()
            access_token = js["access_token"]
        }
    }

    {
        const params = {
            client_id: client_id,
            code: authCode,
            redirect_uri: "https://login.live.com/oauth20_desktop.srf",
            grant_type: "authorization_code",
        }
        const url = `https://ssl.bing.com/fd/auth/signin?action=token&provider=windows_live_id&save_token=0&token=${access_token}`
        const response = await fetch(url + "?" + new URLSearchParams(params), {
            headers: headers,
        })
        if (response.status === 200) {
            const js = await response.json()
            if (js.success) {
                cookies = response.headers.get("cookie_jar")
                has_sydney = true
            }
        }
    }

    if (cookies) {
        const url = "https://www.bing.com/sydchat"
        const response = await fetch(url, {
            headers: headers,
        })
        if (response.status !== 200) {
            cookies = null
            has_sydney = false
        }
    }

    return { cookies, has_sydney }
}
