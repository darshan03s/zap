import supabase from "../supabase.js";

export default async function authenticate(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        console.log("No token provided");
        return res
            .status(401)
            .json({ message: "Authentication token required." });
    }

    try {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error("JWT verification error:", error);
            return res.status(403).json({ message: "User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in authenticateToken middleware:", error);
        return res.status(500).json({
            message: "Internal server error during verification.",
        });
    }
}
