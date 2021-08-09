function dispatcher(endpoint) {
    return {
        async move(x, y, gameNumber) {
            const res = await fetch(new URL('move', endpoint), { method: 'POST', body: JSON.stringify({ x, y, gameNumber }) })
            return await res.json()
        },
        async clean() {
            const res = await fetch(new URL('clean', endpoint), { method: 'POST' })
            return await res.json()
        }
    }
}

export default dispatcher