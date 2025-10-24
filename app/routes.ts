import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    // Pass the file path as a direct string
    index("routes/home.tsx"),

    // Pass the path and file as two separate string arguments
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/upload.tsx'),

] satisfies RouteConfig;