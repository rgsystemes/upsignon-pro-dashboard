export const SearchByFields = (items, query, fields) => {
  const searchableFields = fields ?? ['id', 'name'];
    return !query
      ? items
      : items.filter(item =>
          searchableFields.some(field =>
            String(item[field] ?? '')
              .toLowerCase()
              .includes(query.toLowerCase())
          )
        );
  };
