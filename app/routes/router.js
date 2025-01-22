const AuthController = require("../controllers/AuthController");
const render = require("../utils/render");
const cookie = require("cookie");
const Usuario = require("../models/User");
const CourseController = require("../controllers/CourseController");

const rutas = async (req, res) => {
    // Parse URL to get the path
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    try {
        const cookies = cookie.parse(req.headers.cookie || "");
        const isAuthenticated = cookies.loggedIn === "true";
        const email = cookies.email || "";
        let userRole = "";

        if (isAuthenticated && email) {
            try {
                const usuario = await Usuario.findByEmail(email);
                userRole = usuario ? usuario.tipo_usuario : "";
            } catch (error) {
                console.error("Error al obtener el rol del usuario:", error.message);
            }
        }

        console.log("¿Está logeado (isAuthenticated)?:", isAuthenticated, "Rol:", userRole);

        // Add courses route
        if (path === "/cursos") {
            return await CourseController.showCourses(req, res, {isAuthenticated, userRole});
        }

        if (req.url === "/" && req.method === "GET") {
            const html = render("index.html", { title: "Inicio" }, isAuthenticated, userRole);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
            return;
        }

        if (req.url === "/auth/login" && req.method === "GET") {
            if (isAuthenticated) {
                res.writeHead(302, { Location: "/" });
                res.end();
                return;
            }
            return AuthController.getLogin(req, res);
        }

        if (req.url === "/auth/login" && req.method === "POST") {
            return AuthController.postLogin(req, res);
        }

        if (req.url === "/auth/registro" && req.method === "GET") {
            if (isAuthenticated) {
                res.writeHead(302, { Location: "/" });
                res.end();
                return;
            }
            return AuthController.getRegister(req, res);
        }

        if (req.url === "/auth/registro" && req.method === "POST") {
            return AuthController.postRegister(req, res);
        }

        if (req.url === "/logout" && req.method === "GET") {
            res.writeHead(302, {
                Location: "/auth/login",
                "Set-Cookie": "loggedIn=false; Path=/; HttpOnly",
            });
            res.end();
            return;
        }

        if (req.url === "/cursos" && req.method === "GET") {
            if (!isAuthenticated) {
                res.writeHead(302, { Location: "/auth/login" });
                res.end();
                return;
            }
            const html = render("cursos.html", { title: "Cursos" }, isAuthenticated, userRole);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
            return;
        }

        if (req.url === "/perfil" && req.method === "GET") {
            if (!isAuthenticated) {
                res.writeHead(302, { Location: "/auth/login" });
                res.end();
                return;
            }
            return AuthController.getProfile(req, res);
        }

        if (req.url === "/crear-cursos" && req.method === "GET") {
            if (!isAuthenticated || userRole !== "docente") {
                res.writeHead(403, { "Content-Type": "text/html" });
                res.end(render("403.html", { title: "Acceso Denegado" }));
                return;
            }
            return AuthController.getCrearCursos(req, res);
        }

        if (req.method === 'POST' && req.url === '/courses/create') {
            return CourseController.create(req, res);
        }

        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(render("404.html", { title: "Página no encontrada" }));
    } catch (error) {
        console.error("Error en el router:", error.message);
        if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error interno del servidor");
        }
    }
};

module.exports = rutas;
