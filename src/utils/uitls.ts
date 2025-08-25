async function loadShader(url: string): Promise<string> {
    const res = await fetch(url);
    return await res.text();
}

export { loadShader };