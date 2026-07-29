import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";

const SELECT_COLS = `
  SELECT
    d.doc_id AS id,
    d.doc_type AS "docType",
    d.doc_id_ref AS "docIdRef",
    CASE WHEN d.doc_extension = '' AND d.doc_mime_type = 'folder' THEN 'carpeta' ELSE 'archivo' END AS tipo,
    d.doc_name AS nombre,
    d.doc_path_storage AS "docPathStorage",
    d.doc_url AS url,
    d.doc_extension AS extension,
    d.doc_mime_type AS "mimeType",
    d.doc_size AS tamanio,
    d.sta_id AS estado,
    CONCAT(u.use_name, ' ', COALESCE(u.use_last_name, '')) AS "usuReg",
    d.doc_create_at AS "fecReg",
    d.doc_update_by AS "usuAct",
    d.doc_update_at AS "fecAct",
    d.doc_parent_id AS "parentId",
    (SELECT COUNT(*) FROM tbl_documents WHERE doc_parent_id = d.doc_id AND sta_id != 3) AS "itemCount"
`;

const FROM_JOIN = `
  FROM tbl_documents d
  JOIN tbl_users u ON d.doc_create_by = u.use_id
`;

const WHERE_ACTIVE = "d.sta_id != 3";

export const paginationModuleDocs = async ({
  docType,
  docIdRef,
  nombre,
  rows,
  first,
  sortField = "doc_name",
  sortOrder,
  parentId = null,
  paginate = true,
}) => {
  let connection = null;
  try {
    connection = await getConnection();
    const order = sortOrder === 1 ? "ASC" : "DESC";

    const conditions = [WHERE_ACTIVE];

    if (nombre) conditions.push(`d.doc_name LIKE '%${nombre}%'`);
    if (docType) conditions.push(`d.doc_type = '${docType}'`);
    if (docType) {
      if (docIdRef) {
        conditions.push(`d.doc_id_ref = ${docIdRef}`);
      } else {
        conditions.push(`d.doc_id_ref IS NULL`);
      }
    }
    if (parentId === null && docType) {
      conditions.push(`d.doc_parent_id IS NULL`);
    } else if (docType) {
      conditions.push(`d.doc_parent_id = ${parentId}`);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const limit = paginate ? `LIMIT ${Number(rows)} OFFSET ${Number(first)}` : "";

    const mainQuery = `
      ${SELECT_COLS}
      ${FROM_JOIN}
      ${whereClause}
      ORDER BY ${sortField} ${order}
      ${limit}
    `;

    const countQuery = `
      SELECT COUNT(*) total
      ${FROM_JOIN}
      ${whereClause}
    `;

    let currentFolder = null;
    if (parentId !== null) {
      const folderQuery = `
        ${SELECT_COLS}
        ${FROM_JOIN}
        WHERE d.doc_id = ${parentId}
        LIMIT 1
      `;
      const folderResult = await executeQuery(folderQuery, [], connection);
      currentFolder = folderResult.length > 0 ? folderResult[0] : null;
    }

    const data = await executeQuery(mainQuery, [], connection);
    const total = await executeQuery(countQuery, [], connection);

    return {
      results: data,
      total: total[0]?.total || 0,
      currentFolder,
    };
  } finally {
    releaseConnection(connection);
  }
};

export const saveModuleDoc = async ({
  id = 0,
  docType,
  docIdRef,
  nombre,
  docPathStorage,
  url,
  extension,
  mimeType,
  tamanio,
  estado = 1,
  docCreateBy,
  docUpdateBy,
  parentId = null,
}) => {
  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    if (id > 0) {
      const update = await executeQuery(
        `UPDATE tbl_documents SET
          doc_type = $1, doc_id_ref = $2, doc_name = $3, doc_path_storage = $4,
          doc_url = $5, doc_extension = $6, doc_mime_type = $7, doc_size = $8,
          sta_id = $9, doc_update_by = $10, doc_parent_id = $11
         WHERE doc_id = $12
         RETURNING doc_id`,
        [
          docType, docIdRef, nombre, docPathStorage,
          url, extension, mimeType, tamanio,
          estado, docUpdateBy, parentId,
          id,
        ],
        connection,
      );

      if (update.length === 0) {
        const error = new Error("No se encontró el documento para actualizar.");
        error.status = 400;
        throw error;
      }

      await connection.query("COMMIT");
      return { message: "Documento actualizado correctamente." };
    }

    const insert = await executeQuery(
      `INSERT INTO tbl_documents (
        doc_type, doc_id_ref, doc_name, doc_path_storage, doc_url,
        doc_extension, doc_mime_type, doc_size, sta_id,
        doc_create_by, doc_update_by, doc_parent_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING doc_id AS "docId"`,
      [
        docType, docIdRef, nombre, docPathStorage, url,
        extension, mimeType, tamanio, estado,
        docCreateBy, docUpdateBy, parentId,
      ],
      connection,
    );

    console.log('[SAVE] insert result:', insert);

    const newId = insert[0].docId;

    const verify = await executeQuery(
      `SELECT doc_id, doc_name FROM tbl_documents WHERE doc_id = $1`,
      [newId],
      connection,
    );
    console.log('[SAVE] verify:', verify);

    await connection.query("COMMIT");
    return {
      message: "Documento registrado correctamente.",
      id: newId,
    };
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

export const deleteModuleDoc = async ({ id, usuAct }) => {
  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const [doc] = await executeQuery(
      `SELECT doc_id AS id, doc_type AS "docType", doc_name AS nombre, doc_extension AS extension, doc_mime_type AS "mimeType", doc_parent_id AS "parentId"
       FROM tbl_documents WHERE doc_id = $1`,
      [id],
      connection,
    );

    if (!doc) {
      const error = new Error("No se encontró el documento para eliminar.");
      error.status = 400;
      throw error;
    }

    const esCarpeta = doc.extension === '' && doc.mimeType === 'folder';

    if (esCarpeta) {
      const deleteChildren = async (parentId) => {
        const children = await executeQuery(
          `SELECT doc_id AS id FROM tbl_documents WHERE doc_parent_id = $1 AND sta_id != 3`,
          [parentId],
          connection,
        );
        for (const child of children) {
          await deleteChildren(child.id);
          await executeQuery(
            `UPDATE tbl_documents SET sta_id = 3, doc_update_by = $1 WHERE doc_id = $2`,
            [usuAct, child.id],
            connection,
          );
        }
      };
      await deleteChildren(id);
    }

    const del = await executeQuery(
      `UPDATE tbl_documents SET sta_id = 3, doc_update_by = $1 WHERE doc_id = $2 RETURNING doc_id`,
      [usuAct, id],
      connection,
    );

    if (del.length === 0) {
      const error = new Error("No se pudo eliminar el documento.");
      error.status = 400;
      throw error;
    }

    await connection.query("COMMIT");
    return { message: "Documento eliminado correctamente." };
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};
