/**
 * Generate bokIds for autocomplete search.
 */
function getBOKIDs(BOK_ID, attachmentModalBata) {
  const query = attachmentModalBata
    ? `
  select  *
  from v_lms vl
  where BOKID='${BOK_ID}'
  `
    : `
        select TOP 3 *
        from v_lms vl
        where BOKID like '%${BOK_ID}%'
        `;
  return query;
}
/**
 * Generate bokIds for autocomplete search.
 */
function getBOKIDsCBS(BOK_ID, attachmentModalBata) {
  const query = attachmentModalBata
    ? `
  select  *
  from v_cbs vl
  where BOK_ID='${BOK_ID}'
  `
    : `
        select TOP 3 *
        from v_cbs vl
        where BOK_ID like '%${BOK_ID}%'
        `;
  return query;
}

/**
 * verify entered bokid is correct.
 */
function verifyBOKID(BOK_ID) {
  const query = `
        SELECT COUNT(*) AS total from v_lms vl WHERE BOKID ='${BOK_ID}'
  `;
  return query;
}

/**
 * get user details from cbs.
 */
function getCustomerDetails(BOK_ID) {
  const query = `
    select top 1 * from v_cbs  WHERE BOK_ID='${BOK_ID}'
   `;
  return query;
}

module.exports = { getBOKIDs, verifyBOKID, getCustomerDetails, getBOKIDsCBS };
