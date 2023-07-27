import { NextFunction, Request, Response } from "express";
import format from "pg-format";
import { client } from "../database";

export const middlewaresEnsureDeveloperIdExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { developerId } = req.body;

  const queryString = format(
    `
      SELECT 
            * 
      FROM 
      developers
      WHERE id = %L;
      `,
    developerId
  );

  const queryResult = await client.query(queryString);

  if (queryResult.rowCount === 0) {
    return res.status(404).json({
      message: "Developer not found.",
    });
  }

  next();
};

export const middlewaresEnsureProjectIdExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const queryString = format(
    `
      SELECT 
        * 
      FROM 
        projects
      WHERE id = %L;
      `,
    id
  );

  const queryResult = await client.query(queryString);

  if (queryResult.rowCount === 0) {
    return res.status(404).json({
      message: "Project not found.",
    });
  }

  next();
};
