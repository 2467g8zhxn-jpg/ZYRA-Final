const axios = require('axios');

async function testCreate() {
    try {
        const response = await axios.post('http://localhost:3001/api/empleados', {
            Nombre: 'Test User ' + Date.now(),
            ID_Empresa: 1,
            Telefono: '1234567890',
            Correo: 'test@example.com'
        });
        console.log('STATUS:', response.status);
        console.log('BODY:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('ERROR STATUS:', error.response?.status);
        console.error('ERROR DATA:', error.response?.data);
    }
}

testCreate();
