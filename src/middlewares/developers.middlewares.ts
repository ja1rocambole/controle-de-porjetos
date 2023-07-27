import { NextFunction, Request, Response } from "express";
import format from "pg-format";
import { client } from "../database";

export const middlewaresEnsureEmailNotExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  const queryString = format(
    `
      SELECT 
            * 
      FROM 
        developers
      WHERE email = %L;
      `,
    email
  );

  const queryResult = await client.query(queryString);

  if (queryResult.rowCount > 0) {
    return res.status(409).json({
      message: "Email already exists.",
    });
  }

  next();
};

export const middlewaresEnsureIdExists = async (
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
      developers
      WHERE id = %L;
      `,
    id
  );

  const queryResult = await client.query(queryString);

  if (queryResult.rowCount === 0) {
    return res.status(404).json({
      message: "Developer not found.",
    });
  }

  req.id = Number(id);

  next();
};
