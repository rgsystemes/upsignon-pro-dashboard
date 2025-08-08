export const classNameForLicence = (l) => {
  try {
    const isExpiredNotRenewed =
      l.to_be_renewed && !l.is_monthly && new Date(l.valid_until).getTime() < Date.now();
    let willExpireSoon = false;
    if (l.valid_until && l.to_be_renewed) {
      let expDateMinus3Month = new Date(l.valid_until);
      expDateMinus3Month.setMonth(expDateMinus3Month.getMonth() - 3);
      willExpireSoon = expDateMinus3Month.getTime() < Date.now() && l.to_be_renewed;
    }
    const isExpiredNotToRenew = !l.to_be_renewed && new Date(l.valid_until).getTime() < Date.now();
    let className = null;
    if (isExpiredNotRenewed) className = 'redrow';
    else if (willExpireSoon) className = 'orangerow';
    else if (isExpiredNotToRenew) className = 'greyrow';
    return className;
  } catch (e) {
    console.error(e, l);
    return null;
  }
};
