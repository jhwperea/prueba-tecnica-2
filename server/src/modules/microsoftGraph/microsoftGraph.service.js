import { microsoftConnection } from "../../common/configs/microsoftGraph.config.js";

export const getSites = async () => {
  const data = [];
  const client = await microsoftConnection();
  const driveItems = await client.api("/sites").orderby("name asc").get();

  if (driveItems.value.length > 0) {
    for (const { name, id } of driveItems.value) {
      data.push({ id, name });
    }
  }

  return data;
};

export const getUsers = async () => {
  const data = [];
  const client = await microsoftConnection();
  const driveItems = await client.api("/users").get();

  if (driveItems.value.length > 0) {
    for (const { displayName, mail, id } of driveItems.value) {
      data.push({ id, name: `${displayName} (${mail})` });
    }
  }

  return data;
};

export const getUnits = async ({ site }) => {
  const data = [];
  const drive = `/sites/${site}/drives`;

  const client = await microsoftConnection();
  const driveItems = await client.api(drive).orderby("name asc").get();

  if (driveItems.value.length > 0) {
    for (const { name, id } of driveItems.value) {
      data.push({ id, name });
    }
  }

  return data;
};

export const getFolders = async ({ site, library, folder }) => {
  const data = [];
  const drive =
    site && library && !folder
      ? `/sites/${site}/drives/${library}/root/children`
      : `/drives/${library}/items/${folder}/children`;

  const client = await microsoftConnection();
  const driveItems = await client.api(drive).filter("folder ne null").get();

  if (driveItems.value.length > 0) {
    for (const { name, id, folder } of driveItems.value) {
      const { childCount } = folder || { childCount: 0 };

      if (childCount > 0) {
        data.push({
          key: id,
          label: name,
          leaf: true,
          children: [{ key: 0, label: "" }],
        });
      } else {
        data.push({ key: id, label: name });
      }
    }
  }

  return data;
};
