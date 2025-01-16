function validateRUT(rut) {
    const regex = /^[0-9]{7,8}-[0-9Kk]$/;
    return regex.test(rut);
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+(\.[^\s@]+)+$/;
    return regex.test(email);
}

function validatePassword(password) {
    return password.length >= 1; // La contraseña debe tener al menos 1 carácter
}

// Validación del login
/**
 * Valida las credenciales de inicio de sesión.
 *
 * Esta función verifica si el correo electrónico y la contraseña proporcionados son válidos.
 * Depende de las funciones `validateEmail` y `validatePassword` para realizar las validaciones específicas.
 *
 * @param {string} email - El correo electrónico a validar.
 * @param {string} password - La contraseña a validar.
 * @returns {Object} Un objeto que indica si las credenciales son válidas y, en caso contrario, proporciona un mensaje de error.
 * @property {boolean} isValid - Indica si las credenciales son válidas.
 * @property {string} error - Mensaje de error en caso de que las credenciales no sean válidas.
 */
function validateLogin(email, password) {
    if (!validateEmail(email)) {
        return { isValid: false, error: "El correo electrónico no es válido." };
    }
    if (!validatePassword(password)) {
        return { isValid: false, error: "La contraseña debe tener al menos 1 caracteres." };
    }
    return { isValid: true, error: "" };
}

module.exports = {
    validateRUT,
    validateEmail,
    validatePassword,
    validateLogin, 
};
