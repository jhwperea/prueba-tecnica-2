import httpCliente from "../services/httpCliente";

export const validateTokenAPI = () => {
    return new Promise((resolve, reject) => {
        httpCliente
            .get("app/verify_token")
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getMenuAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .get("app/get_menu", params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getModulesApi = () => {
    return new Promise((resolve, reject) => {
        httpCliente
            .get(`api/app/get_modules`)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getStatusesByScopeAPI = (scope, excludesKeys = []) =>
    httpCliente.get(`app/get_statuses_by_scope`, { scope, excludesKeys });
