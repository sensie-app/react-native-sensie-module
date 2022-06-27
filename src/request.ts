
const BASE_URL = 'https://0x7xrifn76.execute-api.us-east-1.amazonaws.com/dev';

const sensiePostRequest = async (token:string, path: string, body: object): Promise<any> => {

    const header = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-api-key': token
    }
    const headers = new Headers(header)

    const option = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers
    }

    const res = await fetch(BASE_URL + path, option)
    return res.json()
}

export { sensiePostRequest }