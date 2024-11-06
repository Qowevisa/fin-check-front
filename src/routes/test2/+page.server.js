export async function load({ fetch }) {
  const response = await fetch("https://api.fin.qowevisa.click/api/authping", {
    credentials: "include",
  });

  return {
    message: await response.json()
  };
}
