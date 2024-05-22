import { NextFunction, Request, Response } from "express";

export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        
        res.locals.user = req.session.user;
        next();
    } else {
        res.redirect("/login");
    }
};

export async function requireAdmin(request: Request, response: Response, next: NextFunction) {
    if (response.locals.user.role === "ADMIN") {
        next();
    } else {
        response.redirect("/milestone/players");
    };
};

