const BAIDU_SEARCH_BASE = "https://www.baidu.com/s";

export function buildBaiduSearchUrl(keyword: string): string {
  const query = new URLSearchParams({
    ie: "utf-8",
    wd: keyword
  });

  return `${BAIDU_SEARCH_BASE}?${query.toString()}`;
}

export const originalBaiduWorldCupUrl =
  "https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=%E7%BE%8E%E5%8A%A0%E5%A2%A8%E4%B8%96%E7%95%8C%E6%9D%AF&fenlei=256&rsv_pq=0xe5f6d8dd02d103a1&rsv_t=c5e11RoTLXl0UnEX%2FTtPJ7IMlnh1k%2BqoE%2FSWpAZ%2FP5r66MkaffdIERDOwgoG&rqlang=en&rsv_enter=1&rsv_dl=ikrec_click_iph_igh_notyyc_gsnd&rsv_btype=i&rsv_sug9=eb_1";
