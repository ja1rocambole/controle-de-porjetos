import { Request, Response } from "express";
import format from "pg-format";
import { client } from "../database";
import { QueryConfig } from "pg";

export const logicsCreateProjects = async (req: Request, res: Response) => {
  const { body } = req;
  const bodyKeys = Object.keys(body);
  const bodyValues = Object.values(body);

  const queryString = format(
    `
      INSERT INTO projects 
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

export const logicsListProjectWithId = async (req: Request, res: Response) => {
  const queryString = format(
    `
      SELECT 
          p.id AS "projectId",
          p."name" AS "projectName",
          p.description AS "projectDescription",
          p."estimatedTime" AS "projectEstimatedTime",
          p.repository AS "projectRepository",
          p."startDate" AS "projectStartDate",
          p."endDate" AS "projectEndDate",
          p."developerId" AS "projectDeveloperId",
          pt."technologyId",
          t."name" AS "technologyName"
      FROM 
          projects p
      LEFT JOIN 
          projects_technologies pt ON
          p.id = pt."projectId"
      LEFT JOIN 
          technologies t ON
          pt."technologyId" = t.id 
      WHERE p."id" = 1;
    `
  );

  const queryResult = await client.query(queryString);

  return res.status(200).json(queryResult.rows);
};

export const logicsUpdateProjectsWithId = async (
  req: Request,
  res: Response
) => {
  const { body } = req;
  const { developerId } = body;

  if (developerId) {
    const queryString = format(
      `
      SELECT
        *
      FROM
        developers
      WHERE 
        id = %s ;
  `,
      body.developerId
    );

    const queryResult = await client.query(queryString);

    if (queryResult.rowCount === 0) {
      return res.status(404).json({
        message: "Developer not found.",
      });
    }
  }

  let queryStringUpdateProjects = `
  UPDATE 
    projects 
  SET
    (%I) = (%L)
  WHERE 
    id = %s
  RETURNING *;
`;

  if (Object.keys(body).length <= 1) {
    queryStringUpdateProjects = `
    UPDATE 
      projects 
    SET
      %I = %L
    WHERE 
      id = %s
    RETURNING *;
  `;
  }

  const query = format(
    queryStringUpdateProjects,
    Object.keys(body),
    Object.values(body),
    req.params.id
  );

  const queryResult = await client.query(query);

  return res.status(200).json(queryResult.rows[0]);
};

export const logicsDeleteProjectWithId = async (
  req: Request,
  res: Response
) => {
  const queryStringDelete = format(
    `
    DELETE FROM 
      projects 
    WHERE 
      id = %s;
  `,
    req.params.id
  );

  await client.query(queryStringDelete);

  return res.status(204).send();
};

export const logicsCreateTechnologisProjectWithId = async (
  req: Request,
  res: Response
) => {
  const { name: techName } = req.body;
  const { id: projectId } = req.params;

  const findIdTechnologieString = format(
    `
      SELECT 
        id  
      FROM 
        technologies 
      WHERE 
        "name" = '%s';
  `,
    techName
  );

  const findIdTechnologieResult = await client.query(findIdTechnologieString);

  if (!findIdTechnologieResult.rows[0]) {
    return res.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  const { id: techId } = findIdTechnologieResult.rows[0];

  const queryStringEnsureTechnologieNotExists = format(
    `
      SELECT 
        pt."technologyId"  
      FROM 
        projects p 
      LEFT JOIN 
        projects_technologies pt 
      ON
        p.id = pt."projectId" 
      WHERE 
        p.id = %s AND pt."technologyId" = %s;
  `,
    [projectId],
    [techId]
  );

  const queryResultEnsureTechnologieNotExists = await client.query(
    queryStringEnsureTechnologieNotExists
  );

  if (queryResultEnsureTechnologieNotExists.rowCount > 0) {
    return res.status(409).json({
      message: "This technology is already associated with the project",
    });
  }

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const dateFormatted = `${year}-${month < 10 ? "0" + month : month}-${
    day < 10 ? "0" + day : day
  }`;

  const queryString = format(
    `
      INSERT INTO projects_technologies
        ("addedIn","technologyId", "projectId")
      VALUES
        (%L)
      RETURNING *;
      `,
    [dateFormatted, techId, projectId]
  );

  const queryResultInsertProjectTech = await client.query(queryString);

  const { id: projectTechId } = queryResultInsertProjectTech.rows[0];

  const queryStringReturningUser = `
      SELECT 
        pt."technologyId",
        t."name" AS "technologyName",
        pt."projectId",
        p."name" AS "projectName",
        p.description AS "projectDescription",
        p."estimatedTime" AS "projectEstimatedTime",
        p.repository AS "projectRepository",
        p."startDate" AS "projectStartDate",
        p."endDate" AS "projectEndDate"
      FROM 
        projects_technologies pt 
      LEFT JOIN 
        technologies t ON
        t.id = $1
      LEFT JOIN  
        projects p 
      ON
        p.id = $2
      WHERE 
        pt.id = $3;
  `;

  const queryConfigReturningUser: QueryConfig = {
    text: queryStringReturningUser,
    values: [techId, projectId, projectTechId],
  };

  const queryResultReturningUser = await client.query(queryConfigReturningUser);

  return res.status(201).json(queryResultReturningUser.rows[0]);
};

export const logicsDeleteTechnologisProjectWithId = async (
  req: Request,
  res: Response
) => {
  const { name: techName } = req.params;
  const { id: projectId } = req.params;

  const findIdTechnologieString = format(
    `
      SELECT 
        id  
      FROM 
        technologies 
      WHERE 
        "name" = '%s';
  `,
    techName
  );

  const findIdTechnologieResult = await client.query(findIdTechnologieString);

  if (!findIdTechnologieResult.rows[0]) {
    return res.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  const { id: techId } = findIdTechnologieResult.rows[0];

  const queryStringEnsureTechnologieNotExists = format(
    `
      SELECT 
        pt."technologyId",
        pt.id  
      FROM 
        projects p 
      LEFT JOIN 
        projects_technologies pt 
      ON
        p.id = pt."projectId" 
      WHERE 
        p.id = %s AND pt."technologyId" = %s;
  `,
    [projectId],
    [techId]
  );

  const queryResultEnsureTechnologieNotExists = await client.query(
    queryStringEnsureTechnologieNotExists
  );

  if (queryResultEnsureTechnologieNotExists.rowCount === 0) {
    return res.status(400).json({
      message: "Technology not related to the project.",
    });
  }

  const { id: projectTechId } = queryResultEnsureTechnologieNotExists.rows[0];

  const queryStringDelete = format(
    `
    DELETE FROM 
      projects_technologies 
    WHERE 
      id = %s;
  `,
    projectTechId
  );

  await client.query(queryStringDelete);

  return res.status(204).send();
};
