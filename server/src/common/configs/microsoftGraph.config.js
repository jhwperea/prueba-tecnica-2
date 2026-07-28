import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../common/configs/db.config.js";
import {
  Client,
  LargeFileUploadTask,
  FileUpload,
} from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";
import { ClientSecretCredential } from "@azure/identity";
import "isomorphic-fetch";

const microsoftConnection = () => {
  return new Promise(async (resolve, reject) => {
    let connection = null;
    try {
      connection = await getConnection();

      const resultsQuery = await executeQuery(
        `SELECT rul_tenant_id AS tenantId, rul_client_id AS clientId, rul_client_secret AS clientSecret FROM tbl_business_rules LIMIT 1`,
        [],
        connection
      );

      if (!resultsQuery.length > 0)
        return reject("Error a consultar credenciales de base de dato");

      const TENANT_ID = resultsQuery[0].tenantId;
      const CLIENT_ID = resultsQuery[0].clientId;
      const CLIENT_SECRET = resultsQuery[0].clientSecret;

      if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
        return reject("Las credenciales de Microsoft Graph no están configuradas. Guarde las credenciales primero.");
      }

      const credential = new ClientSecretCredential(
        TENANT_ID,
        CLIENT_ID,
        CLIENT_SECRET
      );
      const authProvider = new TokenCredentialAuthenticationProvider(
        credential,
        { scopes: [".default"] }
      );

      const client = Client.initWithMiddleware({
        debugLogging: true,
        authProvider,
      });

      resolve(client);
    } catch (error) {
      reject(error);
    } finally {
      releaseConnection(connection);
    }
  });
};

const getRulesSharePoint = () => {
  return new Promise(async (resolve, reject) => {
    let connection = null;
    try {
      connection = await getConnection();
      const resultsQuery = await executeQuery(
        `SELECT rul_tenant_id AS tenantId, rul_client_id AS clientId, rul_client_secret AS clientSecret, rul_invoicing_site AS invoicingSite, rul_invoice_folder AS invoiceFolder FROM tbl_business_rules LIMIT 1`
      );

      if (!resultsQuery.length > 0)
        return reject("Error a consultar credenciales en base de dato");

      const { invoicingSite, invoiceFolder } = resultsQuery[0];
      if (!invoicingSite)
        return reject("No hay un sitio de SharePoint seleccionado");

      if (!invoiceFolder)
        return reject("No hay un folder de SharePoint seleccionado");

      resolve(resultsQuery[0]);
    } catch (error) {
      reject(error);
    } finally {
      releaseConnection(connection);
    }
  });
};

export {
  microsoftConnection,
  LargeFileUploadTask,
  FileUpload,
  getRulesSharePoint,
};
