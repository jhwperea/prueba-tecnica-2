import httpCliente from "../services/httpCliente";

export const paginationDocsApi = (params) => {
    return httpCliente.post(`app/documents/pagination`, params);
};

export const saveDocApi = (params) => {
    return httpCliente.post(`app/documents/save`, params);
};

export const deleteDocApi = (params) => {
    return httpCliente.put(`app/documents/delete`, params);
};

export const getBlobApi = (params) => {
    return httpCliente.get(`app/documents/blob`, { params });
};
