export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const OUTLINE_SHARE_URL = "https://docs.gabrielrufino.com/s/guides";

    const targetUrl = url.pathname === "/"
      ? OUTLINE_SHARE_URL
      : `https://docs.gabrielrufino.com${url.pathname}${url.search}`;

    let response = await fetch(targetUrl, {
      headers: { "User-Agent": request.headers.get("User-Agent") }
    });

    return response;
  }
}