async function testLogin() {
  console.log("Enviando request a produccion...");
  const res = await fetch("https://zyra-production-332c.up.railway.app/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@zyra.com", password: "admin123" })
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

testLogin();
