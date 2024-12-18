// import type { Handle, HandleFetch } from "@sveltejs/kit";
import type { HandleFetch } from "@sveltejs/kit";

// export const handle: Handle = async ({ event, resolve }) => {
//   console.log("handle Function")
//   return await resolve(event)
// }

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  if (!request.url.match('authping')) {
    console.log(request)
    console.log("handleFetch triggered for URL:", request.url);
    console.log("in handleFetch: 2")
  }
  if (request.url.startsWith("https://api.fin.qowevisa.click/api")) {
    request = new Request(
      request.url.replace("https://api.fin.qowevisa.click/api", "http://localhost:3000/api"),
      request
    )
  };
  if (!request.url.match('authping')) {
    console.log(request)
    console.log("in handleFetch: 3")
  }

  return fetch(request);
};
