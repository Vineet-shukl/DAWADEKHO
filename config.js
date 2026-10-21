/** Production uses same-origin Vercel function. Localhost uses local API. */
const PROD_API_URL = '/api/read-strip';
const LOCAL_API_URL = 'http://localhost:8787';

function resolveApiUrl() {
  if (typeof location !== 'undefined') {
    const host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return LOCAL_API_URL;
  }
  return PROD_API_URL;
}

export const CONFIG = {
  API_URL: resolveApiUrl(),
  DATA_SNAPSHOT: '2026-10-21',
  KENDRA_URL: 'https://janaushadhi.gov.in/KendraDetails.aspx',
  SUGAM_URL: 'https://play.google.com/store/apps/details?id=in.gov.pmbjp',
  PRODUCT_LIST_URL: 'https://janaushadhi.gov.in/productportfolio/ProductmrpList',
};
