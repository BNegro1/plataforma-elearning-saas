const Usuario = require("../models/User");
const { validateEmail, validatePassword, validateRUT, validateLogin } = require("../utils/validators");
const render = require("../utils/render");

/**
 * AuthController es una clase que maneja la autenticación de usuarios en la aplicación.
 * Proporciona métodos estáticos para mostrar formularios de registro e inicio de sesión,
 * procesar los datos enviados por los usuarios y manejar la lógica de autenticación.
 * 
 * Métodos:
 * - getRegister(req, res): Muestra el formulario de registro.
 * - postRegister(req, res): Procesa el registro de un nuevo usuario, validando los datos y creando el usuario en la base de datos.
 * - getLogin(req, res): Muestra el formulario de inicio de sesión.
 * - postLogin(req, res): Procesa el inicio de sesión de un usuario, validando las credenciales y estableciendo una sesión.
 * - getProfile(req, res): Muestra la página de perfil del usuario.
 * 
 * Dependencias:
 * - Rutas: Las rutas deben estar configuradas para llamar a estos métodos según corresponda.
 * - Funciones de validación: validateRUT, validateEmail, validatePassword, validateLogin.
 * - Funciones de renderizado: render.
 * - Modelo de Usuario: Usuario, que debe tener métodos como create y findByEmail.
 */

class AuthController {
    // Mostrar el formulario de registro
    static getRegister(req, res) {
        const html = render("registro.html", { title: "Registro", error: "", success: "" });
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    }

    // Procesar el registro de usuario
    static async postRegister(req, res) {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            const formData = new URLSearchParams(body);
            const usuario = {
                rut: formData.get("rut"),
                nombre: formData.get("nombre"),
                apellido: formData.get("apellido"),
                correo: formData.get("email"),
                contrasenia: formData.get("password"),
                tipo_usuario: "estudiante", // Por defecto, "estudiante"
            };

            // Validaciones
            if (!validateRUT(usuario.rut)) {
                const html = render("registro.html", {
                    title: "Registro",
                    error: "El RUT no es válido.",
                    success: "",
                });
                res.writeHead(400, { "Content-Type": "text/html" });
                res.end(html);
                return;
            }

            if (!validateEmail(usuario.correo)) {
                const html = render("registro.html", {
                    title: "Registro",
                    error: "El correo electrónico no es válido.",
                    success: "",
                });
                res.writeHead(400, { "Content-Type": "text/html" });
                res.end(html);
                return;
            }

            if (!validatePassword(usuario.contrasenia)) {
                const html = render("registro.html", {
                    title: "Registro",
                    error: "La contraseña debe tener al menos 6 caracteres.",
                    success: "",
                });
                res.writeHead(400, { "Content-Type": "text/html" });
                res.end(html);
                return;
            }

            try {
                await Usuario.create(usuario);
                const html = render("registro.html", {
                    title: "Registro",
                    success: "Usuario registrado exitosamente.",
                    error: "",
                });
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(html);
            } catch (error) {
                if (error.message.includes("UNIQUE constraint failed")) {
                    const html = render("registro.html", {
                        title: "Registro",
                        error: "El correo o el RUT ya están registrados.",
                        success: "",
                    });
                    res.writeHead(400, { "Content-Type": "text/html" });
                    res.end(html);
                } else {
                    const html = render("registro.html", {
                        title: "Registro",
                        error: "Error al registrar usuario. Intenta nuevamente.",
                        success: "",
                    });
                    res.writeHead(500, { "Content-Type": "text/html" });
                    res.end(html);
                }
            }
        });
    }

    // Mostrar el formulario de inicio de sesión
    static getLogin(req, res) {
        const html = render("login.html", { title: "Iniciar Sesión", error: "" });
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    }

    // Procesar el inicio de sesión
    static async postLogin(req, res) {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            const formData = new URLSearchParams(body);
            const email = formData.get("email");
            const password = formData.get("password");

            const validation = validateLogin(email, password);
            if (!validation.isValid) {
                const html = render("login.html", {
                    title: "Iniciar Sesión",
                    error: validation.error,
                });
                res.writeHead(400, { "Content-Type": "text/html" });
                res.end(html);
                return;
            }

            try {
                const usuario = await Usuario.findByEmail(email);
                if (usuario && usuario.contrasenia === password) {
                    res.writeHead(302, {
                        Location: "/",
                        "Set-Cookie": [
                            "loggedIn=true; Path=/; HttpOnly",
                            `email=${usuario.correo}; Path=/; HttpOnly`,
                        ],
                    });
                    res.end();
                } else {
                    const html = render("login.html", {
                        title: "Iniciar Sesión",
                        error: "Correo o contraseña incorrectos.",
                    });
                    res.writeHead(401, { "Content-Type": "text/html" });
                    res.end(html);
                }
            } catch (error) {
                console.error("Error en el login:", error.message);
                const html = render("login.html", {
                    title: "Iniciar Sesión",
                    error: "Error en el servidor. Intenta nuevamente.",
                });
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end(html);
            }
        });
    }

    // Mostrar la página de perfil
    static async getProfile(req, res) {
        try {
            const cookies = req.headers.cookie ? require("cookie").parse(req.headers.cookie) : {};
            const email = cookies.email;

            if (!email) {
                res.writeHead(302, { Location: "/auth/login" });
                res.end();
                return;
            }

            const usuario = await Usuario.findByEmail(email);
            if (!usuario) {
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end(render("404.html", { title: "Usuario no encontrado" }));
                return;
            }

            const html = render(
                "perfil.html",
                {
                    title: "Perfil de Usuario",
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    email: usuario.correo,
                    tipo_usuario: `${usuario.tipo_usuario}`,
                    fecha_ingreso: new Intl.DateTimeFormat('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }).format(new Date(usuario.created_at)),
                },
                true
            );
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
        } catch (error) {
            console.error("Error en getProfile:", error.message);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error interno del servidor");
        }
    }
}

module.exports = AuthController;