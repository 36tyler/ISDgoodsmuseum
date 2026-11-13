const GOODS_FIELDS = ['id','title','memberId','category','categoryIds','rarity','isLegendary','releaseDate','releaseYear','originalPrice','saleStatus','currentMarketPrice','imageUrl','additionalImages','description','components','officialUrl','relatedLinks','tags','specs','favoriteCount','isStaffPick'];
const NEWS_FIELDS = ['id','title','content','imageUrls','imageUrl','links','linkUrl','linkLabel','date','tag','isPinned'];
const CONFIG_FIELDS = ['goodsKinds','siteTitle','siteSubtitle','heroHeadline','heroDescription','storyTitle','storySubtitle','storyContent','storyNotice','memberStories','aboutIsegye','siteTexts','customGradient','accentTheme','fontFamily','cardDensity','showHeroBanner','metaTitle','metaDescription','ogImageUrl','officialLinks'];
const pick = (value, fields) => Object.fromEntries(fields.filter(key => Object.hasOwn(value,key)).map(key => [key,value[key]]));
export function publicGoods(item) { return pick(item,GOODS_FIELDS); }
export function sanitizeCatalog(value) {
 if(!value || !Array.isArray(value.goods) || !Array.isArray(value.news) || !Array.isArray(value.categories) || !value.config || typeof value.config.siteTitle !== 'string') throw new Error('Invalid catalog');
 if(value.goods.length>10000 || value.news.length>1000 || !value.categories.length || value.categories.length>200) throw new Error('Invalid catalog size');
 const seen = new Set();
 for(const item of value.goods) {
  if(!item || typeof item.id!=='string' || !item.id || seen.has(item.id) || typeof item.title!=='string' || !Array.isArray(item.components) || item.components.some(x=>typeof x!=='string') || !Number.isFinite(item.originalPrice) || item.originalPrice<0) throw new Error('Invalid goods');
  seen.add(item.id);
 }
 const validateIds = (items) => {const ids=new Set();for(const item of items){if(!item || typeof item.id!=='string' || !item.id || ids.has(item.id))throw new Error('Invalid item ID');ids.add(item.id);}};
 validateIds(value.news);validateIds(value.categories);
 if(value.categories.some(item=>typeof item.label!=='string'||!item.label.trim()))throw new Error('Invalid category');
 return {
  goods:value.goods.map(publicGoods),
  news:value.news.map(item=>pick(item,NEWS_FIELDS)),
  categories:value.categories.map(item=>pick(item,['id','label','icon','isDefault'])),
  config:pick(value.config,CONFIG_FIELDS),
 };
}
