import { Request, Response, NextFunction } from "express";

import { uploadRepository } from "../repositories";
import { scraper, resultProcessor } from "../helpers";
import { configs } from "../../../configs";

export async function createNewUploadHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const file = req.file;
  const user = req.user;

  if (!user || !file) {
    res.status(400).json({
      ok: false,
      message: "request is invalid",
    });

    return;
  }

  const keywords = file.buffer.toString().split("\n") || [];
  const limit = configs.FILE_UPLOAD_MAX_KEYWORD_LIMIT;

  if (keywords.length > limit) {
    res.status(400).json({
      ok: false,
      message: `file must be less than ${limit} keywords`,
    });

    return;
  }

  try {
    const keywordsWithAgents = scraper.prepareAgents(keywords);
    const rawResults = await scraper.scrape(keywordsWithAgents);

    const processedResults = rawResults.map(resultProcessor.processResult);
    await uploadRepository.createNew(user.userId, file, processedResults);

    res.json({
      ok: true,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}
