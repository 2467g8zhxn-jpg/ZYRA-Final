const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('http://localhost:3001/api/users');
    const admins = res.data.filter(u => u.ID_Rol === 1);
    console.log('ADMINS:', JSON.stringify(admins, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
test();
