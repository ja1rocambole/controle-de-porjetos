import express, { Application } from "express";
import "dotenv/config";
import {
  logicsCreateDeveloper,
  logicsCreateDeveloperInfos,
  logicsDeleteDeveloperWithId,
  logicsListDeveloperWithId,
  logicsUpdateDeveloperWithId,
} from "./logics/developers.logics";
import {
  middlewaresEnsureEmailNotExists,
  middlewaresEnsureIdExists,
} from "./middlewares/developers.middlewares";
import {
  logicsCreateProjects,
  logicsCreateTechnologisProjectWithId,
  logicsDeleteProjectWithId,
  logicsDeleteTechnologisProjectWithId,
  logicsListProjectWithId,
  logicsUpdateProjectsWithId,
} from "./logics/projects.logics";
import {
  middlewaresEnsureDeveloperIdExists,
  middlewaresEnsureProjectIdExists,
} from "./middlewares/projects.middlewares";

const app: Application = express();
app.use(express.json());

app.post("/developers", middlewaresEnsureEmailNotExists, logicsCreateDeveloper);

app.get(
  "/developers/:id",
  middlewaresEnsureIdExists,
  logicsListDeveloperWithId
);

app.patch(
  "/developers/:id",
  middlewaresEnsureIdExists,
  middlewaresEnsureEmailNotExists,
  logicsUpdateDeveloperWithId
);

app.delete(
  "/developers/:id",
  middlewaresEnsureIdExists,
  logicsDeleteDeveloperWithId
);

app.post(
  "/developers/:id/infos",
  middlewaresEnsureIdExists,
  logicsCreateDeveloperInfos
);

app.post("/projects", middlewaresEnsureDeveloperIdExists, logicsCreateProjects);

app.get(
  "/projects/:id",
  middlewaresEnsureProjectIdExists,
  logicsListProjectWithId
);

app.patch(
  "/projects/:id",
  middlewaresEnsureProjectIdExists,
  logicsUpdateProjectsWithId
);

app.delete(
  "/projects/:id",
  middlewaresEnsureProjectIdExists,
  logicsDeleteProjectWithId
);

app.post(
  "/projects/:id/technologies",
  middlewaresEnsureProjectIdExists,
  logicsCreateTechnologisProjectWithId
);

app.delete(
  "/projects/:id/technologies/:name",
  middlewaresEnsureProjectIdExists,
  logicsDeleteTechnologisProjectWithId
);

export default app;
