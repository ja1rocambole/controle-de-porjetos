import { Request, Response } from "express";
import format from "pg-format";
import { client } from "../database";

export const logicsCreateDeveloper = async (req: Request, res: Response) => {
  const { body } = req;

  const queryString = format(
    `
      INSERT INTO developers
        (%I)
      VALUES
        (%L)
      RETURNING *;
  `,
    Object.keys(body),
    Object.values(body)
  );

  const queryResult = await client.query(queryString);

  return res.status(201).json(queryResult.rows[0]);
};

export const logicsListDeveloperWithId = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  const queryString = format(
    `
      SELECT
        dev.id AS "developerId",
        dev.name AS "developerName",
        dev.email AS "developerEmail",
        di.id AS "developerInfoId",
        di."developerSince" AS "developerInfoDeveloperSince",
        di."preferredOS" AS "developerInfoPreferredOS"
      FROM
        developers AS dev
      LEFT JOIN 
        developer_infos di ON
        dev.id  = di."developerId" 
      WHERE 
        dev.id = %s ;
  `,
    id
  );

  const queryResult = await client.query(queryString);

  const { developerInfoID, ...developerReturn } = queryResult.rows[0];

  return res.status(200).json(developerReturn);
};

export const logicsUpdateDeveloperWithId = async (
  req: Request,
  res: Response
) => {
  const { body } = req;

  let queryString = `
  UPDATE 
    developers 
  SET
    (%I) = (%L)
  WHERE 
    id = %s
  RETURNING *;
`;

  if (Object.keys(body).length <= 1) {
    queryString = `
    UPDATE 
      developers 
    SET
      %I = %L
    WHERE 
      id = %s
    RETURNING *;
  `;
  }

  const query = format(
    queryString,
    Object.keys(body),
    Object.values(body),
    req.id
  );

  const queryResult = await client.query(query);

  return res.status(200).json(queryResult.rows[0]);
};

export const logicsDeleteDeveloperWithId = async (
  req: Request,
  res: Response
) => {
  const queryString = format(
    `
    DELETE FROM 
      developers 
    WHERE 
      id = %s;
  `,
    req.id
  );

  await client.query(queryString);

  return res.status(204).send();
};

export const logicsCreateDeveloperInfos = async (
  req: Request,
  res: Response
) => {
  const { body } = req;
  const bodyKeys = Object.keys(body);
  const bodyValues = Object.values(body);

  const OsPreferred = body.preferredOS;
  if (
    OsPreferred !== "Windows" &&
    OsPreferred !== "Linux" &&
    OsPreferred !== "MacOS"
  ) {
    return res.status(400).json({
      message: "Invalid OS option.",
      options: ["Windows", "Linux", "MacOS"],
    });
  }

  const queryStringInfosExists = format(
    `
      SELECT 
        * 
      FROM 
        developer_infos
      WHERE
        "developerId" = %s;`,
    req.id
  );

  const queryResultInfosExists = await client.query(queryStringInfosExists);

  if (queryResultInfosExists.rowCount > 0) {
    return res.status(409).json({
      message: "Developer infos already exists.",
    });
  }

  bodyKeys.push("developerId");
  bodyValues.push(req.id);

  const queryString = format(
    `
      INSERT INTO developer_infos
        (%I)
      VALUES
        (%L)
      RETURNING *;
  `,
    bodyKeys,
    bodyValues
  );

  const queryResult = await client.query(queryString);

  return res.status(201).json(queryResult.rows[0]);
};
