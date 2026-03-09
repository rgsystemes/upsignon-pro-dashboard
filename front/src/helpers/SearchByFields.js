const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const formatForSearchMatch = (s) => {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/[àâªæáäãåā]/g, 'a')
    .replace(/[éèêëęėeē]/g, 'e')
    .replace(/[îïìíįī]/g, 'i')
    .replace(/[ôœºöòóõøoō]/g, 'o')
    .replace(/[ûùüúū]/g, 'u')
    .replace(/[ÿ]/g, 'y')
    .replace(/[çćč]/g, 'c')
    .replace(/[ñń]/g, 'n')
    .replace(/[^a-z0-9]/g, '');
};

export const SearchByFields = (items, query, fields) => {
  const searchableFields = fields ?? ['id', 'name'];
  return !query
    ? items
    : items.filter((item) =>
        searchableFields.some((field) =>
          formatForSearchMatch(String(getNestedValue(item, field) ?? '')).includes(
            formatForSearchMatch(query),
          ),
        ),
      );
};
