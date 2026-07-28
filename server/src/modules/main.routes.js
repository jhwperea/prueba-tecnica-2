import express from "express";
import authRoutes from "./auth/auth.routes.js";
import appRoutes from "./app/general/app.routes.js";
import mailRoutes from "../common/mails/mails.routes.js";
import microsoftGraphRoutes from "./microsoftGraph/microsoftGraph.routes.js";
import masterTemplateRoutes from "./template/template.routes.js";
import moduleDocsRoutes from "./app/documents/document.routes.js";
import notificationsRoutes from "./app/notifications/notifications.routes.js";

// security
import usersRoutes from "./security/users/users.routes.js";
import profilesRoutes from "./security/profiles/profiles.routes.js";
import permissionsRoutes from "./security/permissions/permissions.routes.js";

// taller (clientes, motos, ordenes de trabajo)
import clientsRoutes from "./app/clients/clients.routes.js";
import bikesRoutes from "./app/bikes/bikes.routes.js";
import workOrdersRoutes from "./app/workorders/workorders.routes.js";

const mainRoutes = express.Router();

mainRoutes.use("/template", masterTemplateRoutes);
mainRoutes.use("/app/documents", moduleDocsRoutes);

// App
mainRoutes.use("/auth", authRoutes);
mainRoutes.use("/mails", mailRoutes);
mainRoutes.use("/app", appRoutes);
mainRoutes.use("/app/notifications", notificationsRoutes);

// Taller
mainRoutes.use("/app/clients", clientsRoutes);
mainRoutes.use("/app/bikes", bikesRoutes);
mainRoutes.use("/app/work-orders", workOrdersRoutes);

// Security
mainRoutes.use("/security/profiles", profilesRoutes);
mainRoutes.use("/security/users", usersRoutes);
mainRoutes.use("/security/permissions", permissionsRoutes);
mainRoutes.use("/security/microsoft-graph", microsoftGraphRoutes);

export default mainRoutes;
