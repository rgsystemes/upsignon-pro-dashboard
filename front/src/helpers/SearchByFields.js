const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const SearchByFields = (items, query, fields) => {
  const searchableFields = fields ?? ['id', 'name'];
  return !query
    ? items
    : items.filter((item) =>
        searchableFields.some((field) =>
          String(getNestedValue(item, field) ?? '')
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      );
};
