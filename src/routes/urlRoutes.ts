import { Router, Request, Response, NextFunction } from "express";
import { redirectUrl, shortenUrl } from "../controllers";

const router = Router();

router.post("/shorten",  (req: Request, res: Response, next: NextFunction) => shortenUrl(req, res, next));
router.get("/:shortUrl", (req: Request, res: Response, next: NextFunction) => redirectUrl(req, res, next));

export default router;
